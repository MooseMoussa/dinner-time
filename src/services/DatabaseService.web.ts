// Web-specific database service using localStorage
import {UserProfile} from '@models/UserProfile';
import {PreferenceProfile} from '@models/PreferenceProfile';

export interface DatabaseError extends Error {
  code?: string;
  constraint?: string;
}

export class DatabaseService {
  private static instance: DatabaseService;
  private readonly dbName = 'dinner_time_web';

  constructor() {
    console.log('Web DatabaseService initialized (using localStorage)');
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async initialize(): Promise<void> {
    // No initialization needed for localStorage
    console.log('Web database ready (localStorage)');
  }

  private getFromStorage<T>(key: string): T[] {
    const data = localStorage.getItem(`${this.dbName}_${key}`);
    return data ? JSON.parse(data) : [];
  }

  private saveToStorage<T>(key: string, data: T[]): void {
    localStorage.setItem(`${this.dbName}_${key}`, JSON.stringify(data));
  }

  async getAllUsers(): Promise<UserProfile[]> {
    return this.getFromStorage<UserProfile>('users');
  }

  async getUserById(userId: string): Promise<UserProfile | null> {
    const users = this.getFromStorage<UserProfile>('users');
    return users.find(u => u.userId === userId) || null;
  }

  async findUserByName(name: string): Promise<UserProfile | null> {
    const users = this.getFromStorage<UserProfile>('users');
    return users.find(u => u.name.toLowerCase() === name.toLowerCase()) || null;
  }

  async createUser(user: UserProfile): Promise<void> {
    const users = this.getFromStorage<UserProfile>('users');
    users.push(user);
    this.saveToStorage('users', users);
  }

  async updateUser(userId: string, updates: Partial<UserProfile>): Promise<void> {
    const users = this.getFromStorage<UserProfile>('users');
    const index = users.findIndex(u => u.userId === userId);
    if (index !== -1) {
      users[index] = {...users[index], ...updates};
      this.saveToStorage('users', users);
    }
  }

  async deleteUser(userId: string): Promise<void> {
    const users = this.getFromStorage<UserProfile>('users');
    const filtered = users.filter(u => u.userId !== userId);
    this.saveToStorage('users', filtered);

    // Also delete related preference profiles
    const profiles = this.getFromStorage<PreferenceProfile>('preferences');
    const filteredProfiles = profiles.filter(p => p.userId !== userId);
    this.saveToStorage('preferences', filteredProfiles);
  }

  async getPreferenceProfilesByUserId(userId: string): Promise<PreferenceProfile[]> {
    const profiles = this.getFromStorage<PreferenceProfile>('preferences');
    return profiles.filter(p => p.userId === userId);
  }

  async createPreferenceProfile(profile: PreferenceProfile): Promise<void> {
    const profiles = this.getFromStorage<PreferenceProfile>('preferences');
    profiles.push(profile);
    this.saveToStorage('preferences', profiles);
  }

  async getFacialData(_userId: string): Promise<any | null> {
    // Facial recognition not supported on web
    return null;
  }

  async healthCheck(): Promise<{status: 'healthy' | 'degraded' | 'unhealthy'; details: string}> {
    return {
      status: 'healthy',
      details: 'Web storage operational',
    };
  }

  async getStats(): Promise<{userCount: number; profileCount: number}> {
    const users = this.getFromStorage<UserProfile>('users');
    const profiles = this.getFromStorage<PreferenceProfile>('preferences');
    return {
      userCount: users.length,
      profileCount: profiles.length,
    };
  }
}
