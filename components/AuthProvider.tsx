// src/components/AuthProvider.tsx

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import Config from '@/components/Config';

interface AuthContextData {
  token: { current: string | null };
  isLoading: boolean;
  signIn: (loginId: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (username: string, email: string, password: string, realname: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({
  token: { current: null },
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
  signUp: async () => {},
});

const baseUrl = Config.API_BASE_URL;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<{ current: string | null }>({ current: null });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('authToken');
        if (storedToken) {
          setToken({ current: storedToken });
        }
      } catch (error) {
        console.error('Failed to load token:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  const signIn = async (loginId: string, password: string) => {
    try {
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ loginId, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to authenticate');
      }

      const data = await response.json();
      const receivedToken = data.token;

      await SecureStore.setItemAsync('authToken', receivedToken);
      setToken({ current: receivedToken });
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
      setToken({ current: null });
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const signUp = async (username: string, email: string, password: string, realname: string) => {
    try {
      const response = await fetch(`${baseUrl}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, realname }), 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register');
      }

      const data = await response.json();
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ token, isLoading, signIn, signOut, signUp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthSession = () => useContext(AuthContext);
