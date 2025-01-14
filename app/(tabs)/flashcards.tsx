import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';  // Ensure this import is from '@react-native-picker/picker'
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function FlashcardsScreen() {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);
  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const colorScheme = useColorScheme() || 'light';
  const isDarkMode = colorScheme === 'dark';

  const handleGenerate = async () => {
    try {
      const response = await fetch('http://192.168.1.153:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Update the message if desired; removing brackets in final output is handled below
          message: `Generate ${count} flashcards based on the topic '${topic}' in the format [question]:[answer] with no newlines`,
        }),
      });
      
      const result = await response.json();
      console.log(result.response)
      if (response.ok) {
        const flashcardsArray = result.response.split(';').map((flashcard) => {
          // Split question/answer
          const [rawQuestion, rawAnswer] = flashcard.split(':');

          // Remove square brackets and trim whitespace
          const question = rawQuestion.replace(/[\[\]]/g, '').trim();
          const answer = rawAnswer.replace(/[\[\]]/g, '').trim();

          return { question, answer };
        });

        setFlashcards(flashcardsArray);
        setCurrentCardIndex(0);
        setShowAnswer(false);
      } else {
        console.error('Failed to generate flashcards:', result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const flipCard = () => {
    setShowAnswer(!showAnswer);
  };

  const handleNextCard = () => {
    // Increment index if we're not on the last card
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
      setShowAnswer(false);
    }
  };

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

        {/* Number of flashcards picker */}
        <Picker
          selectedValue={String(count)}
          style={[styles.picker, isDarkMode ? styles.pickerDark : {}]}
          onValueChange={(itemValue) => setCount(Number(itemValue))}
        >
          {[...Array(20).keys()].map((num) => (
            <Picker.Item key={num + 1} label={`${num + 1} flashcards`} value={`${num + 1}`} />
          ))}
        </Picker>

        {/* Generate button */}
        <TouchableOpacity
          style={[styles.generateButton, isDarkMode ? styles.generateButtonDark : {}]}
          onPress={handleGenerate}
        >
          <Text style={styles.generateButtonText}>Generate</Text>
        </TouchableOpacity>
      </ThemedView>

      {/* Flashcard display: one at a time */}
      {flashcards.length > 0 && (
        <View style={styles.cardContainer}>
          <TouchableOpacity
            onPress={flipCard}
            style={[styles.card, isDarkMode ? styles.cardDark : {}]}
          >
            <Text style={[styles.cardText, isDarkMode ? styles.cardTextDark : {}]}>
              {showAnswer
                ? flashcards[currentCardIndex].answer
                : flashcards[currentCardIndex].question}
            </Text>
          </TouchableOpacity>

          {/* Next button */}
          <TouchableOpacity
            style={[styles.nextButton, isDarkMode ? styles.nextButtonDark : {}]}
            onPress={handleNextCard}
            disabled={currentCardIndex >= flashcards.length - 1}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
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
  cardContainer: {
    padding: 16,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#e9ecef',
    padding: 20,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  cardDark: {
    backgroundColor: '#444',
    shadowColor: '#000',
  },
  cardText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  cardTextDark: {
    color: '#fff',
  },
  nextButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  nextButtonDark: {
    backgroundColor: '#218838',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
