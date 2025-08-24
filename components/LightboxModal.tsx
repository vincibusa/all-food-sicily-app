import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  StyleSheet,
  StatusBar,
  Platform,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PanGestureHandler, PinchGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import Carousel from 'react-native-reanimated-carousel';
import { useDesignTokens } from '../hooks/useDesignTokens';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface LightboxModalProps {
  visible: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  visible,
  images,
  initialIndex = 0,
  onClose,
}) => {
  const tokens = useDesignTokens();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const carouselRef = useRef<any>(null);
  
  // Animation values
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Reset transform values
  const resetTransform = () => {
    scale.value = withSpring(1);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
  };

  // Pinch gesture handler for zoom
  const pinchGestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startScale = scale.value;
    },
    onActive: (event, context) => {
      scale.value = Math.max(0.5, Math.min(3, context.startScale * event.scale));
    },
    onEnd: () => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
      } else if (scale.value > 2.5) {
        scale.value = withSpring(2.5);
      }
    },
  });

  // Pan gesture handler for drag
  const panGestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startX = translateX.value;
      context.startY = translateY.value;
    },
    onActive: (event, context) => {
      if (scale.value > 1) {
        // If zoomed in, allow panning within bounds
        translateX.value = context.startX + event.translationX;
        translateY.value = context.startY + event.translationY;
      } else {
        // If not zoomed, only allow vertical drag to close
        translateY.value = event.translationY;
        const progress = Math.abs(event.translationY) / (screenHeight / 3);
        opacity.value = Math.max(0.3, 1 - progress);
      }
    },
    onEnd: (event) => {
      if (scale.value <= 1) {
        // Check if should close modal
        if (Math.abs(event.translationY) > screenHeight / 4 || Math.abs(event.velocityY) > 1000) {
          opacity.value = withTiming(0, { duration: 200 });
          translateY.value = withTiming(
            event.translationY > 0 ? screenHeight : -screenHeight,
            { duration: 200 },
            () => {
              runOnJS(onClose)();
              // Reset values after close
              opacity.value = 1;
              translateY.value = 0;
            }
          );
        } else {
          // Return to center
          translateY.value = withSpring(0);
          opacity.value = withSpring(1);
        }
      } else {
        // Keep within bounds when zoomed
        const maxTranslateX = (screenWidth * (scale.value - 1)) / 2;
        const maxTranslateY = (screenHeight * (scale.value - 1)) / 2;
        
        if (translateX.value > maxTranslateX) {
          translateX.value = withSpring(maxTranslateX);
        } else if (translateX.value < -maxTranslateX) {
          translateX.value = withSpring(-maxTranslateX);
        }
        
        if (translateY.value > maxTranslateY) {
          translateY.value = withSpring(maxTranslateY);
        } else if (translateY.value < -maxTranslateY) {
          translateY.value = withSpring(-maxTranslateY);
        }
      }
    },
  });

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const renderImage = ({ item, index }: { item: string; index: number }) => (
    <View style={styles.imageContainer}>
      <PinchGestureHandler onGestureEvent={pinchGestureHandler}>
        <Animated.View style={[styles.imageWrapper]}>
          <PanGestureHandler onGestureEvent={panGestureHandler}>
            <Animated.View style={[animatedStyle]}>
              <Image
                source={{ uri: item }}
                style={styles.image}
                resizeMode="contain"
              />
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </PinchGestureHandler>
    </View>
  );

  const handleClose = () => {
    resetTransform();
    onClose();
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      carouselRef.current?.prev();
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      carouselRef.current?.next();
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <StatusBar hidden={Platform.OS === 'android'} />
      
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleClose}
              style={[styles.headerButton, tokens.helpers.touchTarget('minimum')]}
              accessibilityRole="button"
              accessibilityLabel="Chiudi galleria"
            >
              <MaterialIcons name="close" size={24} color="white" />
            </TouchableOpacity>
            
            <Text style={styles.counter}>
              {currentIndex + 1} di {images.length}
            </Text>
            
            <View style={styles.headerButton} />
          </View>

          {/* Image Carousel */}
          <View style={styles.carouselContainer}>
            <Carousel
              ref={carouselRef}
              data={images}
              renderItem={renderImage}
              width={screenWidth}
              height={screenHeight - 100}
              defaultIndex={initialIndex}
              onSnapToItem={setCurrentIndex}
              pagingEnabled
              enabled={scale.value <= 1} // Disable swipe when zoomed
            />
          </View>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              {currentIndex > 0 && (
                <TouchableOpacity
                  style={[styles.navButton, styles.navButtonLeft]}
                  onPress={handlePrevious}
                  accessibilityRole="button"
                  accessibilityLabel="Immagine precedente"
                >
                  <MaterialIcons name="chevron-left" size={32} color="white" />
                </TouchableOpacity>
              )}
              
              {currentIndex < images.length - 1 && (
                <TouchableOpacity
                  style={[styles.navButton, styles.navButtonRight]}
                  onPress={handleNext}
                  accessibilityRole="button"
                  accessibilityLabel="Immagine successiva"
                >
                  <MaterialIcons name="chevron-right" size={32} color="white" />
                </TouchableOpacity>
              )}
            </>
          )}

          {/* Instructions */}
          <View style={styles.instructions}>
            <Text style={styles.instructionText}>
              Pizzica per ingrandire • Trascina per chiudere
            </Text>
          </View>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 1000,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  counter: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: screenWidth,
    height: screenHeight - 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: screenWidth,
    height: screenHeight - 100,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  navButtonLeft: {
    left: 20,
  },
  navButtonRight: {
    right: 20,
  },
  instructions: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionText: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
});