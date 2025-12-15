/**
 * @fileOverview
 * Tool Execution Progress Component
 * Displays real-time progress for multiple tool executions
 */

'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, Loader2, Clock, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export interface ToolProgressData {
  toolId: string;
  toolName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  progress: number;
  message?: string;
  phase?: number;
  totalPhases?: number;
  estimatedTimeRemaining?: number;
}

export interface ExecutionProgressData {
  totalTools: number;
  completedTools: number;
  failedTools: number;
  skippedTools: number;
  currentPhase: number;
  totalPhases: number;
  overallProgress: number;
  tools: Map<string, ToolProgressData>;
  estimatedTimeRemaining?: number;
  startedAt: Date; // Timestamp when execution started (for progress calculation)
}

interface ToolProgressProps {
  progress?: ExecutionProgressData;
  compact?: boolean;
  showIndividualTools?: boolean;
}

export function ToolProgress({ 
  progress, 
  compact = false,
  showIndividualTools = true 
}: ToolProgressProps) {
  if (!progress) return null;

  const formatTime = (ms?: number): string => {
    if (!ms || ms < 0) return '';
    const seconds = Math.ceil(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getStatusIcon = (status: ToolProgressData['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case 'skipped':
        return <SkipForward className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: ToolProgressData['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
      case 'running':
        return 'text-primary';
      case 'skipped':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  const toolsArray = Array.from(progress.tools.values());

  return (
    <div className={cn(
      "w-full space-y-3 font-sans",
      compact && "space-y-2"
    )}>
      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">Processing tools</span>
            {progress.totalPhases > 1 && (
              <span className="text-muted-foreground">
                Phase {progress.currentPhase} of {progress.totalPhases}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{progress.completedTools}/{progress.totalTools} completed</span>
            {progress.estimatedTimeRemaining && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(progress.estimatedTimeRemaining)}
              </span>
            )}
          </div>
        </div>
        
        <Progress 
          value={progress.overallProgress} 
          className="h-2"
        />
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {progress.failedTools > 0 && (
            <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
              <XCircle className="h-3 w-3" />
              {progress.failedTools} failed
            </span>
          )}
          {progress.skippedTools > 0 && (
            <span className="flex items-center gap-1">
              <SkipForward className="h-3 w-3" />
              {progress.skippedTools} skipped
            </span>
          )}
        </div>
      </div>

      {/* Individual Tools */}
      {showIndividualTools && toolsArray.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          <AnimatePresence>
            {toolsArray.map((tool) => (
              <motion.div
                key={tool.toolId}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg border",
                  tool.status === 'running' && "bg-primary/5 border-primary/20",
                  tool.status === 'completed' && "bg-green-500/5 border-green-500/20",
                  tool.status === 'failed' && "bg-red-500/5 border-red-500/20"
                )}
              >
                <div className="flex-shrink-0">
                  {getStatusIcon(tool.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={cn(
                      "text-sm font-medium truncate",
                      getStatusColor(tool.status)
                    )}>
                      {tool.toolName}
                    </span>
                    {tool.status === 'running' && (
                      <span className="text-xs text-muted-foreground">
                        {Math.round(tool.progress)}%
                      </span>
                    )}
                  </div>
                  
                  {tool.status === 'running' && (
                    <Progress 
                      value={tool.progress} 
                      className="h-1"
                    />
                  )}
                  
                  {tool.message && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {tool.message}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

