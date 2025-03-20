import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useAuthSession } from '@/components/AuthProvider';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ArrowLeft, Send, MessageSquare, Star, ThumbsUp, ThumbsDown } from 'lucide-react-native';
import Config from '@/components/Config';

interface FeedbackResponse {
  message: string;
}

type FeedbackType = 'general' | 'bug' | 'feature' | 'content';

export default function FeedbackPage() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const { token } = useAuthSession();

  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<FeedbackType>('general');
  const [rating, setRating] = useState<number>(0);

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const feedbackTypes: { type: FeedbackType; label: string; icon: any }[] = [
    { type: 'general', label: 'General', icon: MessageSquare },
    { type: 'bug', label: 'Bug Report', icon: ThumbsDown },
    { type: 'feature', label: 'Feature Request', icon: Star },
    { type: 'content', label: 'Content', icon: ThumbsUp },
  ];

  const submitFeedback = async () => {
    if (feedback.trim() === '') {
      Alert.alert('Validation Error', 'Please enter your feedback before submitting.');
      return;
    }

    try {
      setSubmitting(true);

      const response = await axios.post<FeedbackResponse>(
        `${Config.API_BASE_URL}/feedback`,
        {
          feedback: feedback.trim(),
          type: selectedType,
          rating,
        },
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      Alert.alert(
        'Thank You! 🎉',
        'Your feedback helps us improve ScholarSphere for everyone.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Error', 'Failed to submit feedback. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  const AnimatedTypeButton = ({
    type,
    label,
    icon: Icon,
  }: {
    type: FeedbackType;
    label: string;
    icon: any;
  }) => {
    const isSelected = selectedType === type;
    const iconColor = isSelected ? '#fff' : isDark ? '#9CA3AF' : '#6B7280';

    return (
      <TouchableOpacity
        style={[
          styles.typeButton,
          isDark ? styles.typeButtonDark : styles.typeButtonLight,
          isSelected && styles.typeButtonSelected,
        ]}
        onPress={() => setSelectedType(type)}
      >
        <Icon size={20} color={iconColor} />
        <ThemedText
          type="body"
          style={[
            styles.typeButtonText,
            isSelected && styles.typeButtonTextSelected,
          ]}
        >
          {label}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ThemedView
        style={[
          styles.container,
          isDark ? styles.containerDark : styles.containerLight,
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.headerTitle}>
            Send Feedback
          </ThemedText>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Feedback Type Selection */}
            <View style={styles.typeContainer}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                What type of feedback do you have?
              </ThemedText>
              <View style={styles.typeButtonsGrid}>
                {feedbackTypes.map((item) => (
                  <AnimatedTypeButton
                    key={item.type}
                    type={item.type}
                    label={item.label}
                    icon={item.icon}
                  />
                ))}
              </View>
            </View>

            {/* Rating */}
            <View style={styles.ratingContainer}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                How would you rate your experience?
              </ThemedText>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    style={styles.starButton}
                  >
                    <Star
                      size={32}
                      fill={star <= rating ? '#FCD34D' : 'transparent'}
                      color={
                        star <= rating
                          ? '#FCD34D'
                          : isDark
                          ? '#4B5563'
                          : '#D1D5DB'
                      }
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Feedback Input */}
            <View style={styles.inputContainer}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Tell us more...
              </ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  isDark ? styles.textInputDark : styles.textInputLight,
                ]}
                placeholder="Share your thoughts..."
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                multiline
                numberOfLines={6}
                value={feedback}
                onChangeText={setFeedback}
                editable={!submitting}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                isDark ? styles.submitButtonDark : styles.submitButtonLight,
                submitting && styles.submitButtonDisabled,
              ]}
              onPress={submitFeedback}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Send size={20} color="#fff" />
                  <ThemedText style={styles.submitButtonText}>
                    Submit Feedback
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  containerLight: {
    backgroundColor: '#F9FAFB',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  content: {
    padding: 20,
    gap: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  typeContainer: {
    marginBottom: 24,
  },
  typeButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    flex: 1,
    minWidth: '45%',
    borderWidth: 2, // added for more visibility
    borderColor: 'transparent',
  },
  typeButtonLight: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  typeButtonDark: {
    backgroundColor: '#1F2937',
  },
  typeButtonSelected: {
    backgroundColor: '#3B82F6', // A bolder color for the selected state
    borderColor: '#fff', // Make the border visible
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  typeButtonTextSelected: {
    color: '#fff',
  },
  ratingContainer: {
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  starButton: {
    padding: 8,
  },
  inputContainer: {
    marginBottom: 24,
  },
  textInput: {
    borderRadius: 12,
    padding: 16,
    height: 150,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  textInputLight: {
    backgroundColor: '#fff',
    color: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textInputDark: {
    backgroundColor: '#1F2937',
    color: '#fff',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonLight: {
    backgroundColor: '#4F46E5',
  },
  submitButtonDark: {
    backgroundColor: '#6366F1',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
