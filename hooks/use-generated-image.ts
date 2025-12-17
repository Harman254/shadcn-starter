'use client'

import { useState, useEffect } from 'react'

interface UseGeneratedImageOptions {
    id: string
    prompt: string
    fallbackUrl: string
    enabled?: boolean
}

interface UseGeneratedImageResult {
    imageUrl: string
    isLoading: boolean
    isGenerated: boolean
    error: string | null
}

// Client-side cache for generated images (in-memory)
const imageCache = new Map<string, string>()

// localStorage key for persistent cache
const CACHE_STORAGE_KEY = 'generated_images_cache'

// Load cache from localStorage on module load
function loadCacheFromStorage(): void {
    if (typeof window === 'undefined') return
    
    try {
        const stored = localStorage.getItem(CACHE_STORAGE_KEY)
        if (stored) {
            const parsed = JSON.parse(stored)
            Object.entries(parsed).forEach(([key, value]) => {
                imageCache.set(key, value as string)
            })
        }
    } catch (error) {
        console.warn('[useGeneratedImage] Failed to load cache from storage:', error)
    }
}

// Save cache to localStorage
function saveCacheToStorage(): void {
    if (typeof window === 'undefined') return
    
    try {
        const cacheObject = Object.fromEntries(imageCache.entries())
        localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cacheObject))
    } catch (error) {
        console.warn('[useGeneratedImage] Failed to save cache to storage:', error)
    }
}

// Initialize cache from storage
if (typeof window !== 'undefined') {
    loadCacheFromStorage()
}

export function useGeneratedImage({
    id,
    prompt,
    fallbackUrl,
    enabled = true
}: UseGeneratedImageOptions): UseGeneratedImageResult {
    // Always start with fallback URL immediately
    const [imageUrl, setImageUrl] = useState<string>(fallbackUrl)
    const [isLoading, setIsLoading] = useState(false)
    const [isGenerated, setIsGenerated] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!enabled || !prompt) {
            // If disabled, just use fallback
            setImageUrl(fallbackUrl)
            return
        }

        // Check client-side cache first (both in-memory and localStorage)
        const cacheKey = `img_${id}`
        if (imageCache.has(cacheKey)) {
            const cachedUrl = imageCache.get(cacheKey)!
            setImageUrl(cachedUrl)
            setIsGenerated(true)
            return
        }

        // Always show fallback immediately while generating
        if (fallbackUrl) {
            setImageUrl(fallbackUrl)
        }

        const generateImage = async () => {
            setIsLoading(true)
            setError(null)

            try {
                const response = await fetch('/api/images/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id,
                        prompt,
                        fallbackUrl,
                    }),
                })

                if (!response.ok) {
                    throw new Error('Failed to generate image')
                }

                const data = await response.json()

                if (data.imageUrl) {
                    // Only cache and update if it's a generated image (not fallback)
                    if (!data.fallback && data.generated) {
                        // Cache the result (both in-memory and localStorage)
                        imageCache.set(cacheKey, data.imageUrl)
                        saveCacheToStorage()
                        
                        // Update to generated image
                        setImageUrl(data.imageUrl)
                        setIsGenerated(true)
                    } else {
                        // Keep fallback if generation failed - don't cache fallbacks
                        setIsGenerated(false)
                        // imageUrl already set to fallbackUrl, so no need to update
                    }
                }
            } catch (err) {
                console.error('[useGeneratedImage] Error:', err)
                setError(err instanceof Error ? err.message : 'Unknown error')
                // Keep using fallback on error
            } finally {
                setIsLoading(false)
            }
        }

        // Only generate if fallback is being used or no image yet
        generateImage()
    }, [id, prompt, fallbackUrl, enabled])

    return {
        imageUrl,
        isLoading,
        isGenerated,
        error,
    }
}
