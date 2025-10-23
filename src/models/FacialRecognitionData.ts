export interface FacialRecognitionData {
  dataId: string;
  userId: string;
  faceDescriptor: Buffer; // Encoded facial features (binary blob)
  confidence: number; // 0-1, quality of the face data
  imageUri?: string; // Optional reference to source image
  metadata?: {
    captureDate: string;
    deviceInfo?: string;
    lightingConditions?: 'good' | 'fair' | 'poor';
    faceAngle?: number;
    imageQuality?: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export class FacialRecognitionDataModel {
  private data: FacialRecognitionData;

  constructor(
    input: Partial<FacialRecognitionData> & {
      userId: string;
      faceDescriptor: Buffer;
    },
  ) {
    this.data = {
      dataId: input.dataId || this.generateId(),
      userId: input.userId,
      faceDescriptor: input.faceDescriptor,
      confidence: input.confidence !== undefined ? input.confidence : 1.0,
      imageUri: input.imageUri,
      metadata: input.metadata || {
        captureDate: new Date().toISOString(),
      },
      isActive: input.isActive !== undefined ? input.isActive : true,
      createdAt: input.createdAt || new Date().toISOString(),
      updatedAt: input.updatedAt || new Date().toISOString(),
    };

    this.validate();
  }

  private validate(): void {
    if (!this.data.userId || this.data.userId.trim().length === 0) {
      throw new Error('FacialRecognitionData: userId is required');
    }

    if (!this.data.dataId || this.data.dataId.trim().length === 0) {
      throw new Error('FacialRecognitionData: dataId is required');
    }

    if (!this.data.faceDescriptor || this.data.faceDescriptor.length === 0) {
      throw new Error('FacialRecognitionData: faceDescriptor is required');
    }

    if (this.data.confidence < 0 || this.data.confidence > 1) {
      throw new Error(
        'FacialRecognitionData: confidence must be between 0 and 1',
      );
    }

    if (
      this.data.metadata?.imageQuality !== undefined &&
      (this.data.metadata.imageQuality < 0 ||
        this.data.metadata.imageQuality > 1)
    ) {
      throw new Error(
        'FacialRecognitionData: imageQuality must be between 0 and 1',
      );
    }
  }

  getData(): FacialRecognitionData {
    return {
      ...this.data,
      faceDescriptor: Buffer.from(this.data.faceDescriptor),
    };
  }

  updateConfidence(confidence: number): void {
    if (confidence < 0 || confidence > 1) {
      throw new Error('Confidence must be between 0 and 1');
    }
    this.data.confidence = confidence;
    this.data.updatedAt = new Date().toISOString();
  }

  deactivate(): void {
    this.data.isActive = false;
    this.data.updatedAt = new Date().toISOString();
  }

  activate(): void {
    this.data.isActive = true;
    this.data.updatedAt = new Date().toISOString();
  }

  updateMetadata(metadata: Partial<FacialRecognitionData['metadata']>): void {
    const currentMetadata = this.data.metadata || {
      captureDate: new Date().toISOString(),
    };
    this.data.metadata = {
      ...currentMetadata,
      ...metadata,
      captureDate: metadata.captureDate || currentMetadata.captureDate,
    };
    this.data.updatedAt = new Date().toISOString();
  }

  getFaceDescriptor(): Buffer {
    return Buffer.from(this.data.faceDescriptor);
  }

  getConfidence(): number {
    return this.data.confidence;
  }

  isHighQuality(): boolean {
    return this.data.confidence >= 0.8;
  }

  toJSON(): string {
    return JSON.stringify({
      ...this.data,
      faceDescriptor: this.data.faceDescriptor.toString('base64'),
    });
  }

  static fromJSON(json: string): FacialRecognitionDataModel {
    const parsed = JSON.parse(json);
    return new FacialRecognitionDataModel({
      ...parsed,
      faceDescriptor: Buffer.from(parsed.faceDescriptor, 'base64'),
    });
  }

  toDatabase(): {
    dataId: string;
    userId: string;
    faceDescriptor: string;
    confidence: number;
    imageUri: string | null;
    metadata: string | null;
    isActive: number;
    createdAt: string;
    updatedAt: string;
  } {
    return {
      dataId: this.data.dataId,
      userId: this.data.userId,
      faceDescriptor: this.data.faceDescriptor.toString('base64'),
      confidence: this.data.confidence,
      imageUri: this.data.imageUri || null,
      metadata: this.data.metadata ? JSON.stringify(this.data.metadata) : null,
      isActive: this.data.isActive ? 1 : 0,
      createdAt: this.data.createdAt,
      updatedAt: this.data.updatedAt,
    };
  }

  static fromDatabase(row: {
    dataId: string;
    userId: string;
    faceDescriptor: string;
    confidence: number;
    imageUri: string | null;
    metadata: string | null;
    isActive: number;
    createdAt: string;
    updatedAt: string;
  }): FacialRecognitionDataModel {
    return new FacialRecognitionDataModel({
      dataId: row.dataId,
      userId: row.userId,
      faceDescriptor: Buffer.from(row.faceDescriptor, 'base64'),
      confidence: row.confidence,
      imageUri: row.imageUri || undefined,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      isActive: row.isActive === 1,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  private generateId(): string {
    return (
      'face-' +
      Date.now().toString(36) +
      '-' +
      Math.random().toString(36).substring(2, 9)
    );
  }
}
