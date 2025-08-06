import AsyncStorage from '@react-native-async-storage/async-storage';

interface LocalCoupon {
  id: string;
  downloadedAt: string;
  used: boolean;
  usedAt?: string;
}

export class CouponStorage {
  private static readonly DOWNLOADED_COUPONS_KEY = 'downloaded_coupons';
  private static readonly LOCAL_COUPONS_KEY = 'local_coupons';

  /**
   * Scarica un coupon salvandolo localmente
   */
  static async downloadCoupon(couponId: string): Promise<void> {
    try {
      const downloadedCoupons = await this.getDownloadedCoupons();
      
      if (!downloadedCoupons.includes(couponId)) {
        downloadedCoupons.push(couponId);
        await AsyncStorage.setItem(
          this.DOWNLOADED_COUPONS_KEY,
          JSON.stringify(downloadedCoupons)
        );
      }

      // Salva anche i dettagli locali del coupon
      const localCoupon: LocalCoupon = {
        id: couponId,
        downloadedAt: new Date().toISOString(),
        used: false,
      };

      const localCoupons = await this.getLocalCoupons();
      const existingIndex = localCoupons.findIndex(c => c.id === couponId);
      
      if (existingIndex >= 0) {
        localCoupons[existingIndex] = localCoupon;
      } else {
        localCoupons.push(localCoupon);
      }

      await AsyncStorage.setItem(
        this.LOCAL_COUPONS_KEY,
        JSON.stringify(localCoupons)
      );
    } catch (error) {
      console.error('Error downloading coupon:', error);
      throw new Error('Errore nel salvare il coupon');
    }
  }

  /**
   * Verifica se un coupon è già stato scaricato
   */
  static async isCouponDownloaded(couponId: string): Promise<boolean> {
    try {
      const downloadedCoupons = await this.getDownloadedCoupons();
      return downloadedCoupons.includes(couponId);
    } catch (error) {
      console.error('Error checking coupon download status:', error);
      return false;
    }
  }

  /**
   * Ottiene tutti gli ID dei coupon scaricati
   */
  static async getDownloadedCoupons(): Promise<string[]> {
    try {
      const stored = await AsyncStorage.getItem(this.DOWNLOADED_COUPONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting downloaded coupons:', error);
      return [];
    }
  }

  /**
   * Ottiene i dettagli locali di tutti i coupon
   */
  static async getLocalCoupons(): Promise<LocalCoupon[]> {
    try {
      const stored = await AsyncStorage.getItem(this.LOCAL_COUPONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting local coupons:', error);
      return [];
    }
  }

  /**
   * Ottiene i dettagli locali di un coupon specifico
   */
  static async getLocalCoupon(couponId: string): Promise<LocalCoupon | null> {
    try {
      const localCoupons = await this.getLocalCoupons();
      return localCoupons.find(c => c.id === couponId) || null;
    } catch (error) {
      console.error('Error getting local coupon:', error);
      return null;
    }
  }

  /**
   * Marca un coupon come utilizzato
   */
  static async useCoupon(couponId: string): Promise<void> {
    try {
      if (!this.isWeekday()) {
        throw new Error('I coupon possono essere utilizzati solo nei giorni feriali');
      }

      const localCoupons = await this.getLocalCoupons();
      const couponIndex = localCoupons.findIndex(c => c.id === couponId);
      
      if (couponIndex === -1) {
        throw new Error('Coupon non trovato nei coupon scaricati');
      }

      if (localCoupons[couponIndex].used) {
        throw new Error('Questo coupon è già stato utilizzato');
      }

      localCoupons[couponIndex].used = true;
      localCoupons[couponIndex].usedAt = new Date().toISOString();

      await AsyncStorage.setItem(
        this.LOCAL_COUPONS_KEY,
        JSON.stringify(localCoupons)
      );
    } catch (error) {
      console.error('Error using coupon:', error);
      throw error;
    }
  }

  /**
   * Verifica se un coupon è stato utilizzato
   */
  static async isCouponUsed(couponId: string): Promise<boolean> {
    try {
      const localCoupon = await this.getLocalCoupon(couponId);
      return localCoupon?.used || false;
    } catch (error) {
      console.error('Error checking coupon usage:', error);
      return false;
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

  /**
   * Rimuove un coupon dai download locali
   */
  static async removeCoupon(couponId: string): Promise<void> {
    try {
      // Rimuovi dalla lista dei coupon scaricati
      const downloadedCoupons = await this.getDownloadedCoupons();
      const updatedDownloaded = downloadedCoupons.filter(id => id !== couponId);
      await AsyncStorage.setItem(
        this.DOWNLOADED_COUPONS_KEY,
        JSON.stringify(updatedDownloaded)
      );

      // Rimuovi dai dettagli locali
      const localCoupons = await this.getLocalCoupons();
      const updatedLocal = localCoupons.filter(c => c.id !== couponId);
      await AsyncStorage.setItem(
        this.LOCAL_COUPONS_KEY,
        JSON.stringify(updatedLocal)
      );
    } catch (error) {
      console.error('Error removing coupon:', error);
      throw new Error('Errore nella rimozione del coupon');
    }
  }

  /**
   * Pulisce tutti i coupon scaricati (per debug)
   */
  static async clearAllCoupons(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.DOWNLOADED_COUPONS_KEY);
      await AsyncStorage.removeItem(this.LOCAL_COUPONS_KEY);
    } catch (error) {
      console.error('Error clearing all coupons:', error);
      throw new Error('Errore nella pulizia dei coupon');
    }
  }
}