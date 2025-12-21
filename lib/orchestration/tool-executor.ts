import { tools } from './ai-tools';
import { ExecutionPlan, ExecutionStep } from './reasoning-engine';
import { ToolResult, ErrorCode } from '@/lib/types/tool-result';

export interface ToolExecutionResult {
    stepId: string;
    toolName: string;
    result: any;
    status: 'success' | 'error' | 'retrying';
    error?: string;
    retryAttempt?: number;
    maxRetries?: number;
}

interface RetryConfig {
    maxRetries: number;
    initialDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxRetries: 3,
    initialDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
    backoffMultiplier: 2,
};

/**
 * Check if an error is retryable based on error type and ToolResult
 */
function isRetryableError(error: any, toolResult?: ToolResult): boolean {
    // Check if ToolResult explicitly marks it as retryable
    if (toolResult?.isRetryable === true) {
        return true;
    }

    // Check error code for retryable errors
    if (toolResult?.code === ErrorCode.RATE_LIMIT_EXCEEDED) {
        return true;
    }

    // Check error message for transient errors
    const errorMessage = (error?.message || '').toLowerCase();
    const retryablePatterns = [
        'network',
        'timeout',
        'rate limit',
        '429',
        '503',
        '502',
        '504',
        'connection',
        'econnrefused',
        'etimedout',
        'temporary',
        'retry',
    ];

    return retryablePatterns.some(pattern => errorMessage.includes(pattern));
}

/**
 * Calculate retry delay with exponential backoff and jitter
 */
function calculateRetryDelay(attempt: number, config: RetryConfig): number {
    const exponentialDelay = Math.min(
        config.initialDelay * Math.pow(config.backoffMultiplier, attempt),
        config.maxDelay
    );
    // Add jitter (up to 30% of delay) to prevent thundering herd
    const jitter = Math.random() * 0.3 * exponentialDelay;
    return Math.floor(exponentialDelay + jitter);
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export class ToolExecutor {
    private retryConfig: RetryConfig;

    constructor(retryConfig?: Partial<RetryConfig>) {
        this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
    }

    /**
     * Execute a single tool with retry logic
     */
    private async executeToolWithRetry(
        call: { toolName: string; args: any },
        chatMessages: Array<{ role: 'user' | 'assistant'; content: string }>,
        context: any,
        stepId: string,
        onToolFinish?: (result: ToolExecutionResult) => void
    ): Promise<ToolExecutionResult> {
        const tool = tools[call.toolName as keyof typeof tools];
        if (!tool) {
            return {
                stepId,
                toolName: call.toolName,
                result: null,
                status: 'error',
                error: `Tool ${call.toolName} not found`,
            };
        }

        // Convert and prepare args
        const args = call.args || {};
        const convertedArgs: any = {};
        for (const [key, value] of Object.entries(args)) {
            if (typeof value === 'string' && !isNaN(Number(value))) {
                convertedArgs[key] = Number(value);
            } else {
                convertedArgs[key] = value;
            }
        }

        if (!convertedArgs.chatMessages && chatMessages.length > 0) {
            convertedArgs.chatMessages = chatMessages;
        }

        let lastError: any = null;
        let lastResult: ToolResult | null = null;

        // Retry loop
        for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
            try {
                // Notify retry attempt if not first attempt
                if (attempt > 0 && onToolFinish) {
                    onToolFinish({
                        stepId,
                        toolName: call.toolName,
                        result: null,
                        status: 'retrying',
                        retryAttempt: attempt,
                        maxRetries: this.retryConfig.maxRetries,
                    });
                }

                console.log(
                    `[ToolExecutor] ${attempt > 0 ? `[Retry ${attempt}/${this.retryConfig.maxRetries}] ` : ''}Executing tool:`,
                    call.toolName
                );

                // Execute tool
                const result = await tool.execute(convertedArgs, {
                    toolCallId: `exec-${Date.now()}-${attempt}`,
                    messages: chatMessages as any,
                    context: context,
                } as any);

                // Check if result indicates failure
                if (result && typeof result === 'object' && 'success' in result && !result.success) {
                    lastResult = result as ToolResult;
                    lastError = new Error(result.error || result.message || 'Tool execution failed');

                    // Check if we should retry
                    if (attempt < this.retryConfig.maxRetries && isRetryableError(lastError, lastResult)) {
                        const delay = calculateRetryDelay(attempt, this.retryConfig);
                        console.log(
                            `[ToolExecutor] Tool ${call.toolName} failed but is retryable. Retrying in ${delay}ms...`
                        );
                        await sleep(delay);
                        continue;
                    }

                    // Not retryable or max retries reached
                    return {
                        stepId,
                        toolName: call.toolName,
                        result: lastResult,
                        status: 'error',
                        error: lastResult.message || lastResult.error || 'Tool execution failed',
                    };
                }

                // Success
                const executionResult: ToolExecutionResult = {
                    stepId,
                    toolName: call.toolName,
                    result,
                    status: 'success',
                };

                console.log('[ToolExecutor] ✅ Tool finished:', call.toolName);
                return executionResult;

            } catch (error: any) {
                lastError = error;
                lastResult = {
                    success: false,
                    error: error.message,
                    code: ErrorCode.INTERNAL_ERROR,
                    isRetryable: isRetryableError(error),
                };

                // Check if we should retry
                if (attempt < this.retryConfig.maxRetries && isRetryableError(error, lastResult)) {
                    const delay = calculateRetryDelay(attempt, this.retryConfig);
                    console.log(
                        `[ToolExecutor] Tool ${call.toolName} threw retryable error. Retrying in ${delay}ms...`,
                        error.message
                    );
                    await sleep(delay);
                    continue;
                }

                // Not retryable or max retries reached
                return {
                    stepId,
                    toolName: call.toolName,
                    result: lastResult,
                    status: 'error',
                    error: error.message || 'Tool execution failed',
                };
            }
        }

        // All retries exhausted
        return {
            stepId,
            toolName: call.toolName,
            result: lastResult,
            status: 'error',
            error: lastError?.message || lastResult?.error || 'Tool execution failed after retries',
        };
    }

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

                const result = await this.executeToolWithRetry(
                    call,
                    chatMessages,
                    context,
                    step.id,
                    onToolFinish
                );

                if (onToolFinish) onToolFinish(result);
                return result;
            });

            // Run all tools in this step in parallel
            const stepResults = await Promise.all(stepPromises);

            // Aggregate results
            stepResults.forEach(r => {
                if (r.status === 'success') {
                    aggregatedResults[r.toolName] = r.result;
                } else {
                    // Include failed tools so the reasoning engine knows they failed
                    aggregatedResults[r.toolName] = {
                        success: false,
                        error: r.error || 'Tool execution failed',
                        isSystemError: true
                    };
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
