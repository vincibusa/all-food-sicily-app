import { useState } from "react";
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { useColorScheme } from "react-native";
import Colors from "../../constants/Colors";
import { Link } from "expo-router";
import { FontAwesome, Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

// Dati di esempio per gli articoli
const ARTICLES = [
  {
    id: '1',
    title: 'Storia della Cannolo Siciliano',
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'Tradizioni',
    author: 'Maria Rossi',
    date: '12 Maggio 2023',
    excerpt: 'Un viaggio attraverso la storia di uno dei dolci più celebri della Sicilia, dalle origini arabe fino ai giorni nostri.'
  },
  {
    id: '2',
    title: 'I migliori ristoranti di pesce in Sicilia',
    image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'Guide',
    author: 'Giuseppe Verdi',
    date: '3 Giugno 2023',
    excerpt: 'Una guida completa ai ristoranti che offrono le migliori esperienze gastronomiche di pesce fresco in tutta la Sicilia.'
  },
  {
    id: '3',
    title: 'Olive Nocellara del Belice: un tesoro siciliano',
    image: 'https://images.unsplash.com/photo-1598042332909-df0e4eb1f6ea?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'Prodotti',
    author: 'Lucia Bianchi',
    date: '28 Luglio 2023',
    excerpt: 'Alla scoperta delle pregiate olive Nocellara del Belice, un prodotto DOP che rappresenta l\'eccellenza della gastronomia siciliana.'
  },
  {
    id: '4',
    title: 'La Festa di Santa Rosalia a Palermo',
    image: 'https://images.unsplash.com/photo-1543838281-3bdde9aba12e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'Eventi',
    author: 'Antonio Russo',
    date: '10 Agosto 2023',
    excerpt: 'Tutti i segreti e le tradizioni legate alla celebrazione del "Festino" di Santa Rosalia, la patrona di Palermo.'
  },
  {
    id: '5',
    title: 'Vini dell\'Etna: i migliori produttori',
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'Vini',
    author: 'Paolo Neri',
    date: '15 Settembre 2023',
    excerpt: 'I vini prodotti sul vulcano attivo più alto d\'Europa stanno guadagnando riconoscimento internazionale. Ecco i produttori da non perdere.'
  },
  {
    id: '6',
    title: 'Couscous di San Vito Lo Capo: la festa del gusto',
    image: 'https://images.unsplash.com/photo-1611489142329-016e4313a592?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'Eventi',
    author: 'Giovanna Marino',
    date: '5 Ottobre 2023',
    excerpt: 'Il festival internazionale del Couscous rappresenta uno degli eventi gastronomici più importanti in Sicilia. Ecco cosa aspettarsi.'
  }
];

// Categorie di articoli
const CATEGORIES = [
  { id: '1', name: 'Tutti' },
  { id: '2', name: 'Tradizioni' },
  { id: '3', name: 'Guide' },
  { id: '4', name: 'Prodotti' },
  { id: '5', name: 'Eventi' },
  { id: '6', name: 'Vini' }
];

export default function ArticoliScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tutti');
  
  // Filtra gli articoli in base alla ricerca e alla categoria selezionata
  const filteredArticles = ARTICLES.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tutti' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (

    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header di ricerca */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color={colors.text} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Cerca articoli..."
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

      {/* Lista Articoli */}
      <View style={styles.listContainer}>
        <Text style={[styles.listTitle, { color: colors.text }]}>
          {filteredArticles.length} articoli trovati
        </Text>
        
        {filteredArticles.map((article) => (
          <Link 
            key={article.id} 
            href={{ 
              pathname: "/articoli/[id]", 
              params: { id: article.id } 
            }} 
            asChild
          >
            <TouchableOpacity style={styles.articleCard}>
              <Image source={{ uri: article.image }} style={styles.articleImage} />
              <View style={[styles.articleInfo, { backgroundColor: colors.card }]}>
                <View style={styles.categoryRow}>
                  <View style={[styles.categoryPill, { backgroundColor: colors.primary }]}>
                    <Text style={styles.categoryPillText}>{article.category}</Text>
                  </View>
                  <Text style={[styles.dateText, { color: colors.text }]}>{article.date}</Text>
                </View>
                
                <Text style={[styles.articleTitle, { color: colors.text }]}>
                  {article.title}
                </Text>
                
                <Text style={[styles.articleExcerpt, { color: colors.text }]} numberOfLines={2}>
                  {article.excerpt}
                </Text>
                
                <View style={styles.authorContainer}>
                  <FontAwesome name="user-circle" size={16} color={colors.primary} />
                  <Text style={[styles.authorText, { color: colors.text }]}>{article.author}</Text>
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
    backgroundColor: '#f2f2f2',
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
  articleCard: {
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
  articleImage: {
    width: '100%',
    height: 200,
  },
  articleInfo: {
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
  dateText: {
    fontSize: 12,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  articleExcerpt: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  }
}); 