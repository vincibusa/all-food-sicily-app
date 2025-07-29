import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  Switch,
  Linking,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { useHaptics } from '../../utils/haptics';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

const { width: screenWidth } = Dimensions.get('window');

interface SettingItemProps {
  icon: string;
  iconType?: 'MaterialIcons' | 'FontAwesome';
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
  showChevron?: boolean;
  delay?: number;
}

interface FAQItemProps {
  question: string;
  answer: string;
  delay?: number;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  iconType = 'MaterialIcons',
  title,
  subtitle,
  onPress,
  rightComponent,
  showChevron = true,
  delay = 0
}) => {
  const { colors } = useTheme();
  const { onTap } = useHaptics();
  
  const IconComponent = iconType === 'FontAwesome' ? FontAwesome : MaterialIcons;

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(300)}>
      <TouchableOpacity
        style={[styles.settingItem, { backgroundColor: colors.card }]}
        onPress={() => {
          onTap();
          onPress?.();
        }}
        activeOpacity={0.7}
      >
        <View style={[styles.settingIconContainer, { backgroundColor: colors.primary + '15' }]}>
          <IconComponent name={icon as any} size={20} color={colors.primary} />
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: colors.text + '80' }]}>{subtitle}</Text>
          )}
        </View>
        {rightComponent || (showChevron && onPress && (
          <MaterialIcons name="chevron-right" size={20} color={colors.text + '60'} />
        ))}
      </TouchableOpacity>
    </Animated.View>
  );
};

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, delay = 0 }) => {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const { onTap } = useHaptics();

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(300)}>
      <TouchableOpacity
        style={[styles.faqItem, { backgroundColor: colors.card }]}
        onPress={() => {
          onTap();
          setExpanded(!expanded);
        }}
        activeOpacity={0.8}
      >
        <View style={styles.faqHeader}>
          <Text style={[styles.faqQuestion, { color: colors.text }]}>{question}</Text>
          <MaterialIcons 
            name={expanded ? "expand-less" : "expand-more"} 
            size={24} 
            color={colors.primary} 
          />
        </View>
        {expanded && (
          <Animated.View entering={FadeIn.duration(200)}>
            <Text style={[styles.faqAnswer, { color: colors.text + 'CC' }]}>{answer}</Text>
          </Animated.View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function ImpostazioniScreen() {
  const { colors } = useTheme();
  const { onTap } = useHaptics();

  const appInfo = {
    version: Application.nativeApplicationVersion || '1.0.0',
    buildVersion: Application.nativeBuildVersion || '1',
    deviceName: Device.deviceName || 'Dispositivo sconosciuto',
    osName: Device.osName || 'OS sconosciuto',
    osVersion: Device.osVersion || 'Versione sconosciuta',
  };

  const faqData = [
    {
      question: "Come posso cercare ristoranti?",
      answer: "Usa la barra di ricerca nella sezione Ristoranti per trovare ristoranti per nome, città o categoria. Puoi anche utilizzare i filtri avanzati per affinare la ricerca."
    },
    {
      question: "Come funziona la mappa?",
      answer: "Nella sezione Ristoranti, tocca il pulsante 'Mappa' per visualizzare tutti i ristoranti su una mappa interattiva. Puoi toccare i marker per vedere i dettagli e navigare ai ristoranti."
    },
    {
      question: "Posso usare l'app senza creare un account?",
      answer: "Sì! L'app è completamente utilizzabile senza registrazione. Puoi esplorare ristoranti, leggere guide e utilizzare tutte le funzionalità principali."
    },
    {
      question: "Come vengono aggiornati i dati dei ristoranti?",
      answer: "I dati vengono aggiornati regolarmente dal nostro team. Puoi sempre ottenere le informazioni più recenti trascinando verso il basso per aggiornare le liste."
    },
    {
      question: "L'app funziona offline?",
      answer: "L'app richiede una connessione internet per caricare i dati dei ristoranti e le mappe. Tuttavia, le informazioni visualizzate rimangono accessibili finché l'app è aperta."
    },
    {
      question: "Come posso segnalare un problema?",
      answer: "Puoi contattarci tramite email usando l'opzione 'Contattaci' nelle impostazioni. Saremo felici di aiutarti con qualsiasi problema o suggerimento."
    }
  ];

  const handleContactSupport = () => {
    Alert.alert(
      'Contattaci',
      'Scegli come preferisci contattarci:',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Email',
          onPress: () => Linking.openURL('mailto:support@allfoodsicily.com?subject=Supporto AllFood Sicily App')
        },
        {
          text: 'Sito Web',
          onPress: () => Linking.openURL('https://allfoodsicily.com')
        }
      ]
    );
  };

  const handleRateApp = () => {
    Alert.alert(
      'Valuta l\'App',
      'Ti piace AllFood Sicily? Lasciaci una recensione sull\'App Store!',
      [
        { text: 'Più tardi', style: 'cancel' },
        {
          text: 'Valuta ora',
          onPress: () => {
            // In una vera app, questo aprirebbe l'App Store
            Alert.alert('Grazie!', 'Funzionalità non disponibile in modalità sviluppo.');
          }
        }
      ]
    );
  };

  const handleShareApp = () => {
    Alert.alert(
      'Condividi App',
      'Condividi AllFood Sicily con i tuoi amici!',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Condividi',
          onPress: () => {
            // In una vera app, questo aprirebbe il menu di condivisione
            Alert.alert('Condivisione', 'Funzionalità non disponibile in modalità sviluppo.');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <MaterialIcons name="settings" size={32} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Impostazioni</Text>
          <Text style={[styles.headerSubtitle, { color: colors.text + '80' }]}>
            Personalizza la tua esperienza
          </Text>
        </Animated.View>


        {/* Generale */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Generale</Text>
          <SettingItem
            icon="star"
            title="Valuta l'app"
            subtitle="Lasciaci una recensione"
            onPress={handleRateApp}
            delay={150}
          />
          <SettingItem
            icon="share"
            title="Condividi app"
            subtitle="Condividi con gli amici"
            onPress={handleShareApp}
            delay={200}
          />
          <SettingItem
            icon="support"
            title="Contattaci"
            subtitle="Aiuto e supporto"
            onPress={handleContactSupport}
            delay={250}
          />
        </Animated.View>

        {/* FAQ */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Domande Frequenti</Text>
          {faqData.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              delay={350 + index * 50}
            />
          ))}
        </Animated.View>

        {/* Informazioni App */}
        <Animated.View entering={FadeInDown.delay(700).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Informazioni App</Text>
          <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
            <View style={styles.infoRow}>
              <MaterialIcons name="info" size={20} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.text + '80' }]}>Versione</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {appInfo.version} ({appInfo.buildVersion})
                </Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <MaterialIcons name="phone-android" size={20} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.text + '80' }]}>Dispositivo</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {appInfo.deviceName}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <MaterialIcons name="system-update" size={20} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.text + '80' }]}>Sistema</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {appInfo.osName} {appInfo.osVersion}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <MaterialIcons name="business" size={20} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.text + '80' }]}>Sviluppato da</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  AllFood Sicily Team
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Footer */}
        <Animated.View entering={FadeInDown.delay(900).duration(400)} style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.text + '60' }]}>
            © 2024 AllFood Sicily
          </Text>
          <Text style={[styles.footerText, { color: colors.text + '60' }]}>
            Versione {appInfo.version}
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 32,
    marginBottom: 16,
    marginHorizontal: 24,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  faqItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginTop: 12,
  },
  infoCard: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoContent: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginTop: 32,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
});