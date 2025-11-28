export enum ErrorCode {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    UNAUTHORIZED = 'UNAUTHORIZED',
    GENERATION_FAILED = 'GENERATION_FAILED',
    INVALID_INPUT = 'INVALID_INPUT',
    MODIFICATION_FAILED = 'MODIFICATION_FAILED',
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

export function errorResponse(error: string, code: ErrorCode = ErrorCode.INTERNAL_ERROR, isRetryable: boolean = false): ToolResult<null> {
    return {
        success: false,
        error,
        code,
        isRetryable,
        message: error // Default user message to error string if not specified separately
    };
}
