import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import {UserProfileAPI} from '@api/UserProfileAPI';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'UserSelection'>;
};

export const UserSelectionScreen: React.FC<Props> = ({navigation}) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const api = UserProfileAPI.getInstance();
    const response = await api.getUsers();
    if (response.success && response.data) {
      setUsers(response.data);
    }
    setLoading(false);
  };

  const createNewUser = () => {
    navigation.navigate('ProfileSetup');
  };

  const selectUser = (userId: string) => {
    navigation.navigate('Home', {userId});
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Profile</Text>

      <FlatList
        data={users}
        keyExtractor={item => item.userId}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.userCard}
            onPress={() => selectUser(item.userId)}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userMeta}>
                Last used: {new Date(item.lastUsed).toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {loading ? 'Loading...' : 'No profiles yet'}
          </Text>
        }
      />

      <TouchableOpacity style={styles.createButton} onPress={createNewUser}>
        <Text style={styles.createButtonText}>+ Create New Profile</Text>
      </TouchableOpacity>
    </View>
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
    marginBottom: 24,
    color: '#111827',
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  userMeta: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 40,
    fontSize: 16,
  },
  createButton: {
    backgroundColor: '#6366F1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
