import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from './navigation/types';
import {WelcomeScreen} from './screens/WelcomeScreen';
import {UserSelectionScreen} from './screens/UserSelectionScreen';
import {HomeScreen} from './screens/HomeScreen';
import {SuggestionRequestScreen} from './screens/SuggestionRequestScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): JSX.Element {
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

export default App;
