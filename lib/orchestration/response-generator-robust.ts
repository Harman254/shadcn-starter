/**
 * @fileOverview
 * Robust Response Generator - Creates natural, user-friendly responses from orchestration results
 * Handles partial results, errors, and maintains conversational context
 */

import { RobustOrchestrationResult } from './robust-orchestrator';
import { OrchestrationContext } from './tool-orchestrator';

export interface ResponseGenerationOptions {
  includePartialResults?: boolean; // Mention partial results in response
  explainLimitations?: boolean; // Explain data limitations transparently
  maintainContext?: boolean; // Reference previous conversation context
  tone?: 'friendly' | 'professional' | 'casual'; // Response tone
}

/**
 * Generate a natural language response from orchestration results
 */
export function generateRobustResponse(
  result: RobustOrchestrationResult,
  context: OrchestrationContext,
  options: ResponseGenerationOptions = {}
): string {
  const {
    includePartialResults = true,
    explainLimitations = true,
    maintainContext = true,
    tone = 'friendly',
  } = options;

  let response = '';

  // Start with success message if all tools succeeded
  if (result.success && result.results) {
    response = generateSuccessResponse(result, context, tone);
  } else {
    // Handle partial success or failures
    response = generatePartialOrFailureResponse(result, context, {
      includePartialResults,
      explainLimitations,
      tone,
    });
  }

  // Add context references if enabled
  if (maintainContext && result.contextState) {
    const contextNote = generateContextNote(result.contextState, context);
    if (contextNote) {
      response += ' ' + contextNote;
    }
  }

  return response.trim();
}

/**
 * Generate response for successful execution
 */
function generateSuccessResponse(
  result: RobustOrchestrationResult,
  context: OrchestrationContext,
  tone: string
): string {
  const toolCount = Object.keys(result.results || {}).length;
  
  if (tone === 'friendly') {
    if (toolCount === 1) {
      return 'Perfect! I\'ve got that information for you.';
    } else {
      return `Great! I've gathered all the information you need.`;
    }
  } else if (tone === 'professional') {
    return `I've successfully completed ${toolCount} ${toolCount === 1 ? 'task' : 'tasks'}.`;
  } else {
    return `Done! Got everything you need.`;
  }
}

/**
 * Generate response for partial success or failures
 */
function generatePartialOrFailureResponse(
  result: RobustOrchestrationResult,
  context: OrchestrationContext,
  options: {
    includePartialResults: boolean;
    explainLimitations: boolean;
    tone: string;
  }
): string {
  const { includePartialResults, explainLimitations, tone } = options;
  
  const successfulTools = Object.keys(result.partialResults || {});
  const failedTools = result.failedTools || [];
  const usedCached = result.usedCachedData || [];
  const usedStale = result.usedStaleData || [];

  let response = '';

  // Mention successful results
  if (successfulTools.length > 0 && includePartialResults) {
    if (tone === 'friendly') {
      response += `I've got some information for you`;
      if (successfulTools.length === 1) {
        response += ` from ${successfulTools[0]}`;
      }
      response += '.';
    } else {
      response += `Successfully retrieved data from ${successfulTools.length} ${successfulTools.length === 1 ? 'source' : 'sources'}.`;
    }
  }

  // Explain limitations transparently
  if (explainLimitations) {
    // Mention cached data usage
    if (usedCached.length > 0) {
      response += ` ${tone === 'friendly' ? 'I used cached data' : 'Using cached data'} for ${usedCached.join(', ')}`;
      if (tone === 'friendly') {
        response += ' to give you a quick response';
      }
      response += '.';
    }

    // Mention stale data usage
    if (usedStale.length > 0) {
      response += ` ${tone === 'friendly' ? 'Note: Some information' : 'Warning: Some data'} (${usedStale.join(', ')}) may be slightly outdated`;
      if (tone === 'friendly') {
        response += ', but it should still be useful';
      }
      response += '.';
    }

    // Mention failures with user-friendly messages
    if (failedTools.length > 0) {
      if (successfulTools.length > 0) {
        response += ` However,`;
      } else {
        response += ` Unfortunately,`;
      }

      if (tone === 'friendly') {
        response += ` I wasn't able to get information from ${failedTools.length === 1 ? 'one source' : 'some sources'}`;
      } else {
        response += ` Failed to retrieve data from ${failedTools.join(', ')}.`;
      }

      // Add user-friendly error explanations
      if (result.userFriendlyErrors) {
        const errorMessages = failedTools
          .map(tool => result.userFriendlyErrors![tool])
          .filter(Boolean);
        
        if (errorMessages.length > 0 && errorMessages.length <= 2) {
          response += ` ${errorMessages.join(' ')}`;
        } else if (errorMessages.length > 0) {
          response += ` ${errorMessages[0]}`;
        }
      }
    }
  }

  // Offer alternatives if everything failed
  if (successfulTools.length === 0 && failedTools.length > 0) {
    response += ` ${tone === 'friendly' ? 'Would you like to try again, or would you prefer a different approach?' : 'Please try again or contact support if the issue persists.'}`;
  }

  return response.trim();
}

/**
 * Generate context-aware note referencing previous conversation
 */
function generateContextNote(
  contextState: any,
  context: OrchestrationContext
): string {
  const previousToolCount = Object.keys(contextState.previousResults || {}).length;
  
  if (previousToolCount > 0) {
    return `I'm building on the information from our previous conversation.`;
  }
  
  return '';
}

/**
 * Generate a summary of what was accomplished
 */
export function generateResultSummary(result: RobustOrchestrationResult): string {
  const parts: string[] = [];

  if (result.results) {
    const toolNames = Object.keys(result.results);
    parts.push(`Completed: ${toolNames.join(', ')}`);
  }

  if (result.failedTools && result.failedTools.length > 0) {
    parts.push(`Failed: ${result.failedTools.join(', ')}`);
  }

  if (result.usedCachedData && result.usedCachedData.length > 0) {
    parts.push(`Cached: ${result.usedCachedData.join(', ')}`);
  }

  if (result.retryAttempts) {
    const retryInfo = Object.entries(result.retryAttempts)
      .map(([tool, attempts]) => `${tool} (${attempts} retries)`)
      .join(', ');
    parts.push(`Retries: ${retryInfo}`);
  }

  return parts.join(' | ');
}

