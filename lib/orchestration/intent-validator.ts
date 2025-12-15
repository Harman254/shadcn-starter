/**
 * @fileOverview
 * Intent validation to ensure tools are called when required
 * Detects user intent and validates that appropriate tools were executed
 */

import { z } from 'zod';

export type IntentType =
    | 'MEAL_PLAN_REQUIRED'
    | 'GROCERY_LIST_REQUIRED'
    | 'NUTRITION_ANALYSIS_REQUIRED'
    | 'PRICING_REQUIRED'
    | 'CONVERSATIONAL';

export interface IntentAnalysis {
    intent: IntentType;
    confidence: 'high' | 'medium' | 'low';
    expectedTools: string[];
    requiredParams?: Record<string, any>;
    contextNeeded?: string[]; // e.g., ['mealPlanId']
}

export interface ValidationResult {
    passed: boolean;
    missingTools: string[];
    reason?: string;
}

/**
 * Intent patterns with high-confidence keywords
 */
const INTENT_PATTERNS = {
    RECIPE_REQUIRED: {
        keywords: [
            /\b(recipe|how\s+to\s+make|cook|prepare)\s+/i,
            /\b(ingredients|steps)\s+for\s+/i,
            /\b(full\s+recipe|complete\s+recipe|give\s+me\s+recipe|show\s+me\s+recipe|recipe\s+for)\s+/i,
            /\brecipe\s+for\s+/i,
            // Match "full recipe for X" pattern - HIGH PRIORITY
            /full\s+recipe\s+for\s+/i,
            // Match dish names (common patterns) - more flexible
            /\b(jamaican|chicken|beef|pork|fish|pasta|rice|ugali|chapati|biryani|curry|stew|soup|salad|sandwich|burger|pizza|omelette|scramble|pancake|waffle|smoothie|patties|jerk)\s+/i,
            // Match standalone dish names (capitalized words that might be dish names)
            /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\s+(patties|pizza|burger|sandwich|salad|stew|curry|biryani|omelette|pancake|waffle)/i,
            // Match "Jamaican Beef Patties" pattern specifically
            /jamaican\s+beef\s+patties/i,
            /jamaican\s+\w+\s+patties/i,
        ],
        tools: ['generateMealRecipe'],
        confidence: 'high' as const,
    },
    PANTRY_ANALYSIS: {
        keywords: [
            /\b(scan|analyze|check|look\s+at)\s+(my\s+)?(fridge|pantry|inventory|shelf)/i,
            /\b(what\s+do\s+i\s+have|what's\s+in\s+my)/i,
        ],
        tools: ['analyzePantryImage'],
        confidence: 'high' as const,
    },
    INGREDIENT_SUBSTITUTION: {
        keywords: [
            /\b(substitute|replace|swap|alternative)\s+(for\s+)?/i,
            /\binstead\s+of\s+/i,
            /\b(don't\s+have|no)\s+/i,
        ],
        tools: ['suggestIngredientSubstitutions'],
        confidence: 'medium' as const,
    },
    PREP_TIMELINE: {
        keywords: [
            /\b(prep|batch|cooking)\s+(schedule|timeline|plan)/i,
            /\b(when|how)\s+to\s+prep/i,
        ],
        tools: ['generatePrepTimeline'],
        confidence: 'high' as const,
        contextNeeded: ['mealPlanId'],
    },
    MEAL_PLAN_REQUIRED: {
        keywords: [
            /\b(plan|create|generate|make|get|give|show)\s+(me\s+)?(a\s+)?meal\s*plan/i,
            /\bmeal\s*plan\s+(for|over|spanning)/i,
            /\b\d+\s*day\s+(meal|plan|diet)/i,
            /\bplan\s+meals?\s+for\s+\d+/i,
            /\b(what\s+should\s+i\s+eat|what\s+to\s+eat|suggest\s+meals)/i,
            /\b(just\s+get\s+me|get\s+me\s+something|give\s+me\s+something)/i,
            /\b(do\s+it\s+again|generate\s+again|create\s+again|make\s+another)/i,
            /\b(new\s+plan|another\s+plan|different\s+plan)/i,
        ],
        tools: ['generateMealPlan'],
        confidence: 'high' as const,
    },
    GROCERY_LIST_REQUIRED: {
        keywords: [
            /\b(grocery|shopping)\s*list/i,
            /\blist\s+of\s+(groceries|ingredients)/i,
            /\bwhat\s+(do|should)\s+i\s+(buy|shop|get|purchase)/i,
        ],
        tools: ['generateGroceryList'],
        confidence: 'high' as const,
        contextNeeded: ['mealPlanId'],
    },
    NUTRITION_ANALYSIS_REQUIRED: {
        keywords: [
            /\b(nutrition|nutritional|calories|protein|carbs|macros)/i,
            /\bhow\s+(many|much)\s+(calories|protein)/i,
            /\banalyze\s+(the\s+)?nutrition/i,
        ],
        tools: ['analyzeNutrition'],
        confidence: 'medium' as const,
        contextNeeded: ['mealPlanId'],
    },
    PRICING_REQUIRED: {
        keywords: [
            /\b(price|cost|how\s+much|expensive|budget)/i,
            /\bhow\s+much\s+(will|does|would)\s+(it|this|that)\s+cost/i,
        ],
        tools: ['getGroceryPricing'],
        confidence: 'medium' as const,
        contextNeeded: ['mealPlanId'],
    },
    OPTIMIZE_GROCERY_LIST: {
        keywords: [
            /\boptimize\s+(grocery|shopping)\s*list/i,
            /\bfind\s+best\s+prices/i,
            /\bcheapest\s+options/i,
        ],
        tools: ['optimizeGroceryList'],
        confidence: 'high' as const,
    },
    SEARCH_FOOD_DATA: {
        keywords: [
            /\b(calories|nutrition|protein|carbs|fat)\s+in\s+/i,
            /\bhow\s+much\s+(calories|protein|carbs)/i,
            /\b(price|cost)\s+of\s+/i,
            /\bwhere\s+to\s+buy/i,
            /\bis\s+\w+\s+available/i,
            /\balternative\s+to\s+/i,
            /\b(substitute|replace)\s+\w+/i,
        ],
        tools: ['searchFoodData'],
        confidence: 'high' as const,
    },
    UPDATE_PANTRY: {
        keywords: [
            /\b(add|update|save)\s+(to\s+)?(my\s+)?(pantry|inventory)/i,
            /\b(add|put)\s+\w+\s+(in|to)\s+(my\s+)?(pantry|inventory)/i,
        ],
        tools: ['updatePantry'],
        confidence: 'high' as const,
    },
};

export class IntentValidator {
    /**
     * Analyze user message to determine intent and expected tools
     */
    analyzeIntent(message: string, context?: { hasMealPlanId?: boolean }): IntentAnalysis {
        // Check each intent pattern
        for (const [intentType, pattern] of Object.entries(INTENT_PATTERNS)) {
            const matches = pattern.keywords.some(regex => regex.test(message));

            if (matches) {
                // Type narrowing for contextNeeded
                const needsContext = 'contextNeeded' in pattern;
                const contextNeeded = needsContext ? pattern.contextNeeded : undefined;

                // Check if context requirements are met
                if (needsContext && contextNeeded && contextNeeded.includes('mealPlanId')) {
                    // If context needed but not available, lower confidence
                    if (!context?.hasMealPlanId) {
                        return {
                            intent: intentType as IntentType,
                            confidence: 'low',
                            expectedTools: [],
                            contextNeeded,
                        };
                    }
                }

                return {
                    intent: intentType as IntentType,
                    confidence: pattern.confidence,
                    expectedTools: pattern.tools,
                    contextNeeded,
                };
            }
        }

        // No clear intent - conversational
        return {
            intent: 'CONVERSATIONAL',
            confidence: 'high',
            expectedTools: [],
        };
    }

    /**
     * Validate that expected tools were actually called
     */
    validateToolExecution(
        expected: string[],
        actual: string[]
    ): ValidationResult {
        if (expected.length === 0) {
            // No tools required for conversational intent
            return { passed: true, missingTools: [] };
        }

        const missingTools = expected.filter(tool => !actual.includes(tool));

        if (missingTools.length === 0) {
            return { passed: true, missingTools: [] };
        }

        return {
            passed: false,
            missingTools,
            reason: `Expected tools [${expected.join(', ')}] but only got [${actual.join(', ')}]`,
        };
    }

    /**
     * Check if retry should be attempted based on validation result
     */
    shouldRetry(validation: ValidationResult, intentConfidence: 'high' | 'medium' | 'low'): boolean {
        // Only retry for high-confidence intents with missing tools
        return !validation.passed && intentConfidence === 'high' && validation.missingTools.length > 0;
    }
}

// Singleton instance
let validatorInstance: IntentValidator | null = null;

export function getIntentValidator(): IntentValidator {
    if (!validatorInstance) {
        validatorInstance = new IntentValidator();
    }
    return validatorInstance;
}
