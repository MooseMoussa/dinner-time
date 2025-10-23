export type CuisineType =
  | 'italian'
  | 'mexican'
  | 'chinese'
  | 'japanese'
  | 'thai'
  | 'indian'
  | 'french'
  | 'american'
  | 'mediterranean'
  | 'middle_eastern'
  | 'korean'
  | 'vietnamese'
  | 'greek'
  | 'spanish'
  | 'german'
  | 'british'
  | 'african'
  | 'caribbean';

export interface CuisinePreference {
  preferenceId: string;
  cuisineType: CuisineType;
  preferenceLevel: number; // 1-5 scale
}

export interface CuisinePreferenceInput {
  cuisineType: CuisineType;
  preferenceLevel: number;
}

export class CuisinePreferenceModel {
  static readonly CUISINE_TYPES: CuisineType[] = [
    'italian',
    'mexican',
    'chinese',
    'japanese',
    'thai',
    'indian',
    'french',
    'american',
    'mediterranean',
    'middle_eastern',
    'korean',
    'vietnamese',
    'greek',
    'spanish',
    'german',
    'british',
    'african',
    'caribbean',
  ];

  static readonly CUISINE_NAMES: Record<CuisineType, string> = {
    italian: 'Italian',
    mexican: 'Mexican',
    chinese: 'Chinese',
    japanese: 'Japanese',
    thai: 'Thai',
    indian: 'Indian',
    french: 'French',
    american: 'American',
    mediterranean: 'Mediterranean',
    middle_eastern: 'Middle Eastern',
    korean: 'Korean',
    vietnamese: 'Vietnamese',
    greek: 'Greek',
    spanish: 'Spanish',
    german: 'German',
    british: 'British',
    african: 'African',
    caribbean: 'Caribbean',
  };

  static readonly PREFERENCE_LABELS: Record<number, string> = {
    1: 'Dislike',
    2: 'Not Preferred',
    3: 'Neutral',
    4: 'Like',
    5: 'Love',
  };

  private static generatePreferenceId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }

  static isValidCuisineType(type: string): type is CuisineType {
    return this.CUISINE_TYPES.includes(type as CuisineType);
  }

  static validateCuisineType(type: string): void {
    if (!this.isValidCuisineType(type)) {
      throw new Error(
        `Invalid cuisine type: ${type}. ` +
          `Valid types are: ${this.CUISINE_TYPES.join(', ')}`,
      );
    }
  }

  static validatePreferenceLevel(level: number): void {
    if (typeof level !== 'number' || !Number.isInteger(level)) {
      throw new Error('Preference level must be an integer');
    }

    if (level < 1 || level > 5) {
      throw new Error('Preference level must be between 1 and 5');
    }
  }

  static create(input: CuisinePreferenceInput): CuisinePreference {
    this.validateCuisineType(input.cuisineType);
    this.validatePreferenceLevel(input.preferenceLevel);

    return {
      preferenceId: this.generatePreferenceId(),
      cuisineType: input.cuisineType,
      preferenceLevel: input.preferenceLevel,
    };
  }

  static validate(preference: CuisinePreference): void {
    if (
      !preference.preferenceId ||
      typeof preference.preferenceId !== 'string'
    ) {
      throw new Error('CuisinePreference must have a valid preferenceId');
    }

    this.validateCuisineType(preference.cuisineType);
    this.validatePreferenceLevel(preference.preferenceLevel);
  }

  static getCuisineName(cuisineType: CuisineType): string {
    return this.CUISINE_NAMES[cuisineType];
  }

  static getPreferenceLabel(level: number): string {
    return this.PREFERENCE_LABELS[level] || 'Unknown';
  }

  static isPositivePreference(preference: CuisinePreference): boolean {
    return preference.preferenceLevel >= 4;
  }

  static isNegativePreference(preference: CuisinePreference): boolean {
    return preference.preferenceLevel <= 2;
  }

  static isNeutralPreference(preference: CuisinePreference): boolean {
    return preference.preferenceLevel === 3;
  }

  static getPreferenceStrength(
    preference: CuisinePreference,
  ): 'weak' | 'moderate' | 'strong' {
    if (preference.preferenceLevel === 1 || preference.preferenceLevel === 5) {
      return 'strong';
    } else if (
      preference.preferenceLevel === 2 ||
      preference.preferenceLevel === 4
    ) {
      return 'moderate';
    } else {
      return 'weak';
    }
  }

  static sortByPreferenceLevel(
    preferences: CuisinePreference[],
  ): CuisinePreference[] {
    return [...preferences].sort(
      (a, b) => b.preferenceLevel - a.preferenceLevel,
    );
  }

  static filterByLevel(
    preferences: CuisinePreference[],
    minLevel: number,
    maxLevel?: number,
  ): CuisinePreference[] {
    return preferences.filter(pref => {
      if (maxLevel !== undefined) {
        return (
          pref.preferenceLevel >= minLevel && pref.preferenceLevel <= maxLevel
        );
      }
      return pref.preferenceLevel >= minLevel;
    });
  }

  static findByCuisineType(
    preferences: CuisinePreference[],
    cuisineType: CuisineType,
  ): CuisinePreference | undefined {
    return preferences.find(pref => pref.cuisineType === cuisineType);
  }

  static getPreferenceLevel(
    preferences: CuisinePreference[],
    cuisineType: CuisineType,
  ): number | undefined {
    const preference = this.findByCuisineType(preferences, cuisineType);
    return preference?.preferenceLevel;
  }

  static getTopPreferences(
    preferences: CuisinePreference[],
    count: number = 3,
  ): CuisinePreference[] {
    return this.sortByPreferenceLevel(preferences).slice(0, count);
  }

  static getLeastPreferences(
    preferences: CuisinePreference[],
    count: number = 3,
  ): CuisinePreference[] {
    return this.sortByPreferenceLevel(preferences).reverse().slice(0, count);
  }

  static getPreferenceDistribution(
    preferences: CuisinePreference[],
  ): Record<number, number> {
    const distribution: Record<number, number> = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};

    for (const preference of preferences) {
      distribution[preference.preferenceLevel]++;
    }

    return distribution;
  }

  static calculateAveragePreference(preferences: CuisinePreference[]): number {
    if (preferences.length === 0) return 0;

    const sum = preferences.reduce(
      (total, pref) => total + pref.preferenceLevel,
      0,
    );
    return Math.round((sum / preferences.length) * 100) / 100; // Round to 2 decimal places
  }

  static toDisplayString(preference: CuisinePreference): string {
    const cuisineName = this.getCuisineName(preference.cuisineType);
    const levelLabel = this.getPreferenceLabel(preference.preferenceLevel);
    const stars =
      '★'.repeat(preference.preferenceLevel) +
      '☆'.repeat(5 - preference.preferenceLevel);

    return `${cuisineName}: ${levelLabel} ${stars}`;
  }

  static toJSON(preference: CuisinePreference): string {
    return JSON.stringify(preference);
  }

  static fromJSON(json: string): CuisinePreference {
    try {
      const preference = JSON.parse(json) as CuisinePreference;
      this.validate(preference);
      return preference;
    } catch (error) {
      throw new Error(
        `Failed to parse CuisinePreference from JSON: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
