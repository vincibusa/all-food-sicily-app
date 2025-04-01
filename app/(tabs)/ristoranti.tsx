import { useState } from "react";
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Link } from "expo-router";
import { FontAwesome, MaterialIcons, Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

// Dati di esempio per i ristoranti
const RESTAURANTS = [
  {
    id: '1',
    name: 'Trattoria Siciliana',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    location: 'Palermo',
    rating: 4.8,
    cuisine: 'Tradizionale',
    priceRange: '€€',
    description: 'Autentica cucina siciliana in un ambiente rustico e accogliente.',
  },
  {
    id: '2',
    name: 'Osteria del Mare',
    image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    location: 'Catania',
    rating: 4.6,
    cuisine: 'Pesce',
    priceRange: '€€€',
    description: 'Specialità di pesce fresco con vista sul mare.',
  },
  {
    id: '3',
    name: 'Villa Mediterranea',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    location: 'Taormina',
    rating: 4.9,
    cuisine: 'Gourmet',
    priceRange: '€€€€',
    description: 'Cucina raffinata con influenze mediterranee in una location esclusiva.',
  },
  {
    id: '4',
    name: 'Antica Focacceria',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    location: 'Siracusa',
    rating: 4.5,
    cuisine: 'Street Food',
    priceRange: '€',
    description: 'Il miglior street food siciliano, specializzato in panelle e arancini.',
  },
  {
    id: '5',
    name: 'Vini e Sapori',
    image: 'https://images.unsplash.com/photo-1536782376847-5c9d14d97cc0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    location: 'Marsala',
    rating: 4.7,
    cuisine: 'Enoteca',
    priceRange: '€€€',
    description: 'Enoteca con piatti tradizionali siciliani abbinati a vini locali pregiati.',
  },
  {
    id: '6',
    name: 'Pizzeria Etna',
    image: 'https://images.unsplash.com/photo-1604974342503-32ec223ee55e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    location: 'Catania',
    rating: 4.4,
    cuisine: 'Pizzeria',
    priceRange: '€€',
    description: 'Pizze cotte in forno a legna con ingredienti genuini del territorio.',
  }
];

// Categorie di cucina
const CATEGORIES = [
  { id: '1', name: 'Tutti' },
  { id: '2', name: 'Tradizionale' },
  { id: '3', name: 'Pesce' },
  { id: '4', name: 'Gourmet' },
  { id: '5', name: 'Street Food' },
  { id: '6', name: 'Pizzeria' },
  { id: '7', name: 'Enoteca' },
];

export default function RistorantiScreen() {
  const { colors, colorScheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tutti');
  
  // Filtra i ristoranti in base alla ricerca e alla categoria selezionata
  const filteredRestaurants = RESTAURANTS.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         restaurant.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tutti' || restaurant.cuisine === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header di ricerca */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <View style={[styles.searchBar, { backgroundColor: colorScheme === 'dark' ? colors.border : '#f2f2f2' }]}>
          <Feather name="search" size={20} color={colors.text} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Cerca ristoranti..."
            placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Categorie */}
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item.name && { backgroundColor: colors.primary }
              ]}
              onPress={() => setSelectedCategory(item.name)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item.name ? { color: 'white' } : { color: colors.text }
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Lista Ristoranti */}
      <View style={styles.listContainer}>
        <Text style={[styles.listTitle, { color: colors.text }]}>
          {filteredRestaurants.length} ristoranti trovati
        </Text>
        {filteredRestaurants.map((restaurant) => (
          <Link 
            key={restaurant.id} 
            href={{ 
              pathname: '/ristoranti/[id]', 
              params: { id: restaurant.id } 
            }} 
            asChild
          >
            <TouchableOpacity style={styles.restaurantCard}>
              <Image source={{ uri: restaurant.image }} style={styles.restaurantImage} />
              <View style={[styles.restaurantInfo, { backgroundColor: colors.card }]}>
                <View style={styles.categoryRow}>
                  <View style={[styles.categoryPill, { backgroundColor: colors.primary }]}>
                    <Text style={styles.categoryPillText}>{restaurant.cuisine}</Text>
                  </View>
                  <View style={styles.ratingContainer}>
                    <FontAwesome name="star" size={14} color="#FFD700" />
                    <Text style={[styles.ratingText, { color: colors.text }]}>{restaurant.rating}</Text>
                  </View>
                </View>
                
                <Text style={[styles.restaurantName, { color: colors.text }]}>{restaurant.name}</Text>
                
                <Text style={[styles.description, { color: colors.text }]} numberOfLines={2}>
                  {restaurant.description}
                </Text>
                
                <View style={styles.detailsContainer}>
                  <View style={styles.locationContainer}>
                    <MaterialIcons name="location-on" size={14} color={colors.primary} />
                    <Text style={[styles.locationText, { color: colors.text }]}>{restaurant.location}</Text>
                  </View>
                  <Text style={[styles.priceRange, { color: colors.text }]}>{restaurant.priceRange}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Link>
        ))}
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: 40,
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
  },
  listContainer: {
    padding: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  restaurantCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  restaurantImage: {
    width: '100%',
    height: 200,
  },
  restaurantInfo: {
    padding: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryPillText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    marginLeft: 4,
  },
  priceRange: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 