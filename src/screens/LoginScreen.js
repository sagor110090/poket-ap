import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [savedCredentials, setSavedCredentials] = useState(null);
  const [lastLoggedInUser, setLastLoggedInUser] = useState(null);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  useEffect(() => {
    checkBiometricSupport();
    loadSavedCredentials();
    loadLastLoggedInUser();
    StatusBar.setBarStyle('dark-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#F8F9FD');
    }
  }, []);

  const checkBiometricSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    setIsBiometricSupported(compatible);
  };

  const loadLastLoggedInUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('lastLoggedInUser');
      if (userData) {
        const user = JSON.parse(userData);
        setLastLoggedInUser(user);
        setEmail(user.email); // Pre-fill email field
      }
    } catch (error) {
      console.error('Error loading last logged in user:', error);
    }
  };

  const loadSavedCredentials = async () => {
    try {
      const credentials = await AsyncStorage.getItem('savedCredentials');
      if (credentials) {
        setSavedCredentials(JSON.parse(credentials));
      }
    } catch (error) {
      console.error('Error loading saved credentials:', error);
    }
  };

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleBiometricAuth = async () => {
    if (!lastLoggedInUser || !savedCredentials) {
      Alert.alert('Error', 'Please login with email and password first');
      return;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Login as ${lastLoggedInUser.name}`,
        disableDeviceFallback: true,
      });

      if (result.success) {
        setIsLoading(true);
        try {
          const response = await api.login(
            savedCredentials.email,
            savedCredentials.password
          );
          await AsyncStorage.setItem('token', response.token);
          await authLogin({ name: response.name });
          
          // Update last logged in user
          const userData = { name: response.name, email: savedCredentials.email };
          await AsyncStorage.setItem('lastLoggedInUser', JSON.stringify(userData));
          
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainApp' }],
          });
        } catch (error) {
          Alert.alert('Error', error.message || 'Login failed');
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Biometric authentication failed');
    }
  };

  const handleLogin = async () => {
    // Reset errors
    setEmailError(false);
    setPasswordError(false);

    // Validate inputs
    if (!email.trim() || !validateEmail(email)) {
      setEmailError(true);
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!password.trim() || password.length < 6) {
      setPasswordError(true);
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.login(email, password);
      await AsyncStorage.setItem('token', response.token);
      await authLogin({ name: response.name });
      
      // Save credentials for biometric login
      const credentials = { email, password };
      await AsyncStorage.setItem('savedCredentials', JSON.stringify(credentials));
      
      // Save last logged in user
      const userData = { name: response.name, email };
      await AsyncStorage.setItem('lastLoggedInUser', JSON.stringify(userData));
      
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainApp' }],
      });
    } catch (error) {
      Alert.alert('Error', error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const renderBiometricButton = () => {
    if (!isBiometricSupported || !lastLoggedInUser) return null;

    return (
      <View style={styles.biometricContainer}>
        <Text style={styles.biometricText}>
          {`Quick login as ${lastLoggedInUser.name}`}
        </Text>
        <TouchableOpacity
          style={styles.biometricButton}
          onPress={handleBiometricAuth}
        >
          <Ionicons name="finger-print" size={32} color="#2196F3" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.scrollContainer}
      >
        <View style={styles.header}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logo}
          />
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>
            Sign in to continue managing your tasks
          </Text>
        </View>

        <View style={styles.input}>
          <Icon name="email-outline" size={20} color="#666" style={{ marginRight: 12 }} />
          <TextInput
            style={{ flex: 1 }}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>
        {emailError && (
          <Text style={styles.inputError}>Please enter a valid email</Text>
        )}

        <View style={styles.passwordContainer}>
          <Icon name="lock-outline" size={20} color="#666" style={{ marginRight: 12 }} />
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter your password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={styles.togglePasswordButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Icon
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color="#666"
            />
          </TouchableOpacity>
        </View>
        {passwordError && (
          <Text style={styles.inputError}>
            Password must be at least 6 characters
          </Text>
        )}

        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.loginButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        {renderBiometricButton()}

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Register</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FD',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 40 : 60,
    marginBottom: 40,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    height: 56,
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputError: {
    borderColor: '#FF5252',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 24,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
  },
  loginButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  biometricContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F0F7FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  biometricText: {
    fontSize: 16,
    color: '#1976D2',
    marginBottom: 12,
    fontWeight: '500',
  },
  biometricButton: {
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  registerText: {
    fontSize: 16,
    color: '#666',
  },
  registerLink: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
    marginLeft: 4,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  togglePasswordButton: {
    position: 'absolute',
    right: 16,
  },
});

export default LoginScreen;
