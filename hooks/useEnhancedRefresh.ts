/**
 * useEnhancedRefresh Hook
 * Gestisce pull-to-refresh con animazioni fluide e feedback tattili
 * Integrato con il sistema di haptic feedback
 */

import { useState, useCallback } from 'react';
import { useSharedValue, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { useHaptics } from '../utils/haptics';

// ==========================================
// 🎯 HOOK INTERFACE
// ==========================================

interface EnhancedRefreshConfig {
  onRefresh: () => Promise<void>;
  threshold?: number;           // Soglia per attivare il refresh (px)
  snapBackDuration?: number;    // Durata animazione di ritorno
  refreshDuration?: number;     // Durata minima refresh
  hapticFeedback?: boolean;     // Abilita feedback tattile
  showIndicator?: boolean;      // Mostra indicatore personalizzato
}

interface EnhancedRefreshState {
  // Stato del refresh
  isRefreshing: boolean;
  refreshProgress: number;      // Progresso 0-1
  
  // Valori animati
  translateY: Animated.SharedValue<number>;
  opacity: Animated.SharedValue<number>;
  scale: Animated.SharedValue<number>;
  rotation: Animated.SharedValue<number>;
  
  // Callbacks per ScrollView
  onScroll: (event: any) => void;
  onScrollEndDrag: (event: any) => void;
  
  // Stati visivi
  shouldShowIndicator: boolean;
  indicatorText: string;
  
  // Controllo manuale
  triggerRefresh: () => Promise<void>;
  stopRefresh: () => void;
}

// ==========================================
// 🪝 MAIN HOOK
// ==========================================

export function useEnhancedRefresh(config: EnhancedRefreshConfig): EnhancedRefreshState {
  const {
    onRefresh,
    threshold = 80,
    snapBackDuration = 300,
    refreshDuration = 1000,
    hapticFeedback = true,
    showIndicator = true,
  } = config;

  // Stati
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshProgress, setRefreshProgress] = useState(0);
  const [shouldShowIndicator, setShouldShowIndicator] = useState(false);
  const [indicatorText, setIndicatorText] = useState('');

  // Haptic feedback
  const haptics = useHaptics();
  const { onRefreshStart, onRefreshComplete, onSelection } = haptics || {};

  // Valori animati
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  // ==========================================
  // 🎨 ANIMATION HELPERS
  // ==========================================

  const updateIndicatorState = useCallback((progress: number, isActive: boolean) => {
    setRefreshProgress(progress);
    
    if (progress === 0) {
      setIndicatorText('');
      setShouldShowIndicator(false);
    } else if (progress < 1 && !isActive) {
      setIndicatorText('');
      setShouldShowIndicator(true);
    } else if (progress >= 1 && !isActive) {
      setIndicatorText('');
      setShouldShowIndicator(true);
      
      // Haptic feedback quando raggiunge la soglia
      if (hapticFeedback && onSelection) {
        runOnJS(onSelection)();
      }
    } else if (isActive) {
      setIndicatorText('');
      setShouldShowIndicator(true);
    }
  }, [hapticFeedback, onSelection]);

  const animateIndicator = useCallback((progress: number) => {
    'worklet';
    
    // Animazione di translate - segue il movimento del dito
    translateY.value = withSpring(Math.max(0, progress * threshold * 0.8), {
      damping: 15,
      stiffness: 250,
    });
    
    // Animazione di opacity - più rapida
    opacity.value = withTiming(Math.min(1, progress * 1.5), {
      duration: 150,
    });
    
    // Animazione di scale - più evidente
    scale.value = withSpring(Math.min(1.3, 1 + progress * 0.3), {
      damping: 15,
      stiffness: 250,
    });
    
    // Animazione di rotazione - più fluida
    rotation.value = withTiming(progress * 360, {
      duration: 300,
    });
    
    // Aggiorna stato indicator
    runOnJS(updateIndicatorState)(progress, false);
  }, [threshold, updateIndicatorState, translateY, opacity, scale, rotation]);

  const snapBack = useCallback(() => {
    'worklet';
    
    translateY.value = withSpring(0, {
      damping: 20,
      stiffness: 300,
      duration: snapBackDuration,
    });
    
    opacity.value = withTiming(0, {
      duration: snapBackDuration,
    });
    
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 200,
    });
    
    rotation.value = withTiming(0, {
      duration: snapBackDuration,
    });
    
    runOnJS(updateIndicatorState)(0, false);
  }, [snapBackDuration, updateIndicatorState, translateY, opacity, scale, rotation]);

  // ==========================================
  // 🔄 REFRESH LOGIC
  // ==========================================

  const executeRefresh = useCallback(async () => {
    if (isRefreshing || !onRefresh || typeof onRefresh !== 'function') {
      console.warn('[useEnhancedRefresh] onRefresh is not a valid function');
      return;
    }
    
    setIsRefreshing(true);
    runOnJS(updateIndicatorState)(1, true);
    
    if (hapticFeedback && onRefreshStart) {
      onRefreshStart();
    }
    
    try {
      // Assicura durata minima per UX fluida
      const [refreshResult] = await Promise.allSettled([
        onRefresh(),
        new Promise(resolve => setTimeout(resolve, refreshDuration))
      ]);
      
      if (refreshResult.status === 'rejected') {
        console.warn('Refresh failed:', refreshResult.reason);
      }
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
      
      if (hapticFeedback && onRefreshComplete) {
        onRefreshComplete();
      }
      
      // Anima il ritorno
      snapBack();
    }
  }, [isRefreshing, onRefresh, refreshDuration, hapticFeedback, onRefreshStart, onRefreshComplete, updateIndicatorState, snapBack]);

  const triggerRefresh = useCallback(async () => {
    await executeRefresh();
  }, [executeRefresh]);

  const stopRefresh = useCallback(() => {
    setIsRefreshing(false);
    snapBack();
  }, [snapBack]);

  // ==========================================
  // 📱 SCROLL HANDLERS
  // ==========================================

  const onScroll = useCallback((event: any) => {
    if (isRefreshing) return;
    
    const { contentOffset } = event.nativeEvent;
    const scrollY = contentOffset.y;
    
    // Solo quando si scrolla oltre il top (scrollY negativo) e siamo già in cima
    if (scrollY <= 0) {
      const pullDistance = Math.abs(scrollY);
      const progress = Math.min(pullDistance / threshold, 1.5);
      
      // Mostra l'indicatore solo se stiamo effettivamente trascinando verso il basso
      if (pullDistance > 5) { // Soglia minima per evitare flickering
        animateIndicator(progress);
      }
    } else {
      // Reset quando si scrolla verso il basso nella pagina
      animateIndicator(0);
    }
  }, [isRefreshing, threshold, animateIndicator]);

  const onScrollEndDrag = useCallback((event: any) => {
    if (isRefreshing) return;
    
    const { contentOffset } = event.nativeEvent;
    const scrollY = contentOffset.y;
    const pullDistance = Math.abs(scrollY);
    
    // Attiva refresh solo se siamo in cima (scrollY <= 0) e abbiamo trascinato abbastanza
    if (scrollY <= 0 && pullDistance >= threshold) {
      // Attiva refresh
      executeRefresh();
    } else {
      // Snap back senza refresh
      snapBack();
    }
  }, [isRefreshing, threshold, executeRefresh, snapBack]);

  // ==========================================
  // 📤 RETURN HOOK STATE
  // ==========================================

  return {
    // Stato
    isRefreshing,
    refreshProgress,
    
    // Valori animati
    translateY,
    opacity,
    scale,
    rotation,
    
    // Handlers
    onScroll,
    onScrollEndDrag,
    
    // UI State
    shouldShowIndicator: shouldShowIndicator && showIndicator,
    indicatorText,
    
    // Controlli manuali
    triggerRefresh,
    stopRefresh,
  };
}

// ==========================================
// 🛠️ UTILITY HOOKS
// ==========================================

/**
 * Hook semplificato per refresh standard
 */
export function useSimpleRefresh(onRefresh: () => Promise<void>) {
  return useEnhancedRefresh({
    onRefresh,
    hapticFeedback: true,
    showIndicator: true,
  });
}

/**
 * Hook per refresh con configurazione personalizzata
 */
export function useCustomRefresh(
  onRefresh: () => Promise<void>,
  options: Partial<EnhancedRefreshConfig> = {}
) {
  return useEnhancedRefresh({
    onRefresh,
    ...options,
  });
}

export default useEnhancedRefresh;