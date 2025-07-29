import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useHaptics } from '../../utils/haptics';
import { useTextStyles } from '../../hooks/useAccessibleText';
import Animated, { FadeInDown } from 'react-native-reanimated';

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
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
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
    image: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
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
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
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
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
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
    image: 'https://images.unsplash.com/photo-1552566097-141f072e8fc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
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
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  }
};

export default function GuideCategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { onTap } = useHaptics();
  const textStyles = useTextStyles();

  const category = categoryContent[id as keyof typeof categoryContent];

  if (!category) {
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, textStyles.subtitle(colors.text)]}>
          {category.title}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Image */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <Image
            source={{ uri: category.image }}
            style={styles.heroImage}
          />
          <View style={[styles.iconOverlay, { backgroundColor: category.color }]}>
            <MaterialIcons
              name={category.icon as any}
              size={32}
              color="white"
            />
          </View>
        </Animated.View>

        {/* Content */}
        <Animated.View 
          style={styles.contentSection}
          entering={FadeInDown.delay(200)}
        >
          <Text style={[styles.categoryTitle, textStyles.title(colors.text)]}>
            {category.title}
          </Text>
          
          <Text style={[styles.categoryContent, textStyles.body(colors.text)]}>
            {category.content}
          </Text>
        </Animated.View>

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
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
  placeholder: {
    width: 40,
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
  contentSection: {
    padding: 20,
    marginTop: 10,
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
});