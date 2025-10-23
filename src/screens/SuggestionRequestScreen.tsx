import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/types';
import {SuggestionAPI} from '@api/SuggestionAPI';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SuggestionRequest'>;
  route: RouteProp<RootStackParamList, 'SuggestionRequest'>;
};

export const SuggestionRequestScreen: React.FC<Props> = ({navigation, route}) => {
  const {userId, profileId} = route.params;
  const [source, setSource] = useState<'cook_at_home' | 'go_out' | null>(null);
  const [loading, setLoading] = useState(false);

  const generateSuggestions = async () => {
    if (!source) {
      Alert.alert('Selection Required', 'Please choose cook at home or go out');
      return;
    }

    setLoading(true);
    const api = SuggestionAPI.getInstance();

    const response = await api.generateSuggestions({
      userId,
      preferenceProfileId: profileId,
      source,
    });

    setLoading(false);

    if (response.success && response.data) {
      navigation.navigate('SuggestionsList', {
        userId,
        requestId: response.data.requestId,
      });
    } else {
      Alert.alert('Error', response.error?.message || 'Failed to generate suggestions');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>What's your plan?</Text>
      <Text style={styles.subtitle}>Choose how you want to enjoy your meal</Text>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[
            styles.optionCard,
            source === 'cook_at_home' && styles.selectedOption,
          ]}
          onPress={() => setSource('cook_at_home')}>
          <Text style={styles.optionEmoji}>🍳</Text>
          <Text style={styles.optionTitle}>Cook at Home</Text>
          <Text style={styles.optionDescription}>
            Get personalized recipes based on your preferences and available ingredients
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionCard,
            source === 'go_out' && styles.selectedOption,
          ]}
          onPress={() => setSource('go_out')}>
          <Text style={styles.optionEmoji}>🍴</Text>
          <Text style={styles.optionTitle}>Go Out</Text>
          <Text style={styles.optionDescription}>
            Discover nearby restaurants matching your taste and dietary needs
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.generateButton, !source && styles.disabledButton]}
        onPress={generateSuggestions}
        disabled={!source || loading}>
        <Text style={styles.generateButtonText}>
          {loading ? 'Generating...' : 'Get Suggestions'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  selectedOption: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  optionEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  generateButton: {
    backgroundColor: '#6366F1',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  generateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
