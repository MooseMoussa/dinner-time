import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/types';
import {UserProfileAPI} from '@api/UserProfileAPI';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Preferences'>;
  route: RouteProp<RootStackParamList, 'Preferences'>;
};

const DIETARY_OPTIONS = [
  {type: 'vegetarian', label: 'Vegetarian', emoji: '🥗'},
  {type: 'vegan', label: 'Vegan', emoji: '🌱'},
  {type: 'gluten-free', label: 'Gluten Free', emoji: '🌾'},
  {type: 'dairy-free', label: 'Dairy Free', emoji: '🥛'},
  {type: 'nut-free', label: 'Nut Free', emoji: '🥜'},
  {type: 'halal', label: 'Halal', emoji: '🕌'},
  {type: 'kosher', label: 'Kosher', emoji: '✡️'},
];

const CUISINE_OPTIONS = [
  {type: 'italian', label: 'Italian', emoji: '🍝'},
  {type: 'mexican', label: 'Mexican', emoji: '🌮'},
  {type: 'chinese', label: 'Chinese', emoji: '🥡'},
  {type: 'japanese', label: 'Japanese', emoji: '🍣'},
  {type: 'thai', label: 'Thai', emoji: '🍜'},
  {type: 'indian', label: 'Indian', emoji: '🍛'},
  {type: 'american', label: 'American', emoji: '🍔'},
  {type: 'french', label: 'French', emoji: '🥐'},
];

export const PreferencesScreen: React.FC<Props> = ({navigation, route}) => {
  const {userId} = route.params;
  const [profileName, setProfileName] = useState('My Preferences');
  const [selectedDietary, setSelectedDietary] = useState<Set<string>>(
    new Set(),
  );
  const [cuisinePreferences, setCuisinePreferences] = useState<
    Map<string, number>
  >(new Map());
  const [isSaving, setIsSaving] = useState(false);

  const toggleDietary = (type: string) => {
    const newSet = new Set(selectedDietary);
    if (newSet.has(type)) {
      newSet.delete(type);
    } else {
      newSet.add(type);
    }
    setSelectedDietary(newSet);
  };

  const setCuisineLevel = (type: string, level: number) => {
    const newMap = new Map(cuisinePreferences);
    if (level === 0) {
      newMap.delete(type);
    } else {
      newMap.set(type, level);
    }
    setCuisinePreferences(newMap);
  };

  const handleSave = async () => {
    if (!profileName.trim()) {
      Alert.alert('Error', 'Please enter a profile name');
      return;
    }

    if (selectedDietary.size === 0 && cuisinePreferences.size === 0) {
      Alert.alert(
        'Error',
        'Please select at least one dietary restriction or cuisine preference',
      );
      return;
    }

    setIsSaving(true);

    try {
      const api = UserProfileAPI.getInstance();

      const dietaryRestrictions = Array.from(selectedDietary).map(type => ({
        type,
      }));

      const cuisinePrefs = Array.from(cuisinePreferences.entries()).map(
        ([cuisineType, preferenceLevel]) => ({
          cuisineType,
          preferenceLevel,
        }),
      );

      const response = await api.createUserPreference(userId, {
        name: profileName.trim(),
        isDefault: true,
        dietaryRestrictions,
        cuisinePreferences: cuisinePrefs,
      });

      if (response.success && response.data) {
        Alert.alert('Success', 'Preferences saved successfully', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert(
          'Error',
          response.error?.message || 'Failed to save preferences',
        );
        setIsSaving(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save preferences');
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Profile Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., My Preferences, Date Night, Family Dinner"
          placeholderTextColor="#9CA3AF"
          value={profileName}
          onChangeText={setProfileName}
        />

        <Text style={styles.sectionTitle}>Dietary Restrictions</Text>
        <Text style={styles.sectionSubtitle}>Select all that apply to you</Text>
        <View style={styles.optionsGrid}>
          {DIETARY_OPTIONS.map(option => (
            <TouchableOpacity
              key={option.type}
              style={[
                styles.optionCard,
                selectedDietary.has(option.type) && styles.optionCardSelected,
              ]}
              onPress={() => toggleDietary(option.type)}>
              <Text style={styles.optionEmoji}>{option.emoji}</Text>
              <Text
                style={[
                  styles.optionLabel,
                  selectedDietary.has(option.type) &&
                    styles.optionLabelSelected,
                ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Cuisine Preferences</Text>
        <Text style={styles.sectionSubtitle}>
          Rate your preferences (tap to increase, 3 = love it)
        </Text>
        <View style={styles.cuisineList}>
          {CUISINE_OPTIONS.map(option => {
            const level = cuisinePreferences.get(option.type) || 0;
            return (
              <TouchableOpacity
                key={option.type}
                style={styles.cuisineCard}
                onPress={() => setCuisineLevel(option.type, (level % 3) + 1)}>
                <Text style={styles.cuisineEmoji}>{option.emoji}</Text>
                <Text style={styles.cuisineLabel}>{option.label}</Text>
                <View style={styles.levelIndicator}>
                  {[1, 2, 3].map(i => (
                    <View
                      key={i}
                      style={[
                        styles.levelDot,
                        i <= level && styles.levelDotActive,
                      ]}
                    />
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.disabledButton]}
          onPress={handleSave}
          disabled={isSaving}>
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Text>
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
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 24,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  optionCard: {
    width: '48%',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    margin: '1%',
    alignItems: 'center',
  },
  optionCardSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  optionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  optionLabelSelected: {
    color: '#6366F1',
  },
  cuisineList: {
    marginBottom: 24,
  },
  cuisineCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  cuisineEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  cuisineLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  levelIndicator: {
    flexDirection: 'row',
    gap: 4,
  },
  levelDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
  },
  levelDotActive: {
    backgroundColor: '#6366F1',
  },
  saveButton: {
    backgroundColor: '#6366F1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
