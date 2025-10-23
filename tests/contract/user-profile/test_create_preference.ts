import {UserProfileAPI} from '@api/UserProfileAPI';
import {DatabaseService} from '@services/DatabaseService';

describe('Contract Test: POST /users/{userId}/preferences', () => {
  let api: UserProfileAPI;
  let db: DatabaseService;

  beforeAll(async () => {
    api = UserProfileAPI.getInstance();
    db = DatabaseService.getInstance();
    await db.initialize();
  });

  afterAll(async () => await db.close());
  beforeEach(async () => {
    await db.executeSql('DELETE FROM users');
    await db.executeSql('DELETE FROM preference_profiles');
  });

  it('should create preference profile successfully', async () => {
    const {data: user} = await api.createUser({name: 'Test'});
    const userId = user!.userId;

    const response = await api.createPreferenceProfile(userId, {
      name: 'Weekend Cooking',
      isDefault: false,
      dietaryRestrictions: [{restrictionId: 'r1', restrictionType: 'vegetarian', strictness: 5, createdAt: new Date().toISOString()}],
      cuisinePreferences: [{preferenceId: 'c1', cuisineType: 'italian', preferenceLevel: 4, createdAt: new Date().toISOString()}],
    });

    expect(response.success).toBe(true);
    expect(response.data?.name).toBe('Weekend Cooking');
  });
});
