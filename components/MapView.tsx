/**
 * MapView - Componente per visualizzare ristoranti su mappa
 * Utilizza react-native-maps nativo
 */

import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Platform, Text, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../app/context/ThemeContext';
import { ListItem } from './ListCard';
import { useLocation, UserLocation } from '../hooks/useLocation';

interface RestaurantMapProps {
  restaurants: ListItem[];
  onMarkerPress?: (restaurant: ListItem) => void;
  onLocationRequest?: () => void;
}

const { width, height } = Dimensions.get('window');

export const RestaurantMapView: React.FC<RestaurantMapProps> = ({ restaurants, onMarkerPress, onLocationRequest }) => {
  const { colors, colorScheme } = useTheme();
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 37.5, // Centro Sicilia
    longitude: 14.0,
    latitudeDelta: 2.0,
    longitudeDelta: 2.0,
  });
  
  const { 
    location: userLocation, 
    loading: locationLoading, 
    error: locationError,
    hasPermission,
    getCurrentLocation,
    calculateDistance 
  } = useLocation();

  // Ottieni posizione utente quando il componente si monta
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Aggiorna region quando otteniamo la posizione utente
  useEffect(() => {
    if (userLocation) {
      const newRegion = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05, // Zoom più stretto per area locale
        longitudeDelta: 0.05,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);
    }
  }, [userLocation]);

  // Filtra ristoranti con coordinate valide
  const validRestaurants = restaurants.filter(r => 
    r.latitude && r.longitude && 
    !isNaN(Number(r.latitude)) && !isNaN(Number(r.longitude))
  );

  // Gestisce il tap sui marker dei ristoranti
  const handleMarkerPress = (restaurant: ListItem) => {
    if (onMarkerPress) {
      onMarkerPress(restaurant);
    }
  };

  // Centra la mappa sulla posizione utente
  const centerOnUserLocation = async () => {
    const location = await getCurrentLocation();
    if (location) {
      const newRegion = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      mapRef.current?.animateToRegion(newRegion, 1000);
      Alert.alert('Posizione aggiornata', 'La mappa è stata centrata sulla tua posizione attuale.');
    }
  };


  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Mappa nativa con react-native-maps */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={hasPermission}
        showsMyLocationButton={false}
        loadingEnabled={true}
        loadingIndicatorColor={colors.primary}
        loadingBackgroundColor={colors.background}
      >
        {/* Marker per i ristoranti */}
        {validRestaurants.map((restaurant) => (
          <Marker
            key={restaurant.id}
            coordinate={{
              latitude: Number(restaurant.latitude),
              longitude: Number(restaurant.longitude),
            }}
            title={restaurant.title}
            description={`${restaurant.city} • ${restaurant.category?.name || 'Ristorante'}`}
            onPress={() => handleMarkerPress(restaurant)}
          >
            {/* Marker personalizzato */}
            <View style={[styles.customMarker, { backgroundColor: restaurant.category?.color || colors.primary }]}>
              <MaterialIcons name="restaurant" size={20} color="white" />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Bottone per centrare sulla posizione utente */}
      {hasPermission && (
        <TouchableOpacity
          style={[styles.locationFab, { backgroundColor: colors.card }]}
          onPress={centerOnUserLocation}
        >
          <MaterialIcons 
            name="my-location" 
            size={24} 
            color={colors.primary} 
          />
        </TouchableOpacity>
      )}
      
      {/* Indicator di caricamento posizione */}
      {locationLoading && (
        <View style={[styles.loadingOverlay, { backgroundColor: colors.card }]}>
          <MaterialIcons name="location-searching" size={20} color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Rilevamento posizione...</Text>
        </View>
      )}

      {/* Banner di errore */}
      {locationError && (
        <View style={[styles.errorBanner, { backgroundColor: colors.card }]}>
          <MaterialIcons name="error-outline" size={16} color="#ff6b6b" />
          <Text style={[styles.errorText, { color: colors.text }]}>
            {locationError}
          </Text>
        </View>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height - 200, // Lascia spazio per header e tabs
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  customMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  locationFab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorBanner: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorText: {
    fontSize: 12,
    flex: 1,
  },
});

export default RestaurantMapView;