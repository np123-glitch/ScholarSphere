import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  View,
  Alert,
  Linking,
  Image,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthSession } from '@/components/AuthProvider';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import {
  ArrowLeft,
  Camera,
  Mail,
  Lock,
  Shield,
  LogOut,
  Trash2,
  ChevronRight,
  User as UserIcon, // <-- Import "User" icon from lucide-react-native
} from 'lucide-react-native';
import { decodeJwt } from '@/utils/decodeJwt';
import Config from '@/components/Config';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Profile() {
  const router = useRouter();
  const systemColorScheme = useColorScheme() || 'light';
  const [isDarkMode] = useState(systemColorScheme === 'dark');
  const { signOut, token } = useAuthSession();

  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

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
      }
    };
    loadProfilePic();
  }, []);

  // Decode JWT to get user info
  useEffect(() => {
    if (token.current) {
      const decodedToken = decodeJwt(token.current);
      setUserName(decodedToken?.name || decodedToken?.sub || null);
      setIsLoading(false);
    } else {
      setUserName(null);
      setIsLoading(false);
    }
  }, [token]);

  // Pick and upload a new profile picture
  const pickProfilePicture = async () => {
    try {
      setImageLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const localUri = result.assets[0].uri;
        const filename = localUri.split('/').pop() || 'profile.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image';

        const formData = new FormData();
        formData.append('file', {
          uri: localUri,
          name: filename,
          type: type,
        } as any);

        // Adjust this to your server's upload endpoint
        const response = await fetch(`${Config.API_BASE_URL}/upload-profile-picture`, {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token.current}`,
          },
          body: formData,
        });
        const data = await response.json();
        if (response.ok) {
          // data.url should be a FULLY QUALIFIED URL accessible by your device
          setProfilePic(data.url);
          await AsyncStorage.setItem('profilePicture', data.url);
        } else {
          Alert.alert(
            'Upload Error',
            data.message || 'Failed to upload profile picture.'
          );
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick or upload image.');
    } finally {
      setImageLoading(false);
    }
  };

  // Reusable menu button component
  const MenuButton = ({
    icon: Icon,
    title,
    onPress,
    color = isDarkMode ? '#fff' : '#000',
  }) => (
    <TouchableOpacity
      style={[
        styles.menuButton,
        isDarkMode ? styles.menuButtonDark : styles.menuButtonLight,
      ]}
      onPress={onPress}
    >
      <View style={styles.menuButtonContent}>
        <Icon size={20} color={color} />
        <ThemedText type="body" style={styles.menuButtonText}>
          {title}
        </ThemedText>
      </View>
      <ChevronRight size={20} color={isDarkMode ? '#4B5563' : '#9CA3AF'} />
    </TouchableOpacity>
  );

  return (
    <ThemedView
      style={[styles.container, isDarkMode ? styles.containerDark : styles.containerLight]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color={isDarkMode ? '#fff' : '#000'} />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity
            style={styles.profileImageContainer}
            onPress={pickProfilePicture}
            disabled={imageLoading}
          >
            {profilePic ? (
              <Image source={{ uri: profilePic }} style={styles.profileImage} />
            ) : (
              // If there's no profile pic, show a user icon
              <View
                style={[
                  styles.profileImagePlaceholder,
                  isDarkMode ? styles.placeholderDark : styles.placeholderLight,
                ]}
              >
                <UserIcon size={48} color={isDarkMode ? '#fff' : '#000'} />
              </View>
            )}
            <View
              style={[
                styles.cameraButton,
                isDarkMode ? styles.cameraButtonDark : styles.cameraButtonLight,
              ]}
            >
              <Camera size={16} color={isDarkMode ? '#fff' : '#000'} />
            </View>
          </TouchableOpacity>

          <ThemedText type="title" style={styles.userName}>
            {isLoading ? <ActivityIndicator size="small" /> : userName || 'User'}
          </ThemedText>
        </View>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          <MenuButton
            icon={Shield}
            title="Privacy Policy"
            onPress={() =>
              Linking.openURL(
                'https://www.termsfeed.com/live/d32c2fc6-6161-4437-8e1f-9ed144282fab'
              )
            }
          />
          <MenuButton
            icon={Mail}
            title="Contact Us"
            onPress={() =>
              Alert.alert('Contact Information', 'Email: neelprasad2008@gmail.com')
            }
          />
          <MenuButton
            icon={Lock}
            title="Reset Password"
            onPress={() =>
              Alert.alert(
                'Send an email to reset your password',
                'Email: neelprasad2008@gmail.com'
              )
            }
          />
          {/* Add more MenuButtons if needed */}
        </View>

        {/* Add extra space at the bottom of the scroll */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer Actions (Pinned to Bottom) */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.footerButton, styles.logoutButton]}
          onPress={() => {
            Alert.alert('Logout', 'Are you sure you want to logout?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Logout',
                onPress: () => {
                  signOut();
                  router.replace('/login');
                },
                style: 'destructive',
              },
            ]);
          }}
        >
          <LogOut size={20} color="#fff" />
          <ThemedText style={styles.footerButtonText}>Logout</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.footerButton, styles.deleteButton]}
          onPress={() => {
            Alert.alert(
              'Delete Account',
              'This action cannot be undone. Are you sure?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  onPress: async () => {
                    try {
                      const response = await fetch(
                        `${Config.API_BASE_URL}/auth/delete-account`,
                        {
                          method: 'POST',
                          headers: {
                            Authorization: `Bearer ${token.current}`,
                          },
                        }
                      );
                      if (response.ok) {
                        signOut();
                        router.replace('/login');
                      }
                    } catch (error) {
                      Alert.alert('Error', 'Failed to delete account.');
                    }
                  },
                  style: 'destructive',
                },
              ]
            );
          }}
        >
          <Trash2 size={20} color="#fff" />
          <ThemedText style={styles.footerButtonText}>Delete Account</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  containerLight: {
    backgroundColor: '#F9FAFB',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderLight: {
    backgroundColor: '#E5E7EB',
  },
  placeholderDark: {
    backgroundColor: '#374151',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButtonLight: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cameraButtonDark: {
    backgroundColor: '#374151',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  menuSection: {
    gap: 12,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuButtonLight: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuButtonDark: {
    backgroundColor: '#1F2937',
  },
  menuButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    gap: 12,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  footerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#6366F1',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
});
