/**
 * Transitions Utilities - Sistema di transizioni avanzate
 * Animazioni fluide per le transizioni tra schermate
 * Conforme alle best practices 2025
 */

import { 
  FadeIn, 
  FadeOut, 
  FadeInDown, 
  FadeInUp, 
  FadeInLeft, 
  FadeInRight,
  SlideInDown,
  SlideInUp,
  SlideInLeft,
  SlideInRight,
  SlideOutDown,
  SlideOutUp,
  SlideOutLeft,
  SlideOutRight,
  BounceIn,
  ZoomIn,
  ZoomOut,
  FlipInXUp,
  FlipOutXUp,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';

// ==========================================
// 🎨 TRANSITION PRESETS
// ==========================================

/**
 * Tipi di transizione disponibili
 */
export enum TransitionType {
  // Fade transitions
  FADE = 'fade',
  FADE_UP = 'fadeUp',
  FADE_DOWN = 'fadeDown',
  FADE_LEFT = 'fadeLeft',
  FADE_RIGHT = 'fadeRight',
  
  // Slide transitions  
  SLIDE_UP = 'slideUp',
  SLIDE_DOWN = 'slideDown',
  SLIDE_LEFT = 'slideLeft',
  SLIDE_RIGHT = 'slideRight',
  
  // Special effects
  BOUNCE = 'bounce',
  ZOOM = 'zoom',
  FLIP = 'flip',
  
  // Stack navigation
  STACK_PUSH = 'stackPush',
  STACK_POP = 'stackPop',
  
  // Modal transitions
  MODAL_PRESENT = 'modalPresent',
  MODAL_DISMISS = 'modalDismiss',
  
  // Refresh animations
  REFRESH_PULL = 'refreshPull',
  REFRESH_COMPLETE = 'refreshComplete',
}

/**
 * Configurazione durata animazioni
 */
export const TRANSITION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 500,
  extra_slow: 800,
} as const;

/**
 * Easing curves per diversi tipi di movimento
 */
export const EASING_CURVES = {
  // Standard ease curves
  easeOut: Easing.bezier(0.25, 0.1, 0.25, 1),
  easeIn: Easing.bezier(0.4, 0, 1, 1),
  easeInOut: Easing.bezier(0.4, 0, 0.2, 1),
  
  // Material Design curves
  standard: Easing.bezier(0.4, 0.0, 0.2, 1),
  decelerate: Easing.bezier(0.0, 0.0, 0.2, 1),
  accelerate: Easing.bezier(0.4, 0.0, 1, 1),
  
  // Bounce and elastic
  bounce: Easing.bounce,
  elastic: Easing.elastic(1.5),
  
  // Custom curves for 2025 design
  modern: Easing.bezier(0.16, 1, 0.3, 1),      // Smooth modern feel
  snappy: Easing.bezier(0.8, 0, 0.2, 1),       // Quick and responsive
  gentle: Easing.bezier(0.25, 0.46, 0.45, 0.94), // Gentle and natural
} as const;

// ==========================================
// 🎯 TRANSITION FACTORY FUNCTIONS
// ==========================================

/**
 * Crea animazione di entrata basata sul tipo
 */
export function createEnterTransition(
  type: TransitionType, 
  duration: number = TRANSITION_DURATION.normal,
  delay: number = 0
) {
  const config = {
    duration,
    easing: EASING_CURVES.modern,
  };

  const baseTransition = (() => {
    switch (type) {
      case TransitionType.FADE:
        return FadeIn.duration(duration).easing(EASING_CURVES.easeOut);
        
      case TransitionType.FADE_UP:
        return FadeInUp.duration(duration).easing(EASING_CURVES.easeOut);
        
      case TransitionType.FADE_DOWN:
        return FadeInDown.duration(duration).easing(EASING_CURVES.easeOut);
        
      case TransitionType.FADE_LEFT:
        return FadeInLeft.duration(duration).easing(EASING_CURVES.easeOut);
        
      case TransitionType.FADE_RIGHT:
        return FadeInRight.duration(duration).easing(EASING_CURVES.easeOut);
        
      case TransitionType.SLIDE_UP:
        return SlideInUp.duration(duration).easing(EASING_CURVES.decelerate);
        
      case TransitionType.SLIDE_DOWN:
        return SlideInDown.duration(duration).easing(EASING_CURVES.decelerate);
        
      case TransitionType.SLIDE_LEFT:
        return SlideInLeft.duration(duration).easing(EASING_CURVES.decelerate);
        
      case TransitionType.SLIDE_RIGHT:
        return SlideInRight.duration(duration).easing(EASING_CURVES.decelerate);
        
      case TransitionType.BOUNCE:
        return BounceIn.duration(duration * 1.5).easing(EASING_CURVES.bounce);
        
      case TransitionType.ZOOM:
        return ZoomIn.duration(duration).easing(EASING_CURVES.easeOut);
        
      case TransitionType.FLIP:
        return FlipInXUp.duration(duration).easing(EASING_CURVES.easeOut);
        
      case TransitionType.STACK_PUSH:
        return SlideInRight.duration(duration).easing(EASING_CURVES.standard);
        
      case TransitionType.MODAL_PRESENT:
        return SlideInUp.duration(duration).easing(EASING_CURVES.decelerate);
        
      default:
        return FadeInDown.duration(duration).easing(EASING_CURVES.easeOut);
    }
  })();

  return delay > 0 ? baseTransition.delay(delay) : baseTransition;
}

/**
 * Crea animazione di uscita basata sul tipo
 */
export function createExitTransition(
  type: TransitionType, 
  duration: number = TRANSITION_DURATION.fast
) {
  switch (type) {
    case TransitionType.FADE:
    case TransitionType.FADE_UP:
    case TransitionType.FADE_DOWN:
    case TransitionType.FADE_LEFT:
    case TransitionType.FADE_RIGHT:
      return FadeOut.duration(duration).easing(EASING_CURVES.easeIn);
      
    case TransitionType.SLIDE_UP:
      return SlideOutUp.duration(duration).easing(EASING_CURVES.accelerate);
      
    case TransitionType.SLIDE_DOWN:
      return SlideOutDown.duration(duration).easing(EASING_CURVES.accelerate);
      
    case TransitionType.SLIDE_LEFT:
      return SlideOutLeft.duration(duration).easing(EASING_CURVES.accelerate);
      
    case TransitionType.SLIDE_RIGHT:
      return SlideOutRight.duration(duration).easing(EASING_CURVES.accelerate);
      
    case TransitionType.ZOOM:
      return ZoomOut.duration(duration).easing(EASING_CURVES.easeIn);
      
    case TransitionType.FLIP:
      return FlipOutXUp.duration(duration).easing(EASING_CURVES.easeIn);
      
    case TransitionType.STACK_POP:
      return SlideOutRight.duration(duration).easing(EASING_CURVES.standard);
      
    case TransitionType.MODAL_DISMISS:
      return SlideOutDown.duration(duration).easing(EASING_CURVES.accelerate);
      
    default:
      return FadeOut.duration(duration).easing(EASING_CURVES.easeIn);
  }
}

// ==========================================
// 🎭 PRESET COMBINATIONS
// ==========================================

/**
 * Preset per diversi tipi di schermata
 */
export const SCREEN_TRANSITIONS = {
  // Homepage e navigazione principale
  home: {
    enter: createEnterTransition(TransitionType.FADE_UP, TRANSITION_DURATION.normal),
    exit: createExitTransition(TransitionType.FADE, TRANSITION_DURATION.fast),
  },
  
  // Liste (ristoranti, guide)
  list: {
    enter: createEnterTransition(TransitionType.SLIDE_RIGHT, TRANSITION_DURATION.normal),
    exit: createExitTransition(TransitionType.SLIDE_LEFT, TRANSITION_DURATION.fast),
  },
  
  // Dettagli (singolo ristorante, guida)
  detail: {
    enter: createEnterTransition(TransitionType.SLIDE_UP, TRANSITION_DURATION.normal),
    exit: createExitTransition(TransitionType.SLIDE_DOWN, TRANSITION_DURATION.fast),
  },
  
  // Profilo utente
  profile: {
    enter: createEnterTransition(TransitionType.FADE_LEFT, TRANSITION_DURATION.normal),
    exit: createExitTransition(TransitionType.FADE, TRANSITION_DURATION.fast),
  },
  
  // Modal e overlay
  modal: {
    enter: createEnterTransition(TransitionType.MODAL_PRESENT, TRANSITION_DURATION.normal),
    exit: createExitTransition(TransitionType.MODAL_DISMISS, TRANSITION_DURATION.normal),
  },
  
  // Schermata di ricerca
  search: {
    enter: createEnterTransition(TransitionType.FADE_DOWN, TRANSITION_DURATION.fast),
    exit: createExitTransition(TransitionType.FADE, TRANSITION_DURATION.fast),
  },
} as const;

// ==========================================
// 🎨 STAGGERED ANIMATIONS
// ==========================================

/**
 * Crea animazioni staggered per liste di elementi
 */
export function createStaggeredAnimation(
  type: TransitionType = TransitionType.FADE_UP,
  itemCount: number,
  baseDelay: number = 0,
  staggerDelay: number = 100,
  duration: number = TRANSITION_DURATION.normal
) {
  return Array.from({ length: itemCount }, (_, index) => 
    createEnterTransition(
      type, 
      duration, 
      baseDelay + (index * staggerDelay)
    )
  );
}

/**
 * Animazioni per card in griglia
 */
export function createGridStaggerAnimation(
  itemCount: number,
  columns: number = 2,
  baseDelay: number = 0,
  staggerDelay: number = 50
) {
  return Array.from({ length: itemCount }, (_, index) => {
    const row = Math.floor(index / columns);
    const col = index % columns;
    const delay = baseDelay + (row * staggerDelay * 2) + (col * staggerDelay);
    
    return createEnterTransition(
      TransitionType.FADE_UP, 
      TRANSITION_DURATION.normal, 
      delay
    );
  });
}

// ==========================================
// 🎯 SPRING ANIMATIONS
// ==========================================

/**
 * Configurazioni spring per diversi tipi di movimento
 */
export const SPRING_CONFIGS = {
  // Gentle spring (default)
  gentle: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  
  // Bouncy spring
  bouncy: {
    damping: 8,
    stiffness: 100,
    mass: 1,
  },
  
  // Snappy spring
  snappy: {
    damping: 20,
    stiffness: 300,
    mass: 1,
  },
  
  // Slow spring
  slow: {
    damping: 20,
    stiffness: 80,
    mass: 1,
  },
} as const;

/**
 * Crea spring animation per gesti e interazioni
 */
export function createSpringTransition(
  type: 'gentle' | 'bouncy' | 'snappy' | 'slow' = 'gentle'
) {
  return withSpring(1, SPRING_CONFIGS[type]);
}

// ==========================================
// 🎪 UTILITY FUNCTIONS
// ==========================================

/**
 * Ottiene la transizione appropriata per il tipo di schermata
 */
export function getScreenTransition(screenType: keyof typeof SCREEN_TRANSITIONS) {
  return SCREEN_TRANSITIONS[screenType] || SCREEN_TRANSITIONS.home;
}

/**
 * Crea transizione personalizzata con configurazione completa
 */
export function createCustomTransition(config: {
  enterType: TransitionType;
  exitType?: TransitionType;
  duration?: number;
  delay?: number;
  easing?: keyof typeof EASING_CURVES;
}) {
  const {
    enterType,
    exitType = TransitionType.FADE,
    duration = TRANSITION_DURATION.normal,
    delay = 0,
    easing = 'modern'
  } = config;

  return {
    enter: createEnterTransition(enterType, duration, delay),
    exit: createExitTransition(exitType, duration * 0.7), // Exit più veloce
  };
}

export default {
  TransitionType,
  TRANSITION_DURATION,
  EASING_CURVES,
  SCREEN_TRANSITIONS,
  SPRING_CONFIGS,
  createEnterTransition,
  createExitTransition,
  createStaggeredAnimation,
  createGridStaggerAnimation,
  createSpringTransition,
  getScreenTransition,
  createCustomTransition,
};