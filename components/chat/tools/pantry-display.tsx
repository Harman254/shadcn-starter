
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Check, Plus, RefreshCw, Calendar, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface PantryItem {
  name: string
  category: "produce" | "dairy" | "protein" | "grains" | "spices" | "other"
  quantity: string
  expiryEstimate?: string
}

interface PantryDisplayProps {
  items: PantryItem[]
  imageUrl?: string
  onAddItems?: (items: PantryItem[]) => void
}

export function PantryDisplay({ items, imageUrl, onAddItems }: PantryDisplayProps) {
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set(items.map((_, i) => i)))
  const [isAdding, setIsAdding] = useState(false)
  const [isAdded, setIsAdded] = useState(false)

  const toggleItem = (index: number) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedItems(newSelected)
  }

  const handleAdd = async () => {
    setIsAdding(true)
    // Simulate API call or trigger action
    await new Promise(resolve => setTimeout(resolve, 800))
    if (onAddItems) {
        const itemsToAdd = items.filter((_, i) => selectedItems.has(i))
        onAddItems(itemsToAdd)
    }
    setIsAdding(false)
    setIsAdded(true)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "produce": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800"
      case "dairy": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800"
      case "protein": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800"
      case "grains": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
    }
  }

  return (
    <Card className="overflow-hidden border-border/50 shadow-lg bg-background/50 backdrop-blur-sm">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
      
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
                <span className="text-2xl">📸</span> Pantry Scan Results
            </CardTitle>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
                AI Vision
            </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
            IDENTIFIED {items.length} ITEMS FROM YOUR IMAGE
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {imageUrl && (
            <div className="relative rounded-lg overflow-hidden border border-border h-48 w-full group">
                <img 
                    src={imageUrl} 
                    alt="Pantry scan" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white text-xs font-medium">Original Image</p>
                </div>
            </div>
        )}

        <div className="grid gap-2">
            {items.map((item, idx) => (
                <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={cn(
                        "flex items-center p-3 rounded-lg border transition-all duration-200",
                        selectedItems.has(idx) 
                            ? "bg-card border-border shadow-sm" 
                            : "bg-muted/30 border-transparent opacity-60"
                    )}
                    onClick={() => toggleItem(idx)}
                >
                    <Checkbox 
                        checked={selectedItems.has(idx)}
                        onCheckedChange={() => toggleItem(idx)}
                        className="mr-3 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                    />
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <span className={cn(
                                "font-medium truncate",
                                selectedItems.has(idx) ? "text-foreground" : "text-muted-foreground decoration-line-through"
                            )}>
                                {item.name}
                            </span>
                            <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                {item.quantity}
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={cn("text-[10px] px-1.5 h-5", getCategoryColor(item.category))}>
                                {item.category}
                            </Badge>
                            {item.expiryEstimate && (
                                <span className={cn(
                                    "text-[10px] flex items-center gap-1",
                                    item.expiryEstimate.includes("day") ? "text-orange-500" : "text-muted-foreground"
                                )}>
                                    <Calendar className="w-3 h-3" />
                                    Expires in {item.expiryEstimate}
                                </span>
                            )}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
      </CardContent>

      <CardFooter className="pt-2">
        <Button 
            className={cn(
                "w-full transition-all duration-300",
                isAdded ? "bg-emerald-600 hover:bg-emerald-700" : "bg-primary hover:bg-primary/90"
            )}
            disabled={selectedItems.size === 0 || isAdding || isAdded}
            onClick={handleAdd}
        >
            {isAdding ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding to Pantry...
                </>
            ) : isAdded ? (
                <>
                    <Check className="mr-2 h-4 w-4" />
                    Added {selectedItems.size} Items
                </>
            ) : (
                <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add {selectedItems.size} Items to Pantry
                </>
            )}
        </Button>
      </CardFooter>
    </Card>
  )
}
