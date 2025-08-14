import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://mppoxdjfhmledygmfcgk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wcG94ZGpmaG1sZWR5Z21mY2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMjAyMzMsImV4cCI6MjA2ODY5NjIzM30.dyGuhehLpnZrD-XRF-qlu_xycQF6d4YD0AAb50Iw3no';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Disable auto refresh since we're not using authentication
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Database type definitions based on current schema
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          color: string;
          icon: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
      };
      restaurants: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          address: string;
          city: string;
          province: string | null;
          postal_code: string | null;
          phone: string | null;
          email: string | null;
          website: string | null;
          facebook_url: string | null;
          instagram_url: string | null;
          tiktok_url: string | null;
          twitter_url: string | null;
          cuisine_type: string[] | null;
          price_range: number | null;
          rating: number | null;
          review_count: number;
          is_active: boolean;
          featured_image: string | null;
          gallery: string[] | null;
          latitude: number | null;
          longitude: number | null;
          created_by: string | null;
          category_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['restaurants']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['restaurants']['Insert']>;
      };
      guides: {
        Row: {
          id: string;
          title: string;
          content: string;
          category_id: string | null;
          province: string | null;
          city: string | null;
          featured_image: string | null;
          gallery: string[] | null;
          tags: string[] | null;
          restaurant_ids: string[] | null;
          is_active: boolean;
          created_at: string;
          updated_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['guides']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['guides']['Insert']>;
      };
      hotels: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          address: string;
          city: string;
          province: string | null;
          postal_code: string | null;
          phone: string | null;
          email: string | null;
          website: string | null;
          hotel_type: string[] | null;
          star_rating: number | null;
          rating: number | null;
          review_count: number;
          price_range: number | null;
          is_active: boolean;
          featured_image: string | null;
          gallery: string[] | null;
          latitude: number | null;
          longitude: number | null;
          created_by: string | null;
          category_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['hotels']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['hotels']['Insert']>;
      };
      coupons: {
        Row: {
          id: string;
          restaurant_id: string;
          title: string;
          description: string | null;
          discount_type: string;
          discount_value: number;
          min_order_amount: number | null;
          max_discount_amount: number | null;
          usage_limit: number | null;
          usage_count: number;
          code: string;
          category: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['coupons']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['coupons']['Insert']>;
      };
      guide_sections: {
        Row: {
          id: string;
          guide_id: string;
          section_type: string;
          title: string;
          content: string | null;
          featured_image: string | null;
          gallery: string[] | null;
          metadata: any | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['guide_sections']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['guide_sections']['Insert']>;
      };
      guide_sponsors: {
        Row: {
          id: string;
          guide_id: string;
          name: string;
          logo_url: string | null;
          website_url: string | null;
          description: string | null;
          sponsor_type: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['guide_sponsors']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['guide_sponsors']['Insert']>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}