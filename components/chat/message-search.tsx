'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Search, X, ArrowUp, ArrowDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Message } from '@/types';

interface MessageSearchProps {
  messages: Message[];
  onSelectMessage?: (messageId: string) => void;
  className?: string;
}

export function MessageSearch({ messages, onSelectMessage, className }: MessageSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Filter messages based on search query
  // Supports both word matching and substring matching
  const matchingMessages = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase().trim();
    const queryWords = query.split(/\s+/).filter(word => word.length > 0);
    
    return messages
      .map((msg, index) => ({ message: msg, originalIndex: index }))
      .filter(({ message }) => {
        const content = message.content.toLowerCase();
        
        // If query has multiple words, check if all words appear (word boundary matching)
        if (queryWords.length > 1) {
          return queryWords.every(word => {
            // Try word boundary match first
            const wordRegex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            if (wordRegex.test(content)) return true;
            // Fallback to substring if word boundary doesn't match
            return content.includes(word);
          });
        } else {
          // Single word: try word boundary match first, then substring
          const word = queryWords[0];
          const wordRegex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          return wordRegex.test(content) || content.includes(word);
        }
      });
  }, [messages, searchQuery]);

  // Navigate to next/previous match
  const navigateMatch = useCallback((direction: 'next' | 'prev') => {
    if (matchingMessages.length === 0) return;

    setSelectedIndex((prev) => {
      if (direction === 'next') {
        return prev < matchingMessages.length - 1 ? prev + 1 : 0;
      } else {
        return prev > 0 ? prev - 1 : matchingMessages.length - 1;
      }
    });
  }, [matchingMessages.length]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      navigateMatch('prev');
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (matchingMessages.length > 0) {
        navigateMatch('next');
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setSearchQuery('');
      setSelectedIndex(-1);
      inputRef.current?.blur();
    } else if (e.key === 'ArrowDown' && matchingMessages.length > 0) {
      e.preventDefault();
      navigateMatch('next');
    } else if (e.key === 'ArrowUp' && matchingMessages.length > 0) {
      e.preventDefault();
      navigateMatch('prev');
    }
  }, [navigateMatch, matchingMessages.length]);

  // Scroll to selected message
  const scrollToMessage = useCallback((messageId: string) => {
    // Try multiple selectors to find the message element
    const selectors = [
      `[data-message-id="${messageId}"]`,
      `article[data-message-id="${messageId}"]`,
      `[id="message-${messageId}"]`,
    ];
    
    let element: Element | null = null;
    for (const selector of selectors) {
      element = document.querySelector(selector);
      if (element) break;
    }
    
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight the message briefly with animation
      const htmlElement = element as HTMLElement;
      htmlElement.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'transition-all', 'duration-300');
      htmlElement.setAttribute('aria-current', 'true');
      
      // Focus the element for screen readers
      if (htmlElement instanceof HTMLElement) {
        htmlElement.focus({ preventScroll: true });
      }
      
      setTimeout(() => {
        htmlElement.classList.remove('ring-2', 'ring-primary', 'ring-offset-2', 'transition-all', 'duration-300');
        htmlElement.removeAttribute('aria-current');
      }, 2000);
    }
    onSelectMessage?.(messageId);
  }, [onSelectMessage]);

  // Update selected message when index changes (using useEffect to avoid infinite loops)
  useEffect(() => {
    if (selectedIndex >= 0 && matchingMessages[selectedIndex]) {
      const currentMatch = matchingMessages[selectedIndex];
      // Scroll to message when selection changes
      const timeoutId = setTimeout(() => scrollToMessage(currentMatch.message.id), 100);
      return () => clearTimeout(timeoutId);
    }
  }, [selectedIndex, matchingMessages, scrollToMessage]);

  const hasResults = matchingMessages.length > 0;
  const showResults = searchQuery.trim().length > 0;

  return (
    <div className={cn("relative", className)} role="search" aria-label="Search messages">
      <div className="relative">
        <Search 
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" 
          aria-hidden="true"
        />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search messages..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            "pl-9 pr-20",
            showResults && hasResults && "rounded-b-none"
          )}
          aria-label="Search messages"
          aria-describedby={showResults ? "search-results-description" : undefined}
          aria-controls={showResults ? "search-results" : undefined}
          aria-expanded={showResults}
          aria-autocomplete="list"
          role="combobox"
        />
        {searchQuery && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {hasResults && (
              <span 
                className="text-xs text-muted-foreground"
                aria-live="polite"
                aria-atomic="true"
                id="search-results-description"
              >
                {selectedIndex >= 0 ? `${selectedIndex + 1} of ${matchingMessages.length} results` : `${matchingMessages.length} result${matchingMessages.length !== 1 ? 's' : ''}`}
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                setSearchQuery('');
                setSelectedIndex(-1);
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              type="button"
            >
              <X className="h-3 w-3" aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>

      {/* Search results dropdown */}
      {showResults && (
        <div 
          ref={resultsRef}
          id="search-results"
          className={cn(
            "absolute top-full left-0 right-0 z-50",
            "bg-background border border-t-0 rounded-b-lg",
            "max-h-60 overflow-auto",
            "shadow-lg"
          )}
          role="listbox"
          aria-label="Search results"
        >
          {hasResults ? (
            <>
              <div className="p-2 border-b border-border" role="presentation">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{matchingMessages.length} result{matchingMessages.length !== 1 ? 's' : ''}</span>
                  <div className="flex items-center gap-2" aria-hidden="true">
                    <span className="flex items-center gap-1">
                      <ArrowUp className="h-3 w-3" />
                      <ArrowDown className="h-3 w-3" />
                      <span>Navigate</span>
                    </span>
                    <span className="text-xs">Enter to select</span>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-border" role="group">
                {matchingMessages.map(({ message, originalIndex }, index) => {
                  const isSelected = index === selectedIndex;
                  const preview = message.content.substring(0, 150);
                  const queryLower = searchQuery.toLowerCase();
                  
                  // Find all matches in the preview for better highlighting
                  const findMatches = (text: string, query: string) => {
                    const matches: Array<{ start: number; end: number }> = [];
                    const queryWords = query.split(/\s+/).filter(w => w.length > 0);
                    const textLower = text.toLowerCase();
                    
                    queryWords.forEach(word => {
                      let startIndex = 0;
                      while (true) {
                        const index = textLower.indexOf(word, startIndex);
                        if (index === -1) break;
                        matches.push({ start: index, end: index + word.length });
                        startIndex = index + 1;
                      }
                    });
                    
                    return matches.sort((a, b) => a.start - b.start);
                  };
                  
                  const matches = findMatches(preview, queryLower);
                  
                  // Render preview with highlighted matches
                  const renderHighlightedPreview = () => {
                    if (matches.length === 0) {
                      return <span>{preview}{message.content.length > 150 && '...'}</span>;
                    }
                    
                    const parts: Array<{ text: string; isMatch: boolean }> = [];
                    let lastIndex = 0;
                    
                    matches.forEach(match => {
                      if (match.start > lastIndex) {
                        parts.push({ text: preview.substring(lastIndex, match.start), isMatch: false });
                      }
                      parts.push({ text: preview.substring(match.start, match.end), isMatch: true });
                      lastIndex = match.end;
                    });
                    
                    if (lastIndex < preview.length) {
                      parts.push({ text: preview.substring(lastIndex), isMatch: false });
                    }
                    
                    return (
                      <>
                        {parts.map((part, i) => 
                          part.isMatch ? (
                            <mark 
                              key={i} 
                              className="bg-primary/20 text-primary font-medium"
                              aria-label={`Match: ${part.text}`}
                            >
                              {part.text}
                            </mark>
                          ) : (
                            <span key={i}>{part.text}</span>
                          )
                        )}
                        {message.content.length > 150 && '...'}
                      </>
                    );
                  };
                  
                  return (
                    <button
                      key={message.id}
                      onClick={() => {
                        scrollToMessage(message.id);
                        setSelectedIndex(index);
                      }}
                      className={cn(
                        "w-full text-left p-3 hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                        isSelected && "bg-muted"
                      )}
                      role="option"
                      aria-selected={isSelected}
                      aria-label={`${message.role === 'user' ? 'Your message' : 'AI message'} ${originalIndex + 1}: ${preview.substring(0, 50)}...`}
                      id={`search-result-${index}`}
                    >
                      <div className="text-xs text-muted-foreground mb-1">
                        {message.role === 'user' ? 'You' : 'AI'} • Message #{originalIndex + 1}
                      </div>
                      <div className="text-sm line-clamp-2">
                        {renderHighlightedPreview()}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div 
              className="p-4 text-center text-sm text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              No messages found matching &quot;{searchQuery}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}

