import React, { useState, useEffect, useMemo, useCallback } from "react";
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Dimensions, ActivityIndicator, Alert, Share, Linking, Platform, ActionSheetIOS, Modal } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useDesignTokens } from "../../hooks/useDesignTokens";
import { StatusBar } from "expo-status-bar";
import { FontAwesome, MaterialIcons, Feather, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";
import { apiClient } from "../../services/api";
import BackButton from "../../components/BackButton";
import { ErrorBanner } from "../../components/ErrorBanner";
import { DetailPageSkeleton } from "../../components/Skeleton";

const { width } = Dimensions.get('window');

interface HotelDetail {
  id: string;
  name: string;
  description: string;
  featured_image: string;
  gallery: string[];
  city: string;
  province: string;
  address: string;
  postal_code?: string;
  phone: string;
  email?: string;
  website: string;
  hotel_type: string[];
  star_rating?: number;
  rating: string | number;
  review_count: number;
  price_range: number;
  category_name: string;
  category_id: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
}

export default function HotelScreen() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const { colors } = useTheme();
  const tokens = useDesignTokens();
  const router = useRouter();
  const [hotel, setHotel] = useState<HotelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'photos'>('info');
  const [error, setError] = useState<string | null>(null);
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    description: true,
    info: true,
    type: true,
    reviews: false
  });

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadHotelDetail();
    } else {
      console.error('Hotel ID is undefined or invalid');
      Alert.alert('Errore', 'ID hotel non valido');
      router.back();
    }
  }, [id]);

  const loadHotelDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const hotelData = await apiClient.get<any>(`/hotels/${id}`);
      // Handle both direct response and wrapped response
      const hotelDetail = hotelData.data || hotelData;
      setHotel(hotelDetail);
    } catch (error) {
      console.error('Error loading hotel detail:', error);
      setError('Impossibile caricare i dettagli dell\'hotel. Verifica la connessione internet.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleShare = useCallback(async () => {
    if (!hotel) return;
    
    try {
      await Share.share({
        message: `Scopri questo hotel su AllFood Sicily: ${hotel.name}`,
        title: hotel.name,
      });
    } catch (error) {
      // Error sharing
    }
  }, [hotel]);

  const getPriceRangeSymbol = useCallback((priceRange: number) => {
    return '€'.repeat(Math.max(1, Math.min(4, priceRange)));
  }, []);

  const getStarRating = useCallback((stars: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FontAwesome
        key={index}
        name={index < stars ? "star" : "star-o"}
        size={16}
        color="#FFD700"
        style={{ marginRight: 2 }}
      />
    ));
  }, []);

  const handlePhoneCall = useCallback(() => {
    if (!hotel?.phone) {
      Alert.alert('Errore', 'Numero di telefono non disponibile');
      return;
    }
    
    const phoneNumber = hotel.phone.replace(/\D/g, ''); // Remove non-digits
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
  }, [hotel?.phone]);

  const handleOpenMaps = useCallback(() => {
    if (!hotel) return;
    const latitude = hotel.latitude;
    const longitude = hotel.longitude;
    const label = encodeURIComponent(hotel.name);
    const addressQuery = hotel.address && hotel.city
      ? encodeURIComponent(`${hotel.address}, ${hotel.city}, ${hotel.province || 'Sicilia'}`)
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
  }, [hotel]);

  const handleOpenWebsite = useCallback(() => {
    if (!hotel?.website) {
      Alert.alert('Errore', 'Sito web non disponibile');
      return;
    }
    let url = hotel.website;
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
  }, [hotel?.website]);

  const handleEmailContact = useCallback(() => {
    if (!hotel?.email) {
      Alert.alert('Errore', 'Email non disponibile');
      return;
    }
    
    const emailUrl = `mailto:${hotel.email}`;
    Linking.canOpenURL(emailUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(emailUrl);
        } else {
          Alert.alert('Errore', 'Impossibile aprire l\'app email');
        }
      })
      .catch((err) => {
        // Error opening email
        Alert.alert('Errore', 'Impossibile aprire l\'app email');
      });
  }, [hotel?.email]);

  const openLightbox = useCallback((index: number) => {
    setCurrentImageIndex(index);
    setLightboxVisible(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxVisible(false);
  }, []);

  const nextImage = useCallback(() => {
    if (hotel?.gallery && currentImageIndex < hotel.gallery.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  }, [hotel?.gallery, currentImageIndex]);

  const prevImage = useCallback(() => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  }, [currentImageIndex]);

  const toggleSection = useCallback((section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

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

  if (!hotel && !loading && !error) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent, { backgroundColor: tokens.colors.theme.background.primary }]}>
        <Text style={[styles.errorText, { color: tokens.colors.theme.text.primary }]}>Hotel non trovato</Text>
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
            onRetry={loadHotelDetail}
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
                {hotel.description}
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
                  {hotel.address}, {hotel.city}, {hotel.province}
                  {hotel.postal_code && ` - ${hotel.postal_code}`}
                </Text>
              </View>
              {hotel.phone && (
                <View style={styles.infoItem}>
                  <MaterialIcons name="phone" size={20} color={tokens.colors.theme.brand.primary} />
                  <Text style={[styles.infoText, { color: tokens.colors.theme.text.primary }]}>{hotel.phone}</Text>
                </View>
              )}
              {hotel.email && (
                <View style={styles.infoItem}>
                  <MaterialIcons name="email" size={20} color={tokens.colors.theme.brand.primary} />
                  <Text style={[styles.infoText, { color: tokens.colors.theme.text.primary }]}>{hotel.email}</Text>
                </View>
              )}
              {hotel.website && (
                <View style={styles.infoItem}>
                  <MaterialIcons name="language" size={20} color={tokens.colors.theme.brand.primary} />
                  <Text style={[styles.infoText, { color: tokens.colors.theme.text.primary }]}>{hotel.website}</Text>
                </View>
              )}
            </CollapsibleSection>
            
            {/* Hotel Type Section */}
            {hotel.hotel_type && hotel.hotel_type.length > 0 && (
              <CollapsibleSection
                title="Tipo di Struttura"
                isExpanded={expandedSections.type}
                onToggle={() => toggleSection('type')}
              >
                <View style={styles.tagsContainer}>
                  {hotel.hotel_type.map((type, index) => (
                    <View key={index} style={[styles.tag, { backgroundColor: tokens.colors.theme.brand.primary + '20' }]}>
                      <Text style={[styles.tagText, { color: tokens.colors.theme.brand.primary }]}>
                        {type.charAt(0).toUpperCase() + type.slice(1).replace('&', ' & ')}
                      </Text>
                    </View>
                  ))}
                </View>
              </CollapsibleSection>
            )}

            {/* Reviews Section */}
            {hotel.review_count > 0 && (
              <CollapsibleSection
                title="Recensioni"
                isExpanded={expandedSections.reviews}
                onToggle={() => toggleSection('reviews')}
              >
                <View style={styles.reviewsContainer}>
                  <Text style={[styles.reviewsText, { color: tokens.colors.theme.text.primary }]}>
                    {hotel.review_count} recensioni
                  </Text>
                </View>
              </CollapsibleSection>
            )}

            {/* Date Info */}
            <View style={styles.dateContainer}>
              <Text style={[styles.dateText, { color: tokens.colors.theme.text.tertiary }]}>
                Aggiunto il {new Date(hotel.created_at).toLocaleDateString('it-IT')}
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
            {hotel.gallery && hotel.gallery.length > 0 ? (
              <>
                <Text style={[styles.galleryCounter, { color: tokens.colors.theme.text.secondary }]}>
                  {hotel.gallery.length} {hotel.gallery.length === 1 ? 'foto' : 'foto'}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScrollView}>
                  {hotel.gallery.map((image, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => openLightbox(index)}
                      style={styles.galleryImageContainer}
                      accessibilityRole="button"
                      accessibilityLabel={`Foto ${index + 1} di ${hotel.gallery.length}`}
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
          title: hotel.name,
          headerStyle: { backgroundColor: tokens.colors.theme.surface.primary },
          headerTintColor: tokens.colors.theme.text.primary,
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleShare} 
              style={[styles.shareButton, tokens.helpers.touchTarget('minimum')]}
              accessibilityRole="button"
              accessibilityLabel="Condividi hotel"
              accessibilityHint="Condivide le informazioni dell'hotel con altre app"
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
            onRetry={loadHotelDetail}
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
                uri: hotel.featured_image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' 
              }}
              style={styles.featuredImage}
            />
            
            <BackButton style={styles.backButton} />
            
            {/* Category Badge */}
            <View style={[styles.categoryBadge, { backgroundColor: tokens.colors.theme.brand.primary }]}>
              <Text style={styles.categoryBadgeText}>{hotel.category_name || 'Hotel'}</Text>
            </View>
          </Animated.View>

          <View style={styles.content}>
            {/* Title and Rating */}
            <Animated.View entering={FadeInDown.delay(200)}>
              <View style={styles.titleRow}>
                <View style={styles.titleContainer}>
                  <Text style={[styles.title, { color: tokens.colors.theme.text.primary }]}>{hotel.name}</Text>
                  {/* Star Rating */}
                  {hotel.star_rating && (
                    <View style={styles.starRatingContainer}>
                      <View style={styles.starsRow}>
                        {getStarRating(hotel.star_rating)}
                      </View>
                      <Text style={[styles.starRatingText, { color: tokens.colors.theme.text.secondary }]}>
                        {hotel.star_rating} stelle
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.ratingBadge}>
                  <FontAwesome name="star" size={16} color="#FFD700" />
                  <Text style={[styles.ratingText, { color: tokens.colors.theme.text.primary }]}>
                    {hotel.rating ? parseFloat(hotel.rating.toString()).toFixed(1) : 'N/A'}
                  </Text>
                </View>
              </View>
              <View style={styles.locationPriceRow}>
                <View style={styles.locationContainer}>
                  <MaterialIcons name="location-on" size={16} color={tokens.colors.theme.brand.primary} />
                  <Text style={[styles.locationText, { color: tokens.colors.theme.text.secondary }]}>
                    {hotel.city}, {hotel.province}
                  </Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={[styles.priceText, { color: tokens.colors.theme.brand.primary }]}>
                    {getPriceRangeSymbol(hotel.price_range || 2)}
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Action Buttons */}
            <Animated.View entering={FadeInDown.delay(350)} style={styles.actionButtonsContainer}>
              {hotel.phone && (
                <View style={styles.actionButtonWrapper}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.circleButton, { backgroundColor: tokens.colors.theme.brand.primary }, tokens.helpers.touchTarget('comfortable')]}
                    onPress={handlePhoneCall}
                    accessibilityRole="button"
                    accessibilityLabel="Chiama hotel"
                    accessibilityHint={`Chiama il numero ${hotel.phone}`}
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
                  accessibilityHint={`Visualizza ${hotel.name} sulla mappa`}
                >
                  <MaterialIcons name="map" size={24} color="white" />
                </TouchableOpacity>
                <Text style={[styles.actionButtonLabel, { color: tokens.colors.theme.text.secondary }]}>Mappa</Text>
              </View>
              {hotel.website && (
                <View style={styles.actionButtonWrapper}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.circleButton, { backgroundColor: tokens.colors.theme.brand.primary }, tokens.helpers.touchTarget('comfortable')]}
                    onPress={handleOpenWebsite}
                    accessibilityRole="button"
                    accessibilityLabel="Visita sito web"
                    accessibilityHint={`Apre il sito web ${hotel.website}`}
                  >
                    <MaterialIcons name="language" size={24} color="white" />
                  </TouchableOpacity>
                  <Text style={[styles.actionButtonLabel, { color: tokens.colors.theme.text.secondary }]}>Sito</Text>
                </View>
              )}
              {hotel.email && (
                <View style={styles.actionButtonWrapper}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.circleButton, { backgroundColor: tokens.colors.theme.brand.primary }, tokens.helpers.touchTarget('comfortable')]}
                    onPress={handleEmailContact}
                    accessibilityRole="button"
                    accessibilityLabel="Invia email"
                    accessibilityHint={`Invia una email a ${hotel.email}`}
                  >
                    <MaterialIcons name="email" size={24} color="white" />
                  </TouchableOpacity>
                  <Text style={[styles.actionButtonLabel, { color: tokens.colors.theme.text.secondary }]}>Email</Text>
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
                accessibilityLabel="Informazioni hotel"
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
                accessibilityLabel="Foto hotel"
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

        {/* Fixed CTA Button */}
        <Animated.View 
          entering={FadeInUp.delay(600)}
          style={styles.fixedButton}
        >
          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: tokens.colors.theme.brand.primary }, tokens.helpers.touchTarget('comfortable')]}
            onPress={hotel.phone ? handlePhoneCall : handleEmailContact}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={hotel.phone ? "Chiama per prenotare" : "Contatta via email"}
            accessibilityHint={hotel.phone ? `Chiama il numero ${hotel.phone}` : `Invia una email a ${hotel.email}`}
          >
            <MaterialIcons 
              name={hotel.phone ? "phone" : "email"} 
              size={24} 
              color="white" 
            />
            <Text style={styles.ctaButtonText}>
              {hotel.phone ? "Chiama per Prenotare" : "Richiedi Info"}
            </Text>
          </TouchableOpacity>
        </Animated.View>

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
              {hotel?.gallery && (
                <Text style={styles.lightboxCounter}>
                  {currentImageIndex + 1} di {hotel.gallery.length}
                </Text>
              )}
            </View>
            
            {hotel?.gallery && (
              <View style={styles.lightboxImageContainer}>
                <Image
                  source={{ uri: hotel.gallery[currentImageIndex] }}
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
                
                {currentImageIndex < hotel.gallery.length - 1 && (
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
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 36,
    marginBottom: 8,
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
  starRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  starsRow: {
    flexDirection: 'row',
    marginRight: 8,
  },
  starRatingText: {
    fontSize: 12,
    fontWeight: '600',
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
  reviewsContainer: {
    marginTop: 8,
  },
  reviewsText: {
    fontSize: 16,
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
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  ctaButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});