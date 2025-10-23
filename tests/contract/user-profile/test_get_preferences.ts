import {UserProfileAPI} from '@api/UserProfileAPI';
import {DatabaseService} from '@services/DatabaseService';

describe('Contract Test: GET /users/{userId}/preferences', () => {
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

  it('should return all preference profiles for user', async () => {
    const {data: user} = await api.createUser({name: 'Test'});
    const userId = user!.userId;

    await api.createPreferenceProfile(userId, {
      name: 'Weekday',
      isDefault: true,
      dietaryRestrictions: [],
      cuisinePreferences: [],
    });

    const response = await api.getPreferenceProfiles(userId);

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(response.data!.length).toBeGreaterThan(0);
  });

  it('should return 404 for non-existent user', async () => {
    const response = await api.getPreferenceProfiles('fake-id');
    expect(response.success).toBe(false);
  });
});
