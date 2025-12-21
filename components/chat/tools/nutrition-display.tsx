"use client"

import { motion } from "framer-motion"
import { Activity, Flame, Droplets, Wheat, Zap, TrendingUp, AlertCircle, Wand2, Heart, Calendar, MessageSquare, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CitationList } from "./citation-link"

interface NutritionDisplayProps {
  nutrition: any
  onActionClick?: (action: string) => void
}

function AnimatedDonut({ protein, carbs, fat, size = 160 }: { protein: number, carbs: number, fat: number, size?: number }) {
  const pCal = protein * 4
  const cCal = carbs * 4
  const fCal = fat * 9
  const total = pCal + cCal + fCal || 1

  const pPct = (pCal / total) * 100
  const cPct = (cCal / total) * 100
  const fPct = (fCal / total) * 100

  const radius = 60
  const circumference = 2 * Math.PI * radius
  const strokeWidth = 14

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
        {/* Background circle */}
        <circle 
          cx="70" cy="70" r={radius} 
          fill="none" 
          stroke="currentColor" 
          strokeWidth={strokeWidth} 
          className="text-white/10" 
        />
        
        {/* Protein (Blue) */}
        <motion.circle 
          cx="70" cy="70" r={radius} 
          fill="none" 
          stroke="url(#proteinGradient)" 
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (pPct / 100) * circumference }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        />
        
        {/* Carbs (Green) */}
        <motion.circle 
          cx="70" cy="70" r={radius} 
          fill="none" 
          stroke="url(#carbsGradient)" 
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ 
            strokeDashoffset: circumference - (cPct / 100) * circumference,
            rotate: (pPct / 100) * 360 
          }}
          transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
          style={{ transformOrigin: 'center' }}
        />
        
        {/* Fat (Orange) */}
        <motion.circle 
          cx="70" cy="70" r={radius} 
          fill="none" 
          stroke="url(#fatGradient)" 
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ 
            strokeDashoffset: circumference - (fPct / 100) * circumference,
            rotate: ((pPct + cPct) / 100) * 360 
          }}
          transition={{ duration: 1, delay: 0.9, ease: "easeOut" }}
          style={{ transformOrigin: 'center' }}
        />
        
        {/* Gradients */}
        <defs>
          <linearGradient id="proteinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="carbsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <linearGradient id="fatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.3 }}
          className="text-center"
        >
          <span className="text-3xl font-bold text-white">{Math.round(total)}</span>
          <span className="block text-xs text-white/50 uppercase tracking-wider">kcal</span>
        </motion.div>
      </div>
    </div>
  )
}

function MacroCard({ icon: Icon, label, value, unit, color, delay }: { 
  icon: any, label: string, value: number, unit: string, color: string, delay: number 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={cn(
        "p-4 rounded-2xl border backdrop-blur-sm",
        "bg-gradient-to-br",
        color
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-white/60" />
        <span className="text-xs font-medium text-white/50 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-white">{value}</span>
        <span className="text-sm text-white/50">{unit}</span>
      </div>
    </motion.div>
  )
}

export function NutritionDisplay({ nutrition, onActionClick }: NutritionDisplayProps) {
  const data = nutrition.type === 'plan' ? nutrition.dailyAverage : nutrition.total
  const calories = Math.round(data.calories)
  const protein = Math.round(data.protein)
  const carbs = Math.round(data.carbs)
  const fat = Math.round(data.fat)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className={cn(
        "relative overflow-hidden rounded-3xl",
        "bg-gradient-to-br from-blue-950 via-slate-900 to-violet-950",
        "border border-blue-500/20",
        "shadow-2xl shadow-blue-500/10"
      )}>
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-violet-500/10" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        
        {/* Header */}
        <div className="relative p-6 sm:p-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-start justify-between mb-8"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-500/30">
                  <Activity className="h-5 w-5 text-blue-400" />
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
                  <Wand2 className="h-3 w-3 text-blue-400" />
                  USDA Data
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Nutrition Facts
              </h2>
              <p className="text-white/50 text-sm mt-1">
                {nutrition.type === 'plan' ? 'Daily Average' : 'Total Nutrition'}
              </p>
            </div>

            {/* Health Score */}
            {nutrition.healthScore !== undefined && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="text-center"
              >
                <div className="relative w-20 h-20">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/10" />
                    <motion.circle 
                      cx="50" cy="50" r="40" 
                      fill="none" 
                      stroke="url(#scoreGradient)" 
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={251}
                      initial={{ strokeDashoffset: 251 }}
                      animate={{ strokeDashoffset: 251 - (nutrition.healthScore / 100) * 251 }}
                      transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
                    />
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Heart className="h-3 w-3 text-emerald-400 mb-0.5" />
                    <span className="text-lg font-bold text-white">{nutrition.healthScore}</span>
                  </div>
                </div>
                <span className="text-[10px] text-white/40 uppercase tracking-wider">Health</span>
              </motion.div>
            )}
          </motion.div>

          {/* Main Content */}
          <div className="flex flex-col sm:flex-row items-center gap-8">
            {/* Donut Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="shrink-0"
            >
              <AnimatedDonut protein={protein} carbs={carbs} fat={fat} size={180} />
            </motion.div>

            {/* Macro Cards */}
            <div className="flex-1 grid grid-cols-2 gap-3 w-full">
              <MacroCard 
                icon={Zap} 
                label="Protein" 
                value={protein} 
                unit="g" 
                color="from-blue-500/20 to-violet-500/10 border-blue-500/30"
                delay={0.5}
              />
              <MacroCard 
                icon={Wheat} 
                label="Carbs" 
                value={carbs} 
                unit="g" 
                color="from-emerald-500/20 to-green-500/10 border-emerald-500/30"
                delay={0.6}
              />
              <MacroCard 
                icon={Droplets} 
                label="Fat" 
                value={fat} 
                unit="g" 
                color="from-amber-500/20 to-orange-500/10 border-amber-500/30"
                delay={0.7}
              />
              <MacroCard 
                icon={Flame} 
                label="Energy" 
                value={calories} 
                unit="kcal" 
                color="from-rose-500/20 to-red-500/10 border-rose-500/30"
                delay={0.8}
              />
            </div>
          </div>
        </div>

        {/* Insights */}
        {nutrition.insights?.length > 0 && (
          <div className="relative px-6 sm:px-8 pb-6">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6" />
            
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <h3 className="font-semibold text-white text-sm">AI Insights</h3>
            </div>

            <div className="space-y-2">
              {nutrition.insights.map((insight: string, i: number) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + i * 0.1 }}
                  className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <AlertCircle className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-white/70 leading-relaxed">{insight}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Citations */}
        {nutrition.citations?.length > 0 && (
          <div className="relative px-6 sm:px-8 pb-4">
            <CitationList 
              citations={nutrition.citations.map((c: any) => ({ url: c.url, label: c.title }))} 
              title="Data Sources"
              className="text-white/60"
            />
          </div>
        )}

        {/* Disclaimer */}
        <div className="relative px-6 sm:px-8 pb-6">
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-3">
            <AlertCircle className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-300/80 leading-relaxed">
              Estimates based on standard ingredients. Actual values may vary by brand and portion size.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {onActionClick && (
          <div className="relative p-6 sm:p-8 pt-0">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6" />
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="flex-1 rounded-2xl font-semibold gap-2 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white shadow-lg shadow-blue-500/25"
                onClick={() => onActionClick("Generate a meal plan that meets these nutritional targets")}
              >
                <Calendar className="h-4 w-4" /> Use as Target
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="flex-1 rounded-2xl font-semibold gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10"
                onClick={() => onActionClick("Explain this nutrition analysis in simple terms")}
              >
                <MessageSquare className="h-4 w-4" /> Explain
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
