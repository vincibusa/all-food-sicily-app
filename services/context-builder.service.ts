import { supabase } from './supabase.config';

// Interfaccia per posizione utente
export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

// Tipi per il contesto AI
export interface AIContext {
  query: string;
  restaurants: any[];
  hotels: any[];
  guides: any[];
  categories: any[];
  coupons: any[];
  userLocation?: UserLocation;
  nearbyInfo?: {
    hasLocation: boolean;
    searchRadius?: number;
    locationDescription?: string;
  };
}

// Intent detection keywords
const RESTAURANT_KEYWORDS = ['ristorante', 'pizza', 'mangiare', 'cena', 'pranzo', 'cucina', 'locale', 'trattoria'];
const HOTEL_KEYWORDS = ['hotel', 'alloggio', 'dormire', 'soggiorno', 'b&b', 'bed'];
const GUIDE_KEYWORDS = ['guida', 'articolo', 'consiglio', 'dove', 'cosa', 'visitare'];
const LOCATION_KEYWORDS = ['palermo', 'catania', 'messina', 'siracusa', 'agrigento', 'trapani', 'ragusa', 'caltanissetta', 'enna'];
const PROXIMITY_KEYWORDS = ['vicini', 'vicino', 'nelle vicinanze', 'qui intorno', 'zona', 'dintorni', 'vicinanze', 'intorno', 'qua', 'da me'];

class ContextBuilderService {
  // Calcola distanza tra due punti (formula haversine)
  private calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
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
  }
  // Analizza l'intent della query utente
  private analyzeIntent(query: string): {
    includeRestaurants: boolean;
    includeHotels: boolean;
    includeGuides: boolean;
    location?: string;
    cuisine?: string;
    isProximityQuery: boolean;
    searchRadius: number;
  } {
    const queryLower = query.toLowerCase();
    
    // Rilevamento query di prossimità
    const isProximityQuery = PROXIMITY_KEYWORDS.some(keyword => queryLower.includes(keyword));
    
    // Se non specifica ristoranti/hotel ma chiede "nelle vicinanze", includiamo entrambi
    const includeRestaurants = RESTAURANT_KEYWORDS.some(keyword => queryLower.includes(keyword)) || 
                              (isProximityQuery && !HOTEL_KEYWORDS.some(keyword => queryLower.includes(keyword)));
    const includeHotels = HOTEL_KEYWORDS.some(keyword => queryLower.includes(keyword));
    
    return {
      includeRestaurants,
      includeHotels,
      includeGuides: GUIDE_KEYWORDS.some(keyword => queryLower.includes(keyword)),
      location: LOCATION_KEYWORDS.find(location => queryLower.includes(location)),
      cuisine: this.extractCuisineType(queryLower),
      isProximityQuery,
      searchRadius: isProximityQuery ? 10 : 50 // 10km per vicinanze, 50km per ricerche generiche
    };
  }

  // Estrae il tipo di cucina dalla query
  private extractCuisineType(query: string): string | undefined {
    const cuisineTypes = ['pizza', 'siciliana', 'italiana', 'pesce', 'carne', 'vegetariana', 'gelato', 'dolci'];
    return cuisineTypes.find(cuisine => query.includes(cuisine));
  }

  // Recupera ristoranti nelle vicinanze basati su coordinate GPS
  private async fetchNearbyRestaurants(userLocation: UserLocation, radius: number, cuisine?: string, limit = 10) {
    try {
      // Recupera tutti i ristoranti attivi con coordinate
      const { data, error } = await supabase
        .from('restaurants')
        .select(`
          id, name, description, address, city, province, 
          cuisine_type, price_range, rating, phone, website,
          featured_image, latitude, longitude
        `)
        .eq('is_active', true)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) {
        console.error('Error fetching nearby restaurants:', error);
        return [];
      }

      if (!data) return [];

      // Calcola distanze e filtra per raggio
      const restaurantsWithDistance = data
        .map(restaurant => ({
          ...restaurant,
          distance: this.calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            restaurant.latitude,
            restaurant.longitude
          )
        }))
        .filter(restaurant => restaurant.distance <= radius);

      // Filtra per tipo cucina se specificato
      let filteredRestaurants = restaurantsWithDistance;
      if (cuisine) {
        filteredRestaurants = restaurantsWithDistance.filter(restaurant => 
          restaurant.cuisine_type?.includes(cuisine)
        );
      }

      // Ordina per distanza e prendi solo i primi N
      return filteredRestaurants
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);

    } catch (error) {
      console.error('Error in fetchNearbyRestaurants:', error);
      return [];
    }
  }

  // Recupera ristoranti rilevanti (metodo originale per ricerche non basate su posizione)
  private async fetchRestaurants(location?: string, cuisine?: string, limit = 10) {
    try {
      let query = supabase
        .from('restaurants')
        .select(`
          id, name, description, address, city, province, 
          cuisine_type, price_range, rating, phone, website,
          featured_image, latitude, longitude
        `)
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(limit);

      if (location) {
        query = query.ilike('city', `%${location}%`);
      }

      if (cuisine) {
        query = query.contains('cuisine_type', [cuisine]);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching restaurants:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in fetchRestaurants:', error);
      return [];
    }
  }

  // Recupera hotel nelle vicinanze basati su coordinate GPS
  private async fetchNearbyHotels(userLocation: UserLocation, radius: number, limit = 8) {
    try {
      // Recupera tutti gli hotel attivi con coordinate
      const { data, error } = await supabase
        .from('hotels')
        .select(`
          id, name, description, address, city, province,
          hotel_type, star_rating, rating, price_range,
          featured_image, latitude, longitude
        `)
        .eq('is_active', true)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) {
        console.error('Error fetching nearby hotels:', error);
        return [];
      }

      if (!data) return [];

      // Calcola distanze e filtra per raggio
      const hotelsWithDistance = data
        .map(hotel => ({
          ...hotel,
          distance: this.calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            hotel.latitude,
            hotel.longitude
          )
        }))
        .filter(hotel => hotel.distance <= radius);

      // Ordina per distanza e prendi solo i primi N
      return hotelsWithDistance
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);

    } catch (error) {
      console.error('Error in fetchNearbyHotels:', error);
      return [];
    }
  }

  // Recupera hotel rilevanti (metodo originale per ricerche non basate su posizione)
  private async fetchHotels(location?: string, limit = 8) {
    try {
      let query = supabase
        .from('hotels')
        .select(`
          id, name, description, address, city, province,
          hotel_type, star_rating, rating, price_range,
          featured_image, latitude, longitude
        `)
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(limit);

      if (location) {
        query = query.ilike('city', `%${location}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching hotels:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in fetchHotels:', error);
      return [];
    }
  }

  // Recupera guide rilevanti
  private async fetchGuides(location?: string, limit = 5) {
    try {
      let query = supabase
        .from('guides')
        .select(`
          id, title, content, city, province,
          featured_image, tags
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (location) {
        query = query.or(`city.ilike.%${location}%,province.ilike.%${location}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching guides:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in fetchGuides:', error);
      return [];
    }
  }

  // Recupera categorie
  private async fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, description, color')
        .eq('is_active', true)
        .order('sort_order');

      if (error) {
        console.error('Error fetching categories:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in fetchCategories:', error);
      return [];
    }
  }

  // Recupera coupon attivi
  private async fetchCoupons(limit = 5) {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select(`
          id, title, description, discount_type, discount_value,
          code, category,
          restaurant:restaurants(id, name, city)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching coupons:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in fetchCoupons:', error);
      return [];
    }
  }

  // Costruisce il contesto completo per l'AI
  async buildContext(userQuery: string, userLocation?: UserLocation): Promise<AIContext> {
    const intent = this.analyzeIntent(userQuery);
    
    console.log('Intent detected:', intent, 'User location:', userLocation ? 'Available' : 'Not available');

    // Determina se usare ricerca geografica o normale
    const useLocationSearch = intent.isProximityQuery && userLocation;

    // Fetch dei dati in parallelo per ottimizzare performance
    const [restaurants, hotels, guides, categories, coupons] = await Promise.all([
      intent.includeRestaurants ? 
        (useLocationSearch ? 
          this.fetchNearbyRestaurants(userLocation!, intent.searchRadius, intent.cuisine) :
          this.fetchRestaurants(intent.location, intent.cuisine)
        ) : [],
      intent.includeHotels ? 
        (useLocationSearch ? 
          this.fetchNearbyHotels(userLocation!, intent.searchRadius) :
          this.fetchHotels(intent.location)
        ) : [],
      intent.includeGuides ? this.fetchGuides(intent.location) : [],
      this.fetchCategories(),
      this.fetchCoupons()
    ]);

    // Informazioni aggiuntive per l'AI sulla ricerca geografica
    const nearbyInfo = useLocationSearch ? {
      hasLocation: true,
      searchRadius: intent.searchRadius,
      locationDescription: `Ricerca in un raggio di ${intent.searchRadius}km dalla posizione attuale`
    } : {
      hasLocation: !!userLocation,
      searchRadius: undefined,
      locationDescription: userLocation ? 'Posizione disponibile ma ricerca generica' : 'Posizione non disponibile'
    };

    return {
      query: userQuery,
      restaurants,
      hotels,
      guides,
      categories,
      coupons,
      userLocation,
      nearbyInfo
    };
  }
}

export const contextBuilder = new ContextBuilderService();