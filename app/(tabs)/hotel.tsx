import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Alert } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useRouter } from "expo-router";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiClient } from "../../services/api";
import ListCard from '../../components/ListCard';
import { ListItem } from '../../components/ListCard';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ListCardSkeleton from '../../components/ListCardSkeleton';
import { SkeletonVariant } from '../../components/skeleton/SkeletonCards';
import AdvancedFilters from '../../components/AdvancedFilters';
import { useHaptics } from "../../utils/haptics";
import { InlineLoading, FullScreenLoading } from "../../components/LoadingStates";
import { useEnhancedRefresh } from "../../hooks/useEnhancedRefresh";
import { MinimalRefreshIndicator } from "../../components/RefreshIndicator";
import { RestaurantMapView } from '../../components/MapView';
import { useLocation } from "../../hooks/useLocation";

interface Hotel extends ListItem {
  description: string;
  rating: string | number;
  price_range: number;
  hotel_type: string[];
  star_rating?: number;
  category_name: string;
  category_id: string;
}


interface FilterOption {
  id: string;
  name: string;
  count?: number;
}

export default function HotelScreen() {
  const { colors } = useTheme();
  const { onTap } = useHaptics();
  const router = useRouter();
  const { location: userLocation, getCurrentLocation, calculateDistance } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Tutte');
  const [selectedHotelType, setSelectedHotelType] = useState('Tutti');
  const [selectedStarRating, setSelectedStarRating] = useState('Tutte');
  const [hotels, setHotels] = useState<ListItem[]>([]);
  const [cities, setCities] = useState<FilterOption[]>([]);
  const [hotelTypes, setHotelTypes] = useState<FilterOption[]>([]);
  const [starRatings, setStarRatings] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [isMapView, setIsMapView] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(20);

  useEffect(() => {
    loadData();
  }, []);

  // Effetto per ottenere la posizione dell'utente al caricamento
  useEffect(() => {
    if (!userLocation) {
      getCurrentLocation();
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load all hotels with pagination
      let allHotels = [];
      console.log('🔄 Loading all hotels with pagination...');
      let currentPage = 1;
      let hasMore = true;
      
      while (hasMore) {
        const hotelsUrl = `/hotels/?page=${currentPage}&limit=100`;
          
        console.log(`📄 Loading page ${currentPage}...`);
        
        const hotelsResponse = await apiClient.get<any>(hotelsUrl);
        const pageData = Array.isArray(hotelsResponse) ? hotelsResponse : (hotelsResponse?.data || hotelsResponse?.hotels || hotelsResponse?.items || []);
        
        if (pageData.length === 0) {
          hasMore = false;
        } else {
          allHotels.push(...pageData);
          currentPage++;
          
          // Check if there are more pages
          if (hotelsResponse?.has_more === false || pageData.length < 100) {
            hasMore = false;
          }
        }
        
        // Safety break to avoid infinite loops
        if (currentPage > 50) {
          console.warn('⚠️ Stopped loading after 50 pages');
          hasMore = false;
        }
      }
      
      console.log(`✅ Loaded ${allHotels.length} hotels across ${currentPage - 1} pages`);
      
      // Debug logging
      console.log('🏨 Final Data:', {
        totalHotels: allHotels.length
      });

      // Transform data to match ListItem interface
      const transformedHotels = allHotels.map((hotel: any) => ({
        id: hotel.id,
        title: hotel.name,
        name: hotel.name,
        featured_image: hotel.featured_image,
        category: hotel.category_name ? {
          id: hotel.category_id || 'unknown',
          name: hotel.category_name,
          color: colors.primary
        } : null,
        city: hotel.city,
        province: hotel.province,
        hotel_type: hotel.hotel_type || [],
        star_rating: hotel.star_rating,
        rating: hotel.rating,
        price_range: hotel.price_range,
        latitude: hotel.latitude,
        longitude: hotel.longitude
      }));
      setHotels(transformedHotels);

      // Extract unique cities, hotel types, and star ratings from hotels data
      const uniqueCities = [...new Set(allHotels.map((h: any) => h.city).filter(Boolean))].sort() as string[];
      const allHotelTypes = allHotels.flatMap((h: any) => h.hotel_type || []);
      const uniqueHotelTypes = [...new Set(allHotelTypes.filter(Boolean))].sort() as string[];
      const uniqueStarRatings = [...new Set(allHotels.map((h: any) => h.star_rating).filter(Boolean))].sort((a, b) => b - a) as number[];

      setCities([
        { id: 'all', name: 'Tutte' },
        ...uniqueCities.map((city) => ({ id: city, name: city }))
      ]);

      setHotelTypes([
        { id: 'all', name: 'Tutti' },
        ...uniqueHotelTypes.map((type) => ({ 
          id: type, 
          name: type.charAt(0).toUpperCase() + type.slice(1).replace('&', ' & ')
        }))
      ]);

      setStarRatings([
        { id: 'all', name: 'Tutte' },
        ...uniqueStarRatings.map((rating) => ({ 
          id: rating.toString(), 
          name: `${rating} stelle`
        }))
      ]);

    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Errore', 'Impossibile caricare gli hotel');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadData();
  };

  // Enhanced refresh hook
  const refreshState = useEnhancedRefresh({
    onRefresh: async () => {
      console.log('🔄 Refreshing hotels...');
      await handleRefresh();
      console.log('✅ Hotels refreshed');
    },
    threshold: 60,
    hapticFeedback: true,
    showIndicator: true,
    refreshDuration: 800,
  });


  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName);
    setDisplayLimit(20); // Reset pagination
  };

  const handleHotelTypeSelect = (typeName: string) => {
    setSelectedHotelType(typeName);
    setDisplayLimit(20); // Reset pagination
  };

  const handleStarRatingSelect = (rating: string) => {
    setSelectedStarRating(rating);
    setDisplayLimit(20); // Reset pagination
  };

  const handleLocationRequest = () => {
    Alert.alert(
      'Aggiorna Posizione',
      'Vuoi aggiornare la tua posizione per vedere gli hotel più vicini?',
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Aggiorna', 
          onPress: () => {
            console.log('Richiesta aggiornamento posizione');
          }
        }
      ]
    );
  };

  // Funzione per ordinare per distanza
  const sortByDistance = (items: ListItem[], userLat: number, userLng: number) => {
    return items
      .filter(item => item.latitude && item.longitude)
      .map(item => ({
        ...item,
        distance: calculateDistance(userLat, userLng, Number(item.latitude), Number(item.longitude))
      }))
      .sort((a, b) => a.distance - b.distance)
      .map(({ distance, ...item }) => item as ListItem);
  };

  // Client-side filter for search query, city, hotel type, and star rating
  let filteredHotels = hotels.filter(hotel => {
    // Search query filter
    const matchesSearch = !searchQuery.trim() || (
      hotel.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.province?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.category?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.hotel_type?.some((type: string) => type?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // City filter
    const matchesCity = selectedCity === 'Tutte' || hotel.city === selectedCity;

    // Hotel type filter
    const matchesHotelType = selectedHotelType === 'Tutti' || 
      hotel.hotel_type?.some((type: string) => {
        const formattedType = type.charAt(0).toUpperCase() + type.slice(1).replace('&', ' & ');
        return formattedType === selectedHotelType;
      });

    // Star rating filter
    const matchesStarRating = selectedStarRating === 'Tutte' || 
      hotel.star_rating?.toString() === selectedStarRating.replace(' stelle', '');
    
    return matchesSearch && matchesCity && matchesHotelType && matchesStarRating;
  });

  // Ordina per distanza se abbiamo la posizione dell'utente
  if (userLocation) {
    console.log('🏨 Ordinamento hotel per distanza dalla posizione:', userLocation);
    filteredHotels = sortByDistance(filteredHotels, userLocation.latitude, userLocation.longitude);
    console.log('🏨 Primi 3 hotel ordinati:', filteredHotels.slice(0, 3).map(h => ({
      name: h.title,
      city: h.city,
      coords: `${h.latitude},${h.longitude}`
    })));
  }

  // Display hotels with pagination
  const displayedHotels = filteredHotels.slice(0, displayLimit);
  const hasMoreHotels = filteredHotels.length > displayLimit;

  const loadMoreHotels = () => {
    setDisplayLimit(prev => prev + 20);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Search Bar e Filtri - Solo in vista lista */}
        {!isMapView && (
          <>
            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
              <FontAwesome name="search" size={16} color={colors.text + '60'} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Cerca hotel, città, tipologie..."
                placeholderTextColor={colors.text + '60'}
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  setDisplayLimit(20);
                }}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => {
                  onTap();
                  setSearchQuery('');
                }}>
                  <FontAwesome name="times" size={16} color={colors.text + '60'} />
                </TouchableOpacity>
              )}
            </View>

            {/* Filtri */}
            <AdvancedFilters
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              categories={[]} // NON mostrare "Categorie" negli hotel
              selectedCategory={''}
              onCategorySelect={() => {}}
              cities={cities}
              selectedCity={selectedCity}
              onCitySelect={handleCitySelect}
              hotelTypes={hotelTypes}
              selectedHotelType={selectedHotelType}
              onHotelTypeSelect={handleHotelTypeSelect}
              hotelTypesLabel="Tipo Struttura" // Etichetta per hotel
              hotelTypesIcon="hotel" // Icona appropriata per hotel
              starRatings={starRatings}
              selectedStarRating={selectedStarRating}
              onStarRatingSelect={handleStarRatingSelect}
              onResetFilters={() => {
                setSelectedCity('Tutte');
                setSelectedHotelType('Tutti');
                setSelectedStarRating('Tutte');
              }}
              colors={colors}
              showMapButton={true}
              isMapView={isMapView}
              onToggleMapView={() => setIsMapView(!isMapView)}
            />


            {/* Results Count e Filtri Attivi */}
            <View style={styles.resultsSection}>
              <Text style={[styles.resultsText, { color: colors.text + '80' }]}> 
                {displayedHotels.length} di {filteredHotels.length} hotel
              </Text>
              
              {/* Indicatori Filtri Attivi */}
              <View style={styles.activeFiltersContainer}>
                {selectedCity && selectedCity !== 'Tutte' && (
                  <View style={[styles.activeFilter, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.activeFilterText, { color: colors.primary }]}>{selectedCity}</Text>
                    <TouchableOpacity onPress={() => {
                      onTap();
                      setSelectedCity('Tutte');
                    }}>
                      <MaterialIcons name="close" size={14} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                )}
                {selectedHotelType && selectedHotelType !== 'Tutti' && (
                  <View style={[styles.activeFilter, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.activeFilterText, { color: colors.primary }]}>{selectedHotelType}</Text>
                    <TouchableOpacity onPress={() => {
                      onTap();
                      setSelectedHotelType('Tutti');
                    }}>
                      <MaterialIcons name="close" size={14} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                )}
                {selectedStarRating && selectedStarRating !== 'Tutte' && (
                  <View style={[styles.activeFilter, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.activeFilterText, { color: colors.primary }]}>{selectedStarRating}</Text>
                    <TouchableOpacity onPress={() => {
                      onTap();
                      setSelectedStarRating('Tutte');
                    }}>
                      <MaterialIcons name="close" size={14} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {/* Enhanced Refresh Indicator */}
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
          </>
        )}

        {/* Vista Mappa o Lista */}
        {isMapView ? (
          <View style={styles.mapContainer}>
            {/* Header mappa con controlli */}
            <View style={[styles.mapHeader, { backgroundColor: colors.card }]}>
              <TouchableOpacity
                style={[styles.mapControlButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  onTap();
                  setIsMapView(false);
                }}
              >
                <MaterialIcons name="list" size={20} color="white" />
                <Text style={styles.mapControlText}>Lista</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.mapControlButton, { 
                  backgroundColor: colors.primary + '10',
                  borderColor: colors.primary,
                  borderWidth: 1
                }]}
                onPress={() => {
                  onTap();
                  setIsMapView(false);
                  setShowFilters(true);
                }}
              >
                <MaterialIcons name="filter-list" size={20} color={colors.primary} />
                <Text style={[styles.mapControlText, { color: colors.primary }]}>Filtri</Text>
              </TouchableOpacity>
            </View>

            <RestaurantMapView
              restaurants={displayedHotels}
              onMarkerPress={(hotel) => {
                onTap();
                router.push(`/hotel/${hotel.id}`);
              }}
              onLocationRequest={handleLocationRequest}
            />
          </View>
        ) : (
          /* Lista Hotel */
          <FlatList
            data={displayedHotels}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            onScroll={refreshState.onScroll}
            onScrollEndDrag={refreshState.onScrollEndDrag}
            scrollEventThrottle={16}
            ListEmptyComponent={
              loading ? (
                <View style={styles.listContainer}>
                  {[1, 2, 3].map((_, index) => (
                    <ListCardSkeleton 
                      key={`skeleton-${index}`} 
                      variant={SkeletonVariant.SHIMMER}
                      showRating={true}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.centerContainer}>
                  <FontAwesome name="hotel" size={48} color={colors.text + '40'} />
                  <Text style={[styles.emptyText, { color: colors.text + '60' }]}> 
                    {searchQuery ? 'Nessun hotel trovato' : 'Nessun hotel disponibile'}
                  </Text>
                  {searchQuery && (
                    <Text style={[styles.emptySubtext, { color: colors.text + '40' }]}> 
                      Prova a modificare i criteri di ricerca
                    </Text>
                  )}
                </View>
              )
            }
            renderItem={({ item: hotel, index }) => (
              <ListCard
                item={hotel}
                delay={index * 100}
                enableSwipe={false}
                onPress={() => {
                  onTap();
                  router.push(`/hotel/${hotel.id}`);
                }}
              />
            )}
            ListFooterComponent={
              hasMoreHotels ? (
                <View style={styles.loadMoreContainer}>
                  <TouchableOpacity
                    style={[styles.loadMoreButton, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      onTap();
                      loadMoreHotels();
                    }}
                  >
                    <Text style={styles.loadMoreText}>
                      Carica altri {Math.min(20, filteredHotels.length - displayLimit)} hotel
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.endOfListContainer}>
                  <Text style={[styles.endOfListText, { color: colors.text + '60' }]}>
                    {filteredHotels.length > 0 ? 'Hai visto tutti gli hotel!' : ''}
                  </Text>
                </View>
              )
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// Stili identici a ristoranti.tsx per consistenza
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filtersSection: {
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  additionalFiltersContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  filterToggleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  filterBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  filterToggleText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  expandedFilters: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  filterRow: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  filterButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  resetContainer: {
    alignItems: 'center',
    paddingTop: 8,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  resetFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  resetFiltersText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  resultsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1,
    justifyContent: 'flex-end',
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 6,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeFilterText: {
    fontSize: 11,
    fontWeight: '600',
    marginRight: 6,
  },
  resultsText: {
    fontSize: 14,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  mapContainer: {
    flex: 1,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    gap: 12,
  },
  mapControlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapControlText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  loadMoreContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadMoreButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadMoreText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  endOfListContainer: {
    padding: 20,
    alignItems: 'center',
  },
  endOfListText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});