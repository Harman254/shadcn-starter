/**
 * @fileOverview
 * Advanced Caching Manager for API requests and tool results
 * Supports TTL, invalidation, and multi-level caching
 */

// ============================================================================
// TYPES
// ============================================================================

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  key: string;
  tags?: string[]; // For tag-based invalidation
}

export interface CacheOptions {
  ttl?: number; // Default TTL in milliseconds
  tags?: string[]; // Tags for invalidation
  key?: string; // Custom cache key
}

// ============================================================================
// CACHE MANAGER
// ============================================================================

export class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private tagIndex: Map<string, Set<string>> = new Map(); // tag -> Set of keys

  /**
   * Get cached data
   */
  get<T = any>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.removeFromTagIndex(key, entry.tags);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cached data
   */
  set<T = any>(key: string, data: T, options: CacheOptions = {}): void {
    const ttl = options.ttl || 5 * 60 * 1000; // Default 5 minutes
    const tags = options.tags || [];

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      key,
      tags,
    };

    this.cache.set(key, entry);
    this.addToTagIndex(key, tags);
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.removeFromTagIndex(key, entry.tags);
      return false;
    }

    return true;
  }

  /**
   * Delete specific key
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.removeFromTagIndex(key, entry.tags);
    }
    return this.cache.delete(key);
  }

  /**
   * Invalidate by tags
   */
  invalidateByTags(tags: string[]): number {
    let count = 0;
    const keysToDelete = new Set<string>();

    tags.forEach(tag => {
      const keys = this.tagIndex.get(tag);
      if (keys) {
        keys.forEach(key => keysToDelete.add(key));
      }
    });

    keysToDelete.forEach(key => {
      if (this.delete(key)) {
        count++;
      }
    });

    return count;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.tagIndex.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    entries: number;
    tags: number;
  } {
    return {
      size: this.cache.size,
      entries: this.cache.size,
      tags: this.tagIndex.size,
    };
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): number {
    const now = Date.now();
    let count = 0;
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      if (this.delete(key)) {
        count++;
      }
    });

    return count;
  }

  /**
   * Add key to tag index
   */
  private addToTagIndex(key: string, tags?: string[]): void {
    if (!tags) return;

    tags.forEach(tag => {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(key);
    });
  }

  /**
   * Remove key from tag index
   */
  private removeFromTagIndex(key: string, tags?: string[]): void {
    if (!tags) return;

    tags.forEach(tag => {
      const keys = this.tagIndex.get(tag);
      if (keys) {
        keys.delete(key);
        if (keys.size === 0) {
          this.tagIndex.delete(tag);
        }
      }
    });
  }

  /**
   * Generate cache key from parameters
   */
  generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${JSON.stringify(params[key])}`)
      .join('|');
    
    return `${prefix}:${sortedParams}`;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let cacheManagerInstance: CacheManager | null = null;

export function getCacheManager(): CacheManager {
  if (!cacheManagerInstance) {
    cacheManagerInstance = new CacheManager();
    
    // Clean expired entries every 5 minutes
    setInterval(() => {
      cacheManagerInstance?.cleanExpired();
    }, 5 * 60 * 1000);
  }
  return cacheManagerInstance;
}

