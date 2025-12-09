'use client'

import { useState, useEffect, useCallback } from 'react'

const BOOKMARKS_STORAGE_KEY = 'meal-feed-bookmarks'

export function useBookmarks() {
    const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())
    const [isLoaded, setIsLoaded] = useState(false)

    // Load bookmarks from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(BOOKMARKS_STORAGE_KEY)
            if (stored) {
                const parsed = JSON.parse(stored) as string[]
                setBookmarks(new Set(parsed))
            }
        } catch (error) {
            console.error('Error loading bookmarks:', error)
        }
        setIsLoaded(true)
    }, [])

    // Save bookmarks to localStorage whenever they change
    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify([...bookmarks]))
            } catch (error) {
                console.error('Error saving bookmarks:', error)
            }
        }
    }, [bookmarks, isLoaded])

    const toggleBookmark = useCallback((id: string) => {
        setBookmarks((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(id)) {
                newSet.delete(id)
            } else {
                newSet.add(id)
            }
            return newSet
        })
    }, [])

    const isBookmarked = useCallback((id: string) => {
        return bookmarks.has(id)
    }, [bookmarks])

    return {
        bookmarks: [...bookmarks],
        isBookmarked,
        toggleBookmark,
        isLoaded,
    }
}
