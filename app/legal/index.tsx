import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';

interface LegalItemProps {
  title: string;
  description: string;
  icon: string;
  route: string;
  colors: any;
  onPress: (route: string) => void;
}

const LegalItem: React.FC<LegalItemProps> = ({ 
  title, 
  description, 
  icon, 
  route, 
  colors, 
  onPress 
}) => (
  <TouchableOpacity
    style={[styles.legalItem, { backgroundColor: colors.card, borderColor: colors.border }]}
    onPress={() => onPress(route)}
    activeOpacity={0.7}
  >
    <View style={[styles.iconContainer, { backgroundColor: colors.tint + '15' }]}>
      <MaterialIcons name={icon as any} size={24} color={colors.tint} />
    </View>
    <View style={styles.textContainer}>
      <Text style={[styles.itemTitle, { color: colors.text }]}>
        {title}
      </Text>
      <Text style={[styles.itemDescription, { color: colors.text + '80' }]}>
        {description}
      </Text>
    </View>
    <MaterialIcons name="chevron-right" size={20} color={colors.text + '60'} />
  </TouchableOpacity>
);

export default function LegalIndexScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const handleLegalItemPress = (route: string) => {
    router.push(route as any);
  };

  const legalItems = [
    {
      title: 'Informativa Privacy',
      description: 'Come trattiamo i tuoi dati personali secondo GDPR',
      icon: 'privacy-tip',
      route: '/legal/privacy',
    },
    {
      title: 'Termini di Servizio',
      description: 'Condizioni di utilizzo dell\'applicazione',
      icon: 'description',
      route: '/legal/terms',
    },
    {
      title: 'Termini Coupon',
      description: 'Regolamento per offerte e sconti',
      icon: 'local-offer',
      route: '/legal/coupon-terms',
    },
  ];

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
          Informazioni Legali
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introSection}>
          <View style={[styles.introIcon, { backgroundColor: colors.tint + '15' }]}>
            <MaterialIcons name="gavel" size={32} color={colors.tint} />
          </View>
          
          <Text style={[styles.introTitle, { color: colors.text }]}>
            Trasparenza e Conformità
          </Text>
          
          <Text style={[styles.introDescription, { color: colors.text + '80' }]}>
            AllFoodSicily è conforme alle normative europee sulla privacy (GDPR) 
            e alle leggi italiane di protezione del consumatore. Qui trovi tutte 
            le informazioni sui tuoi diritti e le nostre responsabilità.
          </Text>
        </View>

        <View style={styles.itemsContainer}>
          {legalItems.map((item, index) => (
            <LegalItem
              key={index}
              title={item.title}
              description={item.description}
              icon={item.icon}
              route={item.route}
              colors={colors}
              onPress={handleLegalItemPress}
            />
          ))}
        </View>

        <View style={[styles.infoBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MaterialIcons name="info" size={20} color={colors.tint} style={styles.infoIcon} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            <Text style={{ fontWeight: '600' }}>Data ultimo aggiornamento:</Text>{' '}
            {new Date().toLocaleDateString('it-IT', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>

        <View style={styles.contactSection}>
          <Text style={[styles.contactTitle, { color: colors.text }]}>
            Hai domande sui tuoi diritti?
          </Text>
          <Text style={[styles.contactDescription, { color: colors.text + '80' }]}>
            Per qualsiasi chiarimento sui termini di servizio, privacy 
            o utilizzo dei coupon, contattaci a privacy@allfoodsicily.it
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.text + '60' }]}>
            © 2024 AllFoodSicily{'\n'}
            Tutti i diritti riservati
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
  introSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  introIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  introDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  itemsContainer: {
    marginBottom: 32,
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  contactSection: {
    marginBottom: 32,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  contactDescription: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 24,
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});