import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      
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
    </>
  );
}
