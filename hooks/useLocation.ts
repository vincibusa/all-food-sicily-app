/**
 * Hook per gestire la geolocalizzazione dell'utente
 * Utilizza expo-location con gestione errori e permessi
 */

import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Platform, Alert } from 'react-native';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface LocationState {
  location: UserLocation | null;
  loading: boolean;
  error: string | null;
  hasPermission: boolean;
}

export const useLocation = () => {
  const [state, setState] = useState<LocationState>({
    location: null,
    loading: false,
    error: null,
    hasPermission: false,
  });

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      console.log('🔐 Richiesta permessi geolocalizzazione...');
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Controlla permessi attuali
      console.log('🔍 Controllo permessi esistenti...');
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      console.log('📄 Status permessi esistenti:', existingStatus);
      
      if (existingStatus === 'granted') {
        console.log('✅ Permessi già concessi');
        setState(prev => ({ ...prev, hasPermission: true, loading: false }));
        return true;
      }

      // Richiedi permessi se non già concessi
      console.log('🙋‍♂️ Richiesta nuovi permessi...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('📝 Risposta richiesta permessi:', status);
      
      if (status === 'granted') {
        console.log('✅ Permessi concessi con successo');
        setState(prev => ({ ...prev, hasPermission: true, loading: false }));
        return true;
      } else {
        console.log('❌ Permessi negati dall\'utente');
        setState(prev => ({ 
          ...prev, 
          hasPermission: false, 
          loading: false,
          error: 'Permesso di geolocalizzazione negato'
        }));
        
        // Mostra alert per guidare l'utente alle impostazioni
        Alert.alert(
          'Posizione richiesta',
          'Per mostrarti i ristoranti vicini, abilita la geolocalizzazione nelle impostazioni dell\'app.',
          [
            { text: 'Annulla', style: 'cancel' },
            { 
              text: 'Impostazioni', 
              onPress: () => {
                console.log('🔧 Apertura impostazioni...');
                if (Platform.OS === 'ios') {
                  Location.requestForegroundPermissionsAsync();
                }
              }
            }
          ]
        );
        return false;
      }
    } catch (error) {
      console.error('❌ Errore richiesta permessi:', error);
      setState(prev => ({ 
        ...prev, 
        hasPermission: false, 
        loading: false,
        error: 'Errore nel richiedere i permessi di geolocalizzazione'
      }));
      return false;
    }
  };

  const getCurrentLocation = async (): Promise<UserLocation | null> => {
    try {
      console.log('🎯 Avvio rilevamento posizione...');
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Verifica che i permessi siano stati concessi
      if (!state.hasPermission) {
        console.log('⚠️ Permessi non presenti, richiesta in corso...');
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
          console.log('❌ Permessi negati');
          return null;
        }
        console.log('✅ Permessi ottenuti');
      }

      console.log('📍 Richiesta posizione corrente...');
      // Ottieni posizione corrente
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 15000, // 15 secondi timeout
        maximumAge: 60000, // Accetta posizioni di massimo 1 minuto fa
      });

      console.log('📍 Posizione ottenuta:', location.coords);

      const userLocation: UserLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
      };

      setState(prev => ({ 
        ...prev, 
        location: userLocation, 
        loading: false,
        error: null
      }));

      console.log('✅ Posizione salvata nello stato');
      return userLocation;
    } catch (error) {
      console.error('❌ Errore nel rilevamento posizione:', error);
      
      let errorMessage = 'Impossibile ottenere la posizione attuale';
      if (error instanceof Error) {
        console.log('🔍 Dettagli errore:', error.message);
        if (error.message.includes('timeout')) {
          errorMessage = 'Timeout nel rilevamento della posizione';
        } else if (error.message.includes('denied')) {
          errorMessage = 'Accesso alla posizione negato';
        } else if (error.message.includes('unavailable')) {
          errorMessage = 'Servizi di localizzazione non disponibili';
        }
      }

      setState(prev => ({ 
        ...prev, 
        loading: false,
        error: errorMessage
      }));

      console.log('🔄 Usando posizione fallback (centro Sicilia)');
      // Fallback: usa posizione centrale Sicilia se non riusciamo a ottenere la posizione
      const fallbackLocation: UserLocation = {
        latitude: 37.5,
        longitude: 14.0,
      };

      return fallbackLocation;
    }
  };

  const watchLocation = async (callback: (location: UserLocation) => void) => {
    try {
      if (!state.hasPermission) {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
          return null;
        }
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 30000, // Aggiorna ogni 30 secondi
          distanceInterval: 100, // Aggiorna se si sposta di 100 metri
        },
        (location) => {
          const userLocation: UserLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || undefined,
          };
          
          setState(prev => ({ ...prev, location: userLocation }));
          callback(userLocation);
        }
      );

      return subscription;
    } catch (error) {
      console.error('Error watching location:', error);
      return null;
    }
  };

  // Calcola distanza tra due punti (formula haversine)
  const calculateDistance = (
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number => {
    const R = 6371; // Raggio della Terra in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distanza in km
    return Math.round(distance * 100) / 100; // Arrotonda a 2 decimali
  };

  // Auto-inizializza quando il hook viene montato
  useEffect(() => {
    requestLocationPermission();
  }, []);

  return {
    ...state,
    requestLocationPermission,
    getCurrentLocation,
    watchLocation,
    calculateDistance,
  };
};