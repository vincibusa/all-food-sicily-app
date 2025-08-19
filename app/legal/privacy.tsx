import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';

export default function PrivacyPolicyScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const handleEmailPress = () => {
    Linking.openURL('mailto:privacy@allfoodsicily.it');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Informativa Privacy
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.lastUpdated, { color: colors.text + '80' }]}>
          Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            1. Titolare del Trattamento
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            Il Titolare del trattamento dei dati personali è [NOME AZIENDA], con sede in [INDIRIZZO], 
            P.IVA [PARTITA IVA], raggiungibile all'indirizzo email{' '}
            <Text style={[styles.link, { color: colors.tint }]} onPress={handleEmailPress}>
              privacy@allfoodsicily.it
            </Text>
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            2. Dati Personali Trattati
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            L'applicazione AllFoodSicily tratta le seguenti categorie di dati personali:
          </Text>
          
          <View style={styles.subsection}>
            <Text style={[styles.subsectionTitle, { color: colors.text }]}>
              2.1 Dati di Geolocalizzazione
            </Text>
            <Text style={[styles.sectionText, { color: colors.text }]}>
              • Coordinate GPS (latitudine e longitudine){'\n'}
              • Finalità: Mostrare ristoranti e hotel nelle vicinanze{'\n'}
              • Base giuridica: Consenso dell'interessato (art. 6, par. 1, lett. a GDPR){'\n'}
              • Conservazione: I dati non vengono memorizzati sui nostri server, ma utilizzati solo localmente sul dispositivo
            </Text>
          </View>

          <View style={styles.subsection}>
            <Text style={[styles.subsectionTitle, { color: colors.text }]}>
              2.2 Dati della Chat AI
            </Text>
            <Text style={[styles.sectionText, { color: colors.text }]}>
              • Messaggi inviati al sistema di intelligenza artificiale{'\n'}
              • Finalità: Fornire consigli personalizzati su ristoranti e hotel{'\n'}
              • Base giuridica: Legittimo interesse (art. 6, par. 1, lett. f GDPR){'\n'}
              • Conservazione: I messaggi vengono elaborati da Google Firebase AI e non conservati permanentemente
            </Text>
          </View>

          <View style={styles.subsection}>
            <Text style={[styles.subsectionTitle, { color: colors.text }]}>
              2.3 Dati Tecnici
            </Text>
            <Text style={[styles.sectionText, { color: colors.text }]}>
              • Identificativo univoco del dispositivo{'\n'}
              • Informazioni sull'app e sul sistema operativo{'\n'}
              • Finalità: Miglioramento delle prestazioni e analisi utilizzo{'\n'}
              • Base giuridica: Legittimo interesse (art. 6, par. 1, lett. f GDPR)
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            3. Finalità del Trattamento
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            I suoi dati personali vengono trattati per le seguenti finalità:{'\n\n'}
            • Fornire informazioni su ristoranti e hotel in base alla posizione{'\n'}
            • Offrire consigli personalizzati tramite intelligenza artificiale{'\n'}
            • Migliorare le funzionalità e le prestazioni dell'applicazione{'\n'}
            • Garantire la sicurezza e prevenire utilizzi impropri{'\n'}
            • Adempiere agli obblighi di legge
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            4. Condivisione dei Dati
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            I suoi dati possono essere condivisi con:{'\n\n'}
            • Google LLC (per i servizi Firebase AI e Google Maps) - con sede negli Stati Uniti, 
            coperta da decisione di adeguatezza UE{'\n'}
            • Supabase Inc. (per il database dell'applicazione) - con sede negli Stati Uniti, 
            con garanzie appropriate per il trasferimento{'\n\n'}
            Non vendiamo né cediamo i suoi dati personali a terzi per finalità commerciali.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            5. I Suoi Diritti
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            In qualità di interessato, ha diritto a:{'\n\n'}
            • Accesso ai dati personali (art. 15 GDPR){'\n'}
            • Rettifica dei dati inesatti (art. 16 GDPR){'\n'}
            • Cancellazione dei dati ("diritto all'oblio") (art. 17 GDPR){'\n'}
            • Limitazione del trattamento (art. 18 GDPR){'\n'}
            • Portabilità dei dati (art. 20 GDPR){'\n'}
            • Opposizione al trattamento (art. 21 GDPR){'\n'}
            • Revoca del consenso in qualsiasi momento{'\n'}
            • Proporre reclamo al Garante Privacy
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            6. Sicurezza dei Dati
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            Abbiamo implementato misure tecniche e organizzative appropriate per proteggere 
            i suoi dati personali da accessi non autorizzati, alterazioni, divulgazioni o 
            distruzioni accidentali, incluse:{'\n\n'}
            • Crittografia dei dati in transito e a riposo{'\n'}
            • Controlli di accesso e autenticazione{'\n'}
            • Monitoraggio e logging delle attività{'\n'}
            • Formazione del personale sulla protezione dati
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            7. Conservazione dei Dati
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            I dati personali vengono conservati per il tempo strettamente necessario al 
            raggiungimento delle finalità per cui sono stati raccolti:{'\n\n'}
            • Dati di geolocalizzazione: Non conservati, elaborati solo localmente{'\n'}
            • Messaggi chat AI: Elaborati temporaneamente, non conservati{'\n'}
            • Dati tecnici: Conservati per un massimo di 24 mesi per analisi prestazioni
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            8. Minori
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            L'applicazione non è destinata a minori di 13 anni. Non raccogliamo 
            consapevolmente dati personali da minori di 13 anni. Se venissimo a conoscenza 
            di aver raccolto dati da un minore, procederemo immediatamente alla cancellazione.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            9. Modifiche alla Privacy Policy
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            Ci riserviamo il diritto di modificare questa informativa privacy. 
            Le modifiche sostanziali verranno comunicate tramite l'applicazione 
            o via email. L'uso continuato dell'app dopo le modifiche costituisce 
            accettazione della nuova informativa.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            10. Contatti
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            Per esercitare i suoi diritti o per qualsiasi domanda relativa al 
            trattamento dei dati personali, può contattarci:{'\n\n'}
            Email:{' '}
            <Text style={[styles.link, { color: colors.tint }]} onPress={handleEmailPress}>
              privacy@allfoodsicily.it
            </Text>
            {'\n'}
            Indirizzo: [INDIRIZZO COMPLETO]{'\n'}
            Telefono: [NUMERO TELEFONO]
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.text + '60' }]}>
            © 2024 AllFoodSicily. Tutti i diritti riservati.
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
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
  lastUpdated: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 32,
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
    marginBottom: 8,
  },
  subsection: {
    marginTop: 16,
    marginLeft: 12,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  link: {
    textDecorationLine: 'underline',
  },
  footer: {
    marginTop: 32,
    paddingTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
});