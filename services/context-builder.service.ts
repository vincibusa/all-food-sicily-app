import { supabase } from './supabase.config';

// Tipi per il contesto AI
export interface AIContext {
  query: string;
  restaurants: any[];
  hotels: any[];
  guides: any[];
  categories: any[];
  coupons: any[];
}

// Intent detection keywords
const RESTAURANT_KEYWORDS = ['ristorante', 'pizza', 'mangiare', 'cena', 'pranzo', 'cucina', 'locale', 'trattoria'];
const HOTEL_KEYWORDS = ['hotel', 'alloggio', 'dormire', 'soggiorno', 'b&b', 'bed'];
const GUIDE_KEYWORDS = ['guida', 'articolo', 'consiglio', 'dove', 'cosa', 'visitare'];
const LOCATION_KEYWORDS = ['palermo', 'catania', 'messina', 'siracusa', 'agrigento', 'trapani', 'ragusa', 'caltanissetta', 'enna'];

class ContextBuilderService {
  // Analizza l'intent della query utente
  private analyzeIntent(query: string): {
    includeRestaurants: boolean;
    includeHotels: boolean;
    includeGuides: boolean;
    location?: string;
    cuisine?: string;
  } {
    const queryLower = query.toLowerCase();
    
    return {
      includeRestaurants: RESTAURANT_KEYWORDS.some(keyword => queryLower.includes(keyword)),
      includeHotels: HOTEL_KEYWORDS.some(keyword => queryLower.includes(keyword)),
      includeGuides: GUIDE_KEYWORDS.some(keyword => queryLower.includes(keyword)),
      location: LOCATION_KEYWORDS.find(location => queryLower.includes(location)),
      cuisine: this.extractCuisineType(queryLower)
    };
  }

  // Estrae il tipo di cucina dalla query
  private extractCuisineType(query: string): string | undefined {
    const cuisineTypes = ['pizza', 'siciliana', 'italiana', 'pesce', 'carne', 'vegetariana', 'gelato', 'dolci'];
    return cuisineTypes.find(cuisine => query.includes(cuisine));
  }

  // Recupera ristoranti rilevanti
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

  // Recupera hotel rilevanti
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
  async buildContext(userQuery: string): Promise<AIContext> {
    const intent = this.analyzeIntent(userQuery);
    
    console.log('Intent detected:', intent);

    // Fetch dei dati in parallelo per ottimizzare performance
    const [restaurants, hotels, guides, categories, coupons] = await Promise.all([
      intent.includeRestaurants ? this.fetchRestaurants(intent.location, intent.cuisine) : [],
      intent.includeHotels ? this.fetchHotels(intent.location) : [],
      intent.includeGuides ? this.fetchGuides(intent.location) : [],
      this.fetchCategories(),
      this.fetchCoupons()
    ]);

    return {
      query: userQuery,
      restaurants,
      hotels,
      guides,
      categories,
      coupons
    };
  }
}

export const contextBuilder = new ContextBuilderService();