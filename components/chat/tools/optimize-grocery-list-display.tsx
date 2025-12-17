"use client"

import { motion } from "framer-motion"
import { ArrowRight, TrendingDown, DollarSign, CheckCircle2, Star, Zap, Percent, ShoppingBag, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface OptimizeGroceryListDisplayProps {
  optimization: any
  onActionClick?: (action: string) => void
}

export function OptimizeGroceryListDisplay({ optimization, onActionClick }: OptimizeGroceryListDisplayProps) {
  const savingsPercent = optimization.totalCost > 0 
    ? ((optimization.totalSavings / (optimization.totalCost + optimization.totalSavings)) * 100).toFixed(0)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-xl mx-auto"
    >
      <div className={cn(
        "relative overflow-hidden rounded-3xl",
        "bg-gradient-to-br from-amber-950 via-slate-900 to-yellow-950",
        "border border-amber-500/20",
        "shadow-2xl shadow-amber-500/10"
      )}>
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-yellow-500/10" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        {/* Header */}
        <div className="relative p-6 sm:p-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-start justify-between mb-6"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30">
                  <Zap className="h-5 w-5 text-amber-400" />
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
                  <Star className="h-3 w-3 text-amber-400" />
                  Smart Savings
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Optimization Results
              </h2>
              <p className="text-white/50 text-sm mt-1">{optimization.optimizedItems?.length || 0} items optimized</p>
            </div>

            {/* Savings Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              className="relative"
            >
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/30 to-yellow-500/20 border border-amber-500/40 shadow-lg shadow-amber-500/20">
                <Percent className="h-6 w-6 text-amber-400 mb-1" />
                <div className="text-3xl font-black text-white">{savingsPercent}%</div>
                <span className="text-xs text-amber-300/80 font-medium">Saved</span>
              </div>
              {/* Sparkle effects */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-300" />
            </motion.div>
          </motion.div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/30 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-medium text-white/50 uppercase tracking-wider">Total Savings</span>
              </div>
              <div className="text-3xl font-bold text-emerald-400">
                ${optimization.totalSavings?.toFixed(2) || '0.00'}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="p-4 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="h-4 w-4 text-white/60" />
                <span className="text-xs font-medium text-white/50 uppercase tracking-wider">New Total</span>
              </div>
              <div className="text-3xl font-bold text-white">
                ${optimization.totalCost?.toFixed(2) || '0.00'}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Optimized Items */}
        <div className="relative px-6 sm:px-8 pb-6 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-amber-400" />
            <h3 className="font-semibold text-white text-sm">Optimized Items</h3>
          </div>

          {optimization.optimizedItems?.map((item: any, idx: number) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + idx * 0.1 }}
              className={cn(
                "p-4 rounded-2xl border backdrop-blur-sm",
                "bg-gradient-to-br from-white/10 to-white/5",
                "border-white/10 hover:border-amber-500/30",
                "transition-all duration-300"
              )}
            >
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
                  <span className="text-white/40 line-through truncate">{item.originalItem}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span className="font-semibold text-white truncate">{item.optimizedItem}</span>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold text-amber-400">
                    ${item.price?.toFixed(2) || '0.00'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-lg bg-white/10 border border-white/10 font-medium text-white/70">
                    {item.store}
                  </span>
                  {item.reason && (
                    <span className="text-white/40 truncate max-w-[150px]">{item.reason}</span>
                  )}
                </div>
                {item.savings > 0 && (
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <TrendingDown className="h-3 w-3" />
                    -${item.savings?.toFixed(2)}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action */}
        {onActionClick && (
          <div className="relative px-6 sm:px-8 pb-6 sm:pb-8">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6" />
            
            <Button
              size="lg"
              className="w-full h-14 rounded-2xl font-semibold text-base gap-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black shadow-lg shadow-amber-500/25"
              onClick={() => onActionClick("Update my grocery list with these optimized items")}
            >
              <RefreshCw className="h-5 w-5" /> Apply Optimizations
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
