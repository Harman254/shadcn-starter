/**
 * Blog Image Generation Service
 * 
 * Generates AI images for blog posts based on title and content
 */

import { generateCacheKey, useImageCacheStore, isImageCached } from '@/store/image-cache-store';
import { canGenerateRealisticImages } from '@/lib/utils/feature-gates';
import { GoogleGenAI } from '@google/genai';

export interface BlogImageData {
  imageUrl: string;
  isGenerated: boolean;
  isPro: boolean;
}

/**
 * Generate image for a blog post
 */
export async function generateBlogImage(
  title: string,
  excerpt: string,
  category: string,
  userId?: string
): Promise<BlogImageData> {
  try {
    const cacheKey = generateCacheKey('blog', title.toLowerCase().replace(/\s+/g, '_'), userId);
    
    // Check cache first (only in browser/client context)
    if (typeof window !== 'undefined') {
      const cached = useImageCacheStore.getState().getImage(cacheKey);
      if (cached && isImageCached(cacheKey, 30 * 24 * 60 * 60 * 1000)) {
        // Blog images cached for 30 days
        return {
          imageUrl: cached.imageUrl,
          isGenerated: cached.isGenerated,
          isPro: cached.isPro,
        };
      }
    }

    // Check if user has Pro access (if userId provided)
    let isPro = false;
    if (userId) {
      const accessCheck = await canGenerateRealisticImages(userId);
      isPro = accessCheck.allowed;
    }

    if (!isPro || !userId) {
      // Free users or no user - use fallback
      const fallbackUrl = 'https://res.cloudinary.com/dcidanigq/image/upload/v1742112004/cld-sample-4.jpg';
      
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

    // Pro users get AI-generated images
    const prompt = `Professional blog article header image for: "${title}". 
    Category: ${category}. ${excerpt || ''}
    Modern, clean design, food and nutrition theme, professional blog header, 
    appetizing visuals, well-composed, high quality, blog article cover image style.`;

    // Try server-side generation first
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    
    if (apiKey && typeof window === 'undefined') {
      // Server-side generation
      try {
        const genai = new GoogleGenAI({ apiKey });
        const modelNames = [
          process.env.IMAGE_GEN_MODEL,
          'gemini-2.5-flash-image',
          'gemini-2.5-flash-generate',
          'imagen-3.0-generate-002',
        ].filter(Boolean) as string[];

        for (const modelName of modelNames) {
          try {
            const response = await genai.models.generateImages({
              model: modelName,
              prompt: prompt.trim(),
              config: {
                numberOfImages: 1,
                aspectRatio: '16:9',
                outputMimeType: 'image/png',
              },
            });

            if (response.generatedImages && response.generatedImages.length > 0) {
              const imageData = response.generatedImages[0];
              const base64Image = imageData.image?.imageBytes;
              
              if (base64Image) {
                const dataUrl = `data:image/png;base64,${base64Image}`;
                return {
                  imageUrl: dataUrl,
                  isGenerated: true,
                  isPro: true,
                };
              }
            }
          } catch (modelError) {
            console.warn(`[generateBlogImage] Model ${modelName} failed, trying next`);
            continue;
          }
        }
      } catch (serverError) {
        console.warn('[generateBlogImage] Server-side generation failed');
      }
    }

    // Fallback: Use API route
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    
    const response = await fetch(`${baseUrl}/api/images/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: prompt.trim(),
        id: cacheKey,
        fallbackUrl: 'https://res.cloudinary.com/dcidanigq/image/upload/v1742112004/cld-sample-4.jpg',
      }),
    });

    if (response.ok) {
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
    }

    // Final fallback
    const fallbackUrl = 'https://res.cloudinary.com/dcidanigq/image/upload/v1742112004/cld-sample-4.jpg';
    
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
    console.error('[generateBlogImage] Error:', error);
    return {
      imageUrl: 'https://res.cloudinary.com/dcidanigq/image/upload/v1742112004/cld-sample-4.jpg',
      isGenerated: false,
      isPro: false,
    };
  }
}

