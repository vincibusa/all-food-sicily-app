/**
 * MapView - Componente per visualizzare ristoranti su mappa
 * Utilizza React Leaflet per Expo/React Native Web con geolocalizzazione
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Platform, Text, TouchableOpacity, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../app/context/ThemeContext';
import { ListItem } from './ListCard';
import { useLocation, UserLocation } from '../hooks/useLocation';

interface MapViewProps {
  restaurants: ListItem[];
  onMarkerPress?: (restaurant: ListItem) => void;
  onLocationRequest?: () => void;
}

const { width, height } = Dimensions.get('window');

export const MapView: React.FC<MapViewProps> = ({ restaurants, onMarkerPress, onLocationRequest }) => {
  const { colors, colorScheme } = useTheme();
  const [mapHtml, setMapHtml] = useState('');
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

  useEffect(() => {
    // Genera HTML per la mappa con Leaflet
    const generateMapHtml = () => {
      const validRestaurants = restaurants.filter(r => 
        r.latitude && r.longitude && 
        !isNaN(Number(r.latitude)) && !isNaN(Number(r.longitude))
      );

      // Calcola distanze e ordina per vicinanza se abbiamo la posizione utente
      const restaurantsWithDistance = validRestaurants.map(restaurant => {
        const distance = userLocation 
          ? calculateDistance(
              userLocation.latitude, 
              userLocation.longitude, 
              Number(restaurant.latitude), 
              Number(restaurant.longitude)
            )
          : null;
        
        return {
          lat: Number(restaurant.latitude),
          lng: Number(restaurant.longitude),
          title: restaurant.title || restaurant.name,
          city: restaurant.city,
          category: restaurant.category?.name || 'Ristorante',
          id: restaurant.id,
          distance: distance
        };
      }).sort((a, b) => {
        // Ordina per distanza se disponibile
        if (a.distance !== null && b.distance !== null) {
          return a.distance - b.distance;
        }
        return 0;
      });

      // Determina centro mappa: posizione utente se disponibile, altrimenti centro ristoranti
      let centerLat, centerLng, initialZoom;
      
      if (userLocation) {
        centerLat = userLocation.latitude;
        centerLng = userLocation.longitude;
        initialZoom = 12; // Zoom più alto per area locale
      } else if (restaurantsWithDistance.length > 0) {
        centerLat = restaurantsWithDistance.reduce((sum, m) => sum + m.lat, 0) / restaurantsWithDistance.length;
        centerLng = restaurantsWithDistance.reduce((sum, m) => sum + m.lng, 0) / restaurantsWithDistance.length;
        initialZoom = 10;
      } else {
        centerLat = 37.5; // Centro Sicilia
        centerLng = 14.0;
        initialZoom = 8;
      }

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <title>Mappa Ristoranti</title>
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <style>
            body { margin: 0; padding: 0; }
            #map { height: 100vh; width: 100vw; }
            .custom-marker {
              background-color: ${colors.primary};
              width: 30px;
              height: 30px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 12px;
            }
            .leaflet-popup-content-wrapper {
              background: ${colorScheme === 'dark' ? '#1a1a1a' : '#ffffff'};
              color: ${colors.text};
              border-radius: 12px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            .leaflet-popup-tip {
              background: ${colorScheme === 'dark' ? '#1a1a1a' : '#ffffff'};
            }
            .popup-content {
              padding: 8px;
              text-align: center;
            }
            .popup-title {
              font-weight: bold;
              font-size: 14px;
              margin-bottom: 4px;
              color: ${colors.text};
            }
            .popup-city {
              font-size: 12px;
              color: ${colors.text}80;
              margin-bottom: 4px;
            }
            .popup-category {
              background: ${colors.primary}20;
              color: ${colors.primary};
              padding: 2px 8px;
              border-radius: 8px;
              font-size: 10px;
              font-weight: 600;
              display: inline-block;
            }
            .popup-distance {
              font-size: 11px;
              color: ${colors.text}60;
              margin-top: 4px;
            }
            .user-marker {
              background-color: #4285F4;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              animation: pulse 2s infinite;
            }
            @keyframes pulse {
              0% { box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.7); }
              70% { box-shadow: 0 0 0 10px rgba(66, 133, 244, 0); }
              100% { box-shadow: 0 0 0 0 rgba(66, 133, 244, 0); }
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <script>
            const map = L.map('map').setView([${centerLat}, ${centerLng}], ${initialZoom});
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            // Aggiungi marker utente se disponibile
            ${userLocation ? `
              const userIcon = L.divIcon({
                className: 'user-marker',
                html: '',
                iconSize: [20, 20],
                iconAnchor: [10, 10],
                popupAnchor: [0, -10]
              });
              
              L.marker([${userLocation.latitude}, ${userLocation.longitude}], { icon: userIcon })
                .addTo(map)
                .bindPopup('<div class="popup-content"><div class="popup-title">La tua posizione</div></div>');
            ` : ''}

            const restaurantMarkers = ${JSON.stringify(restaurantsWithDistance)};
            
            restaurantMarkers.forEach(marker => {
              const customIcon = L.divIcon({
                className: 'custom-marker',
                html: '🍽️',
                iconSize: [30, 30],
                iconAnchor: [15, 15],
                popupAnchor: [0, -15]
              });
              
              const distanceText = marker.distance !== null ? 
                \`<div class="popup-distance">\${marker.distance} km di distanza</div>\` : '';
              
              const leafletMarker = L.marker([marker.lat, marker.lng], { icon: customIcon })
                .addTo(map)
                .bindPopup(\`
                  <div class="popup-content">
                    <div class="popup-title">\${marker.title}</div>
                    <div class="popup-city">\${marker.city || ''}</div>
                    <div class="popup-category">\${marker.category}</div>
                    \${distanceText}
                  </div>
                \`)
                .on('click', function() {
                  window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'markerPress',
                    restaurantId: marker.id
                  }));
                });
            });

            // Fit map bounds se ci sono markers (includi posizione utente)
            if (restaurantMarkers.length > 0) {
              const allMarkers = [...restaurantMarkers.map(m => [m.lat, m.lng])];
              ${userLocation ? `allMarkers.push([${userLocation.latitude}, ${userLocation.longitude}]);` : ''}
              
              if (allMarkers.length > 1) {
                const group = L.latLngBounds(allMarkers);
                map.fitBounds(group, { padding: [30, 30] });
              }
            }
          </script>
        </body>
        </html>
      `;
    };

    setMapHtml(generateMapHtml());
  }, [restaurants, colors, colorScheme, userLocation]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'markerPress' && onMarkerPress) {
        const restaurant = restaurants.find(r => r.id === data.restaurantId);
        if (restaurant) {
          onMarkerPress(restaurant);
        }
      }
    } catch (error) {
      console.warn('Error parsing map message:', error);
    }
  };

  const handleLocationRequest = async () => {
    const location = await getCurrentLocation();
    if (location) {
      Alert.alert('Posizione aggiornata', 'La mappa è stata centrata sulla tua posizione attuale.');
    }
  };

  if (Platform.OS !== 'web') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header con controlli posizione */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <Text style={[styles.headerText, { color: colors.text }]}>
            {userLocation ? 'Ristoranti vicini a te' : 'Mappa ristoranti'}
          </Text>
          
          {!hasPermission && (
            <TouchableOpacity 
              style={[styles.locationButton, { backgroundColor: colors.primary }]}
              onPress={handleLocationRequest}
            >
              <MaterialIcons name="my-location" size={16} color="white" />
              <Text style={styles.locationButtonText}>Usa posizione</Text>
            </TouchableOpacity>
          )}
          
          {locationLoading && (
            <View style={styles.loadingIndicator}>
              <MaterialIcons name="location-searching" size={16} color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.text }]}>Rilevamento...</Text>
            </View>
          )}
        </View>

        <WebView
          source={{ html: mapHtml }}
          style={styles.webview}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          bounces={false}
          scrollEnabled={false}
        />
        
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
  }

  // Per web, usa un fallback semplice
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <WebView
        source={{ html: mapHtml }}
        style={styles.webview}
        onMessage={handleMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height - 200, // Lascia spazio per header e tabs
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  locationButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  loadingText: {
    fontSize: 12,
  },
  errorBanner: {
    position: 'absolute',
    bottom: 20,
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
  webview: {
    flex: 1,
  },
});

export default MapView;