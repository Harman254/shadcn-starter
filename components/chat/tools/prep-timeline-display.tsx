"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, ChefHat, Play, Pause, RotateCcw, Box, Lightbulb, CheckCircle2, Calendar, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PrepTimelineDisplayProps {
  data: {
    prepDate: string
    totalActiveTime: number
    totalPassiveTime: number
    timeline: Array<{
      time: string
      duration: number
      action: string
      recipe: string
      type: 'active' | 'passive'
      parallelTask?: string
    }>
    storageInstructions: Array<{
      item: string
      method: string
      duration: string
      reheatingTip: string
    }>
    equipmentNeeded: string[]
    proTips: string[]
  }
  recipes?: string[]
  onActionClick?: (action: string) => void
}

export function PrepTimelineDisplay({ data, recipes, onActionClick }: PrepTimelineDisplayProps) {
  const [currentStep, setCurrentStep] = useState(-1)
  const [isRunning, setIsRunning] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const totalTime = data.totalActiveTime + data.totalPassiveTime
  const hours = Math.floor(totalTime / 60)
  const mins = totalTime % 60

  const toggleStep = (idx: number) => {
    const newCompleted = new Set(completedSteps)
    if (newCompleted.has(idx)) {
      newCompleted.delete(idx)
    } else {
      newCompleted.add(idx)
    }
    setCompletedSteps(newCompleted)
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
        "bg-gradient-to-br from-violet-950 via-slate-900 to-fuchsia-950",
        "border border-violet-500/20",
        "shadow-2xl shadow-violet-500/10"
      )}>
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-fuchsia-500/10" />
        
        {/* Header */}
        <div className="relative p-6 sm:p-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-violet-500/20 border border-violet-500/30">
                <Clock className="h-5 w-5 text-violet-400" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
                <ChefHat className="h-3 w-3 text-violet-400" />
                Prep Timeline
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Meal Prep Schedule
            </h2>
            <p className="text-white/50 text-sm mt-1">{data.prepDate}</p>
          </motion.div>

          {/* Time Summary */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-3 rounded-xl bg-white/10 border border-white/10 text-center"
            >
              <div className="text-2xl font-bold text-white">
                {hours > 0 ? `${hours}h ${mins}m` : `${mins}m`}
              </div>
              <div className="text-xs text-white/40">Total Time</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="p-3 rounded-xl bg-violet-500/20 border border-violet-500/30 text-center"
            >
              <div className="text-2xl font-bold text-violet-400">{data.totalActiveTime}m</div>
              <div className="text-xs text-white/40">Hands-on</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-3 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/30 text-center"
            >
              <div className="text-2xl font-bold text-fuchsia-400">{data.totalPassiveTime}m</div>
              <div className="text-xs text-white/40">Passive</div>
            </motion.div>
          </div>
        </div>

        {/* Equipment */}
        <div className="relative px-6 sm:px-8 pb-4">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Box className="h-3 w-3" />
            Equipment Needed
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.equipmentNeeded.map((item, idx) => (
              <span key={idx} className="px-2 py-1 rounded-lg bg-white/5 text-white/60 text-xs">
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="relative px-6 sm:px-8 pb-6">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
            Step-by-Step Timeline
          </h3>
          <div className="space-y-2">
            {data.timeline.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.05 }}
                className={cn(
                  "relative flex gap-3 p-3 rounded-xl border backdrop-blur-sm cursor-pointer transition-all",
                  completedSteps.has(idx) 
                    ? "bg-emerald-500/10 border-emerald-500/30" 
                    : step.type === 'active'
                      ? "bg-violet-500/10 border-violet-500/20"
                      : "bg-fuchsia-500/10 border-fuchsia-500/20",
                  currentStep === idx && "ring-2 ring-white/30"
                )}
                onClick={() => toggleStep(idx)}
              >
                {/* Time marker */}
                <div className="w-14 shrink-0 text-center">
                  <div className="font-mono text-sm font-bold text-white">{step.time}</div>
                  <div className="text-[10px] text-white/40">{step.duration}m</div>
                </div>

                {/* Action */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {completedSteps.has(idx) && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    )}
                    <p className={cn(
                      "text-sm font-medium",
                      completedSteps.has(idx) ? "text-emerald-300 line-through" : "text-white"
                    )}>
                      {step.action}
                    </p>
                  </div>
                  <p className="text-xs text-white/40 mt-0.5">For: {step.recipe}</p>
                  {step.parallelTask && (
                    <p className="text-xs text-violet-300 mt-1">
                      ⚡ While waiting: {step.parallelTask}
                    </p>
                  )}
                </div>

                {/* Type badge */}
                <span className={cn(
                  "shrink-0 px-2 py-0.5 rounded text-[10px] font-medium",
                  step.type === 'active' 
                    ? "bg-violet-500/30 text-violet-300" 
                    : "bg-fuchsia-500/30 text-fuchsia-300"
                )}>
                  {step.type}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Storage Instructions */}
        {data.storageInstructions.length > 0 && (
          <div className="relative px-6 sm:px-8 pb-6">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Box className="h-4 w-4" />
              Storage Guide
            </h3>
            <div className="grid gap-2">
              {data.storageInstructions.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 + idx * 0.1 }}
                  className="p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-white text-sm">{item.item}</h4>
                    <span className="text-xs text-white/40">{item.duration}</span>
                  </div>
                  <p className="text-xs text-white/50 mt-1">{item.method}</p>
                  <p className="text-xs text-violet-300 mt-1">🔥 Reheat: {item.reheatingTip}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Pro Tips */}
        <div className="relative px-6 sm:px-8 pb-6">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-400" />
            Pro Tips
          </h3>
          <div className="space-y-2">
            {data.proTips.map((tip, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 + idx * 0.1 }}
                className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20"
              >
                <span className="text-amber-400 text-sm">💡</span>
                <p className="text-white/70 text-sm">{tip}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        {onActionClick && (
          <div className="relative px-6 sm:px-8 pb-6">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6" />
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-xl font-semibold gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10"
                onClick={() => onActionClick("Show me the meal plan for this prep timeline")}
              >
                <Calendar className="h-4 w-4" /> View Plan
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-xl font-semibold gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10"
                onClick={() => onActionClick("Generate a grocery list for this prep timeline")}
              >
                <ShoppingCart className="h-4 w-4" /> Grocery List
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
