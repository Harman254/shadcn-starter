/**
 * @fileOverview
 * Centralized logging for tool execution debugging and monitoring
 * Tracks all tool calls, validation failures, and retry attempts
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface ToolExecutionLog {
    timestamp: Date;
    toolName: string;
    input: any;
    output?: any;
    error?: string;
    duration?: number;
    success: boolean;
}

interface ValidationLog {
    timestamp: Date;
    userMessage: string;
    expectedTools: string[];
    actualTools: string[];
    passed: boolean;
    reason?: string;
}

interface RetryLog {
    timestamp: Date;
    reason: string;
    attempt: number;
    toolsExpected: string[];
}

class ToolExecutionLogger {
    private isDevelopment = process.env.NODE_ENV === 'development';

    /**
     * Log a tool execution with input, output, and timing
     */
    logToolExecution(log: ToolExecutionLog): void {
        const logEntry = {
            type: 'TOOL_EXECUTION',
            ...log,
            duration: log.duration ? `${log.duration}ms` : undefined,
        };

        if (this.isDevelopment) {
            if (log.success) {
                console.log(`[ToolExecution] ✅ ${log.toolName}`, logEntry);
            } else {
                console.error(`[ToolExecution] ❌ ${log.toolName}`, logEntry);
            }
        } else {
            // Production: structured JSON logging
            console.log(JSON.stringify(logEntry));
        }
    }

    /**
     * Log validation results (expected vs actual tools)
     */
    logValidation(log: ValidationLog): void {
        const logEntry = {
            type: 'TOOL_VALIDATION',
            ...log,
            missing: log.expectedTools.filter(t => !log.actualTools.includes(t)),
            unexpected: log.actualTools.filter(t => !log.expectedTools.includes(t)),
        };

        if (this.isDevelopment) {
            if (log.passed) {
                console.log(`[Validation] ✅ PASSED`, logEntry);
            } else {
                console.warn(`[Validation] ⚠️ FAILED`, logEntry);
            }
        } else {
            console.log(JSON.stringify(logEntry));
        }
    }

    /**
     * Log retry attempts
     */
    logRetry(log: RetryLog): void {
        const logEntry = {
            type: 'TOOL_RETRY',
            ...log,
        };

        if (this.isDevelopment) {
            console.warn(`[Retry] 🔄 Attempt ${log.attempt}`, logEntry);
        } else {
            console.log(JSON.stringify(logEntry));
        }
    }

    /**
     * Log general orchestration events
     */
    log(level: LogLevel, message: string, data?: any): void {
        const logEntry = {
            type: 'ORCHESTRATION',
            level,
            message,
            data,
            timestamp: new Date(),
        };

        if (this.isDevelopment) {
            const emoji = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️';
            console[level](`[Orchestration] ${emoji} ${message}`, data || '');
        } else {
            console.log(JSON.stringify(logEntry));
        }
    }
}

// Singleton instance
let loggerInstance: ToolExecutionLogger | null = null;

export function getLogger(): ToolExecutionLogger {
    if (!loggerInstance) {
        loggerInstance = new ToolExecutionLogger();
    }
    return loggerInstance;
}
