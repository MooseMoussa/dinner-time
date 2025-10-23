import {Location} from './Location';

export interface UserProfile {
  userId: string;
  name: string;
  createdAt: string;
  lastUsed: string;
  isActive: boolean;
  location?: Location;
}

export interface CreateUserRequest {
  name: string;
}

export interface UpdateUserRequest {
  name?: string;
  location?: Location;
}

export class UserProfileModel {
  private static validateName(name: string): void {
    if (!name || typeof name !== 'string') {
      throw new Error('Name is required and must be a string');
    }

    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      throw new Error('Name cannot be empty or only whitespace');
    }

    if (trimmedName.length > 50) {
      throw new Error('Name cannot exceed 50 characters');
    }
  }

  private static generateUserId(): string {
    // Generate UUID v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }

  static create(request: CreateUserRequest): UserProfile {
    this.validateName(request.name);

    const now = new Date().toISOString();
    const trimmedName = request.name.trim();

    return {
      userId: this.generateUserId(),
      name: trimmedName,
      createdAt: now,
      lastUsed: now,
      isActive: true,
      location: undefined,
    };
  }

  static update(
    existing: UserProfile,
    updates: UpdateUserRequest,
  ): UserProfile {
    const updated = {...existing};

    if (updates.name !== undefined) {
      this.validateName(updates.name);
      updated.name = updates.name.trim();
    }

    if (updates.location !== undefined) {
      if (updates.location === null) {
        updated.location = undefined;
      } else {
        // Validate location if provided
        if (
          typeof updates.location.latitude !== 'number' ||
          typeof updates.location.longitude !== 'number'
        ) {
          throw new Error('Location must have valid latitude and longitude');
        }

        if (updates.location.latitude < -90 || updates.location.latitude > 90) {
          throw new Error('Latitude must be between -90 and 90');
        }

        if (
          updates.location.longitude < -180 ||
          updates.location.longitude > 180
        ) {
          throw new Error('Longitude must be between -180 and 180');
        }

        updated.location = {
          ...updates.location,
          updatedAt: new Date().toISOString(),
        };
      }
    }

    return updated;
  }

  static updateLastUsed(profile: UserProfile): UserProfile {
    return {
      ...profile,
      lastUsed: new Date().toISOString(),
    };
  }

  static deactivate(profile: UserProfile): UserProfile {
    return {
      ...profile,
      isActive: false,
    };
  }

  static validate(profile: UserProfile): void {
    if (!profile.userId || typeof profile.userId !== 'string') {
      throw new Error('UserProfile must have a valid userId');
    }

    this.validateName(profile.name);

    if (!profile.createdAt || !profile.lastUsed) {
      throw new Error('UserProfile must have valid timestamps');
    }

    if (typeof profile.isActive !== 'boolean') {
      throw new Error('UserProfile isActive must be a boolean');
    }

    // Validate dates are valid ISO strings
    try {
      new Date(profile.createdAt);
      new Date(profile.lastUsed);
    } catch (error) {
      throw new Error('UserProfile timestamps must be valid ISO date strings');
    }

    if (profile.location) {
      if (
        typeof profile.location.latitude !== 'number' ||
        typeof profile.location.longitude !== 'number'
      ) {
        throw new Error('UserProfile location must have valid coordinates');
      }
    }
  }

  static sortByLastUsed(profiles: UserProfile[]): UserProfile[] {
    return [...profiles].sort((a, b) => {
      const dateA = new Date(a.lastUsed).getTime();
      const dateB = new Date(b.lastUsed).getTime();
      return dateB - dateA; // Descending order (most recent first)
    });
  }

  static filterActive(profiles: UserProfile[]): UserProfile[] {
    return profiles.filter(profile => profile.isActive);
  }

  static findByName(
    profiles: UserProfile[],
    name: string,
  ): UserProfile | undefined {
    const trimmedName = name.trim().toLowerCase();
    return profiles.find(profile => profile.name.toLowerCase() === trimmedName);
  }

  static toJSON(profile: UserProfile): string {
    return JSON.stringify(profile);
  }

  static fromJSON(json: string): UserProfile {
    try {
      const profile = JSON.parse(json) as UserProfile;
      this.validate(profile);
      return profile;
    } catch (error) {
      throw new Error(
        `Failed to parse UserProfile from JSON: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
