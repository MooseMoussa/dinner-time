import {
  DietaryRestriction,
  DietaryRestrictionInput,
} from './DietaryRestriction';
import {CuisinePreference, CuisinePreferenceInput} from './CuisinePreference';

export interface PreferenceProfile {
  profileId: string;
  userId: string;
  name: string;
  isDefault: boolean;
  dietaryRestrictions: DietaryRestriction[];
  cuisinePreferences: CuisinePreference[];
  createdAt: string;
}

export interface CreatePreferenceProfileRequest {
  name: string;
  isDefault?: boolean;
  dietaryRestrictions: DietaryRestrictionInput[];
  cuisinePreferences: CuisinePreferenceInput[];
}

export interface UpdatePreferenceProfileRequest {
  name?: string;
  isDefault?: boolean;
  dietaryRestrictions?: DietaryRestrictionInput[];
  cuisinePreferences?: CuisinePreferenceInput[];
}

export class PreferenceProfileModel {
  private static validateName(name: string): void {
    if (!name || typeof name !== 'string') {
      throw new Error('Profile name is required and must be a string');
    }

    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      throw new Error('Profile name cannot be empty or only whitespace');
    }

    if (trimmedName.length > 30) {
      throw new Error('Profile name cannot exceed 30 characters');
    }
  }

  private static generateProfileId(): string {
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

  private static validateUserId(userId: string): void {
    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID is required and must be a string');
    }
  }

  private static processDietaryRestrictions(
    restrictions: DietaryRestrictionInput[],
  ): DietaryRestriction[] {
    const processed: DietaryRestriction[] = [];
    const seenTypes = new Set<string>();

    for (const restriction of restrictions) {
      // Validate restriction
      if (!restriction.type) {
        throw new Error('Dietary restriction type is required');
      }

      // Check for duplicates
      const key = restriction.type + (restriction.customName || '');
      if (seenTypes.has(key)) {
        throw new Error(`Duplicate dietary restriction: ${restriction.type}`);
      }
      seenTypes.add(key);

      // Validate custom name if type is custom
      if (restriction.type === 'custom') {
        if (
          !restriction.customName ||
          restriction.customName.trim().length === 0
        ) {
          throw new Error('Custom dietary restriction requires a custom name');
        }
        if (restriction.customName.length > 30) {
          throw new Error(
            'Custom dietary restriction name cannot exceed 30 characters',
          );
        }
      }

      processed.push({
        restrictionId: this.generateProfileId(),
        type: restriction.type,
        customName: restriction.customName?.trim(),
      });
    }

    return processed;
  }

  private static processCuisinePreferences(
    preferences: CuisinePreferenceInput[],
  ): CuisinePreference[] {
    const processed: CuisinePreference[] = [];
    const seenCuisines = new Set<string>();

    for (const preference of preferences) {
      // Validate preference
      if (!preference.cuisineType) {
        throw new Error('Cuisine preference type is required');
      }

      if (preference.preferenceLevel < 1 || preference.preferenceLevel > 5) {
        throw new Error('Cuisine preference level must be between 1 and 5');
      }

      // Check for duplicates
      if (seenCuisines.has(preference.cuisineType)) {
        throw new Error(
          `Duplicate cuisine preference: ${preference.cuisineType}`,
        );
      }
      seenCuisines.add(preference.cuisineType);

      processed.push({
        preferenceId: this.generateProfileId(),
        cuisineType: preference.cuisineType,
        preferenceLevel: preference.preferenceLevel,
      });
    }

    return processed;
  }

  static create(
    userId: string,
    request: CreatePreferenceProfileRequest,
  ): PreferenceProfile {
    this.validateUserId(userId);
    this.validateName(request.name);

    const dietaryRestrictions = this.processDietaryRestrictions(
      request.dietaryRestrictions || [],
    );

    const cuisinePreferences = this.processCuisinePreferences(
      request.cuisinePreferences || [],
    );

    return {
      profileId: this.generateProfileId(),
      userId,
      name: request.name.trim(),
      isDefault: request.isDefault || false,
      dietaryRestrictions,
      cuisinePreferences,
      createdAt: new Date().toISOString(),
    };
  }

  static update(
    existing: PreferenceProfile,
    updates: UpdatePreferenceProfileRequest,
  ): PreferenceProfile {
    const updated = {...existing};

    if (updates.name !== undefined) {
      this.validateName(updates.name);
      updated.name = updates.name.trim();
    }

    if (updates.isDefault !== undefined) {
      updated.isDefault = updates.isDefault;
    }

    if (updates.dietaryRestrictions !== undefined) {
      updated.dietaryRestrictions = this.processDietaryRestrictions(
        updates.dietaryRestrictions,
      );
    }

    if (updates.cuisinePreferences !== undefined) {
      updated.cuisinePreferences = this.processCuisinePreferences(
        updates.cuisinePreferences,
      );
    }

    return updated;
  }

  static setAsDefault(profile: PreferenceProfile): PreferenceProfile {
    return {
      ...profile,
      isDefault: true,
    };
  }

  static unsetAsDefault(profile: PreferenceProfile): PreferenceProfile {
    return {
      ...profile,
      isDefault: false,
    };
  }

  static validate(profile: PreferenceProfile): void {
    if (!profile.profileId || typeof profile.profileId !== 'string') {
      throw new Error('PreferenceProfile must have a valid profileId');
    }

    this.validateUserId(profile.userId);
    this.validateName(profile.name);

    if (typeof profile.isDefault !== 'boolean') {
      throw new Error('PreferenceProfile isDefault must be a boolean');
    }

    if (!Array.isArray(profile.dietaryRestrictions)) {
      throw new Error('PreferenceProfile dietaryRestrictions must be an array');
    }

    if (!Array.isArray(profile.cuisinePreferences)) {
      throw new Error('PreferenceProfile cuisinePreferences must be an array');
    }

    if (!profile.createdAt) {
      throw new Error(
        'PreferenceProfile must have a valid createdAt timestamp',
      );
    }

    // Validate dates are valid ISO strings
    try {
      new Date(profile.createdAt);
    } catch (error) {
      throw new Error(
        'PreferenceProfile createdAt must be a valid ISO date string',
      );
    }

    // Validate nested objects
    for (const restriction of profile.dietaryRestrictions) {
      if (!restriction.restrictionId || !restriction.type) {
        throw new Error('Invalid dietary restriction in profile');
      }
    }

    for (const preference of profile.cuisinePreferences) {
      if (
        !preference.preferenceId ||
        !preference.cuisineType ||
        preference.preferenceLevel < 1 ||
        preference.preferenceLevel > 5
      ) {
        throw new Error('Invalid cuisine preference in profile');
      }
    }
  }

  static findByUserId(
    profiles: PreferenceProfile[],
    userId: string,
  ): PreferenceProfile[] {
    return profiles.filter(profile => profile.userId === userId);
  }

  static findDefaultForUser(
    profiles: PreferenceProfile[],
    userId: string,
  ): PreferenceProfile | undefined {
    return profiles.find(
      profile => profile.userId === userId && profile.isDefault,
    );
  }

  static findByName(
    profiles: PreferenceProfile[],
    userId: string,
    name: string,
  ): PreferenceProfile | undefined {
    const trimmedName = name.trim().toLowerCase();
    return profiles.find(
      profile =>
        profile.userId === userId && profile.name.toLowerCase() === trimmedName,
    );
  }

  static sortByCreatedAt(profiles: PreferenceProfile[]): PreferenceProfile[] {
    return [...profiles].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Descending order (most recent first)
    });
  }

  static hasDietaryRestriction(
    profile: PreferenceProfile,
    restrictionType: string,
  ): boolean {
    return profile.dietaryRestrictions.some(
      restriction => restriction.type === restrictionType,
    );
  }

  static getCuisinePreferenceLevel(
    profile: PreferenceProfile,
    cuisineType: string,
  ): number | undefined {
    const preference = profile.cuisinePreferences.find(
      pref => pref.cuisineType === cuisineType,
    );
    return preference?.preferenceLevel;
  }

  static getStrongCuisinePreferences(
    profile: PreferenceProfile,
  ): CuisinePreference[] {
    return profile.cuisinePreferences.filter(pref => pref.preferenceLevel >= 4);
  }

  static getWeakCuisinePreferences(
    profile: PreferenceProfile,
  ): CuisinePreference[] {
    return profile.cuisinePreferences.filter(pref => pref.preferenceLevel <= 2);
  }

  static toJSON(profile: PreferenceProfile): string {
    return JSON.stringify(profile);
  }

  static fromJSON(json: string): PreferenceProfile {
    try {
      const profile = JSON.parse(json) as PreferenceProfile;
      this.validate(profile);
      return profile;
    } catch (error) {
      throw new Error(
        `Failed to parse PreferenceProfile from JSON: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
