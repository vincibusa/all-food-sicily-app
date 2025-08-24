import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Share,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useHaptics } from '../../utils/haptics';
import { useTextStyles } from '../../hooks/useAccessibleText';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { guideService, GuideSection } from '../../services/guide.service';
import { LightboxModal } from '../../components/LightboxModal';
import { useDesignTokens } from '../../hooks/useDesignTokens';

const categoryContent = {
  'guida': {
    title: 'La Guida AllFood Sicily',
    icon: 'restaurant-menu',
    color: '#FF6B35',
    content: `Benvenuto nella guida gastronomica più completa della Sicilia.

Esplora i migliori ristoranti, trattorie e locali tipici dell'isola con le nostre recensioni approfondite e consigli esclusivi.

🍝 Tradizione autentica
🏆 Locali selezionati
👨‍🍳 Chef di qualità
📍 Tutta la Sicilia

Dalla street food di Palermo ai ristoranti stellati, scopri i sapori che rendono unica la cucina siciliana.`,
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    featured_image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    gallery: []
  },
  'premi-speciali': {
    title: 'Premi Speciali',
    icon: 'emoji-events',
    color: '#FFD23F',
    content: `I nostri riconoscimenti celebrano l'eccellenza gastronomica siciliana.

🏆 Premi annuali assegnati dalla giuria
✨ Qualità degli ingredienti
🌿 Sostenibilità ambientale
👨‍🍳 Innovazione nella tradizione
🎯 Servizio di eccellenza

Ogni premio racconta una storia di passione, dedizione e amore per la cucina autentica.

Scopri i criteri di selezione e le categorie premiate.`,
    image: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    featured_image: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    gallery: []
  },
  'vincitori': {
    title: 'I Vincitori',
    icon: 'star',
    color: '#06FFA5',
    content: `Conosci i campioni della gastronomia siciliana.

🥇 Miglior Ristorante dell'Anno
🥈 Innovazione nella Tradizione  
🥉 Eccellenza nel Servizio
🌟 Sostenibilità Ambientale
🍕 Miglior Street Food
🏝️ Valorizzazione del Territorio

Ogni vincitore è un'eccellenza che rappresenta il meglio della tradizione e dell'innovazione culinaria siciliana.`,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    featured_image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    gallery: []
  },
  'presentazione': {
    title: 'Chi Siamo',
    icon: 'info',
    color: '#4ECDC4',
    content: `AllFood Sicily nasce dalla passione per la gastronomia siciliana.

👥 Il nostro team:
• Food blogger esperti
• Critici gastronomici  
• Chef professionisti
• Appassionati locali

🎯 La nostra missione:
Creare un ponte tra tradizione e innovazione, valorizzando i prodotti locali e le ricette tramandate nel tempo.

Per noi il cibo è cultura, storia e identità. Raccontiamo la Sicilia attraverso i suoi sapori autentici.`,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    featured_image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    gallery: []
  },
  'sponsor': {
    title: 'I Nostri Partner',
    icon: 'handshake',
    color: '#45B7D1',
    content: `I nostri partner condividono la missione di valorizzare la gastronomia siciliana.

🤝 Collaboriamo con:
• Aziende agricole locali
• Produttori d'eccellenza
• Cantine storiche
• Frantoi tradizionali
• Caseifici artigianali

🌱 Insieme per:
✓ Filiera corta
✓ Qualità dei prodotti  
✓ Sostenibilità ambientale
✓ Tradizione siciliana

Scopri i nostri partner e i prodotti di eccellenza che sosteniamo.`,
    image: 'https://images.unsplash.com/photo-1552566097-141f072e8fc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    featured_image: 'https://images.unsplash.com/photo-1552566097-141f072e8fc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    gallery: []
  },
  'iniziative': {
    title: 'Le Nostre Iniziative',
    icon: 'lightbulb',
    color: '#96CEB4',
    content: `Promuoviamo la cultura gastronomica siciliana con eventi unici.

🎪 Eventi e progetti:
• Festival del Cibo Siciliano
• Corsi di cucina tradizionale
• Tour enogastronomici
• Workshop con chef stellati
• Degustazioni guidate

🌟 Eventi speciali:
• Settimana della Cucina Siciliana
• Notte Bianca del Gusto
• Premio Giovani Chef
• Festa del Prodotto Tipico

Partecipa alle nostre iniziative per vivere esperienze culinarie autentiche.`,
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    featured_image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    gallery: []
  }
};

// Local interface for static content fallback
interface StaticContent {
  title: string;
  content: string;
  featured_image?: string;
  gallery?: string[];
  image?: string;
  color?: string;
  icon?: string;
}

export default function GuideCategoryScreen() {
  const { id, guideId } = useLocalSearchParams<{ id: string; guideId?: string }>();
  const { colors } = useTheme();
  const { onTap } = useHaptics();
  const textStyles = useTextStyles();
  const tokens = useDesignTokens();
  
  const [section, setSection] = useState<GuideSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    content: true,
    gallery: false,
  });
  
  // Lightbox state
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fallback al contenuto statico se non c'è guideId
  const category: StaticContent = categoryContent[id as keyof typeof categoryContent];

  useEffect(() => {
    if (guideId && (id === 'presentazione' || id === 'premi-speciali' || id === 'iniziative')) {
      loadSectionData();
    } else {
      setLoading(false);
    }
  }, [guideId, id]);

  const loadSectionData = async () => {
    if (!guideId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await guideService.getGuideSection(guideId, id);
      setSection(response);
      
      // Section loaded successfully
    } catch (error) {
      // Error loading section
      setError('Impossibile caricare la sezione');
    } finally {
      setLoading(false);
    }
  };

  // Usa i dati dinamici se disponibili, altrimenti fallback statico  
  const displayData = section ? {
    title: section.title,
    content: section.content || '',
    featured_image: section.featured_image || category.featured_image,
    image: section.featured_image || category.image,
    gallery: section.gallery || category.gallery,
    color: category.color,
    icon: category.icon
  } : category;
  
  const toggleSection = (sectionName: keyof typeof expandedSections) => {
    onTap();
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };
  
  const openLightbox = (index: number) => {
    onTap();
    setCurrentImageIndex(index);
    setLightboxVisible(true);
  };
  
  const handleShare = async () => {
    if (!displayData) return;
    onTap();
    
    try {
      await Share.share({
        message: `Scopri questa sezione su AllFood Sicily: ${displayData.title}`,
        title: displayData.title,
      });
    } catch (error) {
      // Error sharing
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, textStyles.body(colors.text)]}>
            Caricamento sezione...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={colors.text + '40'} />
          <Text style={[styles.errorText, textStyles.title(colors.text)]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              onTap();
              loadSectionData();
            }}
          >
            <Text style={styles.retryButtonText}>Riprova</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!displayData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={colors.text + '40'} />
          <Text style={[styles.errorText, textStyles.title(colors.text)]}>
            Categoria non trovata
          </Text>
          <TouchableOpacity
            style={[styles.backToHomeButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              onTap();
              router.back();
            }}
          >
            <Text style={styles.backToHomeButtonText}>Torna Indietro</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleBackPress = () => {
    onTap();
    router.back();
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.backButton, tokens.helpers.touchTarget('minimum')]}
          onPress={handleBackPress}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, textStyles.subtitle(colors.text)]}>
          {displayData?.title || category?.title}
        </Text>
        <TouchableOpacity
          style={[styles.shareButton, tokens.helpers.touchTarget('minimum')]}
          onPress={handleShare}
        >
          <MaterialIcons name="share" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Image */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <Image
            source={{ uri: displayData.featured_image || displayData.image }}
            style={styles.heroImage}
          />
          <View style={[styles.iconOverlay, { backgroundColor: displayData.color || colors.primary }]}>
            <MaterialIcons
              name={(displayData.icon || 'info') as any}
              size={32}
              color="white"
            />
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View 
          style={styles.titleSection}
          entering={FadeInDown.delay(200)}
        >
          <Text style={[styles.categoryTitle, textStyles.title(colors.text)]}>
            {displayData.title}
          </Text>
        </Animated.View>

        {/* Content Section */}
        <CollapsibleSection
          title="Descrizione"
          isExpanded={expandedSections.content}
          onToggle={() => toggleSection('content')}
          icon="description"
        >
          <Text style={[styles.categoryContent, textStyles.body(colors.text)]}>
            {displayData.content}
          </Text>
        </CollapsibleSection>

        {/* Gallery Section */}
        {displayData.gallery && displayData.gallery?.length > 0 && (
          <CollapsibleSection
            title="Galleria"
            isExpanded={expandedSections.gallery}
            onToggle={() => toggleSection('gallery')}
            icon="photo-library"
          >
            <View style={styles.modernGallery}>
              {displayData.gallery?.slice(0, 6).map((imageUrl: string, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={styles.galleryImageContainer}
                  onPress={() => openLightbox(index)}
                  accessibilityRole="button"
                  accessibilityLabel={`Visualizza immagine ${index + 1} di ${displayData.gallery?.length}`}
                >
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.modernGalleryImage}
                  />
                  {index === 5 && displayData.gallery && displayData.gallery.length > 6 && (
                    <View style={styles.morePhotosOverlay}>
                      <Text style={styles.morePhotosText}>+{displayData.gallery.length - 6}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </CollapsibleSection>
        )}

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* Lightbox Modal */}
      {displayData.gallery && displayData.gallery.length > 0 && (
        <LightboxModal
          visible={lightboxVisible}
          images={displayData.gallery}
          initialIndex={currentImageIndex}
          onClose={() => setLightboxVisible(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  shareButton: {
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroImage: {
    width: '100%',
    height: 250,
  },
  iconOverlay: {
    position: 'absolute',
    bottom: -25,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  titleSection: {
    padding: 20,
    marginTop: 10,
  },
  collapsibleSection: {
    marginBottom: 20,
    marginHorizontal: 20,
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
  categoryTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  categoryContent: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'left',
    marginBottom: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  backToHomeButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backToHomeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modernGallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  galleryImageContainer: {
    position: 'relative',
    width: '31%',
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
    fontSize: 16,
    fontWeight: 'bold',
  },
});