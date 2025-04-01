import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { FontAwesome, Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function PrivacySicurezza() {
  const { colors, colorScheme } = useTheme();
  const router = useRouter();

  // Stati per le impostazioni di privacy
  const [condivisioneLocation, setCondivisioneLocation] = useState(false);
  const [raccoltaDati, setRaccoltaDati] = useState(true);
  const [cookieMarketing, setCookieMarketing] = useState(false);
  const [autenticazioneBiometrica, setAutenticazioneBiometrica] = useState(true);
  const [autenticazioneAvanzata, setAutenticazioneAvanzata] = useState(false);

  // Funzione per eliminare l'account
  const eliminaAccount = () => {
    Alert.alert(
      "Elimina Account",
      "Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile e tutti i tuoi dati verranno persi.",
      [
        { text: "Annulla", style: "cancel" },
        { text: "Elimina", style: "destructive", onPress: () => console.log("Account eliminato") }
      ]
    );
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
        
        <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy e Sicurezza</Text>
        
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.container}>
        {/* Sezione Privacy */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Impostazioni Privacy</Text>
          
          <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
            <View style={styles.settingInfo}>
              <FontAwesome name="location-arrow" size={22} color={colors.primary} />
              <Text style={[styles.settingText, { color: colors.text }]}>Condivisione posizione</Text>
            </View>
            <Switch
              value={condivisioneLocation}
              onValueChange={setCondivisioneLocation}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={'#f4f3f4'}
            />
          </View>
          
          <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
            <View style={styles.settingInfo}>
              <FontAwesome name="bar-chart" size={22} color={colors.primary} />
              <Text style={[styles.settingText, { color: colors.text }]}>Raccolta dati di utilizzo</Text>
            </View>
            <Switch
              value={raccoltaDati}
              onValueChange={setRaccoltaDati}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={'#f4f3f4'}
            />
          </View>
          
          <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
            <View style={styles.settingInfo}>
              <FontAwesome name="gear" size={22} color={colors.primary} />
              <Text style={[styles.settingText, { color: colors.text }]}>Cookie per marketing</Text>
            </View>
            <Switch
              value={cookieMarketing}
              onValueChange={setCookieMarketing}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={'#f4f3f4'}
            />
          </View>
        </View>
        
        {/* Sezione Sicurezza */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Sicurezza Account</Text>
          
          <TouchableOpacity style={[styles.settingButton, { backgroundColor: colors.card }]}>
            <View style={styles.settingInfo}>
              <FontAwesome name="lock" size={22} color={colors.primary} />
              <Text style={[styles.settingText, { color: colors.text }]}>Modifica password</Text>
            </View>
            <FontAwesome name="chevron-right" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
            <View style={styles.settingInfo}>
              <FontAwesome name="lock" size={22} color={colors.primary} />
              <Text style={[styles.settingText, { color: colors.text }]}>Autenticazione biometrica</Text>
            </View>
            <Switch
              value={autenticazioneBiometrica}
              onValueChange={setAutenticazioneBiometrica}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={'#f4f3f4'}
            />
          </View>
          
          <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
            <View style={styles.settingInfo}>
              <FontAwesome name="shield" size={22} color={colors.primary} />
              <Text style={[styles.settingText, { color: colors.text }]}>Autenticazione a due fattori</Text>
            </View>
            <Switch
              value={autenticazioneAvanzata}
              onValueChange={setAutenticazioneAvanzata}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={'#f4f3f4'}
            />
          </View>
          
          <TouchableOpacity style={[styles.settingButton, { backgroundColor: colors.card }]}>
            <View style={styles.settingInfo}>
              <FontAwesome name="mobile" size={22} color={colors.primary} />
              <Text style={[styles.settingText, { color: colors.text }]}>Dispositivi collegati</Text>
            </View>
            <FontAwesome name="chevron-right" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        {/* Eliminazione Account */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.deleteButton, { backgroundColor: 'rgba(255, 59, 48, 0.1)' }]}
            onPress={eliminaAccount}
          >
            <FontAwesome name="trash" size={22} color="#FF3B30" />
            <Text style={styles.deleteText}>Elimina Account</Text>
          </TouchableOpacity>
          
          <Text style={[styles.infoText, { color: colors.text }]}>
            Eliminando il tuo account, tutti i tuoi dati personali e le preferenze saranno cancellati definitivamente dal nostro sistema.
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
  section: {
    padding: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  deleteText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  }
}); 