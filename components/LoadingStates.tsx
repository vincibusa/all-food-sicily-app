/**
 * LoadingStates - Componenti per stati di caricamento informativi
 * Design system 2025 con animazioni fluide e feedback utili
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  withDelay,
  interpolate,
  Easing,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../app/context/ThemeContext';
import { useTextStyles } from '../hooks/useAccessibleText';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

// ==========================================
// 🎨 LOADING STATE TYPES
// ==========================================

export enum LoadingStateType {
  SPINNER = 'spinner',           // Simple spinner
  DOTS = 'dots',                // Animated dots
  PULSE = 'pulse',              // Pulsing effect
  PROGRESS = 'progress',        // Progress bar
  SKELETON = 'skeleton',        // Skeleton placeholder
  CUSTOM = 'custom',            // Custom content
}

export enum LoadingSize {
  SMALL = 'small',
  MEDIUM = 'medium', 
  LARGE = 'large',
  FULLSCREEN = 'fullscreen',
}

interface BaseLoadingProps {
  type?: LoadingStateType;
  size?: LoadingSize;
  title?: string;
  subtitle?: string;
  color?: string;
  backgroundColor?: string;
  overlay?: boolean;
  visible?: boolean;
}

// ==========================================
// 🎯 ANIMATED LOADING COMPONENTS
// ==========================================

/**
 * Animated Dots Loading
 */
export const AnimatedDots: React.FC<{ color?: string; size?: number }> = ({ 
  color = '#666', 
  size = 8 
}) => {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const animateDots = () => {
      const config = {
        duration: 600,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      };

      dot1.value = withRepeat(
        withSequence(
          withTiming(1, config),
          withTiming(0, config)
        ),
        -1
      );

      dot2.value = withDelay(200, 
        withRepeat(
          withSequence(
            withTiming(1, config),
            withTiming(0, config)
          ),
          -1
        )
      );

      dot3.value = withDelay(400,
        withRepeat(
          withSequence(
            withTiming(1, config),
            withTiming(0, config)
          ),
          -1
        )
      );
    };

    animateDots();
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot1.value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(dot1.value, [0, 1], [0.8, 1.2]) }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot2.value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(dot2.value, [0, 1], [0.8, 1.2]) }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot3.value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(dot3.value, [0, 1], [0.8, 1.2]) }],
  }));

  return (
    <View style={styles.dotsContainer}>
      <Animated.View style={[styles.dot, { backgroundColor: color, width: size, height: size }, dot1Style]} />
      <Animated.View style={[styles.dot, { backgroundColor: color, width: size, height: size }, dot2Style]} />
      <Animated.View style={[styles.dot, { backgroundColor: color, width: size, height: size }, dot3Style]} />
    </View>
  );
};

/**
 * Animated Progress Ring
 */
export const AnimatedProgressRing: React.FC<{ 
  progress?: number; 
  size?: number; 
  color?: string;
  backgroundColor?: string;
}> = ({ 
  progress = 0, 
  size = 40, 
  color = '#007AFF',
  backgroundColor = '#E5E5EA'
}) => {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 1000,
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
    });
  }, [progress]);

  const progressStyle = useAnimatedStyle(() => {
    const rotation = interpolate(animatedProgress.value, [0, 100], [0, 360]);
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  return (
    <View style={[styles.progressRing, { width: size, height: size }]}>
      <View style={[styles.progressBackground, { 
        borderColor: backgroundColor,
        borderWidth: size * 0.1,
      }]} />
      <Animated.View style={[
        styles.progressForeground, 
        progressStyle,
        { 
          borderColor: color,
          borderTopColor: 'transparent',
          borderWidth: size * 0.1,
        }
      ]} />
    </View>
  );
};

/**
 * Animated Pulse
 */
export const AnimatedPulse: React.FC<{ 
  children: React.ReactNode; 
  intensity?: number;
  duration?: number;
}> = ({ 
  children, 
  intensity = 0.3,
  duration = 1500
}) => {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: duration / 2, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
        withTiming(0, { duration: duration / 2, easing: Easing.bezier(0.4, 0, 0.6, 1) })
      ),
      -1
    );
  }, [duration]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [1 - intensity, 1]),
    transform: [{ 
      scale: interpolate(pulse.value, [0, 1], [1, 1 + intensity * 0.05]) 
    }],
  }));

  return (
    <Animated.View style={pulseStyle}>
      {children}
    </Animated.View>
  );
};

// ==========================================
// 🎭 MAIN LOADING COMPONENT
// ==========================================

/**
 * Componente principale per stati di loading
 */
export const LoadingState: React.FC<BaseLoadingProps> = ({
  type = LoadingStateType.SPINNER,
  size = LoadingSize.MEDIUM,
  title,
  subtitle,
  color,
  backgroundColor,
  overlay = false,
  visible = true,
}) => {
  const { colors } = useTheme();
  const textStyles = useTextStyles();

  const loadingColor = color || colors.primary;
  const bgColor = backgroundColor || (overlay ? 'rgba(0,0,0,0.4)' : 'transparent');

  if (!visible) return null;

  // Determina dimensioni basate sulla size
  const getSizeConfig = () => {
    switch (size) {
      case LoadingSize.SMALL:
        return { containerSize: 60, iconSize: 20, textMargin: 8 };
      case LoadingSize.MEDIUM:
        return { containerSize: 100, iconSize: 30, textMargin: 16 };
      case LoadingSize.LARGE:
        return { containerSize: 140, iconSize: 40, textMargin: 20 };
      case LoadingSize.FULLSCREEN:
        return { containerSize: width, iconSize: 50, textMargin: 24 };
      default:
        return { containerSize: 100, iconSize: 30, textMargin: 16 };
    }
  };

  const sizeConfig = getSizeConfig();

  // Rendering del contenuto loading
  const renderLoadingContent = () => {
    switch (type) {
      case LoadingStateType.DOTS:
        return <AnimatedDots color={loadingColor} size={sizeConfig.iconSize * 0.3} />;
        
      case LoadingStateType.PULSE:
        return (
          <AnimatedPulse>
            <MaterialIcons name="hourglass-empty" size={sizeConfig.iconSize} color={loadingColor} />
          </AnimatedPulse>
        );
        
      case LoadingStateType.PROGRESS:
        return <AnimatedProgressRing size={sizeConfig.iconSize} color={loadingColor} />;
        
      case LoadingStateType.SPINNER:
      default:
        return <ActivityIndicator size={sizeConfig.iconSize > 30 ? 'large' : 'small'} color={loadingColor} />;
    }
  };

  const containerStyle = [
    styles.container,
    {
      backgroundColor: bgColor,
      minHeight: size === LoadingSize.FULLSCREEN ? height : sizeConfig.containerSize,
    },
    overlay && styles.overlay,
    size === LoadingSize.FULLSCREEN && styles.fullscreen,
  ];

  return (
    <Animated.View 
      style={containerStyle}
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
    >
      {overlay && (
        <BlurView intensity={20} style={StyleSheet.absoluteFillObject} />
      )}
      
      <View style={styles.content}>
        {renderLoadingContent()}
        
        {title && (
          <Text style={[
            styles.title, 
            textStyles.subtitle(colors.text),
            { marginTop: sizeConfig.textMargin }
          ]}>
            {title}
          </Text>
        )}
        
        {subtitle && (
          <Text style={[
            styles.subtitle, 
            textStyles.body(colors.text + '80'),
            { marginTop: sizeConfig.textMargin * 0.5 }
          ]}>
            {subtitle}
          </Text>
        )}
      </View>
    </Animated.View>
  );
};

// ==========================================
// 🎪 SPECIALIZED LOADING COMPONENTS
// ==========================================

/**
 * Loading per schermata completa
 */
export const FullScreenLoading: React.FC<{
  title?: string;
  subtitle?: string;
}> = ({ title = "Caricamento...", subtitle }) => (
  <LoadingState
    type={LoadingStateType.DOTS}
    size={LoadingSize.FULLSCREEN}
    title={title}
    subtitle={subtitle}
    overlay
  />
);

/**
 * Loading inline per sezioni
 */
export const InlineLoading: React.FC<{
  title?: string;
  type?: LoadingStateType;
}> = ({ title, type = LoadingStateType.SPINNER }) => (
  <LoadingState
    type={type}
    size={LoadingSize.SMALL}
    title={title}
  />
);

/**
 * Loading per modali
 */
export const ModalLoading: React.FC<{
  title?: string;
  subtitle?: string;
  visible?: boolean;
}> = ({ title, subtitle, visible = true }) => (
  <LoadingState
    type={LoadingStateType.PULSE}
    size={LoadingSize.MEDIUM}
    title={title}
    subtitle={subtitle}
    overlay
    visible={visible}
  />
);

/**
 * Loading per operazioni con progresso
 */
export const ProgressLoading: React.FC<{
  progress: number;
  title?: string;
  subtitle?: string;
}> = ({ progress, title, subtitle }) => (
  <LoadingState
    type={LoadingStateType.PROGRESS}
    size={LoadingSize.LARGE}
    title={title}
    subtitle={subtitle || `${Math.round(progress)}% completato`}
  />
);

// ==========================================
// 🎨 STYLES
// ==========================================

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  fullscreen: {
    width: '100%',
    height: '100%',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.8,
  },
  
  // Dots animation
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    borderRadius: 50,
    marginHorizontal: 3,
  },
  
  // Progress ring
  progressRing: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBackground: {
    position: 'absolute',
    borderRadius: 50,
    width: '100%',
    height: '100%',
  },
  progressForeground: {
    borderRadius: 50,
    width: '100%',
    height: '100%',
  },
});

export default LoadingState;