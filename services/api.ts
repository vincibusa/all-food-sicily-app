import { API_CONFIG, API_HEADERS, API_TIMEOUT } from './api.config';
import { cacheManager, CacheConfig } from './cache';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  statusCode?: number;
  response?: any;

  constructor(message: string, statusCode?: number, response?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

/**
 * Base API client with common functionality
 */
class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}`;
  }


  /**
   * Make a request to the API
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...API_HEADERS,
        ...options.headers,
      },
    };


    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);


      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP error! status: ${response.status}`,
          response.status,
          errorData
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError('Request timeout');
        }
        throw new ApiError(error.message);
      }
      
      throw new ApiError('Unknown error occurred');
    }
  }

  /**
   * GET request with intelligent caching
   */
  async get<T>(
    endpoint: string, 
    params?: Record<string, any>,
    cacheConfig?: CacheConfig & { useCache?: boolean; forceRefresh?: boolean }
  ): Promise<T> {
    let url = endpoint;
    if (params) {
      const queryString = new URLSearchParams(
        Object.entries(params).filter(([_, value]) => value != null)
      ).toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const useCache = cacheConfig?.useCache !== false; // Default to true
    const forceRefresh = cacheConfig?.forceRefresh === true;

    // Try cache first (unless force refresh)
    if (useCache && !forceRefresh) {
      const cached = await cacheManager.get<T>(endpoint, params, cacheConfig);
      if (cached) {
        
        // If stale, fetch fresh data in background
        if (cached.isStale && cacheConfig?.staleWhileRevalidate) {
          this.request<T>(url, { method: 'GET' })
            .then(freshData => {
              cacheManager.set(endpoint, freshData, cacheConfig);
            })
            .catch(error => {
            });
        }
        
        return cached.data;
      }
    }

    // Fetch from API
    const data = await this.request<T>(url, { method: 'GET' });
    
    // Cache the result
    if (useCache) {
      await cacheManager.set(endpoint, data, cacheConfig);
    }
    
    return data;
  }

  /**
   * POST request (invalidates related cache)
   */
  async post<T>(
    endpoint: string, 
    data?: any, 
    options?: { headers?: Record<string, string>; invalidateCache?: string[] }
  ): Promise<T> {
    const body = options?.headers?.['Content-Type'] === 'application/x-www-form-urlencoded' 
      ? data 
      : (data ? JSON.stringify(data) : undefined);
      
    const result = await this.request<T>(endpoint, {
      method: 'POST',
      body,
      headers: options?.headers,
    });
    
    // Invalidate related cache entries
    if (options?.invalidateCache) {
      await Promise.all(
        options.invalidateCache.map(cacheKey => cacheManager.delete(cacheKey))
      );
    }
    
    return result;
  }

  /**
   * PUT request (invalidates related cache)
   */
  async put<T>(
    endpoint: string, 
    data?: any,
    options?: { invalidateCache?: string[] }
  ): Promise<T> {
    const result = await this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
    
    // Invalidate related cache entries
    if (options?.invalidateCache) {
      await Promise.all(
        options.invalidateCache.map(cacheKey => cacheManager.delete(cacheKey))
      );
    }
    
    return result;
  }

  /**
   * DELETE request (invalidates related cache)
   */
  async delete<T>(
    endpoint: string,
    options?: { invalidateCache?: string[] }
  ): Promise<T> {
    const result = await this.request<T>(endpoint, { method: 'DELETE' });
    
    // Invalidate related cache entries
    if (options?.invalidateCache) {
      await Promise.all(
        options.invalidateCache.map(cacheKey => cacheManager.delete(cacheKey))
      );
    }
    
    return result;
  }
  
  /**
   * Clear cache for specific data type
   */
  async clearCache(dataType?: 'restaurants' | 'guides' | 'categories' | 'search'): Promise<void> {
    if (dataType) {
      await cacheManager.clearType(dataType);
    } else {
      await cacheManager.clear();
    }
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats() {
    return cacheManager.getStats();
  }
}

// Singleton instance
export const apiClient = new ApiClient();