import { create } from "zustand";

interface MealSwapState {
  swapCount: number;
  maxSwaps: number;
  loading: boolean;
  fetchSwapCount: () => Promise<void>;
  incrementSwapCount: () => void;
  resetSwapCount: () => void;
}

const initialState = {
  swapCount: 0,
  maxSwaps: 3,
  loading: false,
};

export const useMealSwapStore = create<MealSwapState>((set) => ({
  ...initialState,
  fetchSwapCount: async () => {
    set({ loading: true });
    try {
      const response = await fetch("/api/meal-swaps");
      const data = await response.json();
      if (response.ok) {
        set({ swapCount: data.swapCount, maxSwaps: data.maxSwaps });
      }
    } finally {
      set({ loading: false });
    }
  },
  incrementSwapCount: () => set((state) => ({ swapCount: state.swapCount + 1 })),
  resetSwapCount: () => set({ ...initialState }),
})); 