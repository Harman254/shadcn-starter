"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, Users, ChefHat, Flame, Play, Check, ArrowLeft, ArrowRight, Save, ShoppingCart, Calendar, Loader2, Wand2, Timer, Gauge, Pause, RotateCcw, BookOpen, ExternalLink, Utensils, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { CldImage } from 'next-cloudinary'

interface RecipeDisplayProps {
  recipe: any
  onActionClick?: (action: string) => void
}

export function RecipeDisplay({ recipe, onActionClick }: RecipeDisplayProps) {
  const [cookMode, setCookMode] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [checkingSave, setCheckingSave] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [exportFormats, setExportFormats] = useState<string[]>(['pdf'])
  const { toast } = useToast()

  // Fetch user's export formats on mount
  useEffect(() => {
    const fetchExportFormats = async () => {
      try {
        const response = await fetch('/api/usage/features')
        if (response.ok) {
          const data = await response.json()
          // API now returns { limits, featureUsage, plan }
          setExportFormats(data.limits?.exportFormats || ['pdf'])
        }
      } catch (e) {
        // Silently fail, default to PDF only
        console.error('[RecipeDisplay] Failed to fetch export formats:', e)
      }
    }
    fetchExportFormats()
  }, [])

  // Check if recipe is already saved on mount
  useEffect(() => {
    const checkSaved = async () => {
      if (!recipe.name) {
        setCheckingSave(false)
        return
      }
      try {
        const response = await fetch('/api/recipes/save')
        if (response.ok) {
          const { recipes } = await response.json()
          const existing = recipes?.find((r: any) => 
            r.name.toLowerCase().trim() === recipe.name.toLowerCase().trim()
          )
          if (existing) {
            setSavedId(existing.id)
          }
        }
      } catch (e) {
        // Silently fail - user can still save
      } finally {
        setCheckingSave(false)
      }
    }
    checkSaved()
  }, [recipe.name])

  const handleSave = async () => {
    if (savedId) return
    try {
      setSaving(true)
      const response = await fetch('/api/recipes/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipe),
      })
      const result = await response.json()
      if (response.ok && result.success) {
        setSavedId(result.recipe.id)
        toast({ title: "Saved!", description: "Recipe added to your collection." })
      } else {
        toast({ title: "Failed to save", description: result.error, variant: "destructive" })
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to save recipe.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleExport = async (format: 'pdf' | 'csv' | 'json') => {
    if (!savedId) {
      toast({ 
        title: "Please save the recipe first", 
        description: "You need to save the recipe before exporting.",
        variant: "destructive"
      })
      return
    }

    try {
      setExporting(true)
      const response = await fetch(`/api/recipes/${savedId}/export?format=${format}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `recipe-${savedId}-${new Date().toISOString().split('T')[0]}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast({ 
          title: `Exported as ${format.toUpperCase()}`, 
          description: "Your recipe has been downloaded."
        })
      } else {
        const error = await response.json()
        toast({ 
          title: "Export failed", 
          description: error.error || "Please try again.",
          variant: "destructive"
        })
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to export recipe.", variant: "destructive" })
    } finally {
      setExporting(false)
    }
  }

  // Cook Mode View
  if (cookMode) {
    const progress = ((currentStep + 1) / recipe.instructions.length) * 100

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className={cn(
          "relative overflow-hidden rounded-3xl min-h-[500px] flex flex-col",
          "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950",
          "border border-orange-500/20",
          "shadow-2xl shadow-orange-500/10"
        )}>
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-500/5" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
          
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
            <motion.div 
              className="h-full bg-gradient-to-r from-orange-500 to-red-500"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Header */}
          <div className="relative p-6 flex items-center justify-between border-b border-white/10">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setCookMode(false)} 
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Exit
            </Button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/30">
              <ChefHat className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-300">Cook Mode</span>
            </div>
            <span className="text-sm font-medium text-white/50">
              {currentStep + 1} / {recipe.instructions.length}
            </span>
          </div>

          {/* Step Content */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="text-center max-w-xl"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring" }}
                  className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-orange-500/30"
                >
                  {currentStep + 1}
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white leading-relaxed">
                  {recipe.instructions[currentStep]}
                </h3>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="relative p-6 border-t border-white/10 flex items-center justify-between gap-4">
            <Button 
              variant="outline" 
              size="lg"
              className="min-w-[120px] bg-white/5 border-white/10 text-white hover:bg-white/10"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Previous
            </Button>
            
            <Button 
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full bg-white/5 text-white/60 hover:bg-white/10"
              onClick={() => setCurrentStep(0)}
            >
              <RotateCcw className="h-5 w-5" />
            </Button>

            <Button 
              size="lg"
              className={cn(
                "min-w-[120px]",
                currentStep === recipe.instructions.length - 1 
                  ? "bg-gradient-to-r from-emerald-500 to-green-500" 
                  : "bg-gradient-to-r from-orange-500 to-red-500"
              )}
              onClick={() => {
                if (currentStep < recipe.instructions.length - 1) {
                  setCurrentStep(currentStep + 1)
                } else {
                  setCookMode(false)
                  toast({ title: "🎉 Bon Appétit!", description: "You've completed the recipe!" })
                }
              }}
            >
              {currentStep === recipe.instructions.length - 1 ? "Finish" : "Next"}
              {currentStep < recipe.instructions.length - 1 && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  // Regular View
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className={cn(
        "relative overflow-hidden rounded-3xl",
        "bg-gradient-to-br from-orange-950 via-slate-900 to-red-950",
        "border border-orange-500/20",
        "shadow-2xl shadow-orange-500/10"
      )}>
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        {/* Hero Image */}
        <div className="relative h-72 sm:h-80 w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 mix-blend-overlay z-10" />
          {recipe.imageUrl && recipe.imageUrl.includes('cloudinary.com') ? (
            <CldImage
              src={recipe.imageUrl}
              alt={recipe.name}
              width={800}
              height={600}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <img 
              src={recipe.imageUrl || 'https://res.cloudinary.com/dcidanigq/image/upload/v1742112004/cld-sample-4.jpg'} 
              alt={recipe.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://res.cloudinary.com/dcidanigq/image/upload/v1742112004/cld-sample-4.jpg';
              }}
            />
          )}
          
          {/* Source Link */}
          {recipe.sourceUrl && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute top-4 left-4 z-20"
            >
               <a
                href={recipe.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white text-xs font-medium hover:bg-black/40 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5 text-white/80" />
                <span className="truncate max-w-[150px]">{new URL(recipe.sourceUrl).hostname.replace('www.', '')}</span>
              </a>
            </motion.div>
          )}

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute top-4 right-4 z-20"
          >
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-xs font-medium">
              <Wand2 className="h-3.5 w-3.5 text-orange-400" />
              AI Recipe
            </div>
          </motion.div>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
                {recipe.name}
              </h2>
              <p className="text-white/70 text-sm sm:text-base line-clamp-2">
                {recipe.description}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="relative px-6 sm:px-8 -mt-4 mb-6 z-30">
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: Users, value: recipe.servings, label: "Servings", color: "from-blue-500/20 to-cyan-500/10 border-blue-500/30" },
              { icon: Timer, value: recipe.prepTime, label: "Prep", color: "from-emerald-500/20 to-green-500/10 border-emerald-500/30" },
              { icon: Flame, value: recipe.cookTime, label: "Cook", color: "from-orange-500/20 to-red-500/10 border-orange-500/30" },
              { icon: Gauge, value: recipe.difficulty, label: "Level", color: "from-violet-500/20 to-purple-500/10 border-violet-500/30" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className={cn(
                  "p-3 rounded-xl border backdrop-blur-sm text-center",
                  "bg-gradient-to-br",
                  stat.color
                )}
              >
                <stat.icon className="h-4 w-4 mx-auto mb-1 text-white/60" />
                <div className="text-sm font-bold text-white">{stat.value}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="relative px-6 sm:px-8 pb-6 space-y-6">
          {/* Ingredients */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="h-4 w-4 text-orange-400" />
              <h3 className="font-semibold text-white">Ingredients</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {recipe.ingredients.map((ing: string, i: number) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  <span className="text-sm text-white/70 truncate">{ing}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Instructions Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-4 w-4 text-orange-400" />
              <h3 className="font-semibold text-white">Instructions</h3>
              <span className="text-xs text-white/40">({recipe.instructions.length} steps)</span>
            </div>
            <div className="space-y-2">
              {recipe.instructions.slice(0, 3).map((step: string, i: number) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-sm text-white/70 line-clamp-2">{step}</span>
                </div>
              ))}
              {recipe.instructions.length > 3 && (
                <div className="text-center text-sm text-white/40 py-2">
                  +{recipe.instructions.length - 3} more steps...
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Actions */}
        <div className="relative p-6 sm:p-8 pt-0">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6" />
          
          <Button
            size="lg"
            className="w-full h-14 rounded-2xl font-semibold text-base gap-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/25"
            onClick={() => setCookMode(true)}
          >
            <Play className="h-5 w-5 fill-current" /> Start Cooking
          </Button>
          
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Button 
              size="lg"
              variant="outline"
              className={cn(
                "h-12 rounded-xl font-semibold gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10",
                savedId && "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              )}
              onClick={handleSave}
              disabled={saving || !!savedId}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : savedId ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {savedId ? "Saved" : "Save"}
            </Button>
            {onActionClick && (
              <Button 
                size="lg"
                variant="outline"
                className="h-12 rounded-xl font-semibold gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10"
                onClick={() => onActionClick(`Create a meal plan that includes ${recipe.name} as one of the meals`)}
              >
                <Calendar className="h-4 w-4" /> Add to Plan
              </Button>
            )}
          </div>
          
          {savedId && exportFormats.length > 1 && (
            <div className="flex items-center gap-2 mt-3">
              {exportFormats.includes('csv') && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExport('csv')}
                  disabled={exporting}
                  className="h-10 rounded-xl font-medium gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  {exporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                  CSV
                </Button>
              )}
              {exportFormats.includes('json') && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExport('json')}
                  disabled={exporting}
                  className="h-10 rounded-xl font-medium gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  {exporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                  JSON
                </Button>
              )}
            </div>
          )}
          
          {onActionClick && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <Button 
                size="lg"
                variant="outline"
                className="h-12 rounded-xl font-semibold gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10"
                onClick={() => onActionClick(`Generate a grocery list for ${recipe.name}`)}
              >
                <ShoppingCart className="h-4 w-4" /> Grocery List
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="h-12 rounded-xl font-semibold gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10"
                onClick={() => onActionClick(`Analyze the nutrition of ${recipe.name}`)}
              >
                <Flame className="h-4 w-4" /> Nutrition
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
