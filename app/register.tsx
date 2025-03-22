import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  StyleSheet, 
  ActivityIndicator, 
  Alert, 
  Keyboard, 
  useColorScheme, 
  TouchableWithoutFeedback 
} from 'react-native';
import { useAuthSession } from '@/components/AuthProvider';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';

const RegisterScreen = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [realname, setRealName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuthSession();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim() || !realname.trim()) {
      Alert.alert('Validation Error', 'Please fill out all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await signUp(username, email, password, realname);
      Alert.alert('Success', 'Account created successfully!');
      router.push('/login');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={[styles.container, isDarkMode && styles.containerDark]}>
        <Text style={[styles.title, isDarkMode && styles.titleDark]}>Register for ScholarSphere</Text>
        <TextInput
          style={[styles.input, isDarkMode && styles.inputDark]}
          placeholder="Username"
          placeholderTextColor={isDarkMode ? '#ccc' : '#666'}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={[styles.input, isDarkMode && styles.inputDark]}
          placeholder="Name"
          placeholderTextColor={isDarkMode ? '#ccc' : '#666'}
          value={realname}
          onChangeText={setRealName}
        />
        <TextInput
          style={[styles.input, isDarkMode && styles.inputDark]}
          placeholder="Email"
          placeholderTextColor={isDarkMode ? '#ccc' : '#666'}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={[styles.input, isDarkMode && styles.inputDark]}
          placeholder="Password"
          placeholderTextColor={isDarkMode ? '#ccc' : '#666'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={[styles.input, isDarkMode && styles.inputDark]}
          placeholder="Confirm Password"
          placeholderTextColor={isDarkMode ? '#ccc' : '#666'}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : (
          <Button title="Register" onPress={handleRegister} color="#007bff" />
        )}
        <TouchableOpacity onPress={handleLoginRedirect} style={styles.signupContainer}>
          <Text style={[styles.signupText, isDarkMode && styles.signupTextDark]}>Already have an accout? Login here.</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#e1e2da',
  },
  containerDark: {
    backgroundColor: '#1c1c1c',
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#000',
  },
  titleDark: {
    color: '#fff',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
  inputDark: {
    borderColor: '#555',
    backgroundColor: '#333',
    color: '#fff',
  },
  signupContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  signupText: {
    fontSize: 16,
    color: '#007bff',
  },
  signupTextDark: {
    color: '#4ea1ff',
  },
});
