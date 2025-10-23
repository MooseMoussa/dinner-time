import {DatabaseService} from './DatabaseService';

export interface FaceMatch {
  userId: string;
  confidence: number;
  userName: string;
}

export interface FaceRegistrationResult {
  faceId: string;
  userId: string;
  featureVersion: string;
  confidenceThreshold: number;
  registeredAt: string;
  status: 'success' | 'warning' | 'error';
  message?: string;
}

export interface FaceIdentificationResult {
  matches: FaceMatch[];
  processingTime: number;
  status: 'success' | 'no_match' | 'low_confidence';
}

export interface SystemStatus {
  isAvailable: boolean;
  featureVersion: string;
  registeredUsers: number;
  lastCalibration?: string;
  averageProcessingTime?: number;
  errorRate?: number;
}

export class FacialRecognitionService {
  private static instance: FacialRecognitionService;
  private database: DatabaseService;
  private readonly featureVersion = '1.0.0';
  private readonly defaultConfidenceThreshold = 0.85;
  private processingTimes: number[] = [];
  private errorCount = 0;
  private totalAttempts = 0;

  constructor() {
    this.database = DatabaseService.getInstance();
  }

  static getInstance(): FacialRecognitionService {
    if (!FacialRecognitionService.instance) {
      FacialRecognitionService.instance = new FacialRecognitionService();
    }
    return FacialRecognitionService.instance;
  }

  async registerFace(
    userId: string,
    imageData: string,
    confidenceThreshold: number = this.defaultConfidenceThreshold,
  ): Promise<FaceRegistrationResult> {
    const startTime = Date.now();

    try {
      // Validate inputs
      this.validateUserId(userId);
      this.validateImageData(imageData);
      this.validateConfidenceThreshold(confidenceThreshold);

      // Check if user exists
      const user = await this.database.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Convert base64 to buffer for processing
      const imageBuffer = this.base64ToBuffer(imageData);

      // Detect faces in the image
      const faces = await this.detectFaces(imageBuffer);

      if (faces.length === 0) {
        return {
          faceId: '',
          userId,
          featureVersion: this.featureVersion,
          confidenceThreshold,
          registeredAt: new Date().toISOString(),
          status: 'error',
          message: 'No face detected in the provided image',
        };
      }

      if (faces.length > 1) {
        return {
          faceId: '',
          userId,
          featureVersion: this.featureVersion,
          confidenceThreshold,
          registeredAt: new Date().toISOString(),
          status: 'warning',
          message: 'Multiple faces detected. Using the largest face.',
        };
      }

      // Extract features from the best face
      const primaryFace = faces[0];
      const faceFeatures = await this.extractFeatures(primaryFace);

      // Check face quality
      const qualityScore = this.assessFaceQuality(primaryFace);
      let status: 'success' | 'warning' | 'error' = 'success';
      let message: string | undefined;

      if (qualityScore < 0.5) {
        status = 'warning';
        message =
          'Low quality image detected. Consider retaking the photo for better recognition accuracy.';
      }

      // Store facial data in database
      const faceId = await this.database.storeFacialData(
        userId,
        faceFeatures,
        this.featureVersion,
        confidenceThreshold,
      );

      const processingTime = Date.now() - startTime;
      this.recordProcessingTime(processingTime);

      return {
        faceId,
        userId,
        featureVersion: this.featureVersion,
        confidenceThreshold,
        registeredAt: new Date().toISOString(),
        status,
        message,
      };
    } catch (error) {
      this.recordError();
      throw new Error(
        `Face registration failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async identifyFace(
    imageData: string,
    maxResults: number = 1,
  ): Promise<FaceIdentificationResult> {
    const startTime = Date.now();
    this.totalAttempts++;

    try {
      // Validate inputs
      this.validateImageData(imageData);

      if (maxResults < 1 || maxResults > 5) {
        throw new Error('Max results must be between 1 and 5');
      }

      // Convert base64 to buffer for processing
      const imageBuffer = this.base64ToBuffer(imageData);

      // Detect faces in the image
      const faces = await this.detectFaces(imageBuffer);

      if (faces.length === 0) {
        const processingTime = Date.now() - startTime;
        this.recordProcessingTime(processingTime);

        return {
          matches: [],
          processingTime,
          status: 'no_match',
        };
      }

      // Extract features from the primary face
      const primaryFace = faces[0];
      const inputFeatures = await this.extractFeatures(primaryFace);

      // Get all registered facial data
      const registeredUsers = await this.getAllRegisteredUsers();

      if (registeredUsers.length === 0) {
        const processingTime = Date.now() - startTime;
        this.recordProcessingTime(processingTime);

        return {
          matches: [],
          processingTime,
          status: 'no_match',
        };
      }

      // Compare with all registered faces
      const matches: FaceMatch[] = [];

      for (const registeredUser of registeredUsers) {
        const similarity = await this.compareFaces(
          inputFeatures,
          registeredUser.faceFeatures,
        );

        if (similarity >= registeredUser.confidenceThreshold) {
          matches.push({
            userId: registeredUser.userId,
            confidence: similarity,
            userName: registeredUser.userName,
          });
        }
      }

      // Sort by confidence (highest first) and limit results
      matches.sort((a, b) => b.confidence - a.confidence);
      const limitedMatches = matches.slice(0, maxResults);

      const processingTime = Date.now() - startTime;
      this.recordProcessingTime(processingTime);

      // Determine status
      let status: 'success' | 'no_match' | 'low_confidence';
      if (limitedMatches.length === 0) {
        status = 'no_match';
      } else if (limitedMatches[0].confidence < 0.7) {
        status = 'low_confidence';
      } else {
        status = 'success';
      }

      return {
        matches: limitedMatches,
        processingTime,
        status,
      };
    } catch (error) {
      this.recordError();
      throw new Error(
        `Face identification failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async updateFace(
    userId: string,
    imageData: string,
    confidenceThreshold?: number,
  ): Promise<FaceRegistrationResult> {
    // Delete existing facial data
    await this.database.deleteFacialData(userId);

    // Register new facial data
    return await this.registerFace(
      userId,
      imageData,
      confidenceThreshold || this.defaultConfidenceThreshold,
    );
  }

  async removeFace(userId: string): Promise<void> {
    try {
      await this.database.deleteFacialData(userId);
    } catch (error) {
      throw new Error(
        `Failed to remove facial data: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async getSystemStatus(): Promise<SystemStatus> {
    try {
      const stats = await this.database.getStats();
      const averageProcessingTime = this.calculateAverageProcessingTime();
      const errorRate = this.calculateErrorRate();

      return {
        isAvailable: true,
        featureVersion: this.featureVersion,
        registeredUsers: stats.faceDataCount,
        averageProcessingTime,
        errorRate,
      };
    } catch (error) {
      return {
        isAvailable: false,
        featureVersion: this.featureVersion,
        registeredUsers: 0,
      };
    }
  }

  // Private methods

  private validateUserId(userId: string): void {
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error('Valid user ID is required');
    }
  }

  private validateImageData(imageData: string): void {
    if (!imageData || typeof imageData !== 'string') {
      throw new Error('Valid image data is required');
    }

    // Basic base64 validation
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(imageData)) {
      throw new Error('Invalid base64 image data');
    }

    // Check minimum size (should be at least a few KB for a face image)
    if (imageData.length < 1000) {
      throw new Error('Image data appears to be too small');
    }
  }

  private validateConfidenceThreshold(threshold: number): void {
    if (typeof threshold !== 'number' || threshold < 0 || threshold > 1) {
      throw new Error('Confidence threshold must be a number between 0 and 1');
    }
  }

  private base64ToBuffer(base64: string): Buffer {
    try {
      return Buffer.from(base64, 'base64');
    } catch (error) {
      throw new Error('Failed to decode base64 image data');
    }
  }

  private async detectFaces(imageBuffer: Buffer): Promise<any[]> {
    try {
      // Mock face detection for this implementation
      // In a real implementation, this would use react-native-face-detector

      // Simulate face detection with random results for testing
      const mockFaces = [
        {
          x: 100,
          y: 100,
          width: 200,
          height: 200,
          confidence: 0.9,
          landmarks: {
            leftEye: {x: 150, y: 150},
            rightEye: {x: 250, y: 150},
            nose: {x: 200, y: 180},
            mouth: {x: 200, y: 220},
          },
        },
      ];

      // Return empty array if buffer is too small (simulate no face detected)
      if (imageBuffer.length < 5000) {
        return [];
      }

      return mockFaces;
    } catch (error) {
      throw new Error(
        `Face detection failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private async extractFeatures(_face: any): Promise<Buffer> {
    try {
      // Mock feature extraction
      // In a real implementation, this would extract mathematical features from the face

      // Create a mock feature vector as a buffer
      const features = new Float32Array(128); // 128-dimensional feature vector

      // Fill with mock data based on face properties
      for (let i = 0; i < features.length; i++) {
        features[i] = Math.random() * 2 - 1; // Random values between -1 and 1
      }

      return Buffer.from(features.buffer);
    } catch (error) {
      throw new Error(
        `Feature extraction failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private assessFaceQuality(face: any): number {
    // Mock quality assessment
    // In a real implementation, this would analyze face clarity, lighting, angle, etc.

    let qualityScore = 1.0;

    // Reduce score for low confidence detection
    if (face.confidence < 0.8) {
      qualityScore *= 0.7;
    }

    // Reduce score for small faces
    const faceArea = face.width * face.height;
    if (faceArea < 10000) {
      // Less than 100x100 pixels
      qualityScore *= 0.6;
    }

    return Math.max(0, Math.min(1, qualityScore));
  }

  private async compareFaces(
    features1: Buffer,
    features2: Buffer,
  ): Promise<number> {
    try {
      // Mock face comparison using cosine similarity
      // In a real implementation, this would use sophisticated face comparison algorithms

      if (features1.length !== features2.length) {
        throw new Error('Feature vectors must have the same length');
      }

      const vector1 = new Float32Array(features1.buffer);
      const vector2 = new Float32Array(features2.buffer);

      // Calculate cosine similarity
      let dotProduct = 0;
      let magnitude1 = 0;
      let magnitude2 = 0;

      for (let i = 0; i < vector1.length; i++) {
        dotProduct += vector1[i] * vector2[i];
        magnitude1 += vector1[i] * vector1[i];
        magnitude2 += vector2[i] * vector2[i];
      }

      magnitude1 = Math.sqrt(magnitude1);
      magnitude2 = Math.sqrt(magnitude2);

      if (magnitude1 === 0 || magnitude2 === 0) {
        return 0;
      }

      const similarity = dotProduct / (magnitude1 * magnitude2);

      // Convert from [-1, 1] to [0, 1] range
      return (similarity + 1) / 2;
    } catch (error) {
      throw new Error(
        `Face comparison failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private async getAllRegisteredUsers(): Promise<
    Array<{
      userId: string;
      userName: string;
      faceFeatures: Buffer;
      confidenceThreshold: number;
    }>
  > {
    const users = await this.database.getAllUsers();
    const registeredUsers = [];

    for (const user of users) {
      const faceData = await this.database.getFacialData(user.userId);
      if (faceData) {
        registeredUsers.push({
          userId: user.userId,
          userName: user.name,
          faceFeatures: faceData.faceFeatures,
          confidenceThreshold: faceData.confidenceThreshold,
        });
      }
    }

    return registeredUsers;
  }

  private recordProcessingTime(time: number): void {
    this.processingTimes.push(time);

    // Keep only the last 100 processing times
    if (this.processingTimes.length > 100) {
      this.processingTimes = this.processingTimes.slice(-100);
    }
  }

  private recordError(): void {
    this.errorCount++;
  }

  private calculateAverageProcessingTime(): number {
    if (this.processingTimes.length === 0) return 0;

    const sum = this.processingTimes.reduce((acc, time) => acc + time, 0);
    return Math.round(sum / this.processingTimes.length);
  }

  private calculateErrorRate(): number {
    if (this.totalAttempts === 0) return 0;

    return Math.round((this.errorCount / this.totalAttempts) * 100 * 100) / 100; // Two decimal places
  }

  // Testing and development helpers
  async isUserRegistered(userId: string): Promise<boolean> {
    try {
      const faceData = await this.database.getFacialData(userId);
      return faceData !== null;
    } catch (error) {
      return false;
    }
  }

  async getRegisteredUserCount(): Promise<number> {
    try {
      const stats = await this.database.getStats();
      return stats.faceDataCount;
    } catch (error) {
      return 0;
    }
  }

  clearPerformanceStats(): void {
    this.processingTimes = [];
    this.errorCount = 0;
    this.totalAttempts = 0;
  }
}
