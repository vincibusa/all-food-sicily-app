/**
 * Haptic Feedback Utility
 * Provides consistent haptic feedback across the app
 * Conformi alle best practices iOS e Android
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// ==========================================
// 🎯 HAPTIC FEEDBACK TYPES
// ==========================================

export enum HapticFeedbackType {
  // Leggero - per interazioni minori
  LIGHT = 'light',
  
  // Medio - per azioni standard
  MEDIUM = 'medium',
  
  // Pesante - per azioni importanti
  HEAVY = 'heavy',
  
  // Successo - per conferme positive
  SUCCESS = 'success',
  
  // Warning - per avvisi
  WARNING = 'warning',
  
  // Errore - per errori e azioni negative
  ERROR = 'error',
  
  // Selezione - per cambio selezione/navigazione
  SELECTION = 'selection',
}

// ==========================================
// 🔧 HAPTIC FEEDBACK MANAGER
// ==========================================

class HapticManager {
  private isEnabled: boolean = true;

  constructor() {
    // Su Android, verifica se il device supporta gli haptics
    if (Platform.OS === 'android') {
      this.checkAndroidSupport();
    }
  }

  /**
   * Verifica il supporto haptic su Android
   */
  private async checkAndroidSupport(): Promise<void> {
    try {
      // Expo Haptics gestisce automaticamente la compatibilità Android
      this.isEnabled = true;
    } catch (error) {
      this.isEnabled = false;
    }
  }

  /**
   * Attiva o disattiva gli haptics globally
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Verifica se gli haptics sono abilitati
   */
  public getEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Trigger haptic feedback principale
   */
  public async trigger(type: HapticFeedbackType): Promise<void> {
    if (!this.isEnabled) return;

    try {
      switch (type) {
        case HapticFeedbackType.LIGHT:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
          
        case HapticFeedbackType.MEDIUM:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
          
        case HapticFeedbackType.HEAVY:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
          
        case HapticFeedbackType.SUCCESS:
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
          
        case HapticFeedbackType.WARNING:
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
          
        case HapticFeedbackType.ERROR:
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
          
        case HapticFeedbackType.SELECTION:
          await Haptics.selectionAsync();
          break;
          
        default:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      // Fail silently - haptics are non-critical
    }
  }

  // ==========================================
  // 🎯 CONVENIENCE METHODS
  // ==========================================

  /**
   * Feedback per tap su pulsanti/elementi interattivi
   */
  public async onTap(): Promise<void> {
    return this.trigger(HapticFeedbackType.LIGHT);
  }

  /**
   * Feedback per azioni di conferma (es. salva, invia)
   */
  public async onConfirm(): Promise<void> {
    return this.trigger(HapticFeedbackType.MEDIUM);
  }

  /**
   * Feedback per azioni importanti (es. elimina, logout)
   */
  public async onImportantAction(): Promise<void> {
    return this.trigger(HapticFeedbackType.HEAVY);
  }

  /**
   * Feedback per operazioni completate con successo
   */
  public async onSuccess(): Promise<void> {
    return this.trigger(HapticFeedbackType.SUCCESS);
  }

  /**
   * Feedback per avvisi e warning
   */
  public async onWarning(): Promise<void> {
    return this.trigger(HapticFeedbackType.WARNING);
  }

  /**
   * Feedback per errori
   */
  public async onError(): Promise<void> {
    return this.trigger(HapticFeedbackType.ERROR);
  }

  /**
   * Feedback per navigazione/cambio selezione
   */
  public async onNavigation(): Promise<void> {
    return this.trigger(HapticFeedbackType.SELECTION);
  }

  /**
   * Feedback per pull-to-refresh iniziato
   */
  public async onRefreshStart(): Promise<void> {
    return this.trigger(HapticFeedbackType.LIGHT);
  }

  /**
   * Feedback per pull-to-refresh completato
   */
  public async onRefreshComplete(): Promise<void> {
    return this.trigger(HapticFeedbackType.SUCCESS);
  }

  /**
   * Feedback per swipe actions
   */
  public async onSwipe(): Promise<void> {
    return this.trigger(HapticFeedbackType.SELECTION);
  }

  /**
   * Feedback per toggle switch
   */
  public async onToggle(): Promise<void> {
    return this.trigger(HapticFeedbackType.LIGHT);
  }

  /**
   * Feedback per apertura modale/sheet
   */
  public async onModalOpen(): Promise<void> {
    return this.trigger(HapticFeedbackType.LIGHT);
  }

  /**
   * Feedback per chiusura modale/sheet
   */
  public async onModalClose(): Promise<void> {
    return this.trigger(HapticFeedbackType.LIGHT);
  }
}

// ==========================================
// 🔄 SINGLETON INSTANCE
// ==========================================

export const hapticManager = new HapticManager();

// ==========================================
// 🎛️ HOOK FOR REACT COMPONENTS
// ==========================================

import { useCallback } from 'react';

/**
 * Hook per utilizzare gli haptics nei componenti React
 */
export const useHaptics = () => {
  const onTap = useCallback(() => hapticManager.onTap(), []);
  const onConfirm = useCallback(() => hapticManager.onConfirm(), []);
  const onImportantAction = useCallback(() => hapticManager.onImportantAction(), []);
  const onSuccess = useCallback(() => hapticManager.onSuccess(), []);
  const onWarning = useCallback(() => hapticManager.onWarning(), []);
  const onError = useCallback(() => hapticManager.onError(), []);
  const onNavigation = useCallback(() => hapticManager.onNavigation(), []);
  const onRefreshStart = useCallback(() => hapticManager.onRefreshStart(), []);
  const onRefreshComplete = useCallback(() => hapticManager.onRefreshComplete(), []);
  const onSwipe = useCallback(() => hapticManager.onSwipe(), []);
  const onToggle = useCallback(() => hapticManager.onToggle(), []);
  const onModalOpen = useCallback(() => hapticManager.onModalOpen(), []);
  const onModalClose = useCallback(() => hapticManager.onModalClose(), []);

  return {
    onTap,
    onConfirm,
    onImportantAction,
    onSuccess,
    onWarning,
    onError,
    onNavigation,
    onRefreshStart,
    onRefreshComplete,
    onSwipe,
    onToggle,
    onModalOpen,
    onModalClose,
    setEnabled: hapticManager.setEnabled.bind(hapticManager),
    isEnabled: hapticManager.getEnabled(),
  };
};

// ==========================================
// 📱 USAGE GUIDELINES
// ==========================================

/**
 * USAGE EXAMPLES:
 * 
 * // In a component
 * import { useHaptics } from '../utils/haptics';
 * 
 * const MyComponent = () => {
 *   const { onTap, onSuccess } = useHaptics();
 *   
 *   const handlePress = () => {
 *     onTap(); // Haptic feedback
 *     // ... rest of logic
 *   };
 * 
 *   const handleSave = async () => {
 *     try {
 *       await saveData();
 *       onSuccess(); // Success haptic
 *     } catch (error) {
 *       onError(); // Error haptic
 *     }
 *   };
 * };
 * 
 * // Direct usage
 * import { hapticManager } from '../utils/haptics';
 * 
 * hapticManager.onTap();
 */