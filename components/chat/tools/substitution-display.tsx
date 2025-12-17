"use client"

import { motion } from "framer-motion"
import { ArrowLeftRight, Check, Leaf, Flame, Scale, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface SubstitutionDisplayProps {
  data: {
    originalIngredient: string
    substitutions: Array<{
      name: string
      ratio: string
      notes: string
      bestFor: string[]
      nutritionChange?: {
        calories?: string
        protein?: string
        carbs?: string
        fat?: string
      }
      difficulty: 'easy' | 'moderate' | 'advanced'
    }>
    bestMatch: string
    tip: string
  }
}

export function SubstitutionDisplay({ data }: SubstitutionDisplayProps) {
  const difficultyColors = {
    easy: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    moderate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      <div className={cn(
        "relative overflow-hidden rounded-3xl",
        "bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950",
        "border border-indigo-500/20",
        "shadow-2xl shadow-indigo-500/10"
      )}>
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        {/* Header */}
        <div className="relative p-6 sm:p-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
                <ArrowLeftRight className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
                <Leaf className="h-3 w-3 text-indigo-400" />
                Smart Swap
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Substitutes for {data.originalIngredient}
            </h2>
            <p className="text-white/50 text-sm mt-1">{data.substitutions.length} alternatives found</p>
          </motion.div>
        </div>

        {/* Best Match Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mx-6 sm:mx-8 mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border border-emerald-500/30"
        >
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">Best Match:</span>
            <span className="text-white font-medium">{data.bestMatch}</span>
          </div>
        </motion.div>

        {/* Substitutions Grid */}
        <div className="relative px-6 sm:px-8 pb-6 space-y-4">
          {data.substitutions.map((sub, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
              className={cn(
                "rounded-2xl p-4 border backdrop-blur-sm",
                "bg-gradient-to-br from-white/10 to-white/5 border-white/10",
                sub.name === data.bestMatch && "ring-2 ring-emerald-500/50"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white text-lg">{sub.name}</h3>
                  <p className="text-indigo-300 font-mono text-sm">{sub.ratio}</p>
                </div>
                <span className={cn(
                  "px-2 py-1 rounded-lg text-xs font-medium border",
                  difficultyColors[sub.difficulty]
                )}>
                  {sub.difficulty}
                </span>
              </div>

              <p className="text-white/60 text-sm mb-3">{sub.notes}</p>

              <div className="flex flex-wrap gap-2 mb-3">
                {sub.bestFor.map((use, i) => (
                  <span key={i} className="px-2 py-1 rounded-lg bg-white/5 text-white/50 text-xs">
                    {use}
                  </span>
                ))}
              </div>

              {sub.nutritionChange && (
                <div className="flex gap-3 pt-3 border-t border-white/10">
                  {sub.nutritionChange.calories && (
                    <div className="flex items-center gap-1 text-xs text-white/40">
                      <Flame className="h-3 w-3" />
                      {sub.nutritionChange.calories}
                    </div>
                  )}
                  {sub.nutritionChange.protein && (
                    <div className="flex items-center gap-1 text-xs text-white/40">
                      <Scale className="h-3 w-3" />
                      {sub.nutritionChange.protein}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Tip */}
        <div className="relative px-6 sm:px-8 pb-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-start gap-3 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20"
          >
            <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-white/70 text-sm">{data.tip}</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
