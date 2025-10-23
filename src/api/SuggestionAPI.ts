import {
  SuggestionService,
  SuggestionRequest,
  SuggestionResponse,
  CookingContext,
} from '@services/SuggestionService';
import {LocationService} from '@services/LocationService';
import {DatabaseService} from '@services/DatabaseService';
import {Location} from '@models/Location';

export interface GenerateSuggestionsRequest {
  userId: string;
  preferenceProfileId?: string;
  location?: Location;
  cookingContext?: {
    wantsToCook: boolean;
    skillLevel?: 'beginner' | 'intermediate' | 'advanced';
    availableIngredients?: string[];
    cookingEquipment?: string[];
    maxCookingTime?: number;
  };
  temporaryPreferences?: {
    dietaryRestrictions?: Array<{
      type: string;
      customName?: string;
    }>;
    cuisinePreferences?: Array<{
      cuisineType: string;
      preferenceLevel: number;
    }>;
  };
  suggestionType: 'cooking' | 'restaurant';
  maxResults?: number;
}

export interface SuggestionFeedbackRequest {
  suggestionId: string;
  feedback: 'like' | 'dislike' | 'selected' | 'not_interested';
  reason?: string;
}

export interface UpdateCookingContextRequest {
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  preferredCookingTime?: number;
  availableEquipment?: string[];
  commonIngredients?: string[];
  dietaryConsiderations?: string[];
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export class SuggestionAPI {
  private static instance: SuggestionAPI;
  private suggestionService: SuggestionService;
  private locationService: LocationService;
  private database: DatabaseService;

  constructor() {
    this.suggestionService = SuggestionService.getInstance();
    this.locationService = LocationService.getInstance();
    this.database = DatabaseService.getInstance();
  }

  static getInstance(): SuggestionAPI {
    if (!SuggestionAPI.instance) {
      SuggestionAPI.instance = new SuggestionAPI();
    }
    return SuggestionAPI.instance;
  }

  async generateSuggestions(
    request: GenerateSuggestionsRequest,
  ): Promise<APIResponse<SuggestionResponse>> {
    try {
      if (!request.userId || request.userId.trim().length === 0) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'User ID is required',
          },
        };
      }

      const user = await this.database.getUserById(request.userId);
      if (!user) {
        return {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        };
      }

      let preferenceProfile;
      if (request.preferenceProfileId) {
        preferenceProfile = await this.database.getPreferenceProfileById(
          request.preferenceProfileId,
        );
        if (!preferenceProfile) {
          return {
            success: false,
            error: {
              code: 'PROFILE_NOT_FOUND',
              message: 'Preference profile not found',
            },
          };
        }
        if (preferenceProfile.userId !== request.userId) {
          return {
            success: false,
            error: {
              code: 'PROFILE_ACCESS_DENIED',
              message: 'Preference profile does not belong to this user',
            },
          };
        }
      } else {
        const profiles = await this.database.getPreferenceProfilesByUserId(
          request.userId,
        );
        preferenceProfile = profiles.find(p => p.isDefault) || profiles[0];

        if (!preferenceProfile) {
          return {
            success: false,
            error: {
              code: 'NO_PREFERENCES',
              message: 'No preference profiles found for user',
            },
          };
        }
      }

      if (!['cooking', 'restaurant'].includes(request.suggestionType)) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Suggestion type must be either "cooking" or "restaurant"',
          },
        };
      }

      const maxResults = request.maxResults || 5;
      if (maxResults < 1 || maxResults > 10) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Max results must be between 1 and 10',
          },
        };
      }

      let location = request.location || user.location;
      if (!location && request.suggestionType === 'restaurant') {
        try {
          location = await this.locationService.getCurrentLocation();
        } catch (error) {
          return {
            success: false,
            error: {
              code: 'LOCATION_REQUIRED',
              message: 'Location is required for restaurant suggestions',
              details: error instanceof Error ? error.message : String(error),
            },
          };
        }
      }

      const suggestionRequest: SuggestionRequest = {
        userId: request.userId,
        profileId: preferenceProfile.profileId,
        mode: request.suggestionType === 'cooking' ? 'cook_at_home' : 'go_out',
        location,
        temporaryPreferences: request.temporaryPreferences
          ? {
              additionalDietaryRestrictions:
                request.temporaryPreferences.dietaryRestrictions,
              additionalCuisinePreferences:
                request.temporaryPreferences.cuisinePreferences,
            }
          : undefined,
        maxSuggestions: maxResults,
      };

      const response = await this.suggestionService.generateSuggestions(
        suggestionRequest,
      );

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error('Failed to generate suggestions:', error);

      return {
        success: false,
        error: {
          code: 'GENERATE_SUGGESTIONS_FAILED',
          message: 'Failed to generate suggestions',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  async getSuggestions(
    requestId: string,
  ): Promise<APIResponse<SuggestionResponse>> {
    try {
      if (!requestId || requestId.trim().length === 0) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request ID is required',
          },
        };
      }

      // Mock implementation - in real app would fetch from database
      return {
        success: false,
        error: {
          code: 'NOT_IMPLEMENTED',
          message: 'getSuggestionsByRequestId not yet implemented',
        },
      };
    } catch (error) {
      console.error('Failed to get suggestions:', error);

      return {
        success: false,
        error: {
          code: 'GET_SUGGESTIONS_FAILED',
          message: 'Failed to retrieve suggestions',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  async submitSuggestionFeedback(
    requestId: string,
    feedback: SuggestionFeedbackRequest,
  ): Promise<APIResponse<void>> {
    try {
      if (!requestId || requestId.trim().length === 0) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request ID is required',
          },
        };
      }

      if (!feedback.suggestionId || feedback.suggestionId.trim().length === 0) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Suggestion ID is required',
          },
        };
      }

      const validFeedbackTypes = [
        'like',
        'dislike',
        'selected',
        'not_interested',
      ];
      if (!validFeedbackTypes.includes(feedback.feedback)) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Feedback must be one of: ${validFeedbackTypes.join(
              ', ',
            )}`,
          },
        };
      }

      // Mock implementation - in real app would validate and record feedback
      return {
        success: true,
      };
    } catch (error) {
      console.error('Failed to submit suggestion feedback:', error);

      return {
        success: false,
        error: {
          code: 'SUBMIT_FEEDBACK_FAILED',
          message: 'Failed to submit feedback',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  async getCookingContext(
    userId: string,
  ): Promise<APIResponse<CookingContext | null>> {
    try {
      if (!userId || userId.trim().length === 0) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'User ID is required',
          },
        };
      }

      const user = await this.database.getUserById(userId);
      if (!user) {
        return {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        };
      }

      const context = await this.suggestionService.getCookingContext(userId);

      return {
        success: true,
        data: context,
      };
    } catch (error) {
      console.error('Failed to get cooking context:', error);

      return {
        success: false,
        error: {
          code: 'GET_COOKING_CONTEXT_FAILED',
          message: 'Failed to retrieve cooking context',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  async updateCookingContext(
    userId: string,
    request: UpdateCookingContextRequest,
  ): Promise<APIResponse<CookingContext>> {
    try {
      if (!userId || userId.trim().length === 0) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'User ID is required',
          },
        };
      }

      const user = await this.database.getUserById(userId);
      if (!user) {
        return {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        };
      }

      if (
        request.skillLevel &&
        !['beginner', 'intermediate', 'advanced'].includes(request.skillLevel)
      ) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Skill level must be beginner, intermediate, or advanced',
          },
        };
      }

      if (
        request.preferredCookingTime !== undefined &&
        (request.preferredCookingTime < 5 || request.preferredCookingTime > 300)
      ) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Preferred cooking time must be between 5 and 300 minutes',
          },
        };
      }

      const contextUpdate: Partial<CookingContext> = {
        skillLevel: request.skillLevel as any,
        availableTime: request.preferredCookingTime,
        equipment: request.availableEquipment,
      };

      const context = await this.suggestionService.updateCookingContext(
        userId,
        contextUpdate,
      );

      return {
        success: true,
        data: context,
      };
    } catch (error) {
      console.error('Failed to update cooking context:', error);

      return {
        success: false,
        error: {
          code: 'UPDATE_COOKING_CONTEXT_FAILED',
          message: 'Failed to update cooking context',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  async getAlternativeSuggestions(
    originalRequestId: string,
    _modifiedPreferences?: {
      relaxedRestrictions?: boolean;
      expandCuisineTypes?: boolean;
      increaseRadius?: boolean;
    },
  ): Promise<APIResponse<SuggestionResponse>> {
    try {
      if (!originalRequestId || originalRequestId.trim().length === 0) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Original request ID is required',
          },
        };
      }

      // Mock implementation - in real app would generate alternatives
      return {
        success: false,
        error: {
          code: 'NOT_IMPLEMENTED',
          message: 'Alternative suggestions not yet implemented',
        },
      };
    } catch (error) {
      console.error('Failed to get alternative suggestions:', error);

      return {
        success: false,
        error: {
          code: 'GET_ALTERNATIVES_FAILED',
          message: 'Failed to generate alternative suggestions',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  async getUserSuggestionHistory(
    userId: string,
    limit: number = 10,
    _offset: number = 0,
  ): Promise<
    APIResponse<{
      history: Array<{
        requestId: string;
        timestamp: string;
        suggestionType: 'cooking' | 'restaurant';
        suggestionCount: number;
        feedbackCount: number;
      }>;
      total: number;
    }>
  > {
    try {
      if (!userId || userId.trim().length === 0) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'User ID is required',
          },
        };
      }

      const user = await this.database.getUserById(userId);
      if (!user) {
        return {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        };
      }

      if (limit < 1 || limit > 50) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Limit must be between 1 and 50',
          },
        };
      }

      // Mock implementation - in real app would fetch from database
      return {
        success: true,
        data: {
          history: [],
          total: 0,
        },
      };
    } catch (error) {
      console.error('Failed to get user suggestion history:', error);

      return {
        success: false,
        error: {
          code: 'GET_HISTORY_FAILED',
          message: 'Failed to retrieve suggestion history',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  async healthCheck(): Promise<
    APIResponse<{
      status: 'healthy' | 'degraded' | 'unhealthy';
      details: string;
      dependencies: {
        database: 'healthy' | 'unhealthy';
        location: 'healthy' | 'degraded' | 'unhealthy';
      };
    }>
  > {
    try {
      const dbHealth = await this.database.healthCheck();
      const locationHealth = await this.locationService.healthCheck();

      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      let details = 'Suggestion API operational';

      if (dbHealth.status === 'unhealthy') {
        status = 'unhealthy';
        details = 'Database dependency unavailable';
      } else if (locationHealth.status === 'unhealthy') {
        status = 'degraded';
        details =
          'Location service unavailable, restaurant suggestions may be limited';
      } else if (locationHealth.status === 'degraded') {
        status = 'degraded';
        details =
          'Location service degraded, restaurant suggestions may be inaccurate';
      }

      return {
        success: true,
        data: {
          status,
          details,
          dependencies: {
            database: dbHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
            location: locationHealth.status,
          },
        },
      };
    } catch (error) {
      console.error('Suggestion API health check failed:', error);

      return {
        success: false,
        error: {
          code: 'HEALTH_CHECK_FAILED',
          message: 'Health check failed',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }
}
