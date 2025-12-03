import { CalendarDays, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AnalyticsHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in opacity-0" style={{ animationFillMode: "forwards" }}>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-1 text-muted-foreground">
          Track your nutrition journey and meal planning progress
        </p>
      </div>
      <Button variant="outline" className="w-fit gap-2 rounded-xl">
        <CalendarDays className="h-4 w-4" />
        Last 7 days
        <ChevronDown className="h-4 w-4" />
      </Button>
    </div>
  );
}