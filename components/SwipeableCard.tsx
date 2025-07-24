/**
 * SwipeableCard - Card con gesture di swipe per azioni rapide  
 * Design moderno 2025 con animazioni fluide e haptic feedback
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../app/context/ThemeContext';
import { useHaptics } from '../utils/haptics';
import { useTextStyles } from '../hooks/useAccessibleText';


// ==========================================
// 🎯 SWIPE ACTIONS TYPES
// ==========================================

export interface SwipeAction {
  id: string;
  icon: string;
  iconType?: 'MaterialIcons' | 'FontAwesome';
  label: string;
  color: string;
  backgroundColor: string;
  onPress: () => void;
  hapticType?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
}

export interface SwipeableCardProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  threshold?: number;           // Soglia per attivare l'azione (px)
  enabled?: boolean;           // Abilita/disabilita swipe
  simultaneousHandlers?: any;  // Handler simultanei
  style?: any;
}

// ==========================================
// 🎨 DEFAULT ACTIONS
// ==========================================

export const createFavoriteAction = (
  onToggleFavorite: () => void,
  isFavorite: boolean = false
): SwipeAction => ({
  id: 'favorite',
  icon: isFavorite ? 'favorite' : 'favorite-border',
  iconType: 'MaterialIcons',
  label: isFavorite ? 'Rimuovi' : 'Preferiti',
  color: '#FFFFFF',
  backgroundColor: isFavorite ? '#FF6B6B' : '#FF6B9D',
  onPress: onToggleFavorite,
  hapticType: isFavorite ? 'warning' : 'success',
});

export const createShareAction = (onShare: () => void): SwipeAction => ({
  id: 'share',
  icon: 'share',
  iconType: 'MaterialIcons',
  label: 'Condividi',
  color: '#FFFFFF',
  backgroundColor: '#4ECDC4',
  onPress: onShare,
  hapticType: 'light',
});

export const createInfoAction = (onViewInfo: () => void): SwipeAction => ({
  id: 'info',
  icon: 'info',
  iconType: 'MaterialIcons',
  label: 'Info',
  color: '#FFFFFF',
  backgroundColor: '#45B7D1',
  onPress: onViewInfo,
  hapticType: 'light',
});

export const createDeleteAction = (onDelete: () => void): SwipeAction => ({
  id: 'delete',
  icon: 'delete',
  iconType: 'MaterialIcons',
  label: 'Elimina',
  color: '#FFFFFF',
  backgroundColor: '#FF6B6B',
  onPress: onDelete,
  hapticType: 'error',
});

// ==========================================
// 🎯 MAIN COMPONENT
// ==========================================

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  leftActions = [],
  rightActions = [],
  threshold = 80,
  enabled = true,
  simultaneousHandlers,
  style,
}) => {
  const textStyles = useTextStyles();
  const haptics = useHaptics();
  const { onTap, onSuccess, onWarning, onError, onSelection } = haptics || {};

  // Shared values per animazioni
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const leftActionOpacity = useSharedValue(0);
  const rightActionOpacity = useSharedValue(0);

  // Configurazione dimensioni
  const maxLeftSwipe = leftActions.length * threshold;
  const maxRightSwipe = rightActions.length * threshold;

  // ==========================================
  // 🎭 HAPTIC FEEDBACK
  // ==========================================

  const triggerHapticFeedback = useCallback((hapticType: string) => {
    try {
      switch (hapticType) {
        case 'success':
          onSuccess?.();
          break;
        case 'warning':
          onWarning?.();
          break;
        case 'error':
          onError?.();
          break;
        case 'light':
        case 'medium':
        case 'heavy':
          onSelection?.();
          break;
        default:
          onTap?.();
      }
    } catch (error) {
      console.warn('[SwipeableCard] Haptic feedback error:', error);
    }
  }, [onSuccess, onWarning, onError, onSelection, onTap]);

  // ==========================================
  // 🎯 GESTURE HANDLER
  // ==========================================

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {
      scale.value = withSpring(0.98);
    },

    onActive: (event) => {
      const { translationX } = event;
      
      // Limita il movimento
      let newTranslateX = translationX;
      
      if (translationX > 0 && leftActions.length > 0) {
        // Swipe a destra (azioni sinistra)
        newTranslateX = Math.min(translationX, maxLeftSwipe + 20);
        leftActionOpacity.value = withTiming(
          Math.min(translationX / threshold, 1), 
          { duration: 100 }
        );
        rightActionOpacity.value = withTiming(0, { duration: 100 });
      } else if (translationX < 0 && rightActions.length > 0) {
        // Swipe a sinistra (azioni destra)  
        newTranslateX = Math.max(translationX, -(maxRightSwipe + 20));
        rightActionOpacity.value = withTiming(
          Math.min(Math.abs(translationX) / threshold, 1),
          { duration: 100 }
        );
        leftActionOpacity.value = withTiming(0, { duration: 100 });
      }
      
      translateX.value = newTranslateX;
    },

    onEnd: (event) => {
      const { translationX } = event;
      
      scale.value = withSpring(1);
      
      // Determina se attivare un'azione
      let shouldTriggerAction = false;
      let actionToTrigger: SwipeAction | null = null;

      if (translationX > threshold && leftActions.length > 0) {
        // Azione sinistra
        const actionIndex = Math.min(
          Math.floor(translationX / threshold) - 1,
          leftActions.length - 1
        );
        actionToTrigger = leftActions[actionIndex];
        shouldTriggerAction = true;
      } else if (translationX < -threshold && rightActions.length > 0) {
        // Azione destra
        const actionIndex = Math.min(
          Math.floor(Math.abs(translationX) / threshold) - 1,
          rightActions.length - 1
        );
        actionToTrigger = rightActions[actionIndex];
        shouldTriggerAction = true;
      }

      // Esegui azione se necessario
      if (shouldTriggerAction && actionToTrigger) {
        const hapticType = actionToTrigger.hapticType || 'light';
        const actionPress = actionToTrigger.onPress;
        
        if (hapticType) {
          runOnJS(triggerHapticFeedback)(hapticType);
        }
        if (actionPress && typeof actionPress === 'function') {
          runOnJS(actionPress)();
        }
      }

      // Anima il ritorno
      translateX.value = withSpring(0, {
        damping: 20,
        stiffness: 300,
      });
      leftActionOpacity.value = withTiming(0);
      rightActionOpacity.value = withTiming(0);
    },
  });

  // ==========================================
  // 🎨 ANIMATED STYLES
  // ==========================================

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value },
    ],
  }));

  const leftActionsStyle = useAnimatedStyle(() => ({
    opacity: leftActionOpacity.value,
    transform: [
      { 
        translateX: interpolate(
          translateX.value,
          [0, maxLeftSwipe],
          [-maxLeftSwipe, 0]
        ) 
      },
    ],
  }));

  const rightActionsStyle = useAnimatedStyle(() => ({
    opacity: rightActionOpacity.value,
    transform: [
      { 
        translateX: interpolate(
          translateX.value,
          [-maxRightSwipe, 0],
          [0, maxRightSwipe]
        ) 
      },
    ],
  }));

  // ==========================================
  // 🎭 RENDER ACTIONS
  // ==========================================

  const renderActions = (actions: SwipeAction[], isLeft: boolean) => {
    return actions.map((action, index) => {
      const IconComponent = action.iconType === 'FontAwesome' ? FontAwesome : MaterialIcons;
      
      return (
        <View
          key={action.id}
          style={[
            styles.actionButton,
            {
              backgroundColor: action.backgroundColor,
              width: threshold,
            },
          ]}
        >
          <IconComponent 
            name={action.icon as any} 
            size={24} 
            color={action.color} 
          />
          <Text style={[
            styles.actionLabel,
            textStyles.caption(action.color),
          ]}>
            {action.label}
          </Text>
        </View>
      );
    });
  };

  // ==========================================
  // 🎭 RENDER
  // ==========================================

  if (!enabled) {
    return <View style={style}>{children}</View>;
  }

  return (
    <View style={[styles.container, style]}>
      {/* Azioni sinistra */}
      {leftActions.length > 0 && (
        <Animated.View style={[styles.leftActions, leftActionsStyle]}>
          {renderActions(leftActions, true)}
        </Animated.View>
      )}

      {/* Azioni destra */}
      {rightActions.length > 0 && (
        <Animated.View style={[styles.rightActions, rightActionsStyle]}>
          {renderActions(rightActions, false)}
        </Animated.View>
      )}

      {/* Card principale */}
      <PanGestureHandler
        onGestureEvent={gestureHandler}
        simultaneousHandlers={simultaneousHandlers}
        enabled={enabled}
      >
        <Animated.View style={[styles.card, cardStyle]}>
          {children}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

// ==========================================
// 🎨 STYLES
// ==========================================

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  
  card: {
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  
  leftActions: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  
  rightActions: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: 8,
  },
  
  actionLabel: {
    marginTop: 4,
    textAlign: 'center',
  },
});

export default SwipeableCard;