import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Dati delle FAQ
const FAQs = [
  {
    id: '1',
    question: 'Come posso prenotare un ristorante?',
    answer: 'Al momento AllFoodSicily non offre un servizio di prenotazione diretta. Puoi trovare il numero di telefono del ristorante nella sua pagina di dettaglio e contattarlo direttamente.'
  },
  {
    id: '2',
    question: 'Posso salvare i miei ristoranti preferiti?',
    answer: 'Sì, puoi salvare i tuoi ristoranti preferiti cliccando sull\'icona del cuore nella pagina del ristorante. Li troverai nella sezione "Ristoranti Preferiti" del tuo profilo.'
  },
  {
    id: '3',
    question: 'Come posso segnalare un problema con un ristorante?',
    answer: 'Puoi inviarci una segnalazione utilizzando il modulo di contatto qui sotto, specificando il problema riscontrato e il nome del ristorante.'
  },
  {
    id: '4',
    question: 'Le informazioni sui ristoranti sono aggiornate?',
    answer: 'Ci impegniamo a mantenere le informazioni il più aggiornate possibile. Tuttavia, ti consigliamo di verificare sempre direttamente con il ristorante per orari e disponibilità.'
  },
  {
    id: '5',
    question: 'Come posso cancellare il mio account?',
    answer: 'Puoi cancellare il tuo account dalle impostazioni di Privacy e Sicurezza, nella sezione "Elimina Account". Tieni presente che questa azione è irreversibile.'
  }
];

export default function AiutoSupporto() {
  const { colors, colorScheme } = useTheme();
  const router = useRouter();
  
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [messaggioSupporto, setMessaggioSupporto] = useState('');
  
  // Funzione per inviare il messaggio di supporto
  const inviaMessaggio = () => {
    if (messaggioSupporto.trim() === '') {
      Alert.alert("Errore", "Il messaggio non può essere vuoto");
      return;
    }
    
    // Qui in un'app reale invieresti il messaggio a un backend
    Alert.alert(
      "Messaggio Inviato",
      "Grazie per averci contattato. Ti risponderemo al più presto.",
      [{ text: "OK", onPress: () => setMessaggioSupporto('') }]
    );
  };
  
  // Gestisce l'espansione/chiusura delle FAQ
  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
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
        
        <Text style={[styles.headerTitle, { color: colors.text }]}>Aiuto e Supporto</Text>
        
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.container}>
        {/* Sezione FAQ */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Domande Frequenti</Text>
          
          {FAQs.map((faq) => (
            <TouchableOpacity 
              key={faq.id}
              style={[styles.faqItem, { backgroundColor: colors.card }]}
              onPress={() => toggleFAQ(faq.id)}
            >
              <View style={styles.faqHeader}>
                <Text style={[styles.faqQuestion, { color: colors.text }]}>{faq.question}</Text>
                <MaterialIcons 
                  name={expandedFAQ === faq.id ? "expand-less" : "expand-more"} 
                  size={24} 
                  color={colors.text} 
                />
              </View>
              
              {expandedFAQ === faq.id && (
                <Text style={[styles.faqAnswer, { color: colors.text }]}>
                  {faq.answer}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Sezione Contattaci */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Contattaci</Text>
          
          <View style={[styles.contactContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.contactInfo, { color: colors.text }]}>
              Il nostro team di supporto è disponibile dal lunedì al venerdì, dalle 9:00 alle 18:00.
            </Text>
            
            <View style={styles.contactMethod}>
              <MaterialIcons name="email" size={20} color={colors.primary} />
              <Text style={[styles.contactText, { color: colors.text }]}>support@allfoodsicily.com</Text>
            </View>
            
            <View style={styles.contactMethod}>
              <MaterialIcons name="phone" size={20} color={colors.primary} />
              <Text style={[styles.contactText, { color: colors.text }]}>+39 123 456 7890</Text>
            </View>
          </View>
        </View>
        
        {/* Form di Contatto */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Invia un messaggio</Text>
          
          <View style={[styles.messageForm, { backgroundColor: colors.card }]}>
            <TextInput
              style={[styles.messageInput, { backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5', color: colors.text }]}
              placeholder="Descrivi il tuo problema o la tua domanda..."
              placeholderTextColor={colorScheme === 'dark' ? '#999' : '#666'}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={messaggioSupporto}
              onChangeText={setMessaggioSupporto}
            />
            
            <TouchableOpacity 
              style={[styles.sendButton, { backgroundColor: colors.primary }]}
              onPress={inviaMessaggio}
            >
              <Text style={styles.sendButtonText}>Invia Messaggio</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Supporto Social */}
        <View style={[styles.socialSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.socialTitle, { color: colors.text }]}>Seguici sui social</Text>
          <Text style={[styles.socialText, { color: colors.text }]}>
            Puoi anche contattarci attraverso i nostri canali social per ricevere assistenza e restare aggiornato sulle novità.
          </Text>
          
          <View style={styles.socialIcons}>
            <TouchableOpacity style={[styles.socialIcon, { backgroundColor: colors.primary }]}>
              <Feather name="facebook" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialIcon, { backgroundColor: colors.primary }]}>
              <Feather name="instagram" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialIcon, { backgroundColor: colors.primary }]}>
              <Feather name="twitter" size={20} color="white" />
            </TouchableOpacity>
          </View>
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
  section: {
    padding: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  faqItem: {
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    paddingRight: 8,
  },
  faqAnswer: {
    fontSize: 15,
    lineHeight: 22,
    padding: 16,
    paddingTop: 0,
    opacity: 0.8,
  },
  contactContainer: {
    padding: 16,
    borderRadius: 8,
  },
  contactInfo: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 15,
    marginLeft: 12,
  },
  messageForm: {
    padding: 16,
    borderRadius: 8,
  },
  messageInput: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    marginBottom: 16,
  },
  sendButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  socialSection: {
    margin: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  socialTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  socialText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
}); 