/**
 * @fileOverview
 * Real-time Progress Tracker for Tool Execution
 * Provides event-based progress updates for smooth UI experience
 */

import { EventEmitter } from 'events';

export interface ToolProgress {
  toolId: string;
  toolName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  progress: number; // 0-100
  message?: string;
  phase?: number;
  totalPhases?: number;
  startedAt?: Date;
  estimatedTimeRemaining?: number; // milliseconds
}

export interface ExecutionProgress {
  totalTools: number;
  completedTools: number;
  failedTools: number;
  skippedTools: number;
  currentPhase: number;
  totalPhases: number;
  overallProgress: number; // 0-100
  tools: Map<string, ToolProgress>;
  startedAt: Date;
  estimatedTimeRemaining?: number;
}

export type ProgressEvent = 
  | { type: 'tool-started'; tool: ToolProgress }
  | { type: 'tool-progress'; tool: ToolProgress }
  | { type: 'tool-completed'; tool: ToolProgress }
  | { type: 'tool-failed'; tool: ToolProgress }
  | { type: 'phase-started'; phase: number; totalPhases: number }
  | { type: 'execution-complete'; progress: ExecutionProgress }
  | { type: 'execution-update'; progress: ExecutionProgress };

export class ProgressTracker extends EventEmitter {
  private progress: ExecutionProgress;
  private toolEstimates: Map<string, number> = new Map(); // Tool name -> estimated duration (ms)

  constructor(totalTools: number, totalPhases: number = 1) {
    super();
    this.progress = {
      totalTools,
      completedTools: 0,
      failedTools: 0,
      skippedTools: 0,
      currentPhase: 0,
      totalPhases,
      overallProgress: 0,
      tools: new Map(),
      startedAt: new Date(),
    };

    // Set default time estimates for common tools (in milliseconds)
    this.toolEstimates.set('generateMealPlan', 5000);
    this.toolEstimates.set('generateGroceryList', 3000);
    this.toolEstimates.set('analyzeNutrition', 2000);
    this.toolEstimates.set('getGroceryPricing', 4000);
    this.toolEstimates.set('saveMealPlan', 1000);
  }

  /**
   * Initialize tool tracking
   */
  initializeTool(toolId: string, toolName: string, phase: number = 1): void {
    const tool: ToolProgress = {
      toolId,
      toolName,
      status: 'pending',
      progress: 0,
      phase,
      totalPhases: this.progress.totalPhases,
    };

    this.progress.tools.set(toolId, tool);
    this.updateOverallProgress();
    this.emit('tool-started', { type: 'tool-started', tool });
  }

  /**
   * Update tool progress
   */
  updateTool(toolId: string, updates: Partial<ToolProgress>): void {
    const tool = this.progress.tools.get(toolId);
    if (!tool) return;

    const updatedTool: ToolProgress = {
      ...tool,
      ...updates,
    };

    this.progress.tools.set(toolId, updatedTool);
    this.updateOverallProgress();
    this.emit('tool-progress', { type: 'tool-progress', tool: updatedTool });
    this.emit('execution-update', { type: 'execution-update', progress: this.getProgress() });
  }

  /**
   * Mark tool as running
   */
  startTool(toolId: string, message?: string): void {
    const tool = this.progress.tools.get(toolId);
    if (!tool) return;

    this.updateTool(toolId, {
      status: 'running',
      progress: 10, // Start at 10% when running
      message: message || `Running ${tool.toolName}...`,
      startedAt: new Date(),
    });

    // Estimate completion time
    const estimatedDuration = this.toolEstimates.get(tool.toolName) || 5000;
    this.updateTool(toolId, {
      estimatedTimeRemaining: estimatedDuration,
    });
  }

  /**
   * Update tool progress percentage
   */
  setToolProgress(toolId: string, progress: number, message?: string): void {
    const tool = this.progress.tools.get(toolId);
    if (!tool || tool.status !== 'running') return;

    const estimatedDuration = this.toolEstimates.get(tool.toolName) || 5000;
    const elapsed = tool.startedAt ? Date.now() - tool.startedAt.getTime() : 0;
    const estimatedRemaining = Math.max(0, estimatedDuration - elapsed);

    this.updateTool(toolId, {
      progress: Math.min(100, Math.max(0, progress)),
      message,
      estimatedTimeRemaining: estimatedRemaining,
    });
  }

  /**
   * Mark tool as completed
   */
  completeTool(toolId: string, message?: string): void {
    const tool = this.progress.tools.get(toolId);
    if (!tool) return;

    this.progress.completedTools++;
    this.updateTool(toolId, {
      status: 'completed',
      progress: 100,
      message: message || `Completed ${tool.toolName}`,
      estimatedTimeRemaining: 0,
    });

    this.emit('tool-completed', { type: 'tool-completed', tool: this.progress.tools.get(toolId)! });
    this.updateOverallProgress();
  }

  /**
   * Mark tool as failed
   */
  failTool(toolId: string, error: Error | string): void {
    const tool = this.progress.tools.get(toolId);
    if (!tool) return;

    this.progress.failedTools++;
    this.updateTool(toolId, {
      status: 'failed',
      message: error instanceof Error ? error.message : error,
    });

    this.emit('tool-failed', { type: 'tool-failed', tool: this.progress.tools.get(toolId)! });
    this.updateOverallProgress();
  }

  /**
   * Mark tool as skipped
   */
  skipTool(toolId: string, reason?: string): void {
    const tool = this.progress.tools.get(toolId);
    if (!tool) return;

    this.progress.skippedTools++;
    this.updateTool(toolId, {
      status: 'skipped',
      message: reason || `Skipped ${tool.toolName}`,
    });
    this.updateOverallProgress();
  }

  /**
   * Start a new phase
   */
  startPhase(phase: number): void {
    this.progress.currentPhase = phase;
    this.emit('phase-started', {
      type: 'phase-started',
      phase,
      totalPhases: this.progress.totalPhases,
    });
    this.emit('execution-update', { type: 'execution-update', progress: this.getProgress() });
  }

  /**
   * Mark execution as complete
   */
  complete(): void {
    this.progress.overallProgress = 100;
    this.emit('execution-complete', { type: 'execution-complete', progress: this.getProgress() });
  }

  /**
   * Update overall progress calculation
   */
  private updateOverallProgress(): void {
    const total = this.progress.totalTools;
    const completed = this.progress.completedTools;
    const failed = this.progress.failedTools;
    const skipped = this.progress.skippedTools;
    
    // Calculate progress based on completed + failed + skipped
    const processed = completed + failed + skipped;
    const baseProgress = (processed / total) * 100;

    // Add weighted progress from running tools
    let runningProgress = 0;
    this.progress.tools.forEach(tool => {
      if (tool.status === 'running') {
        runningProgress += tool.progress / total;
      }
    });

    this.progress.overallProgress = Math.min(100, baseProgress + runningProgress);

    // Calculate estimated time remaining
    const elapsed = Date.now() - this.progress.startedAt.getTime();
    if (this.progress.overallProgress > 0) {
      const estimatedTotal = (elapsed / this.progress.overallProgress) * 100;
      this.progress.estimatedTimeRemaining = Math.max(0, estimatedTotal - elapsed);
    }
  }

  /**
   * Get current progress state
   */
  getProgress(): ExecutionProgress {
    return {
      ...this.progress,
      tools: new Map(this.progress.tools), // Return a copy
    };
  }

  /**
   * Set time estimate for a tool
   */
  setToolEstimate(toolName: string, durationMs: number): void {
    this.toolEstimates.set(toolName, durationMs);
  }
}

