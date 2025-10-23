import {DatabaseService} from './DatabaseService';
import {LocationService} from './LocationService';
import {PreferenceProfile} from '@models/PreferenceProfile';
import {Location} from '@models/Location';

export interface SuggestionRequest {
  userId: string;
  profileId: string;
  mode: 'cook_at_home' | 'go_out';
  temporaryPreferences?: TemporaryPreferences;
  location?: Location;
  maxSuggestions?: number;
}

export interface TemporaryPreferences {
  additionalDietaryRestrictions?: Array<{type: string; customName?: string}>;
  additionalCuisinePreferences?: Array<{
    cuisineType: string;
    preferenceLevel: number;
  }>;
  removedDietaryRestrictions?: string[];
  removedCuisinePreferences?: string[];
}

export interface DinnerSuggestion {
  suggestionId: string;
  type: 'recipe' | 'restaurant' | 'meal_type';
  name: string;
  description?: string;
  matchScore: number;
  rankOrder: number;
  metadata?: SuggestionMetadata;
  matchReasons?: string[];
  nonMatchReasons?: string[];
}

export interface SuggestionMetadata {
  // Restaurant metadata
  restaurantAddress?: string;
  restaurantPhone?: string;
  restaurantRating?: number;
  restaurantDistance?: number;
  restaurantPriceRange?: 'budget' | 'moderate' | 'expensive' | 'luxury';

  // Recipe metadata
  prepTime?: number;
  cookTime?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
  servings?: number;
  requiredEquipment?: string[];
  missingIngredients?: string[];
}

export interface SuggestionResponse {
  requestId: string;
  userId: string;
  suggestions: DinnerSuggestion[];
  totalMatches: number;
  hasAlternatives: boolean;
  alternatives?: DinnerSuggestion[];
  generatedAt: string;
  expiresAt: string;
}

export interface CookingContext {
  contextId: string;
  userId: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  availableTime: number;
  equipment: string[];
  ingredients: Array<{
    name: string;
    category:
      | 'protein'
      | 'vegetable'
      | 'grain'
      | 'dairy'
      | 'spice'
      | 'condiment'
      | 'other';
    expiryDate?: string;
  }>;
  updatedAt: string;
}

// Mock data for suggestions (in a real app, this would come from APIs or databases)
const MOCK_RECIPES = [
  {
    id: 'recipe_001',
    name: 'Vegetarian Pasta Primavera',
    description: 'Fresh vegetables with pasta in a light cream sauce',
    cuisineType: 'italian',
    dietaryCompatible: ['vegetarian'],
    prepTime: 15,
    cookTime: 20,
    difficulty: 'easy',
    requiredEquipment: ['stove', 'large_pot'],
    ingredients: ['pasta', 'vegetables', 'cream', 'cheese'],
  },
  {
    id: 'recipe_002',
    name: 'Thai Green Curry',
    description: 'Aromatic curry with vegetables and coconut milk',
    cuisineType: 'thai',
    dietaryCompatible: ['vegan', 'gluten_free'],
    prepTime: 20,
    cookTime: 25,
    difficulty: 'medium',
    requiredEquipment: ['stove', 'wok'],
    ingredients: ['curry_paste', 'coconut_milk', 'vegetables'],
  },
  {
    id: 'recipe_003',
    name: 'Mexican Bean Quesadillas',
    description: 'Crispy tortillas filled with beans and cheese',
    cuisineType: 'mexican',
    dietaryCompatible: ['vegetarian'],
    prepTime: 10,
    cookTime: 15,
    difficulty: 'easy',
    requiredEquipment: ['stove', 'pan'],
    ingredients: ['tortillas', 'beans', 'cheese'],
  },
];

const MOCK_RESTAURANTS = [
  {
    id: 'restaurant_001',
    name: 'Bella Vista Italian',
    cuisineType: 'italian',
    dietaryOptions: ['vegetarian', 'gluten_free'],
    address: '123 Main St',
    phone: '555-0123',
    rating: 4.5,
    priceRange: 'moderate',
    coordinates: {lat: 37.7749, lng: -122.4194},
  },
  {
    id: 'restaurant_002',
    name: 'Spice Garden Thai',
    cuisineType: 'thai',
    dietaryOptions: ['vegan', 'vegetarian', 'gluten_free'],
    address: '456 Oak Ave',
    phone: '555-0456',
    rating: 4.3,
    priceRange: 'budget',
    coordinates: {lat: 37.7849, lng: -122.4094},
  },
  {
    id: 'restaurant_003',
    name: 'Casa Mexico',
    cuisineType: 'mexican',
    dietaryOptions: ['vegetarian'],
    address: '789 Pine St',
    phone: '555-0789',
    rating: 4.1,
    priceRange: 'moderate',
    coordinates: {lat: 37.7649, lng: -122.4294},
  },
];

export class SuggestionService {
  private static instance: SuggestionService;
  private database: DatabaseService;
  private locationService: LocationService;

  constructor() {
    this.database = DatabaseService.getInstance();
    this.locationService = LocationService.getInstance();
  }

  static getInstance(): SuggestionService {
    if (!SuggestionService.instance) {
      SuggestionService.instance = new SuggestionService();
    }
    return SuggestionService.instance;
  }

  async generateSuggestions(
    request: SuggestionRequest,
  ): Promise<SuggestionResponse> {
    try {
      // Validate request
      this.validateSuggestionRequest(request);

      // Get user and preference profile
      const user = await this.database.getUserById(request.userId);
      if (!user) {
        throw new Error('User not found');
      }

      const preferenceProfile = await this.database.getPreferenceProfileById(
        request.profileId,
      );
      if (!preferenceProfile) {
        throw new Error('Preference profile not found');
      }

      if (preferenceProfile.userId !== request.userId) {
        throw new Error('Preference profile does not belong to the user');
      }

      // Apply temporary preferences
      const effectivePreferences = this.applyTemporaryPreferences(
        preferenceProfile,
        request.temporaryPreferences,
      );

      let suggestions: DinnerSuggestion[];

      if (request.mode === 'cook_at_home') {
        suggestions = await this.generateHomeCookingSuggestions(
          request.userId,
          effectivePreferences,
          request.maxSuggestions || 5,
        );
      } else {
        if (!request.location) {
          throw new Error('Location is required for restaurant suggestions');
        }
        suggestions = await this.generateRestaurantSuggestions(
          effectivePreferences,
          request.location,
          request.maxSuggestions || 5,
        );
      }

      // Generate alternatives if we don't have enough suggestions
      const hasAlternatives =
        suggestions.length < (request.maxSuggestions || 5);
      const alternatives = hasAlternatives
        ? await this.generateAlternativeSuggestions(
            effectivePreferences,
            request.mode,
            suggestions,
          )
        : undefined;

      const requestId = this.generateId();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

      return {
        requestId,
        userId: request.userId,
        suggestions,
        totalMatches: suggestions.length,
        hasAlternatives,
        alternatives,
        generatedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      };
    } catch (error) {
      throw new Error(
        `Failed to generate suggestions: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async updateCookingContext(
    userId: string,
    context: Partial<CookingContext>,
  ): Promise<CookingContext> {
    try {
      // In a real implementation, this would update the database
      // For now, we'll return a mock updated context

      const contextId = context.contextId || this.generateId();
      const now = new Date().toISOString();

      const updatedContext: CookingContext = {
        contextId,
        userId,
        skillLevel: context.skillLevel || 'intermediate',
        availableTime: context.availableTime || 30,
        equipment: context.equipment || ['stove', 'oven', 'microwave'],
        ingredients: context.ingredients || [],
        updatedAt: now,
      };

      return updatedContext;
    } catch (error) {
      throw new Error(
        `Failed to update cooking context: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async getCookingContext(userId: string): Promise<CookingContext | null> {
    try {
      // In a real implementation, this would fetch from database
      // For now, return a mock context

      return {
        contextId: this.generateId(),
        userId,
        skillLevel: 'intermediate',
        availableTime: 30,
        equipment: ['stove', 'oven', 'microwave'],
        ingredients: [
          {name: 'tomatoes', category: 'vegetable'},
          {name: 'pasta', category: 'grain'},
          {name: 'cheese', category: 'dairy'},
        ],
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      return null;
    }
  }

  private validateSuggestionRequest(request: SuggestionRequest): void {
    if (!request.userId || typeof request.userId !== 'string') {
      throw new Error('Valid user ID is required');
    }

    if (!request.profileId || typeof request.profileId !== 'string') {
      throw new Error('Valid profile ID is required');
    }

    if (!['cook_at_home', 'go_out'].includes(request.mode)) {
      throw new Error('Mode must be either "cook_at_home" or "go_out"');
    }

    if (request.mode === 'go_out' && !request.location) {
      throw new Error('Location is required for restaurant suggestions');
    }

    if (
      request.maxSuggestions !== undefined &&
      (request.maxSuggestions < 1 || request.maxSuggestions > 10)
    ) {
      throw new Error('Max suggestions must be between 1 and 10');
    }
  }

  private applyTemporaryPreferences(
    baseProfile: PreferenceProfile,
    temporaryPreferences?: TemporaryPreferences,
  ): PreferenceProfile {
    if (!temporaryPreferences) {
      return baseProfile;
    }

    const modified = {...baseProfile};

    // Apply additional dietary restrictions
    if (temporaryPreferences.additionalDietaryRestrictions) {
      for (const restriction of temporaryPreferences.additionalDietaryRestrictions) {
        modified.dietaryRestrictions.push({
          restrictionId: this.generateId(),
          type: restriction.type as any,
          customName: restriction.customName,
        });
      }
    }

    // Apply additional cuisine preferences
    if (temporaryPreferences.additionalCuisinePreferences) {
      for (const preference of temporaryPreferences.additionalCuisinePreferences) {
        modified.cuisinePreferences.push({
          preferenceId: this.generateId(),
          cuisineType: preference.cuisineType as any,
          preferenceLevel: preference.preferenceLevel,
        });
      }
    }

    // Remove specified restrictions
    if (temporaryPreferences.removedDietaryRestrictions) {
      modified.dietaryRestrictions = modified.dietaryRestrictions.filter(
        restriction =>
          !temporaryPreferences.removedDietaryRestrictions!.includes(
            restriction.restrictionId,
          ),
      );
    }

    // Remove specified preferences
    if (temporaryPreferences.removedCuisinePreferences) {
      modified.cuisinePreferences = modified.cuisinePreferences.filter(
        preference =>
          !temporaryPreferences.removedCuisinePreferences!.includes(
            preference.preferenceId,
          ),
      );
    }

    return modified;
  }

  private async generateHomeCookingSuggestions(
    userId: string,
    preferences: PreferenceProfile,
    maxSuggestions: number,
  ): Promise<DinnerSuggestion[]> {
    const cookingContext = await this.getCookingContext(userId);
    const suggestions: DinnerSuggestion[] = [];

    for (const recipe of MOCK_RECIPES) {
      const score = this.calculateRecipeMatchScore(
        recipe,
        preferences,
        cookingContext,
      );

      if (score.totalScore > 0.3) {
        // Minimum threshold
        const suggestion: DinnerSuggestion = {
          suggestionId: this.generateId(),
          type: 'recipe',
          name: recipe.name,
          description: recipe.description,
          matchScore: score.totalScore,
          rankOrder: 0, // Will be set after sorting
          metadata: {
            prepTime: recipe.prepTime,
            cookTime: recipe.cookTime,
            difficulty: recipe.difficulty as any,
            servings: 2, // Default
            requiredEquipment: recipe.requiredEquipment,
            missingIngredients: this.findMissingIngredients(
              recipe.ingredients,
              cookingContext?.ingredients || [],
            ),
          },
          matchReasons: score.positiveReasons,
          nonMatchReasons: score.negativeReasons,
        };

        suggestions.push(suggestion);
      }
    }

    // Sort by match score and assign rank order
    suggestions.sort((a, b) => b.matchScore - a.matchScore);
    suggestions.forEach((suggestion, index) => {
      suggestion.rankOrder = index + 1;
    });

    return suggestions.slice(0, maxSuggestions);
  }

  private async generateRestaurantSuggestions(
    preferences: PreferenceProfile,
    location: Location,
    maxSuggestions: number,
  ): Promise<DinnerSuggestion[]> {
    const suggestions: DinnerSuggestion[] = [];

    for (const restaurant of MOCK_RESTAURANTS) {
      // Check if restaurant is within range
      const distance = this.calculateDistance(location, {
        latitude: restaurant.coordinates.lat,
        longitude: restaurant.coordinates.lng,
        updatedAt: '',
      });

      if (distance <= (location.radius || 5)) {
        const score = this.calculateRestaurantMatchScore(
          restaurant,
          preferences,
        );

        if (score.totalScore > 0.3) {
          const suggestion: DinnerSuggestion = {
            suggestionId: this.generateId(),
            type: 'restaurant',
            name: restaurant.name,
            description: `${restaurant.cuisineType} restaurant`,
            matchScore: score.totalScore,
            rankOrder: 0,
            metadata: {
              restaurantAddress: restaurant.address,
              restaurantPhone: restaurant.phone,
              restaurantRating: restaurant.rating,
              restaurantDistance: distance,
              restaurantPriceRange: restaurant.priceRange as any,
            },
            matchReasons: score.positiveReasons,
            nonMatchReasons: score.negativeReasons,
          };

          suggestions.push(suggestion);
        }
      }
    }

    // Sort by match score and assign rank order
    suggestions.sort((a, b) => b.matchScore - a.matchScore);
    suggestions.forEach((suggestion, index) => {
      suggestion.rankOrder = index + 1;
    });

    return suggestions.slice(0, maxSuggestions);
  }

  private calculateRecipeMatchScore(
    recipe: any,
    preferences: PreferenceProfile,
    cookingContext: CookingContext | null,
  ): {
    totalScore: number;
    positiveReasons: string[];
    negativeReasons: string[];
  } {
    let score = 0;
    const positiveReasons: string[] = [];
    const negativeReasons: string[] = [];

    // Check dietary restrictions
    for (const restriction of preferences.dietaryRestrictions) {
      if (recipe.dietaryCompatible.includes(restriction.type)) {
        score += 0.3;
        positiveReasons.push(`Matches ${restriction.type} diet`);
      } else {
        score -= 0.5;
        negativeReasons.push(
          `May not be suitable for ${restriction.type} diet`,
        );
      }
    }

    // Check cuisine preferences
    const cuisinePreference = preferences.cuisinePreferences.find(
      pref => pref.cuisineType === recipe.cuisineType,
    );

    if (cuisinePreference) {
      const cuisineScore = (cuisinePreference.preferenceLevel - 3) * 0.2; // -0.4 to +0.4
      score += cuisineScore;

      if (cuisineScore > 0) {
        positiveReasons.push(`Matches preferred ${recipe.cuisineType} cuisine`);
      } else if (cuisineScore < 0) {
        negativeReasons.push(`Not preferred ${recipe.cuisineType} cuisine`);
      }
    }

    // Check cooking context
    if (cookingContext) {
      // Check time constraints
      const totalTime = recipe.prepTime + recipe.cookTime;
      if (totalTime <= cookingContext.availableTime) {
        score += 0.2;
        positiveReasons.push(`Fits available time (${totalTime}min)`);
      } else {
        score -= 0.3;
        negativeReasons.push(
          `Takes too long (${totalTime}min vs ${cookingContext.availableTime}min available)`,
        );
      }

      // Check skill level
      const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
      const userSkillIndex = skillLevels.indexOf(cookingContext.skillLevel);
      const recipeSkillIndex = skillLevels.indexOf(recipe.difficulty);

      if (recipeSkillIndex <= userSkillIndex) {
        score += 0.1;
        positiveReasons.push(`Matches skill level`);
      } else {
        score -= 0.2;
        negativeReasons.push(`May be too difficult`);
      }

      // Check equipment
      const hasAllEquipment = recipe.requiredEquipment.every(
        (equipment: string) => cookingContext.equipment.includes(equipment),
      );

      if (hasAllEquipment) {
        score += 0.1;
        positiveReasons.push(`Has required equipment`);
      } else {
        score -= 0.2;
        negativeReasons.push(`Missing required equipment`);
      }
    }

    return {
      totalScore: Math.max(0, Math.min(1, score)),
      positiveReasons,
      negativeReasons,
    };
  }

  private calculateRestaurantMatchScore(
    restaurant: any,
    preferences: PreferenceProfile,
  ): {
    totalScore: number;
    positiveReasons: string[];
    negativeReasons: string[];
  } {
    let score = 0;
    const positiveReasons: string[] = [];
    const negativeReasons: string[] = [];

    // Check dietary restrictions
    for (const restriction of preferences.dietaryRestrictions) {
      if (restaurant.dietaryOptions.includes(restriction.type)) {
        score += 0.3;
        positiveReasons.push(`Accommodates ${restriction.type} diet`);
      } else {
        score -= 0.4;
        negativeReasons.push(`May not accommodate ${restriction.type} diet`);
      }
    }

    // Check cuisine preferences
    const cuisinePreference = preferences.cuisinePreferences.find(
      pref => pref.cuisineType === restaurant.cuisineType,
    );

    if (cuisinePreference) {
      const cuisineScore = (cuisinePreference.preferenceLevel - 3) * 0.25;
      score += cuisineScore;

      if (cuisineScore > 0) {
        positiveReasons.push(
          `Matches preferred ${restaurant.cuisineType} cuisine`,
        );
      } else if (cuisineScore < 0) {
        negativeReasons.push(`Not preferred ${restaurant.cuisineType} cuisine`);
      }
    }

    // Bonus for high ratings
    if (restaurant.rating >= 4.0) {
      score += 0.1;
      positiveReasons.push(`Highly rated (${restaurant.rating}★)`);
    }

    return {
      totalScore: Math.max(0, Math.min(1, score)),
      positiveReasons,
      negativeReasons,
    };
  }

  private async generateAlternativeSuggestions(
    preferences: PreferenceProfile,
    mode: string,
    existingSuggestions: DinnerSuggestion[],
  ): Promise<DinnerSuggestion[]> {
    // Generate suggestions that only meet dietary restrictions, ignoring cuisine preferences
    const alternatives: DinnerSuggestion[] = [];
    const existingIds = new Set(existingSuggestions.map(s => s.name));

    const dataSource =
      mode === 'cook_at_home' ? MOCK_RECIPES : MOCK_RESTAURANTS;

    for (const item of dataSource) {
      if (existingIds.has(item.name)) continue;

      // Check only dietary restrictions for alternatives
      const itemAny = item as any;
      const meetsDietaryRestrictions = preferences.dietaryRestrictions.every(
        restriction =>
          mode === 'cook_at_home'
            ? (itemAny.dietaryCompatible || []).includes(restriction.type)
            : (itemAny.dietaryOptions || []).includes(restriction.type),
      );

      if (meetsDietaryRestrictions) {
        const suggestion: DinnerSuggestion = {
          suggestionId: this.generateId(),
          type: mode === 'cook_at_home' ? 'recipe' : 'restaurant',
          name: itemAny.name,
          description:
            itemAny.description ||
            `${itemAny.cuisineType} ${
              mode === 'cook_at_home' ? 'recipe' : 'restaurant'
            }`,
          matchScore: 0.5, // Lower score for alternatives
          rankOrder: alternatives.length + 1,
          matchReasons: ['Meets dietary restrictions'],
          nonMatchReasons: ['Different cuisine preference'],
        };

        alternatives.push(suggestion);

        if (alternatives.length >= 3) break; // Limit alternatives
      }
    }

    return alternatives;
  }

  private findMissingIngredients(
    requiredIngredients: string[],
    availableIngredients: Array<{name: string; category: string}>,
  ): string[] {
    const available = new Set(
      availableIngredients.map(ingredient => ingredient.name.toLowerCase()),
    );

    return requiredIngredients.filter(
      ingredient => !available.has(ingredient.toLowerCase()),
    );
  }

  private calculateDistance(location1: Location, location2: Location): number {
    // Simple distance calculation (could use LocationService for more accuracy)
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(location2.latitude - location1.latitude);
    const dLon = this.toRadians(location2.longitude - location1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(location1.latitude)) *
        Math.cos(this.toRadians(location2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }
}
