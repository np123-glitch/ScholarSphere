// SecureTab.tsx
import React, { useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import { useAuthSession } from '@/components/AuthProvider';
import { useRouter } from 'expo-router';
import axios from 'axios';
import Config from '@/components/Config';
import { HapticTab } from '@/components/HapticTab';

interface SecureTabProps {
  children: React.ReactNode;
  routeName: string;
  onPress?: () => void;
  [key: string]: any; // To allow other props
}

const SecureTab: React.FC<SecureTabProps> = ({ children, routeName, onPress, ...props }) => {
  const { token, signOut } = useAuthSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);

  const handlePress = async () => {
    setIsChecking(true);
    try {
      const response = await axios.get(`${Config.API_BASE_URL}/checkexpired`, {
        headers: {
          Authorization: `Bearer ${token.current}`,
        },
      });

      if (response.status === 200) {
        // Token is valid, proceed with navigation
        if (onPress) {
          onPress();
        } else {
          // Default navigation if onPress is not provided
          router.push(`/${routeName}`);
        }
      } else {
        throw new Error('Token expired');
      }
    } catch (error: any) {
      console.error('Token check failed:', error);
      Alert.alert('Session Expired', 'Please log in again.');
      signOut();
      router.replace('/login'); // Adjust the path to your login screen if different
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <HapticTab onPress={handlePress} {...props}>
      {isChecking ? <ActivityIndicator size="small" color="#fff" /> : children}
    </HapticTab>
  );
};

export default SecureTab;
