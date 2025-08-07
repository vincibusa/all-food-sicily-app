import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import Animated from 'react-native-reanimated';
import { useTheme } from '../../app/context/ThemeContext';
import { useHaptics } from '../../utils/haptics';
import { useTextStyles } from '../../hooks/useAccessibleText';
import { InlineLoading } from '../LoadingStates';
import { SkeletonGuideCard, SkeletonRestaurantCard, SkeletonHotelCard } from '../skeleton/SkeletonCards';

interface ContentSectionProps {
  title: string;
  linkText: string;
  linkHref: string;
  loading: boolean;
  error?: string | null;
  allImagesLoaded: boolean;
  data: any[];
  renderItem: ({ item, index }: { item: any; index: number }) => React.ReactElement;
  keyExtractor: (item: any) => string;
  contentContainerStyle?: any;
  skeletonComponent?: 'guide' | 'restaurant' | 'hotel';
  emptyStateTitle?: string;
  animationProps?: any;
}

export const ContentSection: React.FC<ContentSectionProps> = ({
  title,
  linkText,
  linkHref,
  loading,
  error,
  allImagesLoaded,
  data,
  renderItem,
  keyExtractor,
  contentContainerStyle,
  skeletonComponent = 'restaurant',
  emptyStateTitle,
  animationProps,
}) => {
  const { colors } = useTheme();
  const { onTap } = useHaptics();
  const textStyles = useTextStyles();

  const SkeletonComponent = 
    skeletonComponent === 'guide' ? SkeletonGuideCard : 
    skeletonComponent === 'hotel' ? SkeletonHotelCard : 
    SkeletonRestaurantCard;

  return (
    <Animated.View style={styles.section} {...animationProps}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, textStyles.subtitle(colors.text)]}>
          {title}
        </Text>
        <Link href={linkHref as any} asChild>
          <TouchableOpacity onPress={() => onTap()}>
            <Text style={[styles.sectionLink, textStyles.button(colors.tint)]}>
              {linkText}
            </Text>
          </TouchableOpacity>
        </Link>
      </View>

      {loading ? (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[1, 2, 3]}
          keyExtractor={(item) => item.toString()}
          renderItem={() => <SkeletonComponent />}
          contentContainerStyle={contentContainerStyle}
        />
      ) : error ? (
        <InlineLoading title={error} />
      ) : !allImagesLoaded ? (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[1, 2, 3]}
          keyExtractor={(item) => item.toString()}
          renderItem={() => <SkeletonComponent />}
          contentContainerStyle={contentContainerStyle}
        />
      ) : data.length === 0 ? (
        <InlineLoading title={emptyStateTitle || 'Nessun elemento disponibile al momento'} />
      ) : (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={data}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={contentContainerStyle}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
    paddingVertical: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    // Dynamic font size and weight handled by useTextStyles
  },
  sectionLink: {
    // Dynamic font size and weight handled by useTextStyles
  },
});