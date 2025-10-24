import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import {FacialRecognitionAPI} from '@api/FacialRecognitionAPI';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'FaceLogin'>;
};

export const FaceLoginScreen: React.FC<Props> = ({navigation}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFaceScan = async () => {
    setIsScanning(true);
    setIsProcessing(true);

    try {
      // Simulate face capture and recognition
      // In production, this would use device camera
      const faceAPI = FacialRecognitionAPI.getInstance();

      // Mock face data (in production, captured from camera)
      const mockImageData = `data:image/jpeg;base64,mockdata${Date.now()}`;

      const response = await faceAPI.identifyFace({
        imageData: mockImageData,
        maxResults: 1,
      });

      if (response.success && response.data && response.data.matches && response.data.matches.length > 0) {
        // Face recognized, navigate to home
        const userId = response.data.matches[0].userId;
        navigation.replace('Home', {userId});
      } else {
        Alert.alert(
          'Face Not Recognized',
          'No matching profile found. Please try again or use manual login.',
          [
            {
              text: 'Try Again',
              onPress: () => {
                setIsScanning(false);
                setIsProcessing(false);
              },
            },
            {
              text: 'Manual Login',
              onPress: () => navigation.navigate('UserSelection'),
            },
          ],
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to scan face. Please try again.');
      setIsScanning(false);
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    // Auto-start scanning when screen loads
    const timer = setTimeout(() => {
      handleFaceScan();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>👤</Text>
      <Text style={styles.title}>Face Login</Text>
      <Text style={styles.subtitle}>
        Position your face within the frame to log in
      </Text>

      <View style={styles.cameraPlaceholder}>
        <View style={styles.faceFrame}>
          <View style={styles.cornerTL} />
          <View style={styles.cornerTR} />
          <View style={styles.cornerBL} />
          <View style={styles.cornerBR} />
          {isProcessing ? (
            <ActivityIndicator size="large" color="#10B981" />
          ) : (
            <Text style={styles.faceEmoji}>😊</Text>
          )}
        </View>
      </View>

      <View style={styles.statusContainer}>
        {isProcessing ? (
          <>
            <ActivityIndicator size="small" color="#6366F1" />
            <Text style={styles.statusText}>Scanning face...</Text>
          </>
        ) : (
          <Text style={styles.statusText}>Ready to scan</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.retryButton}
        onPress={handleFaceScan}
        disabled={isProcessing}>
        <Text style={styles.retryButtonText}>
          {isProcessing ? 'Scanning...' : 'Retry Scan'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.manualButton}
        onPress={() => navigation.navigate('UserSelection')}>
        <Text style={styles.manualButtonText}>Use Manual Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusText: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 8,
  },
  retryButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  manualButton: {
    padding: 16,
    alignItems: 'center',
  },
  manualButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
});
