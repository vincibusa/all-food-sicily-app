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

export default function TermsOfServiceScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const handleEmailPress = () => {
    Linking.openURL('mailto:info@allfoodsicily.it');
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
          Termini di Servizio
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
            1. Accettazione dei Termini
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            Utilizzando l'applicazione AllFoodSicily ("App"), accetti integralmente 
            i presenti Termini di Servizio. Se non accetti questi termini, 
            ti preghiamo di non utilizzare l'App.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            2. Descrizione del Servizio
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            AllFoodSicily è un'applicazione mobile che fornisce:{'\n\n'}
            • Informazioni su ristoranti, hotel e guide turistiche in Sicilia{'\n'}
            • Servizio di chat con intelligenza artificiale per consigli personalizzati{'\n'}
            • Funzionalità di geolocalizzazione per trovare locali nelle vicinanze{'\n'}
            • Accesso a offerte e coupon promozionali{'\n\n'}
            Il servizio è fornito gratuitamente agli utenti.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            3. Utilizzo dell'Applicazione
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            Ti impegni a utilizzare l'App:{'\n\n'}
            • In conformità alle leggi applicabili{'\n'}
            • Senza violare i diritti di terzi{'\n'}
            • Senza interferire con il funzionamento del servizio{'\n'}
            • Senza utilizzare sistemi automatizzati per accedere ai contenuti{'\n'}
            • Senza tentare di accedere a dati non autorizzati{'\n\n'}
            È vietato l'uso dell'App per attività illegali, dannose o che violino 
            questi termini.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            4. Contenuti e Informazioni
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            Le informazioni sui ristoranti, hotel e guide sono fornite a scopo 
            informativo. Non garantiamo:{'\n\n'}
            • L'accuratezza completa delle informazioni{'\n'}
            • La disponibilità costante di offerte e coupon{'\n'}
            • L'aggiornamento in tempo reale di prezzi e disponibilità{'\n\n'}
            Ti consigliamo di verificare sempre le informazioni direttamente 
            con gli esercizi commerciali prima di fare affidamento su di esse.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            5. Chat AI e Consigli
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            Il servizio di chat utilizza intelligenza artificiale per fornire 
            consigli personalizzati. Importante:{'\n\n'}
            • I consigli sono generati automaticamente e potrebbero contenere errori{'\n'}
            • Non sostituiscono il giudizio personale o consigli professionali{'\n'}
            • Le risposte si basano sui dati disponibili nel database{'\n'}
            • Non garantiamo l'accuratezza di tutti i suggerimenti forniti{'\n\n'}
            Usa i consigli dell'AI come punto di partenza, verificando sempre 
            le informazioni prima di prendere decisioni.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            6. Coupon e Offerte
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            I coupon e le offerte sono forniti dai singoli esercizi commerciali:{'\n\n'}
            • AllFoodSicily funge da intermediario informativo{'\n'}
            • Le condizioni specifiche sono stabilite dai singoli ristoranti{'\n'}
            • Non garantiamo l'accettazione dei coupon{'\n'}
            • Non siamo responsabili per controversie sui coupon{'\n'}
            • Verifica sempre termini e validità direttamente con l'esercizio{'\n\n'}
            Per problemi con i coupon, contatta prima il ristorante, 
            poi il nostro supporto se necessario.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            7. Limitazioni di Responsabilità
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            Nei limiti consentiti dalla legge, escludiamo ogni responsabilità per:{'\n\n'}
            • Danni derivanti dall'uso dell'App{'\n'}
            • Perdite economiche legate a informazioni errate{'\n'}
            • Problemi con ristoranti o hotel consigliati{'\n'}
            • Malfunzionamenti temporanei del servizio{'\n'}
            • Decisioni prese basandosi sui consigli AI{'\n\n'}
            La nostra responsabilità è limitata al massimo consentito 
            dalla normativa italiana del consumo.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            8. Proprietà Intellettuale
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            Tutti i contenuti dell'App (design, testi, loghi, immagini) 
            sono protetti da diritti di proprietà intellettuale:{'\n\n'}
            • È vietata la riproduzione senza autorizzazione{'\n'}
            • Non puoi utilizzare i contenuti per scopi commerciali{'\n'}
            • Le immagini dei ristoranti appartengono ai rispettivi proprietari{'\n'}
            • I marchi citati appartengono ai legittimi proprietari
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            9. Modifiche al Servizio
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            Ci riserviamo il diritto di:{'\n\n'}
            • Modificare o interrompere il servizio in qualsiasi momento{'\n'}
            • Aggiornare questi termini con preavviso di 30 giorni{'\n'}
            • Rimuovere contenuti o funzionalità{'\n'}
            • Bloccare l'accesso in caso di violazioni{'\n\n'}
            Le modifiche sostanziali verranno comunicate tramite l'App 
            o via email se disponibile.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            10. Risoluzione Controversie
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            In caso di controversie:{'\n\n'}
            • Cerca prima una soluzione amichevole contattandoci{'\n'}
            • Per i consumatori si applicano le norme del Codice del Consumo{'\n'}
            • Foro competente: Tribunale di [CITTÀ SEDE LEGALE]{'\n'}
            • Legge applicabile: Italiana{'\n\n'}
            Per questioni relative al consumo puoi rivolgerti agli 
            organismi di risoluzione alternative delle controversie.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            11. Età Minima
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            L'App è destinata a utenti di almeno 13 anni. Gli utenti tra 13 e 18 anni 
            devono avere il consenso dei genitori per l'utilizzo. 
            Non raccogliamo consapevolmente dati da minori di 13 anni.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            12. Contatti e Supporto
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            Per domande sui termini di servizio o supporto:{'\n\n'}
            Email:{' '}
            <Text style={[styles.link, { color: colors.tint }]} onPress={handleEmailPress}>
              info@allfoodsicily.it
            </Text>
            {'\n'}
            Indirizzo: [INDIRIZZO COMPLETO]{'\n'}
            Partita IVA: [PARTITA IVA]{'\n'}
            Telefono: [NUMERO TELEFONO]{'\n\n'}
            Rispondiamo entro 48 ore lavorative.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            13. Disposizioni Finali
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            • Se una clausola dovesse essere invalida, le altre rimangono valide{'\n'}
            • Il mancato esercizio di un diritto non costituisce rinuncia{'\n'}
            • Questi termini sostituiscono ogni accordo precedente{'\n'}
            • Versioni in altre lingue sono solo a scopo informativo{'\n\n'}
            L'uso continuato dell'App dopo modifiche ai termini 
            costituisce accettazione delle nuove condizioni.
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