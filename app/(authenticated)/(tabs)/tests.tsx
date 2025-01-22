// src/screens/TestFlashcardScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  ScrollView,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import Config from '@/components/Config';
import { useAuthSession } from '@/components/AuthProvider';

type TestQuestion = {
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correctAnswer: keyof TestQuestion['options'];
};

type TestSet = {
  id: string;
  topic: string;
  difficulty: number;
  numQuestions: number;
  createdAt: string;
  questions: TestQuestion[];
};

export default function TestFlashcardScreen() {
  const { token, isLoading: authLoading } = useAuthSession();
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<number>(5);
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: keyof TestQuestion['options'] }>({});
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [savedTests, setSavedTests] = useState<TestSet[]>([]);
  const [selectedSavedTest, setSelectedSavedTest] = useState<TestSet | null>(null);

  const [recentTopics, setRecentTopics] = useState<string[]>([]);
  const [showRecentTopics, setShowRecentTopics] = useState<boolean>(false);

  const colorScheme = useColorScheme() || 'light';
  const isDarkMode = colorScheme === 'dark';
  const baseUrl = Config.API_BASE_URL;

  // Load saved tests and recent topics when component mounts
  useEffect(() => {
    loadSavedTests();
    loadRecentTopics();
  }, []);

  // Function to load saved tests from AsyncStorage
  const loadSavedTests = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@test_sets');
      if (jsonValue != null) {
        const sets: TestSet[] = JSON.parse(jsonValue);
        setSavedTests(sets);
      }
    } catch (e) {
      console.error('Failed to load test sets:', e);
    }
  };

  // Function to save test sets to AsyncStorage
  const saveTestSets = async (sets: TestSet[]) => {
    try {
      const jsonValue = JSON.stringify(sets);
      await AsyncStorage.setItem('@test_sets', jsonValue);
    } catch (e) {
      console.error('Failed to save test sets:', e);
    }
  };

  // Function to load recent topics from AsyncStorage
  const loadRecentTopics = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@recent_topics');
      if (jsonValue != null) {
        const topics: string[] = JSON.parse(jsonValue);
        setRecentTopics(topics);
      }
    } catch (e) {
      console.error('Failed to load recent topics:', e);
    }
  };

  // Function to save recent topics to AsyncStorage
  const saveRecentTopics = async (topics: string[]) => {
    try {
      const jsonValue = JSON.stringify(topics);
      await AsyncStorage.setItem('@recent_topics', jsonValue);
    } catch (e) {
      console.error('Failed to save recent topics:', e);
    }
  };

  // Function to add a topic to recent topics
  const addToRecentTopics = async (newTopic: string) => {
    let updatedTopics = [...recentTopics];
    // Remove the topic if it already exists
    updatedTopics = updatedTopics.filter((t) => t.toLowerCase() !== newTopic.toLowerCase());
    // Add the new topic to the front
    updatedTopics.unshift(newTopic);
    // Limit to 10 recent topics
    if (updatedTopics.length > 10) {
      updatedTopics = updatedTopics.slice(0, 10);
    }
    setRecentTopics(updatedTopics);
    await saveRecentTopics(updatedTopics);
  };

  const handleGenerateTest = async () => {
    if (!topic.trim()) {
      Alert.alert('Validation Error', 'Please enter a topic.');
      return;
    }

    setLoading(true);
    setIsSubmitted(false);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setSelectedSavedTest(null); // Reset selected saved test

    try {
      // Prompt for your backend
      const message = `
        Generate ${numQuestions} multiple-choice test questions about "${topic}"
        with difficulty level ${difficulty} on a scale of 1-10.
        Each question must be on its own line, using the exact format:
        [question:optionA:optionB:optionC:optionD:correctAnswer]
      `;

      const response = await fetch(baseUrl + '/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.current}`,
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      if (response.ok && data?.response) {
        // Parse each line to get question, options, and correct answer
        const lines = data.response
          .split('\n')
          .map((line: string) => line.trim())
          .filter(Boolean);

        const parsedQuestions: TestQuestion[] = lines
          .map((qLine: string) => {
            // Remove square brackets and numbering if present
            const innerText = qLine.replace(/^\d+\.\s*\[|\]$/g, '');
            // Split on ':'
            const parts = innerText.split(':');

            // Expect 6 parts: question, A, B, C, D, correctAnswer
            if (parts.length < 6) return null;
            const [questionText, optA, optB, optC, optD, rawCorrect] = parts;
            const correctAnswer = rawCorrect.trim().toUpperCase() as keyof TestQuestion['options'];

            // Validate correctAnswer
            if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) return null;

            return {
              question: questionText.trim(),
              options: {
                A: optA.trim(),
                B: optB.trim(),
                C: optC.trim(),
                D: optD.trim(),
              },
              correctAnswer,
            };
          })
          .filter(Boolean) as TestQuestion[];

        setQuestions(parsedQuestions);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setIsSubmitted(false);

        // Save the generated test as a new set
        const newSet: TestSet = {
          id: Date.now().toString(),
          topic: topic.trim(),
          difficulty,
          numQuestions,
          createdAt: new Date().toISOString(),
          questions: parsedQuestions,
        };

        const updatedSets = [newSet, ...savedTests];
        setSavedTests(updatedSets);
        await saveTestSets(updatedSets);

        // Add the topic to recent topics
        await addToRecentTopics(newSet.topic);
      } else {
        console.error('Failed to generate test:', data.error || 'Unknown error');
        Alert.alert('Generation Error', data.error || 'Failed to generate test.');
      }
    } catch (error) {
      console.error('Error generating test:', error);
      Alert.alert('Error', 'An unexpected error occurred while generating the test.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (option: keyof TestQuestion['options']) => {
    if (!isSubmitted) {
      setUserAnswers((prev) => ({
        ...prev,
        [currentQuestionIndex]: option,
      }));
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const renderScore = () => {
    if (!isSubmitted) return null;

    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });

    return (
      <View style={styles.scoreContainer}>
        <Text style={[styles.scoreText, isDarkMode ? { color: '#fff' } : {}]}>
          You scored {correctCount} / {questions.length}
        </Text>
      </View>
    );
  };

  // Handle selecting a saved test
  const handleSelectSavedTest = (set: TestSet) => {
    setSelectedSavedTest(set);
    setQuestions(set.questions);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setIsSubmitted(false);
  };

  // Handle deleting a saved test
  const handleDeleteSavedTest = (setId: string) => {
    Alert.alert(
      'Delete Test Set',
      'Are you sure you want to delete this test set?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedSets = savedTests.filter((set) => set.id !== setId);
            setSavedTests(updatedSets);
            await saveTestSets(updatedSets);
            // If the deleted set was selected, reset the current test
            if (selectedSavedTest?.id === setId) {
              setSelectedSavedTest(null);
              setQuestions([]);
              setCurrentQuestionIndex(0);
              setUserAnswers({});
              setIsSubmitted(false);
            }
          },
        },
      ]
    );
  };

  // Handle selecting a recent topic
  const handleSelectRecentTopic = (selectedTopic: string) => {
    setTopic(selectedTopic);
    setShowRecentTopics(false);
  };

  // Handle focus on topic TextInput
  const handleFocusTopic = () => {
    setShowRecentTopics(true);
  };

  // Handle blur on topic TextInput
  const handleBlurTopic = () => {
    // Delay hiding to allow onPress event on recent topics to register
    setTimeout(() => setShowRecentTopics(false), 100);
  };

  // Current question or default fallback
  const currentQuestion = questions[currentQuestionIndex] || {
    question: '',
    options: { A: '', B: '', C: '', D: '' },
    correctAnswer: 'A',
  };
  const userSelected = userAnswers[currentQuestionIndex];

  return (
    <ParallaxScrollView>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Multiple-Choice Exam
        </ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>
          Example: "Absolutism"
        </ThemedText>

        {/* Topic Input with Recent Topics Dropdown */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, isDarkMode ? styles.inputDark : {}]}
            value={topic}
            onChangeText={setTopic}
            placeholder="Enter topic"
            placeholderTextColor={isDarkMode ? '#aaa' : '#555'}
            onFocus={handleFocusTopic}
            onBlur={handleBlurTopic}
          />
          {showRecentTopics && recentTopics.length > 0 && (
            <View style={[styles.recentTopicsContainer, isDarkMode ? styles.recentTopicsContainerDark : {}]}>
              {recentTopics.map((t, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recentTopicItem}
                  onPress={() => handleSelectRecentTopic(t)}
                >
                  <Text style={[styles.recentTopicText, isDarkMode ? { color: '#fff' } : {}]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Difficulty Picker */}
        <Picker
          selectedValue={String(difficulty)}
          style={[styles.picker, isDarkMode ? styles.pickerDark : {}]}
          onValueChange={(value) => setDifficulty(Number(value))}
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
            <Picker.Item key={num} label={`Difficulty ${num}`} value={`${num}`} />
          ))}
        </Picker>

        {/* Number of Questions Picker */}
        <Picker
          selectedValue={String(numQuestions)}
          style={[styles.picker, isDarkMode ? styles.pickerDark : {}]}
          onValueChange={(value) => setNumQuestions(Number(value))}
        >
          {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
            <Picker.Item key={num} label={`${num} questions`} value={`${num}`} />
          ))}
        </Picker>

        {/* Generate Button */}
        <TouchableOpacity
          style={[styles.buttonGenerate, isDarkMode ? styles.buttonGenerateDark : {}]}
          onPress={handleGenerateTest}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Generate Test</Text>
          )}
        </TouchableOpacity>

        {/* Saved Tests Section */}
        <ThemedView style={styles.savedSection}>
          <ThemedText type="subtitle" style={styles.savedTitle}>
            Saved Test Sets
          </ThemedText>
          {savedTests.length === 0 ? (
            <Text style={[styles.noSavedText, isDarkMode ? { color: '#fff' } : {}]}>
              No saved test sets.
            </Text>
          ) : (
            savedTests.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.savedSetItem,
                  isDarkMode ? styles.savedSetItemDark : {},
                ]}
                onPress={() => handleSelectSavedTest(item)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.savedSetTitle, isDarkMode ? { color: '#fff' } : {}]}>
                    {item.topic}
                  </Text>
                  <Text style={[styles.savedSetDetails, isDarkMode ? { color: '#ccc' } : {}]}>
                    Difficulty: {item.difficulty} • {item.numQuestions} questions •{' '}
                    {new Date(item.createdAt).toLocaleString()}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteSavedTest(item.id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </ThemedView>

        {/* Exam Section */}
        {questions.length > 0 && (
          <View style={styles.testContainer}>
            <Text style={[styles.counterText, isDarkMode ? { color: '#fff' } : {}]}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </Text>

            {/* Question Text */}
            <View style={[styles.questionContainer, isDarkMode ? styles.questionContainerDark : {}]}>
              <Text style={[styles.questionText, { color: isDarkMode ? '#fff' : '#000' }]}>
                {currentQuestion.question}
              </Text>
            </View>

            {/* Options */}
            <View style={styles.optionsContainer}>
              {Object.entries(currentQuestion.options).map(([key, val]) => {
                const isSelected = userSelected === key;
                const isCorrect = isSubmitted && key === currentQuestion.correctAnswer;
                const isWrongSelection =
                  isSubmitted && isSelected && key !== currentQuestion.correctAnswer;

                return (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.optionButton,
                      isDarkMode ? styles.optionButtonDark : {},
                      // Highlight the selected option if not submitted
                      isSelected && !isSubmitted ? styles.optionSelected : {},
                      // Highlight the correct answer in green after submission
                      isCorrect ? styles.optionCorrect : {},
                      // Highlight the wrong selection in red after submission
                      isWrongSelection ? styles.optionWrong : {},
                    ]}
                    onPress={() => handleSelectAnswer(key as keyof TestQuestion['options'])}
                  >
                    <Text style={[styles.optionText, isDarkMode ? { color: '#fff' } : {}]}>
                      {key}) {val}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Navigation Buttons */}
            <View style={styles.navButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.navButton,
                  isDarkMode ? styles.navButtonDark : {},
                  { marginRight: 8 },
                ]}
                onPress={handlePrev}
                disabled={currentQuestionIndex <= 0}
              >
                <Text style={styles.navButtonText}>Back</Text>
              </TouchableOpacity>

              {/* If not on the last question, show "Next" */}
              {currentQuestionIndex < questions.length - 1 && (
                <TouchableOpacity
                  style={[styles.navButton, isDarkMode ? styles.navButtonDark : {}]}
                  onPress={handleNext}
                >
                  <Text style={styles.navButtonText}>Next</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Submit Button on the last question (if not submitted) */}
            {currentQuestionIndex === questions.length - 1 && !isSubmitted && (
              <TouchableOpacity
                style={[
                  styles.buttonSubmit,
                  isDarkMode ? styles.buttonSubmitDark : {},
                  // Increased padding
                  { marginTop: 12, paddingHorizontal: 16, paddingVertical: 16 },
                ]}
                onPress={handleSubmit}
              >
                <Text style={styles.buttonText}>Submit Test</Text>
              </TouchableOpacity>
            )}

            {/* Score */}
            {renderScore()}
          </View>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginVertical: 16,
    fontSize: 32,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginHorizontal: 16,
    position: 'relative',
  },
  input: {
    padding: 12,
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    backgroundColor: '#f0f0f0',
    zIndex: 1,
  },
  inputDark: {
    borderColor: '#555',
    backgroundColor: '#555',
    color: '#fff',
  },
  recentTopicsContainer: {
    position: 'absolute',
    top: 50, // Adjust based on TextInput height
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderTopWidth: 0,
    maxHeight: 150,
    zIndex: 2,
  },
  recentTopicsContainerDark: {
    backgroundColor: '#444',
    borderColor: '#555',
  },
  recentTopicItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  recentTopicItemDark: {
    borderBottomColor: '#555',
  },
  recentTopicText: {
    fontSize: 16,
  },
  picker: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  pickerDark: {
    color: '#fff',
  },
  buttonGenerate: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  buttonGenerateDark: {
    backgroundColor: '#0056b3',
  },
  buttonText: {
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
  testContainer: {
    marginTop: 16,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  counterText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  questionContainer: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    width: '100%',
  },
  questionContainerDark: {
    backgroundColor: '#555',
  },
  questionText: {
    fontSize: 18,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
    marginBottom: 16,
  },
  optionButton: {
    marginVertical: 6,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#e9ecef',
  },
  optionButtonDark: {
    backgroundColor: '#555',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionSelected: {
    borderWidth: 2,
    borderColor: '#007bff',
  },
  optionCorrect: {
    backgroundColor: '#28a745',
  },
  optionWrong: {
    backgroundColor: '#dc3545',
  },
  navButtonsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 16,
  },
  navButton: {
    backgroundColor: '#17a2b8',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    paddingBottom: 12,
  },
  navButtonDark: {
    backgroundColor: '#138496',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonSubmit: {
    backgroundColor: '#ffc107',
    alignItems: 'center',
    borderRadius: 8,
    width: '100%',
  },
  buttonSubmitDark: {
    backgroundColor: '#e0a800',
  },
  scoreContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 18,
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
