import { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ImageBackground, FlatList, Dimensions } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "../context/ThemeContext";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Animated, { useAnimatedStyle, useSharedValue, Easing, withTiming } from "react-native-reanimated";
import { apiClient } from "../../services/api";
import { useHaptics } from "../../utils/haptics";
import { SkeletonHeroCard } from "../../components/skeleton/SkeletonCards";
import { useTextStyles } from "../../hooks/useAccessibleText";
import { SCREEN_TRANSITIONS, createStaggeredAnimation, TransitionType } from "../../utils/transitions";
import { InlineLoading } from "../../components/LoadingStates";
import { useEnhancedRefresh } from "../../hooks/useEnhancedRefresh";
import { MinimalRefreshIndicator } from "../../components/RefreshIndicator";
import { VerticalScrollIndicator, ScrollIndicatorType, ScrollIndicatorPosition } from "../../components/ScrollIndicators";

const { width } = Dimensions.get('window');


interface Guide {
  id: string;
  title: string;
  featured_image: string;
  category: {
    name: string;
    color?: string;
  };
  city: string;
  province: string;
}

interface Restaurant {
  id: string;
  name: string;
  featured_image: string;
  city: string;
  province: string;
  rating: string | number;
  price_range: number;
  category_name: string;
  category_color?: string;
}

export default function Index() {
  const { colors, colorScheme } = useTheme();
  const { onTap } = useHaptics();
  const textStyles = useTextStyles();
  const scrollY = useSharedValue(0);
  const fadeAnim = useSharedValue(0);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Enhanced refresh hook per homepage
  const refreshState = useEnhancedRefresh({
    onRefresh: async () => {
      console.log('🔄 Starting refresh...');
      await loadData();
      console.log('✅ Refresh completed');
    },
    threshold: 60, // Ridotto per attivazione più facile
    hapticFeedback: true,
    showIndicator: true,
    refreshDuration: 800, // Durata minima più breve ma visibile
  });
  
  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 1000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('📥 Loading data from API...');
      setLoading(true);
      setError(null);
      const [guidesResponse, restaurantsResponse, categoriesResponse] = await Promise.all([
        apiClient.get<any>('/guides/'),
        apiClient.get<any>('/restaurants/'),
        apiClient.get<any>('/categories/')
      ]);
      // Handle different response structures - backend returns {guides: [...], restaurants: [...], categories: [...]}
      const guidesData = Array.isArray(guidesResponse) ? guidesResponse : (guidesResponse?.guides || guidesResponse?.items || []);
      const restaurantsData = Array.isArray(restaurantsResponse) ? restaurantsResponse : (restaurantsResponse?.restaurants || restaurantsResponse?.items || []);
      const categoriesData = Array.isArray(categoriesResponse) ? categoriesResponse : (categoriesResponse?.categories || categoriesResponse?.items || []);
      // Funzione per trovare il colore della categoria
      const getCategoryColor = (catName: string) =>
        categoriesData.find((cat: any) => cat.name === catName)?.color || colors.primary;
      // Guides con colore categoria
      const guidesDataTransformed = guidesData.slice(0, 3).map((g: any) => ({
        ...g,
        category: {
          ...g.category,
          name: g.category?.name || g.category_name,
          color: getCategoryColor(g.category?.name || g.category_name)
        }
      }));
      // Restaurants con colore categoria
      const restaurantsDataTransformed = restaurantsData.slice(0, 3).map((r: any) => ({
        ...r,
        category_color: getCategoryColor(r.category_name)
      }));
      setGuides(guidesDataTransformed);
      setRestaurants(restaurantsDataTransformed);
      console.log('✅ Data loaded successfully:', { guides: guidesDataTransformed.length, restaurants: restaurantsDataTransformed.length });
    } catch (error) {
      console.error('❌ Error loading data:', error);
      setError('Impossibile caricare i dati. Riprova più tardi.');
    } finally {
      setLoading(false);
      console.log('🏁 Loading finished');
    }
  };

  
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

  // Funzione per renderizzare guide con animazione
  const renderGuideItem = ({ item, index }: { item: Guide, index: number }) => {
    const staggeredAnimations = createStaggeredAnimation(TransitionType.FADE_RIGHT, guides.length, 400, 120);
    
    return (
      <Animated.View
        entering={staggeredAnimations[index] || SCREEN_TRANSITIONS.home.enter}
      >
        <Link href={{ pathname: '/guide/[id]', params: { id: item.id } }} asChild>
          <TouchableOpacity 
            style={styles.fullImageCard}
            onPress={() => onTap()}
          >
            <ImageBackground
              source={{ uri: item.featured_image || 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }}
              style={styles.fullImage}
              imageStyle={{ borderRadius: 12 }}
            >
              <View style={styles.overlay} />
              <View style={styles.textOverlay}>
                <Text style={[styles.categoryPillOverlay, textStyles.label('white'), { backgroundColor: item.category?.color || colors.primary }]}>{item.category?.name || 'Guida'}</Text>
                <Text style={[styles.cardTitleOverlay, textStyles.subtitle('white')]} numberOfLines={2}>{item.title}</Text>
                <Text style={[styles.cardSubtitleOverlay, textStyles.caption('rgba(255,255,255,0.9)')]} numberOfLines={1}>{item.city}, {item.province}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </Link>
      </Animated.View>
    );
  };

  // Funzione per renderizzare ristoranti con animazione
  const renderRestaurantItem = ({ item, index }: { item: Restaurant, index: number }) => {
    const staggeredAnimations = createStaggeredAnimation(TransitionType.FADE_RIGHT, restaurants.length, 800, 120);
    
    return (
      <Animated.View
        entering={staggeredAnimations[index] || SCREEN_TRANSITIONS.home.enter}
      >
        <Link href={{ pathname: '/ristoranti/[id]', params: { id: item.id } }} asChild>
          <TouchableOpacity 
            style={styles.fullImageCard}
            onPress={() => onTap()}
          >
            <ImageBackground
              source={{ uri: item.featured_image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }}
              style={styles.fullImage}
              imageStyle={{ borderRadius: 12 }}
            >
              <View style={styles.overlay} />
              <View style={styles.textOverlay}>
                <Text style={[styles.categoryPillOverlay, textStyles.label('white'), { backgroundColor: item.category_color || colors.primary }]}>{item.category_name || 'Ristorante'}</Text>
                <Text style={[styles.cardTitleOverlay, textStyles.subtitle('white')]} numberOfLines={2}>{item.name}</Text>
                <Text style={[styles.cardSubtitleOverlay, textStyles.caption('rgba(255,255,255,0.9)')]} numberOfLines={1}>{item.city}, {item.province}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </Link>
      </Animated.View>
    );
  };


  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
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

      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          scrollY.value = event.nativeEvent.contentOffset.y;
          refreshState.onScroll(event);
        }}
        onScrollEndDrag={refreshState.onScrollEndDrag}
        onContentSizeChange={(_, h) => setContentHeight(h)}
        onLayout={(event) => setContainerHeight(event.nativeEvent.layout.height)}
        scrollEventThrottle={16}
        bounces={true} // Assicura che il bounce sia abilitato
        alwaysBounceVertical={true}
      >
      
      {/* Header con Hero Image */}
      <Animated.View style={[styles.heroContainer, heroAnimatedStyle]}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80' }}
          style={styles.heroImage}
        >
          <BlurView intensity={30} style={styles.heroOverlay}>
            <Animated.Text 
              entering={SCREEN_TRANSITIONS.home.enter} 
              style={[styles.heroTitle, textStyles.title('white')]}
            >
              AllFoodSicily
            </Animated.Text>
            <Animated.Text 
              entering={createStaggeredAnimation(TransitionType.FADE_UP, 1, 200)[0]} 
              style={[styles.heroSubtitle, textStyles.body('rgba(255,255,255,0.9)')]} 
            >
              Il gusto e la cultura della Sicilia
            </Animated.Text>
          </BlurView>
        </ImageBackground>
      </Animated.View>

      {/* Sezione Guide in Evidenza */}
      <Animated.View 
        style={styles.section}
        entering={createStaggeredAnimation(TransitionType.FADE_UP, 1, 300)[0]}
      >
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, textStyles.title(colors.text)]}>Guide in Evidenza</Text>
          <Link href="/(tabs)/guide" asChild>
            <TouchableOpacity onPress={() => onTap()}>
              <Text style={[styles.sectionLink, textStyles.button(colors.tint)]}>Vedi tutte</Text>
            </TouchableOpacity>
          </Link>
        </View>
        {loading ? (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[1, 2, 3]} // Dummy data for 3 skeleton items
            keyExtractor={(item) => item.toString()}
            renderItem={() => <SkeletonHeroCard />}
            contentContainerStyle={styles.articlesList}
          />
        ) : error ? (
          <InlineLoading 
            title="Errore nel caricamento delle guide"
          />
        ) : guides.length === 0 ? (
          <InlineLoading 
            title="Nessuna guida disponibile al momento"
          />
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={guides}
            keyExtractor={(item) => item.id}
            renderItem={renderGuideItem}
            contentContainerStyle={styles.articlesList}
          />
        )}
      </Animated.View>

      {/* Sezione Ristoranti in Evidenza */}
      <Animated.View 
        style={styles.section}
        entering={createStaggeredAnimation(TransitionType.FADE_UP, 1, 600)[0]}
      >
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, textStyles.title(colors.text)]}>Ristoranti Consigliati</Text>
          <Link href="/ristoranti" asChild>
            <TouchableOpacity onPress={() => onTap()}>
              <Text style={[styles.sectionLink, textStyles.button(colors.tint)]}>Vedi tutti</Text>
            </TouchableOpacity>
          </Link>
        </View>
        {loading ? (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[1, 2, 3]} // Dummy data for 3 skeleton items
            keyExtractor={(item) => item.toString()}
            renderItem={() => <SkeletonHeroCard />}
            contentContainerStyle={styles.restaurantsList}
          />
        ) : error ? (
          <InlineLoading 
            title="Errore nel caricamento dei ristoranti"
          />
        ) : restaurants.length === 0 ? (
          <InlineLoading 
            title="Nessun ristorante disponibile al momento"
          />
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={restaurants}
            keyExtractor={(item) => item.id}
            renderItem={renderRestaurantItem}
            contentContainerStyle={styles.restaurantsList}
          />
        )}
      </Animated.View>
      </ScrollView>

      {/* Custom Scroll Indicator - Nascosto */}
      {false && contentHeight > containerHeight && (
        <VerticalScrollIndicator
          scrollY={scrollY}
          contentHeight={contentHeight}
          containerHeight={containerHeight}
          type={ScrollIndicatorType.ROUNDED}
          position={ScrollIndicatorPosition.RIGHT}
          autoHide={false}
        />
      )}
    </View>
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
    marginBottom: 8, // Dynamic font size handled by useTextStyles
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  heroSubtitle: {
    textShadowColor: 'rgba(0, 0, 0, 0.75)', // Dynamic font size handled by useTextStyles
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
    // Dynamic font size and weight handled by useTextStyles
  },
  sectionLink: {
    // Dynamic font size and weight handled by useTextStyles
  },
  articlesList: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  articleCard: {
    width: width * 0.85 > 320 ? 320 : width * 0.85, // Larger width for guides
    height: 260,
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
    height: 170,
  },
  articleInfo: {
    padding: 12,
    height: 90,
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
  locationText: {
    fontSize: 12,
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
  },
  restaurantBottomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    padding: 20,
  },
  skeletonText: {
    height: 12,
    borderRadius: 4,
  },
  fullImageCard: {
    width: width * 0.85 > 320 ? 320 : width * 0.85,
    height: 260,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  fullImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  textOverlay: {
    padding: 16,
    zIndex: 2,
  },
  categoryPillOverlay: {
    alignSelf: 'flex-start',
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 8,
    overflow: 'hidden',
    // Dynamic font size and weight handled by useTextStyles
  },
  cardTitleOverlay: {
    marginBottom: 4, // Dynamic font size and weight handled by useTextStyles
  },
  cardSubtitleOverlay: {
    opacity: 0.85, // Dynamic font size handled by useTextStyles
  },
});
