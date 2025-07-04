"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateGroceryListFromMealPlan } from "@/ai/flows/generate-grocery-list"
import type { GenerateGroceryListOutput } from "@/ai/flows/generate-grocery-list"

interface GroceryItem {
  id: string;
  item: string
  quantity: string
  category: string
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

interface CachedGroceryList {
  groceryList: GroceryItem[];
  stores: string[];
  userLocation: UserLocation | null;
}

interface GroceryListState {
  // Cache for multiple lists
  cachedLists: { [key: string]: CachedGroceryList };
  
  // Active list being displayed
  currentId: string | null
  groceryList: GroceryItem[]
  filteredList: GroceryItem[]
  isLoading: boolean
  error: string | null
  stores: string[]
  userLocation: UserLocation | null
  
  // Filter state
  searchTerm: string
  filterStore: string | null
  
  // Actions
  fetchGroceryList: (id: string | null) => Promise<void>
  toggleItemCheck: (itemId: string) => void
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
  if (!priceString) return 0;
  // This regex handles currency symbols, commas, and decimal points.
  const numbers = priceString.match(/[\d,]+(?:\.\d+)?/);
  if (!numbers || numbers.length === 0) return 0;
  // Remove commas before parsing to float
  return Number.parseFloat(numbers[0].replace(/,/g, '')) || 0;
};

export const useGroceryListStore = create<GroceryListState>()(
  persist(
    (set, get) => ({
      // Initial state
      cachedLists: {},
      currentId: null,
      groceryList: [],
      filteredList: [],
      isLoading: false,
      error: null,
      searchTerm: "",
      filterStore: null,
      stores: [],
      userLocation: null,
      
      fetchGroceryList: async (id: string | null) => {
        if (!id) {
          set({ error: "Invalid meal plan ID", isLoading: false, groceryList: [], filteredList: [], currentId: null });
          return;
        }

        // --- Use Cache if available ---
        const cachedData = get().cachedLists[id];
        if (cachedData) {
          set({
            currentId: id,
            groceryList: cachedData.groceryList,
            filteredList: cachedData.groceryList,
            stores: cachedData.stores,
            userLocation: cachedData.userLocation,
            isLoading: false,
            error: null,
            searchTerm: "",
            filterStore: null,
          });
          return;
        }
        
        // --- Fetch from API if not in cache ---
        set({ isLoading: true, error: null, currentId: id, groceryList: [], filteredList: [] });

        try {
          const { groceryList, locationData } = await generateGroceryListFromMealPlan(id);

          const groceryItems: GroceryItem[] = groceryList.groceryList.map((item: any) => ({ ...item, checked: false }));
          
          const userLocation: UserLocation = {
              country: locationData.country || 'N/A',
              city: locationData.city || 'N/A',
              currencyCode: locationData.currencyCode,
              currencySymbol: locationData.currencySymbol,
          };
          
          const uniqueStores: string[] = locationData.localStores || [];

          const newCacheEntry: CachedGroceryList = { groceryList: groceryItems, stores: uniqueStores, userLocation };
          
          set(state => ({
            currentId: id,
            groceryList: groceryItems,
            filteredList: groceryItems,
            stores: uniqueStores,
            userLocation: userLocation,
            isLoading: false,
            cachedLists: { ...state.cachedLists, [id]: newCacheEntry },
          }));

        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
          console.error("Error fetching grocery list:", err);
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },
      
      toggleItemCheck: (itemId: string) => {
        set((state) => {
          const toggleItem = (list: GroceryItem[]) => 
            list.map(item => 
              item.id === itemId ? { ...item, checked: !item.checked } : item
            );

          const updatedGroceryList = toggleItem(state.groceryList);
          const updatedFilteredList = toggleItem(state.filteredList);

          // Update cache if the list is cached
          if (state.currentId && state.cachedLists[state.currentId]) {
            const updatedCacheEntry = {
              ...state.cachedLists[state.currentId],
              groceryList: updatedGroceryList,
            };
            return {
              groceryList: updatedGroceryList,
              filteredList: updatedFilteredList,
              cachedLists: { ...state.cachedLists, [state.currentId]: updatedCacheEntry },
            };
          }

          return { 
            groceryList: updatedGroceryList,
            filteredList: updatedFilteredList,
          };
        });
      },
      
      setSearchTerm: (term: string) => {
        set((state) => {
          let result = state.groceryList;
          if (term) result = result.filter(item => item.item.toLowerCase().includes(term.toLowerCase()));
          if (state.filterStore) result = result.filter(item => item.suggestedLocation === state.filterStore);
          return { searchTerm: term, filteredList: result };
        });
      },
      
      setFilterStore: (store: string | null) => {
        set((state) => {
          let result = state.groceryList;
          if (state.searchTerm) result = result.filter(item => item.item.toLowerCase().includes(state.searchTerm.toLowerCase()));
          if (store) result = result.filter(item => item.suggestedLocation === store);
          return { filterStore: store, filteredList: result };
        });
      },
      
      clearFilters: () => {
        set((state) => ({ searchTerm: "", filterStore: null, filteredList: state.groceryList }));
      },
      
      getTotals: () => {
        const state = get();
        const allItems = state.groceryList.map(item => parsePrice(item.estimatedPrice));
        const checkedItems = state.groceryList.filter(item => item.checked).map(item => parsePrice(item.estimatedPrice));
        return {
          total: allItems.reduce((sum, price) => sum + price, 0),
          completed: checkedItems.reduce((sum, price) => sum + price, 0),
          remaining: allItems.reduce((sum, price) => sum + price, 0) - checkedItems.reduce((sum, price) => sum + price, 0),
        };
      },
      
      getCompletionPercentage: () => {
        const state = get();
        return state.groceryList.length > 0 ? (state.groceryList.filter(item => item.checked).length / state.groceryList.length) * 100 : 0;
      }
    }),
    {
      name: 'grocery-list-storage',
      partialize: (state) => ({
        cachedLists: state.cachedLists,
        userLocation: state.userLocation,
      }),
    }
  )
);
