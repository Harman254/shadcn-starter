"use client"

import React from "react"
import { useState, useEffect, useCallback } from "react"
import { useSession } from "@/lib/auth-client"
import toast from "react-hot-toast"
import { Crown, Lock, Rocket, Zap } from "lucide-react"

export interface Subscription {
  id: string
  status: "active" | "canceled" | "past_due" | "incomplete" | "trialing"
  plan: "free" | "pro" | "enterprise"
  currentPeriodEnd: Date
  features: string[]
}

export interface ProFeature {
  id: string
  name: string
  description: string
  icon?: React.ComponentType<{ className?: string }>
  requiredPlan: "pro" | "enterprise"
  category: "meal-planning" | "recipes" | "analytics" | "premium" | "advanced"
}

export interface UseProFeaturesReturn {
  // Core state
  isPro: boolean
  isEnterprise: boolean
  isLoading: boolean
  subscription: Subscription | null
  
  // Feature access
  hasFeature: (featureId: string) => boolean
  canAccess: (feature: ProFeature) => boolean
  isFeatureLocked: (featureId: string) => boolean
  
  // Actions
  unlockFeature: (feature: ProFeature) => void
  showUpgradeModal: (feature?: ProFeature) => void
  checkSubscription: () => Promise<void>
  
  // UI helpers
  getFeatureIcon: (feature: ProFeature) => React.ReactNode
  getUpgradeMessage: (feature: ProFeature) => string
  getFeatureBadge: (feature: ProFeature) => React.ReactNode
}

// Define available pro features
export const PRO_FEATURES: Record<string, ProFeature> = {
  // Meal Planning Features
  "unlimited-meal-plans": {
    id: "unlimited-meal-plans",
    name: "Unlimited Meal Plans",
    description: "Create unlimited meal plans without restrictions",
    icon: Crown,
    requiredPlan: "pro",
    category: "meal-planning"
  },
  "advanced-meal-customization": {
    id: "advanced-meal-customization",
    name: "Advanced Meal Customization",
    description: "Customize meals with detailed nutrition and preferences",
    icon: Rocket,
    requiredPlan: "pro",
    category: "meal-planning"
  },
  "meal-plan-templates": {
    id: "meal-plan-templates",
    name: "Premium Meal Plan Templates",
    description: "Access to curated meal plan templates",
    icon: Zap,
    requiredPlan: "pro",
    category: "meal-planning"
  },
  
  // Recipe Features
  "unlimited-favorites": {
    id: "unlimited-favorites",
    name: "Unlimited Favorites",
    description: "Save unlimited recipes to your favorites",
    icon: Crown,
    requiredPlan: "pro",
    category: "recipes"
  },
  "recipe-import": {
    id: "recipe-import",
    name: "Recipe Import",
    description: "Import recipes from external sources",
    icon: Zap,
    requiredPlan: "pro",
    category: "recipes"
  },
  
  // Analytics Features
  "nutrition-analytics": {
    id: "nutrition-analytics",
    name: "Nutrition Analytics",
    description: "Detailed nutrition tracking and analytics",
    icon: Rocket,
    requiredPlan: "pro",
    category: "analytics"
  },
  "meal-plan-insights": {
    id: "meal-plan-insights",
    name: "Meal Plan Insights",
    description: "Advanced insights and recommendations",
    icon: Crown,
    requiredPlan: "enterprise",
    category: "analytics"
  },
  
  // Premium Features
  "priority-support": {
    id: "priority-support",
    name: "Priority Support",
    description: "Get priority customer support",
    icon: Zap,
    requiredPlan: "pro",
    category: "premium"
  },
  "advanced-export": {
    id: "advanced-export",
    name: "Advanced Export",
    description: "Export meal plans in multiple formats",
    icon: Rocket,
    requiredPlan: "pro",
    category: "premium"
  }
}

export const useProFeatures = (): UseProFeaturesReturn => {
  const { data: session } = useSession()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check subscription status
  const checkSubscription = useCallback(async () => {
    if (!session?.user?.id) {
      setSubscription(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch("/api/subscription")
      
      if (response.ok) {
        const data = await response.json()
        if (data.subscription) {
          setSubscription({
            id: data.subscription.id,
            status: data.subscription.status,
            plan: data.subscription.plan,
            currentPeriodEnd: new Date(data.subscription.currentPeriodEnd),
            features: data.subscription.features || []
          })
        } else {
          // Fallback to free plan if no subscription data
          setSubscription({
            id: "free",
            status: "active",
            plan: "free",
            currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            features: []
          })
        }
      } else {
        console.error("Failed to fetch subscription:", response.status, response.statusText)
        // Default to free plan if API fails
        setSubscription({
          id: "free",
          status: "active",
          plan: "free",
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          features: []
        })
      }
    } catch (error) {
      console.error("Error checking subscription:", error)
      // Default to free plan on error
      setSubscription({
        id: "free",
        status: "active",
        plan: "free",
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        features: []
      })
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.id])

  // Check if user has pro subscription
  const isPro = subscription?.plan === "pro" || subscription?.plan === "enterprise"
  const isEnterprise = subscription?.plan === "enterprise"

  // Check if user has access to a specific feature
  const hasFeature = useCallback((featureId: string): boolean => {
    if (!subscription) return false
    
    const feature = PRO_FEATURES[featureId]
    if (!feature) return false

    if (feature.requiredPlan === "pro") {
      return isPro
    }
    
    if (feature.requiredPlan === "enterprise") {
      return isEnterprise
    }

    return false
  }, [subscription, isPro, isEnterprise])

  // Check if user can access a feature
  const canAccess = useCallback((feature: ProFeature): boolean => {
    return hasFeature(feature.id)
  }, [hasFeature])

  // Check if a feature is locked for the user
  const isFeatureLocked = useCallback((featureId: string): boolean => {
    return !hasFeature(featureId)
  }, [hasFeature])

  // Unlock feature (show upgrade prompt)
  const unlockFeature = useCallback((feature: ProFeature) => {
    if (canAccess(feature)) {
      toast.success(`${feature.name} is already available!`)
      return
    }

    showUpgradeModal(feature)
  }, [canAccess])

  // Show upgrade modal
  const showUpgradeModal = useCallback((feature?: ProFeature) => {
    if (!session?.user) {
      toast.error("Please sign in to access premium features")
      return
    }

    const message = feature 
      ? `Upgrade to Pro to unlock ${feature.name}`
      : "Upgrade to Pro to unlock all premium features"
    
    toast.error(message, {
      duration: 4000,
      icon: "👑"
    })

    // You can integrate with your upgrade modal here
    // For now, we'll just show a toast
    console.log("Show upgrade modal for:", feature?.name || "general upgrade")
  }, [session?.user])

  // Get feature icon
  const getFeatureIcon = useCallback((feature: ProFeature): React.ReactNode => {
    const Icon = feature.icon || Lock
    return React.createElement(Icon, { className: "w-4 h-4" })
  }, [])

  // Get upgrade message for a feature
  const getUpgradeMessage = useCallback((feature: ProFeature): string => {
    if (canAccess(feature)) {
      return `${feature.name} is available!`
    }

    const planName = feature.requiredPlan === "enterprise" ? "Enterprise" : "Pro"
    return `Upgrade to ${planName} to unlock ${feature.name}`
  }, [canAccess])

  // Get feature badge
  const getFeatureBadge = useCallback((feature: ProFeature): React.ReactNode => {
    if (canAccess(feature)) {
      return React.createElement(
        "div",
        {
          className: "inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium"
        },
        React.createElement(Crown, { className: "w-3 h-3" }),
        "Pro"
      )
    }

    return React.createElement(
      "div",
      {
        className: "inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs font-medium"
      },
      React.createElement(Lock, { className: "w-3 h-3" }),
      "Locked"
    )
  }, [canAccess])

  // Check subscription on mount and when session changes
  useEffect(() => {
    checkSubscription()
  }, [checkSubscription])

  return {
    // Core state
    isPro,
    isEnterprise,
    isLoading,
    subscription,
    
    // Feature access
    hasFeature,
    canAccess,
    isFeatureLocked,
    
    // Actions
    unlockFeature,
    showUpgradeModal,
    checkSubscription,
    
    // UI helpers
    getFeatureIcon,
    getUpgradeMessage,
    getFeatureBadge
  }
}

// Convenience hooks for specific features
export const useUnlimitedMealPlans = () => {
  const { hasFeature, unlockFeature } = useProFeatures()
  const feature = PRO_FEATURES["unlimited-meal-plans"]
  
  return {
    isUnlocked: hasFeature("unlimited-meal-plans"),
    unlock: () => unlockFeature(feature)
  }
}

export const useAdvancedCustomization = () => {
  const { hasFeature, unlockFeature } = useProFeatures()
  const feature = PRO_FEATURES["advanced-meal-customization"]
  
  return {
    isUnlocked: hasFeature("advanced-meal-customization"),
    unlock: () => unlockFeature(feature)
  }
}

export const useNutritionAnalytics = () => {
  const { hasFeature, unlockFeature } = useProFeatures()
  const feature = PRO_FEATURES["nutrition-analytics"]
  
  return {
    isUnlocked: hasFeature("nutrition-analytics"),
    unlock: () => unlockFeature(feature)
  }
}

export const useUnlimitedFavorites = () => {
  const { hasFeature, unlockFeature } = useProFeatures()
  const feature = PRO_FEATURES["unlimited-favorites"]
  
  return {
    isUnlocked: hasFeature("unlimited-favorites"),
    unlock: () => unlockFeature(feature)
  }
} 