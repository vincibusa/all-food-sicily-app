import { apiClient } from './api';
import { API_CONFIG } from './api.config';
import { ApiError } from './api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon?: string;
  restaurant_count?: number;
}

class CategoryService {
  async getCategories(): Promise<Category[]> {
    try {
      const response = await apiClient.get<Category[]>(
        API_CONFIG.ENDPOINTS.CATEGORIES.LIST
      );
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Failed to fetch categories');
      }
      throw new Error('Network error');
    }
  }

  async getCategory(id: string): Promise<Category> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.CATEGORIES.DETAIL.replace('{id}', id);
      const response = await apiClient.get<Category>(endpoint);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.statusCode === 404) {
          throw new Error('Category not found');
        }
        throw new Error(error.message || 'Failed to fetch category');
      }
      throw new Error('Network error');
    }
  }

  async getCategoryBySlug(slug: string): Promise<Category> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.CATEGORIES.DETAIL_BY_SLUG.replace('{slug}', slug);
      const response = await apiClient.get<Category>(endpoint);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.statusCode === 404) {
          throw new Error('Category not found');
        }
        throw new Error(error.message || 'Failed to fetch category');
      }
      throw new Error('Network error');
    }
  }
}

export const categoryService = new CategoryService();