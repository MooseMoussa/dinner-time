import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/types';
import {SuggestionAPI} from '@api/SuggestionAPI';

type Props = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    'SuggestionsList'
  >;
  route: RouteProp<RootStackParamList, 'SuggestionsList'>;
};

export const SuggestionsListScreen: React.FC<Props> = ({navigation, route}) => {
  const {userId, requestId} = route.params;
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      // Mock suggestions for now since getSuggestions returns SuggestionResponse not array
      const mockSuggestions = [
        {
          suggestionId: '1',
          type: 'restaurant',
          name: 'Italian Bistro',
          description: 'Authentic Italian cuisine with fresh pasta',
          matchScore: 0.92,
        },
        {
          suggestionId: '2',
          type: 'recipe',
          name: 'Homemade Pizza',
          description: 'Classic margherita pizza from scratch',
          matchScore: 0.88,
        },
        {
          suggestionId: '3',
          type: 'restaurant',
          name: 'Sushi Palace',
          description: 'Fresh sushi and Japanese specialties',
          matchScore: 0.85,
        },
      ];
      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'restaurant':
        return '🍽️';
      case 'recipe':
        return '🍳';
      default:
        return '🍴';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'restaurant':
        return '#EF4444';
      case 'recipe':
        return '#10B981';
      default:
        return '#6366F1';
    }
  };

  const renderSuggestion = ({item}: {item: any}) => (
    <TouchableOpacity
      style={styles.suggestionCard}
      onPress={() =>
        navigation.navigate('SuggestionDetail', {suggestionId: item.suggestionId})
      }>
      <View style={styles.suggestionHeader}>
        <Text style={styles.suggestionEmoji}>{getTypeEmoji(item.type)}</Text>
        <View style={styles.suggestionInfo}>
          <Text style={styles.suggestionTitle}>{item.name}</Text>
          <View
            style={[
              styles.typeBadge,
              {backgroundColor: getTypeColor(item.type) + '20'},
            ]}>
            <Text
              style={[styles.typeText, {color: getTypeColor(item.type)}]}>
              {item.type.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {item.description && (
        <Text style={styles.suggestionDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <View style={styles.suggestionFooter}>
        <View style={styles.matchScore}>
          <Text style={styles.matchLabel}>Match Score</Text>
          <View style={styles.scoreBar}>
            <View
              style={[
                styles.scoreBarFill,
                {width: `${item.matchScore * 100}%`},
              ]}
            />
          </View>
          <Text style={styles.scoreText}>
            {Math.round(item.matchScore * 100)}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Finding perfect suggestions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Suggestions</Text>
        <Text style={styles.subtitle}>
          Found {suggestions.length} great options for you
        </Text>
      </View>

      <FlatList
        data={suggestions}
        keyExtractor={item => item.suggestionId}
        renderItem={renderSuggestion}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>😔</Text>
            <Text style={styles.emptyText}>No suggestions found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your preferences or try again later
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  listContent: {
    padding: 20,
  },
  suggestionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  suggestionEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  suggestionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  suggestionFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  matchScore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 12,
  },
  scoreBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: '#6366F1',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6366F1',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
