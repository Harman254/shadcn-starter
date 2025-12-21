/**
 * Client-side context persistence utilities
 * Stores conversation context in localStorage/sessionStorage as backup
 * Syncs with database context on page load
 */

const CONTEXT_STORAGE_KEY = 'mealwise_conversation_context';
const CONTEXT_TTL = 30 * 60 * 1000; // 30 minutes

export interface ClientContext {
  mealPlanId?: string;
  groceryListId?: string;
  lastToolResult?: Record<string, any>;
  timestamp: number;
  sessionId?: string;
}

/**
 * Save context to localStorage
 */
export function saveContextToStorage(context: Partial<ClientContext>, sessionId?: string): void {
  try {
    if (typeof window === 'undefined') return;

    const contextData: ClientContext = {
      ...context,
      timestamp: Date.now(),
      sessionId: sessionId || context.sessionId,
    };

    localStorage.setItem(CONTEXT_STORAGE_KEY, JSON.stringify(contextData));
  } catch (error) {
    // Silently fail if localStorage is unavailable (e.g., private browsing)
    console.warn('[ContextPersistence] Failed to save to localStorage:', error);
  }
}

/**
 * Load context from localStorage
 */
export function loadContextFromStorage(sessionId?: string): Partial<ClientContext> | null {
  try {
    if (typeof window === 'undefined') return null;

    const stored = localStorage.getItem(CONTEXT_STORAGE_KEY);
    if (!stored) return null;

    const context: ClientContext = JSON.parse(stored);

    // Check if expired
    if (Date.now() - context.timestamp > CONTEXT_TTL) {
      localStorage.removeItem(CONTEXT_STORAGE_KEY);
      return null;
    }

    // Check if session matches (if provided)
    if (sessionId && context.sessionId && context.sessionId !== sessionId) {
      // Different session, clear old context
      localStorage.removeItem(CONTEXT_STORAGE_KEY);
      return null;
    }

    return context;
  } catch (error) {
    console.warn('[ContextPersistence] Failed to load from localStorage:', error);
    return null;
  }
}

/**
 * Clear context from localStorage
 */
export function clearContextFromStorage(): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(CONTEXT_STORAGE_KEY);
  } catch (error) {
    console.warn('[ContextPersistence] Failed to clear localStorage:', error);
  }
}

/**
 * Merge client-side context with server context
 * Client context takes precedence for immediate availability
 */
export function mergeContexts(
  clientContext: Partial<ClientContext> | null,
  serverContext: any
): any {
  if (!clientContext) return serverContext;
  if (!serverContext) return clientContext;

  // Merge, with client context taking precedence for freshness
  return {
    ...serverContext,
    mealPlanId: clientContext.mealPlanId || serverContext.mealPlanId,
    groceryListId: clientContext.groceryListId || serverContext.groceryListId,
    lastToolResult: clientContext.lastToolResult || serverContext.lastToolResult,
  };
}

