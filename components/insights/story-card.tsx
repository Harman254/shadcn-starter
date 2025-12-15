'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Bookmark, Clock, Flame, ChefHat, Loader2, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FeedItem } from '@/lib/data/feed-data'
import { useGeneratedImage } from '@/hooks/use-generated-image'

interface StoryCardProps {
  item: FeedItem
  isBookmarked: boolean
  onBookmarkToggle: (id: string) => void
  onClick?: () => void
  priority?: boolean
  enableAIImage?: boolean
}

export function StoryCard({ 
  item, 
  isBookmarked, 
  onBookmarkToggle, 
  onClick,
  priority = false,
  enableAIImage = false // Disabled by default to use static images first
}: StoryCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Use AI-generated image or fallback to static
  const { imageUrl, isLoading: isGenerating, isGenerated } = useGeneratedImage({
    id: item.id,
    prompt: item.imagePrompt,
    fallbackUrl: item.imageUrl,
    enabled: enableAIImage
  })

  const difficultyColors = {
    Easy: 'bg-green-500/20 text-green-400',
    Medium: 'bg-yellow-500/20 text-yellow-400',
    Hard: 'bg-red-500/20 text-red-400',
  }

  // Use the generated URL or fallback
  const displayImageUrl = enableAIImage ? imageUrl : item.imageUrl

  return (
    <Link href={`/stories/${item.id}`} className="block h-full">
    <article
      onClick={onClick}
      className={cn(
        'group relative bg-card rounded-2xl overflow-hidden border border-border/50 h-full',
        'hover:border-primary/30 transition-all duration-500',
        'hover:shadow-2xl hover:shadow-primary/10',
        'cursor-pointer transform hover:-translate-y-1',
        'backdrop-blur-sm'
      )}
    >
      {/* Hero Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
        
        {/* Image or placeholder */}
        {displayImageUrl && !imageError ? (
          <>
            {/* For base64 data URLs or regular URLs */}
            {displayImageUrl.startsWith('data:') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayImageUrl}
                alt={item.title}
                className={cn(
                  'absolute inset-0 w-full h-full object-cover transition-all duration-700',
                  imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105',
                  'group-hover:scale-110'
                )}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            ) : (
              <Image
                src={displayImageUrl}
                alt={item.title}
                fill
                priority={priority}
                className={cn(
                  'object-cover transition-all duration-700',
                  imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105',
                  'group-hover:scale-110'
                )}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-secondary to-accent flex items-center justify-center">
            {(isGenerating || (!imageLoaded && !imageError)) && (
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            )}
            {imageError && (
              <ChefHat className="w-12 h-12 text-muted-foreground/50" />
            )}
          </div>
        )}
        
        {/* Loading shimmer */}
        {(!imageLoaded || isGenerating) && displayImageUrl && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        )}

        {/* AI Generated badge */}
        {isGenerated && (
          <div className="absolute bottom-12 left-3 z-20">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/80 backdrop-blur-md text-white flex items-center gap-1">
              <Zap className="w-3 h-3" />
              AI Generated
            </span>
          </div>
        )}

        {/* Metadata badges */}
        <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-2">
          {item.metadata.difficulty && (
            <span className={cn(
              'px-2 py-1 rounded-full text-xs font-medium backdrop-blur-md',
              difficultyColors[item.metadata.difficulty]
            )}>
              {item.metadata.difficulty}
            </span>
          )}
          {item.metadata.cuisine && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/10 backdrop-blur-md text-white">
              {item.metadata.cuisine}
            </span>
          )}
        </div>

        {/* Bookmark button */}
        <button
          onClick={(e) => {
            e.preventDefault() // Prevent navigation when clicking bookmark
            e.stopPropagation()
            onBookmarkToggle(item.id)
          }}
          className={cn(
            'absolute top-3 right-3 z-20 w-10 h-10 rounded-full flex items-center justify-center',
            'backdrop-blur-md transition-all duration-300',
            isBookmarked 
              ? 'bg-primary text-primary-foreground scale-110' 
              : 'bg-white/10 text-white hover:bg-white/20 hover:scale-110'
          )}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          {isBookmarked ? (
            <Bookmark className="w-5 h-5 fill-current" />
          ) : (
            <Bookmark className="w-5 h-5" />
          )}
        </button>

        {/* Bottom content overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
          <h3 className="text-lg md:text-xl font-bold text-white mb-1 line-clamp-2 group-hover:text-primary-foreground transition-colors">
            {item.title}
          </h3>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {item.description}
        </p>

        {/* Metadata row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {item.metadata.prepTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{item.metadata.prepTime}</span>
            </div>
          )}
          {item.metadata.calories && (
            <div className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>{item.metadata.calories} cal</span>
            </div>
          )}
          {item.metadata.servings && (
            <div className="flex items-center gap-1">
              <span>👥</span>
              <span>{item.metadata.servings} servings</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md text-xs bg-secondary/50 text-secondary-foreground/70"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
    </Link>
  )
}
