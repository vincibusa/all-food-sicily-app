import { apiClient } from './api';
import { API_CONFIG } from './api.config';
import { ApiError } from './api';

export interface Guide {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  featured_image?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  author?: string;
}

class GuideService {
  async getGuides(): Promise<Guide[]> {
    try {
      const response = await apiClient.get<any>(
        API_CONFIG.ENDPOINTS.GUIDES.LIST,
        { skip: 0, limit: 50 }
      );
      
      // Adatta la risposta del backend al formato atteso dall'app
      const guides = Array.isArray(response) ? response : response.guides || [];
      return guides;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Failed to fetch guides');
      }
      throw new Error('Network error');
    }
  }

  async getGuide(id: string): Promise<Guide> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.GUIDES.DETAIL.replace('{id}', id);
      const response = await apiClient.get<Guide>(endpoint);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.statusCode === 404) {
          throw new Error('Guide not found');
        }
        throw new Error(error.message || 'Failed to fetch guide');
      }
      throw new Error('Network error');
    }
  }
}

export const guideService = new GuideService();