import {DietaryRestriction} from './DietaryRestriction';
import {CuisinePreference} from './CuisinePreference';

export type SuggestionType = 'recipe' | 'restaurant' | 'meal_kit' | 'takeout';
export type SuggestionSource = 'cook_at_home' | 'go_out';

export interface RecipeDetails {
  recipeName: string;
  cookingTime: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  servings: number;
  ingredients: string[];
  instructions?: string[];
  calories?: number;
  imageUrl?: string;
}

export interface RestaurantDetails {
  restaurantName: string;
  address: string;
  distance?: number; // in km
  rating?: number; // 0-5
  priceRange?: '$' | '$$' | '$$$' | '$$$$';
  phoneNumber?: string;
  website?: string;
  openNow?: boolean;
}

export interface DinnerSuggestion {
  suggestionId: string;
  userId: string;
  requestId: string; // Links to the suggestion request that generated this
  type: SuggestionType;
  source: SuggestionSource;
  name: string;
  description?: string;
  matchScore: number; // 0-1, how well it matches preferences
  isAlternative: boolean; // True if doesn't match all preferences
  missingPreferences?: string[]; // Which preferences aren't matched
  recipeDetails?: RecipeDetails;
  restaurantDetails?: RestaurantDetails;
  matchedDietaryRestrictions: string[]; // IDs of matched restrictions
  matchedCuisinePreferences: string[]; // IDs of matched cuisines
  metadata?: {
    popularity?: number;
    seasonal?: boolean;
    healthScore?: number;
    [key: string]: any;
  };
  createdAt: string;
}

export class DinnerSuggestionModel {
  private suggestion: DinnerSuggestion;

  constructor(
    data: Partial<DinnerSuggestion> & {
      userId: string;
      requestId: string;
      type: SuggestionType;
      source: SuggestionSource;
      name: string;
    },
  ) {
    this.suggestion = {
      suggestionId: data.suggestionId || this.generateId(),
      userId: data.userId,
      requestId: data.requestId,
      type: data.type,
      source: data.source,
      name: data.name,
      description: data.description,
      matchScore: data.matchScore !== undefined ? data.matchScore : 1.0,
      isAlternative: data.isAlternative || false,
      missingPreferences: data.missingPreferences || [],
      recipeDetails: data.recipeDetails,
      restaurantDetails: data.restaurantDetails,
      matchedDietaryRestrictions: data.matchedDietaryRestrictions || [],
      matchedCuisinePreferences: data.matchedCuisinePreferences || [],
      metadata: data.metadata || {},
      createdAt: data.createdAt || new Date().toISOString(),
    };

    this.validate();
  }

  private validate(): void {
    if (!this.suggestion.userId || this.suggestion.userId.trim().length === 0) {
      throw new Error('DinnerSuggestion: userId is required');
    }

    if (
      !this.suggestion.requestId ||
      this.suggestion.requestId.trim().length === 0
    ) {
      throw new Error('DinnerSuggestion: requestId is required');
    }

    if (!this.suggestion.name || this.suggestion.name.trim().length === 0) {
      throw new Error('DinnerSuggestion: name is required');
    }

    const validTypes: SuggestionType[] = [
      'recipe',
      'restaurant',
      'meal_kit',
      'takeout',
    ];
    if (!validTypes.includes(this.suggestion.type)) {
      throw new Error(
        `DinnerSuggestion: Invalid type "${this.suggestion.type}"`,
      );
    }

    const validSources: SuggestionSource[] = ['cook_at_home', 'go_out'];
    if (!validSources.includes(this.suggestion.source)) {
      throw new Error(
        `DinnerSuggestion: Invalid source "${this.suggestion.source}"`,
      );
    }

    if (this.suggestion.matchScore < 0 || this.suggestion.matchScore > 1) {
      throw new Error('DinnerSuggestion: matchScore must be between 0 and 1');
    }

    // Validate details based on type
    if (
      (this.suggestion.type === 'recipe' ||
        this.suggestion.type === 'meal_kit') &&
      this.suggestion.source === 'cook_at_home' &&
      !this.suggestion.recipeDetails
    ) {
      throw new Error(
        `DinnerSuggestion: recipeDetails required for type "${this.suggestion.type}"`,
      );
    }

    if (
      (this.suggestion.type === 'restaurant' ||
        this.suggestion.type === 'takeout') &&
      this.suggestion.source === 'go_out' &&
      !this.suggestion.restaurantDetails
    ) {
      throw new Error(
        `DinnerSuggestion: restaurantDetails required for type "${this.suggestion.type}"`,
      );
    }
  }

  getData(): DinnerSuggestion {
    return {
      ...this.suggestion,
      missingPreferences: [...(this.suggestion.missingPreferences || [])],
      matchedDietaryRestrictions: [
        ...this.suggestion.matchedDietaryRestrictions,
      ],
      matchedCuisinePreferences: [...this.suggestion.matchedCuisinePreferences],
      metadata: {...this.suggestion.metadata},
    };
  }

  getMatchScore(): number {
    return this.suggestion.matchScore;
  }

  isFullMatch(): boolean {
    return (
      !this.suggestion.isAlternative &&
      (!this.suggestion.missingPreferences ||
        this.suggestion.missingPreferences.length === 0)
    );
  }

  getType(): SuggestionType {
    return this.suggestion.type;
  }

  getSource(): SuggestionSource {
    return this.suggestion.source;
  }

  isRecipe(): boolean {
    return (
      this.suggestion.type === 'recipe' || this.suggestion.type === 'meal_kit'
    );
  }

  isRestaurant(): boolean {
    return (
      this.suggestion.type === 'restaurant' ||
      this.suggestion.type === 'takeout'
    );
  }

  getRecipeDetails(): RecipeDetails | undefined {
    return this.suggestion.recipeDetails
      ? {...this.suggestion.recipeDetails}
      : undefined;
  }

  getRestaurantDetails(): RestaurantDetails | undefined {
    return this.suggestion.restaurantDetails
      ? {...this.suggestion.restaurantDetails}
      : undefined;
  }

  toJSON(): string {
    return JSON.stringify(this.suggestion);
  }

  static fromJSON(json: string): DinnerSuggestionModel {
    const data = JSON.parse(json);
    return new DinnerSuggestionModel(data);
  }

  toDatabase(): {
    suggestionId: string;
    userId: string;
    requestId: string;
    type: string;
    source: string;
    name: string;
    description: string | null;
    matchScore: number;
    isAlternative: number;
    missingPreferences: string | null;
    recipeDetails: string | null;
    restaurantDetails: string | null;
    matchedDietaryRestrictions: string;
    matchedCuisinePreferences: string;
    metadata: string | null;
    createdAt: string;
  } {
    return {
      suggestionId: this.suggestion.suggestionId,
      userId: this.suggestion.userId,
      requestId: this.suggestion.requestId,
      type: this.suggestion.type,
      source: this.suggestion.source,
      name: this.suggestion.name,
      description: this.suggestion.description || null,
      matchScore: this.suggestion.matchScore,
      isAlternative: this.suggestion.isAlternative ? 1 : 0,
      missingPreferences: this.suggestion.missingPreferences
        ? JSON.stringify(this.suggestion.missingPreferences)
        : null,
      recipeDetails: this.suggestion.recipeDetails
        ? JSON.stringify(this.suggestion.recipeDetails)
        : null,
      restaurantDetails: this.suggestion.restaurantDetails
        ? JSON.stringify(this.suggestion.restaurantDetails)
        : null,
      matchedDietaryRestrictions: JSON.stringify(
        this.suggestion.matchedDietaryRestrictions,
      ),
      matchedCuisinePreferences: JSON.stringify(
        this.suggestion.matchedCuisinePreferences,
      ),
      metadata: this.suggestion.metadata
        ? JSON.stringify(this.suggestion.metadata)
        : null,
      createdAt: this.suggestion.createdAt,
    };
  }

  static fromDatabase(row: {
    suggestionId: string;
    userId: string;
    requestId: string;
    type: string;
    source: string;
    name: string;
    description: string | null;
    matchScore: number;
    isAlternative: number;
    missingPreferences: string | null;
    recipeDetails: string | null;
    restaurantDetails: string | null;
    matchedDietaryRestrictions: string;
    matchedCuisinePreferences: string;
    metadata: string | null;
    createdAt: string;
  }): DinnerSuggestionModel {
    return new DinnerSuggestionModel({
      suggestionId: row.suggestionId,
      userId: row.userId,
      requestId: row.requestId,
      type: row.type as SuggestionType,
      source: row.source as SuggestionSource,
      name: row.name,
      description: row.description || undefined,
      matchScore: row.matchScore,
      isAlternative: row.isAlternative === 1,
      missingPreferences: row.missingPreferences
        ? JSON.parse(row.missingPreferences)
        : undefined,
      recipeDetails: row.recipeDetails
        ? JSON.parse(row.recipeDetails)
        : undefined,
      restaurantDetails: row.restaurantDetails
        ? JSON.parse(row.restaurantDetails)
        : undefined,
      matchedDietaryRestrictions: JSON.parse(row.matchedDietaryRestrictions),
      matchedCuisinePreferences: JSON.parse(row.matchedCuisinePreferences),
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      createdAt: row.createdAt,
    });
  }

  private generateId(): string {
    return (
      'sug-' +
      Date.now().toString(36) +
      '-' +
      Math.random().toString(36).substring(2, 9)
    );
  }
}
