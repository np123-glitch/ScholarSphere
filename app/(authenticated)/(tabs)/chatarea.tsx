import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Animated
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useColorScheme } from '@/hooks/useColorScheme';
import Config from '@/components/Config';
import { useAuthSession } from '@/components/AuthProvider';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemeProvider } from '@react-navigation/native';

const TypingIndicator = ({ isDarkMode }) => {
  const dotAnimations = [new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)];

  useEffect(() => {
    const animateDots = () => {
      const animations = dotAnimations.map((dot, index) => 
        Animated.loop(
          Animated.sequence([
            Animated.timing(dot, {
              toValue: 1,
              duration: 300,
              delay: index * 200,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            })
          ])
        )
      );

      Animated.parallel(animations).start();
    };

    animateDots();
    return () => Animated.timing(new Animated.Value(0)).stop();
  }, []);

  const getDotStyle = (dot) => ({
    transform: [
      {
        translateY: dot.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -5],
        })
      }
    ],
    opacity: dot.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1]
    })
  });

  return (
    <View style={[
      styles.messageBubble, 
      styles.botBubble, 
      isDarkMode && styles.botBubbleDark,
      { width: 80, paddingVertical: 12 }
    ]}>
      <View style={styles.typingContainer}>
        {dotAnimations.map((dot, index) => (
          <Animated.View
            key={index}
            style={[
              styles.typingDot,
              isDarkMode && styles.typingDotDark,
              getDotStyle(dot)
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const [loading, setLoading] = useState(false);
  const { token, signOut } = useAuthSession();
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: "👋 Hello! I'm your friendly AI assistant. I'm here to help answer your questions, provide information, or just chat! \n\nHere's what I can do:\n- Explain complex concepts in simple terms\n- Help with research and learning\n- Generate creative ideas\n- And much more!\n\nHow can I assist you today? 😊\n\n*Note: I'm still learning, so please be patient with me!*",
    }
  ]);
  const colorScheme = useColorScheme() || 'light';
  const isDarkMode = colorScheme === 'dark';
  const baseUrl = Config.API_BASE_URL;
  const insets = useSafeAreaInsets();
  const flatListRef = useRef(null);

  const handleSend = async () => {
    if (!text.trim() || loading) return;

    const userMessage = { sender: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMessage]);
    setText('');
    setLoading(true);

    try {
      const response = await fetch(baseUrl + '/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token?.current}`,
        },
        body: JSON.stringify({
          message: text + ". Respond using markdown formatting with emojis when appropriate."
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.message === 'Token has expired!') {
          Alert.alert(
            'Session Expired',
            'Your session has expired. Please log out and log in again.',
            [{ text: 'OK', onPress: () => signOut() }]
          );
          return;
        }
        throw new Error(result.message || 'Failed to get response');
      }

      const botMessage = { sender: 'bot', text: result.response };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? '#1e1e1e' : '#f5f5f5' }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.top}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={[styles.messagesContainer, { 
            paddingBottom: insets.bottom + 60 
          }]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={loading ? <TypingIndicator isDarkMode={isDarkMode} /> : null}
          renderItem={({ item }) => (
            <View style={[
              styles.messageBubble,
              item.sender === 'bot' 
                ? [styles.botBubble, isDarkMode && styles.botBubbleDark]
                : [styles.userBubble, isDarkMode && styles.userBubbleDark]
            ]}>
              <Markdown style={isDarkMode ? markdownDarkStyles : markdownLightStyles}>
                {item.text}
              </Markdown>
            </View>
          )}
        />

        <View style={[
          styles.inputContainer,
          isDarkMode && styles.inputContainerDark,
          { 
            paddingBottom: insets.bottom + 20,
            marginBottom: Platform.OS === 'android' ? -16 : 0
          }
        ]}>
          <TextInput
            style={[
              styles.textInput,
              isDarkMode && styles.textInputDark,
              { maxHeight: 120 }
            ]}
            value={text}
            onChangeText={setText}
            placeholder="Type your message..."
            placeholderTextColor={isDarkMode ? '#888' : '#999'}
            multiline
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.sendButton, isDarkMode && styles.sendButtonDark]}
            onPress={handleSend}
            disabled={loading}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color="#fff" 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    
  },
  messagesContainer: {
    paddingTop: 16,
    paddingHorizontal: 8,
  },
  messageBubble: {
    padding: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginBottom: 12,
    maxWidth: '80%',
  },
  botBubble: {
    backgroundColor: '#e0e0e0',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },  
  userBubble: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  botBubbleDark: {
    backgroundColor: '#1c1c1e',
  },
  userBubbleDark: {
    backgroundColor: '#0A84FF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    backgroundColor: 'transparent',
  },
  inputContainerDark: {
    backgroundColor: 'transparent',
  },
  textInput: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    fontSize: 16,
    lineHeight: 20,
  },
  textInputDark: {
    backgroundColor: '#1c1c1e',
    color: '#fff',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDark: {
    backgroundColor: '#0A84FF',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#666',
  },
  typingDotDark: {
    backgroundColor: '#999',
  },
});

const markdownBaseStyles = {
  body: { fontSize: 16, lineHeight: 22 },
  heading1: { fontSize: 24, fontWeight: 'bold', marginVertical: 8 },
  heading2: { fontSize: 20, fontWeight: '600', marginVertical: 6 },
  strong: { fontWeight: 'bold' },
  em: { fontStyle: 'italic' },
  link: { textDecorationLine: 'underline' },
  paragraph: { marginVertical: 4 },
};

const markdownLightStyles = StyleSheet.create({
  ...markdownBaseStyles,
  body: { ...markdownBaseStyles.body, color: '#333' },
  link: { ...markdownBaseStyles.link, color: '#007AFF' },
});

const markdownDarkStyles = StyleSheet.create({
  ...markdownBaseStyles,
  body: { ...markdownBaseStyles.body, color: '#fff' },
  link: { ...markdownBaseStyles.link, color: '#0A84FF' },
});