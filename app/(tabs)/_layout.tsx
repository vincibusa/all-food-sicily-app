import React from "react";
import { Tabs } from "expo-router";
import { FontAwesome, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export default function TabsLayout() {
  const { colors, colorScheme } = useTheme();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tint,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ristoranti"
        options={{
          title: "Ristoranti",
          tabBarIcon: ({ color }) => <MaterialIcons name="restaurant" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="articoli"
        options={{
          title: "Articoli",
          tabBarIcon: ({ color }) => <FontAwesome name="newspaper-o" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profilo"
        options={{
          title: "Profilo",
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
} 