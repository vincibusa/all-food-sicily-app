import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome, Feather } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

export default function InformazioniPersonali() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  // Stati per i campi del form
  const [nome, setNome] = useState('Mario');
  const [cognome, setCognome] = useState('Rossi');
  const [email, setEmail] = useState('mario.rossi@example.com');
  const [telefono, setTelefono] = useState('+39 123 456 7890');
  const [citta, setCitta] = useState('Palermo');

  // Funzione per salvare le modifiche
  const salvaModifiche = () => {
    // In un'app reale, qui invieresti i dati a un backend
    Alert.alert(
      "Modifiche salvate",
      "Le tue informazioni personali sono state aggiornate con successo.",
      [{ text: "OK" }]
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
        
        <Text style={[styles.headerTitle, { color: colors.text }]}>Informazioni Personali</Text>
        
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.container}>
        {/* Form di modifica */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Nome</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              value={nome}
              onChangeText={setNome}
              placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Cognome</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              value={cognome}
              onChangeText={setCognome}
              placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Telefono</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
              placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Città</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              value={citta}
              onChangeText={setCitta}
              placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={salvaModifiche}
          >
            <Text style={styles.saveButtonText}>Salva Modifiche</Text>
          </TouchableOpacity>
          
          <Text style={[styles.infoText, { color: colors.text }]}>
            Le tue informazioni personali ci aiutano a personalizzare la tua esperienza su AllFoodSicily e sono protette secondo la nostra politica sulla privacy.
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
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  saveButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  }
}); 