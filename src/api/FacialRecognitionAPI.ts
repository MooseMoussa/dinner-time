import {
  FacialRecognitionService,
  FaceRegistrationResult,
  FaceIdentificationResult,
  SystemStatus,
} from '@services/FacialRecognitionService';
import {DatabaseService} from '@services/DatabaseService';

export interface RegisterFaceRequest {
  userId: string;
  imageData: string;
  confidenceThreshold?: number;
}

export interface IdentifyFaceRequest {
  imageData: string;
  maxResults?: number;
}

export interface UpdateFaceRequest {
  imageData: string;
  confidenceThreshold?: number;
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

export class FacialRecognitionAPI {
  private static instance: FacialRecognitionAPI;
  private facialService: FacialRecognitionService;
  private database: DatabaseService;

  constructor() {
    this.facialService = FacialRecognitionService.getInstance();
    this.database = DatabaseService.getInstance();
  }

  static getInstance(): FacialRecognitionAPI {
    if (!FacialRecognitionAPI.instance) {
      FacialRecognitionAPI.instance = new FacialRecognitionAPI();
    }
    return FacialRecognitionAPI.instance;
  }

  async registerFace(
    request: RegisterFaceRequest,
  ): Promise<APIResponse<FaceRegistrationResult>> {
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

      if (!request.imageData || request.imageData.trim().length === 0) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Image data is required',
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

      const existingFaceData = await this.database.getFacialData(
        request.userId,
      );
      if (existingFaceData) {
        return {
          success: false,
          error: {
            code: 'FACE_ALREADY_REGISTERED',
            message:
              'Face data already exists for this user. Use update endpoint to modify.',
          },
        };
      }

      const result = await this.facialService.registerFace(
        request.userId,
        request.imageData,
        request.confidenceThreshold,
      );

      if (result.status === 'error') {
        return {
          success: false,
          error: {
            code: 'REGISTRATION_FAILED',
            message: result.message || 'Face registration failed',
          },
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Failed to register face:', error);

      return {
        success: false,
        error: {
          code: 'REGISTER_FACE_FAILED',
          message: 'Failed to register face',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  async identifyFace(
    request: IdentifyFaceRequest,
  ): Promise<APIResponse<FaceIdentificationResult>> {
    try {
      if (!request.imageData || request.imageData.trim().length === 0) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Image data is required',
          },
        };
      }

      const maxResults = request.maxResults || 1;
      if (maxResults < 1 || maxResults > 5) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Max results must be between 1 and 5',
          },
        };
      }

      const result = await this.facialService.identifyFace(
        request.imageData,
        maxResults,
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Failed to identify face:', error);

      return {
        success: false,
        error: {
          code: 'IDENTIFY_FACE_FAILED',
          message: 'Failed to identify face',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  async updateFace(
    userId: string,
    request: UpdateFaceRequest,
  ): Promise<APIResponse<FaceRegistrationResult>> {
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

      if (!request.imageData || request.imageData.trim().length === 0) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Image data is required',
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

      const existingFaceData = await this.database.getFacialData(userId);
      if (!existingFaceData) {
        return {
          success: false,
          error: {
            code: 'FACE_NOT_REGISTERED',
            message:
              'No existing face data found for this user. Use register endpoint instead.',
          },
        };
      }

      const result = await this.facialService.updateFace(
        userId,
        request.imageData,
        request.confidenceThreshold,
      );

      if (result.status === 'error') {
        return {
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: result.message || 'Face update failed',
          },
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Failed to update face:', error);

      return {
        success: false,
        error: {
          code: 'UPDATE_FACE_FAILED',
          message: 'Failed to update face',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  async deleteFace(userId: string): Promise<APIResponse<void>> {
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

      const existingFaceData = await this.database.getFacialData(userId);
      if (!existingFaceData) {
        return {
          success: false,
          error: {
            code: 'FACE_NOT_REGISTERED',
            message: 'No face data found for this user',
          },
        };
      }

      await this.facialService.removeFace(userId);

      return {
        success: true,
      };
    } catch (error) {
      console.error('Failed to delete face:', error);

      return {
        success: false,
        error: {
          code: 'DELETE_FACE_FAILED',
          message: 'Failed to delete face',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  async getFaceStatus(): Promise<
    APIResponse<
      Omit<SystemStatus, 'registeredUsers'> & {
        registeredUsersList: Array<{
          userId: string;
          userName: string;
          registeredAt: string;
        }>;
      }
    >
  > {
    try {
      const systemStatus = await this.facialService.getSystemStatus();

      const allUsers = await this.database.getAllUsers();
      const registeredUsersList = [];

      for (const user of allUsers) {
        const faceData = await this.database.getFacialData(user.userId);
        if (faceData) {
          registeredUsersList.push({
            userId: user.userId,
            userName: user.name,
            registeredAt: faceData.createdAt || 'Unknown',
          });
        }
      }

      const response = {
        ...systemStatus,
        registeredUsersList,
      };

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error('Failed to get face status:', error);

      return {
        success: false,
        error: {
          code: 'GET_STATUS_FAILED',
          message: 'Failed to get facial recognition status',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  async checkUserRegistration(userId: string): Promise<
    APIResponse<{
      isRegistered: boolean;
      registrationDate?: string;
      featureVersion?: string;
      confidenceThreshold?: number;
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

      const isRegistered = await this.facialService.isUserRegistered(userId);

      if (!isRegistered) {
        return {
          success: true,
          data: {
            isRegistered: false,
          },
        };
      }

      const faceData = await this.database.getFacialData(userId);

      return {
        success: true,
        data: {
          isRegistered: true,
          registrationDate: faceData?.createdAt,
          featureVersion: faceData?.featureVersion,
          confidenceThreshold: faceData?.confidenceThreshold,
        },
      };
    } catch (error) {
      console.error('Failed to check user registration:', error);

      return {
        success: false,
        error: {
          code: 'CHECK_REGISTRATION_FAILED',
          message: 'Failed to check user registration',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  async getRegistrationStats(): Promise<
    APIResponse<{
      totalUsers: number;
      registeredUsers: number;
      registrationRate: number;
      averageConfidenceThreshold: number;
      performanceStats: {
        averageProcessingTime: number;
        errorRate: number;
        totalAttempts: number;
      };
    }>
  > {
    try {
      const systemStatus = await this.facialService.getSystemStatus();
      const totalUsers = (await this.database.getAllUsers()).length;
      const registeredCount = await this.facialService.getRegisteredUserCount();

      const registrationRate =
        totalUsers > 0 ? (registeredCount / totalUsers) * 100 : 0;

      let totalConfidenceThreshold = 0;
      let confidenceCount = 0;

      const allUsers = await this.database.getAllUsers();
      for (const user of allUsers) {
        const faceData = await this.database.getFacialData(user.userId);
        if (faceData) {
          totalConfidenceThreshold += faceData.confidenceThreshold;
          confidenceCount++;
        }
      }

      const averageConfidenceThreshold =
        confidenceCount > 0
          ? Math.round((totalConfidenceThreshold / confidenceCount) * 100) / 100
          : 0.85;

      const stats = {
        totalUsers,
        registeredUsers: registeredCount,
        registrationRate: Math.round(registrationRate * 100) / 100,
        averageConfidenceThreshold,
        performanceStats: {
          averageProcessingTime: systemStatus.averageProcessingTime || 0,
          errorRate: systemStatus.errorRate || 0,
          totalAttempts: 0,
        },
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error('Failed to get registration stats:', error);

      return {
        success: false,
        error: {
          code: 'GET_STATS_FAILED',
          message: 'Failed to get registration statistics',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  async clearPerformanceStats(): Promise<APIResponse<void>> {
    try {
      this.facialService.clearPerformanceStats();

      return {
        success: true,
      };
    } catch (error) {
      console.error('Failed to clear performance stats:', error);

      return {
        success: false,
        error: {
          code: 'CLEAR_STATS_FAILED',
          message: 'Failed to clear performance statistics',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  async validateImageData(imageData: string): Promise<
    APIResponse<{
      isValid: boolean;
      size: number;
      estimatedQuality: 'low' | 'medium' | 'high';
      faceDetected: boolean;
    }>
  > {
    try {
      if (!imageData || imageData.trim().length === 0) {
        return {
          success: true,
          data: {
            isValid: false,
            size: 0,
            estimatedQuality: 'low',
            faceDetected: false,
          },
        };
      }

      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      const isValidBase64 = base64Regex.test(imageData);
      const size = imageData.length;

      let estimatedQuality: 'low' | 'medium' | 'high' = 'low';
      if (size > 50000) {
        estimatedQuality = 'high';
      } else if (size > 20000) {
        estimatedQuality = 'medium';
      }

      const faceDetected = size > 5000;

      return {
        success: true,
        data: {
          isValid: isValidBase64 && size > 1000,
          size,
          estimatedQuality,
          faceDetected,
        },
      };
    } catch (error) {
      console.error('Failed to validate image data:', error);

      return {
        success: false,
        error: {
          code: 'VALIDATE_IMAGE_FAILED',
          message: 'Failed to validate image data',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  async healthCheck(): Promise<
    APIResponse<{
      status: 'healthy' | 'degraded' | 'unhealthy';
      systemStatus: SystemStatus;
      registeredUsersCount: number;
    }>
  > {
    try {
      const systemStatus = await this.facialService.getSystemStatus();
      const registeredCount = await this.facialService.getRegisteredUserCount();

      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

      if (!systemStatus.isAvailable) {
        status = 'unhealthy';
      } else if (systemStatus.errorRate && systemStatus.errorRate > 10) {
        status = 'degraded';
      } else if (
        systemStatus.averageProcessingTime &&
        systemStatus.averageProcessingTime > 5000
      ) {
        status = 'degraded';
      }

      return {
        success: true,
        data: {
          status,
          systemStatus,
          registeredUsersCount: registeredCount,
        },
      };
    } catch (error) {
      console.error('Facial Recognition API health check failed:', error);

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
