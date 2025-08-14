import { supabase } from './supabase.config';
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
      let query = supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true);

      // Apply filters
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.restaurantId) {
        query = query.eq('restaurant_id', filters.restaurantId);
      }

      // Apply pagination
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        throw new Error(error.message || 'Errore nel caricamento dei coupon');
      }

      return {
        coupons: data || [],
        pagination: {
          page,
          limit,
          total: count || data?.length || 0,
          totalPages: Math.ceil((count || data?.length || 0) / limit)
        }
      };
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
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message || 'Errore nel caricamento dei coupon del ristorante');
      }

      return data || [];
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
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Coupon non trovato');
        }
        throw new Error(error.message || 'Errore nel caricamento del coupon');
      }

      return data;
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
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Coupon non trovato');
        }
        throw new Error(error.message || 'Coupon non trovato');
      }

      return data;
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
      const { data, error } = await supabase
        .from('coupons')
        .select('category')
        .eq('is_active', true)
        .not('category', 'is', null);

      if (error) {
        throw new Error(error.message || 'Errore nel caricamento delle categorie');
      }

      // Group by category and count
      const categoryCounts: { [key: string]: number } = {};
      (data || []).forEach((item: { category: string }) => {
        if (item.category) {
          categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
        }
      });

      return Object.entries(categoryCounts).map(([name, count]) => ({ name, count }));
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
      const coupon = await this.getCouponById(id);
      
      // Basic validation
      if (!coupon.is_active) {
        return { valid: false, message: 'Coupon non attivo' };
      }
      
      if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
        return { valid: false, message: 'Coupon esaurito' };
      }
      
      return { valid: true };
    } catch (error) {
      console.error('Error validating coupon:', error);
      return { valid: false, message: 'Coupon non trovato' };
    }
  }

  /**
   * Utilizza un coupon (incrementa il contatore)
   */
  static async useCoupon(id: string): Promise<{ message: string; usage_count: number }> {
    try {
      // Since we don't have authentication, this is just for display purposes
      // In a real app, you'd want proper authentication and RLS
      const coupon = await this.getCouponById(id);
      const newUsageCount = coupon.usage_count + 1;
      
      const { error } = await supabase
        .from('coupons')
        .update({ usage_count: newUsageCount })
        .eq('id', id);

      if (error) {
        throw new Error(error.message || 'Errore nell\'utilizzo del coupon');
      }

      return { 
        message: 'Coupon utilizzato con successo', 
        usage_count: newUsageCount 
      };
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