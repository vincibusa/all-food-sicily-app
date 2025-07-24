/**
 * SkeletonBase - Sistema di skeleton loading avanzato
 * Conforme alle best practices 2025 con animazioni fluide
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../app/context/ThemeContext';
// import { AnimationTokens } from '../../constants/DesignTokens';

// ==========================================
// 🎨 SKELETON TYPES
// ==========================================

export enum SkeletonVariant {
  PULSE = 'pulse',
  SHIMMER = 'shimmer',
  WAVE = 'wave',
  BREATHING = 'breathing',
}

export interface SkeletonBaseProps {
  /**
   * Larghezza del skeleton (numero per px, stringa per %)
   */
  width?: number | string;
  
  /**
   * Altezza del skeleton
   */
  height?: number;
  
  /**
   * Border radius personalizzato
   */
  borderRadius?: number;
  
  /**
   * Variante di animazione
   */
  variant?: SkeletonVariant;
  
  /**
   * Velocità dell'animazione (ms)
   */
  duration?: number;
  
  /**
   * Stile personalizzato
   */
  style?: ViewStyle;
  
  /**
   * Disabilita animazione
   */
  static?: boolean;
  
  /**
   * Intensità dell'animazione (0-1)
   */
  intensity?: number;
}

// ==========================================
// 🎯 SKELETON BASE COMPONENT
// ==========================================

export const SkeletonBase: React.FC<SkeletonBaseProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  variant = SkeletonVariant.SHIMMER,
  duration = 500, // AnimationTokens.duration.slow,
  style,
  static: isStatic = false,
  intensity = 0.3,
}) => {
  const { colors } = useTheme();
  const animationValue = useSharedValue(0);

  // Avvia animazione
  useEffect(() => {
    if (!isStatic) {
      animationValue.value = withRepeat(
        withTiming(1, {
          duration,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
        }),
        -1,
        true
      );
    }
  }, [animationValue, duration, isStatic]);

  // Stili animati basati sulla variante
  const animatedStyle = useAnimatedStyle(() => {
    switch (variant) {
      case SkeletonVariant.PULSE:
        return {
          opacity: interpolate(animationValue.value, [0, 1], [1 - intensity, 1]),
        };
        
      case SkeletonVariant.SHIMMER:
        return {
          opacity: interpolate(
            animationValue.value,
            [0, 0.5, 1],
            [1 - intensity, 1, 1 - intensity]
          ),
        };
        
      case SkeletonVariant.WAVE:
        return {
          transform: [
            {
              scaleX: interpolate(animationValue.value, [0, 1], [1, 1 + intensity * 0.1]),
            },
          ],
          opacity: interpolate(animationValue.value, [0, 1], [1 - intensity, 1]),
        };
        
      case SkeletonVariant.BREATHING:
        return {
          transform: [
            {
              scale: interpolate(animationValue.value, [0, 1], [1, 1 + intensity * 0.05]),
            },
          ],
          opacity: interpolate(animationValue.value, [0, 1], [1 - intensity * 0.5, 1]),
        };
        
      default:
        return {};
    }
  });

  const skeletonStyle = {
    width: width as any, // Fix TypeScript type issue with Animated.View
    height,
    borderRadius,
    backgroundColor: colors.text + '15', // Più soft per il 2025
  };

  return (
    <Animated.View
      style={[
        skeletonStyle,
        animatedStyle,
        style,
      ]}
    />
  );
};

// ==========================================
// 🧩 SKELETON COMPONENTS PREBUILT
// ==========================================

/**
 * Skeleton per testo singola linea
 */
export const SkeletonText: React.FC<Omit<SkeletonBaseProps, 'height'> & { 
  lines?: number; 
  lineHeight?: number;
  spacing?: number;
}> = ({ 
  lines = 1, 
  lineHeight = 16, 
  spacing = 8, 
  ...props 
}) => {
  if (lines === 1) {
    return <SkeletonBase height={lineHeight} {...props} />;
  }

  return (
    <View>
      {Array.from({ length: lines }).map((_, index) => (
        <View key={index} style={{ marginBottom: index < lines - 1 ? spacing : 0 }}>
          <SkeletonBase 
            height={lineHeight} 
            width={index === lines - 1 ? '75%' : '100%'} // Ultima linea più corta
            {...props} 
          />
        </View>
      ))}
    </View>
  );
};

/**
 * Skeleton per avatar/immagine circolare
 */
export const SkeletonAvatar: React.FC<{ size?: number } & Omit<SkeletonBaseProps, 'width' | 'height' | 'borderRadius'>> = ({ 
  size = 40, 
  ...props 
}) => (
  <SkeletonBase 
    width={size} 
    height={size} 
    borderRadius={size / 2} 
    {...props} 
  />
);

/**
 * Skeleton per immagine rettangolare
 */
export const SkeletonImage: React.FC<{
  aspectRatio?: number;
} & SkeletonBaseProps> = ({ 
  aspectRatio = 16/9,
  width = '100%',
  height,
  ...props 
}) => {
  const calculatedHeight = height || (
    typeof width === 'number' ? width / aspectRatio : 200
  );
  
  return (
    <SkeletonBase 
      width={width} 
      height={calculatedHeight} 
      borderRadius={8}
      {...props} 
    />
  );
};

/**
 * Skeleton per badge/pill
 */
export const SkeletonBadge: React.FC<Omit<SkeletonBaseProps, 'height' | 'borderRadius'>> = (props) => (
  <SkeletonBase 
    height={24} 
    borderRadius={12} 
    width={60}
    {...props} 
  />
);

/**
 * Skeleton per icona
 */
export const SkeletonIcon: React.FC<{ size?: number } & Omit<SkeletonBaseProps, 'width' | 'height'>> = ({ 
  size = 24, 
  ...props 
}) => (
  <SkeletonBase 
    width={size} 
    height={size} 
    borderRadius={4}
    {...props} 
  />
);

// ==========================================
// 📦 SKELETON CONTAINER
// ==========================================

/**
 * Container per raggruppare skeleton con spaziatura
 */
export const SkeletonContainer: React.FC<{
  children: React.ReactNode;
  spacing?: number;
  style?: ViewStyle;
}> = ({ children, spacing = 12, style }) => {
  return (
    <View style={[{ gap: spacing }, style]}>
      {children}
    </View>
  );
};

export default SkeletonBase;