import SQLite, {SQLiteDatabase, Transaction} from 'react-native-sqlite-storage';
import {UserProfile} from '@models/UserProfile';
import {PreferenceProfile} from '@models/PreferenceProfile';
import {DietaryRestriction} from '@models/DietaryRestriction';
import {CuisinePreference} from '@models/CuisinePreference';
import {Location} from '@models/Location';
import * as fs from 'fs';
import * as path from 'path';

export interface DatabaseError extends Error {
  code?: string;
  constraint?: string;
}

export class DatabaseService {
  private static instance: DatabaseService;
  private db: SQLiteDatabase | null = null;
  private readonly dbName = 'dinner_time.db';
  private readonly dbVersion = '1.0.0';

  constructor() {
    SQLite.DEBUG(false);
    SQLite.enablePromise(true);
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabase({
        name: this.dbName,
        location: 'default',
      });

      await this.runMigrations();
      await this.enableForeignKeys();

      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw new Error(
        `Failed to initialize database: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private async enableForeignKeys(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.executeSql('PRAGMA foreign_keys = ON');
  }

  private async runMigrations(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Check if migration table exists
    const [result] = await this.db.executeSql(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='migrations'`,
    );

    if (result.rows.length === 0) {
      // Create migrations table
      await this.db.executeSql(`
        CREATE TABLE migrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          version TEXT NOT NULL UNIQUE,
          applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }

    // Check current schema version
    const [versionResult] = await this.db.executeSql(
      'SELECT version FROM migrations ORDER BY applied_at DESC LIMIT 1',
    );

    const currentVersion =
      versionResult.rows.length > 0
        ? versionResult.rows.item(0).version
        : '0.0.0';

    if (currentVersion < this.dbVersion) {
      await this.applyMigrations(currentVersion);
    }
  }

  private async applyMigrations(fromVersion: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    console.log(
      `Applying migrations from version ${fromVersion} to ${this.dbVersion}`,
    );

    // Read and execute schema file
    const schemaPath = path.join(__dirname, '../storage/schema.sql');

    try {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      const statements = schema
        .split(';')
        .map((stmt: string) => stmt.trim())
        .filter((stmt: string) => stmt.length > 0);

      await this.db.transaction(async (tx: Transaction) => {
        for (const statement of statements) {
          await tx.executeSql(statement);
        }
      });

      // Record migration
      await this.db.executeSql('INSERT INTO migrations (version) VALUES (?)', [
        this.dbVersion,
      ]);

      console.log('Schema migration completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw new Error(
        `Schema migration failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      console.log('Database connection closed');
    }
  }

  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tables = [
      'dinner_suggestions',
      'suggestion_requests',
      'shared_data_settings',
      'facial_recognition_data',
      'cooking_contexts',
      'cuisine_preferences',
      'dietary_restrictions',
      'preference_profiles',
      'user_profiles',
    ];

    await this.db.transaction(async (tx: Transaction) => {
      for (const table of tables) {
        await tx.executeSql(`DELETE FROM ${table}`);
      }
    });

    console.log('All data cleared from database');
  }

  // User Profile Operations
  async createUser(profile: UserProfile): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.executeSql(
        `
        INSERT INTO user_profiles (
          user_id, name, created_at, last_used, is_active,
          location_lat, location_lng, location_updated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          profile.userId,
          profile.name,
          profile.createdAt,
          profile.lastUsed,
          profile.isActive ? 1 : 0,
          profile.location?.latitude || null,
          profile.location?.longitude || null,
          profile.location?.updatedAt || null,
        ],
      );
    } catch (error) {
      throw this.handleDatabaseError(error);
    }
  }

  async getUserById(userId: string): Promise<UserProfile | null> {
    if (!this.db) throw new Error('Database not initialized');

    const [result] = await this.db.executeSql(
      'SELECT * FROM user_profiles WHERE user_id = ? AND is_active = 1',
      [userId],
    );

    if (result.rows.length === 0) return null;

    return this.mapRowToUserProfile(result.rows.item(0));
  }

  async getAllUsers(): Promise<UserProfile[]> {
    if (!this.db) throw new Error('Database not initialized');

    const [result] = await this.db.executeSql(
      'SELECT * FROM user_profiles WHERE is_active = 1 ORDER BY last_used DESC',
    );

    const users: UserProfile[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      users.push(this.mapRowToUserProfile(result.rows.item(i)));
    }

    return users;
  }

  async updateUser(
    userId: string,
    updates: Partial<UserProfile>,
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const setParts: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      setParts.push('name = ?');
      values.push(updates.name);
    }

    if (updates.location !== undefined) {
      setParts.push('location_lat = ?, location_lng = ?, location_updated = ?');
      values.push(
        updates.location?.latitude || null,
        updates.location?.longitude || null,
        updates.location?.updatedAt || null,
      );
    }

    if (updates.lastUsed !== undefined) {
      setParts.push('last_used = ?');
      values.push(updates.lastUsed);
    }

    if (setParts.length === 0) return;

    values.push(userId);

    try {
      await this.db.executeSql(
        `UPDATE user_profiles SET ${setParts.join(', ')} WHERE user_id = ?`,
        values,
      );
    } catch (error) {
      throw this.handleDatabaseError(error);
    }
  }

  async deleteUser(userId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.executeSql(
      'UPDATE user_profiles SET is_active = 0 WHERE user_id = ?',
      [userId],
    );
  }

  async findUserByName(name: string): Promise<UserProfile | null> {
    if (!this.db) throw new Error('Database not initialized');

    const [result] = await this.db.executeSql(
      'SELECT * FROM user_profiles WHERE LOWER(name) = LOWER(?) AND is_active = 1',
      [name.trim()],
    );

    if (result.rows.length === 0) return null;

    return this.mapRowToUserProfile(result.rows.item(0));
  }

  // Preference Profile Operations
  async createPreferenceProfile(profile: PreferenceProfile): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.transaction(async (tx: Transaction) => {
      // Handle default profile logic
      if (profile.isDefault) {
        await tx.executeSql(
          'UPDATE preference_profiles SET is_default = 0 WHERE user_id = ?',
          [profile.userId],
        );
      }

      // Insert preference profile
      await tx.executeSql(
        `
        INSERT INTO preference_profiles (
          profile_id, user_id, name, is_default, created_at
        ) VALUES (?, ?, ?, ?, ?)
      `,
        [
          profile.profileId,
          profile.userId,
          profile.name,
          profile.isDefault ? 1 : 0,
          profile.createdAt,
        ],
      );

      // Insert dietary restrictions
      for (const restriction of profile.dietaryRestrictions) {
        await tx.executeSql(
          `
          INSERT INTO dietary_restrictions (
            restriction_id, profile_id, type, custom_name
          ) VALUES (?, ?, ?, ?)
        `,
          [
            restriction.restrictionId,
            profile.profileId,
            restriction.type,
            restriction.customName || null,
          ],
        );
      }

      // Insert cuisine preferences
      for (const preference of profile.cuisinePreferences) {
        await tx.executeSql(
          `
          INSERT INTO cuisine_preferences (
            preference_id, profile_id, cuisine_type, preference_level
          ) VALUES (?, ?, ?, ?)
        `,
          [
            preference.preferenceId,
            profile.profileId,
            preference.cuisineType,
            preference.preferenceLevel,
          ],
        );
      }
    });
  }

  async getPreferenceProfileById(
    profileId: string,
  ): Promise<PreferenceProfile | null> {
    if (!this.db) throw new Error('Database not initialized');

    const [result] = await this.db.executeSql(
      'SELECT * FROM preference_profiles WHERE profile_id = ?',
      [profileId],
    );

    if (result.rows.length === 0) return null;

    const profile = result.rows.item(0);
    return await this.buildPreferenceProfile(profile);
  }

  async getPreferenceProfilesByUserId(
    userId: string,
  ): Promise<PreferenceProfile[]> {
    if (!this.db) throw new Error('Database not initialized');

    const [result] = await this.db.executeSql(
      'SELECT * FROM preference_profiles WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [userId],
    );

    const profiles: PreferenceProfile[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      const profile = await this.buildPreferenceProfile(result.rows.item(i));
      profiles.push(profile);
    }

    return profiles;
  }

  private async buildPreferenceProfile(
    profileRow: any,
  ): Promise<PreferenceProfile> {
    if (!this.db) throw new Error('Database not initialized');

    // Get dietary restrictions
    const [restrictionsResult] = await this.db.executeSql(
      'SELECT * FROM dietary_restrictions WHERE profile_id = ?',
      [profileRow.profile_id],
    );

    const dietaryRestrictions: DietaryRestriction[] = [];
    for (let i = 0; i < restrictionsResult.rows.length; i++) {
      const row = restrictionsResult.rows.item(i);
      dietaryRestrictions.push({
        restrictionId: row.restriction_id,
        type: row.type,
        customName: row.custom_name,
      });
    }

    // Get cuisine preferences
    const [preferencesResult] = await this.db.executeSql(
      'SELECT * FROM cuisine_preferences WHERE profile_id = ?',
      [profileRow.profile_id],
    );

    const cuisinePreferences: CuisinePreference[] = [];
    for (let i = 0; i < preferencesResult.rows.length; i++) {
      const row = preferencesResult.rows.item(i);
      cuisinePreferences.push({
        preferenceId: row.preference_id,
        cuisineType: row.cuisine_type,
        preferenceLevel: row.preference_level,
      });
    }

    return {
      profileId: profileRow.profile_id,
      userId: profileRow.user_id,
      name: profileRow.name,
      isDefault: profileRow.is_default === 1,
      dietaryRestrictions,
      cuisinePreferences,
      createdAt: profileRow.created_at,
    };
  }

  // Facial Recognition Data Operations
  async storeFacialData(
    userId: string,
    faceFeatures: Buffer,
    featureVersion: string,
    confidenceThreshold: number,
  ): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const faceId = this.generateId();
    const now = new Date().toISOString();

    try {
      await this.db.executeSql(
        `
        INSERT OR REPLACE INTO facial_recognition_data (
          face_id, user_id, face_features, feature_version,
          created_at, updated_at, confidence_threshold
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
        [
          faceId,
          userId,
          faceFeatures,
          featureVersion,
          now,
          now,
          confidenceThreshold,
        ],
      );

      return faceId;
    } catch (error) {
      throw this.handleDatabaseError(error);
    }
  }

  async getFacialData(userId: string): Promise<{
    faceId: string;
    faceFeatures: Buffer;
    featureVersion: string;
    confidenceThreshold: number;
    createdAt: string;
    updatedAt: string;
  } | null> {
    if (!this.db) throw new Error('Database not initialized');

    const [result] = await this.db.executeSql(
      'SELECT * FROM facial_recognition_data WHERE user_id = ?',
      [userId],
    );

    if (result.rows.length === 0) return null;

    const row = result.rows.item(0);
    return {
      faceId: row.face_id,
      faceFeatures: row.face_features,
      featureVersion: row.feature_version,
      confidenceThreshold: row.confidence_threshold,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async deleteFacialData(userId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.executeSql(
      'DELETE FROM facial_recognition_data WHERE user_id = ?',
      [userId],
    );
  }

  // Utility methods
  private mapRowToUserProfile(row: any): UserProfile {
    const location: Location | undefined =
      row.location_lat && row.location_lng
        ? {
            latitude: row.location_lat,
            longitude: row.location_lng,
            updatedAt: row.location_updated,
          }
        : undefined;

    return {
      userId: row.user_id,
      name: row.name,
      createdAt: row.created_at,
      lastUsed: row.last_used,
      isActive: row.is_active === 1,
      location,
    };
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

  private handleDatabaseError(error: any): DatabaseError {
    const dbError: DatabaseError = new Error(
      error instanceof Error ? error.message : String(error),
    );

    if (
      error instanceof Error
        ? error.message
        : String(error)?.includes('UNIQUE constraint failed')
    ) {
      dbError.code = 'CONSTRAINT_UNIQUE';
      if (
        error instanceof Error
          ? error.message
          : String(error).includes('user_profiles.name')
      ) {
        dbError.constraint = 'user_name';
        dbError.message = 'A user with this name already exists';
      }
    } else if (
      error instanceof Error
        ? error.message
        : String(error)?.includes('FOREIGN KEY constraint failed')
    ) {
      dbError.code = 'CONSTRAINT_FOREIGN_KEY';
      dbError.message = 'Referenced record does not exist';
    }

    return dbError;
  }

  // Health check and maintenance
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    details: string;
  }> {
    try {
      if (!this.db) {
        return {status: 'unhealthy', details: 'Database not initialized'};
      }

      await this.db.executeSql('SELECT 1');
      return {status: 'healthy', details: 'Database connection active'};
    } catch (error) {
      return {
        status: 'unhealthy',
        details: `Database error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  async getStats(): Promise<{
    userCount: number;
    profileCount: number;
    faceDataCount: number;
    dbSize: string;
  }> {
    if (!this.db) throw new Error('Database not initialized');

    const [userResult] = await this.db.executeSql(
      'SELECT COUNT(*) as count FROM user_profiles WHERE is_active = 1',
    );
    const [profileResult] = await this.db.executeSql(
      'SELECT COUNT(*) as count FROM preference_profiles',
    );
    const [faceResult] = await this.db.executeSql(
      'SELECT COUNT(*) as count FROM facial_recognition_data',
    );

    return {
      userCount: userResult.rows.item(0).count,
      profileCount: profileResult.rows.item(0).count,
      faceDataCount: faceResult.rows.item(0).count,
      dbSize: 'Unknown', // Could implement file size check if needed
    };
  }
}
