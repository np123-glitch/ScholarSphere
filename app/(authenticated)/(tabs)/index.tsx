import React, { useRef } from 'react';
import { StyleSheet, View, Button, Text, TouchableOpacity } from 'react-native';
import DrawerLayout from 'react-native-gesture-handler/DrawerLayout';
import { useRouter } from 'expo-router';
import { useAuthSession } from "@/components/AuthProvider";

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function IndexPage() {
  const router = useRouter();
  const colorScheme = useColorScheme() || 'light';
  const isDarkMode = colorScheme === 'dark';
  const { signOut, token } = useAuthSession();

  // Reference to control the drawer programmatically
  const drawerRef = useRef<DrawerLayout>(null);

  // Style used for the drawer background, matching dark/light mode
  const drawerBackgroundStyle = {
    backgroundColor: isDarkMode ? '#111' : '#fff',
  };

  // Text color for drawer headers or other text
  const drawerTextStyle = {
    color: isDarkMode ? '#fff' : '#111',
  };

  const logout = () => {
    signOut();
  };

  // Common button color for the drawer's <Button> elements
  const buttonColor = isDarkMode ? '#aaa' : '#007bff';

  // Content that appears in the slide-out drawer
  const renderDrawerContent = () => (
    <View style={[styles.drawerContainer, drawerBackgroundStyle]}>
      <View style={styles.drawerContent}>
        <Text style={[styles.drawerHeader, drawerTextStyle]}>
          More options
        </Text>

        {/* Navigation Buttons */}
        <View style={styles.drawerButtonContainer}>
          <Button
            title="Chat Area"
            color={buttonColor}
            onPress={() => {
              drawerRef.current?.closeDrawer();
              router.push('/chatarea');
            }}
          />
        </View>
        <View style={styles.drawerButtonContainer}>
          <Button
            title="Flashcards"
            color={buttonColor}
            onPress={() => {
              drawerRef.current?.closeDrawer();
              router.push('/flashcards');
            }}
          />
        </View>
        <View style={styles.drawerButtonContainer}>
          <Button
            title="Tests"
            color={buttonColor}
            onPress={() => {
              drawerRef.current?.closeDrawer();
              router.push('/tests');
            }}
          />
        </View>
        <View style={styles.drawerButtonContainer}>
          <Button
            title="Logout"
            color={buttonColor}
            onPress={() => {
              drawerRef.current?.closeDrawer();
              logout(); // Correctly call the logout function
            }}
          />
        </View>
      </View>
    </View>
  );

  return (
    <DrawerLayout
      ref={drawerRef}
      drawerWidth={280}
      drawerPosition="left"
      renderNavigationView={renderDrawerContent}
    >
      {/* Main content (with ParallaxScrollView, etc.) */}
      <ParallaxScrollView>
        <ThemedView
          style={[styles.container, isDarkMode ? styles.containerDark : {}]}
        >
          <ThemedText
            type="title"
            style={[styles.title, isDarkMode ? { color: '#fff' } : {}]}
          >
            Welcome to Scholarsphere
          </ThemedText>

          <ThemedText
            type="body"
            style={[styles.description, isDarkMode ? { color: '#ccc' } : {}]}
          >
            Scholarsphere is a platform designed to help you create and manage
            school notes and material. You can make flashcards, generate multiple
            choice questions, and have a personal AI companion to help you in your
            academic success!
          </ThemedText>

        
          {/* Custom bounding-box button to open the drawer */}
          <View style={[styles.openDrawerButtonContainer, isDarkMode ? styles.openDrawerButtonContainerDark : {}]}>
            <TouchableOpacity
              style={[styles.openDrawerButton, isDarkMode ? styles.openDrawerButtonDark : {}]}
              onPress={() => drawerRef.current?.openDrawer()}
            >
              <Text style={styles.openDrawerButtonText}>☰</Text>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </ParallaxScrollView>
    </DrawerLayout>
  );
}

const styles = StyleSheet.create({
  //
  // ------------------- Drawer Layout styles -------------------
  //
  drawerContainer: {
    flex: 1,
    marginTop: 50,
  },
  drawerContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  drawerHeader: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: '600',
  },
  drawerButtonContainer: {
    marginBottom: 12,
  },

  //
  // ------------------- Main page styles -------------------
  //
  container: {
    padding: 24,
    flex: 1,
    justifyContent: 'flex-start',
  },
  containerDark: {
    backgroundColor: '#111',
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    marginVertical: 16,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    textAlign: 'justify',
    marginBottom: 24,
    lineHeight: 22,
  },
  infoContainer: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  infoHeader: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: '600',
  },
  infoBullet: {
    marginVertical: 4,
    fontSize: 16,
    textAlign: 'justify',
    lineHeight: 20,
  },
  footerText: {
    fontSize: 16,
    textAlign: 'justify',
    paddingTop: 16,
    marginBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    lineHeight: 22,
  },

  //
  // ------------------- Custom bounding-box button styles -------------------
  //
  openDrawerButtonContainer: {
    // This container creates the bounding box (card-like) around the button
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 10,
  },
  openDrawerButtonContainerDark: {
    backgroundColor: '#333',
    shadowColor: '#000',
  },
  openDrawerButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    // flex: 1 ensures the button expands horizontally to fill the bounding box
  },
  openDrawerButtonDark: {
    backgroundColor: '#0056b3',
  },
  openDrawerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
