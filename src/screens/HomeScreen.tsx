import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/types';
import {UserProfileAPI} from '@api/UserProfileAPI';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
  route: RouteProp<RootStackParamList, 'Home'>;
};

export const HomeScreen: React.FC<Props> = ({navigation, route}) => {
  const {userId} = route.params;
  const [user, setUser] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      const api = UserProfileAPI.getInstance();
      const usersResponse = await api.getUsers();

      if (usersResponse.success && usersResponse.data) {
        const currentUser = usersResponse.data.find(u => u.userId === userId);
        if (currentUser) {
          setUser(currentUser);
          // Mock profiles for now
          setProfiles([
            {
              profileId: 'default',
              userId: userId,
              name: 'Default Profile',
              isDefault: true,
              cuisinePreferences: [],
              dietaryRestrictions: [],
            },
          ]);
        }
      }
    } catch (error) {
      console.error('Failed to load user data', error);
    }
  };

  const requestSuggestions = (profileId: string) => {
    navigation.navigate('SuggestionRequest', {userId, profileId});
  };

  const defaultProfile = profiles.find(p => p.isDefault) || profiles[0];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name || 'User'}!</Text>
          <Text style={styles.subtitle}>What's for dinner today?</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings', {userId})}>
          <Text style={styles.settingsText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.actionCard, styles.primaryAction]}
          onPress={() =>
            defaultProfile && requestSuggestions(defaultProfile.profileId)
          }>
          <Text style={styles.actionEmoji}>🍳</Text>
          <Text style={styles.actionTitle}>Cook at Home</Text>
          <Text style={styles.actionSubtitle}>Get recipe suggestions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, styles.secondaryAction]}
          onPress={() =>
            defaultProfile && requestSuggestions(defaultProfile.profileId)
          }>
          <Text style={styles.actionEmoji}>🍴</Text>
          <Text style={styles.actionTitle}>Go Out</Text>
          <Text style={styles.actionSubtitle}>Find restaurants</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Preference Profiles</Text>
        {profiles.map(profile => (
          <TouchableOpacity
            key={profile.profileId}
            style={styles.profileCard}
            onPress={() =>
              navigation.navigate('Preferences', {
                userId,
                profileId: profile.profileId,
              })
            }>
            <View>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileMeta}>
                {profile.cuisinePreferences?.length || 0} cuisines •{' '}
                {profile.dietaryRestrictions?.length || 0} restrictions
              </Text>
            </View>
            {profile.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>Default</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.addProfileButton}
          onPress={() => navigation.navigate('Preferences', {userId})}>
          <Text style={styles.addProfileText}>+ Add New Profile</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 40,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  settingsButton: {
    padding: 8,
  },
  settingsText: {
    fontSize: 24,
  },
  quickActions: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryAction: {
    backgroundColor: '#6366F1',
  },
  secondaryAction: {
    backgroundColor: '#10B981',
  },
  actionEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  profileCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  profileMeta: {
    fontSize: 14,
    color: '#6B7280',
  },
  defaultBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '600',
  },
  addProfileButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addProfileText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
});
