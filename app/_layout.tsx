import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { PerformanceProvider } from "../context/PerformanceContext";

// Componente wrapper per StatusBar - sempre dark per light theme
function ThemedStatusBar() {
  return <StatusBar style="dark" />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PerformanceProvider>
        <ThemeProvider>
          <ThemedStatusBar />
        
        <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="index"
          options={{ 
            headerShown: false,
            animation: 'fade',
            gestureEnabled: false
          }}
        />
        
        
        <Stack.Screen 
          name="(tabs)" 
          options={{ headerShown: false }}
        />
        
        {/* Pagine di dettaglio fuori dalla tab bar */}
        <Stack.Screen 
          name="articoli/[id]" 
          options={{ 
            headerShown: false,
            presentation: 'card',
          }}
        />
        
        <Stack.Screen 
          name="ristoranti/[id]" 
          options={{ 
            headerShown: false,
            presentation: 'card',
          }}
        />
        
      </Stack>
        </ThemeProvider>
      </PerformanceProvider>
    </GestureHandlerRootView>
  );
}
