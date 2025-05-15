import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import { authApi } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    checkAuthState();
  }, []);

  useEffect(() => {
    const inAuthGroup = segments[0] === 'auth';
    const isRootRoute = segments.length === 0;
    const isProtectedRoute = segments[0] === '(tabs)';
    
    if (!isAuthenticated && isProtectedRoute) {
      // Only redirect to login if trying to access protected routes
      router.replace('/auth/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to the home page if authenticated and trying to access auth pages
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments]);

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Error checking auth state:', error);
      setIsAuthenticated(false);
    }
  };

  const signIn = async (username: string, password: string) => {
    try {
      const response = await authApi.login(username, password);
      if (response.data && response.data.token) {
        await AsyncStorage.setItem('userToken', response.data.token);
        setIsAuthenticated(true);
      } else {
        throw new Error('No token received from server');
      }
    } catch (error: any) {
      console.error('Error signing in:', error);
      // Extract the error message from the response if available
      const errorMessage = error.response?.data?.message || 'Login failed';
      throw new Error(errorMessage);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      // First try to register
      await authApi.register({
        username,
        email,
        password
      });
      
      // If registration is successful, try to sign in
      try {
        await signIn(username, password);
      } catch (signInError: any) {
        console.error('Registration successful but sign in failed:', signInError);
        // Extract the error message from the response if available
        const errorMessage = signInError.response?.data?.message || 'Login failed after registration';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error signing up:', error);
      // Extract the error message from the response if available
      const errorMessage = error.response?.data?.message || 'Registration failed';
      throw new Error(errorMessage);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      setIsAuthenticated(false);
      // Explicitly navigate to landing page after logout
      router.replace('/');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 