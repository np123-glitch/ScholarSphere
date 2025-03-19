import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Easing,
  ActivityIndicator,
  Alert,
  ScrollView,
  useColorScheme
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Send, RotateCw } from 'lucide-react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuthSession } from '@/components/AuthProvider';
import Config from '@/components/Config';

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
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const { token, signOut } = useAuthSession();
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [savedFlashcards, setSavedFlashcards] = useState<FlashcardSet[]>([]);
  const [selectedSavedSet, setSelectedSavedSet] = useState<FlashcardSet | null>(null);

  // Animation states
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const baseUrl = Config.API_BASE_URL;

  const flipCard = () => {
    if (isFlipping) return;
    setIsFlipping(true);

    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start(() => {
      setIsFlipped(!isFlipped);
      setIsFlipping(false);
    });
  };

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
          message: `Generate ${count} flashcards about '${topic}'. Each flashcard must be on its own line, using the exact format: [question]:[answer]. For example: [What is a tree?]:[A perennial plant with a trunk, branches, and leaves]. Do not include any numbering, bullet points, or extra text. Ensure there are no spaces before or after the colon (':'). Remember, these are flashcards so they must be quick and easy to memorize like vocab and short terms and something that is an obvious answer.`,
        }),
      });

      const result = await response.json();

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
          .filter(Boolean) as Flashcard[];

        setFlashcards(flashcardsArray);
        setCurrentCardIndex(0);
        flipAnim.setValue(0);
        setIsFlipped(false);

        const newSet: FlashcardSet = {
          id: Date.now().toString(),
          topic: topic.trim(),
          count,
          createdAt: new Date().toISOString(),
          flashcards: flashcardsArray,
        };

        setSavedFlashcards(prev => [newSet, ...prev]);
      } else {
        if (result.message === 'Token has expired!') {
          Alert.alert(
            'Session Expired',
            'Your session has expired. Please log out and log in again.',
            [{ text: 'OK', onPress: () => signOut() }]
          );
        } else {
          Alert.alert('Error', result.message);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred while generating flashcards.');
    } finally {
      setLoading(false);
    }
  };

  const currentCard = flashcards[currentCardIndex] || { question: '', answer: '' };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          Flashcards
        </ThemedText>
        <View style={{ width: 24 }} />
      </View>

      {/* Topic Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            isDark ? styles.inputDark : styles.inputLight
          ]}
          placeholder="Enter topic (e.g., World War II)"
          placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          value={topic}
          onChangeText={setTopic}
        />
        <TouchableOpacity 
          style={[
            styles.generateButton,
            isDark ? styles.buttonDark : styles.buttonLight
          ]}
          onPress={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <RotateCw size={20} color="#fff" />
              <ThemedText type="body" style={styles.buttonText}>
                Generate
              </ThemedText>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Flashcard */}
      {flashcards.length > 0 && (
        <View style={styles.cardContainer}>
          <ThemedText type="body" style={styles.counter}>
            Card {currentCardIndex + 1} of {flashcards.length}
          </ThemedText>
          
          <TouchableOpacity onPress={flipCard} activeOpacity={0.9}>
            <View style={styles.cardWrapper}>
              <Animated.View
                style={[
                  styles.card,
                  isDark ? styles.cardDark : styles.cardLight,
                  frontAnimatedStyle,
                  styles.cardFront
                ]}
              >
                <ThemedText type="title" style={styles.cardText}>
                  {currentCard.question}
                </ThemedText>
              </Animated.View>
              <Animated.View
                style={[
                  styles.card,
                  isDark ? styles.cardDark : styles.cardLight,
                  backAnimatedStyle,
                  styles.cardBack
                ]}
              >
                <ThemedText type="title" style={styles.cardText}>
                  {currentCard.answer}
                </ThemedText>
              </Animated.View>
            </View>
          </TouchableOpacity>

          <View style={styles.navigation}>
            <TouchableOpacity 
              style={[
                styles.navButton,
                isDark ? styles.buttonDark : styles.buttonLight,
                currentCardIndex === 0 && styles.buttonDisabled
              ]}
              onPress={() => {
                if (currentCardIndex > 0) {
                  setCurrentCardIndex(prev => prev - 1);
                  flipAnim.setValue(0);
                  setIsFlipped(false);
                }
              }}
              disabled={currentCardIndex === 0}
            >
              <ThemedText type="body" style={styles.buttonText}>
                Previous
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.navButton,
                isDark ? styles.buttonDark : styles.buttonLight,
                currentCardIndex === flashcards.length - 1 && styles.buttonDisabled
              ]}
              onPress={() => {
                if (currentCardIndex < flashcards.length - 1) {
                  setCurrentCardIndex(prev => prev + 1);
                  flipAnim.setValue(0);
                  setIsFlipped(false);
                }
              }}
              disabled={currentCardIndex === flashcards.length - 1}
            >
              <ThemedText type="body" style={styles.buttonText}>
                Next
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Saved Flashcards */}
      <ScrollView style={styles.savedSection}>
        <ThemedText type="subtitle" style={styles.savedTitle}>
          Saved Flashcard Sets
        </ThemedText>
        {savedFlashcards.map((set) => (
          <TouchableOpacity
            key={set.id}
            style={[
              styles.savedSetItem,
              isDark ? styles.savedSetItemDark : styles.savedSetItemLight
            ]}
            onPress={() => {
              setFlashcards(set.flashcards);
              setCurrentCardIndex(0);
              flipAnim.setValue(0);
              setIsFlipped(false);
            }}
          >
            <View>
              <ThemedText type="body" style={styles.savedSetTitle}>
                {set.topic}
              </ThemedText>
              <ThemedText type="body" style={styles.savedSetDetails}>
                {set.count} cards • {new Date(set.createdAt).toLocaleDateString()}
              </ThemedText>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 60
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600'
  },
  inputContainer: {
    gap: 12,
    marginBottom: 32
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16
  },
  inputLight: {
    backgroundColor: '#F3F4F6',
    color: '#1F2937'
  },
  inputDark: {
    backgroundColor: '#374151',
    color: '#F9FAFB'
  },
  generateButton: {
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  buttonLight: {
    backgroundColor: '#4F46E5'
  },
  buttonDark: {
    backgroundColor: '#6366F1'
  },
  buttonDisabled: {
    opacity: 0.5
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  cardContainer: {
    alignItems: 'center',
    marginBottom: 24
  },
  counter: {
    marginBottom: 16,
    fontSize: 16,
    opacity: 0.7
  },
  cardWrapper: {
    width: 300,
    height: 200,
    marginBottom: 24
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute'
  },
  cardLight: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  cardDark: {
    backgroundColor: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4
  },
  cardFront: {
    backfaceVisibility: 'hidden'
  },
  cardBack: {
    backfaceVisibility: 'hidden'
  },
  cardText: {
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 24
  },
  navigation: {
    flexDirection: 'row',
    gap: 12,
    width: '100%'
  },
  navButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  savedSection: {
    flex: 1
  },
  savedTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16
  },
  savedSetItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12
  },
  savedSetItemLight: {
    backgroundColor: '#F3F4F6'
  },
  savedSetItemDark: {
    backgroundColor: '#374151'
  },
  savedSetTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  savedSetDetails: {
    fontSize: 14,
    opacity: 0.7
  }
});