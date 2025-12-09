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

// Client-side cache for generated images
const imageCache = new Map<string, string>()

export function useGeneratedImage({
    id,
    prompt,
    fallbackUrl,
    enabled = true
}: UseGeneratedImageOptions): UseGeneratedImageResult {
    const [imageUrl, setImageUrl] = useState<string>(fallbackUrl)
    const [isLoading, setIsLoading] = useState(false)
    const [isGenerated, setIsGenerated] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!enabled || !prompt) {
            return
        }

        // Check client-side cache first
        const cacheKey = `img_${id}`
        if (imageCache.has(cacheKey)) {
            setImageUrl(imageCache.get(cacheKey)!)
            setIsGenerated(true)
            return
        }

        // If we have a valid fallback URL (not empty), use it immediately
        // Then try to generate in background
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
                    // Cache the result
                    imageCache.set(cacheKey, data.imageUrl)
                    setImageUrl(data.imageUrl)
                    setIsGenerated(!data.fallback)
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
