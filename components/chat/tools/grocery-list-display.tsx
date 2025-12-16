"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart, MapPin, Tag, DollarSign, Save, Check, Loader2, Copy, Share2, Wand2, CheckCircle2, Circle, Package, ChefHat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface GroceryListDisplayProps {
  groceryList: any
  mealPlanId?: string
  onActionClick?: (action: string) => void
}

export function GroceryListDisplay({ groceryList, mealPlanId, onActionClick }: GroceryListDisplayProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [checkingSave, setCheckingSave] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  // Check if grocery list is already saved on mount (by mealPlanId if provided)
  // Note: Since grocery lists don't have a GET endpoint, we skip this check
  // The save button will handle duplicates on the server side
  useEffect(() => {
    setCheckingSave(false)
  }, [])

  const toggleItem = (id: string) => {
    const next = new Set(checkedItems)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setCheckedItems(next)
  }

  const handleCopy = () => {
    const text = groceryList.items.map((item: any) => 
      `${checkedItems.has(item.id || item.item) ? '✓' : '○'} ${item.item} (${item.quantity})`
    ).join('\n')
    navigator.clipboard.writeText(text)
    toast({ title: "Copied!", description: "List copied to clipboard." })
  }

  const handleSave = async () => {
    if (savedId) return
    try {
      setSaving(true)
      const response = await fetch('/api/grocery/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: groceryList.items,
          locationInfo: groceryList.locationInfo,
          totalEstimatedCost: groceryList.totalEstimatedCost,
          mealPlanId: mealPlanId
        }),
      })
      const result = await response.json()
      if (response.ok && result.success) {
        setSavedId(result.list.id)
        toast({ title: "Success!", description: "Grocery list saved." })
        router.refresh()
      } else {
        toast({ title: "Failed to save", description: result.error, variant: "destructive" })
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to save list.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const groupedItems = groceryList.items?.reduce((acc: Record<string, any[]>, item: any) => {
    const category = item.category || 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push(item)
    return acc
  }, {}) || {}

  const totalItems = groceryList.items?.length || 0
  const checkedCount = checkedItems.size
  const progress = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0

  // Category colors
  const categoryColors: Record<string, string> = {
    'Produce': 'from-emerald-500/20 to-green-500/10 border-emerald-500/30',
    'Dairy': 'from-blue-500/20 to-cyan-500/10 border-blue-500/30',
    'Meat': 'from-red-500/20 to-rose-500/10 border-red-500/30',
    'Bakery': 'from-amber-500/20 to-orange-500/10 border-amber-500/30',
    'Pantry': 'from-violet-500/20 to-purple-500/10 border-violet-500/30',
    'Frozen': 'from-sky-500/20 to-blue-500/10 border-sky-500/30',
    'Other': 'from-slate-500/20 to-gray-500/10 border-slate-500/30',
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
        "bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950",
        "border border-emerald-500/20",
        "shadow-2xl shadow-emerald-500/10"
      )}>
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        {/* Header */}
        <div className="relative p-6 sm:p-8">
          <div className="flex items-start justify-between mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                  <ShoppingCart className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
                  <Wand2 className="h-3 w-3 text-emerald-400" />
                  Smart List
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Your Shopping List
              </h2>
              <p className="text-white/50 text-sm mt-1">{totalItems} items to get</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex gap-2"
            >
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10" 
                onClick={handleCopy}
              >
                <Copy className="h-4 w-4" />
              </Button>
              {onActionClick && (
                <Button 
                  size="icon" 
                  variant="ghost"
                  className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                  onClick={() => onActionClick("Send this grocery list to WhatsApp")}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              )}
            </motion.div>
          </div>

          {/* Progress & Total */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-4 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-white/50 uppercase tracking-wider">Progress</span>
                <span className="text-sm font-bold text-emerald-400">{checkedCount}/{totalItems}</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div 
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs font-medium text-white/50 uppercase tracking-wider">Est. Total</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {groceryList.totalEstimatedCost || '$0.00'}
              </div>
            </motion.div>
          </div>

          {/* Nearby Stores */}
          {groceryList.locationInfo?.localStores?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="p-4 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-medium text-white/50 uppercase tracking-wider">Nearby Stores</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {groceryList.locationInfo.localStores.map((store: string, idx: number) => (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + idx * 0.1 }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-medium"
                  >
                    {store}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Categories & Items */}
        <div className="relative px-6 sm:px-8 pb-6 space-y-4">
          {(Object.entries(groupedItems) as [string, any[]][]).map(([category, items], idx) => (
            <motion.div 
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + idx * 0.1 }}
              className={cn(
                "rounded-2xl p-4 border backdrop-blur-sm",
                "bg-gradient-to-br",
                categoryColors[category] || categoryColors['Other']
              )}
            >
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-4 w-4 text-white/60" />
                <h3 className="font-semibold text-white text-sm">{category}</h3>
                <span className="text-xs text-white/40">({items.length})</span>
              </div>

              <div className="space-y-2">
                {items.map((item: any, i: number) => {
                  const isChecked = checkedItems.has(item.id || item.item)
                  return (
                    <motion.div 
                      key={i}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200",
                        isChecked 
                          ? "bg-white/5 opacity-50" 
                          : "bg-white/10 hover:bg-white/15"
                      )}
                      onClick={() => toggleItem(item.id || item.item)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <motion.div
                          initial={false}
                          animate={{ scale: isChecked ? 1 : 1 }}
                          className={cn(
                            "w-6 h-6 rounded-lg flex items-center justify-center border transition-all",
                            isChecked 
                              ? "bg-emerald-500 border-emerald-400" 
                              : "bg-white/5 border-white/20"
                          )}
                        >
                          {isChecked ? (
                            <Check className="h-3.5 w-3.5 text-white" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-white/20" />
                          )}
                        </motion.div>
                        <div className="min-w-0">
                          <p className={cn(
                            "font-medium text-sm transition-all",
                            isChecked ? "line-through text-white/40" : "text-white"
                          )}>
                            {item.item}
                          </p>
                          <p className="text-xs text-white/40 truncate">{item.quantity}</p>
                        </div>
                      </div>
                      <span className={cn(
                        "font-semibold text-sm shrink-0",
                        isChecked ? "text-white/30" : "text-emerald-400"
                      )}>
                        {item.estimatedPrice}
                      </span>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="relative p-6 sm:p-8 pt-0">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6" />
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              size="lg"
              className={cn(
                "h-14 rounded-2xl font-semibold text-base gap-3",
                savedId 
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30" 
                  : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25"
              )}
              onClick={handleSave}
              disabled={saving || !!savedId}
            >
              {saving ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Saving...</>
              ) : savedId ? (
                <><CheckCircle2 className="h-5 w-5" /> Saved</>
              ) : (
                <><Save className="h-5 w-5" /> Save List</>
              )}
            </Button>

            {onActionClick && (
              <Button
                size="lg"
                variant="outline"
                className="h-14 rounded-2xl font-semibold text-base gap-3 bg-white/5 border-white/10 text-white hover:bg-white/10"
                onClick={() => onActionClick("Suggest meals I can cook with these ingredients")}
              >
                <ChefHat className="h-5 w-5" /> Meal Ideas
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
