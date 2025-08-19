import React from "react";
import { Tabs } from "expo-router";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useHaptics } from "../../utils/haptics";

export default function TabsLayout() {
  const { colors } = useTheme();
  const { onNavigation } = useHaptics();
  
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
      screenListeners={{
        tabPress: () => {
          onNavigation(); // Haptic feedback per navigazione tab
        },
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
          title: "Locali",
          tabBarIcon: ({ color }) => <MaterialIcons name="restaurant" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="hotel"
        options={{
          title: "Hotel",
          tabBarIcon: ({ color }) => <FontAwesome name="bed" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="guide"
        options={{
          title: "Guide",
          tabBarIcon: ({ color }) => <FontAwesome name="book" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "AllFood AI",
          tabBarIcon: ({ color }) => <MaterialIcons name="smart-toy" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
} 