import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useDesignTokens } from '../hooks/useDesignTokens';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  animated?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  animated = true,
}) => {
  const tokens = useDesignTokens();
  const shimmerTranslateX = useSharedValue(-100);

  useEffect(() => {
    if (animated) {
      shimmerTranslateX.value = withRepeat(
        withTiming(100, { duration: 1000 }),
        -1,
        false
      );
    }
  }, [animated, shimmerTranslateX]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmerTranslateX.value, [-100, 0, 100], [0.3, 0.7, 0.3]);
    return {
      opacity: animated ? opacity : 0.3,
    };
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: tokens.colors.theme.background.tertiary,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: tokens.colors.theme.background.secondary,
            borderRadius,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

// Predefined skeleton components for common use cases
export const SkeletonText: React.FC<{ lines?: number; lastLineWidth?: string }> = ({
  lines = 1,
  lastLineWidth = '60%',
}) => (
  <View>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        height={16}
        width={index === lines - 1 ? lastLineWidth : '100%'}
        style={{ marginBottom: index < lines - 1 ? 8 : 0 }}
      />
    ))}
  </View>
);

export const SkeletonTitle: React.FC = () => (
  <Skeleton height={24} width="70%" borderRadius={6} />
);

export const SkeletonButton: React.FC = () => (
  <Skeleton height={48} width={120} borderRadius={12} />
);

export const SkeletonCircle: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <Skeleton width={size} height={size} borderRadius={size / 2} />
);

export const SkeletonImage: React.FC<{ aspectRatio?: number }> = ({ aspectRatio = 16 / 9 }) => (
  <View style={{ aspectRatio }}>
    <Skeleton width="100%" height="100%" borderRadius={12} />
  </View>
);

// Complex skeleton layouts
export const DetailPageSkeleton: React.FC = () => {
  const tokens = useDesignTokens();
  
  return (
    <View style={[styles.detailContainer, { backgroundColor: tokens.colors.theme.background.primary }]}>
      {/* Featured Image Skeleton */}
      <SkeletonImage aspectRatio={16 / 10} />
      
      <View style={styles.contentContainer}>
        {/* Title and Rating */}
        <View style={styles.titleRow}>
          <SkeletonTitle />
          <SkeletonCircle size={32} />
        </View>
        
        {/* Location */}
        <View style={styles.locationRow}>
          <SkeletonCircle size={16} />
          <Skeleton height={14} width="40%" style={{ marginLeft: 8 }} />
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <SkeletonCircle size={48} />
          <SkeletonCircle size={48} />
          <SkeletonCircle size={48} />
        </View>
        
        {/* Tab Bar */}
        <View style={styles.tabBarRow}>
          <SkeletonButton />
          <SkeletonButton />
        </View>
        
        {/* Content */}
        <View style={styles.contentArea}>
          <Skeleton height={20} width="30%" style={{ marginBottom: 16 }} />
          <SkeletonText lines={4} lastLineWidth="80%" />
          
          <Skeleton height={20} width="40%" style={{ marginTop: 24, marginBottom: 16 }} />
          <SkeletonText lines={3} lastLineWidth="60%" />
        </View>
      </View>
    </View>
  );
};

export const CouponModalSkeleton: React.FC = () => (
  <View style={styles.modalSkeleton}>
    <View style={styles.modalHeader}>
      <Skeleton height={20} width="50%" />
      <SkeletonCircle size={24} />
    </View>
    
    <View style={styles.modalContent}>
      {Array.from({ length: 3 }).map((_, index) => (
        <View key={index} style={styles.couponSkeleton}>
          <Skeleton height={100} width="100%" borderRadius={12} />
        </View>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  detailContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  tabBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  contentArea: {
    flex: 1,
  },
  modalSkeleton: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalContent: {
    padding: 20,
  },
  couponSkeleton: {
    marginBottom: 16,
  },
});