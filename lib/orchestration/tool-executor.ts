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
        onToolFinish?: (result: ToolExecutionResult) => void
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

                    // Execute tool
                    const result = await tool.execute(call.args, {
                        toolCallId: 'exec-' + Date.now(),
                        messages: [] // We might need to pass messages if tools rely on them
                    });

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
