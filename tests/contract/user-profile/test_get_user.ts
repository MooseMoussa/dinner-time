import {UserProfileAPI} from '@api/UserProfileAPI';
import {DatabaseService} from '@services/DatabaseService';

describe('Contract Test: GET /users/{userId}', () => {
  let api: UserProfileAPI;
  let db: DatabaseService;

  beforeAll(async () => {
    api = UserProfileAPI.getInstance();
    db = DatabaseService.getInstance();
    await db.initialize();
  });

  afterAll(async () => {
    await db.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    await db.executeSql('DELETE FROM users');
  });

  it('should return 200 and user data for existing user', async () => {
    // Create a test user
    const createResponse = await api.createUser({
      name: 'Test User',
    });

    expect(createResponse.success).toBe(true);
    const userId = createResponse.data?.userId!;

    // Get the user
    const response = await api.getUser(userId);

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(response.data?.userId).toBe(userId);
    expect(response.data?.name).toBe('Test User');
    expect(response.data?.isActive).toBe(true);
    expect(response.data?.createdAt).toBeDefined();
    expect(response.data?.lastUsed).toBeDefined();
  });

  it('should return 404 for non-existent user', async () => {
    const response = await api.getUser('non-existent-id');

    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();
    expect(response.error?.message).toContain('not found');
  });

  it('should return 400 for invalid userId format', async () => {
    const response = await api.getUser('');

    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();
    expect(response.error?.message).toContain('userId');
  });

  it('should return user with location data if available', async () => {
    // Create user with location
    const createResponse = await api.createUser({
      name: 'User with Location',
      location: {
        locationId: 'loc-1',
        latitude: 40.7128,
        longitude: -74.006,
        address: '123 Main St, New York, NY',
        createdAt: new Date().toISOString(),
      },
    });

    const userId = createResponse.data?.userId!;
    const response = await api.getUser(userId);

    expect(response.success).toBe(true);
    expect(response.data?.location).toBeDefined();
    expect(response.data?.location?.latitude).toBe(40.7128);
    expect(response.data?.location?.longitude).toBe(-74.006);
  });
});
