import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { apiClient } from '../../services/api';
import { FontAwesome } from '@expo/vector-icons';
import ListCard from '../../components/ListCard';
import { ListItem } from '../../components/ListCard';
import ListCardSkeleton from '../../components/ListCardSkeleton';
import AdvancedFilters from '../../components/AdvancedFilters';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Guide {
  id: string;
  title: string;
  city: string;
  province: string;
  category: {
    id: string;
    name: string;
    color: string;
  } | null;
  tags?: string[];
  featured_image: string;
  description?: string;
}

interface ListCardProps {
  item: Guide;
  onPress: () => void;
  delay: number;
}

interface FilterOption {
  id: string;
  name: string;
  count?: number;
}

export default function GuidesListScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredGuides, setFilteredGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tutti');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Tutte');
  const [cities, setCities] = useState<FilterOption[]>([]);

  useEffect(() => {
    loadGuides();
  }, []);

  useEffect(() => {
    filterGuides();
  }, [searchQuery, guides, selectedCity]);

  const loadGuides = async (categoryId?: string) => {
    try {
      setLoading(true);
      
      // Use API-based filtering when a specific category is selected
      const guidesUrl = categoryId && categoryId !== 'all' 
        ? `/guides/?category_id=${categoryId}` 
        : '/guides/';
      
      const [guidesResponse, categoriesResponse] = await Promise.all([
        apiClient.get<any>(guidesUrl),
        apiClient.get<any>('/categories/')
      ]);
      
      // Handle different response structures - backend returns {guides: [...], pagination: {...}}
      const guidesData = Array.isArray(guidesResponse) ? guidesResponse : (guidesResponse?.guides || guidesResponse?.items || []);
      const categoriesData = Array.isArray(categoriesResponse) ? categoriesResponse : (categoriesResponse?.categories || categoriesResponse?.items || []);
      
      // Transform guides data to match expected structure
      const transformedGuides = guidesData.map((guide: any) => ({
        ...guide,
        category: guide.category_name ? {
          id: guide.category_id || 'unknown',
          name: guide.category_name,
          color: categoriesData.find((cat: any) => cat.name === guide.category_name)?.color || colors.primary
        } : null
      }));
      
      setGuides(transformedGuides);
      
      // Add "Tutti" category at the beginning
      const allCategories = [
        { id: 'all', name: 'Tutti', color: colors.primary },
        ...categoriesData
      ];
      setCategories(allCategories);
      // Estrai città uniche normalizzate
      const uniqueCities = [
        ...new Set(
          guidesData
            .map((g: any) => g.city && g.city.trim() ? g.city.trim().replace(/\s+/g, ' ') : null)
            .filter(Boolean)
            .map((city: string) => city.charAt(0).toUpperCase() + city.slice(1).toLowerCase())
        )
      ].sort();
      setCities([
        { id: 'all', name: 'Tutte' },
        ...uniqueCities.map((city) => ({ id: city as string, name: city as string }))
      ]);
    } catch (error) {
      console.error('Error loading guides:', error);
      Alert.alert('Errore', 'Impossibile caricare le guide');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const currentCategoryId = categories.find(cat => cat.name === selectedCategory)?.id;
    await loadGuides(currentCategoryId);
    setRefreshing(false);
  };

  const filterGuides = () => {
    // Filtro per search query e città normalizzata
    const filtered = guides.filter(guide => {
      const matchesSearch = !searchQuery.trim() || (
        guide.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.province?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.category?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.tags?.some(tag => tag?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      const normalizedGuideCity = guide.city && guide.city.trim() ? guide.city.trim().replace(/\s+/g, ' ') : '';
      const normalizedSelectedCity = selectedCity.trim().replace(/\s+/g, ' ');
      const matchesCity = selectedCity === 'Tutte' ||
        (normalizedGuideCity &&
          normalizedGuideCity.charAt(0).toUpperCase() + normalizedGuideCity.slice(1).toLowerCase() ===
          normalizedSelectedCity.charAt(0).toUpperCase() + normalizedSelectedCity.slice(1).toLowerCase()
        );
      return matchesSearch && matchesCity;
    });
    setFilteredGuides(filtered);
  };

  const handleCategorySelect = async (categoryName: string) => {
    setSelectedCategory(categoryName);
    const categoryId = categories.find(cat => cat.name === categoryName)?.id;
    await loadGuides(categoryId);
  };

  const navigateToGuide = (guideId: string) => {
    router.push(`/guide/${guideId}`);
  };

  const renderGuideItem = ({ item, index }: { item: Guide; index: number }) => (
    <ListCard
      item={item}
      onPress={() => navigateToGuide(item.id)}
      delay={index * 100}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <FontAwesome name="search" size={16} color={colors.text + '60'} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Cerca guide, città, categorie..."
          placeholderTextColor={colors.text + '60'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <FontAwesome name="times" size={16} color={colors.text + '60'} />
          </TouchableOpacity>
        )}
      </View>

      {/* Advanced Filters per categorie e città */}
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
          setSelectedCategory('Tutti');
          setSelectedCity('Tutte');
        }}
        colors={colors}
      />
      {/* Results Count e Filtri Attivi */}
      <View style={styles.resultsSection}>
        <Text style={[styles.resultsText, { color: colors.text + '80' }]}> 
          {filteredGuides.length} guide{filteredGuides.length !== 1 ? '' : 'a'} trovate
        </Text>
        {/* Indicatori Filtri Attivi */}
        <View style={styles.activeFiltersContainer}>
          {selectedCity !== 'Tutte' && (
            <View style={[styles.activeFilter, { backgroundColor: colors.primary + '20' }]}> 
              <Text style={[styles.activeFilterText, { color: colors.primary }]}>{selectedCity}</Text>
              <TouchableOpacity onPress={() => setSelectedCity('Tutte')}>
                <FontAwesome name="close" size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}
          {selectedCategory !== 'Tutti' && (
            <View style={[styles.activeFilter, { backgroundColor: colors.primary + '20' }]}> 
              <Text style={[styles.activeFilterText, { color: colors.primary }]}>{selectedCategory}</Text>
              <TouchableOpacity onPress={() => setSelectedCategory('Tutti')}>
                <FontAwesome name="close" size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Guides List */}
      <FlatList
        data={filteredGuides}
        keyExtractor={(item) => item.id}
        renderItem={renderGuideItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.listContainer}>
              {[1, 2, 3].map((_, index) => (
                <ListCardSkeleton key={`skeleton-${index}`} />
              ))}
            </View>
          ) : (
            <View style={styles.centerContainer}>
              <FontAwesome name="search" size={48} color={colors.text + '40'} />
              <Text style={[styles.emptyText, { color: colors.text + '60' }]}>
                {searchQuery ? 'Nessuna guida trovata' : 'Nessuna guida disponibile'}
              </Text>
              {searchQuery && (
                <Text style={[styles.emptySubtext, { color: colors.text + '40'}]}>
                  Prova a modificare i criteri di ricerca
                </Text>
              )}
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  categoriesContainer: {
    marginTop: 16,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',

  },
  resultsText: {
    fontSize: 14,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  listContainer: {
    padding: 16,
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
  resultsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  activeFilterText: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 5,
  },
});