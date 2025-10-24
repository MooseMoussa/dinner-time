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
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/types';
import {UserProfileAPI} from '@api/UserProfileAPI';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ProfileSetup'>;
  route: RouteProp<RootStackParamList, 'ProfileSetup'>;
};

export const ProfileSetupScreen: React.FC<Props> = ({navigation}) => {
  const [name, setName] = useState('');
  const [enableFaceID, setEnableFaceID] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name for your profile');
      return;
    }

    setIsCreating(true);

    try {
      const userAPI = UserProfileAPI.getInstance();
      const response = await userAPI.createUser({name: name.trim()});

      if (!response.success || !response.data) {
        Alert.alert('Error', 'Failed to create profile');
        setIsCreating(false);
        return;
      }

      const userId = response.data.userId;

      // If user wants Face ID, navigate to registration screen
      if (enableFaceID) {
        navigation.replace('FaceRegistration', {userId});
      } else {
        // Skip Face ID and go straight to home
        navigation.replace('Home', {userId});
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create profile');
      setIsCreating(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>👤</Text>
        <Text style={styles.title}>Create Your Profile</Text>
        <Text style={styles.subtitle}>
          Let's set up your personalized dinner experience
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>What's your name?</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
            autoFocus
            returnKeyType="done"
          />

          <View style={styles.faceIDSection}>
            <View style={styles.faceIDHeader}>
              <View style={styles.faceIDInfo}>
                <Text style={styles.faceIDTitle}>Enable Face ID Login 🔐</Text>
                <Text style={styles.faceIDDescription}>
                  Quick and secure login using facial recognition
                </Text>
              </View>
              <Switch
                value={enableFaceID}
                onValueChange={setEnableFaceID}
                trackColor={{false: '#D1D5DB', true: '#93C5FD'}}
                thumbColor={enableFaceID ? '#3B82F6' : '#F3F4F6'}
              />
            </View>

            {enableFaceID && (
              <View style={styles.faceIDNote}>
                <Text style={styles.noteEmoji}>ℹ️</Text>
                <Text style={styles.noteText}>
                  You'll be asked to capture your face on the next screen. This
                  is optional and you can skip it anytime.
                </Text>
              </View>
            )}

            {!enableFaceID && (
              <View style={styles.skipNote}>
                <Text style={styles.skipText}>
                  You can always add Face ID later from Settings
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.createButton, isCreating && styles.disabledButton]}
            onPress={handleCreateProfile}
            disabled={isCreating}>
            <Text style={styles.createButtonText}>
              {isCreating
                ? 'Creating...'
                : enableFaceID
                ? 'Continue to Face ID Setup'
                : 'Create Profile'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  label: {
    fontSize: 16,
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
    marginBottom: 24,
  },
  faceIDSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  faceIDHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faceIDInfo: {
    flex: 1,
    marginRight: 12,
  },
  faceIDTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  faceIDDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  faceIDNote: {
    flexDirection: 'row',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  noteEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  skipNote: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  skipText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  createButton: {
    backgroundColor: '#6366F1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
});
