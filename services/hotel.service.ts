import { apiClient } from './api';
import { API_CONFIG } from './api.config';
import { ApiError } from './api';

export interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  province: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  hotel_type: string[];
  star_rating?: number;
  rating: string | number;
  review_count: number;
  price_range?: number;
  is_active: boolean;
  featured_image?: string;
  gallery?: string[];
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    color: string;
    icon?: string;
  };
  created_by_user?: {
    id: string;
    full_name: string;
    email: string;
  };
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
      const params = {
        page: filters?.page || 1,
        limit: filters?.limit || 20,
        ...(filters?.city && { city: filters.city }),
        ...(filters?.hotel_type && { hotel_type: filters.hotel_type }),
        ...(filters?.star_rating && { star_rating: filters.star_rating }),
        ...(filters?.price_range && { price_range: filters.price_range }),
        ...(filters?.category_id && { category_id: filters.category_id }),
      };

      const response = await apiClient.get<any>('/hotels/', params);
      
      // Adatta la risposta del backend al formato atteso dall'app
      const hotels = Array.isArray(response) ? response : response.data || response.hotels || [];
      const pagination = response.pagination || { total: hotels.length };

      return {
        hotels,
        total: pagination.total || hotels.length
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Failed to fetch hotels');
      }
      throw new Error('Network error');
    }
  }

  async getAllHotels(): Promise<Hotel[]> {
    try {
      // Load all hotels with pagination
      let allHotels = [];
      let currentPage = 1;
      let hasMore = true;
      
      while (hasMore) {
        const response = await this.getHotels({ page: currentPage, limit: 100 });
        
        if (response.hotels.length === 0) {
          hasMore = false;
        } else {
          allHotels.push(...response.hotels);
          currentPage++;
          
          // Check if there are more pages
          if (response.hotels.length < 100) {
            hasMore = false;
          }
        }
        
        // Safety break to avoid infinite loops
        if (currentPage > 50) {
          hasMore = false;
        }
      }
      
      return allHotels;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Failed to fetch all hotels');
      }
      throw new Error('Network error');
    }
  }

  async getHotel(id: string): Promise<Hotel> {
    try {
      const response = await apiClient.get<any>(`/hotels/${id}`);
      return response.data || response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.statusCode === 404) {
          throw new Error('Hotel not found');
        }
        throw new Error(error.message || 'Failed to fetch hotel');
      }
      throw new Error('Network error');
    }
  }

  async searchHotels(filters: HotelSearchFilters): Promise<Hotel[]> {
    try {
      const params = {
        q: filters.q,
        ...(filters.limit && { limit: filters.limit }),
        ...(filters.lat && { lat: filters.lat }),
        ...(filters.lng && { lng: filters.lng }),
        ...(filters.radius && { radius: filters.radius }),
      };

      const response = await apiClient.get<any>('/hotels/search/hotels', params);
      const hotels = Array.isArray(response) ? response : response.data || response.hotels || [];
      return hotels;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Search failed');
      }
      throw new Error('Network error');
    }
  }

  async getFeaturedHotels(limit: number = 3): Promise<Hotel[]> {
    try {
      const response = await apiClient.get<any>('/hotels/featured/top', { limit });
      const hotels = Array.isArray(response) ? response : response.data || response.hotels || [];
      return hotels;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Failed to fetch featured hotels');
      }
      throw new Error('Network error');
    }
  }

  async getHotelsByCategory(categoryId: string, pagination?: { page: number; limit: number }): Promise<PaginatedHotelResponse<Hotel>> {
    try {
      const params = {
        page: pagination?.page || 1,
        limit: pagination?.limit || 20,
      };

      const response = await apiClient.get<any>(`/hotels/category/${categoryId}`, params);
      
      return {
        hotels: response.data || response.hotels || [],
        pagination: response.pagination || { 
          page: params.page, 
          limit: params.limit, 
          total: (response.data || response.hotels || []).length,
          totalPages: 1
        }
      };
    } catch (error) {
      if (error instanceof ApiError) {
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