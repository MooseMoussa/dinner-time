import React, {useEffect, useState} from 'react';
import {View, Text, ActivityIndicator, StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {RootStackParamList} from './navigation/types';
import {WelcomeScreen} from './screens/WelcomeScreen';
import {UserSelectionScreen} from './screens/UserSelectionScreen';
import {ProfileSetupScreen} from './screens/ProfileSetupScreen';
import {FaceRegistrationScreen} from './screens/FaceRegistrationScreen';
import {HomeScreen} from './screens/HomeScreen';
import {SuggestionRequestScreen} from './screens/SuggestionRequestScreen';
import {DatabaseService} from '@services/DatabaseService';

const Stack = createStackNavigator<RootStackParamList>();

function App(): JSX.Element {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const db = DatabaseService.getInstance();
      await db.initialize();
      setIsInitializing(false);
    } catch (error) {
      console.error('Failed to initialize app:', error);
      setInitError(error instanceof Error ? error.message : 'Unknown error');
      setIsInitializing(false);
    }
  };

  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.emoji}>🍽️</Text>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Initializing Dinner Time...</Text>
      </View>
    );
  }

  if (initError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorTitle}>Initialization Failed</Text>
        <Text style={styles.errorMessage}>{initError}</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerStyle: {backgroundColor: '#6366F1'},
          headerTintColor: '#fff',
          headerTitleStyle: {fontWeight: 'bold'},
        }}>
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="UserSelection"
          component={UserSelectionScreen}
          options={{title: 'Select Profile'}}
        />
        <Stack.Screen
          name="ProfileSetup"
          component={ProfileSetupScreen}
          options={{title: 'Create Profile'}}
        />
        <Stack.Screen
          name="FaceRegistration"
          component={FaceRegistrationScreen}
          options={{title: 'Face ID Setup'}}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{title: 'Home', headerShown: false}}
        />
        <Stack.Screen
          name="SuggestionRequest"
          component={SuggestionRequestScreen}
          options={{title: 'Request Suggestions'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 20,
  },
  errorEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: '#991B1B',
    textAlign: 'center',
  },
});

export default App;
