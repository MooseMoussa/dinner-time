import {DatabaseService} from '@services/DatabaseService';
import {UserProfile, UserProfileModel} from '@models/UserProfile';
import {
  PreferenceProfile,
  PreferenceProfileModel,
} from '@models/PreferenceProfile';
import {Location} from '@models/Location';

export interface CreateUserRequest {
  name: string;
  location?: Location;
}

export interface UpdateUserRequest {
  name?: string;
  location?: Location;
}

export interface CreatePreferenceRequest {
  name: string;
  isDefault?: boolean;
  dietaryRestrictions: Array<{
    type: string;
    customName?: string;
  }>;
  cuisinePreferences: Array<{
    cuisineType: string;
    preferenceLevel: number;
  }>;
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

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export class UserProfileAPI {
  private static instance: UserProfileAPI;
  private database: DatabaseService;

  constructor() {
    this.database = DatabaseService.getInstance();
  }

  static getInstance(): UserProfileAPI {
    if (!UserProfileAPI.instance) {
      UserProfileAPI.instance = new UserProfileAPI();
    }
    return UserProfileAPI.instance;
  }

  async getUsers(): Promise<APIResponse<UserProfile[]>> {
    try {
      const users = await this.database.getAllUsers();

      return {
        success: true,
        data: users,
      };
    } catch (error) {
      console.error('Failed to get users:', error);

      return {
        success: false,
        error: {
          code: 'GET_USERS_FAILED',
          message: 'Failed to retrieve users',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  async createUser(
    request: CreateUserRequest,
  ): Promise<APIResponse<UserProfile>> {
    try {
      if (!request.name || request.name.trim().length === 0) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'User name is required',
          },
        };
      }

      const existingUser = await this.database.findUserByName(
        request.name.trim(),
      );
      if (existingUser) {
        return {
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: 'A user with this name already exists',
          },
        };
      }

      const userInput = {
        name: request.name.trim(),
        location: request.location,
      };

      const user = UserProfileModel.create(userInput);
      await this.database.createUser(user);

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      console.error('Failed to create user:', error);

      return {
        success: false,
        error: {
          code: 'CREATE_USER_FAILED',
          message: 'Failed to create user',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  async getUserById(userId: string): Promise<APIResponse<UserProfile>> {
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

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      console.error('Failed to get user:', error);

      return {
        success: false,
        error: {
          code: 'GET_USER_FAILED',
          message: 'Failed to retrieve user',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  async updateUser(
    userId: string,
    request: UpdateUserRequest,
  ): Promise<APIResponse<UserProfile>> {
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

      const existingUser = await this.database.getUserById(userId);
      if (!existingUser) {
        return {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        };
      }

      if (request.name && request.name.trim().length === 0) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'User name cannot be empty',
          },
        };
      }

      if (request.name && request.name.trim() !== existingUser.name) {
        const nameConflict = await this.database.findUserByName(
          request.name.trim(),
        );
        if (nameConflict && nameConflict.userId !== userId) {
          return {
            success: false,
            error: {
              code: 'USER_EXISTS',
              message: 'A user with this name already exists',
            },
          };
        }
      }

      const updates: Partial<UserProfile> = {
        lastUsed: new Date().toISOString(),
      };

      if (request.name !== undefined) {
        updates.name = request.name.trim();
      }

      if (request.location !== undefined) {
        if (request.location) {
          updates.location = {
            ...request.location,
            updatedAt: new Date().toISOString(),
          };
        } else {
          updates.location = undefined;
        }
      }

      await this.database.updateUser(userId, updates);

      const updatedUser = await this.database.getUserById(userId);

      return {
        success: true,
        data: updatedUser!,
      };
    } catch (error) {
      console.error('Failed to update user:', error);

      return {
        success: false,
        error: {
          code: 'UPDATE_USER_FAILED',
          message: 'Failed to update user',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  async deleteUser(userId: string): Promise<APIResponse<void>> {
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

      const existingUser = await this.database.getUserById(userId);
      if (!existingUser) {
        return {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        };
      }

      await this.database.deleteUser(userId);

      return {
        success: true,
      };
    } catch (error) {
      console.error('Failed to delete user:', error);

      return {
        success: false,
        error: {
          code: 'DELETE_USER_FAILED',
          message: 'Failed to delete user',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  async getUserPreferences(
    userId: string,
  ): Promise<APIResponse<PreferenceProfile[]>> {
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

      const preferences = await this.database.getPreferenceProfilesByUserId(
        userId,
      );

      return {
        success: true,
        data: preferences,
      };
    } catch (error) {
      console.error('Failed to get user preferences:', error);

      return {
        success: false,
        error: {
          code: 'GET_PREFERENCES_FAILED',
          message: 'Failed to retrieve user preferences',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  async createUserPreference(
    userId: string,
    request: CreatePreferenceRequest,
  ): Promise<APIResponse<PreferenceProfile>> {
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

      if (!request.name || request.name.trim().length === 0) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Preference profile name is required',
          },
        };
      }

      const existingProfiles =
        await this.database.getPreferenceProfilesByUserId(userId);
      const nameConflict = existingProfiles.find(
        profile =>
          profile.name.toLowerCase() === request.name.trim().toLowerCase(),
      );

      if (nameConflict) {
        return {
          success: false,
          error: {
            code: 'PROFILE_EXISTS',
            message:
              'A preference profile with this name already exists for this user',
          },
        };
      }

      if (
        request.dietaryRestrictions.length === 0 &&
        request.cuisinePreferences.length === 0
      ) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message:
              'At least one dietary restriction or cuisine preference must be specified',
          },
        };
      }

      const profileRequest: import('@models/PreferenceProfile').CreatePreferenceProfileRequest =
        {
          name: request.name.trim(),
          isDefault: request.isDefault || existingProfiles.length === 0,
          dietaryRestrictions: request.dietaryRestrictions as any,
          cuisinePreferences: request.cuisinePreferences as any,
        };

      const profile = PreferenceProfileModel.create(userId, profileRequest);
      await this.database.createPreferenceProfile(profile);

      return {
        success: true,
        data: profile,
      };
    } catch (error) {
      console.error('Failed to create preference profile:', error);

      return {
        success: false,
        error: {
          code: 'CREATE_PREFERENCE_FAILED',
          message: 'Failed to create preference profile',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  async searchUsers(
    query: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<APIResponse<PaginatedResponse<UserProfile>>> {
    try {
      if (page < 1) page = 1;
      if (pageSize < 1 || pageSize > 100) pageSize = 10;

      const allUsers = await this.database.getAllUsers();

      let filteredUsers = allUsers;
      if (query && query.trim().length > 0) {
        const searchTerm = query.trim().toLowerCase();
        filteredUsers = allUsers.filter(user =>
          user.name.toLowerCase().includes(searchTerm),
        );
      }

      const total = filteredUsers.length;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const items = filteredUsers.slice(startIndex, endIndex);

      const paginatedResponse: PaginatedResponse<UserProfile> = {
        items,
        total,
        page,
        pageSize,
        hasNext: endIndex < total,
        hasPrevious: page > 1,
      };

      return {
        success: true,
        data: paginatedResponse,
      };
    } catch (error) {
      console.error('Failed to search users:', error);

      return {
        success: false,
        error: {
          code: 'SEARCH_USERS_FAILED',
          message: 'Failed to search users',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  async getUserStats(userId: string): Promise<
    APIResponse<{
      profileCount: number;
      createdAt: string;
      lastUsed: string;
      hasLocation: boolean;
      hasFacialData: boolean;
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

      const preferences = await this.database.getPreferenceProfilesByUserId(
        userId,
      );
      const facialData = await this.database.getFacialData(userId);

      const stats = {
        profileCount: preferences.length,
        createdAt: user.createdAt,
        lastUsed: user.lastUsed,
        hasLocation: !!user.location,
        hasFacialData: !!facialData,
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error('Failed to get user stats:', error);

      return {
        success: false,
        error: {
          code: 'GET_USER_STATS_FAILED',
          message: 'Failed to get user statistics',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  async healthCheck(): Promise<
    APIResponse<{
      status: 'healthy' | 'degraded' | 'unhealthy';
      userCount: number;
      profileCount: number;
    }>
  > {
    try {
      const dbHealth = await this.database.healthCheck();

      if (dbHealth.status === 'unhealthy') {
        return {
          success: false,
          error: {
            code: 'DATABASE_UNHEALTHY',
            message: dbHealth.details,
          },
        };
      }

      const stats = await this.database.getStats();

      return {
        success: true,
        data: {
          status: dbHealth.status,
          userCount: stats.userCount,
          profileCount: stats.profileCount,
        },
      };
    } catch (error) {
      console.error('User Profile API health check failed:', error);

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
