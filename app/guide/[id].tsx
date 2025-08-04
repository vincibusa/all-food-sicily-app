import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import Colors from '../../constants/Colors';
import { apiClient } from '../../services/api';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import BackButton from '../../components/BackButton';

const { width } = Dimensions.get('window');

interface GuideDetail {
  id: string;
  title: string;
  content: string;
  featured_image: string;
  gallery: string[];
  category: {
    id: string;
    name: string;
    color: string;
  };
  city: string;
  province: string;
  tags: string[];
  restaurant_ids: string[];
  created_at: string;
  updated_at: string;
}

interface Restaurant {
  id: string;
  name: string;
  featured_image: string;
  city: string;
  address: string;
  rating: string | number;
}

export default function GuideDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const [guide, setGuide] = useState<GuideDetail | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadGuideDetail();
    }
  }, [id]);

  const loadGuideDetail = async () => {
    try {
      setLoading(true);
      const guideData = await apiClient.get<GuideDetail>(`/guides/${id}`);
      setGuide(guideData);

      // Load associated restaurants if any
      if (guideData.restaurant_ids && guideData.restaurant_ids.length > 0) {
        const restaurantPromises = guideData.restaurant_ids.map(restaurantId =>
          apiClient.get<Restaurant>(`/restaurants/${restaurantId}`)
        );
        const restaurantsData = await Promise.all(restaurantPromises);
        setRestaurants(restaurantsData);
      }
    } catch (error) {
      // Error loading guide detail
      Alert.alert('Errore', 'Impossibile caricare i dettagli della guida');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!guide) return;
    
    try {
      await Share.share({
        message: `Scopri questa guida su AllFood Sicily: ${guide.title}`,
        title: guide.title,
      });
    } catch (error) {
      // Error sharing
    }
  };

  const navigateToRestaurant = (restaurantId: string) => {
    router.push(`/ristoranti/${restaurantId}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Caricamento...</Text>
      </SafeAreaView>
    );
  }

  if (!guide) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Guida non trovata</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: guide.title,
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerRight: () => (
            <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
              <FontAwesome name="share" size={20} color={colors.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
        {/* Featured Image */}
        <Animated.View entering={FadeInUp.duration(800)}>
          <Image
            source={{ 
              uri: guide.featured_image || 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' 
            }}
            style={styles.featuredImage}
          />
          
          <BackButton style={styles.backButton} />
          
          {/* Category Badge */}
                      <View style={[styles.categoryBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.categoryBadgeText}>{guide.category?.name || 'Guida'}</Text>
          </View>
        </Animated.View>

        <View style={styles.content}>
          {/* Title and Location */}
          <Animated.View entering={FadeInDown.delay(200)}>
            <Text style={[styles.title, { color: colors.text }]}>{guide.title}</Text>
            <View style={styles.locationContainer}>
              <MaterialIcons name="location-on" size={16} color={colors.primary} />
              <Text style={[styles.locationText, { color: colors.text + '80' }]}>
                {guide.city}, {guide.province}
              </Text>
            </View>
          </Animated.View>

          {/* Tags */}
          {guide.tags && guide.tags.length > 0 && (
            <Animated.View entering={FadeInDown.delay(300)} style={styles.tagsContainer}>
              {guide.tags.map((tag, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
                </View>
              ))}
            </Animated.View>
          )}

          {/* Content */}
          <Animated.View entering={FadeInDown.delay(400)}>
            <Text style={[styles.contentText, { color: colors.text }]}>{guide.content}</Text>
          </Animated.View>

          {/* Gallery */}
          {guide.gallery && guide.gallery.length > 0 && (
            <Animated.View entering={FadeInDown.delay(500)} style={styles.galleryContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Galleria</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {guide.gallery.map((image, index) => (
                  <Image
                    key={index}
                    source={{ uri: image }}
                    style={styles.galleryImage}
                  />
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {/* Associated Restaurants */}
          {restaurants.length > 0 && (
            <Animated.View entering={FadeInDown.delay(600)} style={styles.restaurantsContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Locali Correlati</Text>
              {restaurants.map((restaurant, index) => (
                <TouchableOpacity
                  key={restaurant.id}
                  style={[styles.restaurantCard, { backgroundColor: colors.card }]}
                  onPress={() => navigateToRestaurant(restaurant.id)}
                >
                  <Image
                    source={{ 
                      uri: restaurant.featured_image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' 
                    }}
                    style={styles.restaurantImage}
                  />
                  <View style={styles.restaurantInfo}>
                    <Text style={[styles.restaurantName, { color: colors.text }]}>{restaurant.name}</Text>
                    <Text style={[styles.restaurantAddress, { color: colors.text + '80' }]}>{restaurant.address}</Text>
                    <View style={styles.ratingContainer}>
                      <FontAwesome name="star" size={14} color="#FFD700" />
                      <Text style={[styles.ratingText, { color: colors.text + '80' }]}>
                        {restaurant.rating ? parseFloat(restaurant.rating.toString()).toFixed(1) : 'N/A'}
                      </Text>
                    </View>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={colors.text + '60'} />
                </TouchableOpacity>
              ))}
            </Animated.View>
          )}

          {/* Date Info */}
          <Animated.View entering={FadeInDown.delay(700)} style={styles.dateContainer}>
            <Text style={[styles.dateText, { color: colors.text + '60' }]}>
              Pubblicata il {new Date(guide.created_at).toLocaleDateString('it-IT')}
            </Text>
            {guide.updated_at !== guide.created_at && (
              <Text style={[styles.dateText, { color: colors.text + '60' }]}>
                Aggiornata il {new Date(guide.updated_at).toLocaleDateString('it-IT')}
              </Text>
            )}
          </Animated.View>
        </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
  },
  shareButton: {
    marginRight: 16,
  },
  featuredImage: {
    width: width,
    height: width * 0.6,
  },
  categoryBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    lineHeight: 36,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationText: {
    fontSize: 16,
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  galleryContainer: {
    marginBottom: 24,
  },
  galleryImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginRight: 12,
  },
  restaurantsContainer: {
    marginBottom: 24,
  },
  restaurantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  restaurantImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  restaurantAddress: {
    fontSize: 14,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 4,
  },
  dateContainer: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  dateText: {
    fontSize: 12,
    marginBottom: 4,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1000,
  },
});