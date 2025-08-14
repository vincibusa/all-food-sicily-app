import { supabase } from './supabase.config';

export interface Guide {
  id: string;
  title: string;
  content: string;
  category_id?: string | null;
  province?: string | null;
  city?: string | null;
  featured_image?: string | null;
  gallery?: string[] | null;
  tags?: string[] | null;
  restaurant_ids?: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
  sections?: GuideSection[];
  sponsors?: GuideSponsor[];
}

export interface GuideSection {
  id: string;
  guide_id: string;
  section_type: string;
  title: string;
  content?: string | null;
  featured_image?: string | null;
  gallery?: string[] | null;
  metadata?: any | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface GuideSponsor {
  id: string;
  guide_id: string;
  name: string;
  logo_url?: string | null;
  website_url?: string | null;
  description?: string | null;
  sponsor_type?: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface GuideAward {
  id: string;
  guide_id: string;
  award_type: string;
  title: string;
  description: string;
  year: number;
  is_winner: boolean;
  restaurant_id?: string | null;
  created_at: string;
  restaurant?: {
    id: string;
    name: string;
    featured_image?: string | null;
    city: string;
    province: string;
    category?: {
      name: string;
      color: string;
    };
  };
}

class GuideService {
  async getGuides(): Promise<Guide[]> {
    try {
      const { data, error } = await supabase
        .from('guides')
        .select(`
          *,
          category:categories(
            id,
            name,
            slug,
            color,
            icon
          ),
          sections:guide_sections(
            id,
            section_type,
            title,
            content,
            featured_image,
            gallery,
            metadata,
            is_active,
            sort_order,
            created_at,
            updated_at
          ),
          sponsors:guide_sponsors(
            id,
            name,
            logo_url,
            website_url,
            description,
            sponsor_type,
            sort_order,
            is_active,
            created_at
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message || 'Failed to fetch guides');
      }

      return data || [];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Failed to fetch guides');
      }
      throw new Error('Network error');
    }
  }

  async getGuide(id: string): Promise<Guide> {
    try {
      const { data, error } = await supabase
        .from('guides')
        .select(`
          *,
          category:categories(
            id,
            name,
            slug,
            color,
            icon
          ),
          sections:guide_sections(
            id,
            section_type,
            title,
            content,
            featured_image,
            gallery,
            metadata,
            is_active,
            sort_order,
            created_at,
            updated_at
          ),
          sponsors:guide_sponsors(
            id,
            name,
            logo_url,
            website_url,
            description,
            sponsor_type,
            sort_order,
            is_active,
            created_at
          )
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Guide not found');
        }
        throw new Error(error.message || 'Failed to fetch guide');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Failed to fetch guide');
      }
      throw new Error('Network error');
    }
  }

  async getGuidesByCategory(categoryId: string): Promise<Guide[]> {
    try {
      const { data, error } = await supabase
        .from('guides')
        .select(`
          *,
          category:categories(
            id,
            name,
            slug,
            color,
            icon
          ),
          sections:guide_sections(
            id,
            section_type,
            title,
            content,
            featured_image,
            gallery,
            metadata,
            is_active,
            sort_order,
            created_at,
            updated_at
          ),
          sponsors:guide_sponsors(
            id,
            name,
            logo_url,
            website_url,
            description,
            sponsor_type,
            sort_order,
            is_active,
            created_at
          )
        `)
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message || 'Failed to fetch guides by category');
      }

      return data || [];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Failed to fetch guides by category');
      }
      throw new Error('Network error');
    }
  }

  async getGuideSponsors(guideId: string): Promise<GuideSponsor[]> {
    try {
      const { data, error } = await supabase
        .from('guide_sponsors')
        .select('*')
        .eq('guide_id', guideId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        throw new Error(error.message || 'Failed to fetch guide sponsors');
      }

      return data || [];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Failed to fetch guide sponsors');
      }
      throw new Error('Network error');
    }
  }

  async getGuideAwards(guideId: string): Promise<GuideAward[]> {
    try {
      const { data, error } = await supabase
        .from('guide_awards')
        .select(`
          *,
          restaurant:restaurants(
            id,
            name,
            featured_image,
            city,
            province,
            category:categories(
              name,
              color
            )
          )
        `)
        .eq('guide_id', guideId)
        .order('year', { ascending: false });

      if (error) {
        throw new Error(error.message || 'Failed to fetch guide awards');
      }

      return data || [];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Failed to fetch guide awards');
      }
      throw new Error('Network error');
    }
  }

  async getGuideSection(guideId: string, sectionId: string): Promise<GuideSection | null> {
    try {
      const { data, error } = await supabase
        .from('guide_sections')
        .select('*')
        .eq('guide_id', guideId)
        .eq('section_type', sectionId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(error.message || 'Failed to fetch guide section');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Failed to fetch guide section');
      }
      throw new Error('Network error');
    }
  }
}

export const guideService = new GuideService();