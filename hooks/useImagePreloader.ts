import { useState, useEffect, useCallback, useRef } from 'react';
import { Image } from 'expo-image';

export interface ImagePreloadConfig {
  priority?: 'high' | 'medium' | 'low';
  maxRetries?: number;
  timeout?: number;
  cachePolicy?: 'disk' | 'memory' | 'memory-disk' | 'none';
}

export interface PreloadedImageData {
  uri: string;
  isLoaded: boolean;
  hasError: boolean;
  error?: Error;
  retryCount: number;
}

interface UseImagePreloaderOptions {
  preloadAhead?: number; // Number of items to preload ahead
  maxConcurrent?: number; // Maximum concurrent preload operations
  defaultConfig?: ImagePreloadConfig;
}

export const useImagePreloader = (options: UseImagePreloaderOptions = {}) => {
  const {
    preloadAhead = 5,
    maxConcurrent = 3,
    defaultConfig = {
      priority: 'medium',
      maxRetries: 2,
      timeout: 10000,
      cachePolicy: 'memory-disk'
    }
  } = options;

  const [preloadedImages, setPreloadedImages] = useState<Map<string, PreloadedImageData>>(new Map());
  const [isPreloading, setIsPreloading] = useState(false);
  const preloadQueue = useRef<string[]>([]);
  const activePreloads = useRef<Set<string>>(new Set());
  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  // Get preload status for a specific image
  const getImageStatus = useCallback((uri: string): PreloadedImageData => {
    return preloadedImages.get(uri) || {
      uri,
      isLoaded: false,
      hasError: false,
      retryCount: 0
    };
  }, [preloadedImages]);

  // Check if image is ready to display
  const isImageReady = useCallback((uri: string): boolean => {
    const status = getImageStatus(uri);
    return status.isLoaded && !status.hasError;
  }, [getImageStatus]);

  // Preload a single image
  const preloadImage = useCallback(async (
    uri: string, 
    config: ImagePreloadConfig = {}
  ): Promise<boolean> => {
    const finalConfig = { ...defaultConfig, ...config };
    
    // Skip if already loaded or being processed
    const currentStatus = getImageStatus(uri);
    if (currentStatus.isLoaded || activePreloads.current.has(uri)) {
      return currentStatus.isLoaded;
    }

    // Check retry limit
    if (currentStatus.retryCount >= (finalConfig.maxRetries || 2)) {
      return false;
    }

    // Add to active preloads
    activePreloads.current.add(uri);

    // Create abort controller for timeout
    const abortController = new AbortController();
    abortControllers.current.set(uri, abortController);

    // Set timeout
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, finalConfig.timeout || 10000);

    try {
      // Update status to loading
      setPreloadedImages(prev => new Map(prev.set(uri, {
        uri,
        isLoaded: false,
        hasError: false,
        retryCount: currentStatus.retryCount
      })));

      // Preload using expo-image
      const success = await Image.prefetch([{
        uri,
        cacheKey: uri, // Use URI as cache key
        headers: {
          'Cache-Control': finalConfig.cachePolicy === 'none' ? 'no-cache' : 'max-age=3600'
        }
      }], finalConfig.cachePolicy || 'memory-disk');

      clearTimeout(timeoutId);

      if (success && !abortController.signal.aborted) {
        // Successfully preloaded
        setPreloadedImages(prev => new Map(prev.set(uri, {
          uri,
          isLoaded: true,
          hasError: false,
          retryCount: currentStatus.retryCount
        })));
        return true;
      } else {
        throw new Error('Failed to preload image');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Update status with error
      setPreloadedImages(prev => new Map(prev.set(uri, {
        uri,
        isLoaded: false,
        hasError: true,
        error: error instanceof Error ? error : new Error('Unknown error'),
        retryCount: currentStatus.retryCount + 1
      })));

      console.warn(`Failed to preload image ${uri}:`, error);
      return false;
    } finally {
      // Clean up
      activePreloads.current.delete(uri);
      abortControllers.current.delete(uri);
    }
  }, [defaultConfig, getImageStatus]);

  // Preload multiple images with concurrency control
  const preloadImages = useCallback(async (
    uris: string[], 
    config: ImagePreloadConfig = {}
  ): Promise<boolean[]> => {
    if (uris.length === 0) return [];

    setIsPreloading(true);

    try {
      const results: boolean[] = [];
      
      // Process images in batches to respect maxConcurrent limit
      for (let i = 0; i < uris.length; i += maxConcurrent) {
        const batch = uris.slice(i, i + maxConcurrent);
        const batchPromises = batch.map(uri => preloadImage(uri, config));
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }

      return results;
    } finally {
      setIsPreloading(false);
    }
  }, [maxConcurrent, preloadImage]);

  // Preload images for a data array (e.g., restaurant/guide list)
  const preloadForDataArray = useCallback(async <T extends { featured_image?: string }>(
    data: T[],
    currentIndex: number = 0,
    config: ImagePreloadConfig = {}
  ): Promise<void> => {
    const startIndex = Math.max(0, currentIndex);
    const endIndex = Math.min(data.length, currentIndex + preloadAhead);
    
    const urisToPreload = data
      .slice(startIndex, endIndex)
      .map(item => item.featured_image)
      .filter((uri): uri is string => !!uri);

    if (urisToPreload.length > 0) {
      await preloadImages(urisToPreload, config);
    }
  }, [preloadAhead, preloadImages]);

  // Clear preloaded images (useful for memory management)
  const clearPreloadedImages = useCallback(() => {
    // Cancel any active preloads
    abortControllers.current.forEach(controller => controller.abort());
    abortControllers.current.clear();
    activePreloads.current.clear();
    
    // Clear cache
    setPreloadedImages(new Map());
  }, []);

  // Get loading stats
  const getStats = useCallback(() => {
    const images = Array.from(preloadedImages.values());
    return {
      total: images.length,
      loaded: images.filter(img => img.isLoaded).length,
      errors: images.filter(img => img.hasError).length,
      loading: activePreloads.current.size
    };
  }, [preloadedImages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearPreloadedImages();
    };
  }, [clearPreloadedImages]);

  return {
    preloadImage,
    preloadImages,
    preloadForDataArray,
    isImageReady,
    getImageStatus,
    isPreloading,
    clearPreloadedImages,
    getStats
  };
};

export default useImagePreloader;