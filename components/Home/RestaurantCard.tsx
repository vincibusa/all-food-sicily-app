import React from 'react';
import { TouchableOpacity, ImageBackground, View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { Link } from 'expo-router';
import Animated from 'react-native-reanimated';
import { useTheme } from '../../app/context/ThemeContext';
import { useHaptics } from '../../utils/haptics';
import { useTextStyles } from '../../hooks/useAccessibleText';

const { width } = Dimensions.get('window');

interface Restaurant {
  id: string;
  name: string;
  featured_image: string;
  city: string;
  province: string;
  rating: string | number;
  price_range: number;
  category_name: string;
  category_color?: string;
  latitude?: number;
  longitude?: number;
}

interface RestaurantCardProps {
  item: Restaurant;
  onImageLoaded?: (uri: string) => void;
  onImageError?: (uri: string) => void;
  animationProps?: any;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
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
      <Link href={{ pathname: '/ristoranti/[id]', params: { id: item.id } }} asChild>
        <TouchableOpacity 
          style={styles.restaurantCard}
          onPress={() => onTap()}
        >
          {/* Container immagine con ombra separata */}
          <View style={styles.imageContainer}>
            <ImageBackground
              source={{ 
                uri: item.featured_image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' 
              }}
              style={styles.restaurantImage}
              imageStyle={{ borderRadius: 12 }}
              onLoad={() => item.featured_image && onImageLoaded?.(item.featured_image)}
              onError={() => item.featured_image && onImageError?.(item.featured_image)}
            >
              <View style={[styles.restaurantCategoryPill, { backgroundColor: colors.primary }]}>
                <Text style={[styles.restaurantCategoryText, textStyles.label('white')]}>
                  {item.category_name || 'Ristorante'}
                </Text>
              </View>
            </ImageBackground>
          </View>
          {/* Container testo senza ombra */}
          <View style={styles.restaurantInfo}>
            <Text style={[styles.restaurantTitle, textStyles.body(colors.text), { fontWeight: 'bold' }]} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={[styles.restaurantLocation, textStyles.caption(colors.text + '80')]} numberOfLines={1}>
              {item.city}, {item.province}
            </Text>
          </View>
        </TouchableOpacity>
      </Link>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  restaurantCard: {
    width: width * 0.55 > 200 ? 200 : width * 0.55, // Same width as other cards
    height: (width * 0.55 > 200 ? 200 : width * 0.55) * (9/16) + 80, // 16:9 image + text area
    marginRight: 16,
    borderRadius: 12,

  },
  imageContainer: {
    width: '100%',
    height: (width * 0.55 > 200 ? 200 : width * 0.55) * (9/16), // 16:9 aspect ratio
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
  restaurantImage: {
    width: '100%',
    height: '100%',
  },
  restaurantCategoryPill: {
    position: 'absolute',
    top: 6,
    left: 6,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    overflow: 'hidden',
  },
  restaurantCategoryText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  restaurantInfo: {
    padding: 12,
    height: 80, // Fixed height for text area
    justifyContent: 'center',
  },
  restaurantTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  restaurantLocation: {
    fontSize: 12,
    opacity: 0.8,
  },
});