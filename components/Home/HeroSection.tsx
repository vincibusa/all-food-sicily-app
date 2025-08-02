import React, { useEffect } from 'react';
import { View, Text, ImageBackground, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import Colors from '../../constants/Colors';

const { width } = Dimensions.get('window');

const HeroSection: React.FC = () => {
  const fadeAnim = useSharedValue(0);
  
  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 1000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
  }, []);
  
  const heroAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [
        { 
          scale: withTiming(fadeAnim.value, { 
            duration: 1000, 
            easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
          }) 
        }
      ]
    };
  });

  return (
    <Animated.View style={[styles.heroContainer, heroAnimatedStyle]}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80' }}
        style={styles.heroImage}
      >
        <BlurView intensity={30} style={styles.heroOverlay}>
          <Animated.Text 
            entering={FadeInDown.duration(800).springify()} 
            style={styles.heroTitle}
          >
            AllFoodSicily
          </Animated.Text>
          <Animated.Text 
            entering={FadeInDown.delay(200).duration(800).springify()} 
            style={styles.heroSubtitle}
          >
            Il gusto e la cultura della Sicilia
          </Animated.Text>
        </BlurView>
      </ImageBackground>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  heroContainer: {
    height: width * 0.6, // Responsive height based on screen width
    marginBottom: 20,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  heroOverlay: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20,
  },
  heroTitle: {
    fontSize: width > 400 ? 36 : 32, // Responsive font size
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  heroSubtitle: {
    fontSize: width > 400 ? 20 : 18, // Responsive font size
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  }
});

export default HeroSection; 