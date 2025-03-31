import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

export default function InformazioniApp() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  // Apre link esterni
  const apriLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error("Errore nell'apertura del link:", err));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: colors.text }]}>Informazioni App</Text>
        
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.container}>
        {/* Logo e Versione */}
        <View style={styles.logoContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1516550893982-9a5ef47f3562?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' }}
            style={styles.logo}
          />
          <Text style={[styles.appName, { color: colors.text }]}>AllFoodSicily</Text>
          <Text style={[styles.versionText, { color: colors.text }]}>Versione 1.0.0</Text>
        </View>
        
        {/* Chi Siamo */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Chi Siamo</Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            AllFoodSicily è l'app definitiva per scoprire il meglio della gastronomia siciliana. 
            La nostra missione è valorizzare e promuovere la ricca cultura culinaria dell'isola, 
            facilitando agli amanti del cibo la scoperta dei migliori ristoranti e delle specialità locali.
          </Text>
        </View>
        
        {/* Termini e Condizioni */}
        <TouchableOpacity 
          style={[styles.linkItem, { backgroundColor: colors.card }]}
          onPress={() => apriLink('https://www.example.com/terms')}
        >
          <Text style={[styles.linkText, { color: colors.text }]}>Termini e Condizioni</Text>
          <Feather name="external-link" size={20} color={colors.primary} />
        </TouchableOpacity>
        
        {/* Privacy Policy */}
        <TouchableOpacity 
          style={[styles.linkItem, { backgroundColor: colors.card }]}
          onPress={() => apriLink('https://www.example.com/privacy')}
        >
          <Text style={[styles.linkText, { color: colors.text }]}>Informativa sulla Privacy</Text>
          <Feather name="external-link" size={20} color={colors.primary} />
        </TouchableOpacity>
        
        {/* Licenze */}
        <TouchableOpacity 
          style={[styles.linkItem, { backgroundColor: colors.card }]}
          onPress={() => apriLink('https://www.example.com/licenses')}
        >
          <Text style={[styles.linkText, { color: colors.text }]}>Licenze Open Source</Text>
          <Feather name="external-link" size={20} color={colors.primary} />
        </TouchableOpacity>
        
        {/* Credits */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Credits</Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            Le immagini utilizzate in questa app sono fornite da Unsplash e altri partner. 
            Le informazioni sui ristoranti e sulle specialità culinarie sono state raccolte 
            con la collaborazione di esperti locali e appassionati di cucina siciliana.
          </Text>
        </View>
        
        {/* Team di Sviluppo */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Team</Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            AllFoodSicily è stata sviluppata con passione da un team di sviluppatori siciliani, 
            con l'obiettivo di celebrare e promuovere la ricchezza gastronomica della loro isola. 
            L'app è stata creata utilizzando React Native e viene costantemente aggiornata con nuove funzionalità.
          </Text>
        </View>
        
        {/* Contattaci */}
        <View style={[styles.contactSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.contactTitle, { color: colors.text }]}>Contattaci</Text>
          <Text style={[styles.contactText, { color: colors.text }]}>
            Per informazioni, suggerimenti o collaborazioni
          </Text>
          
          <TouchableOpacity 
            style={[styles.contactButton, { backgroundColor: colors.primary }]}
            onPress={() => apriLink('mailto:info@allfoodsicily.com')}
          >
            <Feather name="mail" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>info@allfoodsicily.com</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.contactButton, { backgroundColor: colors.primary }]}
            onPress={() => apriLink('https://www.allfoodsicily.com')}
          >
            <Feather name="globe" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>www.allfoodsicily.com</Text>
          </TouchableOpacity>
        </View>
        
        {/* Copyright */}
        <View style={styles.copyright}>
          <Text style={[styles.copyrightText, { color: colors.text }]}>
            © 2023 AllFoodSicily. Tutti i diritti riservati.
          </Text>
        </View>
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  logoContainer: {
    alignItems: 'center',
    padding: 32,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  versionText: {
    fontSize: 16,
    opacity: 0.6,
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '500',
  },
  contactSection: {
    margin: 16,
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 15,
    marginBottom: 20,
    textAlign: 'center',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
  copyright: {
    padding: 20,
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: 14,
    opacity: 0.6,
  },
}); 