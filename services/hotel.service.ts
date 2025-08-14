import { supabase } from './supabase.config';

export interface Hotel {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  province: string | null;
  postal_code?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  hotel_type: string[] | null;
  star_rating?: number | null;
  rating: number | null;
  review_count: number;
  price_range?: number | null;
  is_active: boolean;
  featured_image?: string | null;
  gallery?: string[] | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    color: string;
    icon?: string;
  } | null;
}

export interface HotelCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon?: string;
}

export interface PaginatedHotelResponse<T> {
  hotels: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface HotelFilters {
  city?: string;
  hotel_type?: string;
  star_rating?: number;
  price_range?: number;
  category_id?: string;
  page?: number;
  limit?: number;
}

export interface HotelSearchFilters {
  q: string;
  limit?: number;
  lat?: number;
  lng?: number;
  radius?: number;
}

class HotelService {
  async getHotels(filters?: HotelFilters): Promise<{ hotels: Hotel[]; total: number }> {
    try {
      let query = supabase
        .from('hotels')
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

      // Apply filters
      if (filters?.city) {
        query = query.eq('city', filters.city);
      }
      if (filters?.hotel_type) {
        query = query.contains('hotel_type', [filters.hotel_type]);
      }
      if (filters?.star_rating) {
        query = query.eq('star_rating', filters.star_rating);
      }
      if (filters?.price_range) {
        query = query.eq('price_range', filters.price_range);
      }
      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
      }

      // Apply pagination
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(error.message || 'Failed to fetch hotels');
      }

      return {
        hotels: data || [],
        total: count || data?.length || 0
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Failed to fetch hotels');
      }
      throw new Error('Network error');
    }
  }

  async getAllHotels(): Promise<Hotel[]> {
    try {
      const { data, error } = await supabase
        .from('hotels')
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
        .order('name', { ascending: true });

      if (error) {
        throw new Error(error.message || 'Failed to fetch all hotels');
      }

      return data || [];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Failed to fetch all hotels');
      }
      throw new Error('Network error');
    }
  }

  async getHotel(id: string): Promise<Hotel> {
    try {
      const { data, error } = await supabase
        .from('hotels')
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
          throw new Error('Hotel not found');
        }
        throw new Error(error.message || 'Failed to fetch hotel');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Failed to fetch hotel');
      }
      throw new Error('Network error');
    }
  }

  async searchHotels(filters: HotelSearchFilters): Promise<Hotel[]> {
    try {
      let query = supabase
        .from('hotels')
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

      // Search in name, description, city
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

  async getFeaturedHotels(limit: number = 3): Promise<Hotel[]> {
    try {
      const { data, error } = await supabase
        .from('hotels')
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
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(error.message || 'Failed to fetch featured hotels');
      }

      return data || [];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Failed to fetch featured hotels');
      }
      throw new Error('Network error');
    }
  }

  async getHotelsByCategory(categoryId: string, pagination?: { page: number; limit: number }): Promise<PaginatedHotelResponse<Hotel>> {
    try {
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('hotels')
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
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .range(from, to)
        .order('name', { ascending: true });

      if (error) {
        throw new Error(error.message || 'Failed to fetch hotels by category');
      }

      return {
        hotels: data || [],
        pagination: {
          page,
          limit,
          total: count || data?.length || 0,
          totalPages: Math.ceil((count || data?.length || 0) / limit)
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Failed to fetch hotels by category');
      }
      throw new Error('Network error');
    }
  }

  // Helper function to calculate distance between two points
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }
}

export const hotelService = new HotelService();