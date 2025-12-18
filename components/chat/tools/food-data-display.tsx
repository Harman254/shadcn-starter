"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { 
  Apple, 
  DollarSign, 
  MapPin, 
  Repeat, 
  Heart, 
  Scale,
  Flame,
  Drumstick,
  Wheat,
  Droplets,
  ExternalLink,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Info,
  Zap
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

interface FoodDataDisplayProps {
  data: {
    query: string
    queryType: string
    foodItem?: string
    summary: string
    nutrition?: {
      servingSize?: string
      calories?: number
      protein?: number
      carbs?: number
      fat?: number
      fiber?: number
      sugar?: number
      sodium?: number
      vitamins?: Array<{ name: string; amount: string; dailyValue?: string }>
      minerals?: Array<{ name: string; amount: string; dailyValue?: string }>
      glycemicIndex?: number
      allergens?: string[]
    }
    pricing?: {
      item: string
      prices: Array<{ store: string; price: string; unit: string; notes?: string }>
      averagePrice?: string
      currency: string
      lastUpdated?: string
    }
    availability?: {
      item: string
      isAvailableLocally: boolean
      stores: Array<{ name: string; location?: string; notes?: string }>
      alternatives?: string[]
      onlineOptions?: string[]
    }
    substitutions?: Array<{
      name: string
      ratio: string
      notes: string
      bestFor?: string[]
    }>
    healthFacts?: {
      summary: string
      benefits?: string[]
      concerns?: string[]
      recommendation?: string
    }
    comparison?: {
      items: string[]
      winner?: string
      summary: string
      differences?: Array<{ metric: string; values: string[] }>
    }
    sources?: Array<{ name: string; url?: string }>
  }
  onActionClick?: (action: string) => void
}

export function FoodDataDisplay({ data, onActionClick }: FoodDataDisplayProps) {
  const queryTypeLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    nutrition: { label: "Nutrition Facts", icon: <Apple className="h-4 w-4" />, color: "bg-green-500/10 text-green-600 border-green-500/20" },
    price: { label: "Price Check", icon: <DollarSign className="h-4 w-4" />, color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
    availability: { label: "Availability", icon: <MapPin className="h-4 w-4" />, color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
    substitution: { label: "Substitutes", icon: <Repeat className="h-4 w-4" />, color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
    health_fact: { label: "Health Facts", icon: <Heart className="h-4 w-4" />, color: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
    comparison: { label: "Comparison", icon: <Scale className="h-4 w-4" />, color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
  }

  const typeInfo = queryTypeLabels[data.queryType] || queryTypeLabels.nutrition

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-background to-muted/20 shadow-lg">
        {/* Header */}
        <CardHeader className="pb-3 space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={cn("gap-1.5 px-3 py-1", typeInfo.color)}>
              {typeInfo.icon}
              {typeInfo.label}
            </Badge>
            {data.foodItem && (
              <span className="text-sm font-medium text-muted-foreground">
                {data.foodItem}
              </span>
            )}
          </div>
          <CardTitle className="text-lg font-semibold leading-snug">
            {data.summary}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Nutrition Section */}
          {data.nutrition && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Apple className="h-4 w-4 text-green-500" />
                Nutritional Information
                {data.nutrition.servingSize && (
                  <span className="text-xs font-normal text-muted-foreground">
                    per {data.nutrition.servingSize}
                  </span>
                )}
              </h4>
              
              {/* Macro Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {data.nutrition.calories !== undefined && (
                  <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-3 border border-orange-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <span className="text-xs text-muted-foreground">Calories</span>
                    </div>
                    <span className="text-xl font-bold text-orange-600">{data.nutrition.calories}</span>
                    <span className="text-xs text-muted-foreground ml-1">kcal</span>
                  </div>
                )}
                {data.nutrition.protein !== undefined && (
                  <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-xl p-3 border border-red-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Drumstick className="h-4 w-4 text-red-500" />
                      <span className="text-xs text-muted-foreground">Protein</span>
                    </div>
                    <span className="text-xl font-bold text-red-600">{data.nutrition.protein}g</span>
                  </div>
                )}
                {data.nutrition.carbs !== undefined && (
                  <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-xl p-3 border border-amber-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Wheat className="h-4 w-4 text-amber-500" />
                      <span className="text-xs text-muted-foreground">Carbs</span>
                    </div>
                    <span className="text-xl font-bold text-amber-600">{data.nutrition.carbs}g</span>
                  </div>
                )}
                {data.nutrition.fat !== undefined && (
                  <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-3 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <span className="text-xs text-muted-foreground">Fat</span>
                    </div>
                    <span className="text-xl font-bold text-blue-600">{data.nutrition.fat}g</span>
                  </div>
                )}
              </div>

              {/* Additional Nutrition */}
              {(data.nutrition.fiber || data.nutrition.sugar || data.nutrition.glycemicIndex) && (
                <div className="flex flex-wrap gap-2">
                  {data.nutrition.fiber && (
                    <Badge variant="secondary" className="gap-1">
                      Fiber: {data.nutrition.fiber}g
                    </Badge>
                  )}
                  {data.nutrition.sugar && (
                    <Badge variant="secondary" className="gap-1">
                      Sugar: {data.nutrition.sugar}g
                    </Badge>
                  )}
                  {data.nutrition.glycemicIndex && (
                    <Badge variant="secondary" className="gap-1">
                      GI: {data.nutrition.glycemicIndex}
                    </Badge>
                  )}
                </div>
              )}

              {/* Allergens */}
              {data.nutrition.allergens && data.nutrition.allergens.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-muted-foreground">Allergens:</span>
                  <div className="flex flex-wrap gap-1">
                    {data.nutrition.allergens.map((allergen, i) => (
                      <Badge key={i} variant="destructive" className="text-xs">
                        {allergen}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pricing Section */}
          {data.pricing && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-amber-500" />
                Price Comparison
              </h4>
              <div className="space-y-2">
                {data.pricing.prices.map((price, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border",
                      index === 0 ? "bg-green-500/5 border-green-500/20" : "bg-muted/30 border-border/50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{price.store}</span>
                      {index === 0 && (
                        <Badge className="bg-green-500/20 text-green-600 text-xs">Best Price</Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lg">
                        {data.pricing?.currency}{price.price}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">/{price.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
              {data.pricing.averagePrice && (
                <p className="text-sm text-muted-foreground text-center">
                  Average price: {data.pricing.currency}{data.pricing.averagePrice}
                </p>
              )}
            </div>
          )}

          {/* Availability Section */}
          {data.availability && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-500" />
                Where to Buy
              </h4>
              <div className={cn(
                "p-3 rounded-lg border flex items-center gap-3",
                data.availability.isAvailableLocally 
                  ? "bg-green-500/5 border-green-500/20" 
                  : "bg-amber-500/5 border-amber-500/20"
              )}>
                {data.availability.isAvailableLocally ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                )}
                <span className="font-medium">
                  {data.availability.isAvailableLocally 
                    ? "Available locally" 
                    : "Limited local availability"}
                </span>
              </div>
              {data.availability.stores.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {data.availability.stores.map((store, i) => (
                    <Badge key={i} variant="outline" className="gap-1">
                      <ShoppingBag className="h-3 w-3" />
                      {store.name}
                    </Badge>
                  ))}
                </div>
              )}
              {data.availability.alternatives && data.availability.alternatives.length > 0 && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Alternatives: </span>
                  {data.availability.alternatives.join(", ")}
                </div>
              )}
            </div>
          )}

          {/* Substitutions Section */}
          {data.substitutions && data.substitutions.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Repeat className="h-4 w-4 text-purple-500" />
                Substitutes
              </h4>
              <div className="space-y-2">
                {data.substitutions.map((sub, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border border-border/50 bg-muted/20"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{sub.name}</span>
                      <Badge variant="secondary" className="text-xs">{sub.ratio}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{sub.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Health Facts Section */}
          {data.healthFacts && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-500" />
                Health Information
              </h4>
              <div className="p-4 rounded-lg bg-gradient-to-br from-rose-500/5 to-pink-500/5 border border-rose-500/20">
                <p className="text-sm mb-3">{data.healthFacts.summary}</p>
                {data.healthFacts.benefits && data.healthFacts.benefits.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs font-medium text-green-600 flex items-center gap-1 mb-1">
                      <TrendingUp className="h-3 w-3" /> Benefits
                    </span>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {data.healthFacts.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-3 w-3 text-green-500 mt-1 shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {data.healthFacts.concerns && data.healthFacts.concerns.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs font-medium text-amber-600 flex items-center gap-1 mb-1">
                      <TrendingDown className="h-3 w-3" /> Considerations
                    </span>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {data.healthFacts.concerns.map((c, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Info className="h-3 w-3 text-amber-500 mt-1 shrink-0" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {data.healthFacts.recommendation && (
                  <div className="mt-3 p-2 bg-primary/5 rounded-md border border-primary/20">
                    <span className="text-xs font-medium text-primary flex items-center gap-1">
                      <Zap className="h-3 w-3" /> Recommendation
                    </span>
                    <p className="text-sm mt-1">{data.healthFacts.recommendation}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Comparison Section */}
          {data.comparison && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Scale className="h-4 w-4 text-indigo-500" />
                Comparison: {data.comparison.items.join(" vs ")}
              </h4>
              <div className="p-4 rounded-lg bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/20">
                {data.comparison.winner && (
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-indigo-500/20 text-indigo-600">
                      🏆 Winner: {data.comparison.winner}
                    </Badge>
                  </div>
                )}
                <p className="text-sm">{data.comparison.summary}</p>
              </div>
            </div>
          )}

          {/* Sources */}
          {data.sources && data.sources.length > 0 && (
            <div className="pt-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" />
                Sources: 
                <span className="ml-1">
                  {data.sources.map((s, i) => (
                    <span key={i}>
                      {s.url ? (
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {s.name}
                        </a>
                      ) : s.name}
                      {i < data.sources!.length - 1 && ", "}
                    </span>
                  ))}
                </span>
              </p>
            </div>
          )}
        </CardContent>
        {onActionClick && (data.foodItem || data.query) && (
          <div className="p-4 pt-0 flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => onActionClick(`Recipes using ${data.foodItem || data.query}`)}
            >
              <Drumstick className="h-4 w-4" /> Find Recipes
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
