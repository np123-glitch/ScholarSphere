import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import Config from '@/components/Config';
import { useAuthSession } from '@/components/AuthProvider';

export default function HomeScreen() {
  const [loading, setLoading] = useState(false);
  const { token, isLoading: authLoading } = useAuthSession();
  const [text, setText] = useState('');
  const [botResponse, setBotResponse] = useState('');
  const colorScheme = useColorScheme() || 'light';
  const isDarkMode = colorScheme === 'dark';
  const baseUrl = Config.API_BASE_URL;

  const handleSend = async () => {
    if (!text.trim()) {
      Alert.alert('Validation Error', 'Please enter a message.');
      return;
    }

    setLoading(true);

    try {
      console.log("Request to server sent");
      const response = await fetch(baseUrl + '/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token?.current}`,
        },
        body: JSON.stringify({
          message: text + ". Don't include any references. Include emojis and markdown formatting."
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        let errorMessage = result.message || result.error || 'Something went wrong!';

        if (result.message === 'Token has expired!') {
          Alert.alert('Session Expired', 'Your session has expired. Please log out and log in again.');
        } else {
          Alert.alert('Error', errorMessage);
        }
      } else {
        setBotResponse(result.response); // Update bot response
        setText(''); // Clear the text input
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ParallaxScrollView>
      <ThemedView>
        <ThemedText type="title" style={styles.title}>
          Chat with Notes
        </ThemedText>
      </ThemedView>

      <ThemedView>
        <ThemedText type="subtitle" style={styles.subtitle}>
          Remember to upload notes before chatting!
        </ThemedText>

        <View style={[styles.inputContainer, isDarkMode ? styles.inputContainerDark : {}]}>
          <TextInput
            style={[styles.textInput, isDarkMode ? styles.textInputDark : {}]}
            value={text}
            onChangeText={setText}
            placeholder="Type your message here"
            placeholderTextColor={isDarkMode ? '#aaa' : '#555'}
            multiline 
          />
          <TouchableOpacity
            style={[styles.sendButton, isDarkMode ? styles.sendButtonDark : {}]}
            onPress={handleSend}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText type="body" style={styles.sendButtonText}>
                Send
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>

        {botResponse ? (
          <View style={[styles.responseContainer, isDarkMode ? styles.responseContainerDark : {}]}>
            <Markdown style={isDarkMode ? markdownDarkStyles : markdownLightStyles}>
              {botResponse}
            </Markdown>
          </View>
        ) : null}
      </ThemedView>
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
  subtitle: {
    textAlign: 'center',
    marginVertical: 0,
    paddingBottom: 16,
    fontSize: 16,
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputContainerDark: {
    backgroundColor: '#333',
    shadowColor: '#000',
  },
  textInput: {
    flex: 1,
    borderColor: '#ddd',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    fontSize: 16,
  },
  textInputDark: {
    borderColor: '#555',
    backgroundColor: '#555',
    color: '#fff',
  },
  sendButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDark: {
    backgroundColor: '#0056b3',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  responseContainer: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  responseContainerDark: {
    backgroundColor: '#444',
    shadowColor: '#000',
  },
});

// Markdown styles
const markdownLightStyles = StyleSheet.create({
  text: { color: '#000', fontSize: 16 },
  strong: { fontWeight: 'bold' },
  em: { fontStyle: 'italic' },
  heading1: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  heading2: { fontSize: 20, fontWeight: 'bold', marginBottom: 6 },
  link: { color: 'blue', textDecorationLine: 'underline' },
});

const markdownDarkStyles = StyleSheet.create({
  text: { color: '#fff', fontSize: 16 },
  strong: { fontWeight: 'bold', color: '#fff' },
  em: { fontStyle: 'italic', color: '#ddd' },
  heading1: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  heading2: { fontSize: 20, fontWeight: 'bold', color: '#ddd', marginBottom: 6 },
  link: { color: 'lightblue', textDecorationLine: 'underline' },
});
