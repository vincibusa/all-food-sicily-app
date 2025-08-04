import React from 'react';
import { TouchableOpacity, ImageBackground, View, Text, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { useTheme } from '../app/context/ThemeContext';
import { useHaptics } from '../utils/haptics';
import { useTextStyles } from '../hooks/useAccessibleText';

interface Guide {
  id: string;
  title: string;
  featured_image: string;
  city: string;
  province: string;
  category: {
    id: string;
    name: string;
    color: string;
  } | null;
  tags?: string[];
  description?: string;
}

interface GuideListCardProps {
  item: Guide;
  onPress?: () => void;
  animationProps?: any;
}

export const GuideListCard: React.FC<GuideListCardProps> = ({
  item,
  onPress,
  animationProps,
}) => {
  const { colors } = useTheme();
  const { onTap } = useHaptics();
  const textStyles = useTextStyles();

  // Format tags
  const formatTags = (tags?: string[]) => {
    if (!tags || tags.length === 0) return [];
    return tags.slice(0, 3).map(tag => 
      tag.charAt(0).toUpperCase() + tag.slice(1).replace('-', ' ')
    );
  };

  const tagsFormatted = formatTags(item.tags);

  return (
    <Animated.View style={styles.container} {...animationProps}>
      <TouchableOpacity 
        style={styles.guideCard}
        onPress={() => {
          onTap();
          onPress?.();
        }}
        activeOpacity={0.8}
      >
        {/* Container immagine con ombra separata */}
        <View style={styles.imageContainer}>
          <ImageBackground
            source={{ 
              uri: item.featured_image || 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' 
            }}
            style={styles.guideImage}
            imageStyle={{ borderRadius: 12 }}
          >
            {/* Category pill */}
            {item.category && (
              <View style={[styles.categoryPill, { backgroundColor: colors.primary }]}>
                <Text style={[styles.categoryText, textStyles.label('white')]}>
                  {item.category.name}
                </Text>
              </View>
            )}
          </ImageBackground>
        </View>
        
        {/* Container testo senza ombra */}
        <View style={styles.guideInfo}>
          <Text style={[styles.guideTitle, textStyles.subtitle(colors.text)]} numberOfLines={2}>
            {item.title}
          </Text>
          
          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={12} color={colors.text + '80'} />
            <Text style={[styles.locationText, textStyles.caption(colors.text + '80')]} numberOfLines={1}>
              {item.city}, {item.province}
            </Text>
          </View>

          {/* Tags */}
          {tagsFormatted.length > 0 && (
            <View style={styles.tagsContainer}>
              {tagsFormatted.map((tag, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.tagText, { color: colors.primary }]}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Description preview */}
          {item.description && (
            <Text style={[styles.description, textStyles.caption(colors.text + '60')]} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  guideCard: {
    width: '100%',
    borderRadius: 12,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    ...(Platform.OS === 'ios' ? {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
    } : {
      elevation: 4, // Ombra solo sull'immagine su Android
    }),
  },
  guideImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
  },
  categoryPill: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  categoryText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  guideInfo: {
    padding: 12,
    minHeight: 120,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 2,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
  },
});