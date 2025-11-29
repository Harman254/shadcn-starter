import { tools } from './ai-tools';
import { ExecutionPlan, ExecutionStep } from './reasoning-engine';

export interface ToolExecutionResult {
    stepId: string;
    toolName: string;
    result: any;
    status: 'success' | 'error';
    error?: string;
}

export class ToolExecutor {
    /**
     * Execute the given plan
     */
    async executePlan(
        plan: ExecutionPlan,
        onStepStart?: (step: ExecutionStep) => void,
        onToolStart?: (toolName: string) => void,
        onToolFinish?: (result: ToolExecutionResult) => void,
        chatMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [],
        context: any = {}
    ): Promise<Record<string, any>> {
        const aggregatedResults: Record<string, any> = {};

        for (const step of plan.steps) {
            if (onStepStart) onStepStart(step);

            // Prepare tool promises for this step
            const stepPromises = step.toolCalls.map(async (call) => {
                if (onToolStart) onToolStart(call.toolName);

                try {
                    const tool = tools[call.toolName as keyof typeof tools];
                    if (!tool) {
                        throw new Error(`Tool ${call.toolName} not found`);
                    }

                    // Inject dependencies from previous results if needed
                    // (Simple dependency injection logic: merge aggregated results into args if keys match)
                    // For more complex dependency mapping, the ReasoningEngine should handle it in args generation
                    // or we need a more sophisticated resolver here.
                    // For now, we assume the ReasoningEngine generates correct args or we rely on ContextManager.

                    console.log('[ToolExecutor] Executing tool:', call.toolName, 'with args:', call.args);

                    // Handle optional args - default to empty object, and convert string args to proper types
                    const args = call.args || {};

                    // Convert string args to proper types (numbers, booleans, etc.)
                    const convertedArgs: any = {};
                    for (const [key, value] of Object.entries(args)) {
                        // Try to parse numbers
                        if (typeof value === 'string' && !isNaN(Number(value))) {
                            convertedArgs[key] = Number(value);
                        } else {
                            convertedArgs[key] = value;
                        }
                    }

                    // Inject chatMessages if the tool accepts it (check tool definition or just pass it)
                    // Note: We blindly pass it if the tool schema allows 'chatMessages', 
                    // but since we're using Vercel AI SDK tools, we can pass extra args and they might be ignored if not in schema.
                    // However, to be safe and explicit, let's add it to convertedArgs if not already present.
                    if (!convertedArgs.chatMessages && chatMessages.length > 0) {
                        convertedArgs.chatMessages = chatMessages;
                    }

                    // Execute tool
                    const result = await tool.execute(convertedArgs, {
                        toolCallId: 'exec-' + Date.now(),
                        messages: chatMessages as any, // Pass messages to Vercel AI SDK context
                        context: context // Pass full context including lastToolResult
                    } as any);

                    const executionResult: ToolExecutionResult = {
                        stepId: step.id,
                        toolName: call.toolName,
                        result,
                        status: 'success'
                    };

                    if (onToolFinish) onToolFinish(executionResult);
                    return executionResult;

                } catch (error: any) {
                    const errorResult: ToolExecutionResult = {
                        stepId: step.id,
                        toolName: call.toolName,
                        result: null,
                        status: 'error',
                        error: error.message
                    };
                    if (onToolFinish) onToolFinish(errorResult);
                    return errorResult;
                }
            });

            // Run all tools in this step in parallel
            const stepResults = await Promise.all(stepPromises);

            // Aggregate results
            stepResults.forEach(r => {
                if (r.status === 'success') {
                    aggregatedResults[r.toolName] = r.result;
                }
            });
        }

        return aggregatedResults;
    }
}

let toolExecutorInstance: ToolExecutor | null = null;

export function getToolExecutor(): ToolExecutor {
    if (!toolExecutorInstance) {
        toolExecutorInstance = new ToolExecutor();
    }
    return toolExecutorInstance;
}
