import { supabase } from './supabase.config';

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
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        throw new Error(error.message || 'Failed to fetch categories');
      }

      return data || [];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Failed to fetch categories');
      }
      throw new Error('Network error');
    }
  }

  async getCategory(id: string): Promise<Category> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Category not found');
        }
        throw new Error(error.message || 'Failed to fetch category');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Failed to fetch category');
      }
      throw new Error('Network error');
    }
  }

  async getCategoryBySlug(slug: string): Promise<Category> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Category not found');
        }
        throw new Error(error.message || 'Failed to fetch category');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Failed to fetch category');
      }
      throw new Error('Network error');
    }
  }
}

export const categoryService = new CategoryService();