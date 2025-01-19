// src/screens/LoginScreen.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert, useColorScheme } from 'react-native'; // Import useColorScheme
import { useAuthSession } from '@/components/AuthProvider';
import { useRouter } from 'expo-router'; // Import useRouter for navigation

const LoginScreen = () => {
  const { signIn } = useAuthSession();
  const router = useRouter(); // Initialize the router
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const colorScheme = useColorScheme(); // Get the current color scheme
  const isDarkMode = colorScheme === 'dark';

  const handleLogin = async () => {
    if (!loginId.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter both login ID and password.');
      return;
    }

    setLoading(true);
    try {
      await signIn(loginId, password); // AuthProvider.signIn handles the fetch and token storage
      // Navigate to /index in (authenticated)/(tabs) after successful login
      router.replace('../(authenticated)/(tabs)'); // Corrected navigation path
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <Text style={[styles.title, isDarkMode && styles.titleDark]}>Login to ScholarSphere</Text>
      <TextInput
        style={[styles.input, isDarkMode && styles.inputDark]}
        placeholder="Login ID"
        placeholderTextColor={isDarkMode ? '#ccc' : '#666'} // Set placeholder color based on mode
        value={loginId}
        onChangeText={setLoginId}
        autoCapitalize="none"
        keyboardType="email-address" // Adjust if necessary
      />
      <TextInput
        style={[styles.input, isDarkMode && styles.inputDark]}
        placeholder="Password"
        placeholderTextColor={isDarkMode ? '#ccc' : '#666'} // Set placeholder color based on mode
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <Button title="Login" onPress={handleLogin} color="#007bff" />
      )}
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  containerDark: {
    backgroundColor: '#1c1c1c',
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#000', // Default text color
  },
  titleDark: {
    color: '#fff', // Title color in dark mode
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    color: '#000', // Text color
  },
  inputDark: {
    borderColor: '#555',
    backgroundColor: '#333',
    color: '#fff', // Text color in dark mode
  },
});
