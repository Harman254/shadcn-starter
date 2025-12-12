'use client';

import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import Link from "next/link";

interface ProGateProps {
  children: React.ReactNode;
  isPro: boolean;
  blurAmount?: "sm" | "md" | "lg";
}

export function ProGate({ children, isPro, blurAmount = "sm" }: ProGateProps) {
  if (isPro) {
    return <>{children}</>;
  }

  return (
    <div className="relative group overflow-hidden rounded-xl border border-border/50">
      <div className={`filter blur-${blurAmount} pointer-events-none select-none opacity-50 transition-all duration-500 group-hover:opacity-40 group-hover:blur-md`}>
        {children}
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/10 backdrop-blur-[2px] z-10 p-6 text-center transition-colors duration-300 group-hover:bg-background/20">
        <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full animate-pulse"></div>
            <div className="relative h-14 w-14 rounded-full bg-gradient-to-br from-indigo-100 to-white dark:from-indigo-900/40 dark:to-slate-900 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Lock className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
        </div>
        
        <h3 className="font-bold text-lg text-foreground mb-1">Pro Feature</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-5 max-w-xs leading-relaxed">
            Unlock advanced analytics, AI insights, and pantry vision with MealWise Pro.
        </p>
        
        <Button asChild size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md transition-all duration-300 hover:shadow-indigo-500/25 hover:shadow-lg hover:-translate-y-0.5">
            <Link href="/pricing">Upgrade to Pro</Link>
        </Button>
      </div>
    </div>
  );
}
