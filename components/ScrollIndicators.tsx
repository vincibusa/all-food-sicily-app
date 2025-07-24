/**
 * ScrollIndicators - Indicatori di scroll e paginazione avanzati
 * Design moderno 2025 con animazioni fluide
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  interpolateColor,
  useDerivedValue,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../app/context/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ==========================================
// 🎨 INDICATOR TYPES
// ==========================================

export enum ScrollIndicatorType {
  MINIMAL = 'minimal',        // Linea sottile
  ROUNDED = 'rounded',        // Pallini tondi
  PROGRESS = 'progress',      // Barra di progresso
  FLOATING = 'floating',      // Indicatore flottante
  PAGINATION = 'pagination',  // Dots per paginazione
}

export enum ScrollIndicatorPosition {
  RIGHT = 'right',
  LEFT = 'left',
  BOTTOM = 'bottom',
  TOP = 'top',
}

// ==========================================
// 🎯 VERTICAL SCROLL INDICATOR
// ==========================================

interface VerticalScrollIndicatorProps {
  scrollY: any; // Animated shared value
  contentHeight: number;
  containerHeight: number;
  type?: ScrollIndicatorType;
  position?: ScrollIndicatorPosition.RIGHT | ScrollIndicatorPosition.LEFT;
  color?: string;
  width?: number;
  margin?: number;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export const VerticalScrollIndicator: React.FC<VerticalScrollIndicatorProps> = ({
  scrollY,
  contentHeight,
  containerHeight,
  type = ScrollIndicatorType.ROUNDED,
  position = ScrollIndicatorPosition.RIGHT,
  color,
  width = 4,
  margin = 8,
  autoHide = true,
  autoHideDelay = 2000,
}) => {
  const { colors } = useTheme();
  const indicatorColor = color || colors.primary;
  
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  // Calcola la posizione e dimensione dell'indicatore
  const indicatorHeight = useDerivedValue(() => {
    if (contentHeight <= containerHeight) return 0;
    const ratio = containerHeight / contentHeight;
    return Math.max(30, containerHeight * ratio);
  });

  const indicatorY = useDerivedValue(() => {
    if (contentHeight <= containerHeight) return 0;
    const maxScroll = contentHeight - containerHeight;
    const scrollProgress = scrollY.value / maxScroll;
    const maxIndicatorY = containerHeight - indicatorHeight.value;
    return scrollProgress * maxIndicatorY;
  });

  // Semplificazione: gestione dell'auto-hide tramite animatedStyle
  useEffect(() => {
    // Mostra l'indicatore inizialmente se c'è contenuto scrollabile
    if (contentHeight > containerHeight) {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withTiming(1, { duration: 200 });
    }
  }, [contentHeight, containerHeight, opacity, scale]);

  // Stili animati
  const containerStyle = useAnimatedStyle(() => {
    // Auto-hide logic semplificato
    if (autoHide && scrollY.value > 10) {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withTiming(1, { duration: 200 });
    } else if (autoHide) {
      opacity.value = withTiming(0, { duration: 500 });
      scale.value = withTiming(0.8, { duration: 500 });
    }
    
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  }, [autoHide]);

  const indicatorStyle = useAnimatedStyle(() => {    
    const backgroundColor = type === ScrollIndicatorType.PROGRESS 
      ? interpolateColor(
          scrollY.value / Math.max(1, contentHeight - containerHeight),
          [0, 0.5, 1],
          [indicatorColor + '60', indicatorColor, indicatorColor + 'CC']
        )
      : indicatorColor;

    return {
      height: indicatorHeight.value,
      transform: [{ translateY: indicatorY.value }],
      backgroundColor,
    };
  });
  
  // Non renderizzare se i valori non sono validi
  if (!scrollY || contentHeight <= 0 || containerHeight <= 0 || contentHeight <= containerHeight) {
    return null;
  }

  const getIndicatorWidth = () => {
    switch (type) {
      case ScrollIndicatorType.MINIMAL:
        return 2;
      case ScrollIndicatorType.ROUNDED:
        return 6;
      case ScrollIndicatorType.PROGRESS:
        return width;
      case ScrollIndicatorType.FLOATING:
        return 8;
      default:
        return width;
    }
  };

  const getBorderRadius = () => {
    switch (type) {
      case ScrollIndicatorType.ROUNDED:
      case ScrollIndicatorType.FLOATING:
        return getIndicatorWidth() / 2;
      case ScrollIndicatorType.PROGRESS:
        return 2;
      default:
        return 0;
    }
  };

  const positionStyle = position === ScrollIndicatorPosition.RIGHT 
    ? { right: margin }
    : { left: margin };

  return (
    <Animated.View 
      style={[
        styles.verticalContainer,
        positionStyle,
        containerStyle,
        type === ScrollIndicatorType.FLOATING && styles.floatingContainer
      ]}
    >
      <Animated.View
        style={[
          {
            width: getIndicatorWidth(),
            borderRadius: getBorderRadius(),
          },
          indicatorStyle,
        ]}
      />
    </Animated.View>
  );
};

// ==========================================
// 🎯 HORIZONTAL PAGINATION INDICATOR
// ==========================================

interface PaginationIndicatorProps {
  currentIndex: number;
  totalPages: number;
  onPageChange?: (index: number) => void;
  type?: ScrollIndicatorType;
  color?: string;
  size?: number;
  spacing?: number;
  position?: ScrollIndicatorPosition.BOTTOM | ScrollIndicatorPosition.TOP;
}

export const PaginationIndicator: React.FC<PaginationIndicatorProps> = ({
  currentIndex,
  totalPages,
  onPageChange,
  type = ScrollIndicatorType.PAGINATION,
  color,
  size = 8,
  spacing = 12,
  position = ScrollIndicatorPosition.BOTTOM,
}) => {
  const { colors } = useTheme();
  const indicatorColor = color || colors.primary;

  const renderDots = () => {
    return Array.from({ length: totalPages }, (_, index) => {
      const isActive = index === currentIndex;
      
      return (
        <PaginationDot
          key={index}
          isActive={isActive}
          color={indicatorColor}
          size={size}
          type={type}
          onPress={() => onPageChange?.(index)}
        />
      );
    });
  };

  const positionStyle = position === ScrollIndicatorPosition.BOTTOM 
    ? { bottom: 20 }
    : { top: 20 };

  return (
    <View style={[styles.paginationContainer, positionStyle]}>
      <View style={[styles.dotsContainer, { gap: spacing }]}>
        {renderDots()}
      </View>
    </View>
  );
};

// ==========================================
// 🎯 PAGINATION DOT COMPONENT
// ==========================================

interface PaginationDotProps {
  isActive: boolean;
  color: string;
  size: number;
  type: ScrollIndicatorType;
  onPress?: () => void;
}

const PaginationDot: React.FC<PaginationDotProps> = ({
  isActive,
  color,
  size,
  type,
  onPress,
}) => {
  const scale = useSharedValue(isActive ? 1 : 0.7);
  const opacity = useSharedValue(isActive ? 1 : 0.4);

  useEffect(() => {
    scale.value = withTiming(isActive ? 1 : 0.7, { duration: 200 });
    opacity.value = withTiming(isActive ? 1 : 0.4, { duration: 200 });
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getDotStyle = () => {
    const baseStyle = {
      width: size,
      height: size,
      backgroundColor: color,
    };

    switch (type) {
      case ScrollIndicatorType.ROUNDED:
      case ScrollIndicatorType.PAGINATION:
        return {
          ...baseStyle,
          borderRadius: size / 2,
        };
      case ScrollIndicatorType.PROGRESS:
        return {
          ...baseStyle,
          width: isActive ? size * 2 : size,
          borderRadius: size / 4,
        };
      default:
        return {
          ...baseStyle,
          borderRadius: size / 2,
        };
    }
  };

  return (
    <Animated.View style={[getDotStyle(), animatedStyle]}>
      {onPress && (
        <View style={StyleSheet.absoluteFillObject}>
          {/* Invisible touchable area */}
        </View>
      )}
    </Animated.View>
  );
};

// ==========================================
// 🎯 FLOATING SCROLL PROGRESS
// ==========================================

interface FloatingScrollProgressProps {
  scrollY: any; // Animated shared value
  contentHeight: number;
  containerHeight: number;
  color?: string;
  size?: number;
}

export const FloatingScrollProgress: React.FC<FloatingScrollProgressProps> = ({
  scrollY,
  contentHeight,
  containerHeight,
  color,
  size = 60,
}) => {
  const { colors } = useTheme();
  const progressColor = color || colors.primary;
  
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  const progress = useDerivedValue(() => {
    const maxScroll = contentHeight - containerHeight;
    return Math.min(scrollY.value / maxScroll, 1);
  });

  // Auto-show/hide semplificato
  const containerStyle = useAnimatedStyle(() => {
    // Mostra quando scroll > 100
    if (scrollY.value > 100) {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withTiming(1, { duration: 200 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.8, { duration: 200 });
    }
    
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View style={[styles.floatingProgress, { width: size, height: size }, containerStyle]}>
      {/* Circular progress implementation would go here */}
      <View style={[styles.progressCircle, { backgroundColor: progressColor + '20' }]}>
        <View style={[styles.progressFill, { backgroundColor: progressColor }]} />
      </View>
    </Animated.View>
  );
};

// ==========================================
// 🎨 STYLES
// ==========================================

const styles = StyleSheet.create({
  // Vertical scroll indicator
  verticalContainer: {
    position: 'absolute',
    top: 20,
    bottom: 20,
    zIndex: 100,
    justifyContent: 'flex-start',
  },
  
  floatingContainer: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    padding: 4,
  },
  
  // Pagination dots
  paginationContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  
  // Floating progress
  floatingProgress: {
    position: 'absolute',
    top: SCREEN_HEIGHT / 2,
    right: 20,
    zIndex: 100,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  
  progressCircle: {
    flex: 1,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  progressFill: {
    width: '60%',
    height: '60%',
    borderRadius: 15,
  },
});

export default {
  VerticalScrollIndicator,
  PaginationIndicator,
  FloatingScrollProgress,
  ScrollIndicatorType,
  ScrollIndicatorPosition,
};