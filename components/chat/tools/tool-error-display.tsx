"use client"

import { AlertCircle, RefreshCw, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ToolErrorDisplayProps {
  error: string | { message?: string; error?: string; code?: string; metadata?: { suggestions?: string[] } }
  toolName?: string
  onRetry?: () => void
  className?: string
  showRetry?: boolean
}

export function ToolErrorDisplay({ 
  error, 
  toolName, 
  onRetry, 
  className,
  showRetry = true 
}: ToolErrorDisplayProps) {
  // Extract error message
  const errorMessage = typeof error === 'string' 
    ? error 
    : error.message || error.error || 'An error occurred';

  // Extract suggestions if available
  const suggestions = typeof error === 'object' && error.metadata?.suggestions
    ? error.metadata.suggestions
    : [];

  return (
    <Card className={cn("border-destructive/50 bg-destructive/5", className)}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="rounded-full bg-destructive/10 p-2">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-destructive mb-1">
              {toolName ? `${toolName} Failed` : 'Something went wrong'}
            </h3>
            
            <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">
              {errorMessage}
            </p>

            {suggestions.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">Suggestions:</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  {suggestions.map((suggestion: string, index: number) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {showRetry && onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

