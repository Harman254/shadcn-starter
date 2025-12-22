'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { generateInsightImage } from '@/lib/services/insights-image-service';
import { useImageCacheStore, generateCacheKey, isImageCached } from '@/store/image-cache-store';

interface UseInsightImageOptions {
  title: string;
  description: string;
  mealPlanTitle?: string;
  enabled?: boolean;
}

interface UseInsightImageResult {
  imageUrl: string;
  isGenerated: boolean;
  isPro: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useInsightImage({
  title,
  description,
  mealPlanTitle,
  enabled = true,
}: UseInsightImageOptions): UseInsightImageResult {
  const { data: session } = useSession();
  const [imageUrl, setImageUrl] = useState<string>('https://res.cloudinary.com/dcidanigq/image/upload/v1742112004/cld-sample-4.jpg');
  const [isGenerated, setIsGenerated] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !title) {
      setIsLoading(false);
      return;
    }

    const loadImage = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const userId = session?.user?.id;
        if (!userId) {
          // No user - use fallback
          setIsLoading(false);
          return;
        }

        // Check cache first
        const cacheKey = generateCacheKey('insight', title.toLowerCase().replace(/\s+/g, '_'), userId);
        const cached = useImageCacheStore.getState().getImage(cacheKey);
        
        if (cached && isImageCached(cacheKey, 7 * 24 * 60 * 60 * 1000)) {
          setImageUrl(cached.imageUrl);
          setIsGenerated(cached.isGenerated);
          setIsPro(cached.isPro);
          setIsLoading(false);
          return;
        }

        // Generate image
        const result = await generateInsightImage(title, description, userId, mealPlanTitle);
        
        setImageUrl(result.imageUrl);
        setIsGenerated(result.isGenerated);
        setIsPro(result.isPro);
      } catch (err) {
        console.error('[useInsightImage] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load image');
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [title, description, mealPlanTitle, enabled, session?.user?.id]);

  return {
    imageUrl,
    isGenerated,
    isPro,
    isLoading,
    error,
  };
}

