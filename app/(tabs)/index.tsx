import { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ImageBackground, FlatList, Dimensions, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
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
}

export default function Index() {
  const { colors, colorScheme } = useTheme();
  const { onTap } = useHaptics();
  const textStyles = useTextStyles();
  const scrollY = useSharedValue(0);
  const fadeAnim = useSharedValue(0);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]); // All restaurants for search
  const [loading, setLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [totalImages, setTotalImages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const handleImageLoaded = (uri: string) => {
    setLoadedImages(prev => new Set([...prev, uri]));
  };
  
  const handleImageError = (uri: string) => {
    // Count failed images as "loaded" so we don't block forever
    handleImageLoaded(`error-${uri}`);
  };
  
  const allImagesLoaded = loadedImages.size >= totalImages && totalImages > 0;

  // Convert restaurants to ListItem format for MapView
  const mapRestaurants: ListItem[] = restaurants
    .filter(restaurant => restaurant.id && restaurant.name) // Filter out invalid entries
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
      latitude: 37.5, // Default fallback, should be from API
      longitude: 14.0, // Default fallback, should be from API
    }));

  // Filter restaurants based on search query - use allRestaurants for comprehensive search
  const filteredRestaurants = allRestaurants.length > 0 ? allRestaurants.filter(restaurant => {
    if (!searchQuery.trim() || !restaurant) return false;
    const query = searchQuery.toLowerCase();
    return (
      (restaurant.name && restaurant.name.toLowerCase().includes(query)) ||
      (restaurant.city && restaurant.city.toLowerCase().includes(query)) ||
      (restaurant.province && restaurant.province.toLowerCase().includes(query)) ||
      (restaurant.category_name && restaurant.category_name.toLowerCase().includes(query))
    );
  }) : [];

  // Handle search input changes
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setShowSearchResults(text.trim().length > 0);
  };

  // Handle search result selection
  const handleSearchResultSelect = (restaurant: Restaurant) => {
    if (!restaurant.id || !restaurant.name) return;
    
    setSearchQuery(restaurant.name);
    setShowSearchResults(false);
    onTap(); // Haptic feedback
    // Navigate to restaurant detail page
    router.push({
      pathname: '/ristoranti/[id]',
      params: { id: restaurant.id }
    });
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
      
      // Handle different response structures
      const guidesData = Array.isArray(guidesResponse) ? guidesResponse : (guidesResponse?.guides || guidesResponse?.items || []);
      const restaurantsData = allRestaurantsData;
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
        category_color: getCategoryColor(r.category_name)
      }));
      
      // Restaurants per visualizzazione (solo 3)
      const restaurantsDataTransformed = allRestaurantsTransformed.slice(0, 3);
      
      setGuides(guidesDataTransformed);
      setRestaurants(restaurantsDataTransformed);
      setAllRestaurants(allRestaurantsTransformed);
      
      // Count total images to load (only count valid images)
      const validGuideImages = guidesDataTransformed.filter((g: Guide) => g.featured_image).length;
      const validRestaurantImages = restaurantsDataTransformed.filter((r: Restaurant) => r.featured_image).length;
      const totalImgs = validGuideImages + validRestaurantImages; // No hero image anymore
      setTotalImages(totalImgs);
      setLoadedImages(new Set()); // Reset loaded images
      
      console.log('✅ Data loaded successfully:', { 
        guides: guidesDataTransformed.length, 
        displayRestaurants: restaurantsDataTransformed.length,
        allRestaurants: allRestaurantsTransformed.length,
        totalImages: totalImgs 
      });
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
        <Link href={{ pathname: '/guide/[id]', params: { id: item.id } }} asChild>
          <TouchableOpacity 
            style={styles.guideCard}
            onPress={() => onTap()}
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
              <Text style={[styles.guideLocation, textStyles.caption(colors.text + '80')]}>{item.city}, {item.province}</Text>
            </View>
          </TouchableOpacity>
        </Link>
      </Animated.View>
    );
  };

  // Funzione per renderizzare ristoranti con animazione
  const renderRestaurantItem = ({ item, index }: { item: Restaurant, index: number }) => {
    const staggeredAnimations = createStaggeredAnimation(TransitionType.FADE_RIGHT, restaurants.length, 800, 120);
    
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


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
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
        {showSearchResults && filteredRestaurants.length > 0 && (
          <View style={[styles.searchResultsContainer, { backgroundColor: colors.card }]}>
            <ScrollView 
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              {filteredRestaurants.slice(0, 5).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.searchResultItem, { borderBottomColor: colors.border }]}
                  onPress={() => handleSearchResultSelect(item)}
                >
                  <View style={styles.searchResultContent}>
                    <Text style={[styles.searchResultName, { color: colors.text }]} numberOfLines={1}>
                      {item.name || 'Nome non disponibile'}
                    </Text>
                    <Text style={[styles.searchResultLocation, { color: colors.text + '80' }]} numberOfLines={1}>
                      {item.city || 'Città'}, {item.province || 'Provincia'} • {item.category_name || 'Categoria'}
                    </Text>
                  </View>
                  <MaterialIcons name="arrow-forward" size={16} color={colors.text + '60'} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        
        {showSearchResults && filteredRestaurants.length === 0 && (
          <View style={[styles.searchResultsContainer, { backgroundColor: colors.card }]}>
            <View style={styles.noResultsContainer}>
              <MaterialIcons name="search-off" size={24} color={colors.text + '60'} />
              <Text style={[styles.noResultsText, { color: colors.text + '80' }]}>
                Nessun ristorante trovato
              </Text>
            </View>
          </View>
        )}
        
        {/* Small Map */}
        <View style={styles.mapContainer}>
          <RestaurantMapView
            restaurants={mapRestaurants}
            height={width * 0.4}
            showLocationButton={false}
            onMarkerPress={(restaurant) => {
              // Navigate to restaurant detail
              console.log('Restaurant selected:', restaurant.title);
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
          <Text style={[styles.sectionTitle, textStyles.title(colors.text)]}>Locali Consigliati</Text>
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
        ) : restaurants.length === 0 ? (
          <InlineLoading 
            title="Nessun ristorante disponibile al momento"
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

      {/* Sezione Hotel e B&B Consigliati */}
      <Animated.View 
        style={styles.section}
        entering={createStaggeredAnimation(TransitionType.FADE_UP, 1, 900)[0]}
      >
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, textStyles.title(colors.text)]}>Hotel e B&B Consigliati</Text>
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
        ) : restaurants.length === 0 ? (
          <InlineLoading 
            title="Nessun hotel disponibile al momento"
          />
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={restaurants}
            keyExtractor={(item) => item.id}
            renderItem={renderRestaurantItem}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchResultsContainer: {
    position: 'absolute',
    top: 60, // Position below search bar
    left: 0,
    right: 0,
    maxHeight: 200,
    borderRadius: 12,
    marginHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
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
    minHeight: 280, // Minimum height, can expand for longer text
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
    backgroundColor: 'white', // For the text area
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
    minHeight: 80, // Minimum height, can expand
    justifyContent: 'flex-start',
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
    backgroundColor: 'white', // For the text area
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
});
