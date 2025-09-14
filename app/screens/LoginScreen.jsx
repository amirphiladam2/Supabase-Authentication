import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useAuth } from '../../hooks/useAuth';
import CustomButton from '../../components/CustomButton';
import InputField from '../../components/InputField';
import GeometricBackground from '../../components/GeometricBackground';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signInWithGoogle, loading } = useAuth();

  const loginImage = require('../../assets/images/logo.png');

  // Handle deep linking for OAuth callback
  useEffect(() => {
    const handleUrl = (url) => {
      if (url?.includes('#access_token=')) {
        console.log('OAuth callback received:', url);
        router.replace('/(tabs)/home');
      }
    };

    const subscription = Linking.addEventListener('url', (event) => {
      handleUrl(event.url);
    });

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });

    return () => subscription?.remove();
  }, []);

  const validateLogin = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateLogin()) return;

    try {
      const result = await signIn(email, password);
      
      if (result.error) {
        Alert.alert('Login Failed', result.error.message);
      } else {
        Alert.alert('Success', 'Logged in successfully!');
        router.replace('/(tabs)/home');
      }
    } catch (err) {
      Alert.alert('Error', 'Login failed. Please try again.');
      console.error('Login error:', err);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await signInWithGoogle();

      if (error) {
        Alert.alert('Google Sign-In Failed', error.message);
        return;
      }

      if (data?.url) {
        await WebBrowser.openAuthSessionAsync(data.url, 'caloriee://auth');
      }
    } catch (err) {
      Alert.alert('Error', 'Google sign-in failed. Please try again.');
      console.error('Google sign-in error:', err);
    }
  };

  const navigateToRegister = () => {
    router.push('screens/Register');
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password functionality
    Alert.alert('Forgot Password', 'This feature will be available soon!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <GeometricBackground />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.imageContainer}>
              <Image
                source={loginImage}
                style={styles.loginImage}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.title}>Welcome Back!</Text>

            <View style={styles.inputContainer}>
              <InputField
                label="Email ID"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                icon={
                  <MaterialIcons
                    name="alternate-email"
                    size={20}
                    color="#666"
                    style={styles.inputIcon}
                  />
                }
              />

              <InputField
                label="Password"
                value={password}
                onChangeText={setPassword}
                icon={
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#666"
                    style={styles.inputIcon}
                  />
                }
                inputType="password"
              />

              <TouchableOpacity 
                style={styles.forgotPasswordContainer}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPassword}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
            
            <CustomButton 
              label={loading ? "Logging in..." : "Login"}
              onPress={handleLogin}
              disabled={loading}
              containerStyle={styles.loginButton}
            />

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              onPress={handleGoogleSignIn}
              disabled={loading}
              style={styles.googleButton}
            >
              <Image
                source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
                style={styles.googleIcon}
                resizeMode="contain"
              />
              <Text style={styles.googleButtonText}>
                {loading ? 'Loading...' : 'Continue with Google'}
              </Text>
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>New to the app?</Text>
              <TouchableOpacity onPress={navigateToRegister}>
                <Text style={styles.registerLink}> Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 25,
    paddingVertical: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loginImage: {
    height: 270,
    width: 270,
    transform: [{ rotate: '-5deg' }],
  },
  title: {
    fontFamily: 'Roboto-Medium',
    fontSize: 28,
    fontWeight: '600',
    color: '#333',
    marginBottom: 25,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputIcon: {
    marginRight: 5,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: 10,
  },
  forgotPassword: {
    color: '#1cca6aff',
    fontWeight: '500',
    fontSize: 14,
  },
  loginButton: {
    marginTop: 10,
    marginBottom: 25,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#666',
    fontSize: 15,
  },
  registerLink: {
    color: '#1cca6aff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default LoginScreen;