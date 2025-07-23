import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions, ImageBackground, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from './context/ThemeContext';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeInDown, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors, colorScheme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <BlurView intensity={20} style={[styles.overlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={{ flex: 1 }} />
          
          <Animated.View 
            style={styles.logoContainer}
            entering={FadeIn.delay(300).duration(1000)}
          >
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1516550893982-9a5ef47f3562?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' }}
              style={styles.logoImage}
            />
          </Animated.View>
          
          <Animated.Text 
            style={styles.title}
            entering={FadeInDown.delay(600).duration(800)}
          >
            AllFoodSicily
          </Animated.Text>
          
          <Animated.Text 
            style={styles.subtitle}
            entering={FadeInDown.delay(900).duration(800)}
          >
            Scopri i sapori autentici della tradizione siciliana
          </Animated.Text>
          
          <Animated.View
            entering={SlideInDown.delay(1200).springify()}
            style={styles.buttonContainer}
          >
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={() => router.replace('/login')}
            >
              <Text style={styles.buttonText}>Accedi o Registrati</Text>
            </TouchableOpacity>
          </Animated.View>
          
          <View style={{ flex: 1 }} />
        </BlurView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    width: width * 0.45,
    height: width * 0.45,
    borderRadius: width * 0.225,
    overflow: 'hidden',
    marginBottom: 40,
    borderWidth: 3,
    borderColor: 'white',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  subtitle: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    marginBottom: 60,
    paddingHorizontal: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 30,
    marginTop: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  }
}); 