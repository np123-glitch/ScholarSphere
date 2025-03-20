import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { CheckCircle2, XCircle } from 'lucide-react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuthSession } from '@/components/AuthProvider';
import Config from '@/components/Config';

interface TestQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export default function QuizScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const { token, signOut } = useAuthSession();
  
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState(5);
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const baseUrl = Config.API_BASE_URL;

  const handleGenerateQuiz = async () => {
    if (!topic.trim()) {
      Alert.alert('Error', 'Please enter a topic');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.current}`,
        },
        body: JSON.stringify({
          message: `Generate ${numQuestions} multiple-choice questions about "${topic}" with difficulty level ${difficulty}/10. Format each question as: Q: [question] A: [option1] B: [option2] C: [option3] D: [option4] Correct: [A/B/C/D]`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message === 'Token has expired!') {
          Alert.alert(
            'Session Expired',
            'Your session has expired. Please log out and log in again.',
            [{ text: 'OK', onPress: () => signOut() }]
          );
        } else {
          Alert.alert('Error', data.message || 'Failed to generate quiz');
        }
        return;
      }

      const parsedQuestions = parseQuestions(data.response);
      setQuestions(parsedQuestions);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setIsSubmitted(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const parseQuestions = (response: string): TestQuestion[] => {
    const questionRegex =
      /Q: (.*?)\nA: (.*?)\nB: (.*?)\nC: (.*?)\nD: (.*?)\nCorrect: ([A-D])/g;
    const questions: TestQuestion[] = [];
    let match;

    while ((match = questionRegex.exec(response)) !== null) {
      const [_, question, optionA, optionB, optionC, optionD, correct] = match;
      const correctIndex = correct.charCodeAt(0) - 'A'.charCodeAt(0);

      questions.push({
        question: question.trim(),
        options: [optionA, optionB, optionC, optionD].map(opt => opt.trim()),
        correctAnswer: correctIndex,
      });
    }

    return questions;
  };

  const handleSelectAnswer = (questionIndex: number, optionIndex: number) => {
    if (!isSubmitted) {
      setSelectedAnswers(prev => ({
        ...prev,
        [questionIndex]: optionIndex,
      }));
    }
  };

  const handleSubmit = () => {
    if (Object.keys(selectedAnswers).length < questions.length) {
      Alert.alert('Warning', 'Please answer all questions before submitting');
      return;
    }
    setIsSubmitted(true);
  };

  const calculateScore = () => {
    if (!isSubmitted) return null;

    const correct = questions.reduce((acc, q, idx) => {
      return acc + (selectedAnswers[idx] === q.correctAnswer ? 1 : 0);
    }, 0);

    return `${correct}/${questions.length}`;
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          Quiz
        </ThemedText>
        <View style={{ width: 24 }} />
      </View>

      {/* Quiz Setup */}
      <View style={styles.setupContainer}>
        <TextInput
          style={[
            styles.input,
            isDark ? styles.inputDark : styles.inputLight,
          ]}
          placeholder="Enter topic (e.g., World War II)"
          placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          value={topic}
          onChangeText={setTopic}
        />

        <View style={styles.settingsRow}>
          <View
            style={[
              styles.settingItem,
              isDark ? styles.settingItemDark : styles.settingItemLight,
            ]}
          >
            <ThemedText type="body" style={styles.settingLabel}>
              Difficulty: {difficulty}/10
            </ThemedText>
            <View style={styles.settingControls}>
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  isDark ? styles.controlButtonDark : styles.controlButtonLight,
                ]}
                onPress={() => setDifficulty(Math.max(1, difficulty - 1))}
              >
                <ThemedText type="body" style={styles.controlText}>
                  -
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  isDark ? styles.controlButtonDark : styles.controlButtonLight,
                ]}
                onPress={() => setDifficulty(Math.min(10, difficulty + 1))}
              >
                <ThemedText type="body" style={styles.controlText}>
                  +
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={[
              styles.settingItem,
              isDark ? styles.settingItemDark : styles.settingItemLight,
            ]}
          >
            <ThemedText type="body" style={styles.settingLabel}>
              Questions: {numQuestions}
            </ThemedText>
            <View style={styles.settingControls}>
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  isDark ? styles.controlButtonDark : styles.controlButtonLight,
                ]}
                onPress={() => setNumQuestions(Math.max(1, numQuestions - 1))}
              >
                <ThemedText type="body" style={styles.controlText}>
                  -
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  isDark ? styles.controlButtonDark : styles.controlButtonLight,
                ]}
                onPress={() => setNumQuestions(Math.min(20, numQuestions + 1))}
              >
                <ThemedText type="body" style={styles.controlText}>
                  +
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.generateButton,
            isDark ? styles.buttonDark : styles.buttonLight,
            loading && styles.buttonDisabled,
          ]}
          onPress={handleGenerateQuiz}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText type="body" style={styles.buttonText}>
              Generate Quiz
            </ThemedText>
          )}
        </TouchableOpacity>
      </View>

      {/* Quiz Content */}
      {questions.length > 0 && (
        <ScrollView style={styles.quizContent} showsVerticalScrollIndicator={false}>
          <View style={styles.questionContainer}>
            <ThemedText type="body" style={styles.questionCounter}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </ThemedText>

            <ThemedText type="title" style={styles.questionText}>
              {questions[currentQuestionIndex].question}
            </ThemedText>

            <View style={styles.optionsContainer}>
              {questions[currentQuestionIndex].options.map((option, index) => {
                const isSelected = selectedAnswers[currentQuestionIndex] === index;
                const isCorrect =
                  isSubmitted && index === questions[currentQuestionIndex].correctAnswer;
                const isWrong = isSubmitted && isSelected && !isCorrect;

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      isDark ? styles.optionDark : styles.optionLight,
                      isSelected && styles.selectedOption,
                      isCorrect && styles.correctOption,
                      isWrong && styles.wrongOption,
                    ]}
                    onPress={() => handleSelectAnswer(currentQuestionIndex, index)}
                    disabled={isSubmitted}
                  >
                    <ThemedText type="body" style={styles.optionText}>
                      {String.fromCharCode(65 + index)}. {option}
                    </ThemedText>
                    {isSubmitted && (isCorrect || isWrong) && (
                      <View style={styles.resultIcon}>
                        {isCorrect ? (
                          <CheckCircle2 size={20} color="#22C55E" />
                        ) : (
                          <XCircle size={20} color="#EF4444" />
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={[
                styles.navButton,
                isDark ? styles.buttonDark : styles.buttonLight,
                currentQuestionIndex === 0 && styles.buttonDisabled,
              ]}
              onPress={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
            >
              <ThemedText type="body" style={styles.buttonText}>
                Previous
              </ThemedText>
            </TouchableOpacity>

            {currentQuestionIndex < questions.length - 1 ? (
              <TouchableOpacity
                style={[styles.navButton, isDark ? styles.buttonDark : styles.buttonLight]}
                onPress={() =>
                  setCurrentQuestionIndex(prev =>
                    Math.min(questions.length - 1, prev + 1)
                  )
                }
              >
                <ThemedText type="body" style={styles.buttonText}>
                  Next
                </ThemedText>
              </TouchableOpacity>
            ) : !isSubmitted ? (
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  isDark ? styles.submitButtonDark : styles.submitButtonLight,
                ]}
                onPress={handleSubmit}
              >
                <ThemedText type="body" style={styles.buttonText}>
                  Submit Quiz
                </ThemedText>
              </TouchableOpacity>
            ) : null}
          </View>

          {isSubmitted && (
            <View style={styles.scoreContainer}>
              <ThemedText type="title" style={styles.scoreText}>
                Your Score: {calculateScore()}
              </ThemedText>
            </View>
          )}
        </ScrollView>
      )}
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

  // ---- SETUP SECTION ----
  setupContainer: {
    gap: 16,
    marginBottom: 24,
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
    alignItems: 'center',
    justifyContent: 'center',
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

  // ---- QUIZ SECTION ----
  quizContent: {
    flex: 1,
  },
  questionContainer: {
    gap: 16,
    marginBottom: 24,
  },
  questionCounter: {
    fontSize: 14,
    opacity: 0.7,
  },
  questionText: {
    fontSize: 20,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLight: {
    backgroundColor: '#F3F4F6',
  },
  optionDark: {
    backgroundColor: '#374151',
  },
  selectedOption: {
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  correctOption: {
    backgroundColor: '#22C55E20',
  },
  wrongOption: {
    backgroundColor: '#EF444420',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#fff', // Ensures text is visible on dark backgrounds
  },
  resultIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  navigationContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  navButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonLight: {
    backgroundColor: '#22C55E',
  },
  submitButtonDark: {
    backgroundColor: '#059669',
  },

  // ---- SCORE SECTION ----
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: '600',
  },
});
