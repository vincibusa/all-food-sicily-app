import { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, ImageBackground, FlatList, Dimensions, Alert } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "../context/ThemeContext";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInRight, useAnimatedStyle, useSharedValue, withSpring, withDelay, Easing, withTiming } from "react-native-reanimated";
import { apiClient } from "../../services/api";

const { width } = Dimensions.get('window');
const AnimatedImage = Animated.createAnimatedComponent(Image);


interface Guide {
  id: string;
  title: string;
  featured_image: string;
  category: {
    name: string;
  };
  city: string;
  province: string;
}

interface Restaurant {
  id: string;
  name: string;
  featured_image: string;
  city: string;
  province: string;
  rating: string | number;
  price_range: number;
  category_name: string;
}

export default function Index() {
  const { colors, colorScheme } = useTheme();
  const scrollY = useSharedValue(0);
  const fadeAnim = useSharedValue(0);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 1000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [guidesResponse, restaurantsResponse] = await Promise.all([
        apiClient.get<any>('/guides/'),
        apiClient.get<any>('/restaurants/')
      ]);
      
      // Handle different response structures
      const guidesData = Array.isArray(guidesResponse) ? guidesResponse : (guidesResponse?.items || []);
      const restaurantsData = Array.isArray(restaurantsResponse) ? restaurantsResponse : (restaurantsResponse?.items || []);
      
      // Take first 3 guides and restaurants for featured sections
      setGuides(guidesData.slice(0, 3));
      setRestaurants(restaurantsData.slice(0, 3));
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Errore', 'Impossibile caricare i dati. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const getPriceRangeSymbol = (priceRange: number) => {
    return '€'.repeat(Math.max(1, Math.min(4, priceRange)));
  };
  
  const heroAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [
        { 
          scale: withTiming(fadeAnim.value, { 
            duration: 1000, 
            easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
          }) 
        }
      ]
    };
  });

  // Funzione per renderizzare guide con animazione
  const renderGuideItem = ({ item, index }: { item: Guide, index: number }) => {
    return (
      <Animated.View
        entering={FadeInRight.delay(index * 100).springify()}
      >
        <Link href={{ pathname: '/guide/[id]', params: { id: item.id } }} asChild>
          <TouchableOpacity style={styles.articleCard}>
            <AnimatedImage 
              source={{ uri: item.featured_image || 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }} 
              style={styles.articleImage}
              entering={FadeInDown.delay(index * 150).springify()} 
            />
            <View style={[styles.articleInfo, { backgroundColor: colors.card }]}>
              <View style={[styles.categoryPill, { backgroundColor: colors.primary }]}>
                <Text style={styles.categoryText}>{item.category?.name || 'Guida'}</Text>
              </View>
              <Text style={[styles.articleTitle, { color: colors.text }]} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={[styles.locationText, { color: colors.text + '80' }]} numberOfLines={1}>
                {item.city}, {item.province}
              </Text>
            </View>
          </TouchableOpacity>
        </Link>
      </Animated.View>
    );
  };

  // Funzione per renderizzare ristoranti con animazione
  const renderRestaurantItem = ({ item, index }: { item: Restaurant, index: number }) => {
    return (
      <Animated.View
        entering={FadeInRight.delay(index * 100 + 300).springify()}
      >
        <Link href={{ pathname: '/ristoranti/[id]', params: { id: item.id } }} asChild>
          <TouchableOpacity style={styles.restaurantCard}>
            <AnimatedImage 
              source={{ uri: item.featured_image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }} 
              style={styles.restaurantImage} 
              entering={FadeInDown.delay(index * 150 + 300).springify()}
            />
            <View style={[styles.restaurantInfo, { backgroundColor: colors.card }]}>
              <View style={[styles.locationPill, { backgroundColor: colors.primary }]}>
                <Text style={styles.locationPillText}>{item.city}</Text>
              </View>
              <Text style={[styles.restaurantName, { color: colors.text }]} numberOfLines={2}>
                {item.name}
              </Text>
              <View style={styles.restaurantBottomInfo}>
                <View style={styles.ratingContainer}>
                  <FontAwesome name="star" size={12} color="#FFD700" />
                  <Text style={[styles.ratingText, { color: colors.text + '80' }]}>
                    {item.rating ? parseFloat(item.rating.toString()).toFixed(1) : 'N/A'}
                  </Text>
                </View>
                <Text style={[styles.priceText, { color: colors.primary }]}>
                  {getPriceRangeSymbol(item.price_range || 2)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Link>
      </Animated.View>
    );
  };

  // Skeleton Components
  const GuideSkeleton = () => {
    const { colors } = useTheme();
    return (
      <View style={styles.articleCard}>
        <View style={[styles.articleImage, { backgroundColor: colors.card + '80' }]} />
        <View style={[styles.articleInfo, { backgroundColor: colors.card }]}>
          <View style={[styles.categoryPill, { backgroundColor: colors.primary + '50' }]} />
          <View style={[styles.skeletonText, { backgroundColor: colors.text + '20', width: '80%' }]} />
          <View style={[styles.skeletonText, { backgroundColor: colors.text + '20', width: '60%', marginTop: 8 }]} />
        </View>
      </View>
    );
  };

  const RestaurantSkeleton = () => {
    const { colors } = useTheme();
    return (
      <View style={styles.restaurantCard}>
        <View style={[styles.restaurantImage, { backgroundColor: colors.card + '80' }]} />
        <View style={[styles.restaurantInfo, { backgroundColor: colors.card }]}>
          <View style={[styles.locationPill, { backgroundColor: colors.primary + '50' }]} />
          <View style={[styles.skeletonText, { backgroundColor: colors.text + '20', width: '70%' }]} />
          <View style={styles.restaurantBottomInfo}>
            <View style={[styles.skeletonText, { backgroundColor: colors.text + '20', width: 40 }]} />
            <View style={[styles.skeletonText, { backgroundColor: colors.text + '20', width: 30 }]} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      onScroll={(event) => {
        scrollY.value = event.nativeEvent.contentOffset.y;
      }}
      scrollEventThrottle={16}
    >
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      {/* Header con Hero Image */}
      <Animated.View style={[styles.heroContainer, heroAnimatedStyle]}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80' }}
          style={styles.heroImage}
        >
          <BlurView intensity={30} style={styles.heroOverlay}>
            <Animated.Text 
              entering={FadeInDown.duration(800).springify()} 
              style={styles.heroTitle}
            >
              AllFoodSicily
            </Animated.Text>
            <Animated.Text 
              entering={FadeInDown.delay(200).duration(800).springify()} 
              style={styles.heroSubtitle}
            >
              Il gusto e la cultura della Sicilia
            </Animated.Text>
          </BlurView>
        </ImageBackground>
      </Animated.View>

      {/* Sezione Guide in Evidenza */}
      <Animated.View 
        style={styles.section}
        entering={FadeInDown.delay(400).springify()}
      >
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Guide in Evidenza</Text>
          <Link href="/guide" asChild>
            <TouchableOpacity>
              <Text style={[styles.sectionLink, { color: colors.tint }]}>Vedi tutte</Text>
            </TouchableOpacity>
          </Link>
        </View>
        {loading ? (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[1, 2, 3]} // Dummy data for 3 skeleton items
            keyExtractor={(item) => item.toString()}
            renderItem={() => <GuideSkeleton />}
            contentContainerStyle={styles.articlesList}
          />
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={guides}
            keyExtractor={(item) => item.id}
            renderItem={renderGuideItem}
            contentContainerStyle={styles.articlesList}
          />
        )}
      </Animated.View>

      {/* Sezione Ristoranti in Evidenza */}
      <Animated.View 
        style={styles.section}
        entering={FadeInDown.delay(600).springify()}
      >
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ristoranti Consigliati</Text>
          <Link href="/ristoranti" asChild>
            <TouchableOpacity>
              <Text style={[styles.sectionLink, { color: colors.tint }]}>Vedi tutti</Text>
            </TouchableOpacity>
          </Link>
        </View>
        {loading ? (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[1, 2, 3]} // Dummy data for 3 skeleton items
            keyExtractor={(item) => item.toString()}
            renderItem={() => <RestaurantSkeleton />}
            contentContainerStyle={styles.restaurantsList}
          />
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={restaurants}
            keyExtractor={(item) => item.id}
            renderItem={renderRestaurantItem}
            contentContainerStyle={styles.restaurantsList}
          />
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroContainer: {
    height: width * 0.6, // Responsive height based on screen width
    marginBottom: 20,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  heroOverlay: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20,
  },
  heroTitle: {
    fontSize: width > 400 ? 36 : 32, // Responsive font size
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  heroSubtitle: {
    fontSize: width > 400 ? 20 : 18, // Responsive font size
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  section: {
    marginBottom: 24,
    paddingVertical: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: width > 400 ? 22 : 20, // Responsive font size
    fontWeight: 'bold',
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  articlesList: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  articleCard: {
    width: width * 0.85 > 320 ? 320 : width * 0.85, // Larger width for guides
    height: 260,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  articleImage: {
    width: '100%',
    height: 170,
  },
  articleInfo: {
    padding: 12,
    height: 90,
    justifyContent: 'center',
  },
  categoryPill: {
    position: 'absolute',
    top: -15,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
  },
  restaurantsList: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  restaurantCard: {
    width: width * 0.75 > 300 ? 280 : width * 0.75, // Responsive width
    height: 220,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
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
    height: 150,
  },
  restaurantInfo: {
    padding: 12,
    height: 70,
    justifyContent: 'center',
  },
  locationPill: {
    position: 'absolute',
    top: -15,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  locationPillText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  restaurantName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
  },
  locationText: {
    fontSize: 12,
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
  },
  restaurantBottomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    padding: 20,
  },
  skeletonText: {
    height: 12,
    borderRadius: 4,
  },
});
