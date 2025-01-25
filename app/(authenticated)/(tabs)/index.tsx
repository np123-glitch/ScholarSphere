// src/screens/IndexPage.tsx

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Switch,
  Image,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthSession } from "@/components/AuthProvider";

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';

import { MaterialIcons } from '@expo/vector-icons'; // Importing MaterialIcons
import { Ionicons } from '@expo/vector-icons'; // Importing Ionicons

export default function IndexPage() {
  const router = useRouter();
  const systemColorScheme = useColorScheme() || 'light';
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const { signOut, token } = useAuthSession();

  const [isSettingsModalVisible, setSettingsModalVisible] = useState(false);

  const logout = () => {
    signOut();
  };

  // Toggle theme handler
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  return (
      <ThemedView
        style={[
          styles.container,
          isDarkMode ? styles.containerDark : styles.containerLight,
        ]}
      >
        {/* Header with Profile Icon */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.profileIcon}
            onPress={() => {
              console.log('Profile icon pressed');
              router.navigate('../../profile');
            }}
            accessibilityLabel="Open Profile"
          >
            <Ionicons
              name="person-circle"
              size={30}
              color={isDarkMode ? '#fff' : '#000'}
            />
          </TouchableOpacity>
        </View>


        {/* Welcome Message */}
        <ThemedText
          type="title"
          style={[styles.title, isDarkMode ? { color: '#fff' } : {}]}
        >
          Welcome to ScholarSphere
        </ThemedText>

        {/* Description */}
        <ThemedText
          type="body"
          style={[styles.description, isDarkMode ? { color: '#ccc' } : {}]}
        >
          Your all-in-one platform for creating and managing school notes and materials.
          Explore flashcards, generate multiple-choice questions, and interact with your personal AI companion to enhance your academic journey!
        </ThemedText>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, isDarkMode ? styles.actionButtonDark : {}]}
            onPress={() => router.push('/chatarea')}
          >
            <MaterialIcons name="chat" size={24} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.actionButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>

        {/* Todo List Button */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, isDarkMode ? styles.actionButtonDark : {}]}
            onPress={() => router.navigate('../../todo')}
          >
            <MaterialIcons name="check-box" size={24} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.actionButtonText}>Todo List</Text>
          </TouchableOpacity>
        </View>

        {/* Upload Documents Button */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, isDarkMode ? styles.actionButtonDark : {}]}
            onPress={() => router.navigate('../../upload')}
          >
            <MaterialIcons name="upload-file" size={24} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.actionButtonText}>Upload Documents</Text>
          </TouchableOpacity>
        </View>
        {/* Feedback Button */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, isDarkMode ? styles.actionButtonDark : {}]}
            onPress={() => router.navigate('../../feedback')}
          >
            <MaterialIcons name="feedback" size={24} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.actionButtonText}>Feedback</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 50,
  },
  containerLight: {
    backgroundColor: '#f5f5f5',
  },
  containerDark: {
    backgroundColor: '#1e1e1e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  profileIcon: {
    padding: 5,
  },
  bannerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  bannerImage: {
    width: '100%',
    height: 150,
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    marginVertical: 16,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  actionButtonsContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
    transitionProperty: 'background-color',
    transitionDuration: '300ms',
  },
  actionButtonDark: {
    backgroundColor: '#0056b3',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  buttonIcon: {
    marginLeft: 12,
  },
  //
  // ------------------- Footer styles -------------------
  //
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    backgroundColor: '#ff4d4d',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  //
  // ------------------- Modal styles -------------------
  //
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalContentLight: {
    backgroundColor: '#fff',
  },
  modalContentDark: {
    backgroundColor: '#333',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalTextLight: {
    color: '#000',
  },
  modalTextDark: {
    color: '#fff',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  toggleLabel: {
    fontSize: 18,
  },
  closeButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
