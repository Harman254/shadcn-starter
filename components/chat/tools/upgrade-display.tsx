
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, ArrowRight, Lock, Crown } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface UpgradeDisplayProps {
  featureName?: string;
  description?: string;
}

export function UpgradeDisplay({ featureName = "Premium Feature", description }: UpgradeDisplayProps) {
  return (
    <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
    >
        <Card className="w-full max-w-md mx-auto overflow-hidden border-indigo-200 dark:border-indigo-800 shadow-xl bg-gradient-to-br from-white to-indigo-50/50 dark:from-slate-900 dark:to-indigo-950/30">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
        <CardHeader className="pb-2 text-center pt-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-4 relative group">
                <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 animate-pulse"></div>
                <Crown className="w-8 h-8 text-indigo-600 dark:text-indigo-400 relative z-10" />
                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 border border-border shadow-sm">
                    <Lock className="w-3 h-3 text-muted-foreground" />
                </div>
            </div>
            <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700 dark:from-indigo-300 dark:to-purple-400">
            Unlock {featureName}
            </CardTitle>
        </CardHeader>
        <CardContent className="text-center pb-6">
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            {description || "This advanced AI capabilities are available exclusively to MealWise Pro members."}
            </p>
            <div className="flex justify-center gap-2 mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Powered
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                    Unlimited Access
                </span>
            </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 bg-indigo-50/50 dark:bg-indigo-950/20 p-6 border-t border-indigo-100 dark:border-indigo-800/50">
            <Button asChild className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md group">
            <Link href="/pricing">
                Upgrade to Pro
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            </Button>
            <p className="text-xs text-center text-muted-foreground">
            30-day money-back guarantee. Cancel anytime.
            </p>
        </CardFooter>
        </Card>
    </motion.div>
  )
}
