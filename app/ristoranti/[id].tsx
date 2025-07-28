import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Dimensions, ActivityIndicator, Alert, Share, Linking, Platform, ActionSheetIOS } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { StatusBar } from "expo-status-bar";
import { FontAwesome, MaterialIcons, Feather, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";
import { apiClient } from "../../services/api";
import BackButton from "../../components/BackButton";

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
}

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, colorScheme } = useTheme();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'photos'>('info');

  useEffect(() => {
    if (id) {
      loadRestaurantDetail();
    }
  }, [id]);

  const loadRestaurantDetail = async () => {
    try {
      setLoading(true);
      const restaurantData = await apiClient.get<RestaurantDetail>(`/restaurants/${id}`);
      setRestaurant(restaurantData);
    } catch (error) {
      console.error('Error loading restaurant detail:', error);
      Alert.alert('Errore', 'Impossibile caricare i dettagli del ristorante');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!restaurant) return;
    
    try {
      await Share.share({
        message: `Scopri questo ristorante su AllFood Sicily: ${restaurant.name}`,
        title: restaurant.name,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getPriceRangeSymbol = (priceRange: number) => {
    return '€'.repeat(Math.max(1, Math.min(4, priceRange)));
  };

  const handlePhoneCall = () => {
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
        console.error('Error making phone call:', err);
        Alert.alert('Errore', 'Impossibile effettuare la chiamata');
      });
  };

  const handleOpenMaps = () => {
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
  };

  const handleOpenWebsite = () => {
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
        console.error('Error opening website:', err);
        Alert.alert('Errore', 'Impossibile aprire il sito web');
      });
  };
  
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Caricamento...</Text>
      </SafeAreaView>
    );
  }

  if (!restaurant) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Ristorante non trovato</Text>
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
              <Text style={[styles.infoText, { color: colors.text }]}>
                {restaurant.address}, {restaurant.city}, {restaurant.province}
              </Text>
            </View>
            {restaurant.opening_hours && (
              <View style={styles.infoItem}>
                <MaterialIcons name="access-time" size={20} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.text }]}>{restaurant.opening_hours}</Text>
              </View>
            )}
            {restaurant.phone && (
              <View style={styles.infoItem}>
                <MaterialIcons name="phone" size={20} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.text }]}>{restaurant.phone}</Text>
              </View>
            )}
            {restaurant.website && (
              <View style={styles.infoItem}>
                <MaterialIcons name="language" size={20} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.text }]}>{restaurant.website}</Text>
              </View>
            )}
            
            {/* Cuisine Type */}
            {restaurant.cuisine_type && restaurant.cuisine_type.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>Tipo di Cucina</Text>
                <View style={styles.tagsContainer}>
                  {restaurant.cuisine_type.map((cuisine, index) => (
                    <View key={index} style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.tagText, { color: colors.primary }]}>{cuisine}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Date Info */}
            <View style={styles.dateContainer}>
              <Text style={[styles.dateText, { color: colors.text + '60' }]}>
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
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {restaurant.gallery.map((image, index) => (
                  <Image
                    key={index}
                    source={{ uri: image }}
                    style={styles.galleryImage}
                  />
                ))}
              </ScrollView>
            ) : (
              <Text style={[styles.emptyText, { color: colors.text + '60' }]}>
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
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerRight: () => (
            <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
              <FontAwesome name="share" size={20} color={colors.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
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
            <View style={[styles.categoryBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.categoryBadgeText}>{restaurant.category_name || 'Ristorante'}</Text>
            </View>
          </Animated.View>

          <View style={styles.content}>
            {/* Title and Location */}
            <Animated.View entering={FadeInDown.delay(200)}>
              <View style={styles.titleRow}>
                <Text style={[styles.title, { color: colors.text }]}>{restaurant.name}</Text>
                <View style={styles.ratingContainer}>
                  <FontAwesome name="star" size={16} color="#FFD700" />
                  <Text style={[styles.ratingText, { color: colors.text }]}>
                    {restaurant.rating ? parseFloat(restaurant.rating.toString()).toFixed(1) : 'N/A'}
                  </Text>
                </View>
              </View>
              <View style={styles.locationRow}>
                <MaterialIcons name="location-on" size={16} color={colors.primary} />
                <Text style={[styles.locationText, { color: colors.text + '80' }]}>
                  {restaurant.city}, {restaurant.province}
                </Text>
                <Text style={[styles.priceText, { color: colors.primary }]}>
                  {getPriceRangeSymbol(restaurant.price_range || 2)}
                </Text>
              </View>
            </Animated.View>

            {/* Action Buttons */}
            <Animated.View entering={FadeInDown.delay(350)} style={styles.actionButtonsContainer}>
              {restaurant.phone && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.circleButton, { backgroundColor: colors.primary }]}
                  onPress={handlePhoneCall}
                >
                  <MaterialIcons name="phone" size={24} color="white" />
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={[styles.actionButton, styles.circleButton, { backgroundColor: colors.primary }]}
                onPress={handleOpenMaps}
              >
                <MaterialIcons name="map" size={24} color="white" />
              </TouchableOpacity>
              {restaurant.website && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.circleButton, { backgroundColor: colors.primary }]}
                  onPress={handleOpenWebsite}
                >
                  <MaterialIcons name="language" size={24} color="white" />
                </TouchableOpacity>
              )}
            </Animated.View>

            {/* Tab Navigation */}
            <Animated.View entering={FadeInDown.delay(400)} style={[styles.tabBar, { backgroundColor: colors.card }]}>
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
            </Animated.View>
            
            {/* Tab Content */}
            {renderTabContent()}
          </View>
        </ScrollView>
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
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  locationText: {
    fontSize: 16,
    marginLeft: 4,
    flex: 1,
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
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingHorizontal: 20,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
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
  galleryImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginRight: 12,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 40,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1000,
  },
}); 