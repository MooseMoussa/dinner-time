import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SuggestionDetail'>;
  route: RouteProp<RootStackParamList, 'SuggestionDetail'>;
};

export const SuggestionDetailScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const {suggestionId} = route.params;
  const [suggestion, setSuggestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadSuggestion = React.useCallback(async () => {
    try {
      // Mock suggestion details
      const mockSuggestions: Record<string, any> = {
        '1': {
          suggestionId: '1',
          type: 'restaurant',
          name: 'Italian Bistro',
          description:
            'Authentic Italian cuisine with fresh pasta and wood-fired pizzas',
          matchScore: 0.92,
          matchReasons: [
            'Matches Italian cuisine preference',
            'Within 2 miles',
            'High ratings',
          ],
          restaurantDetails: {
            address: '123 Main St, City, State',
            distance: 1.5,
            cuisineTypes: ['Italian', 'Mediterranean'],
            priceRange: '$$',
          },
        },
        '2': {
          suggestionId: '2',
          type: 'recipe',
          name: 'Homemade Pizza',
          description: 'Classic margherita pizza from scratch',
          matchScore: 0.88,
          matchReasons: [
            'Easy recipe',
            'Matches preferences',
            'Quick preparation',
          ],
          recipeDetails: {
            prepTime: 30,
            difficulty: 'Intermediate',
            servings: 4,
            ingredients: [
              'Pizza dough',
              'Tomato sauce',
              'Mozzarella',
              'Fresh basil',
            ],
            steps: [
              'Prepare dough',
              'Add sauce and toppings',
              'Bake at 450°F for 15 minutes',
            ],
          },
        },
        '3': {
          suggestionId: '3',
          type: 'restaurant',
          name: 'Sushi Palace',
          description: 'Fresh sushi and Japanese specialties',
          matchScore: 0.85,
          matchReasons: [
            'Matches Japanese cuisine preference',
            'Fresh ingredients',
            'Highly rated',
          ],
          restaurantDetails: {
            address: '456 Oak Ave, City, State',
            distance: 2.3,
            cuisineTypes: ['Japanese', 'Sushi'],
            priceRange: '$$$',
          },
        },
      };
      setSuggestion(mockSuggestions[suggestionId]);
    } catch (error) {
      console.error('Failed to load suggestion:', error);
    } finally {
      setLoading(false);
    }
  }, [suggestionId]);

  useEffect(() => {
    loadSuggestion();
  }, [loadSuggestion]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading details...</Text>
      </View>
    );
  }

  if (!suggestion) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>😔</Text>
        <Text style={styles.errorText}>Suggestion not found</Text>
      </View>
    );
  }

  const isRestaurant = suggestion.type === 'restaurant';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{isRestaurant ? '🍽️' : '🍳'}</Text>
        <Text style={styles.title}>{suggestion.name}</Text>
        <View
          style={[
            styles.typeBadge,
            {
              backgroundColor: isRestaurant ? '#EF444420' : '#10B98120',
            },
          ]}>
          <Text
            style={[
              styles.typeText,
              {color: isRestaurant ? '#EF4444' : '#10B981'},
            ]}>
            {suggestion.type.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.matchSection}>
        <View style={styles.matchScoreCard}>
          <Text style={styles.matchScoreValue}>
            {Math.round(suggestion.matchScore * 100)}%
          </Text>
          <Text style={styles.matchScoreLabel}>Match Score</Text>
        </View>
        <View style={styles.matchReasons}>
          <Text style={styles.matchReasonsTitle}>Why we chose this:</Text>
          {suggestion.matchReasons?.map((reason: string, index: number) => (
            <View key={index} style={styles.reasonItem}>
              <Text style={styles.reasonBullet}>✓</Text>
              <Text style={styles.reasonText}>{reason}</Text>
            </View>
          ))}
        </View>
      </View>

      {suggestion.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{suggestion.description}</Text>
        </View>
      )}

      {isRestaurant && suggestion.restaurantDetails && (
        <>
          {suggestion.restaurantDetails.address && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location</Text>
              <Text style={styles.address}>
                {suggestion.restaurantDetails.address}
              </Text>
              {suggestion.restaurantDetails.distance && (
                <Text style={styles.distance}>
                  {suggestion.restaurantDetails.distance.toFixed(1)} miles away
                </Text>
              )}
            </View>
          )}

          {suggestion.restaurantDetails.cuisineTypes && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cuisine</Text>
              <View style={styles.tags}>
                {suggestion.restaurantDetails.cuisineTypes.map(
                  (cuisine: string) => (
                    <View key={cuisine} style={styles.tag}>
                      <Text style={styles.tagText}>{cuisine}</Text>
                    </View>
                  ),
                )}
              </View>
            </View>
          )}

          {suggestion.restaurantDetails.priceRange && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Price Range</Text>
              <Text style={styles.priceRange}>
                {suggestion.restaurantDetails.priceRange}
              </Text>
            </View>
          )}
        </>
      )}

      {!isRestaurant && suggestion.recipeDetails && (
        <>
          {suggestion.recipeDetails.prepTime && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Preparation Time</Text>
              <Text style={styles.detail}>
                {suggestion.recipeDetails.prepTime} minutes
              </Text>
            </View>
          )}

          {suggestion.recipeDetails.difficulty && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Difficulty</Text>
              <Text style={styles.detail}>
                {suggestion.recipeDetails.difficulty}
              </Text>
            </View>
          )}

          {suggestion.recipeDetails.servings && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Servings</Text>
              <Text style={styles.detail}>
                {suggestion.recipeDetails.servings}
              </Text>
            </View>
          )}

          {suggestion.recipeDetails.ingredients && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ingredients</Text>
              {suggestion.recipeDetails.ingredients.map(
                (ingredient: string, index: number) => (
                  <View key={index} style={styles.ingredientItem}>
                    <Text style={styles.ingredientBullet}>•</Text>
                    <Text style={styles.ingredientText}>{ingredient}</Text>
                  </View>
                ),
              )}
            </View>
          )}

          {suggestion.recipeDetails.steps && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Instructions</Text>
              {suggestion.recipeDetails.steps.map(
                (step: string, index: number) => (
                  <View key={index} style={styles.stepItem}>
                    <Text style={styles.stepNumber}>{index + 1}</Text>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ),
              )}
            </View>
          )}
        </>
      )}

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.goBack()}>
        <Text style={styles.actionButtonText}>Back to Suggestions</Text>
      </TouchableOpacity>
    </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  errorEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  header: {
    backgroundColor: 'white',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  matchSection: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    marginTop: 12,
  },
  matchScoreCard: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    minWidth: 120,
  },
  matchScoreValue: {
    fontSize: 36,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  matchScoreLabel: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
  },
  matchReasons: {
    flex: 1,
  },
  matchReasonsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  reasonItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  reasonBullet: {
    color: '#10B981',
    marginRight: 8,
    fontWeight: '700',
  },
  reasonText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  address: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
  },
  distance: {
    fontSize: 14,
    color: '#6B7280',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  tag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    margin: 4,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
  priceRange: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
  },
  detail: {
    fontSize: 16,
    color: '#374151',
  },
  ingredientItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  ingredientBullet: {
    fontSize: 16,
    color: '#6366F1',
    marginRight: 12,
  },
  ingredientText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366F1',
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
    marginRight: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  actionButton: {
    backgroundColor: '#6366F1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    margin: 20,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
