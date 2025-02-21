// components/Profile.tsx

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Switch,
  View,
  Alert,
  Linking,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthSession } from '@/components/AuthProvider';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { decodeJwt, JwtPayload } from '@/utils/decodeJwt';
import Config from '@/components/Config';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Profile() {
  const router = useRouter();
  const systemColorScheme = useColorScheme() || 'light';
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const { signOut, token } = useAuthSession();

  const [userName, setUserName] = useState<string | null>(null);
  const [isSettingsModalVisible, setSettingsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profilePic, setProfilePic] = useState<string | null>(null);

  // Toggle theme handler
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  // Load stored profile picture from AsyncStorage
  useEffect(() => {
    const loadProfilePic = async () => {
      try {
        const storedPic = await AsyncStorage.getItem('profilePicture');
        if (storedPic) {
          setProfilePic(storedPic);
        }
      } catch (error) {
        console.error('Failed to load profile picture:', error);
        Alert.alert('Error', 'Failed to load profile picture.');
      }
    };

    loadProfilePic();
  }, []);

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

  const deleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const response = await fetch(
                `${Config.API_BASE_URL}/auth/delete-account`,
                {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token.current}`,
                  },
                }
              );
              if (response.ok) {
                signOut();
                Alert.alert('Success', 'Account deleted successfully.');
                router.replace('./login');
              }
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Error', 'Failed to delete account.');
            }
          },
        },
      ]
    );
  };

  // Handle profile picture change
  const pickProfilePicture = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Ensures a square crop
        quality: 1,
      });

      if (!result.cancelled) {
        // Update state and store the selected image URI
        setProfilePic(result.uri);
        await AsyncStorage.setItem('profilePicture', result.uri);
      }
    } catch (error) {
      console.error('Error picking profile picture:', error);
      Alert.alert('Error', 'Failed to pick image.');
    }
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
          style={[
            styles.headerTitle,
            { flex: 1, textAlign: 'center' },
            isDarkMode ? { color: '#fff' } : {},
          ]}
        >
          Profile
        </ThemedText>

        {/* Placeholder to balance the header layout */}
        <View style={styles.headerRightPlaceholder} />
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
            {profilePic ? (
              <Image source={{ uri: profilePic }} style={styles.profileImage} />
            ) : (
              <Ionicons
                name="person-circle"
                size={100}
                color={isDarkMode ? '#fff' : '#000'}
                style={styles.userIcon}
              />
            )}
            <ThemedText
              type="name"
              style={[styles.userName, isDarkMode ? { color: '#fff' } : {}]}
            >
              {userName || 'User'}
            </ThemedText>
            <TouchableOpacity
              style={styles.changePicButton}
              onPress={pickProfilePicture}
            >
              <ThemedText type="button" style={styles.changePicButtonText}>
                Change Profile Picture
              </ThemedText>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            isDarkMode ? styles.actionButtonDark : styles.actionButtonLight,
          ]}
          onPress={() => {
            Linking.openURL(
              'https://www.termsfeed.com/live/d32c2fc6-6161-4437-8e1f-9ed144282fab'
            );
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
            Alert.alert(
              'Contact Information',
              'Email: neelprasad2008@gmail.com'
            );
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
        <TouchableOpacity
          style={[
            styles.actionButton,
            isDarkMode ? styles.actionButtonDark : styles.actionButtonLight,
          ]}
          onPress={() => {
            Alert.alert(
              'Send an email to reset your password',
              'Email: neelprasad2008@gmail.com'
            );
          }}
        >
          <MaterialIcons
            name="password"
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
            Reset Password
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Logout and Delete Account Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <ThemedText type="button" style={styles.logoutButtonText}>
            Logout
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={deleteAccount}>
          <ThemedText type="button" style={styles.logoutButtonText}>
            Delete Account
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
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  backIcon: {
    padding: 5,
  },
  headerRightPlaceholder: {
    width: 34, // Adjust this width as necessary to balance the back icon
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
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  userName: {
    fontSize: 22,
    fontWeight: '600',
  },
  changePicButton: {
    marginTop: 10,
  },
  changePicButtonText: {
    fontSize: 16,
    color: '#007bff',
    textDecorationLine: 'underline',
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
    marginBottom: 20,
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
