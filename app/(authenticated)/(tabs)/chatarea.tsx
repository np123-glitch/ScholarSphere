import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import Config from '@/components/Config';
import { useAuthSession } from '@/components/AuthProvider';

export default function HomeScreen() {
  const { token, isLoading: authLoading } = useAuthSession();
  const [text, setText] = useState('');
  const [botResponse, setBotResponse] = useState('');
  const colorScheme = useColorScheme() || 'light';
  const isDarkMode = colorScheme === 'dark';
  const baseUrl = Config.API_BASE_URL;
  const handleSend = async () => {
    console.log("Request to server sent");
    try {
      const response = await fetch(baseUrl + '/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token?.current}`,
        },
        body: JSON.stringify({ message: text }),
      });
      const result = await response.json();
  
      if (response.ok) {
        setBotResponse(result.response); // Update bot response
        setText(''); // Clear the text input
      } else {
        console.error('Failed to send message:', result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  

  return (
    <ParallaxScrollView>
      <ThemedView>
        <ThemedText type="title" style={styles.title}>
          Chat with notes
        </ThemedText>
      </ThemedView>
      <ThemedView>
        <View style={[styles.inputContainer, isDarkMode ? styles.inputContainerDark : {}]}>
          <TextInput
            style={[styles.textInput, isDarkMode ? styles.textInputDark : {}]}
            value={text}
            onChangeText={setText}
            placeholder="Type your message here"
            placeholderTextColor={isDarkMode ? '#aaa' : '#555'}
          />
          <TouchableOpacity
            style={[styles.sendButton, isDarkMode ? styles.sendButtonDark : {}]}
            onPress={handleSend}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
        
        {botResponse ? (
          <View style={[styles.responseContainer, isDarkMode ? styles.responseContainerDark : {}]}>
            <Text style={[styles.responseText, isDarkMode ? styles.responseTextDark : {}]}>
              {botResponse}
            </Text>
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
  responseText: {
    fontSize: 16,
    color: '#333', // Default text color
  },
  responseTextDark: {
    color: '#fff', // White text in dark mode
  },
});
