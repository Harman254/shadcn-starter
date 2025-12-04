"use client"

import { motion } from "framer-motion"
import { ShoppingCart, ExternalLink, TrendingDown, DollarSign, Wand2, Crown, Building2, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PricingDisplayProps {
  prices: any[]
  onActionClick?: (action: string) => void
}

export function PricingDisplay({ prices, onActionClick }: PricingDisplayProps) {
  const lowestPriceIndex = prices.reduce((lowestIdx, current, idx, arr) => {
    return current.total < arr[lowestIdx].total ? idx : lowestIdx
  }, 0)

  const highestPrice = Math.max(...prices.map(p => p.total))
  const lowestPrice = Math.min(...prices.map(p => p.total))
  const savings = highestPrice - lowestPrice

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-xl mx-auto"
    >
      <div className={cn(
        "relative overflow-hidden rounded-3xl",
        "bg-gradient-to-br from-green-950 via-slate-900 to-emerald-950",
        "border border-green-500/20",
        "shadow-2xl shadow-green-500/10"
      )}>
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-emerald-500/10" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
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
                <div className="p-2 rounded-xl bg-green-500/20 border border-green-500/30">
                  <DollarSign className="h-5 w-5 text-green-400" />
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
                  <Wand2 className="h-3 w-3 text-green-400" />
                  Live Prices
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Price Comparison
              </h2>
              <p className="text-white/50 text-sm mt-1">{prices.length} stores compared</p>
            </div>

            {/* Savings Badge */}
            {savings > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="text-center p-3 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/30"
              >
                <div className="flex items-center gap-1 text-green-400 mb-0.5">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Save</span>
                </div>
                <span className="text-xl font-bold text-white">${savings.toFixed(2)}</span>
              </motion.div>
            )}
          </motion.div>

          {/* Price Cards */}
          <div className="space-y-3">
            {prices.map((price: any, idx: number) => {
              const isBest = idx === lowestPriceIndex
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className={cn(
                    "relative p-4 rounded-2xl border backdrop-blur-sm transition-all duration-300",
                    isBest 
                      ? "bg-gradient-to-r from-green-500/20 to-emerald-500/10 border-green-500/40 shadow-lg shadow-green-500/10" 
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  )}
                >
                  {/* Best Badge */}
                  {isBest && (
                    <div className="absolute -top-2.5 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold shadow-lg shadow-green-500/30">
                      <Crown className="h-3 w-3" />
                      Best Price
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center border",
                        isBest 
                          ? "bg-green-500/20 border-green-500/30" 
                          : "bg-white/5 border-white/10"
                      )}>
                        <Building2 className={cn("h-5 w-5", isBest ? "text-green-400" : "text-white/50")} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{price.store}</span>
                          {price.sourceUrl && (
                            <a 
                              href={price.sourceUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-white/40 hover:text-green-400 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                        <span className="text-xs text-white/40">{price.notes || "Standard pricing"}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={cn(
                        "text-2xl font-bold",
                        isBest ? "text-green-400" : "text-white"
                      )}>
                        {price.currency}{price.total.toFixed(2)}
                      </div>
                      {isBest && (
                        <span className="text-xs text-green-400/80 font-medium">Save ${(highestPrice - price.total).toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Action */}
        {onActionClick && (
          <div className="relative px-6 sm:px-8 pb-6 sm:pb-8">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6" />
            
            <Button
              size="lg"
              className="w-full h-14 rounded-2xl font-semibold text-base gap-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/25"
              onClick={() => onActionClick("Generate a grocery list for these items")}
            >
              <ShoppingCart className="h-5 w-5" /> Create Shopping List
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
