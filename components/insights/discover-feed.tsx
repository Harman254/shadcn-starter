'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { RefreshCw, Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CategoryTabs } from './category-tabs'
import { StoryCard } from './story-card'
import { useBookmarks } from '@/hooks/use-bookmarks'
import { FEED_ITEMS, type FeedCategory, type FeedItem } from '@/lib/data/feed-data'
import { Button } from '@/components/ui/button'

interface DiscoverFeedProps {
  className?: string
}

// Pre-compute category items for stable content
const CATEGORY_ITEMS: Record<FeedCategory, FeedItem[]> = {
  'for-you': FEED_ITEMS.slice(0, 6),
  'trending': FEED_ITEMS.filter(item => item.category === 'trending' || item.tags.includes('popular')),
  'quick-meals': FEED_ITEMS.filter(item => item.category === 'quick-meals'),
  'healthy': FEED_ITEMS.filter(item => item.category === 'healthy'),
  'seasonal': FEED_ITEMS.filter(item => item.category === 'seasonal'),
  'budget': FEED_ITEMS.filter(item => item.category === 'budget'),
}

export function DiscoverFeed({ className }: DiscoverFeedProps) {
  const [activeCategory, setActiveCategory] = useState<FeedCategory>('for-you')
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const { isBookmarked, toggleBookmark, bookmarks, isLoaded } = useBookmarks()

  // Stable feed items - no random sorting, no useEffect
  const feedItems = useMemo(() => {
    if (showBookmarksOnly) {
      return FEED_ITEMS.filter(item => bookmarks.includes(item.id))
    }
    return CATEGORY_ITEMS[activeCategory] || []
  }, [activeCategory, showBookmarksOnly, bookmarks])

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1)
  }, [])

  const handleCategoryChange = useCallback((category: FeedCategory) => {
    setActiveCategory(category)
  }, [])

  const handleBookmarkToggle = useCallback((id: string) => {
    toggleBookmark(id)
  }, [toggleBookmark])

  return (
    <div className={cn('space-y-4 sm:space-y-6', className)}>
      {/* Header with category tabs */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Discover</h2>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant={showBookmarksOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
              className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9 px-2.5 sm:px-3"
            >
              <Bookmark className={cn('w-3.5 h-3.5 sm:w-4 sm:h-4', showBookmarksOnly && 'fill-current')} />
              <span className="hidden sm:inline">Saved</span>
              {bookmarks.length > 0 && (
                <span className="ml-0.5 sm:ml-1 px-1 sm:px-1.5 py-0.5 text-[10px] sm:text-xs rounded-full bg-primary/20">
                  {bookmarks.length}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              className="shrink-0 h-8 w-8 sm:h-9 sm:w-9"
            >
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>

        {!showBookmarksOnly && (
          <CategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
        )}
      </div>

      {/* Feed content with smooth transitions - single column on mobile */}
      <div 
        key={`feed-${activeCategory}-${showBookmarksOnly}-${refreshKey}`}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 animate-in fade-in-0 duration-300"
      >
        {!isLoaded ? (
          // Show skeletons only on initial load
          [1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)
        ) : feedItems.length === 0 ? (
          <div className="col-span-full">
            <EmptyState showBookmarksOnly={showBookmarksOnly} />
          </div>
        ) : (
          feedItems.map((item, index) => (
            <div 
              key={item.id} 
              className="animate-in fade-in-0 slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
            >
              <StoryCard
                item={item}
                isBookmarked={isBookmarked(item.id)}
                onBookmarkToggle={handleBookmarkToggle}
                priority={index < 2}
                enableAIImage={true}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border/50 animate-pulse">
      <div className="aspect-[16/10] bg-secondary/50" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-secondary/50 rounded w-3/4" />
        <div className="h-4 bg-secondary/30 rounded w-full" />
        <div className="h-4 bg-secondary/30 rounded w-2/3" />
        <div className="flex gap-2">
          <div className="h-3 bg-secondary/20 rounded w-16" />
          <div className="h-3 bg-secondary/20 rounded w-16" />
        </div>
      </div>
    </div>
  )
}

function EmptyState({ showBookmarksOnly }: { showBookmarksOnly: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
        <Bookmark className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {showBookmarksOnly ? 'No saved recipes yet' : 'No recipes found'}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        {showBookmarksOnly
          ? 'Start exploring and save your favorite recipes for later!'
          : 'Try selecting a different category or refresh the feed.'}
      </p>
    </div>
  )
}
