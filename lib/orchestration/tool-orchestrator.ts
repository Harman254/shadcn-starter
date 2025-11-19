/**
 * @fileOverview
 * Modular Tool Orchestrator - Manages multiple tool calls and aggregates responses
 * Similar to Perplexity AI's multi-tool conversational system
 * 
 * Features:
 * - Parallel and sequential tool execution
 * - Dependency management between tools
 * - Result aggregation and merging
 * - Error handling with fallbacks
 * - Progress tracking for UI feedback
 */

import { z } from 'zod';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ToolStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export interface ToolCall {
  id: string;
  toolName: string;
  input: any;
  status: ToolStatus;
  result?: any;
  error?: Error;
  startedAt?: Date;
  completedAt?: Date;
  dependencies?: string[]; // IDs of tools that must complete first
}

export interface OrchestrationContext {
  userId?: string;
  sessionId?: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  userPreferences?: any;
  locationData?: any;
  previousResults?: Record<string, any>; // Results from previous tool calls in this session
}

export interface OrchestrationResult {
  success: boolean;
  results: Record<string, any>; // Tool name -> result
  aggregatedData?: any; // Merged/aggregated data from all tools
  errors?: Record<string, Error>; // Tool name -> error
  executionTime: number;
  toolCalls: ToolCall[];
}

export interface ToolDefinition {
  name: string;
  execute: (input: any, context: OrchestrationContext) => Promise<any>;
  validateInput?: (input: any) => boolean;
  getDependencies?: (input: any, context: OrchestrationContext) => string[];
  shouldExecute?: (input: any, context: OrchestrationContext) => boolean;
  onError?: (error: Error, input: any, context: OrchestrationContext) => Promise<any>; // Fallback handler
  cacheKey?: (input: any, context: OrchestrationContext) => string; // For caching
  timeout?: number; // Max execution time in ms
}

// ============================================================================
// TOOL ORCHESTRATOR CLASS
// ============================================================================

export class ToolOrchestrator {
  protected tools: Map<string, ToolDefinition> = new Map();
  private executionHistory: ToolCall[] = [];
  protected cache: Map<string, { result: any; timestamp: number; ttl: number }> = new Map();

  /**
   * Register a tool definition
   */
  registerTool(tool: ToolDefinition): void {
    this.tools.set(tool.name, tool);
  }

  /**
   * Register multiple tools at once
   */
  registerTools(tools: ToolDefinition[]): void {
    tools.forEach(tool => this.registerTool(tool));
  }

  /**
   * Execute multiple tools with dependency management
   * Supports both parallel and sequential execution based on dependencies
   */
  async executeTools(
    toolCalls: Array<{ toolName: string; input: any }>,
    context: OrchestrationContext
  ): Promise<OrchestrationResult> {
    const startTime = Date.now();
    const calls: ToolCall[] = toolCalls.map((call, index) => ({
      id: `tool-${Date.now()}-${index}`,
      toolName: call.toolName,
      input: call.input,
      status: 'pending' as ToolStatus,
    }));

    // Build dependency graph
    const dependencyGraph = this.buildDependencyGraph(calls, context);
    
    // Execute tools respecting dependencies
    const results: Record<string, any> = {};
    const errors: Record<string, Error> = {};

    // Execute in phases (levels of dependency)
    const executionPhases = this.topologicalSort(dependencyGraph);

    for (const phase of executionPhases) {
      // Execute all tools in this phase in parallel
      const phasePromises = phase.map(async (callId) => {
        const call = calls.find(c => c.id === callId)!;
        const tool = this.tools.get(call.toolName);

        if (!tool) {
          call.status = 'failed';
          call.error = new Error(`Tool ${call.toolName} not found`);
          errors[call.toolName] = call.error;
          return;
        }

        // Check if tool should execute
        if (tool.shouldExecute && !tool.shouldExecute(call.input, context)) {
          call.status = 'skipped';
          return;
        }

        // Check cache first
        if (tool.cacheKey) {
          const cacheKey = tool.cacheKey(call.input, context);
          const cached = this.cache.get(cacheKey);
          if (cached && Date.now() - cached.timestamp < cached.ttl) {
            call.status = 'completed';
            call.result = cached.result;
            results[call.toolName] = cached.result;
            return;
          }
        }

        // Validate input
        if (tool.validateInput && !tool.validateInput(call.input)) {
          call.status = 'failed';
          call.error = new Error(`Invalid input for tool ${call.toolName}`);
          errors[call.toolName] = call.error;
          return;
        }

        // Execute tool
        call.status = 'running';
        call.startedAt = new Date();

        try {
          // Set timeout if specified
          const executionPromise = tool.execute(call.input, {
            ...context,
            previousResults: results, // Pass results from previous tools
          });

          const result = tool.timeout
            ? await Promise.race([
                executionPromise,
                new Promise((_, reject) =>
                  setTimeout(() => reject(new Error(`Tool ${call.toolName} timed out`)), tool.timeout)
                ),
              ])
            : await executionPromise;

          call.status = 'completed';
          call.result = result;
          call.completedAt = new Date();
          results[call.toolName] = result;

          // Cache result if cache key is provided
          if (tool.cacheKey) {
            const cacheKey = tool.cacheKey(call.input, context);
            this.cache.set(cacheKey, {
              result,
              timestamp: Date.now(),
              ttl: 5 * 60 * 1000, // 5 minutes default TTL
            });
          }
        } catch (error) {
          call.status = 'failed';
          call.error = error instanceof Error ? error : new Error(String(error));
          call.completedAt = new Date();

          // Try fallback handler
          if (tool.onError) {
            try {
              const fallbackResult = await tool.onError(call.error, call.input, context);
              call.status = 'completed';
              call.result = fallbackResult;
              results[call.toolName] = fallbackResult;
            } catch (fallbackError) {
              errors[call.toolName] = call.error;
            }
          } else {
            errors[call.toolName] = call.error;
          }
        }
      });

      await Promise.all(phasePromises);
    }

    // Aggregate results
    const aggregatedData = this.aggregateResults(results, context);

    this.executionHistory.push(...calls);

    return {
      success: Object.keys(errors).length === 0,
      results,
      aggregatedData,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
      executionTime: Date.now() - startTime,
      toolCalls: calls,
    };
  }

  /**
   * Build dependency graph from tool calls
   */
  protected buildDependencyGraph(
    calls: ToolCall[],
    context: OrchestrationContext
  ): Map<string, string[]> {
    const graph = new Map<string, string[]>();

    calls.forEach(call => {
      const tool = this.tools.get(call.toolName);
      if (tool?.getDependencies) {
        const deps = tool.getDependencies(call.input, context);
        // Convert tool names to call IDs
        const depIds = deps
          .map(depName => calls.find(c => c.toolName === depName)?.id)
          .filter(Boolean) as string[];
        graph.set(call.id, depIds);
      } else {
        graph.set(call.id, []);
      }
    });

    return graph;
  }

  /**
   * Topological sort for dependency resolution
   * Returns array of phases, where each phase can be executed in parallel
   */
  protected topologicalSort(graph: Map<string, string[]>): string[][] {
    const phases: string[][] = [];
    const inDegree = new Map<string, number>();
    const nodes = Array.from(graph.keys());

    // Initialize in-degree
    nodes.forEach(node => {
      inDegree.set(node, 0);
    });

    // Calculate in-degrees
    graph.forEach((deps, node) => {
      deps.forEach(dep => {
        inDegree.set(dep, (inDegree.get(dep) || 0) + 1);
      });
    });

    // Process nodes level by level
    while (nodes.length > 0) {
      const currentPhase: string[] = [];

      // Find all nodes with in-degree 0
      nodes.forEach(node => {
        if ((inDegree.get(node) || 0) === 0) {
          currentPhase.push(node);
        }
      });

      if (currentPhase.length === 0) {
        // Circular dependency detected - add remaining nodes
        phases.push([...nodes]);
        break;
      }

      phases.push(currentPhase);

      // Remove processed nodes and update in-degrees
      currentPhase.forEach(node => {
        const index = nodes.indexOf(node);
        if (index > -1) {
          nodes.splice(index, 1);
        }

        graph.get(node)?.forEach(dep => {
          inDegree.set(dep, (inDegree.get(dep) || 0) - 1);
        });
      });
    }

    return phases;
  }

  /**
   * Aggregate results from multiple tools into a unified structure
   */
  protected aggregateResults(
    results: Record<string, any>,
    context: OrchestrationContext
  ): any {
    // Default aggregation: merge all results
    // Can be customized per use case
    return {
      ...results,
      _metadata: {
        toolCount: Object.keys(results).length,
        aggregatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Clear cache for a specific tool or all tools
   */
  clearCache(toolName?: string): void {
    if (toolName) {
      // Clear cache entries for specific tool
      const keysToDelete: string[] = [];
      this.cache.forEach((_, key) => {
        if (key.startsWith(`${toolName}:`)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => this.cache.delete(key));
    } else {
      // Clear all cache
      this.cache.clear();
    }
  }

  /**
   * Get execution history
   */
  getHistory(): ToolCall[] {
    return [...this.executionHistory];
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let orchestratorInstance: ToolOrchestrator | null = null;

export function getOrchestrator(): ToolOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new ToolOrchestrator();
  }
  return orchestratorInstance;
}


