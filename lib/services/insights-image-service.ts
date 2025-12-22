/**
 * Insights Image Generation Service
 * 
 * Generates AI images for insights/stories based on meal plans
 */

import { generateMealImage } from './image-generation-service';
import { generateCacheKey } from '@/store/image-cache-store';

export interface InsightImageData {
  imageUrl: string;
  isGenerated: boolean;
  isPro: boolean;
}

/**
 * Generate image for an insight/story based on meal plan data
 */
export async function generateInsightImage(
  title: string,
  description: string,
  mealPlanTitle?: string,
  userId: string
): Promise<InsightImageData> {
  try {
    // Create a descriptive prompt for the insight
    const prompt = `${title}. ${description || ''}. ${mealPlanTitle ? `Based on meal plan: ${mealPlanTitle}.` : ''}
    Professional food photography, appetizing presentation, well-lit, 
    restaurant style, food blog quality, realistic ingredients, proper plating, 
    natural lighting, vibrant colors, appetizing presentation.`;

    // Use meal image generation with custom prompt
    const cacheKey = generateCacheKey('insight', title.toLowerCase().replace(/\s+/g, '_'), userId);
    
    // For now, use the meal image service with a generic meal type
    // In the future, we could create a dedicated insight image generation
    const result = await generateMealImage(
      title,
      description || '',
      userId,
      'dinner' // Default meal type for insights
    );

    return {
      imageUrl: result.imageUrl,
      isGenerated: result.isGenerated,
      isPro: result.isPro,
    };
  } catch (error) {
    console.error('[generateInsightImage] Error:', error);
    // Return fallback
    return {
      imageUrl: 'https://res.cloudinary.com/dcidanigq/image/upload/v1742112004/cld-sample-4.jpg',
      isGenerated: false,
      isPro: false,
    };
  }
}

