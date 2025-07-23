import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider, useTheme } from "./context/ThemeContext";

// Componente wrapper per StatusBar che usa il tema
function ThemedStatusBar() {
  const { colorScheme } = useTheme();
  return <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />;
}

export default function RootLayout() {
  return (
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
          name="login"
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
        
        {/* Pagine dell'account */}
        <Stack.Screen 
          name="account/informazioni-personali" 
          options={{ 
            headerShown: false,
            presentation: 'card',
          }}
        />
        
        <Stack.Screen 
          name="account/privacy-sicurezza" 
          options={{ 
            headerShown: false,
            presentation: 'card',
          }}
        />
        
        <Stack.Screen 
          name="account/aiuto-supporto" 
          options={{ 
            headerShown: false,
            presentation: 'card',
          }}
        />
        
        <Stack.Screen 
          name="account/informazioni-app" 
          options={{ 
            headerShown: false,
            presentation: 'card',
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
