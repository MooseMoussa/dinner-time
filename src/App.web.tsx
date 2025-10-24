import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {UserProfileAPI} from '@api/UserProfileAPI';

function App(): JSX.Element {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
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

  const createNewUser = async () => {
    const api = UserProfileAPI.getInstance();
    const response = await api.createUser({
      name: `User ${users.length + 1}`,
    });

    if (response.success && response.data) {
      setUsers([...users, response.data]);
      setSelectedUser(response.data);
    }
  };

  if (selectedUser) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {selectedUser.name}!</Text>
            <Text style={styles.subtitle}>What's for dinner today?</Text>
          </View>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedUser(null)}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={[styles.actionCard, styles.primaryAction]}>
            <Text style={styles.actionEmoji}>🍳</Text>
            <Text style={styles.actionTitle}>Cook at Home</Text>
            <Text style={styles.actionSubtitle}>Get recipe suggestions</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, styles.secondaryAction]}>
            <Text style={styles.actionEmoji}>🍴</Text>
            <Text style={styles.actionTitle}>Go Out</Text>
            <Text style={styles.actionSubtitle}>Find restaurants</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Info</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              This is a preview of Dinner Time - a multi-platform app for iOS,
              Android, and Web.
            </Text>
            <Text style={styles.infoText}>
              Full navigation and features are available in the mobile apps.
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.welcomeContainer}>
        <Text style={styles.emoji}>🍽️</Text>
        <Text style={styles.title}>Dinner Time</Text>
        <Text style={styles.tagline}>
          Multi-User Dinner Decision App for iOS, Android & Web
        </Text>
      </View>

      <View style={styles.userSection}>
        <Text style={styles.sectionTitle}>Select Your Profile</Text>

        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : users.length > 0 ? (
          users.map(user => (
            <TouchableOpacity
              key={user.userId}
              style={styles.userCard}
              onPress={() => setSelectedUser(user)}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userMeta}>
                  Last used: {new Date(user.lastUsed).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No profiles yet</Text>
        )}

        <TouchableOpacity style={styles.createButton} onPress={createNewUser}>
          <Text style={styles.createButtonText}>+ Create New Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Web Preview • Full app available on iOS & Android
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  tagline: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  userSection: {
    paddingHorizontal: 40,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
  },
  loadingText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 40,
    marginBottom: 20,
    fontSize: 16,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    cursor: 'pointer',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 28,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  userMeta: {
    fontSize: 14,
    color: '#6B7280',
  },
  createButton: {
    backgroundColor: '#6366F1',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    cursor: 'pointer',
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  footerText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 40,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 36,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
  },
  backButton: {
    padding: 12,
  },
  backText: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 40,
    gap: 20,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  actionCard: {
    flex: 1,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    cursor: 'pointer',
  },
  primaryAction: {
    backgroundColor: '#6366F1',
  },
  secondaryAction: {
    backgroundColor: '#10B981',
  },
  actionEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  actionSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  section: {
    padding: 40,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  infoCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoText: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 12,
  },
});

export default App;
