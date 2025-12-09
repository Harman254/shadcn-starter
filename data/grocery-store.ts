// Grocery store Zustand state management
import { create } from 'zustand'

export interface GroceryItem {
    id: string
    item: string
    quantity: string
    estimatedPrice: string
    suggestedLocation: string
    category: string
    checked: boolean
}

export interface UserLocation {
    city: string
    country: string
    currencySymbol: string
}

interface GroceryListState {
    groceryList: GroceryItem[]
    filteredList: GroceryItem[]
    isLoading: boolean
    error: string | null
    searchTerm: string
    filterStore: string | null
    stores: string[]
    userLocation: UserLocation | null

    fetchGroceryList: (id: string | null) => Promise<void>
    toggleItemCheck: (id: string) => void
    setSearchTerm: (term: string) => void
    setFilterStore: (store: string | null) => void
    clearFilters: () => void
    getTotals: () => { total: number; completed: number; remaining: number }
    getCompletionPercentage: () => number
    applyFilters: (items: GroceryItem[]) => GroceryItem[]
}

export const useGroceryListStore = create<GroceryListState>((set, get) => ({
    groceryList: [],
    filteredList: [],
    isLoading: false,
    error: null,
    searchTerm: '',
    filterStore: null,
    stores: [],
    userLocation: null,

    fetchGroceryList: async (id: string | null) => {
        if (!id) {
            set({ error: 'No grocery list ID provided', isLoading: false })
            return
        }

        set({ isLoading: true, error: null })

        try {
            const response = await fetch(`/api/grocery-list/${id}`)
            if (!response.ok) {
                throw new Error('Failed to fetch grocery list')
            }
            const data = await response.json()

            const items: GroceryItem[] = data.items || []
            const stores = [...new Set(items.map((item: GroceryItem) => item.suggestedLocation).filter(Boolean))]

            set({
                groceryList: items,
                filteredList: items,
                stores: stores as string[],
                userLocation: data.userLocation || { city: 'Local', country: 'Area', currencySymbol: '$' },
                isLoading: false,
                error: null,
            })
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch grocery list',
                isLoading: false,
            })
        }
    },

    toggleItemCheck: (id: string) => {
        set((state) => {
            const updatedList = state.groceryList.map((item) =>
                item.id === id ? { ...item, checked: !item.checked } : item
            )
            return {
                groceryList: updatedList,
                filteredList: get().applyFilters(updatedList),
            }
        })
    },

    setSearchTerm: (term: string) => {
        set({ searchTerm: term })
        set((state) => ({
            filteredList: get().applyFilters(state.groceryList),
        }))
    },

    setFilterStore: (store: string | null) => {
        set({ filterStore: store })
        set((state) => ({
            filteredList: get().applyFilters(state.groceryList),
        }))
    },

    clearFilters: () => {
        set((state) => ({
            searchTerm: '',
            filterStore: null,
            filteredList: state.groceryList,
        }))
    },

    getTotals: () => {
        const state = get()
        const parsePrice = (price: string): number => {
            const match = price.match(/[\d.]+/)
            return match ? parseFloat(match[0]) : 0
        }

        const total = state.groceryList.reduce((sum, item) => sum + parsePrice(item.estimatedPrice), 0)
        const completed = state.groceryList
            .filter((item) => item.checked)
            .reduce((sum, item) => sum + parsePrice(item.estimatedPrice), 0)
        const remaining = total - completed

        return { total, completed, remaining }
    },

    getCompletionPercentage: () => {
        const state = get()
        if (state.groceryList.length === 0) return 0
        const checked = state.groceryList.filter((item) => item.checked).length
        return (checked / state.groceryList.length) * 100
    },

    applyFilters: (items: GroceryItem[]): GroceryItem[] => {
        const state = get()
        let filtered = items

        if (state.searchTerm) {
            const term = state.searchTerm.toLowerCase()
            filtered = filtered.filter(
                (item) =>
                    item.item.toLowerCase().includes(term) ||
                    item.category.toLowerCase().includes(term)
            )
        }

        if (state.filterStore) {
            filtered = filtered.filter((item) => item.suggestedLocation === state.filterStore)
        }

        return filtered
    },
}))
