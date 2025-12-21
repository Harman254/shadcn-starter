import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { tools } from './ai-tools';

export interface ExecutionStep {
    id: string;
    toolCalls: {
        toolName: string;
        args: any;
    }[];
    description: string;
}

export interface ExecutionPlan {
    steps: ExecutionStep[];
    reasoning: string;
}

export class ReasoningEngine {
    /**
     * Analyze user message and generate an execution plan
     */
    async generatePlan(
        message: string,
        context: any,
        availableTools: typeof tools
    ): Promise<ExecutionPlan> {
        try {
            const toolNames = Object.keys(availableTools);

            const { object, usage } = await generateObject({
                model: google('gemini-2.0-flash'),
                schema: z.object({
                    reasoning: z.string().describe('Explanation of why these steps are chosen'),
                    steps: z.array(z.object({
                        id: z.string(),
                        description: z.string(),
                        toolCalls: z.array(z.object({
                            toolName: z.enum(toolNames as [string, ...string[]]),
                            args: z.string().describe('JSON string of tool arguments. Example: "{\\"duration\\": \\"1\\", \\"mealsPerDay\\": \\"3\\"}"')
                        }))
                    }))
                }),
                prompt: `You are an expert orchestration engine for a meal planning app.
        
        USER MESSAGE: "${message}"
        
        CONTEXT:
        ${JSON.stringify(context, null, 2)}
        
        AVAILABLE TOOLS:
        ${toolNames.join(', ')}
        
        GOAL: Create an efficient execution plan to answer the user's request.
        
        RULES:
        1. **Parallel Execution**: Group independent tool calls into the same step.
           - Example: "Analyze nutrition" and "Get pricing" can run together if they both rely on an existing meal plan.
        2. **Dependencies**: If a tool needs output from another (e.g., generateGroceryList needs a mealPlanId from generateMealPlan), put them in sequential steps.
        3. **Efficiency**: Minimize the number of steps.
        4. **Context Awareness**: Use the provided context (mealPlanId, preferences) ONLY if the user doesn't specify otherwise.
        5. **User Overrides**: If the user specifies ANY preference (e.g. "keto", "ugali", "3 days"), it MUST override the saved context/preferences.
           - Example: If context has "Kenyan" but user asks for "Ugandan", use "Ugandan".
           - Example: If context has "7 days" but user asks for "1 day", use "1".
        
        CRITICAL:
        - **Meal Plan Requests**:
          * If the user asks for a NEW meal plan (e.g., "Create a meal plan", "Generate a 7-day plan"), call 'generateMealPlan'.
          * If the user asks for a DIFFERENT/ALTERNATIVE meal plan variant (e.g., "Give me another option", "Show me a different plan"), call 'modifyMealPlan'.
          * If the user wants to REPLACE/SWAP/CHANGE a specific meal in an EXISTING plan (e.g., "Replace X with Y", "Swap Tuesday dinner", "Change ugali to rice", "Replace ugali sukumawiki with rice and chapati beef"), call 'swapMeal'.
            - For swapMeal, you MUST extract:
              * The meal name to replace (e.g., "ugali sukumawiki", "Tuesday dinner")
              * The replacement meal description (e.g., "rice and chapati beef")
              * The day number (if mentioned, otherwise use 1 as default)
              * The meal index (0=Breakfast, 1=Lunch, 2=Dinner - infer from meal name or use 2 for dinner if unclear)
            - Example: "Replace ugali sukumawiki with rice and chapati beef" -> Call 'swapMeal' with args '{"day": 1, "mealIndex": 2, "reason": "User wants to replace ugali sukumawiki with rice and chapati beef", "mealNameToReplace": "ugali sukumawiki", "replacementDescription": "rice and chapati beef"}'.
            - CRITICAL: If there's a meal plan in context and user says "replace", "swap", or "change" a meal, ALWAYS use 'swapMeal', NOT 'generateMealPlan' or 'modifyMealPlan'.
        - If the user asks for a grocery list, call 'generateGroceryList'.
          * If user says "for this meal plan", "for this plan", "for the meal plan", pass '{"source": "mealplan", "fromContext": "true"}' to use the current meal plan context.
          * If user says "for [recipe name]" or "for the recipe", pass '{"source": "recipe", "recipeName": "[recipe name]"}'.
          * If no context is specified, leave args empty to use context from conversation.
        - If the user asks for nutrition analysis, call 'analyzeNutrition'.
          * If user says "for this meal plan", "for this plan", "Analyze nutrition for this meal plan", leave args empty to use current meal plan context.
          * If user says "for [recipe name]" or "Analyze nutrition for the recipe", pass '{"recipeName": "[recipe name]"}'.
          * Do NOT invent a mealPlanId. Leave args empty to use context.
        - If the user asks for pricing, call 'getGroceryPricing'. Do NOT invent a mealPlanId. Leave args empty to use context.
        - If the user asks to optimize a grocery list (e.g., "Optimize this grocery list", "Optimize this grocery list for better prices"), call 'optimizeGroceryList'. Leave args empty to use current grocery list context.
        - **Recipe Requests**:
          * **Single Dish**: If the user asks for a specific dish (e.g. "Chapati", "Sushi", "How to make X"), call 'generateMealRecipe'.
            - Example: "Chapati" -> Call 'generateMealRecipe' with args '{"name": "Chapati"}'.
          * **Search/List**: If the user asks for ideas or a list (e.g. "Find me pasta recipes", "Breakfast ideas"), call 'searchRecipes'.
            - Example: "Pasta recipes" -> Call 'searchRecipes' with args '{"query": "pasta recipes", "count": 3}'.
        - **Pantry Management**:
          * If the user wants to add items to their pantry (e.g. "Add these items to my pantry", "Add to pantry", "Add these X items to my pantry tracking"), call 'updatePantry'.
          * Extract items from the message. Items may be formatted as "Item Name (quantity)" or just listed.
          * Parse items into an array of objects with: name (required), category (optional), quantity (optional), expiryEstimate (optional).
          * Example: "Add these items to my pantry: Chicken (1 cup), Rice (2 cups), Broccoli (1 head)" -> Call 'updatePantry' with args '{"items": [{"name": "Chicken", "quantity": "1 cup"}, {"name": "Rice", "quantity": "2 cups"}, {"name": "Broccoli", "quantity": "1 head"}]}'.
          * If items are from a pantry analysis, use the exact item data from the analysis.
        - **Ingredient-Based Meal Suggestions**:
          * If the user asks for meal suggestions based on ingredients they have (e.g. "Suggest meals I can cook with these ingredients: X, Y, Z", "What can I make with...", "I have X, Y, Z..."), call 'planFromInventory'.
          * Extract the ingredient list from the message. Ingredients may be listed after a colon (":") or in the message text.
          * Parse ingredients as an array of strings, splitting by commas and trimming whitespace.
          * Example: "Suggest meals I can cook with these ingredients: Salt, Pepper, Onions" -> Call 'planFromInventory' with args '{"ingredients": ["Salt", "Pepper", "Onions"]}'.
          * Example: "What can I make with chicken, rice, and vegetables?" -> Call 'planFromInventory' with args '{"ingredients": ["chicken", "rice", "vegetables"]}'.
          * If meal type is mentioned (breakfast, lunch, dinner, snack), include it in 'mealType'. Otherwise, use 'any'.
        - **Prep Schedule/Timeline Requests**:
          * If the user asks for a prep schedule, prep timeline, or meal prep plan (e.g. "Create a prep schedule", "Prep timeline", "Meal prep plan", "Create a prep schedule for this meal plan"), call 'generatePrepTimeline'.
          * CRITICAL: Extract recipe names from the message. Look for text after "Recipes to prep:" or "recipes:" or "for this meal plan with recipes:".
          * Parse recipes by splitting on commas and trimming whitespace. Each recipe name should be a separate string in the array.
          * Recipe names may contain commas, hyphens, and other special characters - preserve them exactly as written.
          * Example: "Create a prep schedule for this meal plan. Recipes to prep: Chicken Curry, Rice, Salad" -> Call 'generatePrepTimeline' with args '{"recipes": ["Chicken Curry", "Rice", "Salad"], "prepStyle": "batch"}'.
          * Example: "Create a prep schedule for this meal plan. Recipes to prep: Swahili-Inspired Peanut Butter Banana Curry, Italian Scrambled Eggs with Pesto and Parmesan" -> Call 'generatePrepTimeline' with args '{"recipes": ["Swahili-Inspired Peanut Butter Banana Curry", "Italian Scrambled Eggs with Pesto and Parmesan"], "prepStyle": "batch"}'.
          * If the message contains "Recipes to prep:" or "recipes:" followed by a list, ALWAYS extract those recipes. Do not skip this step.
          * If recipes are mentioned in the message, ALWAYS extract them. If not, check context for the last meal plan and extract meal names from it.
          * If no recipes are provided and no meal plan is in context, return an error or ask the user for recipes.
          * NEVER call generatePrepTimeline with an empty recipes array.
        - **General Chat / Info**: ONLY if the user asks a general question unrelated to generating content (e.g. "Hi", "How are you?"), return an EMPTY array.
          * CRITICAL: Do NOT return empty for food items. "Chapati" is NOT general chat, it is a recipe request.
        - ALWAYS provide tool arguments as a valid JSON string.
        - For tool arguments, convert numbers to strings (e.g., duration: "1", mealsPerDay: "3")
        - DEFAULT to 1-day meal plans (duration: "1") unless user explicitly requests more days.
        
        Return a JSON object with the plan.`
            });

            console.log('[ReasoningEngine] Generated plan raw:', JSON.stringify(object, null, 2));
            console.log('[ReasoningEngine] Token Usage:', usage);

            // Parse the args strings back into objects
            const parsedSteps = object.steps.map(step => ({
                ...step,
                toolCalls: step.toolCalls.map(call => {
                    try {
                        return {
                            ...call,
                            args: JSON.parse(call.args)
                        };
                    } catch (e) {
                        console.error('[ReasoningEngine] Failed to parse args JSON:', call.args);
                        return {
                            ...call,
                            args: {}
                        };
                    }
                })
            }));

            return {
                reasoning: object.reasoning,
                steps: parsedSteps
            };
        } catch (error) {
            console.error('[ReasoningEngine] Error generating plan:', error);
            // Fallback to a simple default plan or rethrow
            throw error;
        }
    }
}

let reasoningEngineInstance: ReasoningEngine | null = null;

export function getReasoningEngine(): ReasoningEngine {
    if (!reasoningEngineInstance) {
        reasoningEngineInstance = new ReasoningEngine();
    }
    return reasoningEngineInstance;
}
