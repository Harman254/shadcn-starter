/**
 * @fileOverview
 * Tool Usage Tracking for AI Operations
 * Tracks token usage, costs, and provides analytics for Pro Plan billing
 */

import prisma from '@/lib/prisma';

// ============================================================================
// COST CALCULATION
// ============================================================================

/**
 * Gemini 2.0 Flash pricing (as of 2024)
 * These should be updated based on actual Google AI pricing
 */
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'gemini-2.0-flash': {
    input: 0.075 / 1_000_000,  // $0.075 per 1M input tokens
    output: 0.30 / 1_000_000,  // $0.30 per 1M output tokens
  },
  'gemini-2.0-flash-thinking': {
    input: 0.075 / 1_000_000,
    output: 0.30 / 1_000_000,
  },
  'gemini-1.5-pro': {
    input: 1.25 / 1_000_000,   // $1.25 per 1M input tokens
    output: 5.00 / 1_000_000,  // $5.00 per 1M output tokens
  },
  'default': {
    input: 0.075 / 1_000_000,  // Default to Flash pricing
    output: 0.30 / 1_000_000,
  },
};

export interface ToolUsageData {
  userId: string;
  toolName: string;
  inputTokens: number;
  outputTokens: number;
  model?: string;
  metadata?: Record<string, any>;
}

/**
 * Calculate estimated cost for a tool usage
 */
export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  model: string = 'gemini-2.0-flash'
): number {
  const pricing = MODEL_PRICING[model] || MODEL_PRICING['default'];
  
  const inputCost = inputTokens * pricing.input;
  const outputCost = outputTokens * pricing.output;
  
  return inputCost + outputCost;
}

/**
 * Track tool usage in database
 */
export async function trackToolUsage(data: ToolUsageData): Promise<void> {
  try {
    const totalTokens = data.inputTokens + data.outputTokens;
    const estimatedCost = calculateCost(
      data.inputTokens,
      data.outputTokens,
      data.model
    );

    await prisma.toolUsage.create({
      data: {
        userId: data.userId,
        toolName: data.toolName,
        inputTokens: data.inputTokens,
        outputTokens: data.outputTokens,
        totalTokens,
        estimatedCost,
        metadata: data.metadata || {},
      },
    });
  } catch (error) {
    // Don't fail the request if tracking fails
    console.error('[ToolUsageTracker] Failed to track usage:', error);
  }
}

/**
 * Get usage statistics for a user
 */
export async function getUserUsageStats(
  userId: string,
  period: 'day' | 'week' | 'month' = 'week'
): Promise<{
  totalCalls: number;
  totalTokens: number;
  totalCost: number;
  toolBreakdown: Array<{
    toolName: string;
    calls: number;
    tokens: number;
    cost: number;
  }>;
}> {
  const now = new Date();
  const startDate = new Date();

  switch (period) {
    case 'day':
      startDate.setDate(now.getDate() - 1);
      break;
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
  }

  const usage = await prisma.toolUsage.findMany({
    where: {
      userId,
      timestamp: {
        gte: startDate,
      },
    },
  });

  const toolBreakdown = usage.reduce((acc, entry) => {
    const existing = acc.find(t => t.toolName === entry.toolName);
    if (existing) {
      existing.calls += 1;
      existing.tokens += entry.totalTokens;
      existing.cost += entry.estimatedCost;
    } else {
      acc.push({
        toolName: entry.toolName,
        calls: 1,
        tokens: entry.totalTokens,
        cost: entry.estimatedCost,
      });
    }
    return acc;
  }, [] as Array<{ toolName: string; calls: number; tokens: number; cost: number }>);

  const totalCalls = usage.length;
  const totalTokens = usage.reduce((sum, entry) => sum + entry.totalTokens, 0);
  const totalCost = usage.reduce((sum, entry) => sum + entry.estimatedCost, 0);

  return {
    totalCalls,
    totalTokens,
    totalCost,
    toolBreakdown: toolBreakdown.sort((a, b) => b.cost - a.cost),
  };
}

/**
 * Get usage count for a specific tool in a period
 */
export async function getToolUsageCount(
  userId: string,
  toolName: string,
  period: 'day' | 'week' | 'month' = 'week'
): Promise<number> {
  const now = new Date();
  const startDate = new Date();

  switch (period) {
    case 'day':
      startDate.setDate(now.getDate() - 1);
      break;
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
  }

  const count = await prisma.toolUsage.count({
    where: {
      userId,
      toolName,
      timestamp: {
        gte: startDate,
      },
    },
  });

  return count;
}

/**
 * Extract token counts from AI SDK response
 * This is a helper to extract tokens from various response formats
 */
export function extractTokensFromResponse(response: any): {
  inputTokens: number;
  outputTokens: number;
} {
  // Handle different response formats
  if (response?.usage) {
    return {
      inputTokens: response.usage.promptTokens || 0,
      outputTokens: response.usage.completionTokens || 0,
    };
  }

  if (response?.response?.usage) {
    return {
      inputTokens: response.response.usage.promptTokens || 0,
      outputTokens: response.response.usage.completionTokens || 0,
    };
  }

  // Fallback: estimate based on content length (rough approximation)
  const inputEstimate = response?.prompt?.length 
    ? Math.ceil(response.prompt.length / 4) 
    : 0;
  const outputEstimate = response?.text?.length 
    ? Math.ceil(response.text.length / 4) 
    : 0;

  return {
    inputTokens: inputEstimate,
    outputTokens: outputEstimate,
  };
}

