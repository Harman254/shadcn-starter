'use client';

import { CalendarDays, ChevronDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProFeatures } from "@/hooks/use-pro-features";
import { useState } from "react";

interface AnalyticsHeaderProps {
  range?: 'week' | 'month' | 'all';
  onRangeChange?: (range: 'week' | 'month' | 'all') => void;
  onExport?: (format: 'csv' | 'json') => void;
}

export function AnalyticsHeader({ range = 'week', onRangeChange, onExport }: AnalyticsHeaderProps) {
  const { isPro } = useProFeatures();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'csv' | 'json') => {
    if (!isPro) return;
    setIsExporting(true);
    try {
      if (onExport) {
        await onExport(format);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const rangeLabels = {
    week: 'Last 7 days',
    month: 'Last 30 days',
    all: 'All time'
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in opacity-0" style={{ animationFillMode: "forwards" }}>
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Track your nutrition journey and meal planning progress
        </p>
      </div>
      <div className="flex gap-2">
        {isPro && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-xl border-border/50 hover:bg-accent/50 transition-all" disabled={isExporting}>
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('csv')} disabled={isExporting}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('json')} disabled={isExporting}>
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-fit gap-2 rounded-xl border-border/50 hover:bg-accent/50 transition-all">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">{rangeLabels[range]}</span>
              <span className="sm:hidden">{range === 'week' ? '7d' : range === 'month' ? '30d' : 'All'}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onRangeChange?.('week')}>
              Last 7 days
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRangeChange?.('month')}>
              Last 30 days
            </DropdownMenuItem>
            {isPro && (
              <DropdownMenuItem onClick={() => onRangeChange?.('all')}>
                All time
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}