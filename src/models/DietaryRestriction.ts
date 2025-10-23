export type DietaryRestrictionType =
  | 'vegetarian'
  | 'vegan'
  | 'gluten_free'
  | 'dairy_free'
  | 'nut_allergy'
  | 'shellfish_allergy'
  | 'kosher'
  | 'halal'
  | 'custom';

export interface DietaryRestriction {
  restrictionId: string;
  type: DietaryRestrictionType;
  customName?: string;
}

export interface DietaryRestrictionInput {
  type: DietaryRestrictionType;
  customName?: string;
}

export class DietaryRestrictionModel {
  static readonly RESTRICTION_TYPES: DietaryRestrictionType[] = [
    'vegetarian',
    'vegan',
    'gluten_free',
    'dairy_free',
    'nut_allergy',
    'shellfish_allergy',
    'kosher',
    'halal',
    'custom',
  ];

  static readonly RESTRICTION_DESCRIPTIONS: Record<
    DietaryRestrictionType,
    string
  > = {
    vegetarian: 'No meat, poultry, or fish',
    vegan: 'No animal products',
    gluten_free: 'No gluten-containing grains',
    dairy_free: 'No milk or dairy products',
    nut_allergy: 'No tree nuts or peanuts',
    shellfish_allergy: 'No shellfish or crustaceans',
    kosher: 'Follows kosher dietary laws',
    halal: 'Follows halal dietary laws',
    custom: 'Custom dietary restriction',
  };

  static readonly SEVERITY_LEVELS: Record<
    DietaryRestrictionType,
    'allergy' | 'preference' | 'religious'
  > = {
    vegetarian: 'preference',
    vegan: 'preference',
    gluten_free: 'allergy',
    dairy_free: 'allergy',
    nut_allergy: 'allergy',
    shellfish_allergy: 'allergy',
    kosher: 'religious',
    halal: 'religious',
    custom: 'preference',
  };

  private static generateRestrictionId(): string {
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

  static isValidType(type: string): type is DietaryRestrictionType {
    return this.RESTRICTION_TYPES.includes(type as DietaryRestrictionType);
  }

  static validateType(type: string): void {
    if (!this.isValidType(type)) {
      throw new Error(
        `Invalid dietary restriction type: ${type}. ` +
          `Valid types are: ${this.RESTRICTION_TYPES.join(', ')}`,
      );
    }
  }

  static validateCustomName(
    customName: string | undefined,
    type: DietaryRestrictionType,
  ): void {
    if (type === 'custom') {
      if (!customName || customName.trim().length === 0) {
        throw new Error('Custom dietary restriction requires a custom name');
      }
      if (customName.length > 30) {
        throw new Error(
          'Custom dietary restriction name cannot exceed 30 characters',
        );
      }
    } else {
      if (customName !== undefined && customName !== null) {
        throw new Error(
          `Non-custom dietary restriction should not have a custom name`,
        );
      }
    }
  }

  static create(input: DietaryRestrictionInput): DietaryRestriction {
    this.validateType(input.type);
    this.validateCustomName(input.customName, input.type);

    return {
      restrictionId: this.generateRestrictionId(),
      type: input.type,
      customName:
        input.type === 'custom' ? input.customName?.trim() : undefined,
    };
  }

  static validate(restriction: DietaryRestriction): void {
    if (
      !restriction.restrictionId ||
      typeof restriction.restrictionId !== 'string'
    ) {
      throw new Error('DietaryRestriction must have a valid restrictionId');
    }

    this.validateType(restriction.type);
    this.validateCustomName(restriction.customName, restriction.type);
  }

  static getDescription(restriction: DietaryRestriction): string {
    if (restriction.type === 'custom' && restriction.customName) {
      return restriction.customName;
    }
    return this.RESTRICTION_DESCRIPTIONS[restriction.type];
  }

  static getSeverityLevel(
    restriction: DietaryRestriction,
  ): 'allergy' | 'preference' | 'religious' {
    if (restriction.type === 'custom') {
      return 'preference'; // Default for custom restrictions
    }
    return this.SEVERITY_LEVELS[restriction.type];
  }

  static isAllergy(restriction: DietaryRestriction): boolean {
    return this.getSeverityLevel(restriction) === 'allergy';
  }

  static isReligious(restriction: DietaryRestriction): boolean {
    return this.getSeverityLevel(restriction) === 'religious';
  }

  static isPreference(restriction: DietaryRestriction): boolean {
    return this.getSeverityLevel(restriction) === 'preference';
  }

  static getConflictingFoods(restriction: DietaryRestriction): string[] {
    const conflictMap: Record<DietaryRestrictionType, string[]> = {
      vegetarian: ['meat', 'poultry', 'fish', 'seafood'],
      vegan: ['meat', 'poultry', 'fish', 'seafood', 'dairy', 'eggs', 'honey'],
      gluten_free: ['wheat', 'barley', 'rye', 'oats', 'bread', 'pasta'],
      dairy_free: ['milk', 'cheese', 'butter', 'cream', 'yogurt'],
      nut_allergy: ['almonds', 'walnuts', 'cashews', 'pistachios', 'peanuts'],
      shellfish_allergy: ['shrimp', 'lobster', 'crab', 'oysters', 'mussels'],
      kosher: ['pork', 'shellfish', 'meat_and_dairy_together'],
      halal: ['pork', 'alcohol', 'non_halal_meat'],
      custom: [], // Custom restrictions don't have predefined conflicts
    };

    return conflictMap[restriction.type] || [];
  }

  static areCompatible(
    restriction1: DietaryRestriction,
    restriction2: DietaryRestriction,
  ): boolean {
    // Check if two dietary restrictions are compatible (can be applied together)
    const incompatiblePairs: Array<
      [DietaryRestrictionType, DietaryRestrictionType]
    > = [
      // Most restrictions are compatible, but we can add specific incompatibilities here
      // For example, if we had 'high_protein' and 'low_protein' restrictions
    ];

    for (const [type1, type2] of incompatiblePairs) {
      if (
        (restriction1.type === type1 && restriction2.type === type2) ||
        (restriction1.type === type2 && restriction2.type === type1)
      ) {
        return false;
      }
    }

    return true;
  }

  static groupBySeverity(restrictions: DietaryRestriction[]): {
    allergies: DietaryRestriction[];
    religious: DietaryRestriction[];
    preferences: DietaryRestriction[];
  } {
    const allergies: DietaryRestriction[] = [];
    const religious: DietaryRestriction[] = [];
    const preferences: DietaryRestriction[] = [];

    for (const restriction of restrictions) {
      const severity = this.getSeverityLevel(restriction);
      switch (severity) {
        case 'allergy':
          allergies.push(restriction);
          break;
        case 'religious':
          religious.push(restriction);
          break;
        case 'preference':
          preferences.push(restriction);
          break;
      }
    }

    return {allergies, religious, preferences};
  }

  static findByType(
    restrictions: DietaryRestriction[],
    type: DietaryRestrictionType,
  ): DietaryRestriction | undefined {
    return restrictions.find(restriction => restriction.type === type);
  }

  static hasType(
    restrictions: DietaryRestriction[],
    type: DietaryRestrictionType,
  ): boolean {
    return restrictions.some(restriction => restriction.type === type);
  }

  static getUniqueTypes(
    restrictions: DietaryRestriction[],
  ): DietaryRestrictionType[] {
    const types = new Set(restrictions.map(r => r.type));
    return Array.from(types);
  }

  static toDisplayString(restriction: DietaryRestriction): string {
    const description = this.getDescription(restriction);
    const severity = this.getSeverityLevel(restriction);

    if (severity === 'allergy') {
      return `⚠️ ${description} (Allergy)`;
    } else if (severity === 'religious') {
      return `🕊️ ${description} (Religious)`;
    }

    return description;
  }

  static toJSON(restriction: DietaryRestriction): string {
    return JSON.stringify(restriction);
  }

  static fromJSON(json: string): DietaryRestriction {
    try {
      const restriction = JSON.parse(json) as DietaryRestriction;
      this.validate(restriction);
      return restriction;
    } catch (error) {
      throw new Error(
        `Failed to parse DietaryRestriction from JSON: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
