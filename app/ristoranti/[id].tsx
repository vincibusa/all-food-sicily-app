import { useState } from "react";
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Dimensions, ActivityIndicator, SafeAreaView, FlatList } from "react-native";
import { useColorScheme } from "react-native";
import Colors from "../../constants/Colors";
import { StatusBar } from "expo-status-bar";
import { FontAwesome, MaterialIcons, Feather, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";

const { width } = Dimensions.get('window');

// Dati di esempio per i ristoranti
const RESTAURANTS_DATA = {
  '1': {
    id: '1',
    name: 'Trattoria Siciliana',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    location: 'Via Roma 123, Palermo',
    rating: 4.8,
    phone: '+39 091 1234567',
    website: 'www.trattoriasiciliana.it',
    openingHours: 'Lun-Dom: 12:00-15:00, 19:00-23:00',
    description: 'Situata nel cuore di Palermo, la Trattoria Siciliana offre autentici piatti della tradizione culinaria siciliana in un\'atmosfera calda e accogliente. Il ristorante è ospitato in un edificio storico del XVII secolo, con un magnifico cortile interno dove è possibile cenare durante la stagione estiva. Lo chef Giuseppe Rossi, con oltre 30 anni di esperienza, prepara con passione ricette tramandate di generazione in generazione, utilizzando ingredienti freschi e locali.',
    menu: [
      {
        category: 'Antipasti',
        dishes: [
          { name: 'Caponata Siciliana', price: '€9' },
          { name: 'Parmigiana di Melanzane', price: '€10' },
          { name: 'Arancini Misti', price: '€8' }
        ]
      },
      {
        category: 'Primi Piatti',
        dishes: [
          { name: 'Pasta alla Norma', price: '€12' },
          { name: 'Busiate al Pesto Trapanese', price: '€14' },
          { name: 'Spaghetti con le Sarde', price: '€15' }
        ]
      },
      {
        category: 'Secondi Piatti',
        dishes: [
          { name: 'Involtini di Pesce Spada', price: '€22' },
          { name: 'Baccalà alla Messinese', price: '€20' },
          { name: 'Falsomagro', price: '€18' }
        ]
      }
    ],
    photos: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    ]
  },
  '2': {
    id: '2',
    name: 'Osteria del Mare',
    image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    location: 'Lungomare 45, Catania',
    rating: 4.6,
    phone: '+39 095 7654321',
    website: 'www.osteriadelmare.it',
    openingHours: 'Mar-Dom: 12:30-15:30, 19:30-23:30. Lunedì chiuso',
    description: 'L\'Osteria del Mare è un ristorante specializzato in cucina di pesce, situato sul pittoresco lungomare di Catania. Con una vista mozzafiato sull\'Etna e sul Mare Ionio, il locale offre un\'esperienza gastronomica unica che combina la freschezza del pescato locale con la tradizione culinaria siciliana. Il ristorante collabora direttamente con i pescatori locali per garantire che solo il pesce più fresco arrivi sulla tavola dei clienti.',
    menu: [
      {
        category: 'Antipasti di Mare',
        dishes: [
          { name: 'Insalata di Mare', price: '€14' },
          { name: 'Crudo di Pesce', price: '€18' },
          { name: 'Polpo alla Griglia', price: '€12' }
        ]
      },
      {
        category: 'Primi di Mare',
        dishes: [
          { name: 'Linguine allo Scoglio', price: '€16' },
          { name: 'Risotto ai Frutti di Mare', price: '€18' },
          { name: 'Spaghetti alle Vongole', price: '€15' }
        ]
      },
      {
        category: 'Secondi di Mare',
        dishes: [
          { name: 'Pesce del Giorno alla Griglia', price: '€24' },
          { name: 'Frittura Mista di Pesce', price: '€22' },
          { name: 'Calamari Ripieni', price: '€20' }
        ]
      }
    ],
    photos: [
      'https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484980972926-edee96e0960d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1576007473739-61e2b3fdeaeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    ]
  },
  '3': {
    id: '3',
    name: 'Villa Mediterranea',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    location: 'Via Teatro Greco 90, Taormina',
    rating: 4.9,
    phone: '+39 0942 123456',
    website: 'www.villamediterranea.it',
    openingHours: 'Tutti i giorni: 12:00-23:00',
    description: 'Villa Mediterranea è un elegante ristorante situato in una posizione panoramica a Taormina, con una vista spettacolare sul mare e sull\'Etna. Il locale è ospitato in una villa storica del XIX secolo, circondata da un rigoglioso giardino mediterraneo. Lo chef stellato Marco Bianchi propone una cucina raffinata che unisce tradizione siciliana e tecniche moderne, creando piatti che sono vere opere d\'arte gastronomiche.',
    menu: [
      {
        category: 'Menu Degustazione',
        dishes: [
          { name: 'Percorso Mare (5 portate)', price: '€65' },
          { name: 'Percorso Terra (5 portate)', price: '€60' },
          { name: 'Degustazione Completa (8 portate)', price: '€85' }
        ]
      },
      {
        category: 'Primi Piatti',
        dishes: [
          { name: 'Ravioli di Ricotta con Pistacchio', price: '€18' },
          { name: 'Tagliolini al Tartufo Nero', price: '€22' },
          { name: 'Risotto ai Gamberi Rossi', price: '€24' }
        ]
      },
      {
        category: 'Secondi Piatti',
        dishes: [
          { name: 'Branzino in Crosta di Sale', price: '€28' },
          { name: 'Filetto di Manzo con Riduzione al Nero d\'Avola', price: '€30' },
          { name: 'Agnello con Erbe Aromatiche', price: '€26' }
        ]
      }
    ],
    photos: [
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515669097368-22e68427d265?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    ]
  }
};

type RestaurantData = typeof RESTAURANTS_DATA[keyof typeof RESTAURANTS_DATA];
type MenuCategory = RestaurantData['menu'][number];
type Dish = MenuCategory['dishes'][number];
type PhotosArray = string[];

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams();
  const restaurant = RESTAURANTS_DATA[id as keyof typeof RESTAURANTS_DATA];
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'info' | 'menu' | 'photos'>('info');
  
  if (!restaurant) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 16 }}>Caricamento ristorante...</Text>
      </SafeAreaView>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <Animated.View 
            style={styles.contentContainer}
            entering={FadeIn.duration(500)}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Descrizione</Text>
            <Text style={[styles.description, { color: colors.text }]}>
              {restaurant.description}
            </Text>
            
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>Informazioni</Text>
            <View style={styles.infoItem}>
              <MaterialIcons name="location-on" size={20} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.text }]}>{restaurant.location}</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="access-time" size={20} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.text }]}>{restaurant.openingHours}</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="phone" size={20} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.text }]}>{restaurant.phone}</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="language" size={20} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.text }]}>{restaurant.website}</Text>
            </View>
          </Animated.View>
        );
      
      case 'menu':
        return (
          <Animated.View 
            style={styles.contentContainer}
            entering={FadeIn.duration(500)}
          >
            {restaurant.menu.map((category: MenuCategory, index: number) => (
              <View key={index} style={styles.menuSection}>
                <Text style={[styles.menuCategoryTitle, { color: colors.text }]}>
                  {category.category}
                </Text>
                {category.dishes.map((dish: Dish, dishIndex: number) => (
                  <View key={dishIndex} style={styles.dishItem}>
                    <Text style={[styles.dishName, { color: colors.text }]}>{dish.name}</Text>
                    <Text style={[styles.dishPrice, { color: colors.primary }]}>{dish.price}</Text>
                  </View>
                ))}
              </View>
            ))}
          </Animated.View>
        );
      
      case 'photos':
        return (
          <Animated.View 
            style={styles.contentContainer}
            entering={FadeIn.duration(500)}
          >
            <FlatList 
              data={restaurant.photos}
              numColumns={2}
              keyExtractor={(item: string, index: number) => index.toString()}
              renderItem={({ item }: { item: string }) => (
                <View style={styles.photoContainer}>
                  <Image source={{ uri: item }} style={styles.photoItem} />
                </View>
              )}
              columnWrapperStyle={styles.photoGrid}
            />
          </Animated.View>
        );
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      {/* Immagine di copertina */}
      <View style={styles.coverImageContainer}>
        <Image source={{ uri: restaurant.image }} style={styles.coverImage} />
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* Intestazione ristorante */}
      <Animated.View 
        style={[styles.restaurantHeader, { backgroundColor: colors.card }]}
        entering={FadeIn.duration(500)}
      >
        <View style={styles.ratingContainer}>
          <Text style={[styles.restaurantName, { color: colors.text }]}>{restaurant.name}</Text>
          <View style={styles.ratingBadge}>
            <FontAwesome name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{restaurant.rating}</Text>
          </View>
        </View>
        
        <View style={styles.locationContainer}>
          <MaterialIcons name="location-on" size={16} color={colors.primary} />
          <Text style={[styles.locationText, { color: colors.text }]}>{restaurant.location}</Text>
        </View>
        
        {/* Pulsanti di azione */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]}>
            <MaterialIcons name="phone" size={20} color="white" />
            <Text style={styles.actionButtonText}>Chiama</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]}>
            <MaterialIcons name="map" size={20} color="white" />
            <Text style={styles.actionButtonText}>Indicazioni</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]}>
            <Ionicons name="share-social" size={20} color="white" />
            <Text style={styles.actionButtonText}>Condividi</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      {/* Tab di navigazione */}
      <View style={[styles.tabBar, { backgroundColor: colors.card }]}>
        <TouchableOpacity 
          style={[
            styles.tabItem, 
            activeTab === 'info' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }
          ]}
          onPress={() => setActiveTab('info')}
        >
          <Text 
            style={[
              styles.tabText, 
              { color: activeTab === 'info' ? colors.primary : colors.text }
            ]}
          >
            Info
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.tabItem, 
            activeTab === 'menu' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }
          ]}
          onPress={() => setActiveTab('menu')}
        >
          <Text 
            style={[
              styles.tabText, 
              { color: activeTab === 'menu' ? colors.primary : colors.text }
            ]}
          >
            Menu
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.tabItem, 
            activeTab === 'photos' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }
          ]}
          onPress={() => setActiveTab('photos')}
        >
          <Text 
            style={[
              styles.tabText, 
              { color: activeTab === 'photos' ? colors.primary : colors.text }
            ]}
          >
            Foto
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Contenuto del tab attivo */}
      {renderTabContent()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  coverImageContainer: {
    position: 'relative',
    height: width * 0.6,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  restaurantHeader: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    marginLeft: 4,
    fontWeight: 'bold',
    color: '#333',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationText: {
    marginLeft: 6,
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: '500',
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  tabText: {
    fontWeight: '500',
    fontSize: 16,
  },
  contentContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 15,
  },
  menuSection: {
    marginBottom: 24,
  },
  menuCategoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  dishItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  dishName: {
    fontSize: 16,
    flex: 1,
    paddingRight: 10,
  },
  dishPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  photoGrid: {
    justifyContent: 'space-between',
  },
  photoContainer: {
    width: (width - 50) / 2,
    marginBottom: 10,
  },
  photoItem: {
    width: '100%',
    height: (width - 50) / 2 * 0.75,
    borderRadius: 8,
  },
}); 