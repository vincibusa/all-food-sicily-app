import React from 'react';
import { TouchableOpacity, ImageBackground, View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { Link } from 'expo-router';
import Animated from 'react-native-reanimated';
import { useTheme } from '../../app/context/ThemeContext';
import { useHaptics } from '../../utils/haptics';
import { useTextStyles } from '../../hooks/useAccessibleText';

const { width } = Dimensions.get('window');

interface Guide {
  id: string;
  title: string;
  featured_image: string;
  category: {
    name: string;
    color?: string;
  };
  city: string;
  province: string;
}

interface GuideCardProps {
  item: Guide;
  onImageLoaded?: (uri: string) => void;
  onImageError?: (uri: string) => void;
  animationProps?: any;
}

export const GuideCard: React.FC<GuideCardProps> = ({
  item,
  onImageLoaded,
  onImageError,
  animationProps,
}) => {
  const { colors } = useTheme();
  const { onTap } = useHaptics();
  const textStyles = useTextStyles();

  return (
    <Animated.View {...animationProps}>
      <Link href={`/guide-categories/${item.id}`} asChild>
        <TouchableOpacity 
          style={styles.guideCard}
          onPress={() => onTap()}
        >
          {/* Container immagine con ombra separata */}
          <View style={styles.imageContainer}>
            <ImageBackground
              source={{ 
                uri: item.featured_image || 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' 
              }}
              style={styles.guideImage}
              imageStyle={{ borderRadius: 12 }}
              onLoad={() => item.featured_image && onImageLoaded?.(item.featured_image)}
              onError={() => item.featured_image && onImageError?.(item.featured_image)}
            />
          </View>
          {/* Container testo senza ombra */}
          <View style={styles.guideInfo}>
            <Text style={[styles.guideTitle, textStyles.subtitle(colors.text)]}>
              {item.title}
            </Text>
          </View>
        </TouchableOpacity>
      </Link>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  guideCard: {
    width: width * 0.45 > 180 ? 180 : width * 0.45, // Smaller width for guide cards
    minHeight: 260, // Reduced height since we only have title
    marginRight: 16,
    borderRadius: 12,

  },
  imageContainer: {
    width: '100%',
    height: 200, // Fixed height for image
    borderRadius: 12,

    ...(Platform.OS === 'ios' ? {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
    } : {
      elevation: 2, // Ombra solo sull'immagine su Android
    }),
  },
  guideImage: {
    width: '100%',
    height: '100%',
  },
  guideInfo: {
    padding: 12,
    minHeight: 60, // Reduced height since we only have title
    justifyContent: 'center',
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
});