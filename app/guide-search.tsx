import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  SectionList,
  Dimensions,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from './context/ThemeContext';
import { useHaptics } from '../utils/haptics';
import { useTextStyles } from '../hooks/useAccessibleText';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { apiClient } from '../services/api';
import { RestaurantListCard } from '../components/RestaurantListCard';
import { ListItem } from '../components/ListCard';
import ListCardSkeleton from '../components/ListCardSkeleton';
import { SkeletonVariant } from '../components/skeleton/SkeletonCards';

const { width } = Dimensions.get('window');

// Tipi di premi disponibili per la ricerca
const prizeTypes = [
  {
    id: 'eccellenza',
    name: 'Eccellenza',
    icon: 'emoji-events',
    color: '#FFD700',
  },
  {
    id: 'tradizione',
    name: 'Tradizione',
    icon: 'restaurant',
    color: '#8B4513',
  },
  {
    id: 'innovazione',
    name: 'Innovazione',
    icon: 'lightbulb',
    color: '#FF6B35',
  },
  {
    id: 'sostenibilita',
    name: 'Sostenibilità',
    icon: 'eco',
    color: '#4CAF50',
  },
  {
    id: 'servizio',
    name: 'Servizio',
    icon: 'star',
    color: '#2196F3',
  },
  {
    id: 'locale-anno',
    name: 'Locale dell\'Anno',
    icon: 'workspace-premium',
    color: '#9C27B0',
  },
];

interface City {
  id: string;
  name: string;
}

interface GroupedResults {
  title: string;
  data: ListItem[];
}

export default function GuideSearchScreen() {
  const { colors } = useTheme();
  const { onTap } = useHaptics();
  const textStyles = useTextStyles();
  const { guideId } = useLocalSearchParams<{ guideId?: string }>();

  // Stati per il form
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedPrizes, setSelectedPrizes] = useState<string[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  
  // Stati per i risultati
  const [results, setResults] = useState<GroupedResults[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Stati per la guida
  const [guide, setGuide] = useState<any>(null);
  const [guideLoading, setGuideLoading] = useState(false);
  
  // Caricamento iniziale
  useEffect(() => {
    if (guideId) {
      loadGuide();
      loadGuideRestaurants();
    } else {
      loadCities();
      loadAllRestaurants();
    }
  }, [guideId]);

  const loadGuide = async () => {
    if (!guideId) return;
    
    try {
      setGuideLoading(true);
      
      const response = await apiClient.get<any>(`/guides/${guideId}`);
      setGuide(response);
      
      // Guide loaded successfully
    } catch (error) {
      // Error loading guide
    } finally {
      setGuideLoading(false);
    }
  };

  const loadGuideRestaurants = async () => {
    if (!guideId) return;
    
    try {
      setLoading(true);

      // Load the guide with its restaurants
      const guideResponse = await apiClient.get<any>(`/guides/${guideId}`);
      const guideData = guideResponse;
      
      if (!guideData.restaurants || guideData.restaurants.length === 0) {
        // No restaurants found for this guide
        setResults([]);
        setHasSearched(true);
        return;
      }

      // Transform guide restaurants to ListItem format
      const transformedRestaurants: ListItem[] = guideData.restaurants.map((restaurant: any) => ({
        id: restaurant.id,
        title: restaurant.name,
        name: restaurant.name,
        featured_image: restaurant.featured_image,
        category: restaurant.category ? {
          id: restaurant.category.id,
          name: restaurant.category.name,
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

      // Group by city
      const groupedByCity = transformedRestaurants.reduce<Record<string, ListItem[]>>((acc, restaurant) => {
        const city = restaurant.city || 'Sconosciuta';
        if (!acc[city]) {
          acc[city] = [];
        }
        acc[city].push(restaurant);
        return acc;
      }, {});

      // Convert to SectionList format
      const groupedResults: GroupedResults[] = Object.entries(groupedByCity)
        .sort(([cityA], [cityB]) => cityA.localeCompare(cityB))
        .map(([city, restaurants]) => ({
          title: city,
          data: restaurants
        }));

      setResults(groupedResults);
      setHasSearched(true);
      
      // Loaded restaurants for guide
      
      // Extract cities for filtering
      const uniqueCities = [...new Set(guideData.restaurants.map((r: any) => r.city).filter(Boolean))].sort() as string[];
      setCities([
        { id: '', name: 'Tutte le città' },
        ...uniqueCities.map((city: string) => ({ id: city, name: city }))
      ]);
      
    } catch (error) {
      // Error loading guide restaurants
    } finally {
      setLoading(false);
    }
  };

  const loadCities = async () => {
    try {
      // Carica tutte le città dai ristoranti con paginazione
      let allRestaurants = [];
      let currentPage = 1;
      let hasMore = true;
      
      while (hasMore) {
        const url = `/restaurants/?page=${currentPage}&limit=100`;
        
        const response = await apiClient.get<any>(url);
        const pageData = Array.isArray(response) ? response : (response?.restaurants || response?.items || []);
        
        if (pageData.length === 0) {
          hasMore = false;
        } else {
          allRestaurants.push(...pageData);
          currentPage++;
          
          if (response?.has_more === false || pageData.length < 100) {
            hasMore = false;
          }
        }
        
        // Safety break
        if (currentPage > 50) {
          // Stopped loading cities after 50 pages to prevent infinite loops
          hasMore = false;
        }
      }
      
      // Loaded restaurants for cities extraction
      
      // Estrai città uniche
      const uniqueCities = [...new Set(allRestaurants.map((r: any) => r.city).filter(Boolean))].sort() as string[];
      
      setCities([
        { id: '', name: 'Tutte le città' },
        ...uniqueCities.map((city) => ({ id: city, name: city }))
      ]);
      
      // Found unique cities
    } catch (error) {
      // Error loading cities
      // Fallback con alcune città principali siciliane
      setCities([
        { id: '', name: 'Tutte le città' },
        { id: 'Palermo', name: 'Palermo' },
        { id: 'Catania', name: 'Catania' },
        { id: 'Messina', name: 'Messina' },
        { id: 'Siracusa', name: 'Siracusa' },
      ]);
    }
  };

  const loadAllRestaurants = async () => {
    try {
      setLoading(true);

      // Carica tutti i ristoranti con paginazione
      let allRestaurants = [];
      let currentPage = 1;
      let hasMore = true;
      
      while (hasMore) {
        const url = `/restaurants/?page=${currentPage}&limit=100`;
        
        const response = await apiClient.get<any>(url);
        const pageData = Array.isArray(response) ? response : (response?.restaurants || response?.items || []);
        
        if (pageData.length === 0) {
          hasMore = false;
        } else {
          allRestaurants.push(...pageData);
          currentPage++;
          
          if (response?.has_more === false || pageData.length < 100) {
            hasMore = false;
          }
        }
        
        // Safety break
        if (currentPage > 50) {
          // Stopped loading after 50 pages to prevent infinite loops
          hasMore = false;
        }
      }

      // Loaded restaurants on page load

      // Trasforma in formato ListItem
      const transformedRestaurants: ListItem[] = allRestaurants.map((restaurant: any) => ({
        id: restaurant.id,
        title: restaurant.name,
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

      // Raggruppa per città
      const groupedByCity = transformedRestaurants.reduce<Record<string, ListItem[]>>((acc, restaurant) => {
        const city = restaurant.city || 'Sconosciuta';
        if (!acc[city]) {
          acc[city] = [];
        }
        acc[city].push(restaurant);
        return acc;
      }, {});

      // Converte in formato SectionList
      const groupedResults: GroupedResults[] = Object.entries(groupedByCity)
        .sort(([cityA], [cityB]) => cityA.localeCompare(cityB))
        .map(([city, restaurants]) => ({
          title: city,
          data: restaurants
        }));

      setResults(groupedResults);
      setHasSearched(true);
      
    } catch (error) {
      // Error loading all restaurants
    } finally {
      setLoading(false);
    }
  };

  const handlePrizeToggle = (prizeId: string) => {
    onTap();
    setSelectedPrizes(prev => 
      prev.includes(prizeId) 
        ? prev.filter(id => id !== prizeId)
        : [...prev, prizeId]
    );
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() && !selectedCity && selectedPrizes.length === 0) {
      Alert.alert('Attenzione', 'Inserisci almeno un criterio di ricerca');
      return;
    }

    onTap();
    setLoading(true);
    setHasSearched(true);

    try {
      let allRestaurants = [];

      if (guideId) {
        // If we have a guideId, search within guide restaurants
        // Searching within guide restaurants
        const guideResponse = await apiClient.get<any>(`/guides/${guideId}`);
        allRestaurants = guideResponse.restaurants || [];
      } else {
        // Original search logic for all restaurants
        let currentPage = 1;
        let hasMore = true;
        
        while (hasMore) {
          const url = `/restaurants/?page=${currentPage}&limit=100`;
          const response = await apiClient.get<any>(url);
          const pageData = Array.isArray(response) ? response : (response?.restaurants || response?.items || []);
          
          if (pageData.length === 0) {
            hasMore = false;
          } else {
            allRestaurants.push(...pageData);
            currentPage++;
            
            if (response?.has_more === false || pageData.length < 100) {
              hasMore = false;
            }
          }
          
          if (currentPage > 50) {
            hasMore = false;
          }
        }
      }

      // Filter results
      const filteredRestaurants = allRestaurants.filter((restaurant: any) => {
        const matchesQuery = !searchQuery.trim() || (
          restaurant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          restaurant.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          restaurant.province?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          restaurant.category_name?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const matchesCity = !selectedCity || restaurant.city === selectedCity;
        const matchesPrizes = selectedPrizes.length === 0 || true;

        return matchesQuery && matchesCity && matchesPrizes;
      });

      // Transform to ListItem format
      const transformedRestaurants: ListItem[] = filteredRestaurants.map((restaurant: any) => ({
        id: restaurant.id,
        title: restaurant.name,
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

      // Group by city
      const groupedByCity = transformedRestaurants.reduce<Record<string, ListItem[]>>((acc, restaurant) => {
        const city = restaurant.city || 'Sconosciuta';
        if (!acc[city]) {
          acc[city] = [];
        }
        acc[city].push(restaurant);
        return acc;
      }, {});

      // Convert to SectionList format
      const groupedResults: GroupedResults[] = Object.entries(groupedByCity)
        .sort(([cityA], [cityB]) => cityA.localeCompare(cityB))
        .map(([city, restaurants]) => ({
          title: city,
          data: restaurants
        }));

      setResults(groupedResults);
      
    } catch (error) {
      // Error searching
      Alert.alert('Errore', 'Impossibile eseguire la ricerca. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    onTap();
    router.back();
  };

  const renderPrizeItem = ({ item, index }: { item: typeof prizeTypes[0], index: number }) => {
    const isSelected = selectedPrizes.includes(item.id);
    
    return (
      <Animated.View
        entering={FadeInDown.delay(100 + index * 50)}
        style={styles.prizeItemWrapper}
      >
        <TouchableOpacity
          style={[
            styles.prizeItem,
            {
              backgroundColor: isSelected ? item.color : colors.card,
              borderColor: isSelected ? item.color : colors.border,
            }
          ]}
          onPress={() => handlePrizeToggle(item.id)}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name={item.icon as any}
            size={24}
            color={isSelected ? 'white' : item.color}
          />
          <Text
            style={[
              styles.prizeItemText,
              textStyles.caption(isSelected ? 'white' : colors.text)
            ]}
            numberOfLines={2}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderSectionHeader = ({ section }: { section: GroupedResults }) => (
    <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
      <MaterialIcons name="location-city" size={20} color={colors.primary} />
      <Text style={[styles.sectionHeaderText, textStyles.subtitle(colors.text)]}>
        {section.title}
      </Text>

    </View>
  );

  const renderRestaurantItem = ({ item, index }: { item: ListItem, index: number }) => (
    <RestaurantListCard
      item={item}
      onPress={() => {
        onTap();
        router.push(`/ristoranti/${item.id}`);
      }}
    />
  );

  const totalResults = results.reduce((sum, section) => sum + section.data.length, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, textStyles.title(colors.text)]}>
          Ricerca Locali
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Form di ricerca */}
      <View style={styles.searchForm}>
        {/* Search Bar */}
        <Animated.View
          entering={FadeInDown.delay(100)}
          style={[styles.searchContainer, { backgroundColor: colors.card }]}
        >
          {/* Pulsante Cerca a sinistra */}
          <TouchableOpacity
            style={[styles.searchButton, { backgroundColor: colors.primary }]}
            onPress={handleSearch}
            disabled={loading}
          >
            <MaterialIcons 
              name={loading ? "hourglass-empty" : "search"} 
              size={18} 
              color="white" 
            />
          </TouchableOpacity>
          
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Cerca locali, categorie..."
            placeholderTextColor={colors.text + '60'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <MaterialIcons name="clear" size={20} color={colors.text + '60'} />
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Filtri sempre visibili */}
          <>
            {/* City Select */}
            <Animated.View
              entering={FadeInDown.delay(200)}
              style={styles.citiesSection}
            >
              
              <FlatList
                data={cities}
                renderItem={({ item, index }) => (
                  <Animated.View
                    entering={FadeInDown.delay(250 + index * 30)}
                    style={styles.cityItemWrapper}
                  >
                    <TouchableOpacity
                      style={[
                        styles.cityItem,
                        {
                          backgroundColor: selectedCity === item.id ? colors.primary : colors.card,
                          borderColor: selectedCity === item.id ? colors.primary : colors.border,
                        }
                      ]}
                      onPress={() => {
                        onTap();
                        setSelectedCity(item.id);
                      }}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons 
                        name={item.id === '' ? "public" : "place"} 
                        size={16} 
                        color={selectedCity === item.id ? 'white' : colors.primary} 
                      />
                      <Text
                        style={[
                          styles.cityItemText,
                          textStyles.body(selectedCity === item.id ? 'white' : colors.text)
                        ]}
                      >
                        {item.name}
                      </Text>
                      {selectedCity === item.id && (
                        <MaterialIcons name="check" size={16} color="white" />
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.citiesList}
              />
            </Animated.View>

            {/* Premi Types */}
            <Animated.View
              entering={FadeInDown.delay(300)}
              style={styles.prizesSection}
            >
              <View style={styles.prizesHeader}>
                <MaterialIcons name="emoji-events" size={20} color={colors.primary} />
                <Text style={[styles.prizesHeaderText, textStyles.body(colors.text)]}>
                Premio:
                </Text>
                {selectedPrizes.length > 0 && (
                  <View style={[styles.selectedCount, { backgroundColor: colors.primary }]}>
                    <Text style={styles.selectedCountText}>{selectedPrizes.length}</Text>
                  </View>
                )}
              </View>
              
              <FlatList
                data={prizeTypes}
                renderItem={renderPrizeItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.prizesList}
              />
            </Animated.View>
          </>

      </View>

      {/* Risultati */}
      {hasSearched && (
        <View style={styles.resultsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              {[1, 2, 3].map((_, index) => (
                <ListCardSkeleton 
                  key={`skeleton-${index}`} 
                  variant={SkeletonVariant.SHIMMER}
                  showRating={true}
                />
              ))}
            </View>
          ) : results.length > 0 ? (
            <>

              <SectionList
                sections={results}
                renderItem={renderRestaurantItem}
                renderSectionHeader={renderSectionHeader}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.resultsList}
                stickySectionHeadersEnabled={false}
              />
            </>
          ) : (
            <View style={styles.noResultsContainer}>
              <MaterialIcons name="search-off" size={48} color={colors.text + '40'} />
              <Text style={[styles.noResultsText, textStyles.subtitle(colors.text + '60')]}>
                Nessun locale trovato
              </Text>
              <Text style={[styles.noResultsSubtext, textStyles.body(colors.text + '40')]}>
                Prova a modificare i criteri di ricerca
              </Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 32,
  },
  searchForm: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
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
  clearButton: {
    padding: 4,
    marginRight: 8,
  },
  searchButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  citiesSection: {
    marginBottom: 16,
  },
  citiesList: {
    paddingHorizontal: 4,
  },
  cityItemWrapper: {
    marginRight: 12,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
    minWidth: 120,
  },
  cityItemText: {
    fontWeight: '600',
    flex: 1,
  },
  prizesSection: {
    marginBottom: 16,
  },
  prizesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  prizesHeaderText: {
    marginLeft: 8,
    fontWeight: '600',
    flex: 1,
  },
  selectedCount: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  prizesList: {
    paddingHorizontal: 4,
  },
  prizeItemWrapper: {
    marginRight: 12,
  },
  prizeItem: {
    width: 80,
    height: 80,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: 4,
  },
  prizeItemText: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  resultsContainer: {
    flex: 1,
  },
  loadingContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  resultsCount: {
    fontWeight: '600',
  },
  resultsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingTop: 24,
    gap: 8,
  },
  sectionHeaderText: {
    fontWeight: '700',
    flex: 1,
  },
  sectionCount: {
    fontWeight: '500',
  },
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  noResultsText: {
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  noResultsSubtext: {
    marginTop: 8,
    textAlign: 'center',
  },
});