"use client"

import { useState, useEffect } from "react"
import { Search, ShoppingBag, Check, Filter, DollarSign, CheckCircle2, Circle, MapPin, TrendingUp, Clock,  Zap, Target, BarChart3, Rocket, Heart, Star } from "lucide-react"
import { useGroceryListStore } from "@/data/grocery-store"
import { motion, AnimatePresence } from "framer-motion"

interface GroceryListProps {
  id: string | null;
}

const GroceryList = ({ id }: GroceryListProps) => {
  // Connect to Zustand store for state management
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
  } = useGroceryListStore();
  
  // Local state for UI concerns like dark mode
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Fetch grocery list on mount or when the ID changes
  useEffect(() => {
    if (id) {
      fetchGroceryList(id)
    }
  }, [id, fetchGroceryList])
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  // Format price with currency symbol from the store's userLocation
  const formatPrice = (amount: number): string => {
    const currencySymbol = userLocation?.currencySymbol || "$"
    return `${currencySymbol}${amount.toFixed(2)}`
  }

  // Get calculated values from the store
  const totals = getTotals()
  const completionPercentage = getCompletionPercentage()

  const themeClasses = isDarkMode ? 'dark' : ''

  if (isLoading) {
    return (
      <div className={`${themeClasses} min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-indigo-900/30 transition-all duration-1000`}>
        <div className="w-full max-w-7xl mx-auto p-6 lg:p-8">
          <div className="animate-pulse space-y-8">
            <div className="text-center space-y-8 relative">
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="absolute animate-bounce" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s`, animationDuration: `${2 + Math.random() * 2}s` }}>
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-30"></div>
                  </div>
                ))}
              </div>
              <div className="relative z-10">
                <div className="inline-block">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-spin shadow-2xl shadow-purple-500/50"></div>
                </div>
                <div className="mt-6">
                  <div className="h-16 bg-gradient-to-r from-purple-200 via-pink-200 to-rose-200 dark:from-purple-700 dark:via-pink-700 dark:to-rose-700 rounded-3xl w-96 mx-auto animate-pulse shadow-xl"></div>
                </div>
                <div className="mt-4">
                  <div className="h-6 bg-purple-100 dark:bg-purple-800 rounded-full w-64 mx-auto animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="text-center text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
              Preparing your magical shopping experience...
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
     <div className={`${themeClasses} min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-slate-900 dark:via-red-900/20 dark:to-orange-900/30 flex items-center justify-center p-6`}>
         <div className="w-full max-w-md border-red-200/50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-10 text-center rounded-3xl shadow-2xl hover:shadow-red-500/25 transition-all duration-500">
           <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/50 dark:to-orange-900/50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
             <Zap className="w-12 h-12 text-red-500 dark:text-red-400 animate-bounce" />
           </div>
           <h3 className="text-3xl font-black text-red-800 dark:text-red-200 mb-4 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Oops! Magic Failed</h3>
           <p className="text-red-600 dark:text-red-300 text-md mb-8">{error}</p>
           <button 
             onClick={() => fetchGroceryList(id)} 
             className="h-14 px-8 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
           >
             ✨ Try Again
           </button>
         </div>
     </div>
   )
 }

  return (
    <div className={`${themeClasses} min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-indigo-900/30 transition-all duration-1000 relative overflow-hidden`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="absolute animate-float opacity-20" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 5}s`, animationDuration: `${6 + Math.random() * 4}s` }}>
            <Star className="w-8 h-8 text-purple-400 dark:text-purple-300" />
          </div>
        ))}
      </div>

      <div className="w-full max-w-7xl mx-auto p-6 lg:p-8 space-y-8 relative z-10">
        <div className="text-center space-y-6 relative">
          <button onClick={toggleDarkMode} className="absolute top-0 right-0 p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-purple-200/50 dark:border-purple-700/50">
            {isDarkMode ? <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"></div> : <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"></div>}
          </button>
          <div className="inline-flex items-center gap-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full px-8 py-4 shadow-2xl border border-purple-200/50 dark:border-purple-700/50 hover:shadow-purple-500/25 transition-all duration-500">
            <div className="relative">
              <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-4 h-4 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full animate-ping opacity-30"></div>
            </div>
            <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-pulse" />
            <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Magical Shopping Experience</span>
            <Heart className="w-5 h-5 text-pink-500 animate-pulse" />
          </div>
          <h1 className="text-6xl lg:text-8xl font-black relative">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 dark:from-purple-400 dark:via-pink-400 dark:to-rose-400 bg-clip-text text-transparent animate-pulse">Grocery</span>
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 dark:from-indigo-400 dark:via-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">Paradise</span>
            <div className="absolute -top-4 -right-4 animate-bounce"><Star className="w-12 h-12 text-yellow-400 fill-current" /></div>
          </h1>
          {userLocation && (
            <div className="flex items-center justify-center gap-3 text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-purple-200/30 dark:border-purple-700/30">
                <MapPin className="w-5 h-5 text-purple-500" />
                <span className="font-bold text-purple-800 dark:text-purple-200">{userLocation.city}, {userLocation.country}</span>
              </div>
              <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-bold animate-pulse">🌟 Live Pricing</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group relative"><div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-all duration-500 animate-pulse"></div><div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 rounded-3xl p-8 shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 hover:scale-105 overflow-hidden"><div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full -mr-16 -mt-16"></div><div className="relative z-10"><div className="flex items-center justify-between mb-6"><div className="flex items-center gap-3"><div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg"><DollarSign className="w-6 h-6 text-white" /></div><div><h3 className="text-lg font-bold text-slate-800 dark:text-white">Total Cost</h3><p className="text-sm text-slate-500 dark:text-slate-400">All items</p></div></div><TrendingUp className="w-6 h-6 text-purple-500 animate-bounce" /></div><div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">{formatPrice(totals.total)}</div><p className="text-slate-600 dark:text-slate-300 font-semibold">{groceryList.length} magical items</p></div></div></div>
          <div className="group relative"><div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-all duration-500 animate-pulse"></div><div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 rounded-3xl p-8 shadow-2xl hover:shadow-emerald-500/25 transition-all duration-500 hover:scale-105 overflow-hidden"><div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 rounded-full -mr-16 -mt-16"></div><div className="relative z-10"><div className="flex items-center justify-between mb-6"><div className="flex items-center gap-3"><div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg"><CheckCircle2 className="w-6 h-6 text-white" /></div><div><h3 className="text-lg font-bold text-slate-800 dark:text-white">Completed</h3><p className="text-sm text-slate-500 dark:text-slate-400">Checked off</p></div></div><Rocket className="w-6 h-6 text-emerald-500 animate-bounce" /></div><div className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-2">{formatPrice(totals.completed)}</div><p className="text-slate-600 dark:text-slate-300 font-semibold">{groceryList.filter((item) => item.checked).length} items collected ✨</p></div></div></div>
          <div className="group relative"><div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-rose-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-all duration-500 animate-pulse"></div><div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 rounded-3xl p-8 shadow-2xl hover:shadow-orange-500/25 transition-all duration-500 hover:scale-105 overflow-hidden"><div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-rose-400/20 rounded-full -mr-16 -mt-16"></div><div className="relative z-10"><div className="flex items-center justify-between mb-6"><div className="flex items-center gap-3"><div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg"><Target className="w-6 h-6 text-white" /></div><div><h3 className="text-lg font-bold text-slate-800 dark:text-white">Remaining</h3><p className="text-sm text-slate-500 dark:text-slate-400">To collect</p></div></div><Clock className="w-6 h-6 text-orange-500 animate-bounce" /></div><div className="text-4xl font-black bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent mb-2">{formatPrice(totals.remaining)}</div><p className="text-slate-600 dark:text-slate-300 font-semibold">{groceryList.filter((item) => !item.checked).length} items left 🎯</p></div></div></div>
        </div>

        <div className="relative group"><div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl"></div><div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 rounded-3xl p-10 shadow-2xl"><div className="flex justify-between items-center mb-8"><div className="flex items-center gap-4"><div className="relative"><div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl"><BarChart3 className="w-8 h-8 text-white" /></div><div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">   <Star className="w-3 h-3 text-white" /></div></div><div><h2 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Shopping Quest Progress</h2><p className="text-slate-600 dark:text-slate-400 font-semibold">Your magical journey to completion</p></div></div><div className="text-right"><div className="text-5xl font-black bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">{Math.round(completionPercentage)}%</div><p className="text-slate-600 dark:text-slate-400 font-bold">Complete</p></div></div><div className="relative"><div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-6 overflow-hidden shadow-inner"><div className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 h-full rounded-full relative transition-all duration-1000 ease-out shadow-lg" style={{ width: `${completionPercentage}%` }}><div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent rounded-full"></div><div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-full"></div></div></div><div className="absolute -top-2 w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-4 border-white dark:border-slate-800 shadow-2xl flex items-center justify-center transition-all duration-1000 ease-out" style={{ left: `calc(${completionPercentage}% - 20px)` }}><Star className="w-4 h-4 text-white fill-current animate-spin" /></div></div></div></div>

        <div className="relative group"><div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl"></div><div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 rounded-3xl p-8 shadow-2xl"><div className="flex flex-col lg:flex-row gap-6"><div className="relative flex-1 group"><div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl transition-all duration-300"></div><div className="relative"><Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-purple-500 w-6 h-6 z-10" /><input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="🔍 Search for magical items, brands, or categories..." className="w-full pl-16 pr-6 h-16 bg-white/80 dark:bg-slate-700/80 border-2 border-purple-200/50 dark:border-purple-700/50 shadow-xl backdrop-blur-sm focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 rounded-2xl text-lg font-semibold placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-300" /><div className="absolute right-4 top-1/2 transform -translate-y-1/2">   <Star className="w-6 h-6 text-purple-400 animate-pulse" /></div></div></div><div className="relative lg:w-72 group"><div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl transition-all duration-300"></div><div className="relative"><Filter className="absolute left-6 top-1/2 transform -translate-y-1/2 text-pink-500 w-6 h-6 z-10" /><select value={filterStore || ""} onChange={(e) => setFilterStore(e.target.value || null)} className="w-full pl-16 pr-12 h-16 bg-white/80 dark:bg-slate-700/80 border-2 border-pink-200/50 dark:border-pink-700/50 shadow-xl backdrop-blur-sm focus:ring-4 focus:ring-pink-500/30 focus:border-pink-500 rounded-2xl appearance-none cursor-pointer text-lg font-semibold transition-all duration-300"><option value="">All Stores</option>{stores.map((store, index) => (<option key={index} value={store}>{store}</option>))}</select><div className="absolute right-4 top-1/2 transform -translate-y-1/2"><Heart className="w-6 h-6 text-pink-400 animate-pulse" /></div></div></div>{(searchTerm || filterStore) && (<button onClick={clearFilters} className="h-16 px-8 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">✨ Clear Magic</button>)}</div></div></div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-3xl blur-2xl"></div>
          <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden">
            {filteredList.length === 0 ? (
              <div className="text-center py-20 px-8">
                <div className="relative mb-8"><div className="w-32 h-32 bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800 rounded-full flex items-center justify-center mx-auto shadow-2xl"><ShoppingBag className="h-16 w-16 text-purple-500 dark:text-purple-400" /></div><div className="absolute -top-2 -right-2 animate-bounce"><Star className="w-8 h-8 text-yellow-400" /></div></div>
                <h3 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">No magical items found</h3>
                <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 max-w-md mx-auto">Cast a different search spell or adjust your filters to discover amazing items!</p>
                {(searchTerm || filterStore) && (<button onClick={clearFilters} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">🎭 Clear All Filters</button>)}
              </div>
            ) : (
              <div className="divide-y divide-slate-200/30 dark:divide-slate-700/30">
                <AnimatePresence>
                  {filteredList.map((item, index) => (
                    <motion.div key={item.item + index} initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50, transition: { duration: 0.3 } }} transition={{ duration: 0.5, delay: index * 0.05 }}
                      className={`p-8 flex items-center justify-between transition-all duration-500 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 group relative overflow-hidden ${item.checked ? "bg-gradient-to-r from-emerald-50/80 to-cyan-50/80 dark:from-emerald-900/20 dark:to-cyan-900/20" : ""}`}>
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"><div className="absolute top-4 right-4 w-2 h-2 bg-purple-400 rounded-full animate-ping"></div><div className="absolute bottom-4 left-4 w-1 h-1 bg-pink-400 rounded-full animate-pulse"></div></div>
                      <div className="flex items-center space-x-6 flex-1 relative z-10">
                        <motion.button onClick={() => toggleItemCheck(index)} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} className={`flex-shrink-0 w-10 h-10 rounded-full border-3 flex items-center justify-center transition-all duration-500 shadow-xl hover:shadow-2xl ${item.checked ? "bg-gradient-to-r from-emerald-500 to-cyan-500 border-emerald-400 text-white shadow-emerald-500/50" : "border-purple-300 dark:border-purple-600 hover:border-emerald-400 dark:hover:border-emerald-400 bg-white dark:bg-slate-800 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/50 dark:hover:to-pink-900/50"}`}>
                          {item.checked ? <div className="animate-bounce"><Check className="w-5 h-5" /></div> : <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>}
                        </motion.button>
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-xl font-bold transition-all duration-500 ${item.checked ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-900 dark:text-white group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent"}`}>{item.checked ? "✅ " : "🛒 "}{item.item}</h3>
                          <div className="flex items-center flex-wrap gap-4 mt-3">
                            <div className="flex items-center bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg border border-purple-200/30 dark:border-purple-700/30"><ShoppingBag className="w-4 h-4 mr-2 text-purple-500" /><span className="font-bold text-purple-800 dark:text-purple-200">{item.quantity}</span></div>
                            <div className="flex items-center bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg border border-emerald-200/30 dark:border-emerald-700/30"><DollarSign className="w-4 h-4 mr-2 text-emerald-500" /><span className="font-bold text-emerald-800 dark:text-emerald-200">{item.estimatedPrice}</span></div>
                            <div className="flex items-center bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg border border-blue-200/30 dark:border-blue-700/30"><MapPin className="w-4 h-4 mr-2 text-blue-500" /><span className="font-bold text-blue-800 dark:text-blue-200 text-sm">{item.suggestedLocation}</span></div>
                            <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-2 rounded-full text-sm font-bold shadow-lg">{item.category}</div>
                          </div>
                        </div>
                      </div>
                      {item.checked && <div className="flex-shrink-0 animate-bounce"><div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl"><CheckCircle2 className="w-7 h-7 text-white" /></div></div>}
                      {!item.checked && <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300"><div className="flex items-center gap-2"><Star className="w-5 h-5 text-purple-400 animate-pulse" /><span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Tap to collect!</span></div></div>}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {completionPercentage > 0 && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="fixed bottom-8 right-8 z-50">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-3xl shadow-2xl border-4 border-white/20 backdrop-blur-sm hover:scale-110 transition-transform duration-300">
              <div className="text-center">
                <div className="text-3xl font-black mb-2">{Math.round(completionPercentage)}% ✨</div>
                <div className="text-sm font-bold">Quest Progress!</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(5deg); }
          66% { transform: translateY(-10px) rotate(-5deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default GroceryList