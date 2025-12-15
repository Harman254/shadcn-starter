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
            /\b(plan|create|generate|make)\s+(a\s+)?meal\s*plan/i,
            /\bmeal\s*plan\s+(for|over|spanning)/i,
            /\b\d+\s*day\s+(meal|plan|diet)/i,
            /\bplan\s+meals?\s+for\s+\d+/i,
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
