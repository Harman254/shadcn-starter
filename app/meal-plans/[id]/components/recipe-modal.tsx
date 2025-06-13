"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { Clock, Users, Flame, ChefHat, Star, Heart, Share2, Bookmark, Timer, Utensils, X } from "lucide-react"

type Meal = {
  name: string
  type: string
  description?: string
  ingredients: string[]
  calories: number
  prepTime?: number
  cookTime?: number
  servings?: number
  difficulty?: string
  rating?: number
  tags?: string[]
}

type RecipeModalProps = {
  meal: Meal | null
  onClose: () => void
}

const RecipeModal = ({ meal, onClose }: RecipeModalProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [activeTab, setActiveTab] = useState<"ingredients" | "nutrition">("ingredients")
  const [visibleIngredients, setVisibleIngredients] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Handle modal visibility and animations
  useEffect(() => {
    if (meal) {
      // Store the previously focused element
      previousFocusRef.current = document.activeElement as HTMLElement

      // Prevent body scroll
      document.body.style.overflow = "hidden"

      // Trigger entrance animation
      requestAnimationFrame(() => {
        setIsVisible(true)
      })

      // Focus the modal
      setTimeout(() => {
        modalRef.current?.focus()
      }, 100)
    } else {
      setIsVisible(false)
      // Restore body scroll
      document.body.style.overflow = ""

      // Restore focus to previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [meal])

  // Handle ingredient animation
  useEffect(() => {
    if (activeTab === "ingredients" && meal && isVisible) {
      setVisibleIngredients(0)
      const timer = setInterval(() => {
        setVisibleIngredients((prev) => {
          if (prev >= meal.ingredients.length) {
            clearInterval(timer)
            return prev
          }
          return prev + 1
        })
      }, 80)
      return () => clearInterval(timer)
    }
  }, [activeTab, meal, isVisible])

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!meal) return

      switch (e.key) {
        case "Escape":
          handleClose()
          break
        case "Tab":
          handleTabKey(e)
          break
      }
    }

    if (meal) {
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [meal])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose()
    }, 200) // Wait for exit animation
  }

  const handleTabKey = (e: KeyboardEvent) => {
    if (!modalRef.current) return

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
  }

  const getTypeColor = (type: string) => {
    const colors = {
      breakfast: "from-amber-400 to-orange-500",
      lunch: "from-emerald-400 to-teal-500",
      dinner: "from-purple-400 to-indigo-500",
      snack: "from-pink-400 to-rose-500",
    }
    return colors[type.toLowerCase() as keyof typeof colors] || "from-gray-400 to-gray-500"
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: "text-green-600 bg-green-50 border-green-200",
      medium: "text-amber-600 bg-amber-50 border-amber-200",
      hard: "text-red-600 bg-red-50 border-red-200",
    }
    return colors[difficulty?.toLowerCase() as keyof typeof colors] || "text-gray-600 bg-gray-50 border-gray-200"
  }

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))

  if (!meal || !mounted) return null

  const modalContent = (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        backgroundColor: isVisible ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0)",
        backdropFilter: isVisible ? "blur(8px)" : "blur(0px)",
      }}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Modal Container */}
      <div
        ref={modalRef}
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all duration-300 ${
          isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        style={{
          maxHeight: "calc(100vh - 2rem)",
          maxWidth: "calc(100vw - 2rem)",
        }}
      >
        {/* Header - Fixed */}
        <div
          className={`relative h-32 sm:h-48 bg-gradient-to-r ${getTypeColor(meal.type)} overflow-hidden flex-shrink-0`}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSIjZmZmZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgogICAgPC9wYXR0ZXJuPgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3BhdHRlcm4pIi8+Cjwvc3ZnPgo=')] opacity-30" />
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 z-50 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center group transition-all border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
            type="button"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:scale-110 transition-transform" />
          </button>
          <div className="relative z-10 h-full flex flex-col justify-end p-3 sm:p-6 text-white">
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 text-white/80" />
              <span className="text-xs sm:text-sm font-medium capitalize tracking-wide">{meal.type}</span>
            </div>
            <h1
              id="modal-title"
              className="text-lg sm:text-3xl font-bold mb-1 sm:mb-2 drop-shadow-lg line-clamp-2 sm:line-clamp-none"
            >
              {meal.name}
            </h1>
            <div className="flex items-center gap-2 sm:gap-4 text-white/90">
              {meal.rating && (
                <div className="flex items-center gap-1">
                  {renderStars(meal.rating)}
                  <span className="ml-1 text-xs sm:text-sm font-medium">{meal.rating}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Flame className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium">{meal.calories} cal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar - Fixed */}
        <div className="px-3 sm:px-6 py-2 sm:py-4 bg-white/50 backdrop-blur-sm border-b border-gray-200/50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            {meal.difficulty && (
              <span
                className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(meal.difficulty)}`}
              >
                {meal.difficulty}
              </span>
            )}
            {meal.tags?.slice(0, 2).map((tag, i) => (
              <span key={i} className="px-1 sm:px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`p-1.5 sm:p-2 rounded-full transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isLiked
                  ? "bg-red-50 text-red-500 focus:ring-red-500"
                  : "bg-gray-50 text-gray-400 hover:text-red-400 focus:ring-gray-500"
              }`}
              aria-label={isLiked ? "Unlike recipe" : "Like recipe"}
            >
              <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${isLiked ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`p-1.5 sm:p-2 rounded-full transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isBookmarked
                  ? "bg-blue-50 text-blue-500 focus:ring-blue-500"
                  : "bg-gray-50 text-gray-400 hover:text-blue-400 focus:ring-gray-500"
              }`}
              aria-label={isBookmarked ? "Remove bookmark" : "Bookmark recipe"}
            >
              <Bookmark className={`w-3 h-3 sm:w-4 sm:h-4 ${isBookmarked ? "fill-current" : ""}`} />
            </button>
            <button
              className="p-1.5 sm:p-2 rounded-full bg-gray-50 text-gray-400 hover:text-gray-600 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              aria-label="Share recipe"
            >
              <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Stats Bar - Fixed */}
        {(meal.prepTime || meal.cookTime || meal.servings) && (
          <div className="px-3 sm:px-6 py-2 sm:py-4 bg-gradient-to-r from-gray-50 to-white flex justify-center gap-4 sm:gap-8 text-gray-600 flex-shrink-0">
            {meal.prepTime && (
              <Stat icon={<Timer className="w-3 h-3 sm:w-4 sm:h-4" />} label={`Prep: ${meal.prepTime}m`} />
            )}
            {meal.cookTime && (
              <Stat icon={<Clock className="w-3 h-3 sm:w-4 sm:h-4" />} label={`Cook: ${meal.cookTime}m`} />
            )}
            {meal.servings && (
              <Stat icon={<Users className="w-3 h-3 sm:w-4 sm:h-4" />} label={`Serves ${meal.servings}`} />
            )}
          </div>
        )}

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {meal.description && (
            <div className="px-6 py-4 bg-white text-center italic text-gray-700">{meal.description}</div>
          )}

          {/* Tabs - Sticky */}
          <div className="px-6 py-4 bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm" role="tablist">
              <Tab
                label="Ingredients"
                icon={<Utensils className="w-4 h-4" />}
                active={activeTab === "ingredients"}
                onClick={() => setActiveTab("ingredients")}
                id="ingredients-tab"
                controls="ingredients-panel"
              />
              <Tab
                label="Nutrition"
                icon={<Flame className="w-4 h-4" />}
                active={activeTab === "nutrition"}
                onClick={() => setActiveTab("nutrition")}
                id="nutrition-tab"
                controls="nutrition-panel"
              />
            </div>
          </div>

          {/* Tab content - Scrollable */}
          <div className="px-6 pb-6">
            {activeTab === "ingredients" && (
              <div className="space-y-3" role="tabpanel" id="ingredients-panel" aria-labelledby="ingredients-tab">
                {meal.ingredients.map((ingredient, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 bg-white rounded-lg border shadow-sm transition-all duration-300 hover:shadow-md ${
                      i < visibleIngredients ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                    }`}
                    style={{ transitionDelay: `${i * 80}ms` }}
                  >
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{ingredient}</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === "nutrition" && (
              <div
                className="bg-white rounded-lg p-6 border shadow-sm grid grid-cols-2 gap-6 text-center"
                role="tabpanel"
                id="nutrition-panel"
                aria-labelledby="nutrition-tab"
              >
                <NutritionItem
                  icon={<Flame className="w-6 h-6 text-white" />}
                  value={meal.calories}
                  label="Calories"
                  color="from-orange-400 to-red-500"
                />
                <NutritionItem
                  icon={<ChefHat className="w-6 h-6 text-white" />}
                  value={meal.ingredients.length}
                  label="Ingredients"
                  color="from-emerald-400 to-teal-500"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

// Reusable components
const Stat = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="flex items-center gap-2">
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </div>
)

const Tab = ({
  label,
  icon,
  active,
  onClick,
  id,
  controls,
}: {
  label: string
  icon: React.ReactNode
  active: boolean
  onClick: () => void
  id: string
  controls: string
}) => (
  <button
    id={id}
    role="tab"
    aria-controls={controls}
    aria-selected={active}
    onClick={onClick}
    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
      active
        ? "bg-gray-900 text-white shadow-sm focus:ring-gray-700"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:ring-gray-500"
    }`}
  >
    <span className="inline-flex items-center gap-2">
      {icon}
      {label}
    </span>
  </button>
)

const NutritionItem = ({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode
  value: number
  label: string
  color: string
}) => (
  <div>
    <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r ${color} flex items-center justify-center`}>
      {icon}
    </div>
    <div className="text-2xl font-bold text-gray-900">{value}</div>
    <div className="text-sm text-gray-500">{label}</div>
  </div>
)

export default RecipeModal
