"use client"

import { useState, useEffect, useMemo } from "react"
import { generateGroceryListFromMealPlan } from "@/ai/flows/generate-grocery-list"
import type { GenerateGroceryListOutput } from "@/ai/flows/generate-grocery-list"
import { Search, ShoppingBag, Check, Filter, DollarSign, CheckCircle2, Circle, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface GroceryItem {
  item: string
  estimatedPrice: string
  suggestedLocation: string
  checked: boolean
}

const GroceryList = ({ id }: { id: string | null }) => {
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([])
  const [filteredList, setFilteredList] = useState<GroceryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStore, setFilterStore] = useState<string | null>(null)
  const [stores, setStores] = useState<string[]>([])
  const [userLocation, setUserLocation] = useState<{
    country: string
    city: string
    currencyCode: string
  } | null>(null)

  // Parse price string to number
  const parsePrice = (priceString: string): number => {
    const numericValue = priceString.replace(/[^0-9.]/g, "")
    return Number.parseFloat(numericValue) || 0
  }

  // Calculate totals
  const totals = useMemo(() => {
    const allItems = groceryList.map((item) => parsePrice(item.estimatedPrice))
    const checkedItems = groceryList.filter((item) => item.checked).map((item) => parsePrice(item.estimatedPrice))
    const uncheckedItems = groceryList.filter((item) => !item.checked).map((item) => parsePrice(item.estimatedPrice))

    return {
      total: allItems.reduce((sum, price) => sum + price, 0),
      completed: checkedItems.reduce((sum, price) => sum + price, 0),
      remaining: uncheckedItems.reduce((sum, price) => sum + price, 0),
    }
  }, [groceryList])

  const formatPrice = (amount: number): string => {
    const currencySymbol = userLocation?.currencyCode || "$"
    return `${currencySymbol}${amount.toFixed(2)}`
  }

  useEffect(() => {
    const fetchGroceryList = async () => {
      try {
        if (!id) {
          setError("Invalid meal plan ID")
          setIsLoading(false)
          return
        }
        setIsLoading(true)
        const result: GenerateGroceryListOutput = await generateGroceryListFromMealPlan(id)

        const groceryItems = result.groceryList.map((item) => ({
          ...item,
          checked: false,
        }))

        setGroceryList(groceryItems)
        setFilteredList(groceryItems)

        const uniqueStores = Array.from(new Set(groceryItems.map((item) => item.suggestedLocation)))
        setStores(uniqueStores)

        setUserLocation({
          country: "User's Country",
          city: "User's City",
          currencyCode: groceryItems[0]?.estimatedPrice.charAt(0) || "$",
        })

        setIsLoading(false)
      } catch (err) {
        setError("Failed to load grocery list")
        setIsLoading(false)
        console.error(err)
      }
    }

    fetchGroceryList()
  }, [id])

  const toggleItemCheck = (index: number) => {
    const updatedList = [...filteredList]
    updatedList[index].checked = !updatedList[index].checked
    setFilteredList(updatedList)

    const mainIndex = groceryList.findIndex((item) => item.item === updatedList[index].item)
    if (mainIndex !== -1) {
      const updatedGroceryList = [...groceryList]
      updatedGroceryList[mainIndex].checked = updatedList[index].checked
      setGroceryList(updatedGroceryList)
    }
  }

  useEffect(() => {
    let result = [...groceryList]

    if (searchTerm) {
      result = result.filter((item) => item.item.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    if (filterStore) {
      result = result.filter((item) => item.suggestedLocation === filterStore)
    }

    setFilteredList(result)
  }, [searchTerm, filterStore, groceryList])

  const clearFilters = () => {
    setSearchTerm("")
    setFilterStore(null)
    setFilteredList(groceryList)
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-12 bg-gray-200 rounded"></div>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-sm">!</span>
                </div>
              </div>
              <div>
                <h3 className="text-red-800 font-medium">Error Loading Grocery List</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
            <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const completionPercentage =
    groceryList.length > 0 ? (groceryList.filter((item) => item.checked).length / groceryList.length) * 100 : 0

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">Grocery Shopping List</h1>
        {userLocation && (
          <p className="text-gray-600">
            Prices for {userLocation.city}, {userLocation.country}
          </p>
        )}
      </div>

      {/* Price Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Total Cost
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-blue-900">{formatPrice(totals.total)}</div>
            <p className="text-xs text-blue-600 mt-1">{groceryList.length} items</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-green-900">{formatPrice(totals.completed)}</div>
            <p className="text-xs text-green-600 mt-1">
              {groceryList.filter((item) => item.checked).length} items checked
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-700 flex items-center">
              <Circle className="w-4 h-4 mr-2" />
              Remaining
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-orange-900">{formatPrice(totals.remaining)}</div>
            <p className="text-xs text-orange-600 mt-1">
              {groceryList.filter((item) => !item.checked).length} items left
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700">Shopping Progress</span>
            <span className="text-sm text-gray-500">{Math.round(completionPercentage)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search grocery items..."
                className="pl-10"
              />
            </div>

            <div className="relative sm:w-64">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filterStore || ""}
                onChange={(e) => setFilterStore(e.target.value || null)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Stores</option>
                {stores.map((store, index) => (
                  <option key={index} value={store}>
                    {store}
                  </option>
                ))}
              </select>
            </div>

            {(searchTerm || filterStore) && (
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grocery Items */}
      <Card>
        <CardContent className="p-0">
          {filteredList.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filter to find what you're looking for.</p>
              {(searchTerm || filterStore) && (
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredList.map((item, index) => (
                <div
                  key={index}
                  className={`p-6 flex items-center justify-between transition-all duration-200 hover:bg-gray-50 ${
                    item.checked ? "bg-green-50/50" : ""
                  }`}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <button
                      onClick={() => toggleItemCheck(index)}
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        item.checked
                          ? "bg-green-500 border-green-500 text-white shadow-md"
                          : "border-gray-300 hover:border-green-400"
                      }`}
                    >
                      {item.checked && <Check className="w-4 h-4" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-lg font-medium ${
                          item.checked ? "line-through text-gray-500" : "text-gray-900"
                        }`}
                      >
                        {item.item}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="w-3 h-3 mr-1" />
                          <span className="font-medium">{item.estimatedPrice}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-3 h-3 mr-1" />
                          <Badge variant="secondary" className="text-xs">
                            {item.suggestedLocation}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default GroceryList
