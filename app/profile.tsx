// components/Profile.tsx

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Switch,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthSession } from '@/components/AuthProvider';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { decodeJwt, JwtPayload } from '@/utils/decodeJwt';
import { Linking } from 'react-native';
import { Alert } from 'react-native';

export default function Profile() {
  const router = useRouter();
  const systemColorScheme = useColorScheme() || 'light';
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const { signOut, token } = useAuthSession();

  const [userName, setUserName] = useState<string | null>(null);
  const [isSettingsModalVisible, setSettingsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Toggle theme handler
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  // Decode JWT and set user name
  useEffect(() => {
    if (token.current) {
      const decodedToken = decodeJwt(token.current);
      if (decodedToken) {
        setUserName(decodedToken.name || decodedToken.sub); // Use 'name' if available, otherwise 'sub'
      } else {
        setUserName(null);
      }
      setIsLoading(false);
    } else {
      setUserName(null);
      setIsLoading(false);
    }
  }, [token]);

  // Handle Logout
  const logout = () => {
    signOut();
    router.replace('/login'); // Redirect to login after logout
  };

  return (
    <ThemedView
      style={[
        styles.container,
        isDarkMode ? styles.containerDark : styles.containerLight,
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => router.navigate('/(authenticated)/(tabs)')}
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
          Profile
        </ThemedText>

        <TouchableOpacity
          style={styles.settingsIcon}
          onPress={() => setSettingsModalVisible(true)}
          accessibilityLabel="Open Settings"
        >
          <Ionicons
            name="settings-sharp"
            size={24}
            color={isDarkMode ? '#fff' : '#000'}
          />
        </TouchableOpacity>
      </View>
      
      <View
        style={[
          styles.userCard,
          isDarkMode ? styles.userCardDark : styles.userCardLight,
        ]}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : (
          <>
            <Ionicons
              name="person-circle"
              size={100}
              color={isDarkMode ? '#fff' : '#000'}
              style={styles.userIcon}
            />
            <ThemedText
              type="name"
              style={[styles.userName, isDarkMode ? { color: '#fff' } : {}]}
            >
              {userName || 'User'}
            </ThemedText>
          </>
        )}
      </View>
      <ThemedText type="defaultSemiBold" style={styles.description}>
        ** Please note that some of the buttons may not work right now even if you click on them. This is intentional to test the app's functionality. Thank you for your understanding. **
      </ThemedText>
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            isDarkMode ? styles.actionButtonDark : styles.actionButtonLight,
          ]}
        >
          <MaterialIcons
            name="edit"
            size={20}
            color={isDarkMode ? '#fff' : '#000'}
            style={styles.actionIcon}
          />
          <ThemedText
            type="button"
            style={[
              styles.actionButtonText,
              isDarkMode ? { color: '#fff' } : {},
            ]}
          >
            Edit Profile
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            isDarkMode ? styles.actionButtonDark : styles.actionButtonLight,
          ]}
        >
          <MaterialIcons
            name="lock"
            size={20}
            color={isDarkMode ? '#fff' : '#000'}
            style={styles.actionIcon}
          />
          <ThemedText
            type="button"
            style={[
              styles.actionButtonText,
              isDarkMode ? { color: '#fff' } : {},
            ]}
          >
            Change Password
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionButton,
            isDarkMode ? styles.actionButtonDark : styles.actionButtonLight,
          ]}
          onPress={() => {
            // Open a link to the privacy policy
            Linking.openURL('https://www.termsfeed.com/live/c647ace4-3ae9-46f8-b2bd-131cd43df439');
          }}
        >
          <MaterialIcons
            name="link"
            size={20}
            color={isDarkMode ? '#fff' : '#000'}
            style={styles.actionIcon}
          />
          <ThemedText
            type="button"
            style={[
              styles.actionButtonText,
              isDarkMode ? { color: '#fff' } : {},
            ]}
          >
            Privacy Policy
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionButton,
            isDarkMode ? styles.actionButtonDark : styles.actionButtonLight,
          ]}
          onPress={() => {
            Alert.alert("Contact Information", "Email: neelprasad2008@gmail.com");
          }}
        >
          <MaterialIcons
            name="email"
            size={20}
            color={isDarkMode ? '#fff' : '#000'}
            style={styles.actionIcon}
          />
          <ThemedText
            type="button"
            style={[
              styles.actionButtonText,
              isDarkMode ? { color: '#fff' } : {},
            ]}
          >
            Contact Us
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
        >
          <ThemedText
            type="button"
            style={styles.logoutButtonText}
          >
            Logout
          </ThemedText>
        </TouchableOpacity>
      </View>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  //
  // ------------------- Main container styles -------------------
  //
  container: {
    padding: 20,
    paddingTop: 60,
    flex: 1,
    justifyContent: 'flex-start',
  },
  containerLight: {
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#111',
  },

  //
  // ------------------- Header styles -------------------
  //
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  backIcon: {
    padding: 5,
  },
  settingsIcon: {
    padding: 5,
  },

  //
  // ------------------- User Card styles -------------------
  //
  userCard: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userCardLight: {
    backgroundColor: '#f9f9f9',
  },
  userCardDark: {
    backgroundColor: '#1e1e1e',
  },
  userIcon: {
    marginBottom: 15,
  },
  userName: {
    fontSize: 22,
    fontWeight: '600',
  },

  //
  // ------------------- Action Buttons styles -------------------
  //
  actionButtonsContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 8,
  },
  actionButtonLight: {
    backgroundColor: '#e0e0e0',
  },
  actionButtonDark: {
    backgroundColor: '#333',
  },
  actionIcon: {
    marginRight: 10,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  description: {
    paddingBottom: 20,
    textAlign: 'center',
  },

  //
  // ------------------- Footer styles -------------------
  //
  footer: {
    alignItems: 'center',
    marginTop: 0,
  },
  logoutButton: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    backgroundColor: '#ff4d4d',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  //
  // ------------------- Modal styles -------------------
  //
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalContentLight: {
    backgroundColor: '#fff',
  },
  modalContentDark: {
    backgroundColor: '#333',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalTextLight: {
    color: '#000',
  },
  modalTextDark: {
    color: '#fff',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  toggleLabel: {
    fontSize: 18,
  },
  closeButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
