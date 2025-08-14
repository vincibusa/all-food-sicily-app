// Temporary compatibility layer - will be removed after migration
import { restaurantService } from './restaurant.service';
import { hotelService } from './hotel.service';
import { guideService } from './guide.service';
import { categoryService } from './category.service';
import { couponService } from './coupon.service';

console.log('[MIGRATION] Using temporary API compatibility layer');

export class ApiError extends Error {
  statusCode?: number;
  response?: any;

  constructor(message: string, statusCode?: number, response?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

// Simple compatibility layer
export const apiClient = {
  async get<T>(endpoint: string, params?: any): Promise<T> {
    console.log('[API Compat] GET:', endpoint, params);
    
    if (endpoint.startsWith('/restaurants')) {
      if (endpoint.includes('/search')) {
        return await restaurantService.searchRestaurants({ q: params?.q || '', limit: params?.limit }) as T;
      }
      if (endpoint.match(/\/restaurants\/[^\/]+$/)) {
        const id = endpoint.split('/').pop()!;
        return await restaurantService.getRestaurant(id) as T;
      }
      const result = await restaurantService.getRestaurants({ 
        skip: params?.page ? (params.page - 1) * (params?.limit || 20) : 0,
        limit: params?.limit || 1000,
        city: params?.city,
        cuisine_type: params?.cuisine_type,
        price_range: params?.price_range
      });
      return result.items as T;
    }
    
    if (endpoint.startsWith('/categories')) {
      if (endpoint.match(/\/categories\/[^\/]+$/)) {
        const id = endpoint.split('/').pop()!;
        return await categoryService.getCategory(id) as T;
      }
      return await categoryService.getCategories() as T;
    }
    
    if (endpoint.startsWith('/guides')) {
      if (endpoint.match(/\/guides\/[^\/]+$/)) {
        const id = endpoint.split('/').pop()!;
        return await guideService.getGuide(id) as T;
      }
      return await guideService.getGuides() as T;
    }
    
    if (endpoint.startsWith('/hotels')) {
      if (endpoint.includes('/featured')) {
        return await hotelService.getFeaturedHotels(params?.limit || 3) as T;
      }
      if (endpoint.includes('/search')) {
        return await hotelService.searchHotels({ q: params?.q || '', limit: params?.limit }) as T;
      }
      if (endpoint.includes('/category/')) {
        const categoryId = endpoint.split('/category/')[1];
        const result = await hotelService.getHotelsByCategory(categoryId, { 
          page: params?.page || 1, 
          limit: params?.limit || 20 
        });
        return result.hotels as T;
      }
      if (endpoint.match(/\/hotels\/[^\/]+$/)) {
        const id = endpoint.split('/').pop()!;
        return await hotelService.getHotel(id) as T;
      }
      const result = await hotelService.getHotels({
        page: params?.page || 1,
        limit: params?.limit || 20,
        city: params?.city,
        hotel_type: params?.hotel_type,
        star_rating: params?.star_rating,
        price_range: params?.price_range,
        category_id: params?.category_id
      });
      return result.hotels as T;
    }
    
    if (endpoint.startsWith('/coupons')) {
      if (endpoint.includes('/active')) {
        const result = await couponService.getActiveCoupons({
          category: params?.category,
          restaurantId: params?.restaurant_id,
          page: params?.page,
          limit: params?.limit
        });
        return result as T;
      }
      if (endpoint.includes('/restaurant/')) {
        const restaurantId = endpoint.split('/restaurant/')[1];
        return await couponService.getRestaurantCoupons(restaurantId) as T;
      }
      if (endpoint.includes('/code/')) {
        const code = endpoint.split('/code/')[1];
        return await couponService.getCouponByCode(code) as T;
      }
      if (endpoint.includes('/categories')) {
        return await couponService.getCouponCategories() as T;
      }
      if (endpoint.match(/\/coupons\/[^\/]+$/)) {
        const id = endpoint.split('/').pop()!;
        return await couponService.getCouponById(id) as T;
      }
    }
    
    throw new ApiError(`Endpoint not supported: ${endpoint}`);
  },
  
  async post<T>(endpoint: string, data?: any): Promise<T> {
    console.log('[API Compat] POST:', endpoint, data);
    
    if (endpoint.includes('/coupons/') && endpoint.includes('/use')) {
      const couponId = endpoint.split('/coupons/')[1].split('/use')[0];
      return await couponService.useCoupon(couponId) as T;
    }
    
    throw new ApiError(`POST endpoint not supported: ${endpoint}`);
  },
  
  async clearCache(): Promise<void> {
    console.log('[API Compat] Cache clear requested - no-op');
  },
  
  getCacheStats() {
    return { size: 0, hits: 0, misses: 0 };
  }
};