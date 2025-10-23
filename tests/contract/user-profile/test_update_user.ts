import {UserProfileAPI} from '@api/UserProfileAPI';
import {DatabaseService} from '@services/DatabaseService';

describe('Contract Test: PUT /users/{userId}', () => {
  let api: UserProfileAPI;
  let db: DatabaseService;

  beforeAll(async () => {
    api = UserProfileAPI.getInstance();
    db = DatabaseService.getInstance();
    await db.initialize();
  });

  afterAll(async () => await db.close());
  beforeEach(async () => await db.executeSql('DELETE FROM users'));

  it('should update user name successfully', async () => {
    const {data} = await api.createUser({name: 'Old Name'});
    const userId = data!.userId;

    const response = await api.updateUser(userId, {name: 'New Name'});

    expect(response.success).toBe(true);
    expect(response.data?.name).toBe('New Name');
  });

  it('should update user location', async () => {
    const {data} = await api.createUser({name: 'Test'});
    const userId = data!.userId;

    const response = await api.updateUser(userId, {
      location: {
        locationId: 'loc-1',
        latitude: 40.7128,
        longitude: -74.006,
        createdAt: new Date().toISOString(),
      },
    });

    expect(response.success).toBe(true);
    expect(response.data?.location?.latitude).toBe(40.7128);
  });

  it('should return 404 for non-existent user', async () => {
    const response = await api.updateUser('fake-id', {name: 'New'});
    expect(response.success).toBe(false);
  });
});
