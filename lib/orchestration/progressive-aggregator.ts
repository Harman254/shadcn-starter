/**
 * @fileOverview
 * Progressive Result Aggregator
 * Allows displaying partial results as tools complete
 */

// ============================================================================
// TYPES
// ============================================================================

export interface PartialResult {
  toolName: string;
  data: any;
  confidence: 'high' | 'medium' | 'low';
  isComplete: boolean;
  timestamp: number;
  executionTime?: number;
}

export type ResultListener = (results: Map<string, PartialResult>) => void;

// ============================================================================
// PROGRESSIVE AGGREGATOR
// ============================================================================

export class ProgressiveAggregator {
  private partialResults = new Map<string, PartialResult>();
  private listeners: ResultListener[] = [];
  private startTimes = new Map<string, number>();

  /**
   * Add or update a partial result
   */
  addPartialResult(
    toolName: string,
    data: any,
    isComplete: boolean = false,
    confidence: 'high' | 'medium' | 'low' = 'high'
  ): void {
    const startTime = this.startTimes.get(toolName) || Date.now();
    if (!this.startTimes.has(toolName)) {
      this.startTimes.set(toolName, startTime);
    }

    const executionTime = isComplete ? Date.now() - startTime : undefined;

    const result: PartialResult = {
      toolName,
      data,
      confidence: this.calculateConfidence(data, confidence),
      isComplete,
      timestamp: Date.now(),
      executionTime,
    };

    this.partialResults.set(toolName, result);
    this.notifyListeners();

    if (isComplete) {
      this.startTimes.delete(toolName);
    }
  }

  /**
   * Get all partial results
   */
  getResults(): Map<string, PartialResult> {
    return new Map(this.partialResults);
  }

  /**
   * Get completed results only
   */
  getCompletedResults(): Map<string, PartialResult> {
    const completed = new Map<string, PartialResult>();
    this.partialResults.forEach((result, toolName) => {
      if (result.isComplete) {
        completed.set(toolName, result);
      }
    });
    return completed;
  }

  /**
   * Get pending results (not yet complete)
   */
  getPendingResults(): Map<string, PartialResult> {
    const pending = new Map<string, PartialResult>();
    this.partialResults.forEach((result, toolName) => {
      if (!result.isComplete) {
        pending.set(toolName, result);
      }
    });
    return pending;
  }

  /**
   * Subscribe to result updates
   */
  subscribe(listener: ResultListener): () => void {
    this.listeners.push(listener);
    
    // Immediately notify with current results
    listener(this.getResults());

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of updates
   */
  private notifyListeners(): void {
    const results = this.getResults();
    this.listeners.forEach(listener => {
      try {
        listener(results);
      } catch (error) {
        console.error('[ProgressiveAggregator] Error in listener:', error);
      }
    });
  }

  /**
   * Calculate confidence based on data quality
   */
  private calculateConfidence(
    data: any,
    defaultConfidence: 'high' | 'medium' | 'low'
  ): 'high' | 'medium' | 'low' {
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
      return 'low';
    }

    // Check for error indicators
    if (data.error || data.success === false) {
      return 'low';
    }

    // Check data completeness
    if (typeof data === 'object') {
      const hasRequiredFields = data.items || data.results || data.data;
      if (!hasRequiredFields) {
        return 'medium';
      }
    }

    return defaultConfidence;
  }

  /**
   * Clear all results
   */
  clear(): void {
    this.partialResults.clear();
    this.startTimes.clear();
    this.notifyListeners();
  }

  /**
   * Clear completed results (keep pending)
   */
  clearCompleted(): void {
    const toDelete: string[] = [];
    this.partialResults.forEach((result, toolName) => {
      if (result.isComplete) {
        toDelete.push(toolName);
      }
    });
    toDelete.forEach(toolName => this.partialResults.delete(toolName));
    this.notifyListeners();
  }

  /**
   * Get summary statistics
   */
  getSummary(): {
    total: number;
    completed: number;
    pending: number;
    averageExecutionTime: number;
  } {
    const completed = this.getCompletedResults();
    const executionTimes = Array.from(completed.values())
      .map(r => r.executionTime)
      .filter((t): t is number => t !== undefined);

    return {
      total: this.partialResults.size,
      completed: completed.size,
      pending: this.partialResults.size - completed.size,
      averageExecutionTime: executionTimes.length > 0
        ? executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length
        : 0,
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let aggregatorInstance: ProgressiveAggregator | null = null;

export function getProgressiveAggregator(): ProgressiveAggregator {
  if (!aggregatorInstance) {
    aggregatorInstance = new ProgressiveAggregator();
  }
  return aggregatorInstance;
}


