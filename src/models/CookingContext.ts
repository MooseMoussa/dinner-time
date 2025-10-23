export type CookingSkillLevel =
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'expert';

export type CookingEquipment =
  | 'stove'
  | 'oven'
  | 'microwave'
  | 'grill'
  | 'slow_cooker'
  | 'air_fryer'
  | 'instant_pot'
  | 'blender'
  | 'food_processor'
  | 'stand_mixer';

export type AvailableIngredient = {
  name: string;
  quantity?: string;
  category?: 'protein' | 'vegetable' | 'grain' | 'dairy' | 'spice' | 'other';
};

export interface CookingContext {
  contextId: string;
  userId: string;
  skillLevel: CookingSkillLevel;
  availableEquipment: CookingEquipment[];
  availableIngredients: AvailableIngredient[];
  maxCookingTime?: number; // in minutes
  preferredMealComplexity?: 'simple' | 'moderate' | 'complex';
  createdAt: string;
  updatedAt: string;
}

export class CookingContextModel {
  private context: CookingContext;

  constructor(data: Partial<CookingContext> & {userId: string}) {
    this.context = {
      contextId: data.contextId || this.generateId(),
      userId: data.userId,
      skillLevel: data.skillLevel || 'beginner',
      availableEquipment: data.availableEquipment || [],
      availableIngredients: data.availableIngredients || [],
      maxCookingTime: data.maxCookingTime,
      preferredMealComplexity: data.preferredMealComplexity || 'simple',
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    };

    this.validate();
  }

  private validate(): void {
    if (!this.context.userId || this.context.userId.trim().length === 0) {
      throw new Error('CookingContext: userId is required');
    }

    if (!this.context.contextId || this.context.contextId.trim().length === 0) {
      throw new Error('CookingContext: contextId is required');
    }

    const validSkillLevels: CookingSkillLevel[] = [
      'beginner',
      'intermediate',
      'advanced',
      'expert',
    ];
    if (!validSkillLevels.includes(this.context.skillLevel)) {
      throw new Error(
        `CookingContext: Invalid skill level "${this.context.skillLevel}"`,
      );
    }

    if (
      this.context.maxCookingTime !== undefined &&
      this.context.maxCookingTime <= 0
    ) {
      throw new Error('CookingContext: maxCookingTime must be positive');
    }
  }

  getData(): CookingContext {
    return {...this.context};
  }

  updateSkillLevel(skillLevel: CookingSkillLevel): void {
    this.context.skillLevel = skillLevel;
    this.context.updatedAt = new Date().toISOString();
    this.validate();
  }

  addEquipment(equipment: CookingEquipment): void {
    if (!this.context.availableEquipment.includes(equipment)) {
      this.context.availableEquipment.push(equipment);
      this.context.updatedAt = new Date().toISOString();
    }
  }

  removeEquipment(equipment: CookingEquipment): void {
    this.context.availableEquipment = this.context.availableEquipment.filter(
      e => e !== equipment,
    );
    this.context.updatedAt = new Date().toISOString();
  }

  addIngredient(ingredient: AvailableIngredient): void {
    // Remove existing ingredient with same name if present
    this.context.availableIngredients =
      this.context.availableIngredients.filter(
        i => i.name.toLowerCase() !== ingredient.name.toLowerCase(),
      );
    this.context.availableIngredients.push(ingredient);
    this.context.updatedAt = new Date().toISOString();
  }

  removeIngredient(ingredientName: string): void {
    this.context.availableIngredients =
      this.context.availableIngredients.filter(
        i => i.name.toLowerCase() !== ingredientName.toLowerCase(),
      );
    this.context.updatedAt = new Date().toISOString();
  }

  clearIngredients(): void {
    this.context.availableIngredients = [];
    this.context.updatedAt = new Date().toISOString();
  }

  setMaxCookingTime(minutes: number): void {
    if (minutes <= 0) {
      throw new Error('Max cooking time must be positive');
    }
    this.context.maxCookingTime = minutes;
    this.context.updatedAt = new Date().toISOString();
  }

  setMealComplexity(complexity: 'simple' | 'moderate' | 'complex'): void {
    this.context.preferredMealComplexity = complexity;
    this.context.updatedAt = new Date().toISOString();
  }

  hasEquipment(equipment: CookingEquipment): boolean {
    return this.context.availableEquipment.includes(equipment);
  }

  hasIngredient(ingredientName: string): boolean {
    return this.context.availableIngredients.some(
      i => i.name.toLowerCase() === ingredientName.toLowerCase(),
    );
  }

  toJSON(): string {
    return JSON.stringify(this.context);
  }

  static fromJSON(json: string): CookingContextModel {
    const data = JSON.parse(json);
    return new CookingContextModel(data);
  }

  private generateId(): string {
    return (
      'ctx-' +
      Date.now().toString(36) +
      '-' +
      Math.random().toString(36).substring(2, 9)
    );
  }
}
