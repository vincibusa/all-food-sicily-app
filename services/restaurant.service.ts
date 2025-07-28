import { apiClient } from './api';
import { API_CONFIG } from './api.config';
import { ApiError } from './api';

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  province: string;
  phone: string;
  email: string;
  website?: string;
  price_range: number;
  cuisine_type: string;
  latitude: number;
  longitude: number;
  images: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  categories?: Category[];
  articles?: Article[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
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
      const params = {
        skip: filters?.skip || 0,
        limit: filters?.limit || 1000,
        ...(filters?.city && { city: filters.city }),
        ...(filters?.cuisine_type && { cuisine_type: filters.cuisine_type }),
        ...(filters?.price_range && { price_range: filters.price_range }),
      };

      const response = await apiClient.get<any>(
        API_CONFIG.ENDPOINTS.RESTAURANTS.LIST,
        params
      );
      
      // Adatta la risposta del backend al formato atteso dall'app
      const restaurants = Array.isArray(response) ? response : response.restaurants || [];
      return {
        items: restaurants,
        total: restaurants.length
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Failed to fetch restaurants');
      }
      throw new Error('Network error');
    }
  }

  async getRestaurant(id: string): Promise<Restaurant> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.RESTAURANTS.DETAIL.replace('{id}', id);
      const response = await apiClient.get<Restaurant>(endpoint);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.statusCode === 404) {
          throw new Error('Restaurant not found');
        }
        throw new Error(error.message || 'Failed to fetch restaurant');
      }
      throw new Error('Network error');
    }
  }

  async searchRestaurants(filters: SearchFilters): Promise<Restaurant[]> {
    try {
      const params = {
        q: filters.q,
        ...(filters.limit && { limit: filters.limit }),
      };

      const response = await apiClient.get<Restaurant[]>(
        API_CONFIG.ENDPOINTS.RESTAURANTS.SEARCH,
        params
      );
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Search failed');
      }
      throw new Error('Network error');
    }
  }










}

export const restaurantService = new RestaurantService();