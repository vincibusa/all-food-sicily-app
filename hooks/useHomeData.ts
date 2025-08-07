import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { useTheme } from '../app/context/ThemeContext';

interface Guide {
  id: string;
  title: string;
  featured_image: string;
  category: {
    name: string;
    color?: string;
  };
  city: string;
  province: string;
}

interface Restaurant {
  id: string;
  name: string;
  featured_image: string;
  city: string;
  province: string;
  rating: string | number;
  price_range: number;
  category_name: string;
  category_id?: string;
  category_color?: string;
  latitude?: number;
  longitude?: number;
}

interface Hotel {
  id: string;
  name: string;
  featured_image: string;
  city: string;
  province: string;
  rating: string | number;
  star_rating?: number;
  price_range: number;
  hotel_type: string[];
  category_name: string;
  category_id?: string;
  category_color?: string;
  latitude?: number;
  longitude?: number;
}

interface UseHomeDataReturn {
  guides: Guide[];
  allRestaurants: Restaurant[];
  allHotels: Hotel[];
  loading: boolean;
  error: string | null;
  loadData: (forceRefresh?: boolean) => Promise<void>;
  totalImages: number;
  loadedImages: Set<string>;
  setLoadedImages: (images: Set<string>) => void;
  handleImageLoaded: (uri: string) => void;
  handleImageError: (uri: string) => void;
  allImagesLoaded: boolean;
}

export const useHomeData = (): UseHomeDataReturn => {
  const { colors } = useTheme();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [allHotels, setAllHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [totalImages, setTotalImages] = useState(0);

  const handleImageLoaded = (uri: string) => {
    setLoadedImages(prev => new Set([...prev, uri]));
  };
  
  const handleImageError = (uri: string) => {
    handleImageLoaded(`error-${uri}`);
  };
  
  const allImagesLoaded = loadedImages.size >= totalImages && totalImages > 0;

  const loadData = async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Clear cache if force refresh is requested
      if (forceRefresh) {
        await Promise.all([
          apiClient.clearCache('guides'),
          apiClient.clearCache('restaurants'),
        ]);
      }
      
      // Load guides and categories first
      const [guidesResponse, categoriesResponse] = await Promise.all([
        apiClient.get<any>('/guides/', {}, { forceRefresh }),
        apiClient.get<any>('/categories/', {}, { forceRefresh: false })
      ]);
      
      // Load all restaurants with pagination
      let allRestaurantsData = [];
      try {
        let currentPage = 1;
        let hasMore = true;
        
        while (hasMore) {
          const restaurantsUrl = `/restaurants/?page=${currentPage}&limit=100`;
          const restaurantsResponse = await apiClient.get<any>(restaurantsUrl, {}, { forceRefresh });
          const pageData = Array.isArray(restaurantsResponse) ? restaurantsResponse : (restaurantsResponse?.restaurants || restaurantsResponse?.items || []);
          
          if (pageData.length === 0) {
            hasMore = false;
          } else {
            allRestaurantsData.push(...pageData);
            currentPage++;
            
            if (restaurantsResponse?.has_more === false || pageData.length < 100) {
              hasMore = false;
            }
          }
          
          if (currentPage > 50) {
            hasMore = false;
          }
        }
      } catch (error) {
        const restaurantsResponse = await apiClient.get<any>('/restaurants/?limit=100', {}, { forceRefresh });
        allRestaurantsData = Array.isArray(restaurantsResponse) ? restaurantsResponse : (restaurantsResponse?.restaurants || restaurantsResponse?.items || []);
      }

      // Load all hotels with pagination
      let allHotelsData = [];
      try {
        let currentPage = 1;
        let hasMore = true;
        
        while (hasMore) {
          const hotelsUrl = `/hotels/?page=${currentPage}&limit=100`;
          const hotelsResponse = await apiClient.get<any>(hotelsUrl, {}, { forceRefresh });
          const pageData = Array.isArray(hotelsResponse) ? hotelsResponse : (hotelsResponse?.data || hotelsResponse?.hotels || hotelsResponse?.items || []);
          
          if (pageData.length === 0) {
            hasMore = false;
          } else {
            allHotelsData.push(...pageData);
            currentPage++;
            
            if (hotelsResponse?.has_more === false || pageData.length < 100) {
              hasMore = false;
            }
          }
          
          if (currentPage > 50) {
            hasMore = false;
          }
        }
      } catch (error) {
        const hotelsResponse = await apiClient.get<any>('/hotels/?limit=100', {}, { forceRefresh });
        allHotelsData = Array.isArray(hotelsResponse) ? hotelsResponse : (hotelsResponse?.data || hotelsResponse?.hotels || hotelsResponse?.items || []);
      }
      
      // Handle different response structures
      const guidesData = Array.isArray(guidesResponse) ? guidesResponse : (guidesResponse?.guides || guidesResponse?.items || []);
      const restaurantsData = allRestaurantsData;
      const hotelsData = allHotelsData;
      
      // Transform data with colors
      const guidesDataTransformed = guidesData.slice(0, 3).map((g: any) => ({
        ...g,
        category: {
          ...g.category,
          name: g.category?.name || g.category_name,
          color: colors.primary
        }
      }));
      
      const allRestaurantsTransformed = restaurantsData.map((r: any) => ({
        ...r,
        category_name: r.category?.name || r.category_name,
        category_id: r.category?.id || r.category_id,
        category_color: r.category?.color || colors.primary,
        latitude: r.latitude,
        longitude: r.longitude
      }));
      
      const allHotelsTransformed = hotelsData.map((h: any) => ({
        ...h,
        category_name: h.category?.name || h.category_name,
        category_id: h.category?.id || h.category_id,
        category_color: h.category?.color || colors.primary,
        latitude: h.latitude,
        longitude: h.longitude
      }));
      
      setGuides(guidesDataTransformed);
      setAllRestaurants(allRestaurantsTransformed);
      setAllHotels(allHotelsTransformed);
      
      // Count total images to load
      const validGuideImages = guidesDataTransformed.filter((g: Guide) => g.featured_image).length;
      const validRestaurantImages = allRestaurantsTransformed.slice(0, 3).filter((r: Restaurant) => r.featured_image).length;
      const validHotelImages = allHotelsTransformed.slice(0, 3).filter((h: Hotel) => h.featured_image).length;
      const totalImgs = validGuideImages + validRestaurantImages + validHotelImages;
      setTotalImages(totalImgs);
      setLoadedImages(new Set()); // Reset loaded images
      
    } catch (error) {
      setError('Impossibile caricare i dati. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  return {
    guides,
    allRestaurants,
    allHotels,
    loading,
    error,
    loadData,
    totalImages,
    loadedImages,
    setLoadedImages,
    handleImageLoaded,
    handleImageError,
    allImagesLoaded,
  };
};