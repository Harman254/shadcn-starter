/**
 * @fileOverview
 * Enhanced Tool Orchestrator with Concurrency Limits, Progress Tracking, and Streaming
 * Optimized for 20+ tool calls with smooth UX
 */

import { ToolOrchestrator, ToolCall, OrchestrationContext, OrchestrationResult, ToolDefinition } from './tool-orchestrator';
import { ProgressTracker, ProgressEvent } from './progress-tracker';

export interface EnhancedOrchestrationOptions {
  maxConcurrency?: number; // Max parallel tools per phase (default: 5)
  enableProgressTracking?: boolean; // Enable real-time progress updates
  enableStreaming?: boolean; // Stream results as tools complete
  enableCancellation?: boolean; // Allow cancellation
  priorityQueue?: boolean; // Use priority-based execution
  memoryLimit?: number; // Max memory per tool result (MB)
}

export interface EnhancedOrchestrationResult extends OrchestrationResult {
  progress?: {
    overallProgress: number;
    completedTools: number;
    totalTools: number;
    estimatedTimeRemaining?: number;
  };
  streamingResults?: Record<string, any>; // Partial results as tools complete
}

export class EnhancedToolOrchestrator extends ToolOrchestrator {
  private maxConcurrency: number;
  private progressTracker?: ProgressTracker;
  private enableStreaming: boolean;
  private enableCancellation: boolean;
  private cancellationToken: { cancelled: boolean } = { cancelled: false };
  private memoryLimit: number;
  private activePromises: Map<string, Promise<any>> = new Map();

  constructor(options: EnhancedOrchestrationOptions = {}) {
    super();
    this.maxConcurrency = options.maxConcurrency || 5;
    this.enableStreaming = options.enableStreaming ?? true;
    this.enableCancellation = options.enableCancellation ?? true;
    this.memoryLimit = (options.memoryLimit || 50) * 1024 * 1024; // Convert MB to bytes
  }

  /**
   * Execute tools with enhanced features
   */
  async executeTools(
    toolCalls: Array<{ toolName: string; input: any; priority?: number }>,
    context: OrchestrationContext,
    options: EnhancedOrchestrationOptions = {}
  ): Promise<EnhancedOrchestrationResult> {
    // Initialize progress tracker if enabled
    if (options.enableProgressTracking !== false) {
      const executionPhases = this.estimatePhases(toolCalls, context);
      this.progressTracker = new ProgressTracker(toolCalls.length, executionPhases);
      
      // Set up progress event forwarding
      if (context.onProgress) {
        this.progressTracker.on('execution-update', (event: ProgressEvent) => {
          context.onProgress?.(event);
        });
      }
    }

    // Reset cancellation token
    this.cancellationToken = { cancelled: false };

    // Sort by priority if priority queue is enabled
    if (options.priorityQueue) {
      toolCalls.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    }

    const startTime = Date.now();
    const calls: ToolCall[] = toolCalls.map((call, index) => ({
      id: `tool-${Date.now()}-${index}`,
      toolName: call.toolName,
      input: call.input,
      status: 'pending' as const,
    }));

    // Initialize progress tracking
    calls.forEach(call => {
      this.progressTracker?.initializeTool(call.id, call.toolName);
    });

    // Build dependency graph
    const dependencyGraph = this.buildDependencyGraph(calls, context);
    const executionPhases = this.topologicalSort(dependencyGraph);

    // Execute with concurrency limits
    const results: Record<string, any> = {};
    const errors: Record<string, Error> = {};
    const streamingResults: Record<string, any> = {};

    for (let phaseIndex = 0; phaseIndex < executionPhases.length; phaseIndex++) {
      const phase = executionPhases[phaseIndex];
      
      if (this.cancellationToken.cancelled) {
        break;
      }

      this.progressTracker?.startPhase(phaseIndex + 1);

      // Execute phase with concurrency limit
      await this.executePhaseWithConcurrency(
        phase,
        calls,
        context,
        results,
        errors,
        streamingResults
      );
    }

    // Complete progress tracking
    this.progressTracker?.complete();

    // Aggregate results
    const aggregatedData = this.aggregateResults(results, context);

    return {
      success: Object.keys(errors).length === 0,
      results,
      aggregatedData,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
      executionTime: Date.now() - startTime,
      toolCalls: calls,
      progress: this.progressTracker ? {
        overallProgress: this.progressTracker.getProgress().overallProgress,
        completedTools: this.progressTracker.getProgress().completedTools,
        totalTools: this.progressTracker.getProgress().totalTools,
        estimatedTimeRemaining: this.progressTracker.getProgress().estimatedTimeRemaining,
      } : undefined,
      streamingResults: this.enableStreaming ? streamingResults : undefined,
    };
  }

  /**
   * Execute a phase with concurrency limits
   */
  private async executePhaseWithConcurrency(
    phase: string[],
    calls: ToolCall[],
    context: OrchestrationContext,
    results: Record<string, any>,
    errors: Record<string, Error>,
    streamingResults: Record<string, any>
  ): Promise<void> {
    // Process in batches to respect concurrency limit
    for (let i = 0; i < phase.length; i += this.maxConcurrency) {
      const batch = phase.slice(i, i + this.maxConcurrency);
      
      const batchPromises = batch.map(async (callId) => {
        if (this.cancellationToken.cancelled) {
          return;
        }

        const call = calls.find(c => c.id === callId)!;
        const tool = this.tools.get(call.toolName);

        if (!tool) {
          call.status = 'failed';
          call.error = new Error(`Tool ${call.toolName} not found`);
          errors[call.toolName] = call.error;
          this.progressTracker?.failTool(callId, call.error);
          return;
        }

        // Check if tool should execute
        if (tool.shouldExecute && !tool.shouldExecute(call.input, context)) {
          call.status = 'skipped';
          this.progressTracker?.skipTool(callId);
          return;
        }

        // Check cache
        if (tool.cacheKey) {
          const cacheKey = tool.cacheKey(call.input, context);
          const cached = this.cache.get(cacheKey);
          if (cached && Date.now() - cached.timestamp < cached.ttl) {
            call.status = 'completed';
            call.result = cached.result;
            results[call.toolName] = cached.result;
            streamingResults[call.toolName] = cached.result;
            this.progressTracker?.completeTool(callId);
            return;
          }
        }

        // Validate input
        if (tool.validateInput && !tool.validateInput(call.input)) {
          call.status = 'failed';
          call.error = new Error(`Invalid input for tool ${call.toolName}`);
          errors[call.toolName] = call.error;
          this.progressTracker?.failTool(callId, call.error);
          return;
        }

        // Execute tool
        call.status = 'running';
        call.startedAt = new Date();
        this.progressTracker?.startTool(callId);

        try {
          // Check memory before execution
          this.checkMemoryLimit(call.toolName);

          // Execute with progress updates
          const executionPromise = this.executeToolWithProgress(
            tool,
            call,
            context,
            results
          );

          // Store promise for cancellation
          this.activePromises.set(callId, executionPromise);

          const result = await executionPromise;

          // Check result size
          const resultSize = this.estimateSize(result);
          if (resultSize > this.memoryLimit) {
            throw new Error(`Tool result exceeds memory limit (${this.memoryLimit / 1024 / 1024}MB)`);
          }

          call.status = 'completed';
          call.result = result;
          call.completedAt = new Date();
          results[call.toolName] = result;
          streamingResults[call.toolName] = result;

          // Cache result
          if (tool.cacheKey) {
            const cacheKey = tool.cacheKey(call.input, context);
            this.cache.set(cacheKey, {
              result,
              timestamp: Date.now(),
              ttl: 5 * 60 * 1000,
            });
          }

          this.progressTracker?.completeTool(callId);
        } catch (error) {
          call.status = 'failed';
          call.error = error instanceof Error ? error : new Error(String(error));
          call.completedAt = new Date();

          // Try fallback
          if (tool.onError) {
            try {
              const fallbackResult = await tool.onError(call.error, call.input, context);
              call.status = 'completed';
              call.result = fallbackResult;
              results[call.toolName] = fallbackResult;
              this.progressTracker?.completeTool(callId, 'Completed with fallback');
            } catch (fallbackError) {
              errors[call.toolName] = call.error;
              this.progressTracker?.failTool(callId, call.error);
            }
          } else {
            errors[call.toolName] = call.error;
            this.progressTracker?.failTool(callId, call.error);
          }
        } finally {
          this.activePromises.delete(callId);
        }
      });

      await Promise.all(batchPromises);
    }
  }

  /**
   * Execute tool with progress updates
   */
  private async executeToolWithProgress(
    tool: ToolDefinition,
    call: ToolCall,
    context: OrchestrationContext,
    previousResults: Record<string, any>
  ): Promise<any> {
    const executionPromise = tool.execute(call.input, {
      ...context,
      previousResults,
    });

    // Update progress periodically if tool takes time
    const progressInterval = setInterval(() => {
      if (call.status === 'running' && call.startedAt) {
        const elapsed = Date.now() - call.startedAt.getTime();
        const estimatedDuration = 5000; // Default estimate
        const progress = Math.min(90, (elapsed / estimatedDuration) * 100);
        this.progressTracker?.setToolProgress(call.id, progress);
      }
    }, 500);

    try {
      const result = tool.timeout
        ? await Promise.race([
            executionPromise,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error(`Tool ${call.toolName} timed out`)), tool.timeout)
            ),
          ])
        : await executionPromise;

      clearInterval(progressInterval);
      return result;
    } catch (error) {
      clearInterval(progressInterval);
      throw error;
    }
  }

  /**
   * Cancel ongoing execution
   */
  cancel(): void {
    this.cancellationToken.cancelled = true;
    // Note: Active promises will continue but results will be ignored
  }

  /**
   * Estimate number of phases
   */
  private estimatePhases(
    toolCalls: Array<{ toolName: string; input: any }>,
    context: OrchestrationContext
  ): number {
    // Simple heuristic: count tools with dependencies
    let phases = 1;
    toolCalls.forEach(call => {
      const tool = this.tools.get(call.toolName);
      if (tool?.getDependencies) {
        const deps = tool.getDependencies(call.input, context);
        if (deps.length > 0) {
          phases = Math.max(phases, 2);
        }
      }
    });
    return phases;
  }

  /**
   * Check memory limit
   */
  private checkMemoryLimit(toolName: string): void {
    // Simple memory check - in production, use actual memory monitoring
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      const heapUsedMB = usage.heapUsed / 1024 / 1024;
      if (heapUsedMB > 500) { // 500MB threshold
        console.warn(`[EnhancedOrchestrator] High memory usage: ${heapUsedMB.toFixed(2)}MB`);
      }
    }
  }

  /**
   * Estimate object size in bytes
   */
  private estimateSize(obj: any): number {
    return JSON.stringify(obj).length * 2; // Rough estimate (UTF-16)
  }
}

// Extend OrchestrationContext to support progress callbacks
declare module './tool-orchestrator' {
  interface OrchestrationContext {
    onProgress?: (event: ProgressEvent) => void;
  }
}
