import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { Restaurant, RenderItemInfo } from '../../types';

const { width } = Dimensions.get('window');
const AnimatedImage = Animated.createAnimatedComponent(Animated.Image);

interface RestaurantCardProps {
  itemInfo: RenderItemInfo<Restaurant>;
  colors: any;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ itemInfo, colors }) => {
  const { item, index } = itemInfo;

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 100 + 300).springify()}
    >
      <Link href={{ pathname: '/ristoranti', params: { id: item.id } }} asChild>
        <TouchableOpacity style={[styles.restaurantCard, { backgroundColor: colors.card }]}>
          <AnimatedImage 
            source={{ uri: item.image }} 
            style={styles.restaurantImage} 
            entering={FadeInDown.delay(index * 150 + 300).springify()}
          />
          <View style={styles.restaurantInfo}>
            <Text style={[styles.restaurantName, { color: colors.text }]}>{item.name}</Text>
            <View style={styles.restaurantMeta}>
              <View style={styles.locationContainer}>
                <MaterialIcons name="location-on" size={14} color={colors.primary} />
                <Text style={[styles.locationText, { color: colors.text }]}>{item.location}</Text>
              </View>
              <View style={styles.ratingContainer}>
                <FontAwesome name="star" size={14} color="#FFD700" />
                <Text style={[styles.ratingText, { color: colors.text }]}>{item.rating}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Link>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  restaurantCard: {
    width: width * 0.5 > 200 ? 200 : width * 0.5, // Responsive width
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 24,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  restaurantImage: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  restaurantInfo: {
    padding: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  restaurantMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
  },
});

export default RestaurantCard; 