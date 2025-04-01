import { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Dimensions, ActivityIndicator, SafeAreaView } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { StatusBar } from "expo-status-bar";
import { FontAwesome, Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";

const { width } = Dimensions.get('window');

// Dati di esempio per l'articolo dettagliato
const ARTICLES_DATA = {
  '1': {
    id: '1',
    title: 'Storia della Cannolo Siciliano',
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'Tradizioni',
    author: 'Maria Rossi',
    date: '12 Maggio 2023',
    content: 'Il cannolo siciliano è un dolce tipico della tradizione siciliana, originario della zona di Palermo e Messina. La sua storia risale all\'epoca della dominazione araba in Sicilia, tra il IX e l\'XI secolo. Si narra che il dolce fosse preparato dalle donne dell\'harem dell\'emiro di Caltanissetta per celebrare il Carnevale.\n\nIl nome "cannolo" deriva dalla forma di canna di fiume che veniva utilizzata per arrotolare la sfoglia prima di friggerla, mentre il termine "siciliano" fu aggiunto in seguito per distinguerlo dalle varianti nate in altre regioni d\'Italia.\n\nLa ricetta tradizionale prevede una cialda croccante (la "scorza") ripiena di crema di ricotta di pecora aromatizzata con zucchero e vaniglia, arricchita con gocce di cioccolato, canditi e granella di pistacchio. La scorza contiene strutto e vino Marsala, elementi che le conferiscono il caratteristico sapore e la consistenza friabile.\n\nOggi il cannolo è conosciuto e apprezzato in tutto il mondo ed è considerato uno dei simboli della pasticceria siciliana, tanto da essere inserito nella lista dei prodotti agroalimentari tradizionali italiani (P.A.T.) del Ministero delle Politiche Agricole, Alimentari e Forestali.',
    gallery: [
      'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1615744455875-7ad33653e8c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1635150306932-26fabd4025e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    ]
  },
  '2': {
    id: '2',
    title: 'I migliori ristoranti di pesce in Sicilia',
    image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'Guide',
    author: 'Giuseppe Verdi',
    date: '3 Giugno 2023',
    content: 'La Sicilia, con i suoi 1.000 km di costa e la sua tradizione marinara, è una delle destinazioni enogastronomiche più rinomate per gli amanti del pesce fresco. Ecco una selezione dei migliori ristoranti di pesce che vale la pena visitare durante un viaggio nell\'isola.\n\nA Palermo, il ristorante "La Cambusa" offre una vista mozzafiato sul porto e serve piatti a base di pesce freschissimo acquistato direttamente dai pescatori locali. Il loro "cous cous di pesce" è un capolavoro di sapori mediterranei.\n\nA Trapani, "Da Sariddu" è famoso per la sua "pasta con le sarde", un piatto tradizionale siciliano preparato con finocchietto selvatico, pinoli, uvetta e naturalmente sarde fresche.\n\nA Catania, il ristorante "La Pescheria" si trova proprio accanto al mercato del pesce e offre un\'esperienza autentica con il suo menu che cambia quotidianamente in base al pescato del giorno.\n\nA Siracusa, "Il Veliero" è situato nella pittoresca isola di Ortigia e serve un\'ottima "zuppa di pesce" preparata secondo l\'antica ricetta siciliana.\n\nA Taormina, il ristorante "La Capinera" vanta una stella Michelin e propone piatti di pesce innovativi che combinano la tradizione siciliana con tecniche moderne.',
    gallery: [
      'https://images.unsplash.com/photo-1534080564583-6be75777b70a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1599458252573-56ae36120de1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    ]
  },
  '3': {
    id: '3',
    title: 'Olive Nocellara del Belice: un tesoro siciliano',
    image: 'https://images.unsplash.com/photo-1598042332909-df0e4eb1f6ea?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'Prodotti',
    author: 'Lucia Bianchi',
    date: '28 Luglio 2023',
    content: 'La Nocellara del Belice è una varietà di oliva coltivata nella Valle del Belice, in provincia di Trapani, Sicilia. Riconosciuta come prodotto DOP (Denominazione di Origine Protetta), questa oliva è apprezzata tanto per il consumo da tavola quanto per la produzione di un olio extravergine di altissima qualità.\n\nLe olive Nocellara si distinguono per la forma tondeggiante, il colore verde brillante e la polpa croccante dal sapore fruttato e leggermente amarognolo. La raccolta avviene tra settembre e ottobre, quando le olive hanno raggiunto il giusto grado di maturazione.\n\nLa produzione delle olive Nocellara segue un disciplinare rigoroso che garantisce l\'eccellenza del prodotto finale. Dopo la raccolta, le olive destinate al consumo da tavola vengono selezionate, lavate e trattate con salamoia secondo il metodo tradizionale siciliano, che prevede l\'uso di acqua, sale e erbe aromatiche.\n\nQueste olive sono un ingrediente fondamentale della cucina siciliana, utilizzate per arricchire insalate, antipasti e piatti di pesce. Sono anche ottime da gustare da sole come aperitivo, magari accompagnate da un buon vino bianco siciliano.',
    gallery: [
      'https://images.unsplash.com/photo-1598042332909-df0e4eb1f6ea?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1593001755284-8e0b1e7abec3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    ]
  }
};

type ArticleData = typeof ARTICLES_DATA[keyof typeof ARTICLES_DATA];

export default function ArticleScreen() {
  const { id } = useLocalSearchParams();
  const article = ARTICLES_DATA[id as keyof typeof ARTICLES_DATA];
  const { colors, colorScheme } = useTheme();
  const router = useRouter();
  
  if (!article) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 16 }}>Caricamento articolo...</Text>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      {/* Immagine di copertina */}
      <View style={styles.coverImageContainer}>
        <Image source={{ uri: article.image }} style={styles.coverImage} />
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* Intestazione articolo */}
      <Animated.View 
        style={[styles.articleHeader, { backgroundColor: colors.card }]}
        entering={FadeIn.duration(500)}
      >
        <View style={styles.categoryContainer}>
          <View style={[styles.categoryPill, { backgroundColor: colors.primary }]}>
            <Text style={styles.categoryText}>{article.category}</Text>
          </View>
          <Text style={[styles.dateText, { color: colors.text }]}>{article.date}</Text>
        </View>
        
        <Text style={[styles.articleTitle, { color: colors.text }]}>{article.title}</Text>
        
        <View style={styles.authorContainer}>
          <FontAwesome name="user-circle" size={20} color={colors.primary} />
          <Text style={[styles.authorText, { color: colors.text }]}>{article.author}</Text>
        </View>
      </Animated.View>
      
      {/* Contenuto articolo */}
      <Animated.View 
        style={[styles.contentContainer, { backgroundColor: colors.background }]}
        entering={FadeIn.duration(700)}
      >
        <Text style={[styles.content, { color: colors.text }]}>
          {article.content}
        </Text>
      </Animated.View>
      
      {/* Galleria di immagini */}
      {article.gallery && article.gallery.length > 0 && (
        <Animated.View 
          style={styles.galleryContainer}
          entering={FadeIn.duration(900)}
        >
          <Text style={[styles.galleryTitle, { color: colors.text }]}>Galleria di immagini</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.galleryScroll}
          >
            {article.gallery.map((imageUrl: string, index: number) => (
              <Image 
                key={index}
                source={{ uri: imageUrl }}
                style={styles.galleryImage}
              />
            ))}
          </ScrollView>
        </Animated.View>
      )}
      
      {/* Pulsante Condividi */}
      <TouchableOpacity 
        style={[styles.shareButton, { backgroundColor: colors.primary }]}
      >
        <Feather name="share-2" size={20} color="white" />
        <Text style={styles.shareText}>Condividi Articolo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  coverImageContainer: {
    position: 'relative',
    height: width * 0.7,
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
  articleHeader: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  categoryContainer: {
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
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 14,
  },
  articleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: 32,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  contentContainer: {
    padding: 20,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
  },
  galleryContainer: {
    padding: 20,
  },
  galleryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  galleryScroll: {
    paddingRight: 20,
  },
  galleryImage: {
    width: 200,
    height: 150,
    borderRadius: 10,
    marginRight: 10,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginVertical: 30,
    paddingVertical: 12,
    borderRadius: 30,
  },
  shareText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  }
}); 