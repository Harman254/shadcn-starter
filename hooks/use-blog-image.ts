'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { generateBlogImage } from '@/lib/services/blog-image-service';
import { useImageCacheStore, generateCacheKey, isImageCached } from '@/store/image-cache-store';

interface UseBlogImageOptions {
  title: string;
  excerpt: string;
  category: string;
  enabled?: boolean;
}

interface UseBlogImageResult {
  imageUrl: string;
  isGenerated: boolean;
  isPro: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useBlogImage({
  title,
  excerpt,
  category,
  enabled = true,
}: UseBlogImageOptions): UseBlogImageResult {
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

        // Check cache first
        const cacheKey = generateCacheKey('blog', title.toLowerCase().replace(/\s+/g, '_'), userId);
        const cached = useImageCacheStore.getState().getImage(cacheKey);
        
        if (cached && isImageCached(cacheKey, 30 * 24 * 60 * 60 * 1000)) {
          // Blog images cached for 30 days
          setImageUrl(cached.imageUrl);
          setIsGenerated(cached.isGenerated);
          setIsPro(cached.isPro);
          setIsLoading(false);
          return;
        }

        // Generate image
        const result = await generateBlogImage(title, excerpt, category, userId);
        
        setImageUrl(result.imageUrl);
        setIsGenerated(result.isGenerated);
        setIsPro(result.isPro);
      } catch (err) {
        console.error('[useBlogImage] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load image');
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [title, excerpt, category, enabled, session?.user?.id]);

  return {
    imageUrl,
    isGenerated,
    isPro,
    isLoading,
    error,
  };
}

