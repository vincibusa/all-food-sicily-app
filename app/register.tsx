import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from './context/ThemeContext';
import Colors from '../constants/Colors';
import { authService } from '../services/auth.service';
import { apiClient } from '../services/api';

interface City {
  id: string;
  name: string;
  province: string;
}

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    cityId: '',
    privacyConsent: false,
    marketingConsent: false,
  });
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      const citiesData = await apiClient.get<City[]>('/cities/');
      setCities(citiesData);
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await apiClient.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        city_id: formData.cityId,
        privacy_consent: formData.privacyConsent,
        marketing_consent: formData.marketingConsent,
      });

      Alert.alert(
        'Registrazione completata!',
        'Ti abbiamo inviato un\'email di conferma. Controlla la tua casella di posta e clicca sul link per attivare il tuo account.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/login'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Errore di registrazione', error.message || 'Si è verificato un errore durante la registrazione');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      Alert.alert('Errore', 'Inserisci il nome');
      return false;
    }
    if (!formData.lastName.trim()) {
      Alert.alert('Errore', 'Inserisci il cognome');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Errore', 'Inserisci l\'email');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Errore', 'Inserisci il numero di telefono');
      return false;
    }
    if (!formData.password) {
      Alert.alert('Errore', 'Inserisci la password');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Errore', 'Le password non coincidono');
      return false;
    }
    if (!formData.cityId) {
      Alert.alert('Errore', 'Seleziona la città');
      return false;
    }
    if (!formData.privacyConsent) {
      Alert.alert('Errore', 'Devi accettare l\'informativa sulla privacy');
      return false;
    }
    return true;
  };

  const selectCity = (city: City) => {
    setSelectedCity(city);
    setFormData({ ...formData, cityId: city.id });
    setShowCityPicker(false);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  const toggleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.title, { color: colors.text }]}>
            Registrati su AllFood Sicily
          </Text>
          <Text style={[styles.subtitle, { color: colors.text + '80' }]}>
            Crea il tuo account per scoprire i migliori ristoranti
          </Text>
        </View>

        <View style={[styles.formContainer, { backgroundColor: colors.card }]}>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.label, { color: colors.text }]}>Nome *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Nome"
                placeholderTextColor={colors.text + '60'}
                value={formData.firstName}
                onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                autoCapitalize="words"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={[styles.label, { color: colors.text }]}>Cognome *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Cognome"
                placeholderTextColor={colors.text + '60'}
                value={formData.lastName}
                onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Email *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Inserisci la tua email"
              placeholderTextColor={colors.text + '60'}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Telefono *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Numero di telefono"
              placeholderTextColor={colors.text + '60'}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Città *</Text>
            <TouchableOpacity
              style={[styles.input, styles.cityPicker, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={() => setShowCityPicker(!showCityPicker)}
            >
              <Text style={[styles.cityPickerText, { color: selectedCity ? colors.text : colors.text + '60' }]}>
                {selectedCity ? selectedCity.name : 'Seleziona la città'}
              </Text>
            </TouchableOpacity>
            {showCityPicker && (
              <View style={[styles.cityList, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <ScrollView style={styles.cityScrollView} nestedScrollEnabled>
                  {cities.map((city) => (
                    <TouchableOpacity
                      key={city.id}
                      style={styles.cityItem}
                      onPress={() => selectCity(city)}
                    >
                      <Text style={[styles.cityItemText, { color: colors.text }]}>{city.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Password *</Text>
            <View style={[styles.passwordInputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: 'transparent',
                    flex: 1,
                  },
                ]}
                placeholder="Inserisci la password"
                placeholderTextColor={colors.text + '60'}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry={!isPasswordVisible}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                <Text style={{ color: colors.text }}>{isPasswordVisible ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Conferma Password *</Text>
            <View style={[styles.passwordInputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: 'transparent',
                    flex: 1,
                  },
                ]}
                placeholder="Conferma la password"
                placeholderTextColor={colors.text + '60'}
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                secureTextEntry={!isConfirmPasswordVisible}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={toggleConfirmPasswordVisibility} style={styles.eyeIcon}>
                <Text style={{ color: colors.text }}>{isConfirmPasswordVisible ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setFormData({ ...formData, privacyConsent: !formData.privacyConsent })}
            >
              <View style={[styles.checkbox, { borderColor: colors.border }]}>
                {formData.privacyConsent && (
                  <Text style={[styles.checkmark, { color: colors.primary }]}>✓</Text>
                )}
              </View>
              <Text style={[styles.checkboxText, { color: colors.text }]}>
                Accetto l'informativa sulla privacy e il trattamento dei dati personali *
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setFormData({ ...formData, marketingConsent: !formData.marketingConsent })}
            >
              <View style={[styles.checkbox, { borderColor: colors.border }]}>
                {formData.marketingConsent && (
                  <Text style={[styles.checkmark, { color: colors.primary }]}>✓</Text>
                )}
              </View>
              <Text style={[styles.checkboxText, { color: colors.text }]}>
                Acconsento al trattamento dei dati per finalità di marketing
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.registerButton, { backgroundColor: colors.primary }, isLoading && styles.disabledButton]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.registerButtonText}>
              {isLoading ? 'Registrazione in corso...' : 'Registrati'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.loginContainer}>
          <Text style={[styles.loginText, { color: colors.text + '60' }]}>
            Hai già un account?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.replace('/login')}>
            <Text style={[styles.loginLink, { color: colors.primary }]}>
              Accedi
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  formContainer: {
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  cityPicker: {
    justifyContent: 'center',
  },
  cityPickerText: {
    fontSize: 16,
  },
  cityList: {
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 150,
  },
  cityScrollView: {
    maxHeight: 150,
  },
  cityItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cityItemText: {
    fontSize: 16,
  },
  checkboxContainer: {
    marginBottom: 24,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkmark: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  registerButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  eyeIcon: {
    padding: 10,
  },
});