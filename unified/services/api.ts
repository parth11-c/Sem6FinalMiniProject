import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Get the correct base URL based on platform and environment
const getBaseUrl = () => {
  // Get the current running environment
  const debuggerHost = Constants.expoConfig?.hostUri || '192.168.1.4:8082';
  const localhost = debuggerHost.split(':')[0];

  if (__DEV__) {
    if (Platform.OS === 'android') {
      // Android Studio Emulator
      return 'http://10.0.2.2:8082/api';
    } else if (Platform.OS === 'ios') {
      // iOS Simulator
      return `http://${localhost}:8082/api`;
    } else {
      // Web or physical device
      return `http://${localhost}:8082/api`;
    }
  }
  // Production environment
  return 'http://192.168.1.4:8082/api';
};

// Create an axios instance with default config
const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 second timeout
  withCredentials: true
});

// API endpoints
export const authApi = {
  login: async (username: string, password: string) => {
    try {
      console.log('Attempting login with config:', {
        baseURL: api.defaults.baseURL,
        platform: Platform.OS,
        dev: __DEV__
      });
      const response = await api.post('/auth/signin', { 
        username: username,
        password: password 
      });
      if (response.data.token) {
        await AsyncStorage.setItem('userToken', response.data.token);
      }
      return response;
    } catch (error: any) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        baseURL: api.defaults.baseURL,
        platform: Platform.OS,
        dev: __DEV__
      });
      throw error;
    }
  },
  register: async (userData: { username: string; email: string; password: string }) => {
    try {
      console.log('Attempting registration with config:', {
        baseURL: api.defaults.baseURL,
        platform: Platform.OS,
        dev: __DEV__
      });
      const response = await api.post('/auth/signup', {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        role: ["user"]
      });
      return response;
    } catch (error: any) {
      console.error('Registration error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        baseURL: api.defaults.baseURL,
        platform: Platform.OS,
        dev: __DEV__
      });
      throw error;
    }
  },
  logout: async () => {
    try {
      await AsyncStorage.removeItem('userToken');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
};

export const userApi = {
  getUsers: () => api.get('/users'),
  getUserById: (id: string) => api.get(`/users/${id}`),
  getCurrentUser: () => api.get('/users/me'),
  updateUserProfile: (userData: any) => api.put('/users/me', userData),
  createUser: (userData: any) => api.post('/users', userData),
  updateUser: (id: string, userData: any) => api.put(`/users/${id}`, userData),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
};

// Add request interceptor for authentication
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // Log request details
      console.log('Making request with config:', {
        url: config.url,
        method: config.method,
        baseURL: config.baseURL,
        platform: Platform.OS,
        dev: __DEV__
      });
      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('Received response:', {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
      platform: Platform.OS,
      dev: __DEV__
    });
    return response;
  },
  async (error) => {
    if (error.response) {
      console.error('Response error:', {
        url: error.config?.url,
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        platform: Platform.OS,
        dev: __DEV__
      });
      
      if (error.response.status === 401) {
        // Handle unauthorized access
        await AsyncStorage.removeItem('userToken');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network error:', {
        url: error.config?.url,
        message: error.message,
        code: error.code,
        platform: Platform.OS,
        dev: __DEV__
      });
    } else {
      // Something happened in setting up the request
      console.error('Error:', {
        message: error.message,
        config: error.config,
        platform: Platform.OS,
        dev: __DEV__
      });
    }
    return Promise.reject(error);
  }
);

export default api; 