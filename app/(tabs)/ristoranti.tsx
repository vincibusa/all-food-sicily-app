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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (categoryId?: string) => {
    try {
      setLoading(true);
      // Use API-based filtering when a specific category is selected
      const restaurantsUrl = categoryId && categoryId !== 'all' 
        ? `/restaurants/?category_id=${categoryId}` 
        : '/restaurants/';
      const [restaurantsResponse, categoriesResponse] = await Promise.all([
        apiClient.get<any>(restaurantsUrl),
        apiClient.get<any>('/categories/')
      ]);
      const restaurantsData = Array.isArray(restaurantsResponse) ? restaurantsResponse : (restaurantsResponse?.restaurants || restaurantsResponse?.items || []);
      const categoriesData = Array.isArray(categoriesResponse) ? categoriesResponse : (categoriesResponse?.categories || categoriesResponse?.items || []);
      // Transform data to match ListItem interface
      const transformedRestaurants = restaurantsData.map((restaurant: any) => ({
        id: restaurant.id,
        title: restaurant.name, // Use name as title for restaurants
        name: restaurant.name,
        featured_image: restaurant.featured_image,
        category: restaurant.category_name ? {
          id: restaurant.category_id || 'unknown',
          name: restaurant.category_name,
          color: categoriesData.find((cat: any) => cat.id === restaurant.category_id)?.color || colors.primary
        } : null,
        city: restaurant.city,
        province: restaurant.province,
        cuisine_type: restaurant.cuisine_type || [],
        rating: restaurant.rating,
        price_range: restaurant.price_range
      }));
      setRestaurants(transformedRestaurants);
      // Add "Tutti" category at the beginning
      const allCategories = [
        { id: 'all', name: 'Tutti', color: colors.primary },
        ...categoriesData
      ];
      setCategories(allCategories);

      // Extract unique cities and cuisine types from restaurants data
      const uniqueCities = [...new Set(restaurantsData.map((r: any) => r.city).filter(Boolean))].sort() as string[];
      const allCuisineTypes = restaurantsData.flatMap((r: any) => r.cuisine_type || []);
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
      console.error('Error loading data:', error);
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
      console.log('🔄 Refreshing restaurants...');
      await handleRefresh();
      console.log('✅ Restaurants refreshed');
    },
    threshold: 60, // Soglia ridotta per attivazione più facile
    hapticFeedback: true,
    showIndicator: true,
    refreshDuration: 800,
  });

  const handleCategorySelect = async (categoryName: string) => {
    setSelectedCategory(categoryName);
    const categoryId = categories.find(cat => cat.name === categoryName)?.id;
    await loadData(categoryId);
  };

  const handleCuisineSelect = (cuisineName: string) => {
    setSelectedCuisine(cuisineName);
  };

  
  // Filtro client-side per search query, città e tipo di cucina
  const filteredRestaurants = restaurants.filter(restaurant => {
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
    
    return matchesSearch && matchesCity && matchesCuisine;
  });


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <FontAwesome name="search" size={16} color={colors.text + '60'} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Cerca ristoranti, città, categorie..."
            placeholderTextColor={colors.text + '60'}
            value={searchQuery}
            onChangeText={setSearchQuery}
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
          onCitySelect={setSelectedCity}
          onResetFilters={() => {
            setSelectedCity('Tutte');
            setSelectedCategory('Tutti');
          }}
          colors={colors}
        />

        {/* Results Count e Filtri Attivi */}
        <View style={styles.resultsSection}>
          <Text style={[styles.resultsText, { color: colors.text + '80' }]}> 
            {filteredRestaurants.length} ristorante{filteredRestaurants.length === 1 ? '' : 'i'} trovato{filteredRestaurants.length === 1 ? '' : 'i'}
          </Text>
          
          {/* Indicatori Filtri Attivi */}
          <View style={styles.activeFiltersContainer}>
            {selectedCity !== 'Tutte' && (
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
            {selectedCategory !== 'Tutti' && (
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
          </View>
        </View>

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

        {/* Lista Ristoranti */}
        <FlatList
          data={filteredRestaurants}
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
                <FontAwesome name="search" size={48} color={colors.text + '40'} />
                <Text style={[styles.emptyText, { color: colors.text + '60' }]}> 
                  {searchQuery ? 'Nessun ristorante trovato' : 'Nessun ristorante disponibile'}
                </Text>
                {searchQuery && (
                  <Text style={[styles.emptySubtext, { color: colors.text + '40' }]}> 
                    Prova a modificare i criteri di ricerca
                  </Text>
                )}
              </View>
            )
          }
          renderItem={({ item: restaurant, index }) => (
            <ListCard
              item={restaurant}
              delay={index * 100}
              enableSwipe={false}
              onPress={() => {
                onTap();
                // Navigazione al dettaglio del ristorante
                router.push(`/ristoranti/${restaurant.id}`);
              }}
            />
          )}
        />
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
  restaurantCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  restaurantImage: {
    width: 120,
    height: 140,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  restaurantContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  restaurantTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 24,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  moreTagsText: {
    fontSize: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
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
}); 