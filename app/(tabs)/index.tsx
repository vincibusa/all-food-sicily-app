import { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, ImageBackground, FlatList, Dimensions } from "react-native";
import { BlurView } from "expo-blur";
import { useColorScheme } from "react-native";
import Colors from "../../constants/Colors";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInRight, useAnimatedStyle, useSharedValue, withSpring, withDelay, Easing, withTiming } from "react-native-reanimated";

const { width } = Dimensions.get('window');
const AnimatedImage = Animated.createAnimatedComponent(Image);
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

// Dati temporanei per visualizzazione
const FEATURED_ARTICLES = [
  {
    id: '1',
    title: 'Storia della Cannolo Siciliano',
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'Tradizioni'
  },
  {
    id: '2',
    title: 'I migliori ristoranti di pesce in Sicilia',
    image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'Guide'
  },
  {
    id: '3',
    title: 'Olive Nocellara del Belice: un tesoro siciliano',
    image: 'https://images.unsplash.com/photo-1598042332909-df0e4eb1f6ea?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'Prodotti'
  }
];

const FEATURED_RESTAURANTS = [
  {
    id: '1',
    name: 'Trattoria Siciliana',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    location: 'Palermo',
    rating: 4.8
  },
  {
    id: '2',
    name: 'Osteria del Mare',
    image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    location: 'Catania',
    rating: 4.6
  },
  {
    id: '3',
    name: 'Villa Mediterranea',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    location: 'Taormina',
    rating: 4.9
  }
];

export default function Index() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const scrollY = useSharedValue(0);
  const fadeAnim = useSharedValue(0);
  
  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 1000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
  }, []);
  
  const heroAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [
        { 
          scale: withTiming(fadeAnim.value, { 
            duration: 1000, 
            easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
          }) 
        }
      ]
    };
  });

  // Funzione per renderizzare articoli con animazione
  const renderArticleItem = ({ item, index }: { item: typeof FEATURED_ARTICLES[number], index: number }) => {
    return (
      <Animated.View
        entering={FadeInRight.delay(index * 100).springify()}
      >
        <Link href={{ pathname: '/articoli/[id]', params: { id: item.id } }} asChild>
          <TouchableOpacity style={styles.articleCard}>
            <AnimatedImage 
              source={{ uri: item.image }} 
              style={styles.articleImage}
              entering={FadeInDown.delay(index * 150).springify()} 
            />
            <View style={[styles.articleInfo, { backgroundColor: colors.card }]}>
              <View style={[styles.categoryPill, { backgroundColor: colors.primary }]}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
              <Text style={[styles.articleTitle, { color: colors.text }]} numberOfLines={2}>
                {item.title}
              </Text>
            </View>
          </TouchableOpacity>
        </Link>
      </Animated.View>
    );
  };

  // Funzione per renderizzare ristoranti con animazione
  const renderRestaurantItem = ({ item, index }: { item: typeof FEATURED_RESTAURANTS[number], index: number }) => {
    return (
      <Animated.View
        entering={FadeInRight.delay(index * 100 + 300).springify()}
      >
        <Link href={{ pathname: '/ristoranti/[id]', params: { id: item.id } }} asChild>
          <TouchableOpacity style={styles.restaurantCard}>
            <AnimatedImage 
              source={{ uri: item.image }} 
              style={styles.restaurantImage} 
              entering={FadeInDown.delay(index * 150 + 300).springify()}
            />
            <View style={[styles.restaurantInfo, { backgroundColor: colors.card }]}>
              <View style={[styles.locationPill, { backgroundColor: colors.primary }]}>
                <Text style={styles.locationPillText}>{item.location}</Text>
              </View>
              <Text style={[styles.restaurantName, { color: colors.text }]} numberOfLines={2}>
                {item.name}
              </Text>
            </View>
          </TouchableOpacity>
        </Link>
      </Animated.View>
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      onScroll={(event) => {
        scrollY.value = event.nativeEvent.contentOffset.y;
      }}
      scrollEventThrottle={16}
    >
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      {/* Header con Hero Image */}
      <Animated.View style={[styles.heroContainer, heroAnimatedStyle]}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80' }}
          style={styles.heroImage}
        >
          <BlurView intensity={30} style={styles.heroOverlay}>
            <Animated.Text 
              entering={FadeInDown.duration(800).springify()} 
              style={styles.heroTitle}
            >
              AllFoodSicily
            </Animated.Text>
            <Animated.Text 
              entering={FadeInDown.delay(200).duration(800).springify()} 
              style={styles.heroSubtitle}
            >
              Il gusto e la cultura della Sicilia
            </Animated.Text>
          </BlurView>
        </ImageBackground>
      </Animated.View>

      {/* Sezione Articoli in Evidenza */}
      <Animated.View 
        style={styles.section}
        entering={FadeInDown.delay(400).springify()}
      >
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Articoli in Evidenza</Text>
          <Link href="/articoli" asChild>
            <TouchableOpacity>
              <Text style={[styles.sectionLink, { color: colors.tint }]}>Vedi tutti</Text>
            </TouchableOpacity>
          </Link>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FEATURED_ARTICLES}
          keyExtractor={(item) => item.id}
          renderItem={renderArticleItem}
          contentContainerStyle={styles.articlesList}
        />
      </Animated.View>

      {/* Sezione Ristoranti in Evidenza */}
      <Animated.View 
        style={styles.section}
        entering={FadeInDown.delay(600).springify()}
      >
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ristoranti Consigliati</Text>
          <Link href="/ristoranti" asChild>
            <TouchableOpacity>
              <Text style={[styles.sectionLink, { color: colors.tint }]}>Vedi tutti</Text>
            </TouchableOpacity>
          </Link>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FEATURED_RESTAURANTS}
          keyExtractor={(item) => item.id}
          renderItem={renderRestaurantItem}
          contentContainerStyle={styles.restaurantsList}
        />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroContainer: {
    height: width * 0.6, // Responsive height based on screen width
    marginBottom: 20,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  heroOverlay: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20,
  },
  heroTitle: {
    fontSize: width > 400 ? 36 : 32, // Responsive font size
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  heroSubtitle: {
    fontSize: width > 400 ? 20 : 18, // Responsive font size
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  section: {
    marginBottom: 24,
    paddingVertical: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: width > 400 ? 22 : 20, // Responsive font size
    fontWeight: 'bold',
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  articlesList: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  articleCard: {
    width: width * 0.75 > 300 ? 280 : width * 0.75, // Responsive width
    height: 220,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
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
    height: 150,
  },
  articleInfo: {
    padding: 12,
    height: 70,
    justifyContent: 'center',
  },
  categoryPill: {
    position: 'absolute',
    top: -15,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
  },
  restaurantsList: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  restaurantCard: {
    width: width * 0.75 > 300 ? 280 : width * 0.75, // Responsive width
    height: 220,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
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
    height: 150,
  },
  restaurantInfo: {
    padding: 12,
    height: 70,
    justifyContent: 'center',
  },
  locationPill: {
    position: 'absolute',
    top: -15,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  locationPillText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  restaurantName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
  },
});
