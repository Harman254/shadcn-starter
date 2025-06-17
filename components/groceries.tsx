"use client"

import { useState, useEffect } from "react"
import { Search, ShoppingBag, Check, Filter, DollarSign, CheckCircle2, Circle, MapPin, TrendingUp, Clock, Rocket, Zap, Target, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useGroceryListStore } from "@/data/grocery-store"
import { motion, AnimatePresence } from "framer-motion"

interface GroceryListProps {
  id: string | null;
  lat: string | null;
  lon: string | null;
}

const GroceryList = ({ id, lat, lon }: GroceryListProps) => {
  // Use the Zustand store
  const {
    groceryList,
    filteredList,
    isLoading,
    error,
    searchTerm,
    filterStore,
    stores,
    userLocation,
    fetchGroceryList,
    toggleItemCheck,
    setSearchTerm,
    setFilterStore,
    clearFilters,
    getTotals,
    getCompletionPercentage
  } = useGroceryListStore()

  // Format price with currency symbol
  const formatPrice = (amount: number): string => {
    const currencySymbol = userLocation?.currencyCode || "$"
    return `${currencySymbol}${amount.toFixed(2)}`
  }

  // Fetch grocery list when component mounts or id changes
  useEffect(() => {
    fetchGroceryList(id, lat, lon)
  }, [id, lat, lon, fetchGroceryList])

  // Calculate totals and completion percentage
  const totals = getTotals()
  const completionPercentage = getCompletionPercentage()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="w-full max-w-7xl mx-auto p-6 lg:p-8">
          <div className="animate-pulse space-y-8">
            {/* Header skeleton */}
            <div className="text-center space-y-4">
              <div className="h-12 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-2xl w-1/2 mx-auto"></div>
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/3 mx-auto"></div>
            </div>
            
            {/* Cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700"></div>
              ))}
            </div>
            
            {/* Progress skeleton */}
            <div className="h-24 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700"></div>
            
            {/* Search skeleton */}
            <div className="h-20 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700"></div>
            
            {/* Items skeleton */}
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-red-200/50 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50 shadow-2xl backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">Oops! Something went wrong</h3>
            <p className="text-red-600 dark:text-red-300 text-sm mb-6">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="w-full max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-white/20 dark:border-slate-700/50">
            <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Smart Shopping List</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
            Grocery Shopping
          </h1>
          {userLocation && (
            <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
              <MapPin className="w-4 h-4" />
              <span className="font-medium">{userLocation.city}, {userLocation.country}</span>
              <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-full">
                Live Pricing
              </span>
            </div>
          )}
        </motion.div>

        {/* Price Summary Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent"></div>
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-white/90 flex items-center justify-between">
                <span className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Total Cost
                </span>
                <TrendingUp className="w-4 h-4 opacity-60" />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 relative z-10">
              <div className="text-3xl font-bold text-white mb-1">{formatPrice(totals.total)}</div>
              <p className="text-blue-100 text-sm">{groceryList.length} items</p>
            </CardContent>
            <div className="absolute top-4 right-4 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white/60" />
            </div>
          </Card>

          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-transparent"></div>
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-white/90 flex items-center justify-between">
                <span className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Completed
                </span>
                <Rocket className="w-4 h-4 opacity-60" />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 relative z-10">
              <div className="text-3xl font-bold text-white mb-1">{formatPrice(totals.completed)}</div>
              <p className="text-emerald-100 text-sm">
                {groceryList.filter((item) => item.checked).length} items checked
              </p>
            </CardContent>
            <div className="absolute top-4 right-4 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-white/60" />
            </div>
          </Card>

          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-orange-500 to-orange-600 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-transparent"></div>
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-white/90 flex items-center justify-between">
                <span className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Remaining
                </span>
                <Clock className="w-4 h-4 opacity-60" />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 relative z-10">
              <div className="text-3xl font-bold text-white mb-1">{formatPrice(totals.remaining)}</div>
              <p className="text-orange-100 text-sm">
                {groceryList.filter((item) => !item.checked).length} items left
              </p>
            </CardContent>
            <div className="absolute top-4 right-4 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-white/60" />
            </div>
          </Card>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl">
            <CardContent className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-lg font-semibold text-slate-900 dark:text-white">Shopping Progress</span>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Track your shopping journey</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">{Math.round(completionPercentage)}%</span>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Complete</p>
                </div>
              </div>
              <div className="relative">
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 h-full rounded-full relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                  </motion.div>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full border-4 border-white dark:border-slate-800 shadow-lg"></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1 group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search for items, brands, or categories..."
                      className="pl-12 h-12 bg-white/50 dark:bg-slate-700/50 border-0 shadow-lg backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 rounded-xl"
                    />
                  </div>
                </div>

                <div className="relative lg:w-64 group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 z-10" />
                    <select
                      value={filterStore || ""}
                      onChange={(e) => setFilterStore(e.target.value || null)}
                      className="w-full pl-12 pr-4 h-12 bg-white/50 dark:bg-slate-700/50 border-0 shadow-lg backdrop-blur-sm focus:ring-2 focus:ring-purple-500/50 rounded-xl appearance-none cursor-pointer"
                    >
                      <option value="">All Stores</option>
                      {stores.map((store, index) => (
                        <option key={index} value={store}>
                          {store}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {(searchTerm || filterStore) && (
                  <Button 
                    onClick={clearFilters} 
                    variant="outline"
                    className="h-12 px-6 bg-white/50 dark:bg-slate-700/50 border-0 shadow-lg backdrop-blur-sm hover:bg-white/70 dark:hover:bg-slate-700/70 rounded-xl"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Grocery Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl overflow-hidden">
            <CardContent className="p-0">
              {filteredList.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No items found</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                    Try adjusting your search or filter to find what you are looking for.
                  </p>
                  {(searchTerm || filterStore) && (
                    <Button 
                      onClick={clearFilters} 
                      variant="outline"
                      className="bg-white/50 dark:bg-slate-700/50 border-0 shadow-lg backdrop-blur-sm hover:bg-white/70 dark:hover:bg-slate-700/70"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
                  <AnimatePresence>
                    {filteredList.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`p-6 flex items-center justify-between transition-all duration-300 hover:bg-slate-50/50 dark:hover:bg-slate-700/50 group ${
                          item.checked ? "bg-emerald-50/30 dark:bg-emerald-900/20" : ""
                        }`}
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleItemCheck(index)}
                            className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-lg ${
                              item.checked
                                ? "bg-gradient-to-r from-emerald-500 to-green-500 border-emerald-500 text-white shadow-emerald-500/50"
                                : "border-slate-300 dark:border-slate-600 hover:border-emerald-400 dark:hover:border-emerald-400 bg-white dark:bg-slate-800"
                            }`}
                          >
                            {item.checked && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Check className="w-4 h-4" />
                              </motion.div>
                            )}
                          </motion.button>

                          <div className="flex-1 min-w-0">
                            <h3
                              className={`text-lg font-semibold transition-all duration-300 ${
                                item.checked 
                                  ? "line-through text-slate-400 dark:text-slate-500" 
                                  : "text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-200"
                              }`}
                            >
                              {item.item}
                            </h3>
                            <div className="flex items-center space-x-4 mt-2">
                              <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                <DollarSign className="w-4 h-4 mr-1" />
                                <span className="font-semibold text-slate-900 dark:text-white">{item.estimatedPrice}</span>
                              </div>
                              <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                <MapPin className="w-4 h-4 mr-1" />
                                <Badge 
                                  variant="secondary" 
                                  className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-0 shadow-sm"
                                >
                                  {item.suggestedLocation}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {item.checked && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="flex-shrink-0"
                          >
                            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default GroceryList
