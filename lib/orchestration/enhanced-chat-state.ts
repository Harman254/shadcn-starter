/**
 * @fileOverview
 * Enhanced Chat State Management for Iterative Interactions
 * Handles conversation refinements, context preservation, and state transitions
 */

import { z } from 'zod';

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

export const ConversationStateSchema = z.object({
  currentIntent: z.enum([
    'meal_planning',
    'nutrition_analysis',
    'grocery_shopping',
    'recipe_inquiry',
    'general_chat',
  ]).optional(),
  activeMealPlan: z.any().optional(),
  activeGroceryList: z.any().optional(),
  pendingRefinements: z.array(z.string()).default([]),
  conversationContext: z.record(z.any()).default({}),
});

export type ConversationState = z.infer<typeof ConversationStateSchema>;

export interface RefinementRequest {
  type: 'modify' | 'add' | 'remove' | 'replace';
  target: string; // e.g., 'meal', 'day', 'ingredient'
  value: any;
  originalValue?: any;
}

export interface ConversationSnapshot {
  state: ConversationState;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  timestamp: Date;
}

// ============================================================================
// ENHANCED CHAT STATE MANAGER
// ============================================================================

export class EnhancedChatStateManager {
  private state: ConversationState = {
    pendingRefinements: [],
    conversationContext: {},
  };
  private history: ConversationSnapshot[] = [];
  private maxHistorySize = 10;

  /**
   * Get current state
   */
  getState(): ConversationState {
    return { ...this.state };
  }

  /**
   * Update state
   */
  updateState(updates: Partial<ConversationState>): void {
    this.state = {
      ...this.state,
      ...updates,
    };
  }

  /**
   * Set active meal plan
   */
  setActiveMealPlan(mealPlan: any): void {
    this.updateState({
      activeMealPlan: mealPlan,
      currentIntent: 'meal_planning',
    });
  }

  /**
   * Set active grocery list
   */
  setActiveGroceryList(groceryList: any): void {
    this.updateState({
      activeGroceryList: groceryList,
      currentIntent: 'grocery_shopping',
    });
  }

  /**
   * Add refinement request
   */
  addRefinement(refinement: RefinementRequest): void {
    const refinementStr = JSON.stringify(refinement);
    this.updateState({
      pendingRefinements: [...this.state.pendingRefinements, refinementStr],
    });
  }

  /**
   * Clear pending refinements
   */
  clearRefinements(): void {
    this.updateState({
      pendingRefinements: [],
    });
  }

  /**
   * Apply refinements to meal plan
   */
  applyRefinementsToMealPlan(mealPlan: any): any {
    if (!this.state.activeMealPlan || this.state.pendingRefinements.length === 0) {
      return mealPlan;
    }

    let refinedPlan = { ...this.state.activeMealPlan };

    this.state.pendingRefinements.forEach(refinementStr => {
      try {
        const refinement: RefinementRequest = JSON.parse(refinementStr);
        refinedPlan = this.applyRefinement(refinedPlan, refinement);
      } catch (error) {
        console.warn('[ChatState] Failed to parse refinement:', error);
      }
    });

    this.clearRefinements();
    this.setActiveMealPlan(refinedPlan);

    return refinedPlan;
  }

  /**
   * Apply a single refinement
   */
  private applyRefinement(mealPlan: any, refinement: RefinementRequest): any {
    switch (refinement.type) {
      case 'modify':
        return this.modifyMealPlan(mealPlan, refinement);
      case 'add':
        return this.addToMealPlan(mealPlan, refinement);
      case 'remove':
        return this.removeFromMealPlan(mealPlan, refinement);
      case 'replace':
        return this.replaceInMealPlan(mealPlan, refinement);
      default:
        return mealPlan;
    }
  }

  /**
   * Modify meal plan
   */
  private modifyMealPlan(mealPlan: any, refinement: RefinementRequest): any {
    // Implementation depends on refinement.target
    // Example: modify a specific meal
    if (refinement.target.startsWith('meal:')) {
      const [_, dayIndex, mealIndex] = refinement.target.split(':');
      const day = mealPlan.days[parseInt(dayIndex)];
      if (day && day.meals[parseInt(mealIndex)]) {
        day.meals[parseInt(mealIndex)] = {
          ...day.meals[parseInt(mealIndex)],
          ...refinement.value,
        };
      }
    }
    return mealPlan;
  }

  /**
   * Add to meal plan
   */
  private addToMealPlan(mealPlan: any, refinement: RefinementRequest): any {
    if (refinement.target === 'meal') {
      // Add meal to a specific day
      const day = mealPlan.days.find((d: any) => d.day === refinement.value.day);
      if (day) {
        day.meals.push(refinement.value.meal);
      }
    }
    return mealPlan;
  }

  /**
   * Remove from meal plan
   */
  private removeFromMealPlan(mealPlan: any, refinement: RefinementRequest): any {
    if (refinement.target.startsWith('meal:')) {
      const [_, dayIndex, mealIndex] = refinement.target.split(':');
      const day = mealPlan.days[parseInt(dayIndex)];
      if (day && day.meals[parseInt(mealIndex)]) {
        day.meals.splice(parseInt(mealIndex), 1);
      }
    }
    return mealPlan;
  }

  /**
   * Replace in meal plan
   */
  private replaceInMealPlan(mealPlan: any, refinement: RefinementRequest): any {
    if (refinement.target.startsWith('meal:')) {
      const [_, dayIndex, mealIndex] = refinement.target.split(':');
      const day = mealPlan.days[parseInt(dayIndex)];
      if (day && day.meals[parseInt(mealIndex)]) {
        day.meals[parseInt(mealIndex)] = refinement.value;
      }
    }
    return mealPlan;
  }

  /**
   * Save snapshot to history
   */
  saveSnapshot(messages: Array<{ role: 'user' | 'assistant'; content: string }>): void {
    const snapshot: ConversationSnapshot = {
      state: { ...this.state },
      messages: [...messages],
      timestamp: new Date(),
    };

    this.history.push(snapshot);

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Restore state from snapshot
   */
  restoreSnapshot(index: number): boolean {
    if (index < 0 || index >= this.history.length) {
      return false;
    }

    const snapshot = this.history[index];
    this.state = { ...snapshot.state };
    return true;
  }

  /**
   * Get conversation context for AI
   */
  getConversationContext(): Record<string, any> {
    return {
      currentIntent: this.state.currentIntent,
      hasActiveMealPlan: !!this.state.activeMealPlan,
      hasActiveGroceryList: !!this.state.activeGroceryList,
      pendingRefinements: this.state.pendingRefinements.length,
      ...this.state.conversationContext,
    };
  }

  /**
   * Reset state
   */
  reset(): void {
    this.state = {
      pendingRefinements: [],
      conversationContext: {},
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let stateManagerInstance: EnhancedChatStateManager | null = null;

export function getChatStateManager(): EnhancedChatStateManager {
  if (!stateManagerInstance) {
    stateManagerInstance = new EnhancedChatStateManager();
  }
  return stateManagerInstance;
}


