import { Article, Restaurant } from '../types';

// Dati per gli articoli in evidenza
export const FEATURED_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Storia della Cannolo Siciliano',
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'Tradizioni'
  },
  {
    id: '2',
    title: 'I migliori ristoranti di pesce in Sicilia',
    image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'Guide'
  },
  {
    id: '3',
    title: 'Olive Nocellara del Belice: un tesoro siciliano',
    image: 'https://images.unsplash.com/photo-1598042332909-df0e4eb1f6ea?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'Prodotti'
  }
];

// Dati per i ristoranti in evidenza
export const FEATURED_RESTAURANTS: Restaurant[] = [
  {
    id: '1',
    name: 'Trattoria Siciliana',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    location: 'Palermo',
    rating: 4.8
  },
  {
    id: '2',
    name: 'Osteria del Mare',
    image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    location: 'Catania',
    rating: 4.6
  },
  {
    id: '3',
    name: 'Villa Mediterranea',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    location: 'Taormina',
    rating: 4.9
  }
]; 