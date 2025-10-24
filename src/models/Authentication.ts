export interface Authentication {
  authId: string;
  userId: string;
  email?: string;
  phoneNumber?: string;
  passwordHash: string; // Hashed password, never store plain text
  saveCredentials: boolean; // User preference to save login
  lastLogin: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export class AuthenticationModel {
  private data: Authentication;

  constructor(
    input: Partial<Authentication> & {
      userId: string;
      passwordHash: string;
    },
  ) {
    // Validate that at least email or phone is provided
    if (!input.email && !input.phoneNumber) {
      throw new Error('Either email or phone number is required');
    }

    this.data = {
      authId: input.authId || this.generateId(),
      userId: input.userId,
      email: input.email,
      phoneNumber: input.phoneNumber,
      passwordHash: input.passwordHash,
      saveCredentials:
        input.saveCredentials !== undefined ? input.saveCredentials : false,
      lastLogin: input.lastLogin || new Date().toISOString(),
      isActive: input.isActive !== undefined ? input.isActive : true,
      createdAt: input.createdAt || new Date().toISOString(),
      updatedAt: input.updatedAt || new Date().toISOString(),
    };

    this.validate();
  }

  private validate(): void {
    if (!this.data.userId || this.data.userId.trim().length === 0) {
      throw new Error('Authentication: userId is required');
    }

    if (!this.data.authId || this.data.authId.trim().length === 0) {
      throw new Error('Authentication: authId is required');
    }

    if (!this.data.passwordHash || this.data.passwordHash.length === 0) {
      throw new Error('Authentication: passwordHash is required');
    }

    // Validate email format if provided
    if (this.data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.data.email)) {
        throw new Error('Authentication: invalid email format');
      }
    }

    // Validate phone format if provided (basic validation)
    if (this.data.phoneNumber) {
      const phoneRegex = /^\+?[\d\s\-()]+$/;
      if (!phoneRegex.test(this.data.phoneNumber)) {
        throw new Error('Authentication: invalid phone number format');
      }
    }
  }

  getData(): Authentication {
    return {...this.data};
  }

  updateLastLogin(): void {
    this.data.lastLogin = new Date().toISOString();
    this.data.updatedAt = new Date().toISOString();
  }

  updatePassword(newPasswordHash: string): void {
    if (!newPasswordHash || newPasswordHash.length === 0) {
      throw new Error('Password hash cannot be empty');
    }
    this.data.passwordHash = newPasswordHash;
    this.data.updatedAt = new Date().toISOString();
  }

  updateSaveCredentials(save: boolean): void {
    this.data.saveCredentials = save;
    this.data.updatedAt = new Date().toISOString();
  }

  updateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
    this.data.email = email;
    this.data.updatedAt = new Date().toISOString();
  }

  updatePhoneNumber(phone: string): void {
    const phoneRegex = /^\+?[\d\s\-()]+$/;
    if (!phoneRegex.test(phone)) {
      throw new Error('Invalid phone number format');
    }
    this.data.phoneNumber = phone;
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

  getEmail(): string | undefined {
    return this.data.email;
  }

  getPhoneNumber(): string | undefined {
    return this.data.phoneNumber;
  }

  shouldSaveCredentials(): boolean {
    return this.data.saveCredentials;
  }

  verifyPassword(passwordHash: string): boolean {
    return this.data.passwordHash === passwordHash;
  }

  toJSON(): string {
    return JSON.stringify(this.data);
  }

  static fromJSON(json: string): AuthenticationModel {
    const parsed = JSON.parse(json);
    return new AuthenticationModel(parsed);
  }

  toDatabase(): {
    authId: string;
    userId: string;
    email: string | null;
    phoneNumber: string | null;
    passwordHash: string;
    saveCredentials: number;
    lastLogin: string;
    isActive: number;
    createdAt: string;
    updatedAt: string;
  } {
    return {
      authId: this.data.authId,
      userId: this.data.userId,
      email: this.data.email || null,
      phoneNumber: this.data.phoneNumber || null,
      passwordHash: this.data.passwordHash,
      saveCredentials: this.data.saveCredentials ? 1 : 0,
      lastLogin: this.data.lastLogin,
      isActive: this.data.isActive ? 1 : 0,
      createdAt: this.data.createdAt,
      updatedAt: this.data.updatedAt,
    };
  }

  static fromDatabase(row: {
    authId: string;
    userId: string;
    email: string | null;
    phoneNumber: string | null;
    passwordHash: string;
    saveCredentials: number;
    lastLogin: string;
    isActive: number;
    createdAt: string;
    updatedAt: string;
  }): AuthenticationModel {
    return new AuthenticationModel({
      authId: row.authId,
      userId: row.userId,
      email: row.email || undefined,
      phoneNumber: row.phoneNumber || undefined,
      passwordHash: row.passwordHash,
      saveCredentials: row.saveCredentials === 1,
      lastLogin: row.lastLogin,
      isActive: row.isActive === 1,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  private generateId(): string {
    return (
      'auth-' +
      Date.now().toString(36) +
      '-' +
      Math.random().toString(36).substring(2, 9)
    );
  }
}
