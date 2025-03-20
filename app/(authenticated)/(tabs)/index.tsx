import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { User, PlayCircle, MessageSquare } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingOverlay from '@/app/onboarding';

export default function IndexPage() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  const features = [
    {
      title: 'ScholarSphere Assistant',
      description: 'Get help with your studies from our AI tutor',
      icon: 'chat',
      route: '/chatarea',
      color: '#4F46E5'
    },
    {
      title: 'Flashcards',
      description: 'Create and study AI-generated flashcards',
      icon: 'style',
      route: '/flashcards',
      color: '#7C3AED'
    },
    {
      title: 'Quiz',
      description: 'Test your knowledge with AI-generated questions',
      icon: 'quiz',
      route: '/tests',
      color: '#2563EB'
    },
    {
      title: 'Study Materials',
      description: 'Upload or use ready-to-go study materials for AI analysis',
      icon: 'upload-file',
      route: '/upload',
      color: '#059669'
    }
  ];

  return (
    <ThemedView style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      {/* Header with Profile Icon and Feedback Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.headerButton,
            isDark ? styles.headerButtonDark : styles.headerButtonLight
          ]}
          onPress={() => router.push('/profile')}
        >
          <User size={20} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.headerButton,
            isDark ? styles.headerButtonDark : styles.headerButtonLight,
            styles.feedbackButton
          ]}
          onPress={() => router.push('/feedback')}
        >
          <MessageSquare size={20} color={isDark ? '#fff' : '#000'} />
          <ThemedText type="body" style={styles.feedbackButtonText}>
            Feedback
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Welcome Message */}
      <ThemedText type="title" style={styles.title}>
        Welcome to ScholarSphere
      </ThemedText>
      <ThemedText type="body" style={styles.description}>
        Your AI-powered learning companion. Choose a feature below to get started.
      </ThemedText>

      {/* Feature Grid inside a ScrollView */}
      <ScrollView 
        contentContainerStyle={styles.featureGrid}
        showsVerticalScrollIndicator={false}
      >
        {features.map((feature, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.featureCard,
              isDark ? styles.featureCardDark : styles.featureCardLight,
            ]}
            onPress={() => router.push(feature.route)}
          >
            <View style={[styles.iconContainer, { backgroundColor: feature.color }]}>
              <MaterialIcons name={feature.icon} size={24} color="#fff" />
            </View>
            <ThemedText type="subtitle" style={styles.featureTitle}>
              {feature.title}
            </ThemedText>
            <ThemedText type="body" style={styles.featureDescription}>
              {feature.description}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60
  },
  containerLight: {
    backgroundColor: '#F9FAFB'
  },
  containerDark: {
    backgroundColor: '#111827'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32
  },
  headerButton: {
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  headerButtonLight: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  headerButtonDark: {
    backgroundColor: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4
  },
  feedbackButton: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 20,
  },
  feedbackButtonText: {
    fontSize: 14,
    fontWeight: '500'
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.8
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20
  },
  featureCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16
  },
  featureCardLight: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  featureCardDark: {
    backgroundColor: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8
  },
  featureDescription: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20
  }
});