import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import * as RootNavigation from '../navigation/RootNavigation';

const API_URL = 'https://todo-app.freecoderteam.com/api';  // Update this to your Laravel API URL

const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const expiryTime = await AsyncStorage.getItem('tokenExpiry');
    
    if (!token || !expiryTime) {
      return null;
    }

    // Check if token has expired
    if (new Date().getTime() > parseInt(expiryTime)) {
      await clearAuth();
      RootNavigation.navigate('Login');
      return null;
    }

    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

const setAuthToken = async (token) => {
  try {
    await AsyncStorage.setItem('authToken', token);
    // Set token expiry to 24 hours from now
    const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000);
    await AsyncStorage.setItem('tokenExpiry', expiryTime.toString());
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
};

const clearAuth = async () => {
  try {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('tokenExpiry');
  } catch (error) {
    console.error('Error clearing auth:', error);
  }
};

// API request wrapper with token handling
const apiRequest = async (endpoint, options = {}) => {
  const token = await getAuthToken();
  
  if (!token && endpoint !== '/login') {
    RootNavigation.navigate('Login');
    throw new Error('Authentication required');
  }

  const requestOptions = {
    ...options,
    headers: {
      ...headers,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, requestOptions);
    
    if (response.status === 401) {
      await clearAuth();
      RootNavigation.navigate('Login');
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    if (options.method === 'DELETE') {
      return true;
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

const api = {
  login: async (email, password) => {
    try {
      const data = await apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      if (data.token) {
        await setAuthToken(data.token);
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await apiRequest('/logout', { method: 'POST' });
      await clearAuth();
    } catch (error) {
      // Clear auth even if logout fails
      await clearAuth();
      throw error;
    }
  },

  getTasks: async () => {
    return await apiRequest('/tasks');
  },

  getCategories: async () => {
    return await apiRequest('/categories');
  },

  createTask: async (taskData) => {
    return await apiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  updateTask: async (taskId, taskData) => {
    return await apiRequest(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  },

  updateTaskStatus: async (taskId, status) => {
    try {
      return await apiRequest(`/tasks/${taskId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      console.error('Update task status error:', error);
      throw error;
    }
  },

  deleteTask: async (taskId) => {
    try {
      await apiRequest(`/tasks/${taskId}`, { method: 'DELETE' });
      Alert.alert('Success', 'Task deleted successfully');
      return true;
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to delete task');
      throw error;
    }
  },

  // Expense API endpoints
  getExpenseDashboard: async () => {
    return await apiRequest('/expenses/dashboard');
  },

  getExpenses: async () => {
    return await apiRequest('/expenses');
  },

  createExpense: async (expenseData) => {
    return await apiRequest('/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  },

  updateExpense: async (expenseId, expenseData) => {
    return await apiRequest(`/expenses/${expenseId}`, {
      method: 'PUT',
      body: JSON.stringify(expenseData),
    });
  },

  deleteExpense: async (expenseId) => {
    return await apiRequest(`/expenses/${expenseId}`, {
      method: 'DELETE',
    });
  },
};

export default api;
