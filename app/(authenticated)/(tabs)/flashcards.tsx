// src/screens/FlashcardsScreen.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Alert,
  TouchableWithoutFeedback, // Import TouchableWithoutFeedback
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import Config from '@/components/Config';
import { useAuthSession } from '@/components/AuthProvider';

interface Flashcard {
  question: string;
  answer: string;
}

interface FlashcardSet {
  id: string;
  topic: string;
  count: number;
  createdAt: string;
  flashcards: Flashcard[];
}

export default function FlashcardsScreen() {
  const { token, isLoading: authLoading } = useAuthSession();
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [savedFlashcards, setSavedFlashcards] = useState<FlashcardSet[]>([]);
  const [selectedSavedSet, setSelectedSavedSet] = useState<FlashcardSet | null>(null);

  const colorScheme = useColorScheme() || 'light';
  const isDarkMode = colorScheme === 'dark';
  const baseUrl = Config.API_BASE_URL;

  // 3D flip animation value
  const flipAnim = useRef(new Animated.Value(0)).current;

  // State to prevent multiple simultaneous flips
  const [isFlipping, setIsFlipping] = useState(false);

  // Track whether the card is showing front or back
  const [isFront, setIsFront] = useState(true);

  // Load saved flashcards when component mounts
  useEffect(() => {
    loadSavedFlashcards();
  }, []);

  // Function to load saved flashcards from AsyncStorage
  const loadSavedFlashcards = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@flashcard_sets');
      if (jsonValue != null) {
        const sets: FlashcardSet[] = JSON.parse(jsonValue);
        setSavedFlashcards(sets);
      }
    } catch (e) {
      console.error('Failed to load flashcard sets:', e);
    }
  };

  // Function to save flashcard sets to AsyncStorage
  const saveFlashcardSets = async (sets: FlashcardSet[]) => {
    try {
      const jsonValue = JSON.stringify(sets);
      await AsyncStorage.setItem('@flashcard_sets', jsonValue);
    } catch (e) {
      console.error('Failed to save flashcard sets:', e);
    }
  };

  // Handle flipping animation
  const flipCard = () => {
    if (isFlipping) return; // Prevent flip if already animating
    setIsFlipping(true);

    Animated.spring(flipAnim, {
      toValue: isFront ? 180 : 0,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start(() => {
      setIsFront(!isFront);
      setIsFlipping(false);
    });
  };

  // Interpolate flipAnim from 0→180 into 0deg→180deg for the front
  const frontAnimatedStyle = {
    transform: [
      {
        rotateY: flipAnim.interpolate({
          inputRange: [0, 180],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
  };

  // Interpolate flipAnim from 0→180 into 180deg→360deg for the back
  const backAnimatedStyle = {
    transform: [
      {
        rotateY: flipAnim.interpolate({
          inputRange: [0, 180],
          outputRange: ['180deg', '360deg'],
        }),
      },
    ],
  };

  // Handle generating flashcards
  const handleGenerate = async () => {
    if (!topic.trim()) {
      Alert.alert('Validation Error', 'Please enter a topic.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(baseUrl + '/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.current}`,
        },
        body: JSON.stringify({
          message: `Generate ${count} flashcards about '${topic}'. Each flashcard must be on its own line, using the exact format: [question]:[answer]. For example: [What is a tree?]:[A perennial plant with a trunk, branches, and leaves]. Do not include any numbering, bullet points, or extra text. Ensure there are no spaces before or after the colon (':').`,
        }),
      });

      const result = await response.json();
      console.log('Raw response from server:', result.response);
      if (!response.ok) {
              // Handle different types of errors
              let errorMessage = result.message || result.error || 'Something went wrong!';
      
              if (response.status === 401) {
                errorMessage = 'Unauthorized! Please log in again.';
              } else if (response.status === 500) {
                errorMessage = 'Server error! Please try again later.';
              }
      
              console.error('Error:', errorMessage);
              Alert.alert('Error', errorMessage);
            }
      if (response.ok) {
        const lines = result.response.split('\n');

        const flashcardsArray: Flashcard[] = lines
          .map((line) => {
            const trimmed = line.trim();
            if (!trimmed) return null;

            const markerIndex = trimmed.indexOf(']:[');
            if (markerIndex === -1) return null;

            const questionPart = trimmed.slice(0, markerIndex + 1);
            const answerPart = trimmed.slice(markerIndex + 3);

            const question = questionPart.replace(/[\[\]]/g, '').trim();
            const answer = answerPart.replace(/[\[\]]/g, '').trim();

            return { question, answer };
          })
          .filter(Boolean) as Flashcard[];

        setFlashcards(flashcardsArray);
        setCurrentCardIndex(0);
        // Reset flip animation
        flipAnim.setValue(0);
        setIsFront(true);

        // Save the generated flashcards as a new set
        const newSet: FlashcardSet = {
          id: Date.now().toString(),
          topic: topic.trim(),
          count,
          createdAt: new Date().toISOString(),
          flashcards: flashcardsArray,
        };

        const updatedSets = [newSet, ...savedFlashcards];
        setSavedFlashcards(updatedSets);
        await saveFlashcardSets(updatedSets);
      } else {
        console.error('Failed to generate flashcards:', result.error || 'Unknown error');
        Alert.alert('Generation Error', result.error || 'Failed to generate flashcards.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An unexpected error occurred while generating flashcards.');
    } finally {
      setLoading(false);
    }
  };

  // Handle navigating to the next flashcard
  const handleNextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
      // Reset flip animation
      flipAnim.setValue(0);
      setIsFront(true);
    }
  };

  // Handle navigating to the previous flashcard
  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
      // Reset flip animation
      flipAnim.setValue(0);
      setIsFront(true);
    }
  };

  // Handle selecting a saved flashcard set
  const handleSelectSavedSet = (set: FlashcardSet) => {
    setSelectedSavedSet(set);
    setFlashcards(set.flashcards);
    setCurrentCardIndex(0);
    // Reset flip animation
    flipAnim.setValue(0);
    setIsFront(true);
  };

  // Handle deleting a saved flashcard set
  const handleDeleteSavedSet = (setId: string) => {
    Alert.alert(
      'Delete Flashcard Set',
      'Are you sure you want to delete this flashcard set?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedSets = savedFlashcards.filter((set) => set.id !== setId);
            setSavedFlashcards(updatedSets);
            await saveFlashcardSets(updatedSets);
            // If the deleted set was selected, reset the current flashcards
            if (selectedSavedSet?.id === setId) {
              setSelectedSavedSet(null);
              setFlashcards([]);
              setCurrentCardIndex(0);
              // Reset flip animation
              flipAnim.setValue(0);
              setIsFront(true);
            }
          },
        },
      ]
    );
  };

  const currentCard = flashcards[currentCardIndex] || { question: '', answer: '' };

  return (
    <ParallaxScrollView>
      <ThemedView>
        <ThemedText type="title" style={styles.title}>
          Flashcards Generator
        </ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>
                  Example: "Absolutism keywords" or "Beginning of Absolutism"
        </ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>
                  Remember to only ask questions on notes you have uploaded
        </ThemedText>
        <TextInput
          style={[styles.input, isDarkMode ? styles.inputDark : {}]}
          value={topic}
          onChangeText={setTopic}
          placeholder="Enter topic"
          placeholderTextColor={isDarkMode ? '#aaa' : '#555'}
        />

        <Picker
          selectedValue={String(count)}
          style={[styles.picker, isDarkMode ? styles.pickerDark : {}]}
          onValueChange={(itemValue) => setCount(Number(itemValue))}
        >
          {[...Array(20).keys()].map((num) => (
            <Picker.Item
              key={num + 1}
              label={`${num + 1} flashcards`}
              value={`${num + 1}`}
            />
          ))}
        </Picker>

        <TouchableOpacity
          style={[styles.generateButton, isDarkMode ? styles.generateButtonDark : {}]}
          onPress={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Generate Flashcards</Text>
          )}
        </TouchableOpacity>
      </ThemedView>

      {/* Saved Flashcards Section */}
      <ThemedView style={styles.savedSection}>
        <ThemedText type="subtitle" style={styles.savedTitle}>
          Saved Flashcard Sets
        </ThemedText>
        {savedFlashcards.length === 0 ? (
          <Text style={[styles.noSavedText, isDarkMode ? { color: '#fff' } : {}]}>
            No saved flashcard sets.
          </Text>
        ) : (
          savedFlashcards.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.savedSetItem,
                isDarkMode ? styles.savedSetItemDark : {},
              ]}
              onPress={() => handleSelectSavedSet(item)}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.savedSetTitle, isDarkMode ? { color: '#fff' } : {}]}>
                  {item.topic}
                </Text>
                <Text style={[styles.savedSetDetails, isDarkMode ? { color: '#ccc' } : {}]}>
                  {item.count} flashcards • {new Date(item.createdAt).toLocaleString()}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDeleteSavedSet(item.id)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ThemedView>

      {/* Flashcards Display Section */}
      {flashcards.length > 0 && (
        <View style={styles.cardContainer}>
          <Text style={[styles.counterText, isDarkMode ? { color: '#fff' } : {}]}>
            Card {currentCardIndex + 1} of {flashcards.length}
          </Text>

          {/* Wrap the entire flashcard with TouchableWithoutFeedback */}
          <TouchableWithoutFeedback onPress={flipCard}>
            <View style={styles.flipCardContainer}>
              {/* Front Side */}
              <Animated.View
                style={[
                  styles.card,
                  isDarkMode ? styles.cardDark : {},
                  frontAnimatedStyle,
                  {
                    backfaceVisibility: 'hidden',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                  },
                ]}
              >
                <Text
                  style={[styles.cardText, isDarkMode ? styles.cardTextDark : {}]}
                >
                  {currentCard.question}
                </Text>
              </Animated.View>

              {/* Back Side */}
              <Animated.View
                style={[
                  styles.card,
                  isDarkMode ? styles.cardDark : {},
                  styles.cardBack,
                  backAnimatedStyle,
                  {
                    backfaceVisibility: 'hidden',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                  },
                ]}
              >
                <Text
                  style={[styles.cardText, isDarkMode ? styles.cardTextDark : {}]}
                >
                  {currentCard.answer}
                </Text>
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>

          <View style={styles.navButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.navButton,
                isDarkMode ? styles.navButtonDark : {},
                { marginRight: 8 },
              ]}
              onPress={handlePrevCard}
              disabled={currentCardIndex <= 0}
            >
              <Text style={styles.navButtonText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navButton, isDarkMode ? styles.navButtonDark : {}]}
              onPress={handleNextCard}
              disabled={currentCardIndex >= flashcards.length - 1}
            >
              <Text style={styles.navButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    marginVertical: 16,
    fontSize: 32,
    fontWeight: 'bold',
  },
  input: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    backgroundColor: '#f0f0f0',
  },
  inputDark: {
    borderColor: '#555',
    backgroundColor: '#555',
    color: '#fff',
  },
  picker: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  pickerDark: {
    color: '#fff',
  },
  generateButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  generateButtonDark: {
    backgroundColor: '#0056b3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#333',
  },
  cardContainer: {
    padding: 16,
    alignItems: 'center',
  },
  counterText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  flipCardContainer: {
    width: 250,
    height: 180,
    marginBottom: 16,
    // To make sure the flip works correctly on Android
    backfaceVisibility: 'hidden',
  },
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    backfaceVisibility: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    // Removed position: 'absolute' as it's handled in component
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#444',
    shadowColor: '#000',
  },
  cardBack: {
    // rotateY is handled by backAnimatedStyle
  },
  cardText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  cardTextDark: {
    color: '#fff',
  },
  navButtonsContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  navButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  navButtonDark: {
    backgroundColor: '#218838',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  savedSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  savedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noSavedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 8,
  },
  savedSetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    marginBottom: 8,
  },
  savedSetItemDark: {
    backgroundColor: '#333',
  },
  savedSetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  savedSetDetails: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    color: '#dc3545',
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginVertical: 0,
    paddingBottom: 16,
    fontSize: 16, // Added for better readability
    color: '#666', // Default color
  },
});
