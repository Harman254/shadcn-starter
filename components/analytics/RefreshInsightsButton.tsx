'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star, RefreshCw } from "lucide-react";
import { refreshAiInsights } from "@/app/actions/analytics";
import { toast } from "sonner"; // Assuming sonner is used, or use generic toast

export function RefreshInsightsButton({ hasData }: { hasData: boolean }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const result = await refreshAiInsights();
      if (result.success) {
        toast.success("AI Insights updated!");
      } else {
        toast.error("Failed to update insights.");
      }
    } catch (e) {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
        onClick={handleRefresh}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="gap-2"
    >
      {isLoading ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Star className="h-4 w-4 text-indigo-500" />
      )}
      {isLoading ? "Analyzing..." : hasData ? "Refresh Insights" : "Generate AI Insights"}
    </Button>
  );
}
