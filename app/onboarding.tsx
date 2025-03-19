import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
  useColorScheme,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  interpolate,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import {
  Brain,
  BookOpen,
  PenTool,
  Upload,
  ChevronRight,
  X,
} from 'lucide-react-native';
import { ThemedText } from '@/components/ThemedText';

const { width, height } = Dimensions.get('window');

const steps = [
  {
    title: 'Welcome to ScholarSphere! 🎓',
    description: 'Your AI-powered learning companion that helps you study smarter, not harder.',
    icon: Brain,
    highlight: { x: width / 2 - 150, y: height / 2 - 150, width: 300, height: 100 },
  },
  {
    title: 'Smart Flashcards',
    description: 'Create AI-generated flashcards for any topic. Perfect for quick revision and memorization.',
    icon: BookOpen,
    highlight: { x: 20, y: height - 80, width: 80, height: 80 },
  },
  {
    title: 'Interactive Quizzes',
    description: 'Test your knowledge with personalized quizzes. Track your progress and identify areas for improvement.',
    icon: PenTool,
    highlight: { x: width / 2 - 40, y: height - 80, width: 80, height: 80 },
  },
  {
    title: 'Study Material Upload',
    description: 'Upload your notes and study materials. Our AI will help you understand and organize them better.',
    icon: Upload,
    highlight: { x: width - 100, y: height - 80, width: 80, height: 80 },
  },
];

export default function OnboardingOverlay() {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(true);
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const highlightPosition = useSharedValue({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    highlightPosition.value = steps[currentStep].highlight;
  }, [currentStep]);

  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  const highlightStyle = useAnimatedStyle(() => {
    return {
      left: withSpring(highlightPosition.value.x),
      top: withSpring(highlightPosition.value.y),
      width: withSpring(highlightPosition.value.width),
      height: withSpring(highlightPosition.value.height),
    };
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    opacity.value = withTiming(0, { duration: 500 });
    scale.value = withTiming(0.8, { duration: 500 });
    await AsyncStorage.setItem('onboardingComplete', 'true');
    setTimeout(() => setVisible(false), 500);
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!visible) return null;

  const Step = steps[currentStep];
  const StepIcon = Step.icon;

  return (
    <Animated.View style={[styles.container, overlayStyle]}>
      <Animated.View
        style={[
          styles.highlight,
          highlightStyle,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
        ]}
      />
      
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
        >
          <X size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>

        <View style={styles.stepIndicator}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: currentStep === index
                    ? (isDark ? '#fff' : '#000')
                    : (isDark ? '#555' : '#ccc'),
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.iconContainer}>
          <StepIcon
            size={64}
            color={isDark ? '#fff' : '#000'}
            strokeWidth={1.5}
          />
        </View>

        <ThemedText type="title" style={styles.title}>
          {Step.title}
        </ThemedText>
        
        <ThemedText type="body" style={styles.description}>
          {Step.description}
        </ThemedText>

        <TouchableOpacity
          style={[
            styles.nextButton,
            { backgroundColor: isDark ? '#fff' : '#000' },
          ]}
          onPress={handleNext}
        >
          <ThemedText style={[
            styles.nextButtonText,
            { color: isDark ? '#000' : '#fff' },
          ]}>
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          </ThemedText>
          <ChevronRight
            size={20}
            color={isDark ? '#000' : '#fff'}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Platform.select({
      ios: 'rgba(0,0,0,0.7)',
      android: 'rgba(0,0,0,0.7)',
      web: 'rgba(0,0,0,0.9)',
    }),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  highlight: {
    position: 'absolute',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  content: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: Platform.select({
      ios: 'rgba(255,255,255,0.95)',
      android: 'rgba(255,255,255,0.95)',
      web: '#fff',
    }),
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  skipButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  stepIndicator: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});