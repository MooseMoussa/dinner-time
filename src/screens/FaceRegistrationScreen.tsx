import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/types';
import {FacialRecognitionAPI} from '@api/FacialRecognitionAPI';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'FaceRegistration'>;
  route: RouteProp<RootStackParamList, 'FaceRegistration'>;
};

export const FaceRegistrationScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const {userId} = route.params;
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegisterFace = async () => {
    setIsRegistering(true);

    try {
      // Simulate face capture and registration
      // In production, this would use device camera
      const faceAPI = FacialRecognitionAPI.getInstance();

      // Mock face descriptor (in production, captured from camera)
      const mockFaceDescriptor = Buffer.from(
        `face-descriptor-${userId}-${Date.now()}`,
      );

      const response = await faceAPI.registerFace(userId, mockFaceDescriptor, {
        imageQuality: 0.9,
        lightingConditions: 'good' as const,
      });

      if (response.success) {
        Alert.alert(
          'Success!',
          'Face ID has been set up successfully',
          [
            {
              text: 'Continue',
              onPress: () => navigation.replace('Home', {userId}),
            },
          ],
          {cancelable: false},
        );
      } else {
        Alert.alert('Error', 'Failed to register face. Please try again.');
        setIsRegistering(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to register face. Please try again.');
      setIsRegistering(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Face ID?',
      'You can always add Face ID later from Settings',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Skip',
          onPress: () => navigation.replace('Home', {userId}),
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>📸</Text>
        <Text style={styles.title}>Set Up Face ID</Text>
        <Text style={styles.subtitle}>
          Position your face within the frame for secure login
        </Text>

        <View style={styles.cameraPlaceholder}>
          <View style={styles.faceFrame}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
            <Text style={styles.faceEmoji}>😊</Text>
          </View>
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>Tips for best results:</Text>
          <View style={styles.instructionItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.instructionText}>
              Make sure your face is well-lit
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.instructionText}>
              Remove glasses if possible
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.instructionText}>
              Look directly at the camera
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.instructionText}>
              Keep a neutral expression
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.captureButton, isRegistering && styles.disabledButton]}
          onPress={handleRegisterFace}
          disabled={isRegistering}>
          <Text style={styles.captureButtonText}>
            {isRegistering ? 'Registering...' : 'Capture Face'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip for Now</Text>
        </TouchableOpacity>
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
    fontSize: 60,
    marginBottom: 16,
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
  cameraPlaceholder: {
    width: 300,
    height: 400,
    backgroundColor: '#1F2937',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  faceFrame: {
    width: 200,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  faceEmoji: {
    fontSize: 120,
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#10B981',
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#10B981',
    borderTopRightRadius: 8,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#10B981',
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#10B981',
    borderBottomRightRadius: 8,
  },
  instructions: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#6366F1',
    marginRight: 8,
    fontWeight: '700',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  captureButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
    maxWidth: 400,
  },
  disabledButton: {
    opacity: 0.6,
  },
  captureButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  skipButton: {
    padding: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
});
