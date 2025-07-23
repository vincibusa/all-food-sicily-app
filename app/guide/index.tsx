import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import Colors from '../../constants/Colors';
import { apiClient } from '../../services/api';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface Guide {
  id: string;
  title: string;
  featured_image: string;
  category: {
    id: string;
    name: string;
    color: string;
  };
  city: string;
  province: string;
  tags: string[];
  created_at: string;
}

export default function GuidesListScreen() {
  const router = useRouter();
  const { colors, colorScheme } = useTheme();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [filteredGuides, setFilteredGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadGuides();
  }, []);

  useEffect(() => {
    filterGuides();
  }, [searchQuery, guides]);

  const loadGuides = async () => {
    try {
      setLoading(true);
      const guidesResponse = await apiClient.get<any>('/guides/');
      
      // Handle different response structures
      const guidesData = Array.isArray(guidesResponse) ? guidesResponse : (guidesResponse?.items || []);
      setGuides(guidesData);
    } catch (error) {
      console.error('Error loading guides:', error);
      Alert.alert('Errore', 'Impossibile caricare le guide');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGuides();
    setRefreshing(false);
  };

  const filterGuides = () => {
    if (!searchQuery.trim()) {
      setFilteredGuides(guides);
      return;
    }

    const filtered = guides.filter(guide =>
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.province.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.category?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredGuides(filtered);
  };

  const navigateToGuide = (guideId: string) => {
    router.push(`/guide/${guideId}`);
  };

  const renderGuideItem = ({ item, index }: { item: Guide; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 100)}>
      <TouchableOpacity
        style={[styles.guideCard, { backgroundColor: colors.card }]}
        onPress={() => navigateToGuide(item.id)}
      >
        <Image
          source={{ 
            uri: item.featured_image || 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' 
          }}
          style={styles.guideImage}
        />
        
        <View style={styles.guideContent}>
          {/* Category Badge */}
          <View style={[styles.categoryBadge, { backgroundColor: item.category?.color || colors.primary }]}>
            <Text style={styles.categoryText}>{item.category?.name || 'Guida'}</Text>
          </View>
          
          <Text style={[styles.guideTitle, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          
          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={14} color={colors.primary} />
            <Text style={[styles.locationText, { color: colors.text + '80' }]}>
              {item.city}, {item.province}
            </Text>
          </View>
          
          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 2).map((tag, tagIndex) => (
                <View key={tagIndex} style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
                </View>
              ))}
              {item.tags.length > 2 && (
                <Text style={[styles.moreTagsText, { color: colors.text + '60' }]}>
                  +{item.tags.length - 2}
                </Text>
              )}
            </View>
          )}
          
          <Text style={[styles.dateText, { color: colors.text + '60' }]}>
            {new Date(item.created_at).toLocaleDateString('it-IT')}
          </Text>
        </View>
        
        <MaterialIcons name="chevron-right" size={24} color={colors.text + '40'} />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Guide',
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
        }} 
      />
      
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

        {/* Results Count */}
        <Text style={[styles.resultsText, { color: colors.text + '80' }]}>
          {filteredGuides.length} guide{filteredGuides.length !== 1 ? '' : 'a'} trovate
        </Text>

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
              <View style={styles.centerContainer}>
                <Text style={[styles.loadingText, { color: colors.text }]}>Caricamento...</Text>
              </View>
            ) : (
              <View style={styles.centerContainer}>
                <FontAwesome name="search" size={48} color={colors.text + '40'} />
                <Text style={[styles.emptyText, { color: colors.text + '60' }]}>
                  {searchQuery ? 'Nessuna guida trovata' : 'Nessuna guida disponibile'}
                </Text>
                {searchQuery && (
                  <Text style={[styles.emptySubtext, { color: colors.text + '40' }]}>
                    Prova a modificare i criteri di ricerca
                  </Text>
                )}
              </View>
            )
          }
        />
      </SafeAreaView>
    </>
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
  resultsText: {
    fontSize: 14,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  listContainer: {
    padding: 16,
  },
  guideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  guideImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  guideContent: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    lineHeight: 22,
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
  dateText: {
    fontSize: 11,
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