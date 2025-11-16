/**
 * Retry utility for API calls with exponential backoff
 * Improves robustness by handling transient network failures
 */

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableStatuses?: number[];
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504], // Timeout, rate limit, server errors
};

/**
 * Retries a fetch call with exponential backoff
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  const config = { ...DEFAULT_OPTIONS, ...retryOptions };
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // If successful or non-retryable error, return immediately
      if (response.ok || !config.retryableStatuses.includes(response.status)) {
        return response;
      }
      
      // If last attempt, return the error response
      if (attempt === config.maxRetries) {
        return response;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.initialDelay * Math.pow(config.backoffMultiplier, attempt),
        config.maxDelay
      );
      
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[fetchWithRetry] Attempt ${attempt + 1}/${config.maxRetries + 1} failed with status ${response.status}. Retrying in ${delay}ms...`
        );
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // If last attempt, throw the error
      if (attempt === config.maxRetries) {
        throw lastError;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.initialDelay * Math.pow(config.backoffMultiplier, attempt),
        config.maxDelay
      );
      
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[fetchWithRetry] Attempt ${attempt + 1}/${config.maxRetries + 1} failed with error. Retrying in ${delay}ms...`,
          lastError.message
        );
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Failed after all retry attempts');
}

