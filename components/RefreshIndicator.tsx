/**
 * RefreshIndicator - Indicatore personalizzato per pull-to-refresh  
 * Design moderno con animazioni fluide e feedback visivo
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useAnimatedStyle,
  interpolate,
  useSharedValue,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../app/context/ThemeContext';
import { useTextStyles } from '../hooks/useAccessibleText';
import { AnimatedDots } from './LoadingStates';

// ==========================================
// 🎨 INDICATOR TYPES
// ==========================================

export enum RefreshIndicatorStyle {
  MINIMAL = 'minimal',        // Solo icona
  FULL = 'full',             // Icona + testo
  DOTS = 'dots',             // Animated dots
  SPINNER = 'spinner',       // Spinner classico
}

interface RefreshIndicatorProps {
  // Stato del refresh
  isRefreshing: boolean;
  progress: number;          // 0-1
  text: string;
  
  // Animazioni
  translateY: Animated.SharedValue<number>;
  opacity: Animated.SharedValue<number>;
  scale: Animated.SharedValue<number>;
  rotation: Animated.SharedValue<number>;
  
  // Personalizzazione
  style?: RefreshIndicatorStyle;
  color?: string;
  backgroundColor?: string;
  size?: 'small' | 'medium' | 'large';
}

// ==========================================
// 🎯 MAIN COMPONENT
// ==========================================

export const RefreshIndicator: React.FC<RefreshIndicatorProps> = ({
  isRefreshing,
  progress,
  text,
  translateY,
  opacity,
  scale,
  rotation,
  style = RefreshIndicatorStyle.FULL,
  color,
  backgroundColor,
  size = 'medium',
}) => {
  const { colors } = useTheme();
  const textStyles = useTextStyles();
  
  const indicatorColor = color || colors.primary;
  const bgColor = backgroundColor || (colors.card + 'F0'); // Semi-transparent

  // Configurazione dimensioni
  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return { height: 60, iconSize: 20, padding: 8 };
      case 'medium':
        return { height: 80, iconSize: 24, padding: 12 };
      case 'large':
        return { height: 100, iconSize: 28, padding: 16 };
      default:
        return { height: 80, iconSize: 24, padding: 12 };
    }
  };

  const sizeConfig = getSizeConfig();

  // ==========================================
  // 🎭 ANIMATED STYLES
  // ==========================================

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const progressBarStyle = useAnimatedStyle(() => {
    const width = interpolate(progress, [0, 1], [0, 100]);
    return {
      width: `${width}%`,
    };
  });

  // ==========================================
  // 🎨 RENDER CONTENT
  // ==========================================

  const renderIcon = () => {
    if (isRefreshing) {
      switch (style) {
        case RefreshIndicatorStyle.DOTS:
          return <AnimatedDots color={indicatorColor} size={sizeConfig.iconSize * 0.3} />;
        case RefreshIndicatorStyle.SPINNER:
          return (
            <Animated.View style={iconStyle}>
              <MaterialIcons 
                name="refresh" 
                size={sizeConfig.iconSize} 
                color={indicatorColor} 
              />
            </Animated.View>
          );
        default:
          return (
            <Animated.View style={iconStyle}>
              <MaterialIcons 
                name="sync" 
                size={sizeConfig.iconSize} 
                color={indicatorColor} 
              />
            </Animated.View>
          );
      }
    }

    // Icona statica quando non è in refresh
    const iconName = progress >= 1 ? 'refresh' : 'keyboard-arrow-down';
    return (
      <Animated.View style={iconStyle}>
        <MaterialIcons 
          name={iconName} 
          size={sizeConfig.iconSize} 
          color={indicatorColor} 
        />
      </Animated.View>
    );
  };

  const renderContent = () => {
    switch (style) {
      case RefreshIndicatorStyle.MINIMAL:
        return (
          <View style={styles.minimalContainer}>
            {renderIcon()}
          </View>
        );

      case RefreshIndicatorStyle.DOTS:
        return (
          <View style={styles.dotsContainer}>
            {renderIcon()}
            {(style === RefreshIndicatorStyle.FULL || text) && (
              <Text style={[styles.text, textStyles.caption(colors.text)]}>
                {text}
              </Text>
            )}
          </View>
        );

      case RefreshIndicatorStyle.FULL:
      default:
        return (
          <View style={styles.fullContainer}>
            {renderIcon()}
            <Text style={[styles.text, textStyles.caption(colors.text)]}>
              {text}
            </Text>
            
            {/* Progress bar */}
            <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
              <Animated.View 
                style={[
                  styles.progressBar, 
                  { backgroundColor: indicatorColor },
                  progressBarStyle
                ]} 
              />
            </View>
          </View>
        );
    }
  };

  // ==========================================
  // 🎭 RENDER
  // ==========================================

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          height: sizeConfig.height,
          backgroundColor: bgColor,
          paddingHorizontal: sizeConfig.padding,
        },
        containerStyle
      ]}
    >
      {renderContent()}
    </Animated.View>
  );
};

// ==========================================
// 🎪 PRESET COMPONENTS
// ==========================================

/**
 * Indicatore minimalista
 */
export const MinimalRefreshIndicator: React.FC<
  Omit<RefreshIndicatorProps, 'style'>
> = (props) => (
  <RefreshIndicator {...props} style={RefreshIndicatorStyle.MINIMAL} />
);

/**
 * Indicatore con dots animati
 */
export const DotsRefreshIndicator: React.FC<
  Omit<RefreshIndicatorProps, 'style'>
> = (props) => (
  <RefreshIndicator {...props} style={RefreshIndicatorStyle.DOTS} />
);

/**
 * Indicatore completo
 */
export const FullRefreshIndicator: React.FC<
  Omit<RefreshIndicatorProps, 'style'>
> = (props) => (
  <RefreshIndicator {...props} style={RefreshIndicatorStyle.FULL} />
);

// ==========================================
// 🎨 STYLES
// ==========================================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Minimal style
  minimalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Dots style  
  dotsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Full style
  fullContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  
  text: {
    marginTop: 8,
    textAlign: 'center',
  },
  
  // Progress bar
  progressTrack: {
    width: '60%',
    height: 2,
    borderRadius: 1,
    marginTop: 8,
    overflow: 'hidden',
  },
  
  progressBar: {
    height: '100%',
    borderRadius: 1,
  },
});

export default RefreshIndicator;