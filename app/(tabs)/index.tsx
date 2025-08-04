import { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Alert, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSharedValue, Easing, withTiming } from "react-native-reanimated";
import { useHaptics } from "../../utils/haptics";
import { createStaggeredAnimation, TransitionType } from "../../utils/transitions";
import { useEnhancedRefresh } from "../../hooks/useEnhancedRefresh";
import { MinimalRefreshIndicator } from "../../components/RefreshIndicator";
import { VerticalScrollIndicator, ScrollIndicatorType, ScrollIndicatorPosition } from "../../components/ScrollIndicators";
import { RestaurantMapView } from "../../components/MapView";
import { ListItem } from "../../components/ListCard";
import { useLocation } from "../../hooks/useLocation";
import { useHomeData } from "../../hooks/useHomeData";
import { SearchSection, GuideCard, RestaurantCard, HotelCard, ContentSection } from "../../components/Home";

const { width } = Dimensions.get('window');

export default function Index() {
  const { colors } = useTheme();
  const { onTap } = useHaptics();
  const scrollY = useSharedValue(0);
  const fadeAnim = useSharedValue(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Hook per geolocalizzazione
  const { location: userLocation, getCurrentLocation, calculateDistance } = useLocation();
  
  // Hook per gestire i dati della homepage
  const {
    guides,
    allRestaurants,
    allHotels,
    loading,
    error,
    loadData,
    totalImages,
    loadedImages,
    setLoadedImages,
    handleImageLoaded,
    handleImageError,
    allImagesLoaded,
  } = useHomeData();
  

  // Convert ALL restaurants to ListItem format for MapView (not just 3)
  const mapRestaurants: ListItem[] = allRestaurants
    .filter(restaurant => restaurant.id && restaurant.name && restaurant.latitude && restaurant.longitude)
    .map(restaurant => ({
      id: restaurant.id,
      title: restaurant.name,
      featured_image: restaurant.featured_image || '',
      category: {
        id: restaurant.id,
        name: restaurant.category_name || 'Ristorante',
        color: colors.primary
      },
      city: restaurant.city || '',
      province: restaurant.province || '',
      rating: typeof restaurant.rating === 'string' ? parseFloat(restaurant.rating) : restaurant.rating,
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
    }));

  // Convert ALL hotels to ListItem format for MapView (not just 3)
  const mapHotels: ListItem[] = allHotels
    .filter(hotel => hotel.id && hotel.name && hotel.latitude && hotel.longitude)
    .map(hotel => ({
      id: hotel.id,
      title: hotel.name,
      featured_image: hotel.featured_image || '',
      category: {
        id: hotel.id,
        name: hotel.hotel_type?.[0]?.charAt(0).toUpperCase() + hotel.hotel_type?.[0]?.slice(1).replace('&', ' & ') || 'Hotel',
        color: colors.primary
      },
      city: hotel.city || '',
      province: hotel.province || '',
      rating: typeof hotel.rating === 'string' ? parseFloat(hotel.rating) : hotel.rating,
      latitude: hotel.latitude,
      longitude: hotel.longitude,
      hotel_type: hotel.hotel_type,
    }));

  // Combine both restaurants and hotels for map view
  const mapItems: ListItem[] = [...mapRestaurants, ...mapHotels];

  // Funzione per ordinare per distanza
  const sortByDistance = (items: any[], userLat: number, userLng: number) => {
    return items
      .filter(item => item.latitude && item.longitude)
      .map(item => ({
        ...item,
        distance: calculateDistance(userLat, userLng, Number(item.latitude), Number(item.longitude))
      }))
      .sort((a, b) => a.distance - b.distance);
  };

  // Ottieni i 3 ristoranti più vicini
  const nearestRestaurants = userLocation 
    ? sortByDistance(allRestaurants, userLocation.latitude, userLocation.longitude)
        .slice(0, 3)
        .map(({ distance, ...item }) => item)
    : allRestaurants.slice(0, 3);

  // Ottieni i 3 hotel più vicini  
  const nearestHotels = userLocation
    ? sortByDistance(allHotels, userLocation.latitude, userLocation.longitude)
        .slice(0, 3)
        .map(({ distance, ...item }) => item)
    : allHotels.slice(0, 3);


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
        }).map(restaurant => ({ ...restaurant, type: 'restaurant' as const })),
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
        }).map(hotel => ({ ...hotel, type: 'hotel' as const }))
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
    
    // Navigate based on item type
    if (item.type === 'hotel') {
      router.push({
        pathname: '/hotel/[id]',
        params: { id: item.id }
      });
    } else {
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
      await loadData(true); // Force refresh to bypass cache
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



  // Render functions for list items
  const renderGuideItem = ({ item, index }: { item: any, index: number }) => {
    const staggeredAnimations = createStaggeredAnimation(TransitionType.FADE_RIGHT, guides.length, 400, 120);
    return (
      <GuideCard
        item={item}
        onImageLoaded={handleImageLoaded}
        onImageError={handleImageError}
        animationProps={{
          entering: staggeredAnimations[index]
        }}
      />
    );
  };

  const renderRestaurantItem = ({ item, index }: { item: any, index: number }) => {
    const staggeredAnimations = createStaggeredAnimation(TransitionType.FADE_RIGHT, nearestRestaurants.length, 800, 120);
    return (
      <RestaurantCard
        item={item}
        onImageLoaded={handleImageLoaded}
        onImageError={handleImageError}
        animationProps={{
          entering: staggeredAnimations[index]
        }}
      />
    );
  };

  const renderHotelItem = ({ item, index }: { item: any, index: number }) => {
    const staggeredAnimations = createStaggeredAnimation(TransitionType.FADE_RIGHT, nearestHotels.length, 1200, 120);
    return (
      <HotelCard
        item={item}
        onImageLoaded={handleImageLoaded}
        onImageError={handleImageError}
        animationProps={{
          entering: staggeredAnimations[index]
        }}
      />
    );
  };


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="dark" />
      
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
        <SearchSection
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          showSearchResults={showSearchResults}
          onCloseResults={() => setShowSearchResults(false)}
          filteredResults={filteredResults}
          onSelectResult={handleSearchResultSelect}
        />
        
        {/* Small Map */}
        <View style={styles.mapContainer}>
          <RestaurantMapView
            restaurants={mapItems}
            height={width * 0.4}
            showLocationButton={true}
            onMarkerPress={(item) => {
              onTap();
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
                [{ text: 'Annulla', style: 'cancel' }, { text: 'Aggiorna', onPress: () => {} }]
              )
            }}
          />
        </View>
      </View>

      {/* Sezione Guide in Evidenza */}
      <ContentSection
        title="Scopri le ultime guide"
        linkText="Vedi tutte"
        linkHref="/(tabs)/guide"
        loading={loading}
        error={error ? "Errore nel caricamento delle guide" : null}
        allImagesLoaded={allImagesLoaded}
            data={guides}
        renderItem={renderGuideItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.articlesList}
        skeletonComponent="guide"
        emptyStateTitle="Nessuna guida disponibile al momento"
        animationProps={{
          entering: createStaggeredAnimation(TransitionType.FADE_UP, 1, 300)[0]
        }}
          />

      {/* Sezione Ristoranti in Evidenza */}
      <ContentSection
        title="Locali nelle Vicinanze"
        linkText="Vedi tutti"
        linkHref="/ristoranti"
        loading={loading}
        error={error ? "Errore nel caricamento dei ristoranti" : null}
        allImagesLoaded={allImagesLoaded}
            data={nearestRestaurants}
        renderItem={renderRestaurantItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.restaurantsList}
        skeletonComponent="restaurant"
        emptyStateTitle="Nessun ristorante disponibile al momento"
        animationProps={{
          entering: createStaggeredAnimation(TransitionType.FADE_UP, 1, 600)[0]
        }}
          />

      {/* Sezione Hotel e B&B Consigliati */}
      <ContentSection
        title="Hotel nelle Vicinanze"
        linkText="Vedi tutti"
        linkHref="/(tabs)/hotel"
        loading={loading}
        error={error ? "Errore nel caricamento degli hotel" : null}
        allImagesLoaded={allImagesLoaded}
            data={nearestHotels}
        renderItem={renderHotelItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.hotelsList}
        skeletonComponent="hotel"
        emptyStateTitle="Nessun hotel disponibile al momento"
        animationProps={{
          entering: createStaggeredAnimation(TransitionType.FADE_UP, 1, 900)[0]
        }}
          />
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
  mapContainer: {
    height: width * 0.4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  articlesList: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  restaurantsList: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  hotelsList: {
    paddingLeft: 16,
    paddingRight: 8,
  },
});
