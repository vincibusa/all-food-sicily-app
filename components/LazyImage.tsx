import React, { useState, useRef, useEffect } from 'react';
import { Image, ImageBackground, View, StyleSheet, Dimensions } from 'react-native';
import { SkeletonBase } from './skeleton/SkeletonBase';

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
const optimizeImageUrl = (uri: string, quality: 'low' | 'medium' | 'high' = 'medium'): string => {
  if (!uri || !uri.includes('unsplash.com')) return uri;
  
  // Determine optimal dimensions based on screen width and quality
  const qualityMap = {
    low: Math.min(400, screenWidth),
    medium: Math.min(800, screenWidth * 2),
    high: Math.min(1200, screenWidth * 3)
  };
  
  const targetWidth = qualityMap[quality];
  
  // Add Unsplash optimization parameters
  if (uri.includes('?')) {
    return `${uri}&w=${targetWidth}&q=80&fm=jpg&fit=crop`;
  } else {
    return `${uri}?w=${targetWidth}&q=80&fm=jpg&fit=crop`;
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

  // Intersection observer simulation for React Native
  useEffect(() => {
    if (priority === 'high') {
      setShouldLoad(true);
      return;
    }

    // For now, we'll use a simple timeout to simulate lazy loading
    // In a real implementation, you would use react-native-intersection-observer
    // or implement viewport detection
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, priority === 'low' ? 2000 : 500);

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

  const optimizedUri = optimizeImageUrl(uri || fallbackUri, quality);

  if (!shouldLoad) {
    return (
      <View ref={imageRef} style={style}>
        {placeholder || <SkeletonBase style={[styles.skeleton, style]} />}
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
          {placeholder || <SkeletonBase style={[styles.skeleton, style]} />}
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

  useEffect(() => {
    if (priority === 'high') {
      setShouldLoad(true);
      return;
    }

    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, priority === 'low' ? 2000 : 500);

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

  const optimizedUri = optimizeImageUrl(uri || fallbackUri, quality);

  if (!shouldLoad) {
    return (
      <View ref={imageRef} style={style}>
        {placeholder || <SkeletonBase style={[styles.skeleton, style]} />}
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
          {placeholder || <SkeletonBase style={[styles.skeleton, style]} />}
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