/**
 * @fileOverview
 * Conversational Response Generator
 * Combines API outputs into natural, user-friendly summaries
 * Similar to Perplexity AI's response style
 */

import { OrchestrationResult } from './tool-orchestrator';
import { NutritionData } from './api-clients/nutrition-api';
import { PriceData } from './api-clients/grocery-pricing-api';

// ============================================================================
// TYPES
// ============================================================================

export interface ResponseContext {
  userMessage: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  userPreferences?: any;
}

export interface GeneratedResponse {
  text: string;
  structuredData?: {
    mealPlan?: any;
    nutrition?: NutritionData;
    prices?: PriceData[];
    groceryList?: any;
  };
  suggestions?: string[]; // Next action suggestions
  confidence: 'high' | 'medium' | 'low';
}

// ============================================================================
// RESPONSE GENERATOR
// ============================================================================

export class ResponseGenerator {
  /**
   * Generate a natural language response from orchestration results
   */
  async generateResponse(
    orchestrationResult: OrchestrationResult,
    context: ResponseContext
  ): Promise<GeneratedResponse> {
    const { results, errors, aggregatedData } = orchestrationResult;

    // Build response sections
    const sections: string[] = [];
    const structuredData: any = {};

    // Meal Plan Section
    if (results.mealPlan) {
      const mealPlan = results.mealPlan;
      sections.push(
        this.formatMealPlanSummary(mealPlan)
      );
      structuredData.mealPlan = mealPlan;
    }

    // Nutrition Section
    if (results.nutrition) {
      const nutrition = results.nutrition;
      sections.push(
        this.formatNutritionSummary(nutrition)
      );
      structuredData.nutrition = nutrition;
    }

    // Pricing Section
    if (results.pricing) {
      const pricing = results.pricing;
      sections.push(
        this.formatPricingSummary(pricing)
      );
      structuredData.prices = pricing.prices;
    }

    // Grocery List Section
    if (results.groceryList) {
      const groceryList = results.groceryList;
      sections.push(
        this.formatGroceryListSummary(groceryList)
      );
      structuredData.groceryList = groceryList;
    }

    // Error Handling
    if (errors && Object.keys(errors).length > 0) {
      sections.push(
        this.formatErrorSummary(errors)
      );
    }

    // Combine sections into natural response
    const text = this.combineSections(sections, context);
    
    // Generate suggestions
    const suggestions = this.generateSuggestions(results, context);

    // Determine confidence
    const confidence = this.calculateConfidence(results, errors);

    return {
      text,
      structuredData: Object.keys(structuredData).length > 0 ? structuredData : undefined,
      suggestions,
      confidence,
    };
  }

  /**
   * Format meal plan summary
   */
  private formatMealPlanSummary(mealPlan: any): string {
    const { duration, mealsPerDay, days } = mealPlan;
    const totalMeals = duration * mealsPerDay;

    return `I've created a ${duration}-day meal plan with ${mealsPerDay} meals per day (${totalMeals} total meals). ` +
           `The plan includes a variety of nutritious and delicious meals tailored to your preferences. ` +
           `Each day features balanced meals with clear cooking instructions.`;
  }

  /**
   * Format nutrition summary
   */
  private formatNutritionSummary(nutrition: Record<string, NutritionData>): string {
    const items = Object.keys(nutrition);
    if (items.length === 0) return '';

    const totalCalories = Object.values(nutrition).reduce(
      (sum, n) => sum + (n.calories || 0), 0
    );
    const totalProtein = Object.values(nutrition).reduce(
      (sum, n) => sum + (n.protein || 0), 0
    );

    return `Nutritional information: The meal plan provides approximately ${Math.round(totalCalories)} calories per day ` +
           `with ${Math.round(totalProtein)}g of protein. ` +
           `Each meal is balanced to support your dietary goals.`;
  }

  /**
   * Format pricing summary
   */
  private formatPricingSummary(pricing: any): string {
    if (!pricing.prices || pricing.prices.length === 0) return '';

    const total = pricing.total || pricing.prices.reduce(
      (sum: number, p: PriceData) => sum + p.price, 0
    );
    const currency = pricing.currency || '$';

    return `Estimated grocery cost: ${currency}${total.toFixed(2)} for all items. ` +
           `Prices are based on local stores in your area and may vary. ` +
           `I can help you find cheaper alternatives or compare prices across different stores.`;
  }

  /**
   * Format grocery list summary
   */
  private formatGroceryListSummary(groceryList: any): string {
    const itemCount = groceryList.items?.length || 0;
    if (itemCount === 0) return '';

    return `I've prepared a grocery list with ${itemCount} items, organized by category for easy shopping. ` +
           `Each item includes quantity recommendations and estimated prices. ` +
           `The list is optimized to minimize trips to the store.`;
  }

  /**
   * Format error summary
   */
  private formatErrorSummary(errors: Record<string, Error>): string {
    const errorCount = Object.keys(errors).length;
    if (errorCount === 0) return '';

    return `Note: I encountered some issues retrieving ${errorCount === 1 ? 'one piece' : 'some'} of information, ` +
           `but I've provided the best available data. You can ask me to retry or provide more details.`;
  }

  /**
   * Combine sections into natural response
   */
  private combineSections(sections: string[], context: ResponseContext): string {
    if (sections.length === 0) {
      return "I'm here to help with your meal planning needs. What would you like to know?";
    }

    // Add conversational transitions
    let response = sections[0];

    for (let i = 1; i < sections.length; i++) {
      // Add natural transitions
      if (i === sections.length - 1 && sections.length > 2) {
        response += ' Finally, ' + sections[i].toLowerCase();
      } else {
        response += ' ' + sections[i];
      }
    }

    // Add closing based on context
    if (context.userMessage.toLowerCase().includes('grocery') || 
        context.userMessage.toLowerCase().includes('shopping')) {
      response += ' Would you like me to help you find cheaper alternatives or adjust quantities?';
    } else if (context.userMessage.toLowerCase().includes('nutrition') ||
               context.userMessage.toLowerCase().includes('calories')) {
      response += ' Would you like more detailed nutritional breakdowns for specific meals?';
    } else {
      response += ' Is there anything you\'d like me to adjust or explain further?';
    }

    return response;
  }

  /**
   * Generate next action suggestions
   */
  private generateSuggestions(
    results: Record<string, any>,
    context: ResponseContext
  ): string[] {
    const suggestions: string[] = [];

    if (results.mealPlan && !results.groceryList) {
      suggestions.push('Create a grocery list for this meal plan');
      suggestions.push('Adjust the meal plan duration');
      suggestions.push('Swap some meals');
    }

    if (results.groceryList && !results.pricing) {
      suggestions.push('Compare prices across stores');
      suggestions.push('Find cheaper alternatives');
    }

    if (results.mealPlan && !results.nutrition) {
      suggestions.push('Get detailed nutrition information');
      suggestions.push('Calculate daily calorie intake');
    }

    if (Object.keys(results).length > 0) {
      suggestions.push('Save this meal plan');
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }

  /**
   * Calculate confidence level
   */
  private calculateConfidence(
    results: Record<string, any>,
    errors?: Record<string, Error>
  ): 'high' | 'medium' | 'low' {
    const resultCount = Object.keys(results).length;
    const errorCount = errors ? Object.keys(errors).length : 0;

    if (errorCount === 0 && resultCount > 0) {
      return 'high';
    } else if (errorCount < resultCount) {
      return 'medium';
    } else {
      return 'low';
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let responseGeneratorInstance: ResponseGenerator | null = null;

export function getResponseGenerator(): ResponseGenerator {
  if (!responseGeneratorInstance) {
    responseGeneratorInstance = new ResponseGenerator();
  }
  return responseGeneratorInstance;
}


