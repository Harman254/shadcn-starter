/**
 * @fileOverview
 * Nutrition API Client with error handling and fallback mechanisms
 * Supports multiple nutrition data providers with automatic fallback
 */

import { z } from 'zod';

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

export const NutritionDataSchema = z.object({
  calories: z.number().optional(),
  protein: z.number().optional(),
  carbs: z.number().optional(),
  fat: z.number().optional(),
  fiber: z.number().optional(),
  vitamins: z.record(z.number()).optional(),
  minerals: z.record(z.number()).optional(),
});

export type NutritionData = z.infer<typeof NutritionDataSchema>;

export interface NutritionApiResponse {
  success: boolean;
  data?: NutritionData;
  error?: string;
  source?: 'primary' | 'fallback' | 'estimated';
}

// ============================================================================
// NUTRITION API CLIENT
// ============================================================================

export class NutritionApiClient {
  private apiKey?: string;
  private fallbackEnabled: boolean = true;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NUTRITION_API_KEY;
  }

  /**
   * Get nutrition data for a meal or ingredient
   * Tries primary API first, falls back to secondary, then estimates
   */
  async getNutritionData(
    foodName: string,
    quantity?: string
  ): Promise<NutritionApiResponse> {
    // Try primary API (e.g., Edamam, Nutritionix)
    try {
      const primaryResult = await this.fetchFromPrimaryAPI(foodName, quantity);
      if (primaryResult.success) {
        return { ...primaryResult, source: 'primary' };
      }
    } catch (error) {
      console.warn('[NutritionAPI] Primary API failed:', error);
    }

    // Try fallback API (e.g., USDA FoodData Central)
    if (this.fallbackEnabled) {
      try {
        const fallbackResult = await this.fetchFromFallbackAPI(foodName, quantity);
        if (fallbackResult.success) {
          return { ...fallbackResult, source: 'fallback' };
        }
      } catch (error) {
        console.warn('[NutritionAPI] Fallback API failed:', error);
      }
    }

    // Estimate nutrition data using AI or default values
    const estimated = await this.estimateNutritionData(foodName, quantity);
    return { ...estimated, source: 'estimated' };
  }

  /**
   * Primary API: Edamam Nutrition API
   */
  private async fetchFromPrimaryAPI(
    foodName: string,
    quantity?: string
  ): Promise<NutritionApiResponse> {
    if (!this.apiKey) {
      return { success: false, error: 'API key not configured' };
    }

    try {
      const query = quantity ? `${quantity} ${foodName}` : foodName;
      const url = `https://api.edamam.com/api/nutrition-data?app_id=${process.env.EDAMAM_APP_ID}&app_key=${this.apiKey}&ingr=${encodeURIComponent(query)}`;

      const response = await fetch(url, {
        next: { revalidate: 3600 }, // Cache for 1 hour
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: {
          calories: data.calories,
          protein: data.totalNutrients?.PROCNT?.quantity,
          carbs: data.totalNutrients?.CHOCDF?.quantity,
          fat: data.totalNutrients?.FAT?.quantity,
          fiber: data.totalNutrients?.FIBTG?.quantity,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Fallback API: USDA FoodData Central
   */
  private async fetchFromFallbackAPI(
    foodName: string,
    quantity?: string
  ): Promise<NutritionApiResponse> {
    try {
      // USDA FoodData Central API
      const searchUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${process.env.USDA_API_KEY}&query=${encodeURIComponent(foodName)}&pageSize=1`;

      const searchResponse = await fetch(searchUrl, {
        next: { revalidate: 3600 },
      });

      if (!searchResponse.ok) {
        throw new Error(`USDA API returned ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();
      if (!searchData.foods || searchData.foods.length === 0) {
        return { success: false, error: 'Food not found' };
      }

      const food = searchData.foods[0];
      const nutrients = food.foodNutrients || [];

      const extractNutrient = (name: string): number | undefined => {
        const nutrient = nutrients.find((n: any) => n.nutrientName === name);
        return nutrient?.value;
      };

      return {
        success: true,
        data: {
          calories: extractNutrient('Energy'),
          protein: extractNutrient('Protein'),
          carbs: extractNutrient('Carbohydrate, by difference'),
          fat: extractNutrient('Total lipid (fat)'),
          fiber: extractNutrient('Fiber, total dietary'),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Estimate nutrition data using AI or default values
   */
  private async estimateNutritionData(
    foodName: string,
    quantity?: string
  ): Promise<NutritionApiResponse> {
    // Use AI to estimate nutrition based on food name
    // This is a fallback when APIs are unavailable
    // In production, you'd call your AI model here

    // For now, return basic estimates based on food type
    const estimates = this.getDefaultEstimates(foodName);

    return {
      success: true,
      data: estimates,
    };
  }

  /**
   * Get default nutrition estimates based on food category
   */
  private getDefaultEstimates(foodName: string): NutritionData {
    const lowerName = foodName.toLowerCase();

    // Basic estimates by food category
    if (lowerName.includes('chicken') || lowerName.includes('meat')) {
      return {
        calories: 200,
        protein: 30,
        carbs: 0,
        fat: 8,
      };
    } else if (lowerName.includes('rice') || lowerName.includes('pasta')) {
      return {
        calories: 130,
        protein: 3,
        carbs: 28,
        fat: 0.3,
      };
    } else if (lowerName.includes('vegetable') || lowerName.includes('salad')) {
      return {
        calories: 25,
        protein: 1,
        carbs: 5,
        fat: 0.2,
        fiber: 2,
      };
    } else {
      // Generic estimate
      return {
        calories: 100,
        protein: 5,
        carbs: 15,
        fat: 3,
      };
    }
  }

  /**
   * Batch fetch nutrition data for multiple foods
   */
  async getBatchNutritionData(
    foods: Array<{ name: string; quantity?: string }>
  ): Promise<Record<string, NutritionData>> {
    const results: Record<string, NutritionData> = {};

    // Execute in parallel with concurrency limit
    const batchSize = 5;
    for (let i = 0; i < foods.length; i += batchSize) {
      const batch = foods.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (food) => {
          const result = await this.getNutritionData(food.name, food.quantity);
          return { name: food.name, data: result.data };
        })
      );

      batchResults.forEach(({ name, data }) => {
        if (data) {
          results[name] = data;
        }
      });
    }

    return results;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let nutritionClientInstance: NutritionApiClient | null = null;

export function getNutritionClient(): NutritionApiClient {
  if (!nutritionClientInstance) {
    nutritionClientInstance = new NutritionApiClient();
  }
  return nutritionClientInstance;
}



