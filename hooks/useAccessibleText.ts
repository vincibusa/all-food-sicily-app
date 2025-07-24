/**
 * useAccessibleText Hook
 * Fornisce supporto dinamico per il text scaling e l'accessibilità
 * Si integra con le impostazioni di sistema iOS/Android
 */

import { useState, useEffect, useCallback } from 'react';
import { AppState, Dimensions } from 'react-native';
import { 
  getDynamicTypography, 
  getSystemTextScaleLevel, 
  createTextStyle,
  TextContentType,
  TextScaleLevel,
  isAccessibleFontSize
} from '../utils/typography';

// ==========================================
// 🎯 HOOK INTERFACE
// ==========================================

interface AccessibleTextHook {
  // Typography dinamica
  typography: ReturnType<typeof getDynamicTypography>;
  
  // Livello di scaling corrente
  currentScaleLevel: TextScaleLevel;
  
  // Utility functions
  createStyle: (
    baseFontSize: number,
    contentType?: TextContentType,
    options?: {
      fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
      color?: string;
    }
  ) => object;
  
  // Verifica accessibilità
  isAccessible: (fontSize: number, contentType: TextContentType) => boolean;
  
  // Informazioni sistema
  systemInfo: {
    isLargeTextEnabled: boolean;
    fontScale: number;
    screenScale: number;
  };
  
  // Aggiornamento manuale
  refresh: () => void;
}

// ==========================================
// 🪝 MAIN HOOK
// ==========================================

export function useAccessibleText(): AccessibleTextHook {
  const [scaleLevel, setScaleLevel] = useState<TextScaleLevel>(TextScaleLevel.NORMAL);
  const [systemInfo, setSystemInfo] = useState({
    isLargeTextEnabled: false,
    fontScale: 1.0,
    screenScale: 1.0,
  });

  // ==========================================
  // 📱 SYSTEM DETECTION
  // ==========================================

  const updateSystemSettings = useCallback(() => {
    try {
      const detectedLevel = getSystemTextScaleLevel();
      setScaleLevel(detectedLevel);
      
      // Aggiorna info di sistema
      const { fontScale, scale } = Dimensions.get('window');
      setSystemInfo({
        isLargeTextEnabled: detectedLevel !== TextScaleLevel.NORMAL,
        fontScale: fontScale || 1.0,
        screenScale: scale || 1.0,
      });
      
      console.log('[AccessibleText] System settings updated:', {
        scaleLevel: detectedLevel,
        fontScale: fontScale || 1.0,
        isLargeText: detectedLevel !== TextScaleLevel.NORMAL
      });
    } catch (error) {
      console.warn('[AccessibleText] Error detecting system settings:', error);
      // Fallback ai valori di default
      setScaleLevel(TextScaleLevel.NORMAL);
      setSystemInfo({
        isLargeTextEnabled: false,
        fontScale: 1.0,
        screenScale: 1.0,
      });
    }
  }, []);

  // ==========================================
  // 🔄 LIFECYCLE & LISTENERS
  // ==========================================

  useEffect(() => {
    // Initial load
    updateSystemSettings();

    // Listen per cambi nelle impostazioni di sistema
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // Quando l'app torna attiva, ricontrolla le impostazioni
        updateSystemSettings();
      }
    };

    // Listen per cambi nelle dimensioni (include font scale changes)
    const dimensionsListener = Dimensions.addEventListener('change', updateSystemSettings);
    
    // Listen per app state changes
    const appStateListener = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      dimensionsListener?.remove();
      appStateListener?.remove();
    };
  }, [updateSystemSettings]);

  // ==========================================
  // 🎨 TYPOGRAPHY GENERATION
  // ==========================================

  const typography = getDynamicTypography(scaleLevel);

  const createStyle = useCallback((
    baseFontSize: number,
    contentType: TextContentType = TextContentType.BODY,
    options: {
      fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
      color?: string;
    } = {}
  ) => {
    return createTextStyle(baseFontSize, contentType, {
      ...options,
      userScaleLevel: scaleLevel,
    });
  }, [scaleLevel]);

  const isAccessible = useCallback((fontSize: number, contentType: TextContentType) => {
    return isAccessibleFontSize(fontSize, contentType);
  }, []);

  // ==========================================
  // 📤 RETURN HOOK INTERFACE
  // ==========================================

  return {
    typography,
    currentScaleLevel: scaleLevel,
    createStyle,
    isAccessible,
    systemInfo,
    refresh: updateSystemSettings,
  };
}

// ==========================================
// 🛠️ UTILITY HOOKS
// ==========================================

/**
 * Hook semplificato per ottenere solo le dimensioni di font dinamiche
 */
export function useDynamicFontSizes() {
  const { typography } = useAccessibleText();
  return typography;
}

/**
 * Hook per rilevare se l'utente ha abilitato testo grande
 */
export function useIsLargeTextEnabled(): boolean {
  const { systemInfo } = useAccessibleText();
  return systemInfo.isLargeTextEnabled;
}

/**
 * Hook per creare stili di testo con shortcuts per i casi più comuni
 */
export function useTextStyles() {
  const { createStyle, currentScaleLevel } = useAccessibleText();
  
  return {
    // Shortcuts per stili comuni
    title: (color?: string) => createStyle(24, TextContentType.HEADING, { 
      fontWeight: 'bold', 
      color 
    }),
    
    subtitle: (color?: string) => createStyle(18, TextContentType.HEADING, { 
      fontWeight: 'semibold', 
      color 
    }),
    
    body: (color?: string) => createStyle(16, TextContentType.BODY, { 
      color 
    }),
    
    caption: (color?: string) => createStyle(14, TextContentType.CAPTION, { 
      color 
    }),
    
    button: (color?: string) => createStyle(16, TextContentType.BUTTON, { 
      fontWeight: 'medium', 
      color 
    }),
    
    label: (color?: string) => createStyle(14, TextContentType.LABEL, { 
      fontWeight: 'medium', 
      color 
    }),
    
    // Custom style creator
    custom: createStyle,
    
    // Info sul livello corrente
    scaleLevel: currentScaleLevel,
  };
}

export default useAccessibleText;