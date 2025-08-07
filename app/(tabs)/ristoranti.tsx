import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Alert, Platform } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiClient } from "../../services/api";
import { CouponService } from "../../services/coupon.service";
import { RestaurantListCard } from '../../components/RestaurantListCard';
import { ListItem } from '../../components/ListCard';
import { FadeInDown } from 'react-native-reanimated';
import ListCardSkeleton from '../../components/ListCardSkeleton';
import { SkeletonVariant } from '../../components/skeleton/SkeletonCards';
import AdvancedFilters from '../../components/AdvancedFilters';
import { useHaptics } from "../../utils/haptics";
import { InlineLoading, FullScreenLoading } from "../../components/LoadingStates";
import { useEnhancedRefresh } from "../../hooks/useEnhancedRefresh";
import { MinimalRefreshIndicator } from "../../components/RefreshIndicator";
import { RestaurantMapView } from '../../components/MapView';
import { useLocation } from "../../hooks/useLocation";

interface Restaurant extends ListItem {
  description: string;
  rating: string | number;
  price_range: number;
  cuisine_type: string[];
  category_name: string;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface FilterOption {
  id: string;
  name: string;
  count?: number;
}

export default function RistorantiScreen() {
  const { colors } = useTheme();
  const { onTap } = useHaptics();
  const router = useRouter();
  const { category, hasOffers, couponType } = useLocalSearchParams<{ category?: string; hasOffers?: string; couponType?: string }>();
  const { location: userLocation, getCurrentLocation, calculateDistance } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tutti');
  const [selectedCity, setSelectedCity] = useState('Tutte');
  const [restaurants, setRestaurants] = useState<ListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState('Tutte');
  const [cuisineTypes, setCuisineTypes] = useState<FilterOption[]>([]);
  const [isMapView, setIsMapView] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(20); // Show 20 items initially
  const [restaurantsWithOffers, setRestaurantsWithOffers] = useState<string[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Funzione per caricare i ristoranti con offerte attive o per tipo specifico
  const loadRestaurantsWithOffers = async (specificCouponType?: string) => {
    try {
      setLoadingOffers(true);
      let result;
      
      if (specificCouponType) {
        // Carica coupon per tipo specifico
        result = await CouponService.getCouponsByType(specificCouponType);
      } else {
        // Carica tutti i coupon attivi (comportamento originale)
        result = await CouponService.getActiveCoupons();
      }
      
      const restaurantIds = [...new Set(result.coupons.map(coupon => coupon.restaurant_id))];
      setRestaurantsWithOffers(restaurantIds);
    } catch (error) {
      console.error('Error loading restaurants with offers:', error);
      setRestaurantsWithOffers([]);
    } finally {
      setLoadingOffers(false);
    }
  };

  // Effetto per gestire i parametri di categoria dalla navigazione
  useEffect(() => {
    if (category && categories.length > 0) {
      const handleCategoryFromParams = async () => {
        // Se è richiesto un filtro coupon specifico
        if (couponType) {
          const couponTypeMapping: { [key: string]: string } = {
            'up-to-50': 'Fino al 50%',
            '2-for-1': 'Prendi 2 Paghi 1',
            'special': 'Special',
            'promo': 'Promo',
            'free': 'Free'
          };
          
          setSelectedCategory(couponTypeMapping[couponType] || 'Offerte');
          await loadRestaurantsWithOffers(couponType);
          return;
        }

        // Se è richiesto il filtro offerte generiche (retrocompatibilità)
        if (hasOffers === 'true') {
          setSelectedCategory('Offerte');
          await loadRestaurantsWithOffers();
          return;
        }

        // Mappa le categorie dai filtri home alle categorie effettive (legacy)
        const categoryMapping: { [key: string]: string } = {
          'offerte': 'Offerte',
          'italiano': 'Cucina Italiana', 
          'mediterraneo': 'Cucina Mediterranea',
          'pizzeria': 'Pizzeria'
        };

        let targetCategory = categoryMapping[category] || category;
        
        // Cerca la categoria corrispondente nel database
        const matchedCategory = categories.find(cat => 
          cat.name.toLowerCase().includes(targetCategory.toLowerCase()) ||
          cat.name.toLowerCase().includes(category.toLowerCase())
        );

        if (matchedCategory) {
          setSelectedCategory(matchedCategory.name);
          await loadData(matchedCategory.id);
        } else {
          // Se non trova la categoria specifica, carica tutte e filtra per tipo di cucina
          setSelectedCategory('Tutti');
          if (category === 'italiano') {
            setSelectedCuisine('Italiana');
          } else if (category === 'mediterraneo') {
            setSelectedCuisine('Mediterranea');
          } else if (category === 'pizzeria') {
            setSelectedCuisine('Pizza');
          }
          await loadData();
        }
      };

      handleCategoryFromParams();
    }
  }, [category, hasOffers, couponType, categories.length]); // Aggiungiamo couponType alle dipendenze

  // Effetto per ottenere la posizione dell'utente al caricamento
  useEffect(() => {
    if (!userLocation) {
      getCurrentLocation();
    }
  }, []);

  const loadData = async (categoryId?: string) => {
    try {
      setLoading(true);
      
      // Load all restaurants with pagination
      let allRestaurants = [];
      let currentPage = 1;
      let hasMore = true;
      
      while (hasMore) {
        const restaurantsUrl = categoryId && categoryId !== 'all' 
          ? `/restaurants/?category_id=${categoryId}&page=${currentPage}&limit=100` 
          : `/restaurants/?page=${currentPage}&limit=100`;
          
        
        const restaurantsResponse = await apiClient.get<any>(restaurantsUrl);
        const pageData = Array.isArray(restaurantsResponse) ? restaurantsResponse : (restaurantsResponse?.restaurants || restaurantsResponse?.items || []);
        
        if (pageData.length === 0) {
          hasMore = false;
        } else {
          allRestaurants.push(...pageData);
          currentPage++;
          
          // Check if there are more pages
          if (restaurantsResponse?.has_more === false || pageData.length < 100) {
            hasMore = false;
          }
        }
        
        // Safety break to avoid infinite loops
        if (currentPage > 50) {
          // Stopped loading after 50 pages to prevent infinite loops
          hasMore = false;
        }
      }
      
      // Loaded restaurants successfully
      
      // Load categories separately
      const categoriesResponse = await apiClient.get<any>('/categories/');
      const categoriesData = Array.isArray(categoriesResponse) ? categoriesResponse : (categoriesResponse?.categories || categoriesResponse?.items || []);
      
      // Data loaded successfully
      // Transform data to match ListItem interface
      const transformedRestaurants = allRestaurants.map((restaurant: any) => ({
        id: restaurant.id,
        title: restaurant.name, // Use name as title for restaurants
        name: restaurant.name,
        featured_image: restaurant.featured_image,
        category: restaurant.category_name ? {
          id: restaurant.category_id || 'unknown',
          name: restaurant.category_name,
          color: colors.primary
        } : null,
        city: restaurant.city,
        province: restaurant.province,
        cuisine_type: restaurant.cuisine_type || [],
        rating: restaurant.rating,
        price_range: restaurant.price_range,
        latitude: restaurant.latitude,
        longitude: restaurant.longitude
      }));
      setRestaurants(transformedRestaurants);
      // Add "Tutti" category at the beginning
      const allCategories = [
        { id: 'all', name: 'Tutti', color: colors.primary },
        ...categoriesData
      ];
      setCategories(allCategories);

      // Extract unique cities and cuisine types from restaurants data
      const uniqueCities = [...new Set(allRestaurants.map((r: any) => r.city).filter(Boolean))].sort() as string[];
      const allCuisineTypes = allRestaurants.flatMap((r: any) => r.cuisine_type || []);
      const uniqueCuisineTypes = [...new Set(allCuisineTypes.filter(Boolean))].sort() as string[];

      setCities([
        { id: 'all', name: 'Tutte' },
        ...uniqueCities.map((city) => ({ id: city, name: city }))
      ]);

      setCuisineTypes([
        { id: 'all', name: 'Tutte' },
        ...uniqueCuisineTypes.map((cuisine) => ({ 
          id: cuisine, 
          name: cuisine.charAt(0).toUpperCase() + cuisine.slice(1).replace('-', ' ')
        }))
      ]);
    } catch (error) {
      // Error loading data
      Alert.alert('Errore', 'Impossibile caricare i ristoranti');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    const currentCategoryId = categories.find(cat => cat.name === selectedCategory)?.id;
    await loadData(currentCategoryId);
  };

  // Enhanced refresh hook
  const refreshState = useEnhancedRefresh({
    onRefresh: async () => {
      await handleRefresh();
    },
    threshold: 60, // Soglia ridotta per attivazione più facile
    hapticFeedback: true,
    showIndicator: true,
    refreshDuration: 800,
  });

  const handleCategorySelect = async (categoryName: string) => {
    setSelectedCategory(categoryName);
    setDisplayLimit(20); // Reset pagination
    const categoryId = categories.find(cat => cat.name === categoryName)?.id;
    await loadData(categoryId);
  };

  const handleCuisineSelect = (cuisineName: string) => {
    setSelectedCuisine(cuisineName);
    setDisplayLimit(20); // Reset pagination
  };

  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName);
    setDisplayLimit(20); // Reset pagination
  };

  const handleLocationRequest = () => {
    // Funzione per richiedere aggiornamento posizione
    Alert.alert(
      'Aggiorna Posizione',
      'Vuoi aggiornare la tua posizione per vedere i ristoranti più vicini?',
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Aggiorna', 
          onPress: () => {
            // La logica di aggiornamento è già gestita nell'hook useLocation del MapView
            // Location update requested
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
  
  // Determina se la categoria selezionata è un'offerta
  const isOfferCategory = ['Offerte', 'Fino al 50%', 'Prendi 2 Paghi 1', 'Special', 'Promo', 'Free'].includes(selectedCategory);

  // Filtro client-side per search query, città, tipo di cucina e offerte
  let filteredRestaurants = restaurants.filter(restaurant => {
    // Search query filter
    const matchesSearch = !searchQuery.trim() || (
      restaurant.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.province?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.category?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine_type?.some((cuisine: string) => cuisine?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // City filter
    const matchesCity = selectedCity === 'Tutte' || restaurant.city === selectedCity;

    // Cuisine type filter
    const matchesCuisine = selectedCuisine === 'Tutte' || 
      restaurant.cuisine_type?.some((cuisine: string) => {
        const formattedCuisine = cuisine.charAt(0).toUpperCase() + cuisine.slice(1).replace('-', ' ');
        return formattedCuisine === selectedCuisine;
      });

    // Offers filter - mostra solo ristoranti con coupon attivi del tipo specificato
    const matchesOffers = !isOfferCategory || restaurantsWithOffers.includes(restaurant.id);
    
    return matchesSearch && matchesCity && matchesCuisine && matchesOffers;
  });

  // Ordina per distanza se abbiamo la posizione dell'utente
  if (userLocation) {
    filteredRestaurants = sortByDistance(filteredRestaurants, userLocation.latitude, userLocation.longitude);
  }

  // Display restaurants with pagination
  const displayedRestaurants = filteredRestaurants.slice(0, displayLimit);
  const hasMoreRestaurants = filteredRestaurants.length > displayLimit;

  const loadMoreRestaurants = () => {
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
                placeholder="Cerca ristoranti, città, categorie..."
                placeholderTextColor={colors.text + '60'}
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  setDisplayLimit(20); // Reset pagination when searching
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
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
              cities={cities}
              selectedCity={selectedCity}
              onCitySelect={handleCitySelect}
              hotelTypes={cuisineTypes} // Tipi di cucina per i ristoranti
              selectedHotelType={selectedCuisine}
              onHotelTypeSelect={handleCuisineSelect}
              hotelTypesLabel="Tipo Cucina" // Etichetta personalizzata per ristoranti
              hotelTypesIcon="restaurant" // Icona appropriata per cucina
              onResetFilters={() => {
                setSelectedCity('Tutte');
                setSelectedCategory('Tutti');
                setSelectedCuisine('Tutte');
              }}
              colors={colors}
              showMapButton={true}
              isMapView={isMapView}
              onToggleMapView={() => setIsMapView(!isMapView)}
            />

            {/* Results Count */}
            <View style={styles.resultsCountSection}>
              <Text style={[styles.resultsText, { color: colors.text + '80' }]}> 
                {loadingOffers ? 'Caricamento offerte...' : 
                  `${displayedRestaurants.length} di ${filteredRestaurants.length} ristorante${filteredRestaurants.length === 1 ? '' : 'i'}${
                    isOfferCategory ? ` con ${selectedCategory.toLowerCase()}` : ''
                  }`
                }
              </Text>
            </View>
            
            {/* Indicatori Filtri Attivi */}
            {(selectedCity !== 'Tutte' || selectedCategory !== 'Tutti' || selectedCuisine !== 'Tutte') && (
              <View style={styles.activeFiltersSection}>
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
                  {selectedCategory && selectedCategory !== 'Tutti' && (
                    <View style={[styles.activeFilter, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.activeFilterText, { color: colors.primary }]}>{selectedCategory}</Text>
                      <TouchableOpacity onPress={() => {
                        onTap();
                        setSelectedCategory('Tutti');
                      }}>
                        <MaterialIcons name="close" size={14} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  )}
                  {selectedCuisine && selectedCuisine !== 'Tutte' && (
                    <View style={[styles.activeFilter, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.activeFilterText, { color: colors.primary }]}>{selectedCuisine}</Text>
                      <TouchableOpacity onPress={() => {
                        onTap();
                        setSelectedCuisine('Tutte');
                      }}>
                        <MaterialIcons name="close" size={14} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            )}

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
                  backgroundColor: Platform.OS === 'android' 
                    ? colors.primary + '20' 
                    : colors.primary + '10',
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
              restaurants={displayedRestaurants}
              onMarkerPress={(restaurant) => {
                onTap();
                router.push(`/ristoranti/${restaurant.id}`);
              }}
              onLocationRequest={handleLocationRequest}
            />
          </View>
        ) : (
          /* Lista Ristoranti */
          <FlatList
            data={displayedRestaurants}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            onScroll={refreshState.onScroll}
            onScrollEndDrag={refreshState.onScrollEndDrag}
            scrollEventThrottle={16}
            ListEmptyComponent={
              loading || loadingOffers ? (
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
                  <FontAwesome 
                    name={isOfferCategory ? 'ticket' : 'search'} 
                    size={48} 
                    color={colors.text + '40'} 
                  />
                  <Text style={[styles.emptyText, { color: colors.text + '60' }]}> 
                    {isOfferCategory ? `Nessun ristorante con ${selectedCategory.toLowerCase()} al momento` :
                     searchQuery ? 'Nessun ristorante trovato' : 'Nessun ristorante disponibile'}
                  </Text>
                  {searchQuery && (
                    <Text style={[styles.emptySubtext, { color: colors.text + '40' }]}> 
                      Prova a modificare i criteri di ricerca
                    </Text>
                  )}
                  {isOfferCategory && (
                    <Text style={[styles.emptySubtext, { color: colors.text + '40' }]}> 
                      Al momento non ci sono coupon di questo tipo
                    </Text>
                  )}
                </View>
              )
            }
            renderItem={({ item: restaurant, index }) => (
              <RestaurantListCard
                item={restaurant}
          
                onPress={() => {
                  onTap();
                  // Navigazione al dettaglio del ristorante
                  router.push(`/ristoranti/${restaurant.id}`);
                }}
         
              />
            )}
            ListFooterComponent={
              hasMoreRestaurants ? (
                <View style={styles.loadMoreContainer}>
                  <TouchableOpacity
                    style={[styles.loadMoreButton, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      onTap();
                      loadMoreRestaurants();
                    }}
                  >
                    <Text style={styles.loadMoreText}>
                      Carica altri {Math.min(20, filteredRestaurants.length - displayLimit)} ristoranti
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.endOfListContainer}>
                  <Text style={[styles.endOfListText, { color: colors.text + '60' }]}>
                    {filteredRestaurants.length > 0 ? 'Hai visto tutti i ristoranti!' : ''}
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

// Aggiorno gli stili per essere identici a guide.tsx
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
  resultsCountSection: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  activeFiltersSection: {
    marginHorizontal: 16,
    marginBottom: 8,
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
}); 