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
  Animated,
  Appearance
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Send } from 'lucide-react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuthSession } from '@/components/AuthProvider';
import Config from '@/components/Config';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const TypingIndicator = ({ isDark }: { isDark: boolean }) => {
  const dotAnimations = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current
  ];

  useEffect(() => {
    const animate = () => {
      const animations = dotAnimations.map((dot, index) =>
        Animated.sequence([
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            delay: index * 200,
            useNativeDriver: true
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true
          })
        ])
      );
      Animated.loop(Animated.parallel(animations)).start();
    };

    animate();
    return () => dotAnimations.forEach(dot => dot.stopAnimation());
  }, []);

  return (
    <View style={[
      styles.typingContainer,
      isDark ? styles.typingContainerDark : styles.typingContainerLight
    ]}>
      {dotAnimations.map((dot, index) => (
        <Animated.View
          key={index}
          style={[
            styles.typingDot,
            isDark ? styles.typingDotDark : styles.typingDotLight,
            {
              transform: [{
                translateY: dot.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -8]
                })
              }],
              opacity: dot.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1]
              })
            }
          ]}
        />
      ))}
    </View>
  );
};

export default function ChatScreen() {
  const router = useRouter();
  // Use Appearance API to get the color scheme
  const colorScheme = Appearance.getColorScheme() || 'light';
  const isDark = colorScheme === 'dark';

  const { token, signOut } = useAuthSession();
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: "👋 Hi! I'm your ScholarSphere study assistant based on uploaded content. I can help you understand complex topics, answer questions, and provide explanations. What would you like to learn about today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const baseUrl = Config.API_BASE_URL;

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { sender: 'user' as const, text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.current}`,
        },
        body: JSON.stringify({ message: input }),
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
          throw new Error(data.message || 'Failed to get response');
        }
        return;
      }

      setMessages(prev => [...prev, { sender: 'bot', text: data.response }]);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          Scholar Assistant
        </ThemedText>
        <View style={{ width: 24 }} />
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        renderItem={({ item }) => (
          <View style={[
            styles.messageBubble,
            item.sender === 'user' ? styles.userBubble : styles.botBubble,
            isDark && (item.sender === 'user' ? styles.userBubbleDark : styles.botBubbleDark)
          ]}>
            <ThemedText type="body" style={styles.messageText}>
              {item.text}
            </ThemedText>
          </View>
        )}
        ListFooterComponent={loading ? <TypingIndicator isDark={isDark} /> : null}
      />

      {/* Input area moved above the bottom tab navigator */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={20} // Adjust this value if needed
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              isDark ? styles.inputDark : styles.inputLight
            ]}
            placeholder="Ask me anything..."
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={1000}
            editable={!loading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              isDark ? styles.buttonDark : styles.buttonLight,
              (!input.trim() || loading) && styles.buttonDisabled
            ]}
            onPress={handleSend}
            disabled={!input.trim() || loading}
          >
            <Send size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 60
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600'
  },
  messagesContainer: {
    paddingBottom: 16
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#4F46E5',
    borderBottomRightRadius: 4
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4
  },
  userBubbleDark: {
    backgroundColor: '#6366F1'
  },
  botBubbleDark: {
    backgroundColor: '#374151'
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24
  },
  typingContainer: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    alignSelf: 'flex-start',
    gap: 4
  },
  typingContainerLight: {
    backgroundColor: '#F3F4F6'
  },
  typingContainerDark: {
    backgroundColor: '#374151'
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  typingDotLight: {
    backgroundColor: '#6B7280'
  },
  typingDotDark: {
    backgroundColor: '#9CA3AF'
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    marginBottom: 80 // extra spacing above tab navigator if needed
  },
  input: {
    flex: 1,
    minHeight: 50,
    maxHeight: 100,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16
  },
  inputLight: {
    backgroundColor: '#F3F4F6',
    color: '#1F2937'
  },
  inputDark: {
    backgroundColor: '#374151',
    color: '#F9FAFB'
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonLight: {
    backgroundColor: '#4F46E5'
  },
  buttonDark: {
    backgroundColor: '#6366F1'
  },
  buttonDisabled: {
    opacity: 0.5
  }
});
