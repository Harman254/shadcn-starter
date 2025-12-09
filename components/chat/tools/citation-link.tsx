'use client'

import React, { useState } from 'react'
import { ExternalLink, Globe, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface CitationLinkProps {
  url?: string
  label?: string
  className?: string
  showFavicon?: boolean
}

/**
 * Validates if a string is a proper URL
 */
function isValidUrl(urlString: string | undefined): boolean {
  if (!urlString) return false
  try {
    const url = new URL(urlString)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Extracts domain from URL for display
 */
function getDomain(urlString: string): string {
  try {
    const url = new URL(urlString)
    return url.hostname.replace('www.', '')
  } catch {
    return urlString
  }
}

/**
 * Gets favicon URL for a domain using Google's favicon service
 */
function getFaviconUrl(urlString: string): string {
  try {
    const url = new URL(urlString)
    return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`
  } catch {
    return ''
  }
}

export function CitationLink({ 
  url, 
  label, 
  className,
  showFavicon = true 
}: CitationLinkProps) {
  const [faviconError, setFaviconError] = useState(false)
  
  // If no URL or invalid URL, show a muted placeholder
  if (!isValidUrl(url)) {
    return (
      <span className={cn(
        'inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 italic',
        className
      )}>
        <AlertCircle className="w-3 h-3" />
        <span>Source unavailable</span>
      </span>
    )
  }

  const domain = getDomain(url!)
  const faviconUrl = getFaviconUrl(url!)
  const displayLabel = label || domain

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium',
              'bg-gradient-to-r from-blue-500/10 to-purple-500/10',
              'border border-blue-200/50 dark:border-blue-800/50',
              'text-blue-700 dark:text-blue-300',
              'hover:from-blue-500/20 hover:to-purple-500/20',
              'hover:border-blue-300 dark:hover:border-blue-700',
              'transition-all duration-200 group',
              className
            )}
          >
            {showFavicon && !faviconError ? (
              <img
                src={faviconUrl}
                alt=""
                className="w-3.5 h-3.5 rounded-sm"
                onError={() => setFaviconError(true)}
              />
            ) : (
              <Globe className="w-3.5 h-3.5 text-blue-500" />
            )}
            <span className="truncate max-w-[120px]">{displayLabel}</span>
            <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
          </a>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-xs bg-slate-900 text-white text-xs px-3 py-2"
        >
          <div className="space-y-1">
            <p className="font-medium">{domain}</p>
            <p className="text-slate-400 truncate">{url}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface CitationListProps {
  citations: Array<{ url?: string; label?: string }>
  title?: string
  className?: string
}

export function CitationList({ citations, title = 'Sources', className }: CitationListProps) {
  // Filter to only valid citations
  const validCitations = citations.filter(c => isValidUrl(c.url))
  
  if (validCitations.length === 0) {
    return null
  }

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">
        {validCitations.map((citation, index) => (
          <CitationLink
            key={`${citation.url}-${index}`}
            url={citation.url}
            label={citation.label}
          />
        ))}
      </div>
    </div>
  )
}
