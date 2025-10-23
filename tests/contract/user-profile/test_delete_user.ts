import {UserProfileAPI} from '@api/UserProfileAPI';
import {DatabaseService} from '@services/DatabaseService';

describe('Contract Test: DELETE /users/{userId}', () => {
  let api: UserProfileAPI;
  let db: DatabaseService;

  beforeAll(async () => {
    api = UserProfileAPI.getInstance();
    db = DatabaseService.getInstance();
    await db.initialize();
  });

  afterAll(async () => await db.close());
  beforeEach(async () => await db.executeSql('DELETE FROM users'));

  it('should delete user successfully', async () => {
    const {data} = await api.createUser({name: 'To Delete'});
    const userId = data!.userId;

    const response = await api.deleteUser(userId);
    expect(response.success).toBe(true);

    // Verify deletion
    const getResponse = await api.getUser(userId);
    expect(getResponse.success).toBe(false);
  });

  it('should return 404 for non-existent user', async () => {
    const response = await api.deleteUser('fake-id');
    expect(response.success).toBe(false);
  });
});
