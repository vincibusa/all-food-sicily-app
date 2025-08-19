import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Switch,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../app/context/ThemeContext';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  functional: boolean;
}

const STORAGE_KEY = '@allfoodsicily_cookie_consent';
const PREFERENCES_KEY = '@allfoodsicily_cookie_preferences';

export const CookieConsent: React.FC = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    functional: false,
  });

  useEffect(() => {
    checkConsentStatus();
  }, []);

  const checkConsentStatus = async () => {
    try {
      const consent = await AsyncStorage.getItem(STORAGE_KEY);
      if (!consent) {
        setIsVisible(true);
      } else {
        // Carica le preferenze salvate
        const savedPreferences = await AsyncStorage.getItem(PREFERENCES_KEY);
        if (savedPreferences) {
          setPreferences(JSON.parse(savedPreferences));
        }
      }
    } catch (error) {
      console.error('Error checking consent status:', error);
      setIsVisible(true);
    }
  };

  const saveConsent = async (accepted: boolean, customPreferences?: CookiePreferences) => {
    try {
      const finalPreferences = customPreferences || {
        necessary: true,
        analytics: accepted,
        functional: accepted,
      };

      await AsyncStorage.setItem(STORAGE_KEY, 'true');
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(finalPreferences));
      
      setPreferences(finalPreferences);
      setIsVisible(false);
      setShowSettings(false);

      // Applica le preferenze ai servizi
      applyPreferences(finalPreferences);
    } catch (error) {
      console.error('Error saving consent:', error);
    }
  };

  const applyPreferences = (prefs: CookiePreferences) => {
    // Qui implementerai la logica per abilitare/disabilitare i servizi
    console.log('Applying cookie preferences:', prefs);
    
    // Esempio per Firebase Analytics (da implementare)
    if (prefs.analytics) {
      // Abilita Firebase Analytics
      console.log('Analytics enabled');
    } else {
      // Disabilita Firebase Analytics
      console.log('Analytics disabled');
    }
  };

  const handleAcceptAll = () => {
    saveConsent(true);
  };

  const handleAcceptNecessary = () => {
    saveConsent(false);
  };

  const handleSavePreferences = () => {
    saveConsent(true, preferences);
  };

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Banner principale */}
      <View style={[styles.banner, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View style={styles.bannerContent}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="cookie" size={24} color={colors.tint} />
          </View>
          
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: colors.text }]}>
              Utilizzo dei Cookie
            </Text>
            <Text style={[styles.description, { color: colors.text + '80' }]}>
              Utilizziamo cookie e tecnologie simili per migliorare la tua esperienza, 
              analizzare l'utilizzo dell'app e personalizzare i contenuti.
            </Text>
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.settingsButton, { borderColor: colors.border }]}
            onPress={() => setShowSettings(true)}
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>
              Personalizza
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.necessaryButton, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={handleAcceptNecessary}
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>
              Solo Necessari
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.acceptButton, { backgroundColor: colors.tint }]}
            onPress={handleAcceptAll}
          >
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
              Accetta Tutti
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.privacyLink}
          onPress={() => router.push('/legal/privacy')}
        >
          <Text style={[styles.privacyText, { color: colors.tint }]}>
            Leggi la Privacy Policy
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal impostazioni dettagliate */}
      <Modal
        visible={showSettings}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSettings(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSettings(false)}
            >
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Impostazioni Cookie
            </Text>
            <View style={styles.closeButton} />
          </View>

          <View style={styles.modalContent}>
            <Text style={[styles.modalDescription, { color: colors.text + '80' }]}>
              Personalizza le tue preferenze sui cookie. I cookie necessari sono sempre attivi 
              per garantire il funzionamento base dell'applicazione.
            </Text>

            {/* Cookie Necessari */}
            <View style={[styles.cookieSection, { borderBottomColor: colors.border }]}>
              <View style={styles.cookieHeader}>
                <Text style={[styles.cookieTitle, { color: colors.text }]}>
                  Cookie Necessari
                </Text>
                <Switch
                  value={preferences.necessary}
                  disabled={true}
                  trackColor={{ false: colors.border, true: colors.tint }}
                  thumbColor="#FFFFFF"
                />
              </View>
              <Text style={[styles.cookieDescription, { color: colors.text + '80' }]}>
                Essenziali per il funzionamento dell'app. Include autenticazione, 
                sicurezza e funzionalità di base.
              </Text>
            </View>

            {/* Cookie Analytics */}
            <View style={[styles.cookieSection, { borderBottomColor: colors.border }]}>
              <View style={styles.cookieHeader}>
                <Text style={[styles.cookieTitle, { color: colors.text }]}>
                  Cookie di Analisi
                </Text>
                <Switch
                  value={preferences.analytics}
                  onValueChange={(value) => updatePreference('analytics', value)}
                  trackColor={{ false: colors.border, true: colors.tint }}
                  thumbColor="#FFFFFF"
                />
              </View>
              <Text style={[styles.cookieDescription, { color: colors.text + '80' }]}>
                Ci aiutano a capire come utilizzi l'app per migliorare le prestazioni 
                e l'esperienza utente. Dati anonimi tramite Firebase Analytics.
              </Text>
            </View>

            {/* Cookie Funzionali */}
            <View style={styles.cookieSection}>
              <View style={styles.cookieHeader}>
                <Text style={[styles.cookieTitle, { color: colors.text }]}>
                  Cookie Funzionali
                </Text>
                <Switch
                  value={preferences.functional}
                  onValueChange={(value) => updatePreference('functional', value)}
                  trackColor={{ false: colors.border, true: colors.tint }}
                  thumbColor="#FFFFFF"
                />
              </View>
              <Text style={[styles.cookieDescription, { color: colors.text + '80' }]}>
                Memorizzano le tue preferenze e personalizzazioni per migliorare 
                l'esperienza d'uso dell'applicazione.
              </Text>
            </View>
          </View>

          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalSecondaryButton, { borderColor: colors.border }]}
              onPress={() => setShowSettings(false)}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>
                Annulla
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalPrimaryButton, { backgroundColor: colors.tint }]}
              onPress={handleSavePreferences}
            >
              <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                Salva Preferenze
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    zIndex: 9999,
  },
  bannerContent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  settingsButton: {
    backgroundColor: 'transparent',
  },
  necessaryButton: {
    backgroundColor: 'transparent',
  },
  acceptButton: {
    borderWidth: 0,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  privacyLink: {
    alignSelf: 'center',
  },
  privacyText: {
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
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
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  modalDescription: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 24,
  },
  cookieSection: {
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  cookieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cookieTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cookieDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalSecondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  modalPrimaryButton: {
    borderWidth: 0,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CookieConsent;