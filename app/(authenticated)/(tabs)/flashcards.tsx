import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  ActivityIndicator,
  Alert,
  ScrollView,
  useColorScheme,
  Keyboard,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ArrowLeft, RotateCw, ChevronDown, ChevronUp } from 'lucide-react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuthSession } from '@/components/AuthProvider';
import Config from '@/components/Config';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

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
  const [isInputExpanded, setIsInputExpanded] = useState(true);
  
  // Animation states for flip
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const baseUrl = Config.API_BASE_URL;

  // Load saved flashcard sets from AsyncStorage on mount
  useEffect(() => {
    const loadSavedSets = async () => {
      try {
        const stored = await AsyncStorage.getItem('savedFlashcardSets');
        if (stored) {
          setSavedFlashcards(JSON.parse(stored));
        }
      } catch (err) {
        console.error('Failed to load saved flashcard sets:', err);
      }
    };
    loadSavedSets();
  }, []);

  const toggleInputSection = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsInputExpanded(!isInputExpanded);
  };

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
    Keyboard.dismiss();

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
        setIsInputExpanded(false);

        const newSet: FlashcardSet = {
          id: Date.now().toString(),
          topic: topic.trim(),
          count,
          createdAt: new Date().toISOString(),
          flashcards: flashcardsArray,
        };

        const updatedSavedSets = [newSet, ...savedFlashcards];
        setSavedFlashcards(updatedSavedSets);
        await AsyncStorage.setItem('savedFlashcardSets', JSON.stringify(updatedSavedSets));
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

  const loadSavedSet = (set: FlashcardSet) => {
    setFlashcards(set.flashcards);
    setCurrentCardIndex(0);
    flipAnim.setValue(0);
    setIsFlipped(false);
    setIsInputExpanded(false);
  };

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
        <TouchableOpacity onPress={toggleInputSection}>
          {isInputExpanded ? (
            <ChevronUp size={24} color={isDark ? '#fff' : '#000'} />
          ) : (
            <ChevronDown size={24} color={isDark ? '#fff' : '#000'} />
          )}
        </TouchableOpacity>
      </View>

      {/* Collapsible Input Section */}
      {isInputExpanded && (
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
            placeholder="Enter topic (e.g., World War II)"
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            value={topic}
            onChangeText={setTopic}
          />
          <View style={styles.settingsRow}>
            <View style={[styles.settingItem, isDark ? styles.settingItemDark : styles.settingItemLight]}>
              <ThemedText type="body" style={styles.settingLabel}>
                Number of Flashcards: {count}
              </ThemedText>
              <View style={styles.settingControls}>
                <TouchableOpacity
                  style={[styles.controlButton, isDark ? styles.controlButtonDark : styles.controlButtonLight]}
                  onPress={() => setCount(Math.max(1, count - 1))}
                >
                  <ThemedText type="body" style={styles.controlText}>-</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.controlButton, isDark ? styles.controlButtonDark : styles.controlButtonLight]}
                  onPress={() => setCount(Math.min(20, count + 1))}
                >
                  <ThemedText type="body" style={styles.controlText}>+</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.generateButton, isDark ? styles.buttonDark : styles.buttonLight]}
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
      )}

      {/* Flashcard Display */}
      {flashcards.length > 0 && (
        <View style={[styles.cardContainer, !isInputExpanded && styles.cardContainerExpanded]}>
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

      {/* Saved Flashcard Sets */}
      <ScrollView style={[styles.savedSection, !isInputExpanded && styles.savedSectionExpanded]}>
        <ThemedText type="subtitle" style={styles.savedTitle}>
          Saved Flashcard Sets
        </ThemedText>
        {savedFlashcards.map((set) => (
          <TouchableOpacity
            key={set.id}
            style={[styles.savedSetItem, isDark ? styles.savedSetItemDark : styles.savedSetItemLight]}
            onPress={() => loadSavedSet(set)}
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
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  inputContainer: {
    gap: 12,
    marginBottom: 32,
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  inputLight: {
    backgroundColor: '#F3F4F6',
    color: '#1F2937',
  },
  inputDark: {
    backgroundColor: '#374151',
    color: '#F9FAFB',
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  settingItem: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
  },
  settingItemLight: {
    backgroundColor: '#F3F4F6',
  },
  settingItemDark: {
    backgroundColor: '#374151',
  },
  settingLabel: {
    marginBottom: 8,
    fontSize: 14,
  },
  settingControls: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonLight: {
    backgroundColor: '#E5E7EB',
  },
  controlButtonDark: {
    backgroundColor: '#4B5563',
  },
  controlText: {
    fontSize: 18,
    fontWeight: '600',
  },
  generateButton: {
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonLight: {
    backgroundColor: '#4F46E5',
  },
  buttonDark: {
    backgroundColor: '#6366F1',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cardContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  cardContainerExpanded: {
    marginTop: 16,
  },
  counter: {
    marginBottom: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  cardWrapper: {
    width: 300,
    height: 200,
    marginBottom: 24,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  cardLight: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardDark: {
    backgroundColor: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  cardFront: {
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    backfaceVisibility: 'hidden',
  },
  cardText: {
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 24,
  },
  navigation: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  navButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedSection: {
    flex: 1,
  },
  savedSectionExpanded: {
    marginTop: -8,
  },
  savedTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  savedSetItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  savedSetItemLight: {
    backgroundColor: '#F3F4F6',
  },
  savedSetItemDark: {
    backgroundColor: '#374151',
  },
  savedSetTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  savedSetDetails: {
    fontSize: 14,
    opacity: 0.7,
  },
});