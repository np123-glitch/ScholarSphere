import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import Config from '@/components/Config';
import { useAuthSession } from '@/components/AuthProvider';

export default function FlashcardsScreen() {
  const { token, isLoading: authLoading } = useAuthSession();
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);
  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  // Whether we show the answer side (true) or the question side (false)
  const [showAnswer, setShowAnswer] = useState(false);
  // Loading state for showing the progress bar
  const [loading, setLoading] = useState(false);

  const colorScheme = useColorScheme() || 'light';
  const isDarkMode = colorScheme === 'dark';
  const baseUrl = Config.API_BASE_URL;


  // 3D flip animation value
  const flipAnim = useRef(new Animated.Value(0)).current;
  // Keep track of which side is currently facing the user
  const [isFront, setIsFront] = useState(true);

  // Handle flipping animation
  const flipCard = () => {
    const toValue = isFront ? 1 : 0;
    // Animate from front to back or back to front
    Animated.spring(flipAnim, {
      toValue,
      friction: 8,
      useNativeDriver: true,
    }).start(() => {
      // Once animation ends, toggle front/back state
      setIsFront(!isFront);
      // Also toggle whether we’re showing the answer text or not
      setShowAnswer(!showAnswer);
    });
  };

  // Interpolate flipAnim from 0→1 into 0deg→180deg for the front
  const frontAnimatedStyle = {
    transform: [
      {
        rotateY: flipAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
  };

  // Interpolate flipAnim from 0→1 into 180deg→360deg for the back
  const backAnimatedStyle = {
    transform: [
      {
        rotateY: flipAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['180deg', '360deg'],
        }),
      },
    ],
  };

  const handleGenerate = async () => {
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

      if (response.ok) {
        const lines = result.response.split('\n');

        const flashcardsArray = lines
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
          .filter(Boolean);

        setFlashcards(flashcardsArray);
        setCurrentCardIndex(0);
        setShowAnswer(false);
        flipAnim.setValue(0);
        setIsFront(true);
      } else {
        console.error('Failed to generate flashcards:', result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
      flipAnim.setValue(0);
      setIsFront(true);
      setShowAnswer(false);
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
      flipAnim.setValue(0);
      setIsFront(true);
      setShowAnswer(false);
    }
  };

  const currentCard = flashcards[currentCardIndex] || { question: '', answer: '' };

  return (
    <ParallaxScrollView>
      <ThemedView>
        <ThemedText type="title" style={styles.title}>
          Flashcards Generator
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

      {flashcards.length > 0 && (
        <View style={styles.cardContainer}>
          <Text style={[styles.counterText, isDarkMode ? { color: '#fff' } : {}]}>
            Card {currentCardIndex + 1} of {flashcards.length}
          </Text>

          <View style={styles.flipCardContainer}>
            <Animated.View
              style={[
                styles.card,
                isDarkMode ? styles.cardDark : {},
                frontAnimatedStyle,
                { zIndex: isFront ? 1 : 0 }, 
              ]}
            >
              <Text
                style={[styles.cardText, isDarkMode ? styles.cardTextDark : {}]}
                onPress={flipCard}
              >
                {currentCard.question}
              </Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.card,
                isDarkMode ? styles.cardDark : {},
                styles.cardBack,
                backAnimatedStyle,
                { zIndex: isFront ? 0 : 1 },
              ]}
            >
              <Text
                style={[styles.cardText, isDarkMode ? styles.cardTextDark : {}]}
                onPress={flipCard}
              >
                {currentCard.answer}
              </Text>
            </Animated.View>
          </View>

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
  },
  generateButtonDark: {
    backgroundColor: '#0056b3',
  },
  generateButtonText: {
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
  },
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    backfaceVisibility: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
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
    transform: [{ rotateY: '180deg' }],
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
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
