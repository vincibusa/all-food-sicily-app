import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../app/context/ThemeContext';

export default function ListCardSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={[styles.image, { backgroundColor: colors.card + '80' }]} />
      
      <View style={styles.content}>
        {/* Category Skeleton */}
        <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '50' }]} />
        
        {/* Title Skeleton */}
        <View style={[styles.skeletonLine, { backgroundColor: colors.text + '20', width: '80%' }]} />
        
        {/* Location Skeleton */}
        <View style={[styles.skeletonLine, { backgroundColor: colors.text + '20', width: '60%', marginTop: 8 }]} />
        
        {/* Tags Skeleton */}
        <View style={styles.tagsContainer}>
          <View style={[styles.skeletonTag, { backgroundColor: colors.text + '20' }]} />
          <View style={[styles.skeletonTag, { backgroundColor: colors.text + '20' }]} />
        </View>
        
        {/* Bottom Row Skeleton */}
        <View style={styles.bottomRow}>
          <View style={[styles.skeletonLine, { backgroundColor: colors.text + '20', width: 40 }]} />
          <View style={[styles.skeletonLine, { backgroundColor: colors.text + '20', width: 30 }]} />
        </View>
      </View>
      
      <View style={[styles.chevron, { backgroundColor: colors.text + '20' }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    width: 60,
    height: 20,
    borderRadius: 12,
    marginBottom: 8,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 4,
    marginBottom: 6,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  skeletonTag: {
    width: 50,
    height: 20,
    borderRadius: 8,
    marginRight: 6,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  chevron: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
}); 