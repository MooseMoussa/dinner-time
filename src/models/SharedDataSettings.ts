export type ShareableDataType =
  | 'location'
  | 'cooking_equipment'
  | 'ingredients'
  | 'cooking_context'
  | 'suggestion_history';

export interface SharedDataSettings {
  settingsId: string;
  userId: string;
  deviceId?: string; // Optional: identifies which device/installation
  sharedDataTypes: ShareableDataType[];
  shareWithUsers: string[]; // List of user IDs to share with
  shareWithAll: boolean; // Share with all users on device
  autoSync: boolean; // Automatically sync shared data
  createdAt: string;
  updatedAt: string;
}

export class SharedDataSettingsModel {
  private settings: SharedDataSettings;

  constructor(data: Partial<SharedDataSettings> & {userId: string}) {
    this.settings = {
      settingsId: data.settingsId || this.generateId(),
      userId: data.userId,
      deviceId: data.deviceId,
      sharedDataTypes: data.sharedDataTypes || [],
      shareWithUsers: data.shareWithUsers || [],
      shareWithAll: data.shareWithAll !== undefined ? data.shareWithAll : false,
      autoSync: data.autoSync !== undefined ? data.autoSync : true,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    };

    this.validate();
  }

  private validate(): void {
    if (!this.settings.userId || this.settings.userId.trim().length === 0) {
      throw new Error('SharedDataSettings: userId is required');
    }

    if (
      !this.settings.settingsId ||
      this.settings.settingsId.trim().length === 0
    ) {
      throw new Error('SharedDataSettings: settingsId is required');
    }

    // Validate data types
    const validDataTypes: ShareableDataType[] = [
      'location',
      'cooking_equipment',
      'ingredients',
      'cooking_context',
      'suggestion_history',
    ];

    for (const dataType of this.settings.sharedDataTypes) {
      if (!validDataTypes.includes(dataType)) {
        throw new Error(`SharedDataSettings: Invalid data type "${dataType}"`);
      }
    }

    // Cannot share with specific users AND all users
    if (this.settings.shareWithAll && this.settings.shareWithUsers.length > 0) {
      throw new Error(
        'SharedDataSettings: Cannot specify shareWithUsers when shareWithAll is true',
      );
    }
  }

  getData(): SharedDataSettings {
    return {
      ...this.settings,
      sharedDataTypes: [...this.settings.sharedDataTypes],
      shareWithUsers: [...this.settings.shareWithUsers],
    };
  }

  enableSharing(dataType: ShareableDataType): void {
    if (!this.settings.sharedDataTypes.includes(dataType)) {
      this.settings.sharedDataTypes.push(dataType);
      this.settings.updatedAt = new Date().toISOString();
    }
  }

  disableSharing(dataType: ShareableDataType): void {
    this.settings.sharedDataTypes = this.settings.sharedDataTypes.filter(
      type => type !== dataType,
    );
    this.settings.updatedAt = new Date().toISOString();
  }

  isSharingEnabled(dataType: ShareableDataType): boolean {
    return this.settings.sharedDataTypes.includes(dataType);
  }

  addUserToShare(userId: string): void {
    if (this.settings.shareWithAll) {
      throw new Error('Cannot add specific users when shareWithAll is enabled');
    }

    if (!this.settings.shareWithUsers.includes(userId)) {
      this.settings.shareWithUsers.push(userId);
      this.settings.updatedAt = new Date().toISOString();
    }
  }

  removeUserFromShare(userId: string): void {
    this.settings.shareWithUsers = this.settings.shareWithUsers.filter(
      id => id !== userId,
    );
    this.settings.updatedAt = new Date().toISOString();
  }

  enableShareWithAll(): void {
    if (this.settings.shareWithUsers.length > 0) {
      throw new Error(
        'Cannot enable shareWithAll when specific users are set. Clear shareWithUsers first.',
      );
    }
    this.settings.shareWithAll = true;
    this.settings.updatedAt = new Date().toISOString();
  }

  disableShareWithAll(): void {
    this.settings.shareWithAll = false;
    this.settings.updatedAt = new Date().toISOString();
  }

  canShareWith(userId: string): boolean {
    if (this.settings.shareWithAll) {
      return true;
    }
    return this.settings.shareWithUsers.includes(userId);
  }

  enableAutoSync(): void {
    this.settings.autoSync = true;
    this.settings.updatedAt = new Date().toISOString();
  }

  disableAutoSync(): void {
    this.settings.autoSync = false;
    this.settings.updatedAt = new Date().toISOString();
  }

  clearAllSharing(): void {
    this.settings.sharedDataTypes = [];
    this.settings.shareWithUsers = [];
    this.settings.shareWithAll = false;
    this.settings.updatedAt = new Date().toISOString();
  }

  toJSON(): string {
    return JSON.stringify(this.settings);
  }

  static fromJSON(json: string): SharedDataSettingsModel {
    const data = JSON.parse(json);
    return new SharedDataSettingsModel(data);
  }

  toDatabase(): {
    settingsId: string;
    userId: string;
    deviceId: string | null;
    sharedDataTypes: string;
    shareWithUsers: string;
    shareWithAll: number;
    autoSync: number;
    createdAt: string;
    updatedAt: string;
  } {
    return {
      settingsId: this.settings.settingsId,
      userId: this.settings.userId,
      deviceId: this.settings.deviceId || null,
      sharedDataTypes: JSON.stringify(this.settings.sharedDataTypes),
      shareWithUsers: JSON.stringify(this.settings.shareWithUsers),
      shareWithAll: this.settings.shareWithAll ? 1 : 0,
      autoSync: this.settings.autoSync ? 1 : 0,
      createdAt: this.settings.createdAt,
      updatedAt: this.settings.updatedAt,
    };
  }

  static fromDatabase(row: {
    settingsId: string;
    userId: string;
    deviceId: string | null;
    sharedDataTypes: string;
    shareWithUsers: string;
    shareWithAll: number;
    autoSync: number;
    createdAt: string;
    updatedAt: string;
  }): SharedDataSettingsModel {
    return new SharedDataSettingsModel({
      settingsId: row.settingsId,
      userId: row.userId,
      deviceId: row.deviceId || undefined,
      sharedDataTypes: JSON.parse(row.sharedDataTypes),
      shareWithUsers: JSON.parse(row.shareWithUsers),
      shareWithAll: row.shareWithAll === 1,
      autoSync: row.autoSync === 1,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  private generateId(): string {
    return (
      'share-' +
      Date.now().toString(36) +
      '-' +
      Math.random().toString(36).substring(2, 9)
    );
  }
}
