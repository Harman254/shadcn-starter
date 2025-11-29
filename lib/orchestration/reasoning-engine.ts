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
                model: google('gemini-2.0-flash-exp'),
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
