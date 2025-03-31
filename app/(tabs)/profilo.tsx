import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Switch } from "react-native";
import { useColorScheme } from "react-native";
import Colors from "../../constants/Colors";
import { useState } from "react";
import { FontAwesome, MaterialIcons, Ionicons, Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfiloScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Stati per le preferenze utente
  const [notificheAttive, setNotificheAttive] = useState(true);
  const [darkModeAttivo, setDarkModeAttivo] = useState(colorScheme === 'dark');
  const [newsletterAttiva, setNewsletterAttiva] = useState(true);
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Profilo */}
      <View style={[styles.profileHeader, { backgroundColor: colors.card }]}>
        <View style={styles.profileImageContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80' }} 
            style={styles.profileImage} 
          />
          <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.primary }]}>
            <FontAwesome name="camera" size={16} color="white" />
          </TouchableOpacity>
        </View>
        <Text style={[styles.profileName, { color: colors.text }]}>Mario Rossi</Text>
        <Text style={[styles.profileEmail, { color: colors.text }]}>mario.rossi@example.com</Text>
        <TouchableOpacity style={[styles.editProfileButton, { backgroundColor: colors.card, borderColor: colors.primary }]}>
          <Text style={[styles.editProfileText, { color: colors.primary }]}>Modifica Profilo</Text>
        </TouchableOpacity>
      </View>
      
      {/* Statistiche */}
      <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.text }]}>12</Text>
          <Text style={[styles.statLabel, { color: colors.text }]}>Articoli Salvati</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.text }]}>8</Text>
          <Text style={[styles.statLabel, { color: colors.text }]}>Ristoranti Preferiti</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.text }]}>5</Text>
          <Text style={[styles.statLabel, { color: colors.text }]}>Recensioni</Text>
        </View>
      </View>
      
      {/* Menu Impostazioni */}
      <View style={styles.menuSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Impostazioni</Text>
        
        <View style={[styles.menuItem, { backgroundColor: colors.card }]}>
          <View style={styles.menuItemLeft}>
            <MaterialIcons name="notifications" size={24} color={colors.primary} style={styles.menuIcon} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>Notifiche</Text>
          </View>
          <Switch
            value={notificheAttive}
            onValueChange={setNotificheAttive}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor={'#f4f3f4'}
          />
        </View>
        
        <View style={[styles.menuItem, { backgroundColor: colors.card }]}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="moon" size={24} color={colors.primary} style={styles.menuIcon} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>Modalità Scura</Text>
          </View>
          <Switch
            value={darkModeAttivo}
            onValueChange={setDarkModeAttivo}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor={'#f4f3f4'}
          />
        </View>
        
        <View style={[styles.menuItem, { backgroundColor: colors.card }]}>
          <View style={styles.menuItemLeft}>
            <MaterialIcons name="email" size={24} color={colors.primary} style={styles.menuIcon} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>Newsletter</Text>
          </View>
          <Switch
            value={newsletterAttiva}
            onValueChange={setNewsletterAttiva}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor={'#f4f3f4'}
          />
        </View>
      </View>
      
      {/* Menu Account */}
      <View style={styles.menuSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
        
        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card }]}>
          <View style={styles.menuItemLeft}>
            <Feather name="user" size={24} color={colors.primary} style={styles.menuIcon} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>Informazioni Personali</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card }]}>
          <View style={styles.menuItemLeft}>
            <Feather name="shield" size={24} color={colors.primary} style={styles.menuIcon} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>Privacy e Sicurezza</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card }]}>
          <View style={styles.menuItemLeft}>
            <Feather name="help-circle" size={24} color={colors.primary} style={styles.menuIcon} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>Aiuto e Supporto</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card }]}>
          <View style={styles.menuItemLeft}>
            <Feather name="info" size={24} color={colors.primary} style={styles.menuIcon} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>Informazioni sull'App</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: 'rgba(255, 59, 48, 0.1)' }]}>
          <Feather name="log-out" size={20} color="#FF3B30" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Esci</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 16,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    marginBottom: 16,
  },
  editProfileButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    paddingVertical: 16,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: '70%',
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignSelf: 'center',
  },
  menuSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
}); 