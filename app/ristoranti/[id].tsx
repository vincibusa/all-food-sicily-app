import React, { useState, useEffect, useMemo, useCallback } from "react";
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Dimensions, ActivityIndicator, Alert, Share, Linking, Platform, ActionSheetIOS, FlatList, Modal } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useDesignTokens } from "../../hooks/useDesignTokens";
import { StatusBar } from "expo-status-bar";
import { FontAwesome, MaterialIcons, Feather, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";
import { apiClient } from "../../services/api";
import { couponService } from "../../services/coupon.service";
import { Coupon } from "../../types";
import { CouponCard } from "../../components/CouponCard";
import BackButton from "../../components/BackButton";
import { ErrorBanner } from "../../components/ErrorBanner";
import { DetailPageSkeleton, CouponModalSkeleton } from "../../components/Skeleton";

const { width } = Dimensions.get('window');

interface RestaurantDetail {
  id: string;
  name: string;
  description: string;
  featured_image: string;
  gallery: string[];
  city: string;
  province: string;
  address: string;
  phone: string;
  website: string;
  facebook_url?: string;
  instagram_url?: string;
  tiktok_url?: string;
  twitter_url?: string;
  opening_hours: string;
  rating: string | number;
  price_range: number;
  cuisine_type: string[];
  category_name: string;
  category_id: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
  guide_awards?: {
    guide: {
      id: string;
      title: string;
    };
  }[];
}

export default function RestaurantScreen() {
  const params = useLocalSearchParams();
  const id = params?.id as string;
  const { colors } = useTheme();
  const tokens = useDesignTokens();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'photos'>('info');
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponsError, setCouponsError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    description: true,
    info: true,
    social: false,
    cuisine: true
  });
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      loadRestaurantDetail();
    } else {
      console.error('Restaurant ID is undefined');
      Alert.alert('Errore', 'ID ristorante non valido');
      router.back();
    }
  }, [id]);

  // Removed automatic coupon loading - now loaded only when modal opens

  const loadRestaurantDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const restaurantData = await apiClient.get<RestaurantDetail>(`/restaurants/${id}`);
      setRestaurant(restaurantData);
    } catch (error) {
      console.error('Error loading restaurant detail:', error);
      setError('Impossibile caricare i dettagli del ristorante. Verifica la connessione internet.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadRestaurantCoupons = useCallback(async () => {
    if (!id) return;
    
    try {
      setCouponsLoading(true);
      setCouponsError(null);
      const restaurantCoupons = await couponService.getRestaurantCoupons(id);
      setCoupons(restaurantCoupons);
    } catch (error) {
      console.error('Error loading restaurant coupons:', error);
      setCouponsError('Impossibile caricare i coupon. Riprova più tardi.');
      setCoupons([]);
    } finally {
      setCouponsLoading(false);
    }
  }, [id]);

  const handleGeneraScontoPress = useCallback(() => {
    setShowCouponModal(true);
    // Carica i coupon solo quando viene aperto il modal
    loadRestaurantCoupons();
  }, [loadRestaurantCoupons]);

  const handleShare = useCallback(async () => {
    if (!restaurant) return;
    
    try {
      await Share.share({
        message: `Scopri questo ristorante su AllFood Sicily: ${restaurant.name}`,
        title: restaurant.name,
      });
    } catch (error) {
      // Error sharing
    }
  }, [restaurant]);

  const getPriceRangeSymbol = useCallback((priceRange: number) => {
    return '€'.repeat(Math.max(1, Math.min(4, priceRange)));
  }, []);

  const handlePhoneCall = useCallback(() => {
    if (!restaurant?.phone) {
      Alert.alert('Errore', 'Numero di telefono non disponibile');
      return;
    }
    
    const phoneNumber = restaurant.phone.replace(/\D/g, ''); // Remove non-digits
    const phoneUrl = `tel:${phoneNumber}`;
    
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Errore', 'Impossibile effettuare la chiamata');
        }
      })
      .catch((err) => {
        // Error making phone call
        Alert.alert('Errore', 'Impossibile effettuare la chiamata');
      });
  }, [restaurant?.phone]);

  const handleOpenMaps = useCallback(() => {
    if (!restaurant) return;
    const latitude = restaurant.latitude;
    const longitude = restaurant.longitude;
    const label = encodeURIComponent(restaurant.name);
    const addressQuery = restaurant.address && restaurant.city
      ? encodeURIComponent(`${restaurant.address}, ${restaurant.city}, ${restaurant.province || 'Sicilia'}`)
      : '';

    const openAppleMaps = () => {
      if (latitude && longitude) {
        Linking.openURL(`maps:${latitude},${longitude}?q=${label}`);
      } else if (addressQuery) {
        Linking.openURL(`maps:0,0?q=${addressQuery}`);
      }
    };
    const openGoogleMaps = () => {
      if (latitude && longitude) {
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
      } else if (addressQuery) {
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${addressQuery}`);
      }
    };
    const openBrowser = () => {
      if (latitude && longitude) {
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
      } else if (addressQuery) {
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${addressQuery}`);
      }
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Annulla', 'Apple Maps', 'Google Maps', 'Browser'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) openAppleMaps();
          else if (buttonIndex === 2) openGoogleMaps();
          else if (buttonIndex === 3) openBrowser();
        }
      );
    } else {
      Alert.alert(
        'Apri con',
        'Scegli l\'app per aprire la posizione',
        [
          { text: 'Google Maps', onPress: openGoogleMaps },
          { text: 'Browser', onPress: openBrowser },
          { text: 'Annulla', style: 'cancel' },
        ]
      );
    }
  }, [restaurant]);

  const handleOpenWebsite = useCallback(() => {
    if (!restaurant?.website) {
      Alert.alert('Errore', 'Sito web non disponibile');
      return;
    }
    let url = restaurant.website;
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Errore', 'Impossibile aprire il sito web');
        }
      })
      .catch((err) => {
        // Error opening website
        Alert.alert('Errore', 'Impossibile aprire il sito web');
      });
  }, [restaurant?.website]);

  const toggleSection = useCallback((section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const openLightbox = useCallback((index: number) => {
    setCurrentImageIndex(index);
    setLightboxVisible(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxVisible(false);
  }, []);

  const nextImage = useCallback(() => {
    if (restaurant?.gallery && currentImageIndex < restaurant.gallery.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  }, [restaurant?.gallery, currentImageIndex]);

  const prevImage = useCallback(() => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  }, [currentImageIndex]);

  const CollapsibleSection = ({ title, isExpanded, onToggle, children }: {
    title: string;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
  }) => (
    <View style={styles.collapsibleSection}>
      <TouchableOpacity 
        style={styles.sectionHeader} 
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={`${isExpanded ? 'Chiudi' : 'Apri'} sezione ${title}`}
      >
        <Text style={[styles.sectionTitle, { color: tokens.colors.theme.text.primary }]}>{title}</Text>
        <MaterialIcons 
          name={isExpanded ? "expand-less" : "expand-more"} 
          size={24} 
          color={tokens.colors.theme.text.secondary} 
        />
      </TouchableOpacity>
      {isExpanded && (
        <Animated.View entering={FadeIn.duration(300)}>
          {children}
        </Animated.View>
      )}
    </View>
  );
  
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: tokens.colors.theme.background.primary }]}>
        <DetailPageSkeleton />
      </SafeAreaView>
    );
  }

  if (!restaurant && !loading && !error) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent, { backgroundColor: tokens.colors.theme.background.primary }]}>
        <Text style={[styles.errorText, { color: tokens.colors.theme.text.primary }]}>Ristorante non trovato</Text>
      </SafeAreaView>
    );
  }

  if (error && !loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: tokens.colors.theme.background.primary }]}>
        <View style={styles.errorContainer}>
          <ErrorBanner
            message={error}
            type="error"
            onRetry={loadRestaurantDetail}
            onDismiss={() => {
              setError(null);
              router.back();
            }}
            retryLabel="Riprova"
          />
        </View>
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
            {/* Description Section */}
            <CollapsibleSection
              title="Descrizione"
              isExpanded={expandedSections.description}
              onToggle={() => toggleSection('description')}
            >
              <Text style={[styles.description, { color: tokens.colors.theme.text.secondary }]}>
                {restaurant.description}
              </Text>
            </CollapsibleSection>
            
            {/* Contact Info Section */}
            <CollapsibleSection
              title="Informazioni di Contatto"
              isExpanded={expandedSections.info}
              onToggle={() => toggleSection('info')}
            >
              <View style={styles.infoItem}>
                <MaterialIcons name="location-on" size={20} color={tokens.colors.theme.brand.primary} />
                <Text style={[styles.infoText, { color: tokens.colors.theme.text.primary }]}>
                  {restaurant.address}, {restaurant.city}, {restaurant.province}
                </Text>
              </View>
              {restaurant.opening_hours && (
                <View style={styles.infoItem}>
                  <MaterialIcons name="access-time" size={20} color={tokens.colors.theme.brand.primary} />
                  <Text style={[styles.infoText, { color: tokens.colors.theme.text.primary }]}>{restaurant.opening_hours}</Text>
                </View>
              )}
              {restaurant.phone && (
                <View style={styles.infoItem}>
                  <MaterialIcons name="phone" size={20} color={tokens.colors.theme.brand.primary} />
                  <Text style={[styles.infoText, { color: tokens.colors.theme.text.primary }]}>{restaurant.phone}</Text>
                </View>
              )}
              {restaurant.website && (
                <View style={styles.infoItem}>
                  <MaterialIcons name="language" size={20} color={tokens.colors.theme.brand.primary} />
                  <Text style={[styles.infoText, { color: tokens.colors.theme.text.primary }]}>{restaurant.website}</Text>
                </View>
              )}
            </CollapsibleSection>
            
            {/* Social Media Section */}
            {(restaurant.facebook_url || restaurant.instagram_url || restaurant.tiktok_url || restaurant.twitter_url) && (
              <CollapsibleSection
                title="Social Media"
                isExpanded={expandedSections.social}
                onToggle={() => toggleSection('social')}
              >
                <View style={styles.socialMediaContainer}>
                  {restaurant.facebook_url && (
                    <TouchableOpacity
                      style={[styles.socialButton, { backgroundColor: '#1877F2' + '20' }, tokens.helpers.touchTarget('recommended')]}
                      onPress={() => Linking.openURL(restaurant.facebook_url!)}
                      accessibilityRole="link"
                      accessibilityLabel="Apri pagina Facebook"
                      accessibilityHint={`Apre la pagina Facebook di ${restaurant.name}`}
                    >
                      <MaterialIcons name="facebook" size={24} color="#1877F2" />
                      <Text style={[styles.socialText, { color: '#1877F2' }]}>Facebook</Text>
                    </TouchableOpacity>
                  )}
                  {restaurant.instagram_url && (
                    <TouchableOpacity
                      style={[styles.socialButton, { backgroundColor: '#E4405F' + '20' }, tokens.helpers.touchTarget('recommended')]}
                      onPress={() => Linking.openURL(restaurant.instagram_url!)}
                      accessibilityRole="link"
                      accessibilityLabel="Apri profilo Instagram"
                      accessibilityHint={`Apre il profilo Instagram di ${restaurant.name}`}
                    >
                      <MaterialIcons name="camera-alt" size={24} color="#E4405F" />
                      <Text style={[styles.socialText, { color: '#E4405F' }]}>Instagram</Text>
                    </TouchableOpacity>
                  )}
                  {restaurant.tiktok_url && (
                    <TouchableOpacity
                      style={[styles.socialButton, { backgroundColor: '#000000' + '20' }, tokens.helpers.touchTarget('recommended')]}
                      onPress={() => Linking.openURL(restaurant.tiktok_url!)}
                      accessibilityRole="link"
                      accessibilityLabel="Apri profilo TikTok"
                      accessibilityHint={`Apre il profilo TikTok di ${restaurant.name}`}
                    >
                      <MaterialIcons name="music-note" size={24} color="#000000" />
                      <Text style={[styles.socialText, { color: '#000000' }]}>TikTok</Text>
                    </TouchableOpacity>
                  )}
                  {restaurant.twitter_url && (
                    <TouchableOpacity
                      style={[styles.socialButton, { backgroundColor: '#1DA1F2' + '20' }, tokens.helpers.touchTarget('recommended')]}
                      onPress={() => Linking.openURL(restaurant.twitter_url!)}
                      accessibilityRole="link"
                      accessibilityLabel="Apri profilo Twitter"
                      accessibilityHint={`Apre il profilo Twitter di ${restaurant.name}`}
                    >
                      <MaterialIcons name="alternate-email" size={24} color="#1DA1F2" />
                      <Text style={[styles.socialText, { color: '#1DA1F2' }]}>Twitter</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </CollapsibleSection>
            )}
            
            {/* Cuisine Type Section */}
            {restaurant.cuisine_type && restaurant.cuisine_type.length > 0 && (
              <CollapsibleSection
                title="Tipo di Cucina"
                isExpanded={expandedSections.cuisine}
                onToggle={() => toggleSection('cuisine')}
              >
                <View style={styles.tagsContainer}>
                  {restaurant.cuisine_type.map((cuisine, index) => (
                    <View key={index} style={[styles.tag, { backgroundColor: tokens.colors.theme.brand.primary + '20' }]}>
                      <Text style={[styles.tagText, { color: tokens.colors.theme.brand.primary }]}>{cuisine}</Text>
                    </View>
                  ))}
                </View>
              </CollapsibleSection>
            )}

            {/* Date Info */}
            <View style={styles.dateContainer}>
              <Text style={[styles.dateText, { color: tokens.colors.theme.text.tertiary }]}>
                Aggiunto il {new Date(restaurant.created_at).toLocaleDateString('it-IT')}
              </Text>
            </View>
          </Animated.View>
        );
      
      case 'photos':
        return (
          <Animated.View 
            style={styles.contentContainer}
            entering={FadeIn.duration(500)}
          >
            {restaurant.gallery && restaurant.gallery.length > 0 ? (
              <>
                <Text style={[styles.galleryCounter, { color: tokens.colors.theme.text.secondary }]}>
                  {restaurant.gallery.length} {restaurant.gallery.length === 1 ? 'foto' : 'foto'}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScrollView}>
                  {restaurant.gallery.map((image, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => openLightbox(index)}
                      style={styles.galleryImageContainer}
                      accessibilityRole="button"
                      accessibilityLabel={`Foto ${index + 1} di ${restaurant.gallery.length}`}
                      accessibilityHint="Tocca per visualizzare a schermo intero"
                    >
                      <Image
                        source={{ uri: image }}
                        style={styles.galleryImage}
                      />
                      <View style={styles.imageOverlay}>
                        <MaterialIcons name="zoom-in" size={24} color="white" />
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            ) : (
              <Text style={[styles.emptyText, { color: tokens.colors.theme.text.tertiary }]}>
                Nessuna foto disponibile
              </Text>
            )}
          </Animated.View>
        );

    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: restaurant.name,
          headerStyle: { backgroundColor: tokens.colors.theme.surface.primary },
          headerTintColor: tokens.colors.theme.text.primary,
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleShare} 
              style={[styles.shareButton, tokens.helpers.touchTarget('minimum')]}
              accessibilityRole="button"
              accessibilityLabel="Condividi ristorante"
              accessibilityHint="Condivide le informazioni del ristorante con altre app"
            >
              <FontAwesome name="share" size={20} color={tokens.colors.theme.brand.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <SafeAreaView style={[styles.container, { backgroundColor: tokens.colors.theme.background.primary }]}>
        {error && (
          <ErrorBanner
            message={error}
            type="error"
            onRetry={loadRestaurantDetail}
            onDismiss={() => setError(null)}
          />
        )}
        
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Featured Image */}
          <Animated.View entering={FadeInUp.duration(800)}>
            <Image
              source={{ 
                uri: restaurant.featured_image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' 
              }}
              style={styles.featuredImage}
            />
            
            <BackButton style={styles.backButton} />
            
            {/* Category Badge */}
            <View style={[styles.categoryBadge, { backgroundColor: tokens.colors.theme.brand.primary }]}>
              <Text style={styles.categoryBadgeText}>{restaurant.category_name || 'Ristorante'}</Text>
            </View>
          </Animated.View>

          <View style={styles.content}>
            {/* Title and Rating */}
            <Animated.View entering={FadeInDown.delay(200)}>
              <View style={styles.titleRow}>
                <View style={styles.titleContainer}>
                  <Text style={[styles.title, { color: tokens.colors.theme.text.primary }]}>{restaurant.name}</Text>
                  {restaurant.guide_awards && restaurant.guide_awards.length > 0 && (
                    <View style={styles.guidesContainer}>
                      <MaterialIcons name="menu-book" size={16} color={tokens.colors.theme.brand.primary} />
                      <Text style={[styles.guidesText, { color: tokens.colors.theme.brand.primary }]}>
                        Citato in: {restaurant.guide_awards.map(award => award.guide.title).join(', ')}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.ratingBadge}>
                  <FontAwesome name="star" size={16} color="#FFD700" />
                  <Text style={[styles.ratingText, { color: tokens.colors.theme.text.primary }]}>
                    {restaurant.rating ? parseFloat(restaurant.rating.toString()).toFixed(1) : 'N/A'}
                  </Text>
                </View>
              </View>
              <View style={styles.locationPriceRow}>
                <View style={styles.locationContainer}>
                  <MaterialIcons name="location-on" size={16} color={tokens.colors.theme.brand.primary} />
                  <Text style={[styles.locationText, { color: tokens.colors.theme.text.secondary }]}>
                    {restaurant.city}, {restaurant.province}
                  </Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={[styles.priceText, { color: tokens.colors.theme.brand.primary }]}>
                    {getPriceRangeSymbol(restaurant.price_range || 2)}
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Action Buttons */}
            <Animated.View entering={FadeInDown.delay(350)} style={styles.actionButtonsContainer}>
              {restaurant.phone && (
                <View style={styles.actionButtonWrapper}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.circleButton, { backgroundColor: tokens.colors.theme.brand.primary }, tokens.helpers.touchTarget('comfortable')]}
                    onPress={handlePhoneCall}
                    accessibilityRole="button"
                    accessibilityLabel="Chiama ristorante"
                    accessibilityHint={`Chiama il numero ${restaurant.phone}`}
                  >
                    <MaterialIcons name="phone" size={24} color="white" />
                  </TouchableOpacity>
                  <Text style={[styles.actionButtonLabel, { color: tokens.colors.theme.text.secondary }]}>Chiama</Text>
                </View>
              )}
              <View style={styles.actionButtonWrapper}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.circleButton, { backgroundColor: tokens.colors.theme.brand.primary }, tokens.helpers.touchTarget('comfortable')]}
                  onPress={handleOpenMaps}
                  accessibilityRole="button"
                  accessibilityLabel="Apri mappe"
                  accessibilityHint={`Visualizza ${restaurant.name} sulla mappa`}
                >
                  <MaterialIcons name="map" size={24} color="white" />
                </TouchableOpacity>
                <Text style={[styles.actionButtonLabel, { color: tokens.colors.theme.text.secondary }]}>Mappa</Text>
              </View>
              {restaurant.website && (
                <View style={styles.actionButtonWrapper}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.circleButton, { backgroundColor: tokens.colors.theme.brand.primary }, tokens.helpers.touchTarget('comfortable')]}
                    onPress={handleOpenWebsite}
                    accessibilityRole="button"
                    accessibilityLabel="Visita sito web"
                    accessibilityHint={`Apre il sito web ${restaurant.website}`}
                  >
                    <MaterialIcons name="language" size={24} color="white" />
                  </TouchableOpacity>
                  <Text style={[styles.actionButtonLabel, { color: tokens.colors.theme.text.secondary }]}>Sito</Text>
                </View>
              )}
            </Animated.View>

            {/* Tab Navigation */}
            <Animated.View entering={FadeInDown.delay(400)} style={[styles.tabBar, { backgroundColor: tokens.colors.theme.surface.primary }]}>
              <TouchableOpacity 
                style={[
                  styles.tabItem, 
                  activeTab === 'info' && { borderBottomColor: tokens.colors.theme.brand.primary, borderBottomWidth: 2 },
                  tokens.helpers.touchTarget('recommended')
                ]}
                onPress={() => setActiveTab('info')}
                accessibilityRole="tab"
                accessibilityLabel="Informazioni ristorante"
                accessibilityState={{ selected: activeTab === 'info' }}
              >
                <Text 
                  style={[
                    styles.tabText, 
                    { color: activeTab === 'info' ? tokens.colors.theme.brand.primary : tokens.colors.theme.text.primary }
                  ]}
                >
                  Info
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.tabItem, 
                  activeTab === 'photos' && { borderBottomColor: tokens.colors.theme.brand.primary, borderBottomWidth: 2 },
                  tokens.helpers.touchTarget('recommended')
                ]}
                onPress={() => setActiveTab('photos')}
                accessibilityRole="tab"
                accessibilityLabel="Foto ristorante"
                accessibilityState={{ selected: activeTab === 'photos' }}
              >
                <Text 
                  style={[
                    styles.tabText, 
                    { color: activeTab === 'photos' ? tokens.colors.theme.brand.primary : tokens.colors.theme.text.primary }
                  ]}
                >
                  Foto
                </Text>
              </TouchableOpacity>
            </Animated.View>
            
            {/* Tab Content */}
            {renderTabContent()}
          </View>
        </ScrollView>

        {/* Fixed "Genera Sconto" Button */}
        <Animated.View 
          entering={FadeInUp.delay(600)}
          style={styles.fixedButton}
        >
          <TouchableOpacity
            style={[styles.generateButton, { backgroundColor: tokens.colors.theme.brand.primary }, tokens.helpers.touchTarget('comfortable')]}
            onPress={handleGeneraScontoPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Genera sconto"
            accessibilityHint="Apre il modal con i coupon disponibili per questo ristorante"
          >
            <MaterialIcons name="local-offer" size={24} color="white" />
            <Text style={styles.generateButtonText}>Genera Sconto</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Coupon Modal */}
        <Modal
          visible={showCouponModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowCouponModal(false)}
        >
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: tokens.colors.theme.background.primary }]}>
            <View style={[styles.modalHeader, { borderBottomColor: tokens.colors.theme.border.primary }]}>
              <Text style={[styles.modalTitle, { color: tokens.colors.theme.text.primary }]}>
                Coupon Disponibili
              </Text>
              <TouchableOpacity
                onPress={() => setShowCouponModal(false)}
                style={[styles.closeButton, tokens.helpers.touchTarget('minimum')]}
                accessibilityRole="button"
                accessibilityLabel="Chiudi modal coupon"
              >
                <MaterialIcons name="close" size={24} color={tokens.colors.theme.text.primary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              {couponsError && (
                <ErrorBanner
                  message={couponsError}
                  type="error"
                  onRetry={loadRestaurantCoupons}
                  onDismiss={() => setCouponsError(null)}
                />
              )}
              
              {couponsLoading ? (
                <CouponModalSkeleton />
              ) : coupons.length > 0 ? (
                <View style={styles.couponsContainer}>
                  {coupons.map((coupon) => (
                    <CouponCard
                      key={coupon.id}
                      coupon={coupon}
                      style={{ marginBottom: 16 }}
                      showRestaurantName={false}
                      onDownload={(coupon) => {
                        console.log('Coupon scaricato:', coupon.title);
                      }}
                      onUse={(coupon) => {
                        console.log('Coupon utilizzato:', coupon.title);
                        // Ricarica i coupon dopo l'uso
                        loadRestaurantCoupons();
                      }}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="local-offer" size={64} color={tokens.colors.theme.text.disabled} />
                  <Text style={[styles.emptyText, { color: tokens.colors.theme.text.tertiary, marginTop: tokens.spacing[4] }]}>
                    Nessun coupon disponibile per questo ristorante
                  </Text>
                  <Text style={[styles.emptySubText, { color: tokens.colors.theme.text.disabled, marginTop: tokens.spacing[2] }]}>
                    Torna presto per nuove offerte!
                  </Text>
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Lightbox Modal */}
        <Modal
          visible={lightboxVisible}
          animationType="fade"
          statusBarTranslucent
          onRequestClose={closeLightbox}
        >
          <SafeAreaView style={styles.lightboxContainer}>
            <View style={styles.lightboxHeader}>
              <TouchableOpacity
                onPress={closeLightbox}
                style={[styles.lightboxCloseButton, tokens.helpers.touchTarget('comfortable')]}
                accessibilityRole="button"
                accessibilityLabel="Chiudi galleria"
              >
                <MaterialIcons name="close" size={28} color="white" />
              </TouchableOpacity>
              {restaurant?.gallery && (
                <Text style={styles.lightboxCounter}>
                  {currentImageIndex + 1} di {restaurant.gallery.length}
                </Text>
              )}
            </View>
            
            {restaurant?.gallery && (
              <View style={styles.lightboxImageContainer}>
                <Image
                  source={{ uri: restaurant.gallery[currentImageIndex] }}
                  style={styles.lightboxImage}
                  resizeMode="contain"
                />
                
                {/* Navigation Arrows */}
                {currentImageIndex > 0 && (
                  <TouchableOpacity
                    style={[styles.lightboxNavButton, styles.lightboxNavLeft]}
                    onPress={prevImage}
                    accessibilityRole="button"
                    accessibilityLabel="Foto precedente"
                  >
                    <MaterialIcons name="chevron-left" size={32} color="white" />
                  </TouchableOpacity>
                )}
                
                {currentImageIndex < restaurant.gallery.length - 1 && (
                  <TouchableOpacity
                    style={[styles.lightboxNavButton, styles.lightboxNavRight]}
                    onPress={nextImage}
                    accessibilityRole="button"
                    accessibilityLabel="Foto successiva"
                  >
                    <MaterialIcons name="chevron-right" size={32} color="white" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  shareButton: {
    marginRight: 16,
  },
  featuredImage: {
    width: width,
    height: width * 0.6,
  },
  categoryBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
    lineHeight: 36,
  },
  locationPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 16,
    marginLeft: 4,
    flex: 1,
  },
  priceContainer: {
    marginLeft: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  actionButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  circleButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    marginBottom: 8,
  },
  actionButtonLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  tabText: {
    fontWeight: '600',
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
  },
  collapsibleSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateContainer: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 20,
  },
  dateText: {
    fontSize: 12,
    marginBottom: 4,
  },
  galleryCounter: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  galleryScrollView: {
    marginHorizontal: -4,
  },
  galleryImageContainer: {
    position: 'relative',
    marginHorizontal: 4,
  },
  galleryImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginRight: 8,
  },
  imageOverlay: {
    position: 'absolute',
    top: 8,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 40,
  },
  lightboxContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  lightboxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    zIndex: 1000,
  },
  lightboxCloseButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  lightboxCounter: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  lightboxImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  lightboxImage: {
    width: width,
    height: '100%',
  },
  lightboxNavButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 24,
    padding: 8,
  },
  lightboxNavLeft: {
    left: 20,
  },
  lightboxNavRight: {
    right: 20,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1000,
  },
  fixedButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: 'transparent',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  generateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  couponsContainer: {
    paddingVertical: 16,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  guidesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  guidesText: {
    fontSize: 12,
    marginLeft: 4,
    fontStyle: 'italic',
    flex: 1,
  },
  socialMediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: '47%',
    justifyContent: 'center',
  },
  socialText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
}); 