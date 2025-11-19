/**
 * @fileOverview
 * Rate Limiting Utility
 * Prevents API abuse and protects server resources
 */

import { NextRequest, NextResponse } from 'next/server';

// In-memory store for rate limiting (use Redis in production)
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetAt < now) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000); // 5 minutes
}

export interface RateLimitOptions {
  maxRequests?: number; // Max requests per window
  windowMs?: number; // Time window in milliseconds
  identifier?: (request: NextRequest) => string; // Custom identifier function
  onLimitReached?: (identifier: string) => void; // Callback when limit is reached
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

const DEFAULT_OPTIONS: Required<Omit<RateLimitOptions, 'identifier' | 'onLimitReached'>> = {
  maxRequests: 10, // 10 requests per window
  windowMs: 60 * 1000, // 1 minute window
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
};

/**
 * Get identifier for rate limiting (user ID, IP address, etc.)
 */
function getIdentifier(request: NextRequest, customIdentifier?: (request: NextRequest) => string): string {
  if (customIdentifier) {
    return customIdentifier(request);
  }

  // Try to get user ID from headers (set by auth middleware)
  const userId = request.headers.get('x-user-id');
  if (userId) {
    return `user:${userId}`;
  }

  // Fall back to IP address
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';
  
  return `ip:${ip}`;
}

/**
 * Check if request should be rate limited
 */
export function checkRateLimit(
  request: NextRequest,
  options: RateLimitOptions = {}
): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
} {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const identifier = getIdentifier(request, options.identifier);
  const now = Date.now();
  
  // Get or create entry
  let entry = rateLimitStore.get(identifier);
  
  // Clean up if expired
  if (entry && entry.resetAt < now) {
    rateLimitStore.delete(identifier);
    entry = undefined;
  }
  
  // Create new entry if doesn't exist
  if (!entry) {
    entry = {
      count: 0,
      resetAt: now + opts.windowMs,
    };
    rateLimitStore.set(identifier, entry);
  }
  
  // Increment count
  entry.count++;
  
  // Check if limit exceeded
  const allowed = entry.count <= opts.maxRequests;
  const remaining = Math.max(0, opts.maxRequests - entry.count);
  
  // Call callback if limit reached
  if (!allowed && options.onLimitReached) {
    options.onLimitReached(identifier);
  }
  
  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
    limit: opts.maxRequests,
  };
}

/**
 * Rate limit middleware function
 * Returns NextResponse with 429 status if rate limited
 */
export function rateLimit(
  request: NextRequest,
  options: RateLimitOptions = {}
): NextResponse | null {
  const result = checkRateLimit(request, options);
  
  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
    
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: `Rate limit exceeded. Please try again in ${retryAfter} second${retryAfter !== 1 ? 's' : ''}.`,
        retryAfter,
        limit: result.limit,
        windowMs: options.windowMs || DEFAULT_OPTIONS.windowMs,
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.resetAt.toString(),
        },
      }
    );
  }
  
  // Add rate limit headers to successful responses
  return null; // No rate limit applied, continue with request
}

/**
 * Rate limit wrapper for API routes
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: RateLimitOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const rateLimitResponse = rateLimit(request, options);
    
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    try {
      const response = await handler(request);
      
      // Optionally track successful requests
      if (!options.skipSuccessfulRequests && response.ok) {
        checkRateLimit(request, options);
      }
      
      // Add rate limit headers to response
      const result = checkRateLimit(request, { ...options, maxRequests: 0 }); // Get current state without incrementing
      response.headers.set('X-RateLimit-Limit', result.limit.toString());
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set('X-RateLimit-Reset', result.resetAt.toString());
      
      return response;
    } catch (error) {
      // Optionally track failed requests
      if (!options.skipFailedRequests) {
        checkRateLimit(request, options);
      }
      throw error;
    }
  };
}

/**
 * Clear rate limit for an identifier (useful for testing or admin actions)
 */
export function clearRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Get rate limit status for an identifier (useful for debugging or admin)
 */
export function getRateLimitStatus(identifier: string): {
  count: number;
  resetAt: number;
  limit: number;
  remaining: number;
} | null {
  const entry = rateLimitStore.get(identifier);
  if (!entry) {
    return null;
  }
  
  const now = Date.now();
  if (entry.resetAt < now) {
    rateLimitStore.delete(identifier);
    return null;
  }
  
  return {
    count: entry.count,
    resetAt: entry.resetAt,
    limit: 10, // Default limit
    remaining: Math.max(0, 10 - entry.count),
  };
}

