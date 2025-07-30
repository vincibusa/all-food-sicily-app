// Tipi per gli articoli
export interface Article {
  id: string;
  title: string;
  image: string;
  category: string;
  author?: string;
  date?: string;
  excerpt?: string;
}

// Tipi per i ristoranti
export interface Restaurant {
  id: string;
  name: string;
  image: string;
  location: string;
  rating: number;
  cuisine?: string;
  priceRange?: string;
  description?: string;
}

// Tipi per gli hotel
export interface Hotel {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  province?: string;
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

// Tipi per renderItem in FlatList
export interface RenderItemInfo<T> {
  item: T;
  index: number;
} 