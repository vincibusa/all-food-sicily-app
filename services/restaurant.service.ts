import { supabase } from './supabase.config';

export interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  province: string | null;
  phone: string | null;
  email: string | null;
  website?: string | null;
  price_range: number | null;
  cuisine_type: string[] | null;
  latitude: number | null;
  longitude: number | null;
  featured_image: string | null;
  gallery: string[] | null;
  rating: number | null;
  review_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon?: string;
}


export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface RestaurantFilters {
  city?: string;
  cuisine_type?: string;
  price_range?: number;
  skip?: number;
  limit?: number;
}

export interface SearchFilters {
  q: string;
  limit?: number;
}

class RestaurantService {
  async getRestaurants(filters?: RestaurantFilters): Promise<{ items: Restaurant[]; total: number }> {
    try {
      console.log('[RestaurantService] getRestaurants called with filters:', filters);
      let query = supabase
        .from('restaurants')
        .select(`
          *,
          category:categories(
            id,
            name,
            slug,
            color,
            icon
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      console.log('[RestaurantService] Query built, executing...');

      // Apply filters
      if (filters?.city) {
        query = query.eq('city', filters.city);
      }
      if (filters?.cuisine_type) {
        query = query.contains('cuisine_type', [filters.cuisine_type]);
      }
      if (filters?.price_range) {
        query = query.eq('price_range', filters.price_range);
      }

      // Apply pagination
      const skip = filters?.skip || 0;
      const limit = filters?.limit || 1000;
      query = query.range(skip, skip + limit - 1);

      const { data, error, count } = await query;
      
      console.log('[RestaurantService] Query executed. Error:', error);
      console.log('[RestaurantService] Data length:', data?.length);
      console.log('[RestaurantService] Count:', count);

      if (error) {
        console.error('[RestaurantService] Supabase error:', error);
        throw new Error(error.message || 'Failed to fetch restaurants');
      }

      const result = {
        items: data || [],
        total: count || data?.length || 0
      };
      
      console.log('[RestaurantService] Returning result:', result);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Failed to fetch restaurants');
      }
      throw new Error('Network error');
    }
  }

  async getRestaurant(id: string): Promise<Restaurant> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select(`
          *,
          category:categories(
            id,
            name,
            slug,
            color,
            icon
          )
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Restaurant not found');
        }
        throw new Error(error.message || 'Failed to fetch restaurant');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Failed to fetch restaurant');
      }
      throw new Error('Network error');
    }
  }

  async searchRestaurants(filters: SearchFilters): Promise<Restaurant[]> {
    try {
      let query = supabase
        .from('restaurants')
        .select(`
          *,
          category:categories(
            id,
            name,
            slug,
            color,
            icon
          )
        `)
        .eq('is_active', true);

      // Search in name, description, city, or cuisine_type
      if (filters.q) {
        query = query.or(`name.ilike.%${filters.q}%,description.ilike.%${filters.q}%,city.ilike.%${filters.q}%`);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      query = query.order('name', { ascending: true });

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message || 'Search failed');
      }

      return data || [];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Search failed');
      }
      throw new Error('Network error');
    }
  }










}

export const restaurantService = new RestaurantService();