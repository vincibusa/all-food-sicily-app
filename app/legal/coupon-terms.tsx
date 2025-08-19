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

export default function CouponTermsScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const handleEmailPress = () => {
    Linking.openURL('mailto:support@allfoodsicily.it');
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
          Termini Coupon e Offerte
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
            1. Natura del Servizio
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            AllFoodSicily funge da piattaforma di aggregazione e promozione di 
            offerte e coupon forniti direttamente dai ristoranti e strutture 
            ricettive partner. Non siamo il venditore diretto dei beni o servizi offerti.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            2. Validità e Utilizzo dei Coupon
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            <Text style={{ fontWeight: '600' }}>2.1 Validità Temporale{'\n'}</Text>
            • Ogni coupon ha una data di scadenza specifica{'\n'}
            • I coupon scaduti non possono essere utilizzati{'\n'}
            • Non è possibile prorogare la validità oltre la data indicata{'\n\n'}
            
            <Text style={{ fontWeight: '600' }}>2.2 Utilizzo{'\n'}</Text>
            • Un coupon può essere utilizzato una sola volta per utente{'\n'}
            • Deve essere presentato prima dell'ordinazione{'\n'}
            • Valido solo presso il ristorante/hotel specificato{'\n'}
            • Non trasferibile a terzi
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            3. Condizioni Specifiche
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            Ogni coupon può avere condizioni specifiche tra cui:{'\n\n'}
            • Importo minimo di spesa richiesto{'\n'}
            • Giorni e orari di validità (es. solo cena, esclusi festivi){'\n'}
            • Limitazioni su menù o prodotti specifici{'\n'}
            • Numero massimo di persone per coupon{'\n'}
            • Necessità di prenotazione anticipata{'\n'}
            • Esclusioni per eventi speciali o periodi particolari{'\n\n'}
            
            È responsabilità dell'utente leggere e rispettare tutte 
            le condizioni specificate nel coupon.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            4. Modalità di Riscatto
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            <Text style={{ fontWeight: '600' }}>4.1 Digitale{'\n'}</Text>
            • Mostra il coupon sullo schermo del dispositivo{'\n'}
            • Assicurati che il codice/QR code sia ben visibile{'\n'}
            • Mantieni l'app aggiornata per evitare problemi di visualizzazione{'\n\n'}
            
            <Text style={{ fontWeight: '600' }}>4.2 Procedura{'\n'}</Text>
            • Presenta il coupon al momento dell'arrivo{'\n'}
            • Comunica l'intenzione di utilizzare l'offerta prima dell'ordinazione{'\n'}
            • Il personale verificherà validità e condizioni{'\n'}
            • Lo sconto verrà applicato al momento del pagamento
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            5. Responsabilità e Limitazioni
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            <Text style={{ fontWeight: '600' }}>5.1 Responsabilità di AllFoodSicily{'\n'}</Text>
            • Forniamo la piattaforma per visualizzare le offerte{'\n'}
            • Non garantiamo la disponibilità continuativa delle offerte{'\n'}
            • Non siamo responsabili per modifiche unilaterali da parte dei partner{'\n'}
            • Non interveniamo in controversie tra utenti e ristoranti{'\n\n'}
            
            <Text style={{ fontWeight: '600' }}>5.2 Responsabilità del Ristorante/Hotel{'\n'}</Text>
            • Definisce termini e condizioni specifici dell'offerta{'\n'}
            • È responsabile della qualità di beni e servizi{'\n'}
            • Gestisce direttamente reclami su prodotti/servizi{'\n'}
            • Può modificare o sospendere offerte con preavviso
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            6. Problemi e Controversie
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            In caso di problemi con i coupon:{'\n\n'}
            <Text style={{ fontWeight: '600' }}>6.1 Prima azione{'\n'}</Text>
            • Parla direttamente con il responsabile del locale{'\n'}
            • Mostra chiaramente il coupon e le sue condizioni{'\n'}
            • Chiedi spiegazioni per eventuali rifiuti{'\n\n'}
            
            <Text style={{ fontWeight: '600' }}>6.2 Supporto AllFoodSicily{'\n'}</Text>
            Se il problema persiste, contattaci a:{'\n'}
            <Text style={[styles.link, { color: colors.tint }]} onPress={handleEmailPress}>
              support@allfoodsicily.it
            </Text>
            {'\n\n'}
            Fornisci:{'\n'}
            • Screenshot del coupon{'\n'}
            • Nome del locale e data della visita{'\n'}
            • Descrizione dettagliata del problema{'\n'}
            • Eventuale scontrino o ricevuta
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            7. Modifiche e Cancellazioni
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            <Text style={{ fontWeight: '600' }}>7.1 Da parte del Ristorante{'\n'}</Text>
            I partner possono:{'\n'}
            • Modificare condizioni con preavviso di 48 ore{'\n'}
            • Sospendere temporaneamente l'offerta per motivi operativi{'\n'}
            • Terminare definitivamente la promozione{'\n\n'}
            
            <Text style={{ fontWeight: '600' }}>7.2 Notifiche{'\n'}</Text>
            Le modifiche significative verranno comunicate tramite:{'\n'}
            • Aggiornamento nell'app{'\n'}
            • Notifica push (se abilitata){'\n'}
            • Email (dove disponibile)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            8. Frodi e Abusi
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            È vietato:{'\n\n'}
            • Utilizzare lo stesso coupon più volte{'\n'}
            • Duplicare o falsificare coupon{'\n'}
            • Vendere o cedere coupon a terzi{'\n'}
            • Utilizzare coupon in modo non conforme alle condizioni{'\n\n'}
            
            Le violazioni comportano:{'\n'}
            • Rifiuto del coupon{'\n'}
            • Esclusione da future promozioni{'\n'}
            • Possibili azioni legali in casi gravi
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            9. Diritti del Consumatore
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            Rimangono validi tutti i diritti previsti dal Codice del Consumo:{'\n\n'}
            • Diritto di recesso per servizi (dove applicabile){'\n'}
            • Garanzie sui prodotti{'\n'}
            • Rimedi per vizi e difformità{'\n'}
            • Accesso a procedure di risoluzione alternative delle controversie{'\n\n'}
            
            Per maggiori informazioni sui tuoi diritti, consulta il sito 
            del Ministero dello Sviluppo Economico.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            10. Uso Commerciale
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            I coupon sono destinati esclusivamente a uso personale e familiare:{'\n\n'}
            • Vietato l'uso per attività commerciali{'\n'}
            • Non è consentita la rivendita{'\n'}
            • Proibita la distribuzione non autorizzata{'\n'}
            • Utilizzo solo per il consumo finale dei beni/servizi
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            11. Aggiornamenti
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            Questi termini possono essere aggiornati periodicamente per:{'\n\n'}
            • Conformarsi a nuove normative{'\n'}
            • Migliorare la chiarezza delle condizioni{'\n'}
            • Riflettere cambiamenti nel servizio{'\n\n'}
            
            Gli aggiornamenti significativi verranno comunicati con almeno 
            15 giorni di preavviso tramite l'applicazione.
          </Text>
        </View>

        <View style={[styles.highlightBox, { backgroundColor: colors.tint + '10', borderColor: colors.tint }]}>
          <MaterialIcons name="lightbulb" size={20} color={colors.tint} style={styles.highlightIcon} />
          <Text style={[styles.highlightText, { color: colors.text }]}>
            <Text style={{ fontWeight: '600' }}>Consiglio:</Text> Prima di utilizzare un coupon, 
            contatta sempre il ristorante per confermare la disponibilità e verificare 
            eventuali condizioni particolari, specialmente per cene importanti o eventi speciali.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            12. Contatti
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            Per domande sui coupon o assistenza:{'\n\n'}
            Email supporto:{' '}
            <Text style={[styles.link, { color: colors.tint }]} onPress={handleEmailPress}>
              support@allfoodsicily.it
            </Text>
            {'\n'}
            Risposta entro: 24 ore lavorative{'\n'}
            Lingue supportate: Italiano, Inglese
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
  highlightBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 28,
  },
  highlightIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  highlightText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
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