/**
 * Zustand Store for Image Caching
 * 
 * Provides persistent caching for AI-generated images with:
 * - In-memory cache for fast access
 * - localStorage persistence for offline access
 * - Cache invalidation strategies
 * - Pro user detection for image generation
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CachedImage {
  imageUrl: string;
  isGenerated: boolean;
  isPro: boolean;
  generatedAt: number;
  prompt?: string;
  cacheKey: string;
}

interface ImageCacheState {
  // Cache storage
  cache: Map<string, CachedImage>;
  
  // Actions
  getImage: (cacheKey: string) => CachedImage | null;
  setImage: (cacheKey: string, image: CachedImage) => void;
  clearCache: () => void;
  clearExpired: (maxAge?: number) => void;
  
  // Batch operations
  getImages: (cacheKeys: string[]) => Map<string, CachedImage>;
  setImages: (images: Map<string, CachedImage>) => void;
  
  // Cache stats
  getCacheStats: () => { size: number; generated: number; pro: number };
}

// Convert Map to/from object for persistence
const mapToObject = (map: Map<string, CachedImage>): Record<string, CachedImage> => {
  const obj: Record<string, CachedImage> = {};
  map.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
};

const objectToMap = (obj: Record<string, CachedImage>): Map<string, CachedImage> => {
  const map = new Map<string, CachedImage>();
  Object.entries(obj).forEach(([key, value]) => {
    map.set(key, value);
  });
  return map;
};

export const useImageCacheStore = create<ImageCacheState>()(
  persist(
    (set, get) => ({
      cache: new Map<string, CachedImage>(),

      getImage: (cacheKey: string) => {
        const { cache } = get();
        return cache.get(cacheKey) || null;
      },

      setImage: (cacheKey: string, image: CachedImage) => {
        set((state) => {
          const newCache = new Map(state.cache);
          newCache.set(cacheKey, image);
          return { cache: newCache };
        });
      },

      clearCache: () => {
        set({ cache: new Map() });
      },

      clearExpired: (maxAge = 7 * 24 * 60 * 60 * 1000) => {
        // Default: 7 days
        const now = Date.now();
        set((state) => {
          const newCache = new Map(state.cache);
          let cleared = 0;
          
          newCache.forEach((image, key) => {
            if (now - image.generatedAt > maxAge) {
              newCache.delete(key);
              cleared++;
            }
          });
          
          if (cleared > 0) {
            console.log(`[ImageCache] Cleared ${cleared} expired images`);
          }
          
          return { cache: newCache };
        });
      },

      getImages: (cacheKeys: string[]) => {
        const { cache } = get();
        const result = new Map<string, CachedImage>();
        
        cacheKeys.forEach((key) => {
          const image = cache.get(key);
          if (image) {
            result.set(key, image);
          }
        });
        
        return result;
      },

      setImages: (images: Map<string, CachedImage>) => {
        set((state) => {
          const newCache = new Map(state.cache);
          images.forEach((image, key) => {
            newCache.set(key, image);
          });
          return { cache: newCache };
        });
      },

      getCacheStats: () => {
        const { cache } = get();
        let generated = 0;
        let pro = 0;
        
        cache.forEach((image) => {
          if (image.isGenerated) generated++;
          if (image.isPro) pro++;
        });
        
        return {
          size: cache.size,
          generated,
          pro,
        };
      },
    }),
    {
      name: 'image-cache-storage',
      storage: createJSONStorage(() => localStorage),
      // Custom serialization for Map
      serialize: (state) => {
        const cacheObj = mapToObject(state.state.cache);
        return JSON.stringify({ ...state.state, cache: cacheObj });
      },
      deserialize: (str) => {
        const parsed = JSON.parse(str);
        return {
          ...parsed,
          state: {
            ...parsed.state,
            cache: objectToMap(parsed.state.cache || {}),
          },
        };
      },
    }
  )
);

// Helper function to generate cache key
export function generateCacheKey(
  type: 'meal' | 'recipe' | 'blog' | 'insight',
  identifier: string,
  userId?: string
): string {
  const prefix = `${type}_${identifier}`;
  return userId ? `${prefix}_${userId}` : prefix;
}

// Helper function to check if image is cached and valid
export function isImageCached(
  cacheKey: string,
  maxAge?: number
): boolean {
  const store = useImageCacheStore.getState();
  const image = store.getImage(cacheKey);
  
  if (!image) return false;
  
  if (maxAge) {
    const age = Date.now() - image.generatedAt;
    return age < maxAge;
  }
  
  return true;
}

