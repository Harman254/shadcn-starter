"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateGroceryListFromMealPlan } from "@/ai/flows/generate-grocery-list"
import type { GenerateGroceryListOutput } from "@/ai/flows/generate-grocery-list"

interface GroceryItem {
  item: string
  estimatedPrice: string
  suggestedLocation: string
  checked: boolean
}

interface UserLocation {
  country: string
  city: string
  currencyCode: string
  currencySymbol: string
}

interface GroceryListState {
  // Current meal plan ID
  currentId: string | null
  
  // Main state
  groceryList: GroceryItem[]
  filteredList: GroceryItem[]
  isLoading: boolean
  error: string | null
  
  // Filter state
  searchTerm: string
  filterStore: string | null
  stores: string[]
  
  // User location
  userLocation: UserLocation | null
  
  // Actions
  fetchGroceryList: (id: string | null) => Promise<void>
  toggleItemCheck: (index: number) => void
  setSearchTerm: (term: string) => void
  setFilterStore: (store: string | null) => void
  clearFilters: () => void
  
  // Calculated values
  getTotals: () => {
    total: number
    completed: number
    remaining: number
  }
  getCompletionPercentage: () => number
}

// Helper function to parse price string to number
const parsePrice = (priceString: string): number => {
  const numericValue = priceString.replace(/[^0-9.]/g, "")
  return Number.parseFloat(numericValue) || 0
}

export const useGroceryListStore = create<GroceryListState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentId: null,
      groceryList: [],
      filteredList: [],
      isLoading: false,
      error: null,
      searchTerm: "",
      filterStore: null,
      stores: [],
      userLocation: null,
      
      // Actions
      fetchGroceryList: async (id: string | null) => {
        // If the ID is the same as the current one and we already have data, don't refetch
        if (id === get().currentId && get().groceryList.length > 0) {
          return
        }
        
        try {
          if (!id) {
            set({ error: "Invalid meal plan ID", isLoading: false })
            return
          }
          
          set({ isLoading: true, currentId: id })
          
          const result = await generateGroceryListFromMealPlan(id)
          
          const groceryItems = result.groceryList.groceryList.map((item) => ({
            ...item,
            checked: false,
          }))
          
          const uniqueStores = Array.from(new Set(groceryItems.map((item) => item.suggestedLocation)))
          
          set({
            groceryList: groceryItems,
            filteredList: groceryItems,
            stores: uniqueStores,
            userLocation: {
              country: result.locationData.country,
              city: result.locationData.city,
              currencyCode: result.locationData.currencyCode,
              currencySymbol: result.locationData.currencySymbol,
            },
            isLoading: false,
            error: null
          })
        } catch (err) {
          set({
            error: "Failed to load grocery list",
            isLoading: false
          })
          console.error(err)
        }
      },
      
      toggleItemCheck: (index: number) => {
        set((state) => {
          // Update filtered list
          const updatedFilteredList = [...state.filteredList]
          updatedFilteredList[index].checked = !updatedFilteredList[index].checked
          
          // Find and update the item in the main grocery list
          const mainIndex = state.groceryList.findIndex(
            (item) => item.item === updatedFilteredList[index].item
          )
          
          let updatedGroceryList = [...state.groceryList]
          if (mainIndex !== -1) {
            updatedGroceryList[mainIndex].checked = updatedFilteredList[index].checked
          }
          
          return {
            filteredList: updatedFilteredList,
            groceryList: updatedGroceryList
          }
        })
      },
      
      setSearchTerm: (term: string) => {
        set((state) => {
          const { groceryList, filterStore } = state
          
          let result = [...groceryList]
          
          if (term) {
            result = result.filter((item) => 
              item.item.toLowerCase().includes(term.toLowerCase())
            )
          }
          
          if (filterStore) {
            result = result.filter((item) => 
              item.suggestedLocation === filterStore
            )
          }
          
          return {
            searchTerm: term,
            filteredList: result
          }
        })
      },
      
      setFilterStore: (store: string | null) => {
        set((state) => {
          const { groceryList, searchTerm } = state
          
          let result = [...groceryList]
          
          if (searchTerm) {
            result = result.filter((item) => 
              item.item.toLowerCase().includes(searchTerm.toLowerCase())
            )
          }
          
          if (store) {
            result = result.filter((item) => 
              item.suggestedLocation === store
            )
          }
          
          return {
            filterStore: store,
            filteredList: result
          }
        })
      },
      
      clearFilters: () => {
        set((state) => ({
          searchTerm: "",
          filterStore: null,
          filteredList: state.groceryList
        }))
      },
      
      // Computed values
      getTotals: () => {
        const state = get()
        const allItems = state.groceryList.map((item) => parsePrice(item.estimatedPrice))
        const checkedItems = state.groceryList
          .filter((item) => item.checked)
          .map((item) => parsePrice(item.estimatedPrice))
        const uncheckedItems = state.groceryList
          .filter((item) => !item.checked)
          .map((item) => parsePrice(item.estimatedPrice))
        
        return {
          total: allItems.reduce((sum, price) => sum + price, 0),
          completed: checkedItems.reduce((sum, price) => sum + price, 0),
          remaining: uncheckedItems.reduce((sum, price) => sum + price, 0),
        }
      },
      
      getCompletionPercentage: () => {
        const state = get()
        return state.groceryList.length > 0
          ? (state.groceryList.filter((item) => item.checked).length / state.groceryList.length) * 100
          : 0
      }
    }),
    {
      name: 'grocery-list-storage', // Name for localStorage
      partialize: (state) => ({
        // Only persist these fields
        currentId: state.currentId,
        groceryList: state.groceryList,
        filteredList: state.filteredList,
        searchTerm: state.searchTerm,
        filterStore: state.filterStore,
        stores: state.stores,
        userLocation: state.userLocation,
      }),
    }
  )
)
