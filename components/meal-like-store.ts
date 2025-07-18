import { create } from "zustand";

interface MealLikeState {
  likes: Record<string, boolean>;
  loading: boolean;
  fetchLikes: (mealIds: string[]) => Promise<void>;
  toggleLike: (mealId: string, isLiked: boolean) => void;
}

export const useMealLikeStore = create<MealLikeState>((set, get) => ({
  likes: {},
  loading: false,
  fetchLikes: async (mealIds: string[]) => {
    if (mealIds.length === 0) return;
    set({ loading: true });
    try {
      const params = new URLSearchParams();
      mealIds.forEach(id => params.append('mealIds', id));
      const res = await fetch(`/api/meals/likes?${params.toString()}`);
      if (res.ok) {
        const data = await res.json(); // { [mealId]: boolean }
        set(state => ({ likes: { ...state.likes, ...data } }));
      }
    } finally {
      set({ loading: false });
    }
  },
  toggleLike: (mealId, isLiked) => {
    set(state => ({ likes: { ...state.likes, [mealId]: isLiked } }));
  },
})); 