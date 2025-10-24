import {DatabaseService} from './DatabaseService';
import {AuthenticationModel} from '@models/Authentication';

export interface LoginCredentials {
  identifier: string; // email or phone
  password: string;
  saveCredentials?: boolean;
}

export interface RegistrationData {
  name: string;
  email?: string;
  phoneNumber?: string;
  password: string;
  saveCredentials?: boolean;
}

export class AuthenticationService {
  private static instance: AuthenticationService;
  private db: DatabaseService;

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  static getInstance(): AuthenticationService {
    if (!AuthenticationService.instance) {
      AuthenticationService.instance = new AuthenticationService();
    }
    return AuthenticationService.instance;
  }

  /**
   * Hash password using simple algorithm
   * NOTE: In production, use bcrypt or similar
   */
  private async hashPassword(password: string): Promise<string> {
    // Simple hash for demonstration
    // In production, use: const bcrypt = require('bcrypt'); return bcrypt.hash(password, 10);
    const hash = Buffer.from(password).toString('base64');
    return `hashed_${hash}`;
  }

  /**
   * Verify password against hash
   */
  private async verifyPassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    const expectedHash = await this.hashPassword(password);
    return expectedHash === hash;
  }

  /**
   * Register new user with authentication
   */
  async register(data: RegistrationData): Promise<{
    success: boolean;
    userId?: string;
    error?: string;
  }> {
    try {
      // Validate input
      if (!data.email && !data.phoneNumber) {
        return {success: false, error: 'Email or phone number required'};
      }

      if (!data.password || data.password.length < 8) {
        return {
          success: false,
          error: 'Password must be at least 8 characters',
        };
      }

      // Check if email/phone already exists
      const existing = await this.findByIdentifier(
        data.email || data.phoneNumber!,
      );
      if (existing) {
        return {
          success: false,
          error: 'Account with this email/phone already exists',
        };
      }

      // Create user profile
      const userId = this.generateUserId();
      const userInsertQuery = `
        INSERT INTO user_profiles (user_id, name, last_used, created_at)
        VALUES (?, ?, ?, ?)
      `;

      const now = new Date().toISOString();
      await this.db.execute(userInsertQuery, [userId, data.name, now, now]);

      // Hash password
      const passwordHash = await this.hashPassword(data.password);

      // Create authentication record
      const auth = new AuthenticationModel({
        userId,
        email: data.email,
        phoneNumber: data.phoneNumber,
        passwordHash,
        saveCredentials: data.saveCredentials || false,
      });

      const authData = auth.toDatabase();
      const authInsertQuery = `
        INSERT INTO authentication (
          auth_id, user_id, email, phone_number, password_hash,
          save_credentials, last_login, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await this.db.execute(authInsertQuery, [
        authData.authId,
        authData.userId,
        authData.email,
        authData.phoneNumber,
        authData.passwordHash,
        authData.saveCredentials,
        authData.lastLogin,
        authData.isActive,
        authData.createdAt,
        authData.updatedAt,
      ]);

      return {success: true, userId};
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  }

  /**
   * Login with email/phone and password
   */
  async login(credentials: LoginCredentials): Promise<{
    success: boolean;
    userId?: string;
    userName?: string;
    saveCredentials?: boolean;
    error?: string;
  }> {
    try {
      // Find authentication record
      const query = `
        SELECT a.*, u.name as user_name
        FROM authentication a
        JOIN user_profiles u ON a.user_id = u.user_id
        WHERE (a.email = ? OR a.phone_number = ?) AND a.is_active = 1
      `;

      const results = await this.db.query(query, [
        credentials.identifier,
        credentials.identifier,
      ]);

      if (!results || results.length === 0) {
        return {success: false, error: 'Invalid credentials'};
      }

      const authRow = results[0];
      const auth = AuthenticationModel.fromDatabase(authRow);

      // Verify password
      const passwordHash = await this.hashPassword(credentials.password);
      if (!auth.verifyPassword(passwordHash)) {
        return {success: false, error: 'Invalid credentials'};
      }

      // Update last login
      auth.updateLastLogin();

      // Update save credentials preference if provided
      if (credentials.saveCredentials !== undefined) {
        auth.updateSaveCredentials(credentials.saveCredentials);
      }

      const authData = auth.toDatabase();
      const updateQuery = `
        UPDATE authentication
        SET last_login = ?, save_credentials = ?, updated_at = ?
        WHERE auth_id = ?
      `;

      await this.db.execute(updateQuery, [
        authData.lastLogin,
        authData.saveCredentials,
        authData.updatedAt,
        authData.authId,
      ]);

      return {
        success: true,
        userId: auth.getData().userId,
        userName: authRow.user_name,
        saveCredentials: auth.shouldSaveCredentials(),
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  /**
   * Check if credentials are saved for an identifier
   */
  async getSavedCredentials(identifier: string): Promise<{
    hasSaved: boolean;
    email?: string;
    phoneNumber?: string;
  }> {
    try {
      const query = `
        SELECT email, phone_number, save_credentials
        FROM authentication
        WHERE (email = ? OR phone_number = ?) AND save_credentials = 1 AND is_active = 1
      `;

      const results = await this.db.query(query, [identifier, identifier]);

      if (results && results.length > 0) {
        return {
          hasSaved: true,
          email: results[0].email,
          phoneNumber: results[0].phone_number,
        };
      }

      return {hasSaved: false};
    } catch (error) {
      console.error('Get saved credentials error:', error);
      return {hasSaved: false};
    }
  }

  /**
   * Find authentication by email or phone
   */
  private async findByIdentifier(identifier: string): Promise<boolean> {
    try {
      const query = `
        SELECT auth_id
        FROM authentication
        WHERE (email = ? OR phone_number = ?) AND is_active = 1
      `;

      const results = await this.db.query(query, [identifier, identifier]);
      return results && results.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Change password for user
   */
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<{success: boolean; error?: string}> {
    try {
      if (newPassword.length < 8) {
        return {
          success: false,
          error: 'Password must be at least 8 characters',
        };
      }

      // Get current auth
      const query = `SELECT * FROM authentication WHERE user_id = ? AND is_active = 1`;
      const results = await this.db.query(query, [userId]);

      if (!results || results.length === 0) {
        return {success: false, error: 'Authentication not found'};
      }

      const auth = AuthenticationModel.fromDatabase(results[0]);

      // Verify old password
      const oldPasswordHash = await this.hashPassword(oldPassword);
      if (!auth.verifyPassword(oldPasswordHash)) {
        return {success: false, error: 'Current password is incorrect'};
      }

      // Update to new password
      const newPasswordHash = await this.hashPassword(newPassword);
      auth.updatePassword(newPasswordHash);

      const authData = auth.toDatabase();
      const updateQuery = `
        UPDATE authentication
        SET password_hash = ?, updated_at = ?
        WHERE auth_id = ?
      `;

      await this.db.execute(updateQuery, [
        authData.passwordHash,
        authData.updatedAt,
        authData.authId,
      ]);

      return {success: true};
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Password change failed',
      };
    }
  }

  private generateUserId(): string {
    return (
      'user-' +
      Date.now().toString(36) +
      '-' +
      Math.random().toString(36).substring(2, 9)
    );
  }
}
