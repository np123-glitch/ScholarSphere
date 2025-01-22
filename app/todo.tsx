// components/TodoList.tsx

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Keyboard,
  View,
  ActivityIndicator,
  Vibration, // Import Vibration API
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon'; // Import ConfettiCannon
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthSession } from '@/components/AuthProvider';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export default function TodoList() {
  const router = useRouter();
  const systemColorScheme = useColorScheme() || 'light';
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const { token } = useAuthSession();

  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [input, setInput] = useState('');
  const [confettiVisible, setConfettiVisible] = useState(false); // State for Confetti
  const [uploading, setUploading] = useState(false); // If you have uploading elsewhere

  useEffect(() => {
    loadTodos();
  }, []);

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  const loadTodos = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@todos');
      if (jsonValue != null) {
        const parsedTodos: TodoItem[] = JSON.parse(jsonValue);
        setTodos(parsedTodos);
      }
    } catch (e) {
      console.error('Failed to load todos.', e);
    }
  };

  const saveTodos = async (todos: TodoItem[]) => {
    try {
      const jsonValue = JSON.stringify(todos);
      await AsyncStorage.setItem('@todos', jsonValue);
    } catch (e) {
      console.error('Failed to save todos.', e);
    }
  };

  const addTodo = () => {
    if (input.trim() === '') return;
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text: input.trim(),
      completed: false,
    };
    setTodos([newTodo, ...todos]);
    setInput('');
    Keyboard.dismiss();
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const toggleComplete = (id: string) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );

    // Find the completed todo item
    const completedTodo = todos.find(todo => todo.id === id);
    if (completedTodo && !completedTodo.completed) { // If the todo was just marked as completed
      triggerConfetti();
      triggerVibration();
    }
  };

  const triggerConfetti = () => {
    setConfettiVisible(true);
    // Automatically hide confetti after the animation duration (e.g., 1000ms)
    setTimeout(() => {
      setConfettiVisible(false);
    }, 4000);
  };

  const triggerVibration = () => {
    // Vibration pattern: vibrate 500ms, pause 300ms, vibrate 500ms
    const DURATION_SHORT = 500;
    const PATTERN = [0, DURATION_SHORT, 300, DURATION_SHORT];
    Vibration.vibrate(PATTERN);
  };

  return (
    <ThemedView
      style={[
        styles.container,
        isDarkMode ? styles.containerDark : styles.containerLight,
      ]}
    >
      {/* Confetti Cannon */}
      {confettiVisible && (
        <ConfettiCannon
          count={100}
          origin={{ x: -10, y: 0 }}
          fadeOut={true}
          explosionSpeed={350}
          fallSpeed={3000}
          colors={['#FFC700', '#FF0000', '#00FF00', '#0000FF', '#FF00FF']} // Customize colors as needed
          onAnimationEnd={() => setConfettiVisible(false)} // Ensure confetti is hidden after animation
        />
      )}

      {/* Header with Back Icon and Title */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => router.navigate('/')}
          accessibilityLabel="Go Back"
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDarkMode ? '#fff' : '#000'}
          />
        </TouchableOpacity>

        <ThemedText
          type="title"
          style={[styles.headerTitle, isDarkMode ? { color: '#fff' } : {}]}
        >
          Todo List
        </ThemedText>

        <View style={styles.placeholder} />
      </View>

      {/* Input Field */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            isDarkMode ? styles.inputDark : styles.inputLight,
          ]}
          placeholder="Add a new todo"
          placeholderTextColor={isDarkMode ? '#aaa' : '#555'}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={addTodo}
          returnKeyType="done"
        />
        <TouchableOpacity onPress={addTodo} style={styles.addButton}>
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Todo List */}
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        style={styles.flatList}
        renderItem={({ item }) => (
          <ThemedView
            style={[
              styles.todoItem,
              isDarkMode ? styles.todoItemDark : styles.todoItemLight,
            ]}
          >
            <View style={styles.todoLeft}>
              <Checkbox
                value={item.completed}
                onValueChange={() => toggleComplete(item.id)}
                color={item.completed ? '#007AFF' : isDarkMode ? '#fff' : '#000'}
                style={styles.checkbox}
              />
              <ThemedText
                type="body"
                style={[
                  styles.todoText,
                  isDarkMode ? { color: '#fff' } : { color: '#000' },
                  item.completed && styles.completedText,
                ]}
              >
                {item.text}
              </ThemedText>
            </View>
            <TouchableOpacity onPress={() => deleteTodo(item.id)}>
              <MaterialIcons
                name="delete"
                size={24}
                color={isDarkMode ? '#fff' : '#000'}
              />
            </TouchableOpacity>
          </ThemedView>
        )}
        ListEmptyComponent={
          <ThemedText
            type="body"
            style={[
              styles.emptyText,
              isDarkMode ? { color: '#ccc' } : { color: '#555' },
            ]}
          >
            No todos yet. Add one!
          </ThemedText>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch', // Changed from 'center' to 'stretch'
  },
  containerLight: {
    backgroundColor: '#ffffff',
  },
  containerDark: {
    backgroundColor: '#111111',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  backIcon: {
    padding: 5,
  },
  placeholder: {
    width: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  inputLight: {
    backgroundColor: '#f0f0f0',
    color: '#000',
  },
  inputDark: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
  },
  addButton: {
    width: 50,
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  flatList: {
    flex: 1, // Ensures the FlatList takes up available space
    width: '100%',
  },
  list: {
    paddingBottom: 20,
  },
  todoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
    padding: 15,
    borderRadius: 8,
  },
  todoItemLight: {
    backgroundColor: '#e0e0e0',
  },
  todoItemDark: {
    backgroundColor: '#333333',
  },
  todoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    marginRight: 10,
  },
  todoText: {
    fontSize: 16,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
  },
  // Removed unused styles related to importance and modals
});
