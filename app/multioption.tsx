import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router'; // Import the useRouter hook

export default function MultiOption() {
  const colorScheme = useColorScheme() || 'light';
  const isDarkMode = colorScheme === 'dark';
  const router = useRouter(); // Create router instance

  const handleUploadNavgation = () => {
    router.push('/upload'); // Replace '/targetPage' with the path of the page you want to navigate to
  };

  return (
    <ParallaxScrollView>
      <ThemedView style={[styles.container, isDarkMode ? styles.containerDark : {}]}>
        <ThemedText type="title" style={[styles.title, isDarkMode ? { color: '#fff' } : {}]}>
          Multi-Option Page
        </ThemedText>

        <ThemedText
          type="body"
          style={[styles.description, isDarkMode ? { color: '#ccc' } : {}]}
        >
          Here are some other pages that come with ScholarSphere
        </ThemedText>

        {/* Footer Button */}
        <TouchableOpacity onPress={handleUploadNavgation}>
          <ThemedText
            type="body"
            style={[styles.footerLink, { color: '#007bff' }]}
          >
            Upload Page
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}



const styles = StyleSheet.create({
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
  footerText: {
    fontSize: 16,
    textAlign: 'justify',
    paddingTop: 16,
    marginBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    lineHeight: 22,
  },
  footerLink: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
});
