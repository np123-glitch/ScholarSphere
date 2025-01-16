import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function IndexPage() {
  const colorScheme = useColorScheme() || 'light';
  const isDarkMode = colorScheme === 'dark';

  return (
    <ParallaxScrollView>
      <ThemedView style={[styles.container, isDarkMode ? styles.containerDark : {}]}>
        <ThemedText type="title" style={[styles.title, isDarkMode ? { color: '#fff' } : {}]}>
          Welcome to Scholarsphere
        </ThemedText>

        <ThemedText
          type="body"
          style={[styles.description, isDarkMode ? { color: '#ccc' } : {}]}
        >
          Scholarsphere is a platform designed to help you create and manage multiple-choice
          tests on any topic. Whether you're an educator aiming to evaluate your
          students or a self-learner looking to review material, Scholarsphere makes
          test creation simple and efficient.
        </ThemedText>

        <View style={styles.infoContainer}>
          <ThemedText
            type="body"
            style={[styles.infoHeader, isDarkMode ? { color: '#fff' } : {}]}
          >
            Key Features:
          </ThemedText>

          <ThemedText
            type="body"
            style={[styles.infoBullet, isDarkMode ? { color: '#ccc' } : {}]}
          >
            • Generate custom multiple-choice tests on the fly.
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.infoBullet, isDarkMode ? { color: '#ccc' } : {}]}
          >
            • Choose difficulty levels to tailor each exam.
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.infoBullet, isDarkMode ? { color: '#ccc' } : {}]}
          >
            • Get instant scoring and feedback after each submission.
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.infoBullet, isDarkMode ? { color: '#ccc' } : {}]}
          >
            • Chat with a personalized AI model accustomed to you.
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.infoBullet, isDarkMode ? { color: '#ccc' } : {}]}
          >
            • Get instant responses from the AI chat bot.
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.infoBullet, isDarkMode ? { color: '#ccc' } : {}]}
          >
            • Have the AI model generate flash cards based on a topic.
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.infoBullet, isDarkMode ? { color: '#ccc' } : {}]}
          >
            • Scroll back and forth from the flashcards to make sure you don't forget a thing.
          </ThemedText>

        </View>

        <ThemedText
          type="body"
          style={[
            styles.footerText,
            isDarkMode ? { color: '#ccc', borderTopColor: '#666' } : {},
          ]}
        >
          Ready to get started? Simply head over to any of the bottom tabs and begin creating
          your academic takeover! Scholarsphere is here to make learning more enjoyable
          and productive for everyone.
        </ThemedText>
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
  ctaButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  ctaButtonDark: {
    backgroundColor: '#0056b3',
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
