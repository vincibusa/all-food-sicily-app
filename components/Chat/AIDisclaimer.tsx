import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../app/context/ThemeContext';

interface AIDisclaimerProps {
  isVisible: boolean;
  onClose: () => void;
}

export const AIDisclaimer: React.FC<AIDisclaimerProps> = ({ isVisible, onClose }) => {
  const { colors } = useTheme();

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Informazioni Chat AI
          </Text>
          <View style={styles.closeButton} />
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.tint + '20' }]}>
            <MaterialIcons name="smart-toy" size={48} color={colors.tint} />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            Assistente AI per la Gastronomia Siciliana
          </Text>

          <Text style={[styles.description, { color: colors.text + '80' }]}>
            Il nostro chatbot utilizza intelligenza artificiale avanzata per fornirti 
            consigli personalizzati su ristoranti, hotel e esperienze gastronomiche in Sicilia.
          </Text>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              🤖 Come Funziona
            </Text>
            <Text style={[styles.sectionText, { color: colors.text }]}>
              • Analizza la tua richiesta usando algoritmi di intelligenza artificiale{'\n'}
              • Cerca nel nostro database di ristoranti, hotel e guide{'\n'}
              • Genera risposte personalizzate basate sui dati disponibili{'\n'}
              • Considera la tua posizione per suggerimenti nelle vicinanze
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              ⚠️ Limitazioni e Disclaimer
            </Text>
            <Text style={[styles.sectionText, { color: colors.text }]}>
              • Le risposte sono generate automaticamente e potrebbero contenere errori{'\n'}
              • Non sostituiscono il giudizio personale o consigli professionali{'\n'}
              • Le informazioni si basano sui dati nel nostro database{'\n'}
              • Verifica sempre dettagli come orari, prezzi e disponibilità{'\n'}
              • Non garantiamo l'accuratezza di tutte le informazioni fornite
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              🔒 Privacy e Dati
            </Text>
            <Text style={[styles.sectionText, { color: colors.text }]}>
              • I messaggi vengono elaborati dai server di Google Firebase AI{'\n'}
              • Non conserviamo permanentemente le conversazioni{'\n'}
              • La posizione GPS viene utilizzata solo per consigli geografici{'\n'}
              • Non condividiamo i tuoi dati con terze parti per marketing
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              💡 Consigli per l'Uso
            </Text>
            <Text style={[styles.sectionText, { color: colors.text }]}>
              • Sii specifico nelle richieste per risultati migliori{'\n'}
              • Indica preferenze di cucina, budget o zona se hai esigenze particolari{'\n'}
              • Usa i consigli come punto di partenza per le tue ricerche{'\n'}
              • Contatta direttamente i locali per confermare informazioni importanti
            </Text>
          </View>

          <View style={[styles.warningBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <MaterialIcons name="info" size={20} color={colors.tint} style={styles.warningIcon} />
            <Text style={[styles.warningText, { color: colors.text }]}>
              <Text style={{ fontWeight: '600' }}>Importante:</Text> Questo servizio utilizza 
              intelligenza artificiale e può generare informazioni non sempre accurate. 
              Verifica sempre le informazioni direttamente con i locali prima di fare 
              affidamento su di esse per decisioni importanti.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              📞 Supporto
            </Text>
            <Text style={[styles.sectionText, { color: colors.text }]}>
              Se riscontri problemi con l'AI o hai feedback, contattaci a:{'\n'}
              support@allfoodsicily.it
            </Text>
          </View>
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.closeFooterButton, { backgroundColor: colors.tint }]}
            onPress={onClose}
          >
            <Text style={styles.closeFooterButtonText}>
              Ho Capito
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// Componente per il banner di disclaimer minimale
export const AIDisclaimerBanner: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.banner, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <MaterialIcons name="info-outline" size={16} color={colors.tint} />
      <Text style={[styles.bannerText, { color: colors.text + '80' }]}>
        Questo è un assistente AI. Le risposte potrebbero contenere errori.
      </Text>
      <MaterialIcons name="chevron-right" size={16} color={colors.text + '60'} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 24,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  warningBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 28,
  },
  warningIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  warningText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  closeFooterButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeFooterButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Banner styles
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    marginLeft: 8,
    marginRight: 4,
  },
});