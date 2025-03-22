import React from 'react';
import { StyleSheet, View, useColorScheme, useWindowDimensions } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import { MessageSquare, BookOpen, Brain, Upload } from 'lucide-react-native';
import { ThemedText } from './ThemedText';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Slide {
  key: string;
  title: string;
  text: string;
  icon: React.ComponentType<any>;
  backgroundColor: string;
}

const slides: Slide[] = [
  {
    key: 'chat',
    title: 'AI Chat Assistant',
    text: 'Get instant help with your studies from our intelligent AI tutor. Ask questions, get explanations, and deepen your understanding.',
    icon: MessageSquare,
    backgroundColor: '#4F46E5',
  },
  {
    key: 'flashcards',
    title: 'Smart Flashcards',
    text: 'Create and study AI-generated flashcards tailored to your needs. Perfect for memorization and quick review sessions.',
    icon: BookOpen,
    backgroundColor: '#7C3AED',
  },
  {
    key: 'quiz',
    title: 'Interactive Quizzes',
    text: 'Test your knowledge with dynamically generated questions. Track your progress and identify areas for improvement.',
    icon: Brain,
    backgroundColor: '#2563EB',
  },
  {
    key: 'upload',
    title: 'Study Materials',
    text: 'Upload your notes and study materials. Our AI will help you understand and organize them better.',
    icon: Upload,
    backgroundColor: '#059669',
  },
];

interface AppIntroProps {
  onDone: () => void;
}

export default function AppIntro({ onDone }: AppIntroProps) {
  const isDark = useColorScheme() === 'dark';
  const { width, height } = useWindowDimensions();

  const handleDone = async () => {
    try {
      await AsyncStorage.setItem('onboardingComplete', 'true');
      onDone();
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const renderItem = ({ item }: { item: Slide }) => {
    const Icon = item.icon;
    return (
      <View style={[styles.slide, { backgroundColor: item.backgroundColor, minHeight: height }]}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Icon size={80} color="#fff" strokeWidth={1.5} />
          </View>
          <ThemedText type="title" style={styles.title}>
            {item.title}
          </ThemedText>
          <ThemedText type="body" style={styles.text}>
            {item.text}
          </ThemedText>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppIntroSlider
        data={slides}
        renderItem={renderItem}
        onDone={handleDone}
        showSkipButton
        // Move the pagination container upward by adjusting the bottom offset.
        paginationStyle={{ bottom: 100 }}  // <-- Adjust this value as needed.
        dotStyle={styles.dot}
        activeDotStyle={[styles.dot, styles.activeDot]}
        renderNextButton={() => (
          <ThemedText style={styles.buttonText}>Next</ThemedText>
        )}
        renderSkipButton={() => (
          <ThemedText style={styles.buttonText}>Skip</ThemedText>
        )}
        renderDoneButton={() => (
          <ThemedText style={styles.buttonText}>Get Started</ThemedText>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  text: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 28,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  activeDot: {
    backgroundColor: '#fff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
