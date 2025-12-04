"use client"

import { motion } from "framer-motion"
import { Clock, Wand2, ChefHat, ArrowRight, Star, Flame, ExternalLink, Search, Globe, Zap, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface MealSuggestionsProps {
  results: any[]
  title?: string
  onActionClick?: (action: string) => void
}

export function MealSuggestions({ results, title, onActionClick }: MealSuggestionsProps) {
  if (!results?.length) return null

  // Check if this is from a search (has sourceUrl) vs AI generated
  const isFromSearch = results.some(r => r.sourceUrl)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className={cn(
        "relative overflow-hidden rounded-[2rem]",
        "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950",
        "border border-white/[0.08]",
        "shadow-2xl shadow-black/40"
      )}>
        {/* Ambient background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-rose-500/25 to-pink-500/15 rounded-full blur-[100px]" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-500/20 to-amber-500/10 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-white/[0.02] to-transparent" />
        </div>
        
        {/* Header */}
        <div className="relative p-6 sm:p-8 pb-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-start justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={cn(
                  "p-3 rounded-2xl",
                  isFromSearch 
                    ? "bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30" 
                    : "bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-500/30"
                )}>
                  {isFromSearch ? (
                    <Search className="h-6 w-6 text-blue-400" />
                  ) : (
                    <ChefHat className="h-6 w-6 text-rose-400" />
                  )}
                </div>
                {/* Pulse ring */}
                <motion.div 
                  className={cn(
                    "absolute inset-0 rounded-2xl border-2",
                    isFromSearch ? "border-blue-500/30" : "border-rose-500/30"
                  )}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1">
                  {title || (isFromSearch ? "Search Results" : "Recipe Suggestions")}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-white/40 text-sm">{results.length} recipes found</span>
                  {isFromSearch && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <Globe className="h-3 w-3 text-blue-400" />
                      <span className="text-xs font-medium text-blue-300">Web Search</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* AI Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/20"
            >
              <Wand2 className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs font-semibold text-amber-300">AI Powered</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Recipe Cards */}
        <div className="relative px-4 sm:px-6 pb-6 sm:pb-8">
          <div className="space-y-3">
            {results.map((recipe: any, idx: number) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onActionClick?.(`Give me the full recipe for ${recipe.name}`)}
                className={cn(
                  "w-full p-4 sm:p-5 rounded-2xl text-left",
                  "bg-gradient-to-br from-white/[0.08] to-white/[0.03]",
                  "border border-white/[0.08] hover:border-white/[0.15]",
                  "backdrop-blur-sm",
                  "transition-all duration-300 group",
                  "hover:shadow-lg hover:shadow-rose-500/5"
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Recipe Image with Placeholder Fallback */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-white/[0.05]">
                    <motion.img
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5 }}
                      src={recipe.imageUrl || `https://source.unsplash.com/400x400/?${encodeURIComponent(recipe.name.split(' ').slice(0, 2).join(','))},food`}
                      alt={recipe.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        // Fallback to a static food placeholder if Unsplash fails
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop';
                      }}
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Arrow indicator on hover */}
                    <motion.div 
                      className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ArrowRight className="h-4 w-4 text-white" />
                    </motion.div>
                  </div>

                  {/* Recipe Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-white text-base sm:text-lg group-hover:text-rose-300 transition-colors line-clamp-2">
                        {recipe.name}
                      </h3>
                    </div>
                    
                    <p className="text-sm text-white/40 line-clamp-2 mb-3 leading-relaxed">
                      {recipe.description || "Delicious recipe awaits..."}
                    </p>

                    {/* Tags & Meta */}
                    <div className="flex flex-wrap items-center gap-2">
                      {recipe.prepTime && (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/[0.08] text-xs text-white/60">
                          <Clock className="h-3.5 w-3.5 text-blue-400" />
                          {recipe.prepTime}
                        </span>
                      )}
                      {recipe.cookTime && (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/[0.08] text-xs text-white/60">
                          <Flame className="h-3.5 w-3.5 text-orange-400" />
                          {recipe.cookTime}
                        </span>
                      )}
                      {recipe.difficulty && (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/[0.08] text-xs text-white/60">
                          <Zap className="h-3.5 w-3.5 text-yellow-400" />
                          {recipe.difficulty}
                        </span>
                      )}
                      {recipe.calories && (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium">
                          {recipe.calories} cal
                        </span>
                      )}
                      {recipe.rating && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 font-medium">
                          <Star className="h-3.5 w-3.5 fill-amber-400" />
                          {recipe.rating}
                        </span>
                      )}
                    </div>
                    
                    {/* Source URL - Only for web search results */}
                    {recipe.sourceUrl && (
                      <motion.a
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        href={recipe.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 mt-3 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span className="truncate max-w-[200px]">
                          {new URL(recipe.sourceUrl).hostname.replace('www.', '')}
                        </span>
                      </motion.a>
                    )}
                    
                    {/* Tags */}
                    {recipe.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {recipe.tags.slice(0, 3).map((tag: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded-md text-[10px] bg-white/[0.05] border border-white/[0.08] text-white/50">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Footer hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-xs text-white/25 mt-6"
          >
            Tap a recipe to view full details and instructions
          </motion.p>
        </div>
      </div>
    </motion.div>
  )
}
