import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';

type TestQuestion = {
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correctAnswer: keyof TestQuestion['options'];
};

export default function TestFlashcardScreen() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<number>(5);
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const colorScheme = useColorScheme() || 'light';
  const isDarkMode = colorScheme === 'dark';

  const handleGenerateTest = async () => {
    setLoading(true);
    setIsSubmitted(false);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers({});

    try {
      // Prompt for your backend
      const message = `
        Generate ${numQuestions} multiple-choice test questions about "${topic}"
        with difficulty level ${difficulty} on a scale of 1-10.
        Each question must be on its own line, using the exact format:
        [question:optionA:optionB:optionC:optionD:correctAnswer]
      `;

      const response = await fetch('http://172.20.10.5:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      if (response.ok && data?.response) {
        // Parse each line to get question, options, and correct answer
        const lines = data.response
          .split('\n')
          .map((line: string) => line.trim())
          .filter(Boolean);

        const parsedQuestions = lines
          .map((qLine: string) => {
            // Remove square brackets
            const innerText = qLine.replace(/^\[|\]$/g, '');
            // Split on ':'
            const parts = innerText.split(':');

            // Expect 6 parts: question, A, B, C, D, correctAnswer
            if (parts.length < 6) return null;
            const [questionText, optA, optB, optC, optD, rawCorrect] = parts;
            const correctAnswer = rawCorrect.trim().toUpperCase() as 'A' | 'B' | 'C' | 'D';

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
      } else {
        console.error('Failed to generate test:', data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error generating test:', error);
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

        {/* Topic Input */}
        <TextInput
          style={[styles.input, isDarkMode ? styles.inputDark : {}]}
          value={topic}
          onChangeText={setTopic}
          placeholder="Enter topic"
          placeholderTextColor={isDarkMode ? '#aaa' : '#555'}
        />

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

        {/* Exam Section */}
        {questions.length > 0 && (
          <View style={styles.testContainer}>
            <Text style={[styles.counterText, isDarkMode ? { color: '#fff' } : {}]}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </Text>

            {/* Question Text */}
            <View style={styles.questionContainer}>
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
                      isSelected && !isSubmitted ? styles.optionSelected : {},
                      isCorrect ? styles.optionCorrect : {},
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
    padding: 0,
  },
  title: {
    textAlign: 'center',
    marginVertical: 16,
  },
  input: {
    marginBottom: 16,
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
    marginBottom: 16,
  },
  pickerDark: {
    color: '#fff',
  },
  buttonGenerate: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
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
  testContainer: {
    marginTop: 16,
    alignItems: 'center',
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
    backgroundColor: '#000', // Change to black
    width: '100%',
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
  },
  navButton: {
    backgroundColor: '#17a2b8',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
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
});
