import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [onboarding, isOnboarded] = useState('');

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            paddingBottom: 20,
            paddingTop: 10,
            height: 80,
          },
          default: {
            paddingBottom: 10,
          },
        }),
        tabBarContentContainerStyle: {
          marginTop: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="flashcards"
        options={{
          title: 'Flashcards',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="eraser" color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="chatarea"
        options={{
          title: 'Chat',
          tabBarIcon: () => (
            <View style={styles.auraContainer}>
              <IconSymbol size={28} name="message" color="#04D9FF" />
            </View>
          ),
          tabBarLabel: () => (
            <ThemedText
              type="body"
              style={{ color: "#04D9FF", fontSize: 10 }}
            >
              Chat
            </ThemedText>
          ),
        }}
      />
      
      <Tabs.Screen
        name="tests"
        options={{
          title: 'Quiz',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="clipboard" color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="upload"
        options={{
          title: 'Upload',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="upload-file" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  auraContainer: {
    // iOS shadow properties to create a glow effect
    shadowColor: '#04D9FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    // Android uses elevation for shadows
    elevation: 10,
  },
});
