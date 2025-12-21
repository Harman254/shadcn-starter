export enum ErrorCode {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    UNAUTHORIZED = 'UNAUTHORIZED',
    GENERATION_FAILED = 'GENERATION_FAILED',
    INVALID_INPUT = 'INVALID_INPUT',
    MODIFICATION_FAILED = 'MODIFICATION_FAILED',
    RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

export interface ToolResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    code?: ErrorCode;
    message?: string; // User-friendly message
    isRetryable?: boolean;
    metadata?: Record<string, any>;
}

export function successResponse<T>(data: T, message?: string, metadata?: Record<string, any>): ToolResult<T> {
    return {
        success: true,
        data,
        message,
        metadata
    };
}

/**
 * Create a user-friendly error response with actionable guidance
 */
export function errorResponse(
    error: string,
    code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    isRetryable: boolean = false,
    userMessage?: string,
    suggestions?: string[]
): ToolResult<null> {
    // Generate user-friendly message if not provided
    let friendlyMessage = userMessage || error;
    
    // Enhance message based on error code
    if (!userMessage) {
        switch (code) {
            case ErrorCode.RATE_LIMIT_EXCEEDED:
                friendlyMessage = error.includes('limit') ? error : `You've reached a usage limit. ${error} ${isRetryable ? 'I can retry automatically, or you can try again later.' : 'Please wait a bit before trying again, or consider upgrading for higher limits.'}`;
                break;
            case ErrorCode.VALIDATION_ERROR:
                friendlyMessage = error.includes('However') || error.includes('can') ? error : `There's an issue with your request: ${error}. Please check your input and try again.`;
                break;
            case ErrorCode.INTERNAL_ERROR:
                friendlyMessage = `Something went wrong on our end. ${isRetryable ? 'I\'ll retry automatically.' : 'Please try again in a moment. If the problem persists, contact support.'}`;
                break;
            case ErrorCode.UNAUTHORIZED:
                friendlyMessage = `You need to be signed in to use this feature. Please sign in and try again.`;
                break;
            case ErrorCode.RESOURCE_NOT_FOUND:
                friendlyMessage = `I couldn't find what you're looking for. ${error}`;
                break;
            case ErrorCode.GENERATION_FAILED:
                friendlyMessage = `I had trouble generating that. ${isRetryable ? 'I\'ll try again automatically.' : 'Please try again, or try rephrasing your request.'}`;
                break;
            default:
                friendlyMessage = error;
        }
    }
    
    // Add suggestions if provided
    if (suggestions && suggestions.length > 0) {
        friendlyMessage += `\n\nSuggestions:\n${suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
    }
    
    return {
        success: false,
        error,
        code,
        isRetryable,
        message: friendlyMessage,
        metadata: suggestions ? { suggestions } : undefined
    };
}
