import React, { useState, useRef, useEffect } from 'react';
import { Image, ImageBackground, View, StyleSheet, Dimensions } from 'react-native';
import { SkeletonBase } from './skeleton/SkeletonBase';
import { usePerformance } from '../context/PerformanceContext';

const { width: screenWidth } = Dimensions.get('window');

interface LazyImageProps {
  uri: string;
  fallbackUri?: string;
  style?: any;
  imageStyle?: any;
  children?: React.ReactNode;
  threshold?: number; // Distance from viewport to start loading
  placeholder?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  priority?: 'low' | 'normal' | 'high';
  quality?: 'low' | 'medium' | 'high';
}

interface LazyImageBackgroundProps extends LazyImageProps {
  children?: React.ReactNode;
}

// Helper function to optimize image URLs based on screen size and quality
const optimizeImageUrl = (uri: string, quality: 'low' | 'medium' | 'high' = 'medium', usePerformanceOptimization = false): string => {
  if (!uri || !uri.includes('unsplash.com')) return uri;
  
  // Determine optimal dimensions based on screen width and quality
  const qualityMap = {
    low: Math.min(400, screenWidth),
    medium: Math.min(800, screenWidth * 2),
    high: Math.min(1200, screenWidth * 3)
  };
  
  const targetWidth = qualityMap[quality];
  const jpegQuality = usePerformanceOptimization ? (quality === 'low' ? 60 : quality === 'medium' ? 70 : 80) : 80;
  
  // Add Unsplash optimization parameters
  if (uri.includes('?')) {
    return `${uri}&w=${targetWidth}&q=${jpegQuality}&fm=jpg&fit=crop`;
  } else {
    return `${uri}?w=${targetWidth}&q=${jpegQuality}&fm=jpg&fit=crop`;
  }
};

export const LazyImage: React.FC<LazyImageProps> = ({
  uri,
  fallbackUri = 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  style,
  threshold = 100,
  placeholder,
  onLoad,
  onError,
  priority = 'normal',
  quality = 'medium',
  ...imageProps
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority === 'high');
  const imageRef = useRef<View>(null);
  
  // Get performance optimizations
  const { getOptimizedConfig, getPerformanceStatus } = usePerformance();
  const optimizedConfig = getOptimizedConfig();
  const performanceStatus = getPerformanceStatus();

  // Intersection observer simulation for React Native
  useEffect(() => {
    if (priority === 'high') {
      setShouldLoad(true);
      return;
    }

    // Use performance-optimized timing for lazy loading
    const loadDelay = priority === 'low' ? 
      (performanceStatus.isOptimized ? 3000 : 2000) : 
      (performanceStatus.isOptimized ? 1000 : 500);
      
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, loadDelay);

    return () => clearTimeout(timer);
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Use performance-aware image optimization
  const effectiveQuality = performanceStatus.isOptimized ? optimizedConfig.imageQuality : quality;
  const optimizedUri = optimizeImageUrl(
    optimizedConfig.shouldPreloadImages ? uri || fallbackUri : fallbackUri, 
    effectiveQuality as 'low' | 'medium' | 'high',
    performanceStatus.isOptimized
  );

  if (!shouldLoad) {
    return (
      <View ref={imageRef} style={style}>
        {placeholder || <SkeletonBase style={styles.skeleton} />}
      </View>
    );
  }

  if (hasError && uri !== fallbackUri) {
    // Retry with fallback
    return (
      <LazyImage
        {...imageProps}
        uri={fallbackUri}
        style={style}
        onLoad={handleLoad}
        onError={handleError}
        priority="high" // Load fallback immediately
        quality={quality}
      />
    );
  }

  return (
    <View style={style}>
      {!isLoaded && (
        <View style={[StyleSheet.absoluteFillObject, styles.placeholderContainer]}>
          {placeholder || <SkeletonBase style={styles.skeleton} />}
        </View>
      )}
      <Image
        source={{ uri: optimizedUri }}
        style={[style, { opacity: isLoaded ? 1 : 0 }]}
        onLoad={handleLoad}
        onError={handleError}
        {...imageProps}
      />
    </View>
  );
};

export const LazyImageBackground: React.FC<LazyImageBackgroundProps> = ({
  uri,
  fallbackUri = 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  style,
  imageStyle,
  children,
  threshold = 100,
  placeholder,
  onLoad,
  onError,
  priority = 'normal',
  quality = 'medium',
  ...imageProps
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority === 'high');
  const imageRef = useRef<View>(null);
  
  // Get performance optimizations  
  const { getOptimizedConfig, getPerformanceStatus } = usePerformance();
  const optimizedConfig = getOptimizedConfig();
  const performanceStatus = getPerformanceStatus();

  useEffect(() => {
    if (priority === 'high') {
      setShouldLoad(true);
      return;
    }

    // Use performance-optimized timing for lazy loading
    const loadDelay = priority === 'low' ? 
      (performanceStatus.isOptimized ? 3000 : 2000) : 
      (performanceStatus.isOptimized ? 1000 : 500);
      
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, loadDelay);

    return () => clearTimeout(timer);
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Use performance-aware image optimization for background
  const effectiveQuality = performanceStatus.isOptimized ? optimizedConfig.imageQuality : quality;
  const optimizedUri = optimizeImageUrl(
    optimizedConfig.shouldPreloadImages ? uri || fallbackUri : fallbackUri,
    effectiveQuality as 'low' | 'medium' | 'high',
    performanceStatus.isOptimized
  );

  if (!shouldLoad) {
    return (
      <View ref={imageRef} style={style}>
        {placeholder || <SkeletonBase style={styles.skeleton} />}
        {children}
      </View>
    );
  }

  if (hasError && uri !== fallbackUri) {
    return (
      <LazyImageBackground
        {...imageProps}
        uri={fallbackUri}
        style={style}
        imageStyle={imageStyle}
        onLoad={handleLoad}
        onError={handleError}
        priority="high"
        quality={quality}
      >
        {children}
      </LazyImageBackground>
    );
  }

  return (
    <View style={style}>
      {!isLoaded && (
        <View style={[StyleSheet.absoluteFillObject, styles.placeholderContainer]}>
          {placeholder || <SkeletonBase style={styles.skeleton} />}
        </View>
      )}
      <ImageBackground
        source={{ uri: optimizedUri }}
        style={[style, { opacity: isLoaded ? 1 : 0 }]}
        imageStyle={imageStyle}
        onLoad={handleLoad}
        onError={handleError}
        {...imageProps}
      >
        {children}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E1E9EE',
    borderRadius: 8,
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});

export default LazyImage;