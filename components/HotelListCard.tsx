import React from 'react';
import { TouchableOpacity, ImageBackground, View, Text, StyleSheet, Platform } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { useTheme } from '../app/context/ThemeContext';
import { useHaptics } from '../utils/haptics';
import { useTextStyles } from '../hooks/useAccessibleText';

interface Hotel {
  id: string;
  name?: string;
  title: string;
  featured_image: string;
  city: string;
  province: string;
  rating?: string | number;
  price_range?: number;
  star_rating?: number;
  category: {
    id: string;
    name: string;
    color: string;
  } | null;
  hotel_type?: string[];
  latitude?: number;
  longitude?: number;
  distance?: number; // Distance in kilometers
}

interface HotelListCardProps {
  item: Hotel;
  onPress?: () => void;
  animationProps?: any;
}

export const HotelListCard: React.FC<HotelListCardProps> = ({
  item,
  onPress,
  animationProps,
}) => {
  const { colors } = useTheme();
  const { onTap } = useHaptics();
  const textStyles = useTextStyles();

  // Format rating
  const formatRating = (rating: string | number) => {
    if (!rating) return '0.0';
    const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
    return isNaN(numRating) ? '0.0' : numRating.toFixed(1);
  };

  // Format distance
  const formatDistance = (distance?: number) => {
    if (!distance) return null;
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  // Format price range
  const formatPriceRange = (priceRange: number) => {
    const euros = '€'.repeat(Math.max(1, Math.min(4, priceRange || 1)));
    return euros;
  };

  // Format hotel types
  const formatHotelTypes = (hotelTypes?: string[]) => {
    if (!hotelTypes || hotelTypes.length === 0) return [];
    return hotelTypes.slice(0, 2).map(type => 
      type.charAt(0).toUpperCase() + type.slice(1).replace('&', ' & ')
    );
  };

  const hotelTypesFormatted = formatHotelTypes(item.hotel_type);

  return (
    <Animated.View style={styles.container} {...animationProps}>
      <TouchableOpacity 
        style={styles.hotelCard}
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
              uri: item.featured_image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' 
            }}
            style={styles.hotelImage}
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
            
            {/* Rating badge */}
            <View style={styles.ratingBadge}>
              <FontAwesome name="star" size={12} color="#FFD700" />
              <Text style={[styles.ratingText, textStyles.caption('white')]}>
                {formatRating(item.rating || 0)}
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
          </ImageBackground>
        </View>
        
        {/* Container testo senza ombra */}
        <View style={styles.hotelInfo}>
          {/* Title row with price */}
          <View style={styles.titleRow}>
            <Text style={[styles.hotelTitle, textStyles.subtitle(colors.text)]} numberOfLines={2}>
              {item.name || item.title}
            </Text>
            <Text style={[styles.priceText, { color: colors.primary }]}>
              {formatPriceRange(item.price_range || 1)}
            </Text>
          </View>
          
          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={12} color={colors.text + '80'} />
            <Text style={[styles.locationText, textStyles.caption(colors.text + '80')]} numberOfLines={1}>
              {item.city}, {item.province}
            </Text>
            {item.distance && (
              <View style={styles.distanceContainer}>
                <MaterialIcons name="near-me" size={12} color={colors.primary} />
                <Text style={[styles.distanceText, { color: colors.primary }]}>
                  {formatDistance(item.distance)}
                </Text>
              </View>
            )}
          </View>

          {/* Hotel types tags */}
          {hotelTypesFormatted.length > 0 && (
            <View style={styles.tagsContainer}>
              {hotelTypesFormatted.map((type, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.tagText, { color: colors.primary }]}>
                    {type}
                  </Text>
                </View>
              ))}
            </View>
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
  hotelCard: {
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
  hotelImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
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
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  starRatingOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  starIcon: {
    color: '#FFD700',
    fontSize: 12,
  },
  hotelInfo: {
    padding: 12,
    minHeight: 100,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  hotelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    marginLeft: 4,
    flex: 1,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 2,
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
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});