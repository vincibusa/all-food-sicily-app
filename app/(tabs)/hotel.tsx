import React, { useState, useEffect, useMemo, useCallback } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Alert, Platform, Dimensions } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useRouter } from "expo-router";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { hotelService } from "../../services/hotel.service";
import { HotelListCard } from '../../components/HotelListCard';
import { ListItem } from '../../components/ListCard';
import ListCardSkeleton from '../../components/ListCardSkeleton';
import { SkeletonVariant } from '../../components/skeleton/SkeletonCards';
import AdvancedFilters from '../../components/AdvancedFilters';
import { useHaptics } from "../../utils/haptics";
import { InlineLoading, FullScreenLoading } from "../../components/LoadingStates";
import { useEnhancedRefresh } from "../../hooks/useEnhancedRefresh";
import { MinimalRefreshIndicator } from "../../components/RefreshIndicator";
import { RestaurantMapView } from '../../components/MapView';
import { useLocation } from "../../hooks/useLocation";
import { SearchSection } from '../../components/Home';
import { useDesignTokens } from '../../hooks/useDesignTokens';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

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
  const tokens = useDesignTokens();
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
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError(null);
      
      // Use hotelService directly instead of apiClient
      const allHotels = await hotelService.getAllHotels();

      // Transform data to match ListItem interface
      const transformedHotels = allHotels.map((hotel: any) => ({
        id: hotel.id,
        title: hotel.name,
        name: hotel.name,
        featured_image: hotel.featured_image,
        category: hotel.category ? {
          id: hotel.category.id,
          name: hotel.category.name,
          color: hotel.category.color || colors.primary
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
      console.error('Error loading hotels:', error);
      setError('Impossibile caricare gli hotel. Verifica la connessione internet e riprova.');
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
      await handleRefresh();
    },
    threshold: 60,
    hapticFeedback: true,
    showIndicator: true,
    refreshDuration: 800,
  });


  const handleCitySelect = useCallback((cityName: string) => {
    setSelectedCity(cityName);
    setDisplayLimit(20); // Reset pagination
  }, []);

  const handleHotelTypeSelect = useCallback((typeName: string) => {
    setSelectedHotelType(typeName);
    setDisplayLimit(20); // Reset pagination
  }, []);

  const handleStarRatingSelect = useCallback((rating: string) => {
    setSelectedStarRating(rating);
    setDisplayLimit(20); // Reset pagination
  }, []);

  const handleLocationRequest = () => {
    Alert.alert(
      'Aggiorna Posizione',
      'Vuoi aggiornare la tua posizione per vedere gli hotel più vicini?',
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Aggiorna', 
          onPress: () => {
            // Location update requested
          }
        }
      ]
    );
  };

  // Funzione per ordinare per distanza - memoized
  const sortByDistance = useCallback((items: ListItem[], userLat: number, userLng: number) => {
    return items
      .filter(item => item.latitude && item.longitude)
      .map(item => ({
        ...item,
        distance: calculateDistance(userLat, userLng, Number(item.latitude), Number(item.longitude))
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [calculateDistance]);

  // Client-side filter for search query, city, hotel type, and star rating - memoized
  const filteredHotels = useMemo(() => {
    let filtered = hotels.filter(hotel => {
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
      filtered = sortByDistance(filtered, userLocation.latitude, userLocation.longitude);
    }

    return filtered;
  }, [hotels, searchQuery, selectedCity, selectedHotelType, selectedStarRating, userLocation, sortByDistance]);

  // Display hotels with pagination
  const displayedHotels = filteredHotels.slice(0, displayLimit);
  const hasMoreHotels = filteredHotels.length > displayLimit;

  const loadMoreHotels = useCallback(() => {
    setDisplayLimit(prev => prev + 20);
  }, []);

  // Handle search input changes
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    setShowSearchResults(text.trim().length > 0);
    setDisplayLimit(20); // Reset pagination when searching
  }, []);

  // Create search results for SearchSection dropdown - memoized
  const searchResults = useMemo(() => {
    return searchQuery.trim().length > 0 
      ? hotels.filter(hotel => {
          if (!hotel) return false;
          const query = searchQuery.toLowerCase();
          return (
            (hotel.title && hotel.title.toLowerCase().includes(query)) ||
            (hotel.city && hotel.city.toLowerCase().includes(query)) ||
            (hotel.province && hotel.province.toLowerCase().includes(query)) ||
            (hotel.hotel_type && hotel.hotel_type.some(type => type.toLowerCase().includes(query)))
          );
        }).slice(0, 5).map(hotel => ({
          ...hotel,
          name: hotel.title || hotel.name,
          type: 'hotel' as const
        }))
      : [];
  }, [searchQuery, hotels]);

  // Handle search result selection
  const handleSearchResultSelect = useCallback((item: any) => {
    if (!item.id || !item.name) return;
    
    setSearchQuery(item.name);
    setShowSearchResults(false);
    
    // Navigate to hotel detail
    router.push(`/hotel/${item.id}`);
  }, [router]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Search Bar e Filtri - Solo in vista lista */}
        {!isMapView && (
          <>
            {/* Enhanced Search Section */}
            <View style={styles.searchSection}>
              <SearchSection
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                showSearchResults={showSearchResults}
                onCloseResults={() => setShowSearchResults(false)}
                filteredResults={searchResults}
                onSelectResult={handleSearchResultSelect}
                loading={loading}
              />
            </View>

            {/* Error Banner */}
            {error && (
              <View style={[
                styles.errorBanner, 
                { 
                  backgroundColor: tokens.colors.semantic.error.background,
                  borderColor: tokens.colors.semantic.error.light 
                },
                tokens.helpers.cardShadow('low')
              ]}>
                <MaterialIcons name="error-outline" size={20} color={tokens.colors.semantic.error.light} />
                <Text style={[styles.errorText, { color: tokens.colors.semantic.error.light }]}>{error}</Text>
                <TouchableOpacity 
                  onPress={() => {
                    onTap();
                    setError(null);
                    loadData();
                  }}
                  style={[
                    styles.retryButton,
                    tokens.helpers.buttonStyles('tertiary', 'small')
                  ]}
                  accessibilityLabel="Riprova a caricare"
                  accessibilityHint="Tocca per riprovare a caricare gli hotel"
                  accessibilityRole="button"
                >
                  <Text style={[styles.retryText, { color: tokens.colors.semantic.error.light }]}>Riprova</Text>
                </TouchableOpacity>
              </View>
            )}

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


            {/* Results Count */}
            <View style={styles.resultsCountSection}>
              <Text style={[styles.resultsText, { color: colors.text + '80' }]}> 
                {displayedHotels.length} di {filteredHotels.length} hotel
              </Text>
            </View>
            
            {/* Indicatori Filtri Attivi */}
            {(selectedCity !== 'Tutte' || selectedHotelType !== 'Tutti' || selectedStarRating !== 'Tutte') && (
              <View style={styles.activeFiltersSection}>
                <View style={styles.activeFiltersContainer}>
                  {selectedCity && selectedCity !== 'Tutte' && (
                    <View style={[
                      styles.activeFilter, 
                      { backgroundColor: colors.primary + '20' },
                      { borderRadius: tokens.radius.small }
                    ]}>
                      <Text style={[styles.activeFilterText, { color: colors.primary }]}>{selectedCity}</Text>
                      <TouchableOpacity 
                        onPress={() => {
                          onTap();
                          setSelectedCity('Tutte');
                        }}
                        accessibilityLabel={`Rimuovi filtro città ${selectedCity}`}
                        accessibilityHint="Tocca per rimuovere il filtro città applicato"
                        accessibilityRole="button"
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={[
                          styles.closeButton,
                          tokens.helpers.touchTarget('minimum')
                        ]}
                      >
                        <MaterialIcons name="close" size={16} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  )}
                  {selectedHotelType && selectedHotelType !== 'Tutti' && (
                    <View style={[
                      styles.activeFilter, 
                      { backgroundColor: colors.primary + '20' },
                      { borderRadius: tokens.radius.small }
                    ]}>
                      <Text style={[styles.activeFilterText, { color: colors.primary }]}>{selectedHotelType}</Text>
                      <TouchableOpacity 
                        onPress={() => {
                          onTap();
                          setSelectedHotelType('Tutti');
                        }}
                        accessibilityLabel={`Rimuovi filtro tipo hotel ${selectedHotelType}`}
                        accessibilityHint="Tocca per rimuovere il filtro tipo hotel applicato"
                        accessibilityRole="button"
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={[
                          styles.closeButton,
                          tokens.helpers.touchTarget('minimum')
                        ]}
                      >
                        <MaterialIcons name="close" size={16} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  )}
                  {selectedStarRating && selectedStarRating !== 'Tutte' && (
                    <View style={[
                      styles.activeFilter, 
                      { backgroundColor: colors.primary + '20' },
                      { borderRadius: tokens.radius.small }
                    ]}>
                      <Text style={[styles.activeFilterText, { color: colors.primary }]}>{selectedStarRating}</Text>
                      <TouchableOpacity 
                        onPress={() => {
                          onTap();
                          setSelectedStarRating('Tutte');
                        }}
                        accessibilityLabel={`Rimuovi filtro stelle ${selectedStarRating}`}
                        accessibilityHint="Tocca per rimuovere il filtro stelle applicato"
                        accessibilityRole="button"
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={[
                          styles.closeButton,
                          tokens.helpers.touchTarget('minimum')
                        ]}
                      >
                        <MaterialIcons name="close" size={16} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            )}

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
                style={[
                  styles.mapControlButton, 
                  { backgroundColor: colors.primary },
                  tokens.helpers.buttonStyles('primary', 'medium'),
                  tokens.helpers.touchTarget('recommended')
                ]}
                onPress={() => {
                  onTap();
                  setIsMapView(false);
                }}
                accessibilityLabel="Torna alla vista lista hotel"
                accessibilityHint="Tocca per tornare alla visualizzazione a lista degli hotel"
                accessibilityRole="button"
              >
                <MaterialIcons name="list" size={20} color="white" />
                <Text style={styles.mapControlText}>Lista</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.mapControlButton, 
                  { 
                    backgroundColor: Platform.OS === 'android' 
                      ? colors.primary + '20' 
                      : colors.primary + '10',
                    borderColor: colors.primary,
                    borderWidth: 1
                  },
                  tokens.helpers.buttonStyles('secondary', 'medium'),
                  tokens.helpers.touchTarget('recommended')
                ]}
                onPress={() => {
                  onTap();
                  setIsMapView(false);
                  setShowFilters(true);
                }}
                accessibilityLabel="Apri filtri hotel"
                accessibilityHint="Tocca per aprire i filtri e tornare alla vista lista"
                accessibilityRole="button"
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
            numColumns={isTablet ? 2 : 1}
            key={isTablet ? 'tablet' : 'phone'} // Force re-render when orientation changes
            contentContainerStyle={styles.listContainer}
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            onScroll={refreshState.onScroll}
            onScrollEndDrag={refreshState.onScrollEndDrag}
            scrollEventThrottle={16}
            columnWrapperStyle={isTablet ? styles.tabletRow : undefined}
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
              <View style={isTablet ? styles.tabletCardContainer : undefined}>
                <HotelListCard
                  item={hotel}
                  onPress={() => {
                    onTap();
                    router.push(`/hotel/${hotel.id}`);
                  }}
                />
              </View>
            )}
            ListFooterComponent={
              hasMoreHotels ? (
                <View style={styles.loadMoreContainer}>
                  <TouchableOpacity
                    style={[
                      styles.loadMoreButton, 
                      { backgroundColor: colors.primary },
                      tokens.helpers.buttonStyles('primary', 'medium'),
                      tokens.helpers.cardShadow('medium')
                    ]}
                    onPress={() => {
                      onTap();
                      loadMoreHotels();
                    }}
                    accessibilityLabel={`Carica altri ${Math.min(20, filteredHotels.length - displayLimit)} hotel`}
                    accessibilityHint="Tocca per caricare più risultati hotel nella lista"
                    accessibilityRole="button"
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
  searchSection: {
    paddingHorizontal: isTablet ? 32 : 16,
    paddingTop: 16,
    paddingBottom: 8,
    maxWidth: isTablet ? 800 : '100%',
    alignSelf: 'center',
    width: '100%',
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
  resultsCountSection: {
    marginHorizontal: isTablet ? 32 : 16,
    marginBottom: 8,
    maxWidth: isTablet ? 800 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  activeFiltersSection: {
    marginHorizontal: isTablet ? 32 : 16,
    marginBottom: 8,
    maxWidth: isTablet ? 800 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
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
  closeButton: {
    padding: 4,
    minWidth: 24,
    minHeight: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  errorText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  retryButton: {
    marginLeft: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultsText: {
    fontSize: 14,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  listContainer: {
    paddingHorizontal: isTablet ? 32 : 16,
    paddingTop: 16,
    maxWidth: isTablet ? 1200 : '100%',
    alignSelf: 'center',
    width: '100%',
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
    backgroundColor: 'transparent',
    borderWidth: 0,
    minHeight: 40,
    // Rimuoviamo le ombre condizionali per ora
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
  // Tablet-specific styles
  tabletRow: {
    justifyContent: 'space-between',
    paddingHorizontal: isTablet ? 8 : 0,
  },
  tabletCardContainer: {
    flex: 1,
    marginHorizontal: 8,
    maxWidth: isTablet ? (screenWidth - 96) / 2 : '100%', // Account for padding and margins
  },
});