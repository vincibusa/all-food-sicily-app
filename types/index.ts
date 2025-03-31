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

// Tipi per renderItem in FlatList
export interface RenderItemInfo<T> {
  item: T;
  index: number;
} 