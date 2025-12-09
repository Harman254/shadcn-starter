'use client'

import React, { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FEED_CATEGORIES, type FeedCategory } from '@/lib/data/feed-data'

interface CategoryTabsProps {
  activeCategory: FeedCategory
  onCategoryChange: (category: FeedCategory) => void
}

export function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)

  const checkScrollArrows = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScrollArrows()
    window.addEventListener('resize', checkScrollArrows)
    return () => window.removeEventListener('resize', checkScrollArrows)
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
      setTimeout(checkScrollArrows, 300)
    }
  }

  return (
    <div className="relative">
      {/* Left scroll button - hidden on mobile, touch scrolling is preferred */}
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 sm:w-8 sm:h-8 items-center justify-center bg-background/80 backdrop-blur-sm border border-border rounded-full shadow-lg hover:bg-accent transition-colors"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      )}

      {/* Tabs container */}
      <div
        ref={scrollRef}
        onScroll={checkScrollArrows}
        className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide px-0.5 sm:px-1 py-1.5 sm:py-2 -mx-1 sm:mx-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {FEED_CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              'px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-300 shrink-0',
              'border border-transparent',
              activeCategory === category.id
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground border-border/50'
            )}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Right scroll button - hidden on mobile, touch scrolling is preferred */}
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 sm:w-8 sm:h-8 items-center justify-center bg-background/80 backdrop-blur-sm border border-border rounded-full shadow-lg hover:bg-accent transition-colors"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      )}
    </div>
  )
}
