import React from 'react';
import { TouchableOpacity, ImageBackground, View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { Link } from 'expo-router';
import Animated from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../app/context/ThemeContext';
import { useHaptics } from '../../utils/haptics';
import { useTextStyles } from '../../hooks/useAccessibleText';

const { width } = Dimensions.get('window');

interface Hotel {
  id: string;
  name: string;
  featured_image: string;
  city: string;
  province: string;
  rating: string | number;
  star_rating?: number;
  price_range: number;
  hotel_type: string[];
  category_name: string;
  category_color?: string;
  latitude?: number;
  longitude?: number;
  distance?: number; // Distance in kilometers
}

interface HotelCardProps {
  item: Hotel;
  onImageLoaded?: (uri: string) => void;
  onImageError?: (uri: string) => void;
  animationProps?: any;
}

export const HotelCard: React.FC<HotelCardProps> = ({
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
      <Link href={{ pathname: '/hotel/[id]', params: { id: item.id } }} asChild>
        <TouchableOpacity 
          style={styles.hotelCard}
          onPress={() => onTap()}
        >
          {/* Container immagine con ombra separata */}
          <View style={styles.imageContainer}>
            <ImageBackground
              source={{ 
                uri: item.featured_image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' 
              }}
              style={styles.hotelImage}
              imageStyle={{ borderRadius: 12 }}
              onLoad={() => item.featured_image && onImageLoaded?.(item.featured_image)}
              onError={() => item.featured_image && onImageError?.(item.featured_image)}
            >
              <View style={[styles.hotelCategoryPill, { backgroundColor: colors.primary }]}>
                <Text style={[styles.hotelCategoryText, textStyles.label('white')]}>
                  {item.hotel_type?.[0]?.charAt(0).toUpperCase() + item.hotel_type?.[0]?.slice(1).replace('&', ' & ') || 'Hotel'}
                </Text>
              </View>
              {/* Star rating overlay */}
              {item.star_rating && (
                <View style={styles.starRatingOverlay}>
                  {Array.from({ length: item.star_rating }, (_, i) => (
                    <Text key={i} style={styles.starIcon}>⭐</Text>
                  ))}
                </View>
              )}
              
              {/* Distance indicator */}
              {item.distance !== undefined && (
                <View style={[styles.distanceIndicator, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}>
                  <MaterialIcons name="location-on" size={10} color="white" />
                  <Text style={[styles.distanceText, textStyles.label('white')]}>
                    {item.distance < 1 
                      ? `${Math.round(item.distance * 1000)}m` 
                      : `${item.distance.toFixed(1)}km`}
                  </Text>
                </View>
              )}
            </ImageBackground>
          </View>
          {/* Container testo senza ombra */}
          <View style={styles.hotelInfo}>
            <Text style={[styles.hotelTitle, textStyles.body(colors.text), { fontWeight: 'bold' }]} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={[styles.hotelLocation, textStyles.caption(colors.text + '80')]} numberOfLines={1}>
              {item.city}, {item.province}
            </Text>
          </View>
        </TouchableOpacity>
      </Link>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  hotelCard: {
    width: width >= 768 
      ? (width - 64) / 2 - 8 // Tablet: 2 columns with padding
      : width * 0.55 > 200 ? 200 : width * 0.55, // Phone: horizontal scroll
    height: width >= 768 
      ? ((width - 64) / 2 - 8) * (9/16) + 80 // Tablet height
      : (width * 0.55 > 200 ? 200 : width * 0.55) * (9/16) + 80, // Phone height
    marginRight: width >= 768 ? 0 : 16,
    marginBottom: width >= 768 ? 16 : 0,
    borderRadius: 12,
  },
  imageContainer: {
    width: '100%',
    height: width >= 768 
      ? ((width - 64) / 2 - 8) * (9/16) // Tablet: responsive height
      : (width * 0.55 > 200 ? 200 : width * 0.55) * (9/16), // Phone: original height
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
  hotelImage: {
    width: '100%',
    height: '100%',
  },
  hotelCategoryPill: {
    position: 'absolute',
    top: 6,
    left: 6,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    overflow: 'hidden',
  },
  hotelCategoryText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  starRatingOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    color: '#FFD700',
    fontSize: 10,
  },
  distanceIndicator: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 2,
  },
  distanceText: {
    color: 'white',
    fontSize: 8,
    fontWeight: '600',
  },
  hotelInfo: {
    padding: 12,
    height: 80, // Fixed height for text area
    justifyContent: 'center',
  },
  hotelTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  hotelLocation: {
    fontSize: 12,
    opacity: 0.8,
  },
});