// src/screens/FeedbackPage.tsx

import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useAuthSession } from '@/components/AuthProvider';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Config from '@/components/Config';

interface FeedbackResponse {
  message: string;
  // Add other fields based on your API response
}

export default function FeedbackPage() {
  const router = useRouter();
  const systemColorScheme = useColorScheme() || 'light';
  const isDarkMode = systemColorScheme === 'dark';
  const { token } = useAuthSession();

  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const apiUrl = Config.API_BASE_URL;

  const submitFeedback = async () => {
    if (feedback.trim() === '') {
      Alert.alert('Validation Error', 'Please enter your feedback before submitting.');
      return;
    }

    try {
      setSubmitting(true);

      const response = await axios.post<FeedbackResponse>(
        `${apiUrl}/feedback`,
        { feedback: feedback.trim() },
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token.current}`, // Include JWT
          },
        }
      );

      console.log('Feedback Submitted:', response.data);
      Alert.alert('Thank you for your feedback!', response.data.message);
      setFeedback('');
      router.back(); // Navigate back after successful submission
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      Alert.alert(
                  'Session Expired',
                  'Your session has expired. Please log out and log in again.',
                  [
                    {
                      text: 'OK',
                      
                    },
                  ]
                );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ThemedView
        style={[
          styles.container,
          isDarkMode ? styles.containerDark : styles.containerLight,
        ]}
      >
        {/* Header with Back Icon and Title */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backIcon}
            onPress={() => router.back()}
            accessibilityLabel="Go Back"
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDarkMode ? '#fff' : '#000'}
            />
          </TouchableOpacity>

          <ThemedText
            type="title"
            style={[styles.headerTitle, isDarkMode ? { color: '#fff' } : {}]}
          >
            Feedback
          </ThemedText>

          <View style={styles.placeholder} />
        </View>

        {/* Feedback Form */}
        <View style={styles.formContainer}>
          <ThemedText
            type="body"
            style={[styles.label, isDarkMode ? { color: '#fff' } : {}]}
          >
            We value your feedback! Let us know how we're doing or how we can improve.
          </ThemedText>
          <TextInput
            style={[
              styles.textInput,
              isDarkMode ? styles.textInputDark : styles.textInputLight,
            ]}
            placeholder="Enter your feedback here..."
            placeholderTextColor={isDarkMode ? '#aaa' : '#555'}
            multiline
            numberOfLines={6}
            value={feedback}
            onChangeText={setFeedback}
            editable={!submitting}
          />
        </View>

        {/* Submit Button */}
        <View style={styles.submitButtonContainer}>
          <TouchableOpacity
            style={[styles.submitButton, isDarkMode ? styles.submitButtonDark : {}]}
            onPress={submitFeedback}
            disabled={submitting}
            accessibilityLabel="Submit Feedback"
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <MaterialIcons name="send" size={24} color="#fff" style={styles.buttonIcon} />
            )}
            <ThemedText
              type="body"
              style={[styles.submitButtonText, isDarkMode ? { color: '#fff' } : {}]}
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  //
  // ------------------- Main Container -------------------
  //
  container: {
    padding: 24,
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 60,
  },
  containerLight: {
    backgroundColor: '#f5f5f5',
  },
  containerDark: {
    backgroundColor: '#1e1e1e',
  },

  //
  // ------------------- Header -------------------
  //
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  backIcon: {
    padding: 5,
  },
  placeholder: {
    width: 24, // To balance the header layout
  },

  //
  // ------------------- Form -------------------
  //
  formContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    textAlignVertical: 'top',
    fontSize: 16,
    height: 150,
  },
  textInputLight: {
    backgroundColor: '#ffffff',
    borderColor: '#ccc',
    color: '#000',
  },
  textInputDark: {
    backgroundColor: '#333333',
    borderColor: '#555',
    color: '#fff',
  },

  //
  // ------------------- Submit Button -------------------
  //
  submitButtonContainer: {
    alignItems: 'center',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
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
  submitButtonDark: {
    backgroundColor: '#1e7e34',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  buttonIcon: {
    marginLeft: 12,
  },
});
