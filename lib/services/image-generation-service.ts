/**
 * Image Generation Service
 * 
 * Handles AI image generation for meals and recipes.
 * Pro users get realistic AI-generated images, Free users get static placeholders.
 * Uses Zustand cache for persistent image storage.
 */

import { getRandomMealImage, type MealType } from '@/lib/constants/meal-images';
import { canGenerateRealisticImages } from '@/lib/utils/feature-gates';
import { generateGeminiImage } from '@/lib/services/gemini-image-generator';
import { useImageCacheStore, generateCacheKey, isImageCached } from '@/store/image-cache-store';

/**
 * Get meal type from meal name (simple heuristic)
 */
function getMealTypeFromName(mealName: string): MealType {
  const name = mealName.toLowerCase();
  if (name.includes('breakfast') || name.includes('pancake') || name.includes('cereal') || name.includes('toast') || name.includes('egg')) {
    return 'breakfast';
  }
  if (name.includes('lunch') || name.includes('sandwich') || name.includes('salad')) {
    return 'lunch';
  }
  if (name.includes('dinner') || name.includes('steak') || name.includes('pasta') || name.includes('curry') || name.includes('rice')) {
    return 'dinner';
  }
  return 'dinner'; // Default to dinner
}

/**
 * Generate a realistic AI image for a meal (Pro users only)
 * Free users get static placeholder images
 * 
 * Note: This function can be called server-side or client-side
 * For server-side, it directly calls the image generation API
 * For client-side, it uses fetch to call the API route
 */
export async function generateMealImage(
  mealName: string,
  mealDescription: string,
  userId: string,
  mealType?: MealType
): Promise<{ imageUrl: string; isGenerated: boolean; isPro: boolean }> {
  try {
    // Generate cache key
    const cacheKey = generateCacheKey('meal', mealName.toLowerCase().replace(/\s+/g, '_'), userId);
    
    // Check cache first (only in browser/client context)
    if (typeof window !== 'undefined') {
      const cached = useImageCacheStore.getState().getImage(cacheKey);
      if (cached && isImageCached(cacheKey, 7 * 24 * 60 * 60 * 1000)) {
        // Cache valid for 7 days
        return {
          imageUrl: cached.imageUrl,
          isGenerated: cached.isGenerated,
          isPro: cached.isPro,
        };
      }
    }

    // Check if user has Pro access
    const accessCheck = await canGenerateRealisticImages(userId);
    const isPro = accessCheck.allowed;

    if (!isPro) {
      // Free users get static placeholder images
      const type = mealType || getMealTypeFromName(mealName);
      const fallbackUrl = getRandomMealImage(type);
      
      // Cache the fallback (even for free users)
      if (typeof window !== 'undefined') {
        useImageCacheStore.getState().setImage(cacheKey, {
          imageUrl: fallbackUrl,
          isGenerated: false,
          isPro: false,
          generatedAt: Date.now(),
          cacheKey,
        });
      }
      
      return {
        imageUrl: fallbackUrl,
        isGenerated: false,
        isPro: false,
      };
    }

    // Pro users get AI-generated realistic images
    // Create a descriptive prompt for the image generation
    const prompt = `Professional food photography of ${mealName}. ${mealDescription || ''}. 
High quality, appetizing, well-lit, restaurant style, food blog quality, 
realistic ingredients, proper plating, natural lighting, shallow depth of field, 
professional food styling, vibrant colors, appetizing presentation.`;

    // Use the new generateGeminiImage service (works server-side)
    // For client-side, fall back to API route
    if (typeof window === 'undefined') {
      // Server-side: Use generateGeminiImage directly
      try {
        const result = await generateGeminiImage({
          prompt: prompt.trim(),
          model: process.env.IMAGE_GEN_MODEL || 'gemini-2.5-flash-image',
        });

        const imageResult = {
          imageUrl: result.imageUrl,
          isGenerated: true,
          isPro: true,
        };

        // Cache the generated image (if in browser context, this won't run)
        // But we'll cache it when it reaches the client
        return imageResult;
      } catch (error) {
        console.warn('[generateMealImage] Server-side generation failed:', error);
        // Fall through to API route fallback
      }
    }

    // Client-side or server-side fallback: Use API route
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    
    const response = await fetch(`${baseUrl}/api/images/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: prompt.trim(),
        id: `meal_${mealName.replace(/\s+/g, '_').toLowerCase()}_${userId}`,
        fallbackUrl: getRandomMealImage(mealType || getMealTypeFromName(mealName)),
      }),
    });

    if (!response.ok) {
      console.warn('[generateMealImage] Image generation failed, using fallback');
      const type = mealType || getMealTypeFromName(mealName);
      return {
        imageUrl: getRandomMealImage(type),
        isGenerated: false,
        isPro: true, // User is Pro, but generation failed
      };
    }

    const data = await response.json();
    
    if (data.imageUrl && data.generated) {
      const result = {
        imageUrl: data.imageUrl,
        isGenerated: true,
        isPro: true,
      };
      
      // Cache the generated image
      if (typeof window !== 'undefined') {
        useImageCacheStore.getState().setImage(cacheKey, {
          imageUrl: data.imageUrl,
          isGenerated: true,
          isPro: true,
          generatedAt: Date.now(),
          prompt: prompt.trim(),
          cacheKey,
        });
      }
      
      return result;
    }

    // Fallback if generation didn't produce an image
    const type = mealType || getMealTypeFromName(mealName);
    const fallbackUrl = data.fallbackUrl || getRandomMealImage(type);
    
    // Cache the fallback
    if (typeof window !== 'undefined') {
      useImageCacheStore.getState().setImage(cacheKey, {
        imageUrl: fallbackUrl,
        isGenerated: false,
        isPro: true,
        generatedAt: Date.now(),
        cacheKey,
      });
    }
    
    return {
      imageUrl: fallbackUrl,
      isGenerated: false,
      isPro: true,
    };
  } catch (error) {
    console.error('[generateMealImage] Error generating image:', error);
    // Always return a fallback image on error
    const type = mealType || getMealTypeFromName(mealName);
    return {
      imageUrl: getRandomMealImage(type),
      isGenerated: false,
      isPro: false, // Assume free on error to be safe
    };
  }
}

/**
 * Generate image for a recipe (Pro users only)
 */
export async function generateRecipeImage(
  recipeName: string,
  recipeDescription: string,
  userId: string
): Promise<{ imageUrl: string; isGenerated: boolean; isPro: boolean }> {
  try {
    // Generate cache key
    const cacheKey = generateCacheKey('recipe', recipeName.toLowerCase().replace(/\s+/g, '_'), userId);
    
    // Check cache first (only in browser/client context)
    if (typeof window !== 'undefined') {
      const cached = useImageCacheStore.getState().getImage(cacheKey);
      if (cached && isImageCached(cacheKey, 7 * 24 * 60 * 60 * 1000)) {
        return {
          imageUrl: cached.imageUrl,
          isGenerated: cached.isGenerated,
          isPro: cached.isPro,
        };
      }
    }

    // Check if user has Pro access
    const accessCheck = await canGenerateRealisticImages(userId);
    const isPro = accessCheck.allowed;

    if (!isPro) {
      // Free users get static placeholder images
      const fallbackUrl = getRandomMealImage('dinner');
      
      // Cache the fallback
      if (typeof window !== 'undefined') {
        useImageCacheStore.getState().setImage(cacheKey, {
          imageUrl: fallbackUrl,
          isGenerated: false,
          isPro: false,
          generatedAt: Date.now(),
          cacheKey,
        });
      }
      
      return {
        imageUrl: fallbackUrl,
        isGenerated: false,
        isPro: false,
      };
    }

    // Pro users get AI-generated realistic images
    const prompt = `Professional food photography of ${recipeName}. ${recipeDescription || ''}. 
High quality, appetizing, well-lit, restaurant style, food blog quality, 
realistic ingredients, proper plating, natural lighting, shallow depth of field, 
professional food styling, vibrant colors, appetizing presentation, recipe photo.`;

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/images/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: prompt.trim(),
        id: `recipe_${recipeName.replace(/\s+/g, '_').toLowerCase()}_${userId}`,
        fallbackUrl: getRandomMealImage('dinner'),
      }),
    });

    if (!response.ok) {
      console.warn('[generateRecipeImage] Image generation failed, using fallback');
      return {
        imageUrl: getRandomMealImage('dinner'),
        isGenerated: false,
        isPro: true,
      };
    }

    const data = await response.json();
    
    if (data.imageUrl && data.generated) {
      const result = {
        imageUrl: data.imageUrl,
        isGenerated: true,
        isPro: true,
      };
      
      // Cache the generated image
      if (typeof window !== 'undefined') {
        useImageCacheStore.getState().setImage(cacheKey, {
          imageUrl: data.imageUrl,
          isGenerated: true,
          isPro: true,
          generatedAt: Date.now(),
          prompt: prompt.trim(),
          cacheKey,
        });
      }
      
      return result;
    }

    const fallbackUrl = data.fallbackUrl || getRandomMealImage('dinner');
    
    // Cache the fallback
    if (typeof window !== 'undefined') {
      useImageCacheStore.getState().setImage(cacheKey, {
        imageUrl: fallbackUrl,
        isGenerated: false,
        isPro: true,
        generatedAt: Date.now(),
        cacheKey,
      });
    }
    
    return {
      imageUrl: fallbackUrl,
      isGenerated: false,
      isPro: true,
    };
  } catch (error) {
    console.error('[generateRecipeImage] Error generating image:', error);
    return {
      imageUrl: getRandomMealImage('dinner'),
      isGenerated: false,
      isPro: false,
    };
  }
}

