import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import {AuthenticationService} from '@services/AuthenticationService';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Auth'>;
};

export const AuthScreen: React.FC<Props> = ({navigation}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState(''); // email or phone
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saveCredentials, setSaveCredentials] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [identifierType, setIdentifierType] = useState<'email' | 'phone'>(
    'email',
  );

  const handleSubmit = async () => {
    if (isLogin) {
      await handleLogin();
    } else {
      await handleRegister();
    }
  };

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    const authService = AuthenticationService.getInstance();
    const result = await authService.login({
      identifier,
      password,
      saveCredentials,
    });

    setIsLoading(false);

    if (result.success && result.userId) {
      // Navigate to home
      navigation.replace('Home', {userId: result.userId});
    } else {
      Alert.alert('Login Failed', result.error || 'Invalid credentials');
    }
  };

  const handleRegister = async () => {
    if (!name || !identifier || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    const authService = AuthenticationService.getInstance();

    const registrationData = {
      name,
      [identifierType]: identifier,
      password,
      saveCredentials,
    };

    const result = await authService.register(registrationData);

    setIsLoading(false);

    if (result.success && result.userId) {
      Alert.alert('Success', 'Account created successfully!', [
        {
          text: 'Continue',
          onPress: () => navigation.replace('Home', {userId: result.userId}),
        },
      ]);
    } else {
      Alert.alert('Registration Failed', result.error || 'Please try again');
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    // Clear fields when switching modes
    setPassword('');
    setConfirmPassword('');
  };

  const detectIdentifierType = (text: string) => {
    setIdentifier(text);
    // Auto-detect if it looks like email or phone
    if (text.includes('@')) {
      setIdentifierType('email');
    } else if (/^\+?[\d\s\-()]+$/.test(text)) {
      setIdentifierType('phone');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text style={styles.emoji}>🍽️</Text>
          <Text style={styles.title}>Dinner Time</Text>
          <Text style={styles.subtitle}>
            {isLogin
              ? 'Welcome back! Sign in to continue'
              : 'Create your account to get started'}
          </Text>

          <View style={styles.form}>
            {/* Mode Toggle */}
            <View style={styles.modeToggle}>
              <TouchableOpacity
                style={[styles.modeButton, isLogin && styles.modeButtonActive]}
                onPress={() => setIsLogin(true)}>
                <Text
                  style={[
                    styles.modeButtonText,
                    isLogin && styles.modeButtonTextActive,
                  ]}>
                  Login
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, !isLogin && styles.modeButtonActive]}
                onPress={() => setIsLogin(false)}>
                <Text
                  style={[
                    styles.modeButtonText,
                    !isLogin && styles.modeButtonTextActive,
                  ]}>
                  Register
                </Text>
              </TouchableOpacity>
            </View>

            {/* Name field (register only) */}
            {!isLogin && (
              <>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </>
            )}

            {/* Email or Phone */}
            <Text style={styles.label}>Email or Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="email@example.com or +1234567890"
              placeholderTextColor="#9CA3AF"
              value={identifier}
              onChangeText={detectIdentifierType}
              autoCapitalize="none"
              keyboardType={
                identifierType === 'email' ? 'email-address' : 'phone-pad'
              }
              returnKeyType="next"
            />

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder={isLogin ? 'Enter password' : 'At least 8 characters'}
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType={isLogin ? 'done' : 'next'}
            />

            {/* Confirm Password (register only) */}
            {!isLogin && (
              <>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter password"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  returnKeyType="done"
                />
              </>
            )}

            {/* Save Credentials Toggle */}
            <View style={styles.saveCredentialsSection}>
              <View style={styles.saveCredentialsInfo}>
                <Text style={styles.saveCredentialsTitle}>
                  Remember me on this device
                </Text>
                <Text style={styles.saveCredentialsDescription}>
                  Stay logged in for faster access
                </Text>
              </View>
              <Switch
                value={saveCredentials}
                onValueChange={setSaveCredentials}
                trackColor={{false: '#D1D5DB', true: '#93C5FD'}}
                thumbColor={saveCredentials ? '#3B82F6' : '#F3F4F6'}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isLoading}>
              <Text style={styles.submitButtonText}>
                {isLoading
                  ? 'Please wait...'
                  : isLogin
                  ? 'Sign In'
                  : 'Create Account'}
              </Text>
            </TouchableOpacity>

            {/* Toggle Mode */}
            <View style={styles.toggleModeSection}>
              <Text style={styles.toggleModeText}>
                {isLogin
                  ? "Don't have an account? "
                  : 'Already have an account? '}
              </Text>
              <TouchableOpacity onPress={toggleMode}>
                <Text style={styles.toggleModeLink}>
                  {isLogin ? 'Register' : 'Login'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Skip to Profiles (temporary for testing) */}
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => navigation.navigate('UserSelection')}>
              <Text style={styles.skipButtonText}>
                Skip to Profile Selection
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  modeButtonActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  modeButtonTextActive: {
    color: '#6366F1',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    marginBottom: 16,
  },
  saveCredentialsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  saveCredentialsInfo: {
    flex: 1,
    marginRight: 12,
  },
  saveCredentialsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  saveCredentialsDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  submitButton: {
    backgroundColor: '#6366F1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  toggleModeSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  toggleModeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  toggleModeLink: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  skipButton: {
    padding: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
});
