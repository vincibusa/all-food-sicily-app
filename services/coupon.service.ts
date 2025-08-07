import { apiClient } from './api';
import { API_CONFIG } from './api.config';
import { Coupon } from '../types';

export class CouponService {
  /**
   * Ottiene tutti i coupon attivi con filtri opzionali
   */
  static async getActiveCoupons(filters?: {
    category?: string;
    restaurantId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ coupons: Coupon[]; pagination: any }> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.category) params.append('category', filters.category);
      if (filters?.restaurantId) params.append('restaurant_id', filters.restaurantId);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const queryString = params.toString();
      const url = `${API_CONFIG.ENDPOINTS.COUPONS.ACTIVE}${queryString ? `?${queryString}` : ''}`;
      
      return await apiClient.get(url);
    } catch (error) {
      console.error('Error fetching active coupons:', error);
      throw new Error('Errore nel caricamento dei coupon');
    }
  }

  /**
   * Ottiene coupon per tipo specifico (filtri UI)
   */
  static async getCouponsByType(couponType: string): Promise<{ coupons: Coupon[]; pagination: any }> {
    try {
      let filters = {};

      switch (couponType) {
        case 'up-to-50':
          // Ottieni tutti i coupon e filtra client-side per discount <= 50%
          const result = await this.getActiveCoupons();
          const filteredCoupons = result.coupons.filter(coupon => 
            coupon.discount_type === 'percentage' && 
            Number(coupon.discount_value) <= 50
          );
          return { coupons: filteredCoupons, pagination: result.pagination };
        
        case '2-for-1':
          // Cerca coupon con categoria specifica o titolo che contiene "2"
          filters = { category: '2-for-1' };
          break;
        
        case 'special':
          filters = { category: 'special' };
          break;
        
        case 'promo':
          filters = { category: 'promo' };
          break;
        
        case 'free':
          filters = { category: 'free' };
          break;
        
        default:
          // Fallback per tutti i coupon attivi
          return await this.getActiveCoupons();
      }

      return await this.getActiveCoupons(filters);
    } catch (error) {
      console.error('Error fetching coupons by type:', error);
      throw new Error('Errore nel caricamento dei coupon per tipo');
    }
  }

  /**
   * Ottiene i coupon per un ristorante specifico
   */
  static async getRestaurantCoupons(restaurantId: string): Promise<Coupon[]> {
    try {
      const url = `${API_CONFIG.ENDPOINTS.COUPONS.RESTAURANT.replace('{restaurantId}', restaurantId)}`;
      return await apiClient.get<Coupon[]>(url);
    } catch (error) {
      console.error('Error fetching restaurant coupons:', error);
      throw new Error('Errore nel caricamento dei coupon del ristorante');
    }
  }

  /**
   * Ottiene un coupon per ID
   */
  static async getCouponById(id: string): Promise<Coupon> {
    try {
      const url = `${API_CONFIG.ENDPOINTS.COUPONS.DETAIL.replace('{id}', id)}`;
      return await apiClient.get<Coupon>(url);
    } catch (error) {
      console.error('Error fetching coupon by ID:', error);
      throw new Error('Errore nel caricamento del coupon');
    }
  }

  /**
   * Ottiene un coupon per codice
   */
  static async getCouponByCode(code: string): Promise<Coupon> {
    try {
      const url = `${API_CONFIG.ENDPOINTS.COUPONS.BY_CODE.replace('{code}', code)}`;
      return await apiClient.get<Coupon>(url);
    } catch (error) {
      console.error('Error fetching coupon by code:', error);
      throw new Error('Coupon non trovato');
    }
  }

  /**
   * Ottiene le categorie dei coupon per i filtri
   */
  static async getCouponCategories(): Promise<{ name: string; count: number }[]> {
    try {
      const url = `${API_CONFIG.ENDPOINTS.COUPONS.CATEGORIES}`;
      return await apiClient.get<{ name: string; count: number }[]>(url);
    } catch (error) {
      console.error('Error fetching coupon categories:', error);
      throw new Error('Errore nel caricamento delle categorie');
    }
  }

  /**
   * Valida un coupon per l'utilizzo
   */
  static async validateCoupon(id: string): Promise<{ valid: boolean; message?: string }> {
    try {
      const url = `${API_CONFIG.ENDPOINTS.COUPONS.VALIDATE.replace('{id}', id)}`;
      return await apiClient.get<{ valid: boolean; message?: string }>(url);
    } catch (error) {
      console.error('Error validating coupon:', error);
      throw new Error('Errore nella validazione del coupon');
    }
  }

  /**
   * Utilizza un coupon (incrementa il contatore)
   */
  static async useCoupon(id: string): Promise<{ message: string; usage_count: number }> {
    try {
      const url = `${API_CONFIG.ENDPOINTS.COUPONS.USE.replace('{id}', id)}`;
      return await apiClient.post<{ message: string; usage_count: number }>(url);
    } catch (error) {
      console.error('Error using coupon:', error);
      throw new Error('Errore nell\'utilizzo del coupon');
    }
  }

  /**
   * Verifica se oggi è un giorno feriale (Lunedì-Venerdì)
   */
  static isWeekday(): boolean {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Domenica, 1 = Lunedì, ..., 6 = Sabato
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  }
}

// Istanza singleton per compatibilità
export const couponService = {
  getActiveCoupons: CouponService.getActiveCoupons.bind(CouponService),
  getCouponsByType: CouponService.getCouponsByType.bind(CouponService),
  getRestaurantCoupons: CouponService.getRestaurantCoupons.bind(CouponService),
  getCouponById: CouponService.getCouponById.bind(CouponService),
  getCouponByCode: CouponService.getCouponByCode.bind(CouponService),
  getCouponCategories: CouponService.getCouponCategories.bind(CouponService),
  validateCoupon: CouponService.validateCoupon.bind(CouponService),
  useCoupon: CouponService.useCoupon.bind(CouponService),
  isWeekday: CouponService.isWeekday.bind(CouponService),
};