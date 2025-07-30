import { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ImageBackground, FlatList, Dimensions, TextInput, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Animated, { useAnimatedStyle, useSharedValue, Easing, withTiming } from "react-native-reanimated";
import { apiClient } from "../../services/api";
import { useHaptics } from "../../utils/haptics";
import { SkeletonHeroCard, SkeletonGuideCard, SkeletonRestaurantCard } from "../../components/skeleton/SkeletonCards";
import { useTextStyles } from "../../hooks/useAccessibleText";
import { SCREEN_TRANSITIONS, createStaggeredAnimation, TransitionType } from "../../utils/transitions";
import { InlineLoading } from "../../components/LoadingStates";
import { useEnhancedRefresh } from "../../hooks/useEnhancedRefresh";
import { MinimalRefreshIndicator } from "../../components/RefreshIndicator";
import { VerticalScrollIndicator, ScrollIndicatorType, ScrollIndicatorPosition } from "../../components/ScrollIndicators";
import { RestaurantMapView } from "../../components/MapView";
import { MaterialIcons } from "@expo/vector-icons";
import { ListItem } from "../../components/ListCard";
import { useLocation } from "../../hooks/useLocation";

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
}

export default function Index() {
  const { colors, colorScheme } = useTheme();
  const { onTap } = useHaptics();
  const textStyles = useTextStyles();
  const scrollY = useSharedValue(0);
  const fadeAnim = useSharedValue(0);
  const [guides, setGuides] = useState<Guide[]>([]);
  // Removed restaurants and hotels state - now using nearestRestaurants and nearestHotels computed values
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]); // All restaurants for search
  const [allHotels, setAllHotels] = useState<Hotel[]>([]); // All hotels for search
  const [loading, setLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [totalImages, setTotalImages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Hook per geolocalizzazione
  const { location: userLocation, getCurrentLocation, calculateDistance } = useLocation();
  
  const handleImageLoaded = (uri: string) => {
    setLoadedImages(prev => new Set([...prev, uri]));
  };
  
  const handleImageError = (uri: string) => {
    // Count failed images as "loaded" so we don't block forever
    handleImageLoaded(`error-${uri}`);
  };
  
  const allImagesLoaded = loadedImages.size >= totalImages && totalImages > 0;

  // Convert ALL restaurants to ListItem format for MapView (not just 3)
  const mapRestaurants: ListItem[] = allRestaurants
    .filter(restaurant => restaurant.id && restaurant.name && restaurant.latitude && restaurant.longitude) // Filter out invalid entries and missing coordinates
    .map(restaurant => ({
      id: restaurant.id,
      title: restaurant.name,
      featured_image: restaurant.featured_image || '',
      category: {
        id: restaurant.id, // Using restaurant id as category id fallback
        name: restaurant.category_name || 'Ristorante',
        color: restaurant.category_color || '#3B82F6'
      },
      city: restaurant.city || '',
      province: restaurant.province || '',
      rating: typeof restaurant.rating === 'string' ? parseFloat(restaurant.rating) : restaurant.rating,
      latitude: restaurant.latitude, // Use real coordinates from API
      longitude: restaurant.longitude, // Use real coordinates from API
    }));

  // Convert ALL hotels to ListItem format for MapView (not just 3)
  const mapHotels: ListItem[] = allHotels
    .filter(hotel => hotel.id && hotel.name && hotel.latitude && hotel.longitude) // Filter out invalid entries and missing coordinates
    .map(hotel => ({
      id: hotel.id,
      title: hotel.name,
      featured_image: hotel.featured_image || '',
      category: {
        id: hotel.id, // Using hotel id as category id fallback
        name: hotel.hotel_type?.[0]?.charAt(0).toUpperCase() + hotel.hotel_type?.[0]?.slice(1).replace('&', ' & ') || 'Hotel',
        color: hotel.category_color || '#FF6B6B' // Different color for hotels
      },
      city: hotel.city || '',
      province: hotel.province || '',
      rating: typeof hotel.rating === 'string' ? parseFloat(hotel.rating) : hotel.rating,
      latitude: hotel.latitude, // Use real coordinates from API
      longitude: hotel.longitude, // Use real coordinates from API
      hotel_type: hotel.hotel_type, // Add hotel_type property to identify as hotel
    }));

  // Combine both restaurants and hotels for map view
  const mapItems: ListItem[] = [...mapRestaurants, ...mapHotels];

  // Funzione per ordinare per distanza
  const sortByDistance = (items: (Restaurant | Hotel)[], userLat: number, userLng: number) => {
    return items
      .filter(item => item.latitude && item.longitude) // Solo elementi con coordinate
      .map(item => ({
        ...item,
        distance: calculateDistance(userLat, userLng, Number(item.latitude), Number(item.longitude))
      }))
      .sort((a, b) => a.distance - b.distance);
  };

  // Ottieni i 3 ristoranti più vicini
  const nearestRestaurants: Restaurant[] = userLocation 
    ? sortByDistance(allRestaurants, userLocation.latitude, userLocation.longitude)
        .slice(0, 3)
        .map(({ distance, ...item }) => item as Restaurant) // Rimuovi la proprietà distance per mantenere il tipo originale
    : allRestaurants.slice(0, 3); // Fallback ai primi 3 se no geolocalizzazione

  // Ottieni i 3 hotel più vicini  
  const nearestHotels: Hotel[] = userLocation
    ? sortByDistance(allHotels, userLocation.latitude, userLocation.longitude)
        .slice(0, 3)
        .map(({ distance, ...item }) => item as Hotel) // Rimuovi la proprietà distance per mantenere il tipo originale
    : allHotels.slice(0, 3); // Fallback ai primi 3 se no geolocalizzazione

  console.log(`🗺️ Map data:`, {
    allRestaurantsTotal: allRestaurants.length,
    nearestRestaurants: nearestRestaurants.length,
    restaurantsWithCoords: mapRestaurants.length,
    allHotelsTotal: allHotels.length,
    nearestHotels: nearestHotels.length,
    hotelsWithCoords: mapHotels.length,
    mapItemsTotal: mapItems.length,
    userLocation: userLocation ? `${userLocation.latitude}, ${userLocation.longitude}` : 'No location'
  });

  // Filter both restaurants and hotels based on search query
  const filteredResults = searchQuery.trim().length > 0 
    ? [
        ...allRestaurants.filter(restaurant => {
          if (!restaurant) return false;
          const query = searchQuery.toLowerCase();
          return (
            (restaurant.name && restaurant.name.toLowerCase().includes(query)) ||
            (restaurant.city && restaurant.city.toLowerCase().includes(query)) ||
            (restaurant.province && restaurant.province.toLowerCase().includes(query)) ||
            (restaurant.category_name && restaurant.category_name.toLowerCase().includes(query))
          );
        }).map(restaurant => ({ ...restaurant, type: 'restaurant' })),
        ...allHotels.filter(hotel => {
          if (!hotel) return false;
          const query = searchQuery.toLowerCase();
          return (
            (hotel.name && hotel.name.toLowerCase().includes(query)) ||
            (hotel.city && hotel.city.toLowerCase().includes(query)) ||
            (hotel.province && hotel.province.toLowerCase().includes(query)) ||
            (hotel.category_name && hotel.category_name.toLowerCase().includes(query)) ||
            (hotel.hotel_type && hotel.hotel_type.some(type => type.toLowerCase().includes(query)))
          );
        }).map(hotel => ({ ...hotel, type: 'hotel' }))
      ]
    : [];

  // Handle search input changes
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setShowSearchResults(text.trim().length > 0);
  };

  // Handle search result selection
  const handleSearchResultSelect = (item: any) => {
    if (!item.id || !item.name) return;
    
    setSearchQuery(item.name);
    setShowSearchResults(false);
    onTap(); // Haptic feedback
    
    // Navigate based on item type
    if (item.type === 'hotel') {
      router.push({
        pathname: '/hotel/[id]',
        params: { id: item.id }
      });
    } else {
      // Default to restaurant
      router.push({
        pathname: '/ristoranti/[id]',
        params: { id: item.id }
      });
    }
  };
  
  // Safety timeout - show content after 4 seconds even if images aren't loaded
  useEffect(() => {
    if (totalImages > 0 && !allImagesLoaded) {
      const timeout = setTimeout(() => {
        const timeoutImages = [];
        for (let i = 0; i < totalImages; i++) {
          timeoutImages.push(`timeout-${i}`);
        }
        setLoadedImages(new Set(timeoutImages));
      }, 4000);
      
      return () => clearTimeout(timeout);
    }
  }, [totalImages, allImagesLoaded]);

  // Enhanced refresh hook per homepage
  const refreshState = useEnhancedRefresh({
    onRefresh: async () => {
      console.log('🔄 Starting refresh...');
      await loadData();
      console.log('✅ Refresh completed');
    },
    threshold: 60, // Ridotto per attivazione più facile
    hapticFeedback: true,
    showIndicator: true,
    refreshDuration: 800, // Durata minima più breve ma visibile
  });
  
  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 1000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
    loadData();
    // Ottieni la posizione utente per calcolare le distanze
    getCurrentLocation();
  }, []);

  const loadData = async () => {
    try {
      console.log('📥 Loading data from API...');
      setLoading(true);
      setError(null);
      
      // Load guides and categories first
      const [guidesResponse, categoriesResponse] = await Promise.all([
        apiClient.get<any>('/guides/'),
        apiClient.get<any>('/categories/')
      ]);
      
      // Load all restaurants with pagination (same logic as in ristoranti.tsx)
      let allRestaurantsData = [];
      try {
        console.log('🔄 Loading all restaurants for search...');
        let currentPage = 1;
        let hasMore = true;
        
        while (hasMore) {
          const restaurantsUrl = `/restaurants/?page=${currentPage}&limit=100`;
          console.log(`📄 Loading page ${currentPage}...`);
          
          const restaurantsResponse = await apiClient.get<any>(restaurantsUrl);
          const pageData = Array.isArray(restaurantsResponse) ? restaurantsResponse : (restaurantsResponse?.restaurants || restaurantsResponse?.items || []);
          
          if (pageData.length === 0) {
            hasMore = false;
          } else {
            allRestaurantsData.push(...pageData);
            currentPage++;
            
            // Check if there are more pages
            if (restaurantsResponse?.has_more === false || pageData.length < 100) {
              hasMore = false;
            }
          }
          
          // Safety break to avoid infinite loops
          if (currentPage > 50) {
            console.warn('⚠️ Stopped loading after 50 pages');
            hasMore = false;
          }
        }
        
        console.log(`✅ Loaded ${allRestaurantsData.length} restaurants across ${currentPage - 1} pages`);
      } catch (error) {
        console.warn('⚠️ Pagination failed, loading single page:', error);
        // Fallback to single page
        const restaurantsResponse = await apiClient.get<any>('/restaurants/?limit=100');
        allRestaurantsData = Array.isArray(restaurantsResponse) ? restaurantsResponse : (restaurantsResponse?.restaurants || restaurantsResponse?.items || []);
      }

      // Load all hotels with pagination (same logic as restaurants)
      let allHotelsData = [];
      try {
        console.log('🔄 Loading all hotels for search...');
        let currentPage = 1;
        let hasMore = true;
        
        while (hasMore) {
          const hotelsUrl = `/hotels/?page=${currentPage}&limit=100`;
          console.log(`📄 Loading hotel page ${currentPage}...`);
          
          const hotelsResponse = await apiClient.get<any>(hotelsUrl);
          const pageData = Array.isArray(hotelsResponse) ? hotelsResponse : (hotelsResponse?.data || hotelsResponse?.hotels || hotelsResponse?.items || []);
          
          if (pageData.length === 0) {
            hasMore = false;
          } else {
            allHotelsData.push(...pageData);
            currentPage++;
            
            // Check if there are more pages
            if (hotelsResponse?.has_more === false || pageData.length < 100) {
              hasMore = false;
            }
          }
          
          // Safety break to avoid infinite loops
          if (currentPage > 50) {
            console.warn('⚠️ Stopped loading hotel after 50 pages');
            hasMore = false;
          }
        }
        
        console.log(`✅ Loaded ${allHotelsData.length} hotels across ${currentPage - 1} pages`);
      } catch (error) {
        console.warn('⚠️ Hotel pagination failed, loading single page:', error);
        // Fallback to single page
        const hotelsResponse = await apiClient.get<any>('/hotels/?limit=100');
        allHotelsData = Array.isArray(hotelsResponse) ? hotelsResponse : (hotelsResponse?.data || hotelsResponse?.hotels || hotelsResponse?.items || []);
      }
      
      // Handle different response structures
      const guidesData = Array.isArray(guidesResponse) ? guidesResponse : (guidesResponse?.guides || guidesResponse?.items || []);
      const restaurantsData = allRestaurantsData;
      const hotelsData = allHotelsData;
      const categoriesData = Array.isArray(categoriesResponse) ? categoriesResponse : (categoriesResponse?.categories || categoriesResponse?.items || []);
      
      // Funzione per trovare il colore della categoria
      const getCategoryColor = (catName: string) =>
        categoriesData.find((cat: any) => cat.name === catName)?.color || colors.primary;
      
      // Guides con colore categoria
      const guidesDataTransformed = guidesData.slice(0, 3).map((g: any) => ({
        ...g,
        category: {
          ...g.category,
          name: g.category?.name || g.category_name,
          color: getCategoryColor(g.category?.name || g.category_name)
        }
      }));
      
      // All Restaurants con colore categoria (per ricerca)
      const allRestaurantsTransformed = restaurantsData.map((r: any) => ({
        ...r,
        category_color: getCategoryColor(r.category_name),
        latitude: r.latitude, // Use coordinates directly like in working restaurant page
        longitude: r.longitude // Use coordinates directly like in working restaurant page
      }));
      
      // All Hotels con colore categoria (per ricerca)
      const allHotelsTransformed = hotelsData.map((h: any) => ({
        ...h,
        category_color: getCategoryColor(h.category_name),
        latitude: h.latitude, // Use coordinates directly like in working restaurant page
        longitude: h.longitude // Use coordinates directly like in working restaurant page
      }));
      
      setGuides(guidesDataTransformed);
      setAllRestaurants(allRestaurantsTransformed);
      setAllHotels(allHotelsTransformed);
      
      // Count total images to load (only count valid images from first 3 of each)
      const validGuideImages = guidesDataTransformed.filter((g: Guide) => g.featured_image).length;
      const validRestaurantImages = allRestaurantsTransformed.slice(0, 3).filter((r: Restaurant) => r.featured_image).length;
      const validHotelImages = allHotelsTransformed.slice(0, 3).filter((h: Hotel) => h.featured_image).length;
      const totalImgs = validGuideImages + validRestaurantImages + validHotelImages;
      setTotalImages(totalImgs);
      setLoadedImages(new Set()); // Reset loaded images
      
      console.log('✅ Data loaded successfully:', { 
        guides: guidesDataTransformed.length, 
        allRestaurants: allRestaurantsTransformed.length,
        allHotels: allHotelsTransformed.length,
        totalImages: totalImgs 
      });
      
      // Debug coordinates
      console.log('🔍 Restaurant coordinates sample:', allRestaurantsTransformed.slice(0, 3).map((r: any) => ({
        name: r.name,
        latitude: r.latitude,
        longitude: r.longitude
      })));
      
      console.log('🔍 Hotel coordinates sample:', allHotelsTransformed.slice(0, 3).map((h: any) => ({
        name: h.name,
        latitude: h.latitude,
        longitude: h.longitude
      })));
    } catch (error) {
      console.error('❌ Error loading data:', error);
      setError('Impossibile caricare i dati. Riprova più tardi.');
    } finally {
      setLoading(false);
      console.log('🏁 Loading finished');
    }
  };


  // Funzione per renderizzare guide con animazione
  const renderGuideItem = ({ item, index }: { item: Guide, index: number }) => {
    const staggeredAnimations = createStaggeredAnimation(TransitionType.FADE_RIGHT, guides.length, 400, 120);
    
    return (
      <Animated.View
        entering={staggeredAnimations[index] || SCREEN_TRANSITIONS.home.enter}
      >
        <TouchableOpacity 
          style={styles.guideCard}
          onPress={() => {
            onTap();
            router.push(`/guide-categories/${item.id}`);
          }}
        >
            <ImageBackground
              source={{ uri: item.featured_image || 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }}
              style={styles.guideImage}
              imageStyle={{ borderRadius: 12 }}
              onLoad={() => item.featured_image && handleImageLoaded(item.featured_image)}
              onError={() => item.featured_image && handleImageError(item.featured_image)}
            >

            </ImageBackground>
            <View style={styles.guideInfo}>
              <Text style={[styles.guideTitle, textStyles.subtitle(colors.text)]}>{item.title}</Text>
            </View>
          </TouchableOpacity>
      </Animated.View>
    );
  };

  // Funzione per renderizzare ristoranti con animazione
  const renderRestaurantItem = ({ item, index }: { item: Restaurant, index: number }) => {
    const staggeredAnimations = createStaggeredAnimation(TransitionType.FADE_RIGHT, nearestRestaurants.length, 800, 120);
    
    return (
      <Animated.View
        entering={staggeredAnimations[index] || SCREEN_TRANSITIONS.home.enter}
      >
        <Link href={{ pathname: '/ristoranti/[id]', params: { id: item.id } }} asChild>
          <TouchableOpacity 
            style={styles.restaurantCard}
            onPress={() => onTap()}
          >
            <ImageBackground
              source={{ uri: item.featured_image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }}
              style={styles.restaurantImage}
              imageStyle={{ borderRadius: 12 }}
              onLoad={() => item.featured_image && handleImageLoaded(item.featured_image)}
              onError={() => item.featured_image && handleImageError(item.featured_image)}
            >
              <View style={styles.restaurantCategoryPill}>
                <Text style={[styles.restaurantCategoryText, textStyles.label('white')]}>{item.category_name || 'Ristorante'}</Text>
              </View>
            </ImageBackground>
            <View style={styles.restaurantInfo}>
              <Text style={[styles.restaurantTitle, textStyles.subtitle(colors.text)]} numberOfLines={2}>{item.name}</Text>
              <Text style={[styles.restaurantLocation, textStyles.caption(colors.text + '80')]} numberOfLines={1}>{item.city}, {item.province}</Text>
            </View>
          </TouchableOpacity>
        </Link>
      </Animated.View>
    );
  };

  // Funzione per renderizzare hotel con animazione
  const renderHotelItem = ({ item, index }: { item: Hotel, index: number }) => {
    const staggeredAnimations = createStaggeredAnimation(TransitionType.FADE_RIGHT, nearestHotels.length, 1200, 120);
    
    return (
      <Animated.View
        entering={staggeredAnimations[index] || SCREEN_TRANSITIONS.home.enter}
      >
        <Link href={{ pathname: '/hotel/[id]', params: { id: item.id } }} asChild>
          <TouchableOpacity 
            style={styles.restaurantCard}
            onPress={() => onTap()}
          >
            <ImageBackground
              source={{ uri: item.featured_image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }}
              style={styles.restaurantImage}
              imageStyle={{ borderRadius: 12 }}
              onLoad={() => item.featured_image && handleImageLoaded(item.featured_image)}
              onError={() => item.featured_image && handleImageError(item.featured_image)}
            >
              <View style={styles.restaurantCategoryPill}>
                <Text style={[styles.restaurantCategoryText, textStyles.label('white')]}>
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
            </ImageBackground>
            <View style={styles.restaurantInfo}>
              <Text style={[styles.restaurantTitle, textStyles.subtitle(colors.text)]} numberOfLines={2}>{item.name}</Text>
              <Text style={[styles.restaurantLocation, textStyles.caption(colors.text + '80')]} numberOfLines={1}>{item.city}, {item.province}</Text>
            </View>
          </TouchableOpacity>
        </Link>
      </Animated.View>
    );
  };


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'light' ? 'dark' : 'dark'} />
      
      {/* Enhanced Refresh Indicator - Solo Icona */}
      {refreshState.shouldShowIndicator && (
        <MinimalRefreshIndicator
          isRefreshing={refreshState.isRefreshing}
          progress={refreshState.refreshProgress}
          text=""
          translateY={refreshState.translateY}
          opacity={refreshState.opacity}
          scale={refreshState.scale}
          rotation={refreshState.rotation}
          size="small"
        />
      )}

      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          scrollY.value = event.nativeEvent.contentOffset.y;
          refreshState.onScroll(event);
        }}
        onScrollEndDrag={refreshState.onScrollEndDrag}
        onContentSizeChange={(_, h) => setContentHeight(h)}
        onLayout={(event) => setContainerHeight(event.nativeEvent.layout.height)}
        scrollEventThrottle={16}
        bounces={true} // Assicura che il bounce sia abilitato
        alwaysBounceVertical={true}
      >
      
      {/* Header con Search Bar e Mappa */}
      <View style={[styles.mapSection, { backgroundColor: colors.background }]}>
        {/* Search overlay to close results when tapping outside */}
        {showSearchResults && (
          <TouchableOpacity
            style={styles.searchOverlay}
            activeOpacity={1}
            onPress={() => setShowSearchResults(false)}
          />
        )}
        
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <MaterialIcons name="search" size={20} color={colors.text} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Cerca i migliori locali e hotel in sicilia..."
            placeholderTextColor={colors.text + '80'}
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              setShowSearchResults(false);
            }}>
              <MaterialIcons name="clear" size={20} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Search Results Dropdown */}
        {showSearchResults && filteredResults.length > 0 && (
          <View style={[styles.searchResultsContainer, { backgroundColor: colors.card }]}>
            <ScrollView 
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              {filteredResults.slice(0, 5).map((item) => (
                <TouchableOpacity
                  key={`${item.type}-${item.id}`}
                  style={[styles.searchResultItem, { borderBottomColor: colors.border }]}
                  onPress={() => handleSearchResultSelect(item)}
                >
                  <View style={styles.searchResultContent}>
                    <View style={styles.searchResultHeader}>
                      <Text style={[styles.searchResultName, { color: colors.text }]} numberOfLines={1}>
                        {item.name || 'Nome non disponibile'}
                      </Text>

                    </View>
                    <Text style={[styles.searchResultLocation, { color: colors.text + '80' }]} numberOfLines={1}>
                      {item.city || 'Città'}, {item.province || 'Provincia'} • 

                    </Text>
                  </View>
                  <MaterialIcons name="arrow-forward" size={16} color={colors.text + '60'} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        
        {showSearchResults && filteredResults.length === 0 && (
          <View style={[styles.searchResultsContainer, { backgroundColor: colors.card }]}>
            <View style={styles.noResultsContainer}>
              <MaterialIcons name="search-off" size={24} color={colors.text + '60'} />
              <Text style={[styles.noResultsText, { color: colors.text + '80' }]}>
                Nessun locale o hotel trovato
              </Text>
            </View>
          </View>
        )}
        
        {/* Small Map */}
        <View style={styles.mapContainer}>
          <RestaurantMapView
            restaurants={mapItems}
            height={width * 0.4}
            showLocationButton={true}
            onMarkerPress={(item) => {
              onTap();
              // Determine if it's a restaurant or hotel based on the original data
              const isHotel = allHotels.some(hotel => hotel.id === item.id);
              if (isHotel) {
                router.push(`/hotel/${item.id}`);
              } else {
                router.push(`/ristoranti/${item.id}`);
              }
            }}
            onLocationRequest={() => {
              Alert.alert(
                'Aggiorna Posizione',
                'Vuoi aggiornare la tua posizione per vedere i locali più vicini?',
                [
                  { text: 'Annulla', style: 'cancel' },
                  { 
                    text: 'Aggiorna', 
                    onPress: () => {
                      console.log('Richiesta aggiornamento posizione dalla home page');
                    }
                  }
                ]
              )
            }}
          />
        </View>
      </View>

      {/* Sezione Guide in Evidenza */}
      <Animated.View 
        style={styles.section}
        entering={createStaggeredAnimation(TransitionType.FADE_UP, 1, 300)[0]}
      >
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, textStyles.title(colors.text)]}>Scopri le ultime guide</Text>
          <Link href="/(tabs)/guide" asChild>
            <TouchableOpacity onPress={() => onTap()}>
              <Text style={[styles.sectionLink, textStyles.button(colors.tint)]}>Vedi tutte</Text>
            </TouchableOpacity>
          </Link>
        </View>
        {loading ? (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[1, 2, 3]} // Dummy data for 3 skeleton items
            keyExtractor={(item) => item.toString()}
            renderItem={() => <SkeletonGuideCard />}
            contentContainerStyle={styles.articlesList}
          />
        ) : error ? (
          <InlineLoading 
            title="Errore nel caricamento delle guide"
          />
        ) : !allImagesLoaded ? (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[1, 2, 3]}
            keyExtractor={(item) => item.toString()}
            renderItem={() => <SkeletonGuideCard />}
            contentContainerStyle={styles.articlesList}
          />
        ) : guides.length === 0 ? (
          <InlineLoading 
            title="Nessuna guida disponibile al momento"
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
        entering={createStaggeredAnimation(TransitionType.FADE_UP, 1, 600)[0]}
      >
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, textStyles.title(colors.text)]}>Locali nelle Vicinanze</Text>
          <Link href="/ristoranti" asChild>
            <TouchableOpacity onPress={() => onTap()}>
              <Text style={[styles.sectionLink, textStyles.button(colors.tint)]}>Vedi tutti</Text>
            </TouchableOpacity>
          </Link>
        </View>
        {loading ? (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[1, 2, 3]} // Dummy data for 3 skeleton items
            keyExtractor={(item) => item.toString()}
            renderItem={() => <SkeletonRestaurantCard />}
            contentContainerStyle={styles.restaurantsList}
          />
        ) : error ? (
          <InlineLoading 
            title="Errore nel caricamento dei ristoranti"
          />
        ) : !allImagesLoaded ? (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[1, 2, 3]}
            keyExtractor={(item) => item.toString()}
            renderItem={() => <SkeletonRestaurantCard />}
            contentContainerStyle={styles.restaurantsList}
          />
        ) : nearestRestaurants.length === 0 ? (
          <InlineLoading 
            title="Nessun ristorante disponibile al momento"
          />
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={nearestRestaurants}
            keyExtractor={(item) => item.id}
            renderItem={renderRestaurantItem}
            contentContainerStyle={styles.restaurantsList}
          />
        )}
      </Animated.View>

      {/* Sezione Hotel e B&B Consigliati */}
      <Animated.View 
        style={styles.section}
        entering={createStaggeredAnimation(TransitionType.FADE_UP, 1, 900)[0]}
      >
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, textStyles.title(colors.text)]}>Hotel nelle Vicinanze</Text>
          <Link href="/(tabs)/hotel" asChild>
            <TouchableOpacity onPress={() => onTap()}>
              <Text style={[styles.sectionLink, textStyles.button(colors.tint)]}>Vedi tutti</Text>
            </TouchableOpacity>
          </Link>
        </View>
        {loading ? (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[1, 2, 3]} // Dummy data for 3 skeleton items
            keyExtractor={(item) => item.toString()}
            renderItem={() => <SkeletonRestaurantCard />}
            contentContainerStyle={styles.hotelsList}
          />
        ) : error ? (
          <InlineLoading 
            title="Errore nel caricamento degli hotel"
          />
        ) : !allImagesLoaded ? (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[1, 2, 3]}
            keyExtractor={(item) => item.toString()}
            renderItem={() => <SkeletonRestaurantCard />}
            contentContainerStyle={styles.hotelsList}
          />
        ) : nearestHotels.length === 0 ? (
          <InlineLoading 
            title="Nessun hotel disponibile al momento"
          />
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={nearestHotels}
            keyExtractor={(item) => item.id}
            renderItem={renderHotelItem}
            contentContainerStyle={styles.hotelsList}
          />
        )}
      </Animated.View>
      </ScrollView>

      {/* Custom Scroll Indicator - Nascosto */}
      {false && contentHeight > containerHeight && (
        <VerticalScrollIndicator
          scrollY={scrollY}
          contentHeight={contentHeight}
          containerHeight={containerHeight}
          type={ScrollIndicatorType.ROUNDED}
          position={ScrollIndicatorPosition.RIGHT}
          autoHide={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapSection: {
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    position: 'relative',
  },
  searchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    } : {
      elevation: 3,
    }),
    zIndex: 1001,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
  },
  mapContainer: {
    height: width * 0.4, // Small map, responsive height
    borderRadius: 12,
    overflow: 'hidden',
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    } : {}),
  },
  searchResultsContainer: {
    position: 'absolute',
    top: 60, // Position below search bar
    left: 0,
    right: 0,
    maxHeight: 200,
    borderRadius: 12,
    marginHorizontal: 0,
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    } : {
      elevation: 8,
    }),
    zIndex: 1000,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  searchResultLocation: {
    fontSize: 14,
    fontWeight: '400',
  },
  noResultsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 8,
  },
  noResultsText: {
    fontSize: 14,
    fontWeight: '500',
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
    // Dynamic font size and weight handled by useTextStyles
  },
  sectionLink: {
    // Dynamic font size and weight handled by useTextStyles
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
    ...(Platform.OS === 'android' ? {} : {
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    }),
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
  hotelsList: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  // Old restaurant card styles - removed
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
  fullImageCard: {
    width: width * 0.55 > 200 ? 200 : width * 0.55, // Very compact width for small cards
    height: 260,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    ...(Platform.OS === 'android' ? {} : {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    }),
  },
  fullImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  textOverlay: {
    padding: 16,
    zIndex: 2,
  },
  categoryPillOverlay: {
    alignSelf: 'flex-start',
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 8,
    overflow: 'hidden',
    // Dynamic font size and weight handled by useTextStyles
  },
  cardTitleOverlay: {
    marginBottom: 4, // Dynamic font size and weight handled by useTextStyles
  },
  cardSubtitleOverlay: {
    opacity: 0.85, // Dynamic font size handled by useTextStyles
  },
  // Guide card styles
  guideCard: {
    width: width * 0.45 > 180 ? 180 : width * 0.45, // Smaller width for guide cards
    minHeight: 260, // Reduced height since we only have title
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    ...(Platform.OS === 'android' ? {} : {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
      backgroundColor: 'white', // For the text area
    }),
  },
  guideImage: {
    width: '100%',
    height: 200, // Fixed height for image
  },
  guideCategoryPill: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  guideCategoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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
  guideLocation: {
    fontSize: 12,
    opacity: 0.8,
  },
  // Restaurant card styles
  restaurantCard: {
    width: width * 0.55 > 200 ? 200 : width * 0.55, // Same width as other cards
    height: (width * 0.55 > 200 ? 200 : width * 0.55) * (9/16) + 80, // 16:9 image + text area
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    ...(Platform.OS === 'android' ? {} : {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
      backgroundColor: 'white', // For the text area
    }),
  },
  restaurantImage: {
    width: '100%',
    height: (width * 0.55 > 200 ? 200 : width * 0.55) * (9/16), // 16:9 aspect ratio
  },
  restaurantCategoryPill: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#3B82F6',
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
    marginBottom: 4,
  },
  restaurantLocation: {
    fontSize: 12,
    opacity: 0.8,
  },
  searchResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchResultTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  searchResultTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  starRatingOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
});
