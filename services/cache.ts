import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  maxAge?: number; // Alternative to ttl
  staleWhileRevalidate?: boolean; // Return stale data while fetching fresh
  priority?: 'low' | 'normal' | 'high';
  compression?: boolean;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  etag?: string;
  priority: 'low' | 'normal' | 'high';
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  lastCleanup: number;
}

class CacheManager {
  private static instance: CacheManager;
  private memoryCache = new Map<string, CacheEntry<any>>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    lastCleanup: Date.now()
  };
  
  // Default configurations for different data types
  private defaultConfigs = {
    restaurants: { ttl: 15 * 60 * 1000, priority: 'high' as const }, // 15 minutes (reduced for fresher data)
    guides: { ttl: 30 * 60 * 1000, priority: 'high' as const }, // 30 minutes (reduced for fresher data)
    categories: { ttl: 24 * 60 * 60 * 1000, priority: 'normal' as const }, // 24 hours (unchanged, rarely change)
    search: { ttl: 5 * 60 * 1000, priority: 'low' as const }, // 5 minutes (reduced for fresher search)
  };

  private constructor() {
    // Cleanup expired entries periodically
    setInterval(() => this.cleanup(), 5 * 60 * 1000); // Every 5 minutes
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Generate cache key from endpoint and parameters
   */
  private generateKey(endpoint: string, params?: Record<string, any>): string {
    if (!params) return endpoint;
    
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, any>);
    
    return `${endpoint}?${JSON.stringify(sortedParams)}`;
  }

  /**
   * Get cache configuration for endpoint
   */
  private getConfig(endpoint: string, customConfig?: CacheConfig): CacheConfig {
    const dataType = this.detectDataType(endpoint);
    const defaultConfig = this.defaultConfigs[dataType] || { ttl: 15 * 60 * 1000, priority: 'normal' as const };
    
    return {
      ...defaultConfig,
      ...customConfig
    };
  }

  /**
   * Detect data type from endpoint for smart caching
   */
  private detectDataType(endpoint: string): keyof typeof this.defaultConfigs {
    if (endpoint.includes('/restaurants')) return 'restaurants';
    if (endpoint.includes('/guides') || endpoint.includes('/articles')) return 'guides';
    if (endpoint.includes('/categories')) return 'categories';
    if (endpoint.includes('/search')) return 'search';
    return 'guides'; // Default
  }

  /**
   * Check if cache entry is valid
   */
  private isValid<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Check if cache entry is stale but within stale-while-revalidate window
   */
  private isStale<T>(entry: CacheEntry<T>): boolean {
    const age = Date.now() - entry.timestamp;
    return age > entry.ttl && age < entry.ttl * 2; // Allow 2x TTL for stale
  }

  /**
   * Get from memory cache
   */
  async getFromMemory<T>(key: string): Promise<CacheEntry<T> | null> {
    return this.memoryCache.get(key) || null;
  }

  /**
   * Get from persistent storage
   */
  async getFromStorage<T>(key: string): Promise<CacheEntry<T> | null> {
    try {
      const stored = await AsyncStorage.getItem(`cache_${key}`);
      if (!stored) return null;
      
      const entry: CacheEntry<T> = JSON.parse(stored);
      
      // Move to memory cache for faster access
      this.memoryCache.set(key, entry);
      
      return entry;
    } catch (error) {
      return null;
    }
  }

  /**
   * Set in both memory and storage
   */
  async set<T>(
    key: string, 
    data: T, 
    config: CacheConfig = {}
  ): Promise<void> {
    const ttl = config.ttl || config.maxAge || 15 * 60 * 1000; // 15 minutes default
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      priority: config.priority || 'normal'
    };

    // Always store in memory for fast access
    this.memoryCache.set(key, entry);

    // Store in persistent storage for important data
    if (config.priority === 'high' || config.priority === 'normal') {
      try {
        await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(entry));
      } catch (error) {
      }
    }

    this.stats.size = this.memoryCache.size;
  }

  /**
   * Get cached data with smart fallback
   */
  async get<T>(
    endpoint: string, 
    params?: Record<string, any>,
    config?: CacheConfig
  ): Promise<{ data: T; isStale: boolean } | null> {
    const key = this.generateKey(endpoint, params);
    const fullConfig = this.getConfig(endpoint, config);

    // Try memory first
    let entry = await this.getFromMemory<T>(key);
    
    // Fallback to storage
    if (!entry) {
      entry = await this.getFromStorage<T>(key);
    }

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if valid
    if (this.isValid(entry)) {
      this.stats.hits++;
      return { data: entry.data, isStale: false };
    }

    // Check if stale but usable
    if (fullConfig.staleWhileRevalidate && this.isStale(entry)) {
      this.stats.hits++;
      return { data: entry.data, isStale: true };
    }

    // Expired
    this.stats.misses++;
    await this.delete(key);
    return null;
  }

  /**
   * Delete cache entry
   */
  async delete(keyOrEndpoint: string, params?: Record<string, any>): Promise<void> {
    const key = params ? this.generateKey(keyOrEndpoint, params) : keyOrEndpoint;
    
    this.memoryCache.delete(key);
    
    try {
      await AsyncStorage.removeItem(`cache_${key}`);
    } catch (error) {
    }

    this.stats.size = this.memoryCache.size;
  }

  /**
   * Clear all cache for a specific data type
   */
  async clearType(dataType: 'restaurants' | 'guides' | 'categories' | 'search'): Promise<void> {
    const keysToDelete: string[] = [];
    
    // Find keys that match the data type
    for (const key of this.memoryCache.keys()) {
      if (this.detectDataType(key) === dataType) {
        keysToDelete.push(key);
      }
    }

    // Delete found keys
    await Promise.all(keysToDelete.map(key => this.delete(key)));
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
    }

    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      lastCleanup: Date.now()
    };
  }

  /**
   * Cleanup expired entries
   */
  private async cleanup(): Promise<void> {
    const now = Date.now();
    const keysToDelete: string[] = [];

    // Check memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (!this.isValid(entry) && !this.isStale(entry)) {
        keysToDelete.push(key);
      }
    }

    // Delete expired entries
    await Promise.all(keysToDelete.map(key => this.delete(key)));

    this.stats.lastCleanup = now;
    this.stats.size = this.memoryCache.size;
    
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & { hitRate: number } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? this.stats.hits / total : 0;
    
    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100
    };
  }

  /**
   * Preload critical data
   */
  async preload(): Promise<void> {
    
    // This would typically be called with fresh data from the API
    // For now, it's a placeholder for the caching mechanism
  }
}

// Singleton instance
export const cacheManager = CacheManager.getInstance();

// Export types
export type { CacheManager };