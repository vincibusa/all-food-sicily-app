import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Share,
  Modal,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { guideService, Guide } from '../../services/guide.service';
import { restaurantService, Restaurant } from '../../services/restaurant.service';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import BackButton from '../../components/BackButton';
import { LightboxModal } from '../../components/LightboxModal';
import { useHaptics } from '../../utils/haptics';
import { useTextStyles } from '../../hooks/useAccessibleText';
import { useDesignTokens } from '../../hooks/useDesignTokens';

const { width } = Dimensions.get('window');

// Type for the guide data with category information as returned by the service
type GuideWithCategory = Guide & {
  category?: {
    id: string;
    name: string;
    slug: string;
    color: string;
    icon: string;
  } | null;
};

// Type for the transformed guide data
type GuideDetail = Guide & {
  category: {
    id: string;
    name: string;
    color: string;
  } | null;
};

export default function GuideDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { onTap } = useHaptics();
  const textStyles = useTextStyles();
  const tokens = useDesignTokens();
  const [guide, setGuide] = useState<GuideDetail | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    content: true,
    gallery: false,
    restaurants: true,
    info: false
  });
  
  // Lightbox state
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      loadGuideDetail();
    }
  }, [id]);

  const loadGuideDetail = async () => {
    try {
      setLoading(true);
      const guideData = await guideService.getGuide(id) as GuideWithCategory;
      
      // Transform guide data to match expected structure
      const transformedGuide: GuideDetail = {
        ...guideData,
        category: guideData.category ? {
          id: guideData.category.id,
          name: guideData.category.name,
          color: guideData.category.color
        } : null
      };
      setGuide(transformedGuide);

      // Load associated restaurants if any
      if (guideData.restaurant_ids && guideData.restaurant_ids.length > 0) {
        const restaurantPromises = guideData.restaurant_ids.map(restaurantId =>
          restaurantService.getRestaurant(restaurantId)
        );
        const restaurantsData = await Promise.all(restaurantPromises);
        setRestaurants(restaurantsData);
      }
    } catch (error) {
      // Error loading guide detail
      Alert.alert('Errore', 'Impossibile caricare i dettagli della guida');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!guide) return;
    onTap();
    
    try {
      await Share.share({
        message: `Scopri questa guida su AllFood Sicily: ${guide.title}`,
        title: guide.title,
      });
    } catch (error) {
      // Error sharing
    }
  };
  
  const toggleSection = (section: keyof typeof expandedSections) => {
    onTap();
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const openLightbox = (index: number) => {
    onTap();
    setCurrentImageIndex(index);
    setLightboxVisible(true);
  };
  
  const handleViewOnMap = () => {
    if (!guide) return;
    onTap();
    // Open maps with guide location if available
    const location = `${guide.city}, ${guide.province}, Sicily`;
    const url = `https://maps.google.com/?q=${encodeURIComponent(location)}`;
    Linking.openURL(url);
  };

  const navigateToRestaurant = (restaurantId: string) => {
    onTap();
    router.push(`/ristoranti/${restaurantId}`);
  };
  
  // Collapsible Section Component
  const CollapsibleSection = ({ 
    title, 
    isExpanded, 
    onToggle, 
    children, 
    icon 
  }: { 
    title: string; 
    isExpanded: boolean; 
    onToggle: () => void; 
    children: React.ReactNode;
    icon: string;
  }) => (
    <Animated.View entering={FadeInDown} style={styles.collapsibleSection}>
      <TouchableOpacity 
        style={[styles.sectionHeader, { backgroundColor: colors.card }]} 
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${isExpanded ? 'espansa' : 'compressa'}`}
      >
        <View style={styles.sectionHeaderLeft}>
          <MaterialIcons name={icon as any} size={24} color={colors.primary} />
          <Text style={[styles.sectionHeaderTitle, textStyles.subtitle(colors.text)]}>
            {title}
          </Text>
        </View>
        <MaterialIcons 
          name={isExpanded ? 'expand-less' : 'expand-more'} 
          size={24} 
          color={colors.text} 
        />
      </TouchableOpacity>
      {isExpanded && (
        <Animated.View entering={FadeInDown} style={styles.sectionContent}>
          {children}
        </Animated.View>
      )}
    </Animated.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Caricamento...</Text>
      </SafeAreaView>
    );
  }

  if (!guide) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Guida non trovata</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: guide.title,
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
              uri: guide.featured_image || 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' 
            }}
            style={styles.featuredImage}
          />
          
          <BackButton style={styles.backButton} />
          
          {/* Category Badge */}
                      <View style={[styles.categoryBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.categoryBadgeText}>{guide.category?.name || 'Guida'}</Text>
          </View>
        </Animated.View>

        <View style={styles.content}>
          {/* Header Info */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.headerInfo}>
            <Text style={[styles.title, textStyles.title(colors.text)]}>{guide.title}</Text>
            <View style={styles.metaInfo}>
              <View style={styles.locationContainer}>
                <MaterialIcons name="location-on" size={18} color={colors.primary} />
                <Text style={[styles.locationText, textStyles.body(colors.text + '80')]}>
                  {guide.city}, {guide.province}
                </Text>
              </View>
              {guide.tags && guide.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {guide.tags.slice(0, 3).map((tag, index) => (
                    <View key={index} style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View entering={FadeInDown.delay(300)} style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={handleShare}
              accessibilityRole="button"
              accessibilityLabel="Condividi guida"
            >
              <MaterialIcons name="share" size={20} color="white" />
              <Text style={styles.actionButtonText}>Condividi</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}
              onPress={handleViewOnMap}
              accessibilityRole="button"
              accessibilityLabel="Visualizza sulla mappa"
            >
              <MaterialIcons name="map" size={20} color={colors.primary} />
              <Text style={[styles.actionButtonText, { color: colors.primary }]}>Mappa</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Content Section */}
          <CollapsibleSection
            title="Descrizione"
            isExpanded={expandedSections.content}
            onToggle={() => toggleSection('content')}
            icon="description"
          >
            <Text style={[styles.contentText, textStyles.body(colors.text)]}>{guide.content}</Text>
          </CollapsibleSection>

          {/* Gallery Section */}
          {guide.gallery && guide.gallery.length > 0 && (
            <CollapsibleSection
              title="Galleria Foto"
              isExpanded={expandedSections.gallery}
              onToggle={() => toggleSection('gallery')}
              icon="photo-library"
            >
              <View style={styles.modernGallery}>
                {guide.gallery.slice(0, 6).map((image, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.galleryImageContainer}
                    onPress={() => openLightbox(index)}
                    accessibilityRole="button"
                    accessibilityLabel={`Visualizza immagine ${index + 1} di ${guide.gallery?.length}`}
                  >
                    <Image
                      source={{ uri: image }}
                      style={styles.modernGalleryImage}
                    />
                    {index === 5 && guide.gallery.length > 6 && (
                      <View style={styles.morePhotosOverlay}>
                        <Text style={styles.morePhotosText}>+{guide.gallery.length - 6}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </CollapsibleSection>
          )}

          {/* Restaurants Section */}
          {restaurants.length > 0 && (
            <CollapsibleSection
              title="Locali Correlati"
              isExpanded={expandedSections.restaurants}
              onToggle={() => toggleSection('restaurants')}
              icon="restaurant"
            >
              {restaurants.map((restaurant) => (
                <TouchableOpacity
                  key={restaurant.id}
                  style={[styles.restaurantCard, { backgroundColor: colors.card }]}
                  onPress={() => navigateToRestaurant(restaurant.id)}
                >
                  <Image
                    source={{ 
                      uri: restaurant.featured_image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' 
                    }}
                    style={styles.restaurantImage}
                  />
                  <View style={styles.restaurantInfo}>
                    <Text style={[styles.restaurantName, textStyles.subtitle(colors.text)]}>{restaurant.name}</Text>
                    <Text style={[styles.restaurantAddress, textStyles.caption(colors.text + '80')]}>{restaurant.address}</Text>
                    <View style={styles.ratingContainer}>
                      <MaterialIcons name="star" size={16} color="#FFD700" />
                      <Text style={[styles.ratingText, textStyles.caption(colors.text + '80')]}>
                        {restaurant.rating ? parseFloat(restaurant.rating.toString()).toFixed(1) : 'N/A'}
                      </Text>
                    </View>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={colors.text + '60'} />
                </TouchableOpacity>
              ))}
            </CollapsibleSection>
          )}

          {/* Info Section */}
          <CollapsibleSection
            title="Informazioni"
            isExpanded={expandedSections.info}
            onToggle={() => toggleSection('info')}
            icon="info"
          >
            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <MaterialIcons name="event" size={20} color={colors.primary} />
                <Text style={[styles.infoText, textStyles.body(colors.text)]}>
                  Pubblicata il {new Date(guide.created_at).toLocaleDateString('it-IT')}
                </Text>
              </View>
              {guide.updated_at && guide.updated_at !== guide.created_at && (
                <View style={styles.infoItem}>
                  <MaterialIcons name="update" size={20} color={colors.primary} />
                  <Text style={[styles.infoText, textStyles.body(colors.text)]}>
                    Aggiornata il {new Date(guide.updated_at).toLocaleDateString('it-IT')}
                  </Text>
                </View>
              )}
              {guide.category && (
                <View style={styles.infoItem}>
                  <MaterialIcons name="category" size={20} color={colors.primary} />
                  <Text style={[styles.infoText, textStyles.body(colors.text)]}>
                    Categoria: {guide.category.name}
                  </Text>
                </View>
              )}
            </View>
          </CollapsibleSection>
        </ScrollView>
        
        {/* Lightbox Modal */}
        {guide.gallery && guide.gallery.length > 0 && (
          <LightboxModal
            visible={lightboxVisible}
            images={guide.gallery}
            initialIndex={currentImageIndex}
            onClose={() => setLightboxVisible(false)}
          />
        )}
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
  headerInfo: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: 36,
  },
  metaInfo: {
    gap: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    minHeight: 48,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  collapsibleSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 48,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
  },
  modernGallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  galleryImageContainer: {
    position: 'relative',
    width: (width - 64) / 3,
    aspectRatio: 1,
  },
  modernGalleryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  morePhotosOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  morePhotosText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  restaurantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 80,
  },
  restaurantImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  restaurantAddress: {
    fontSize: 14,
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 4,
  },
  infoContainer: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1000,
  },
});