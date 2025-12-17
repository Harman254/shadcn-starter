import { CalendarDays, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AnalyticsHeader() {
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
      <Button variant="outline" className="w-full sm:w-fit gap-2 rounded-xl border-border/50 hover:bg-accent/50 transition-all">
        <CalendarDays className="h-4 w-4" />
        <span className="hidden sm:inline">Last 7 days</span>
        <span className="sm:hidden">7 days</span>
        <ChevronDown className="h-4 w-4" />
      </Button>
    </div>
  );
}