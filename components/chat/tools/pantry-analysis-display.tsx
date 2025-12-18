"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Plus, Check, Search, Calendar, Package } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface PantryItem {
  name: string
  category: 'produce' | 'dairy' | 'protein' | 'grains' | 'spices' | 'other'
  quantity: string
  expiryEstimate?: string
}

interface PantryAnalysisData {
  items: PantryItem[]
  imageUrl: string
  summary?: string
}

interface PantryAnalysisDisplayProps {
  data: PantryAnalysisData
  onActionClick?: (action: string) => void
}

export function PantryAnalysisDisplay({ data, onActionClick }: PantryAnalysisDisplayProps) {
  const { items, imageUrl, summary } = data
  const [added, setAdded] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleAddToPantry = async () => {
    if (added) return

    setLoading(true)
    try {
      // In a real implementation, this would call an API or trigger a tool.
      // Since we rely on the chat agent loop, we'll send a message back.
      if (onActionClick) {
        onActionClick(`Add these ${items.length} items to my pantry tracking`)
      }
      
      setAdded(true)
      toast({
        title: "Items added to queue",
        description: "Your pantry is being updated.",
      })
    } catch (error) {
      console.error("Failed to add items", error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'produce': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'dairy': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'protein': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'grains': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
      default: return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
    }
  }

  return (
    <Card className="w-full overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="relative h-48 w-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
        <img 
          src={imageUrl} 
          alt="Pantry Scan" 
          className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
        />
        <div className="absolute bottom-4 left-4 z-20 text-white">
          <Badge className="mb-2 bg-primary/90 hover:bg-primary border-none shadow-sm backdrop-blur-md">
            <Search className="h-3 w-3 mr-1" /> Vision Analysis
          </Badge>
          <h3 className="text-xl font-bold tracking-tight">Smart Pantry Scan</h3>
        </div>
      </div>

      <CardHeader className="pb-3">
        <CardDescription className="text-base">
          {summary || `I found ${items.length} items in your image.`}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[280px] pr-4">
          <div className="space-y-3">
            {items.map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start justify-between p-3 rounded-lg border border-border/40 bg-background/50 hover:bg-accent/50 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div className={cn("p-2 rounded-md", getCategoryColor(item.category))}>
                    <Package className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-foreground">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground flex items-center">
                        Qty: {item.quantity}
                      </span>
                      {item.expiryEstimate && (
                        <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-sm">
                          <Calendar className="h-3 w-3 mr-1" />
                          Exp: {item.expiryEstimate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="capitalize text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.category}
                </Badge>
              </motion.div>
            ))}
          </div>
        </ScrollArea>

        <Separator className="my-4" />

        <div className="flex gap-2">
          <Button 
            className="w-full font-medium shadow-sm active:scale-95 transition-all" 
            size="lg"
            onClick={handleAddToPantry}
            disabled={added || loading}
          >
            {added ? (
              <>
                <Check className="mr-2 h-4 w-4" /> Added to Pantry
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Add All Items
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
