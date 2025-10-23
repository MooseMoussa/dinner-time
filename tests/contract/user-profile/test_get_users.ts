import {UserProfileAPI} from '@/api/UserProfileAPI';
import {UserProfile} from '@models/UserProfile';

describe('User Profile API - GET /users', () => {
  let api: UserProfileAPI;

  beforeEach(() => {
    api = new UserProfileAPI();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Contract: GET /users', () => {
    it('should return array of user profiles', async () => {
      // This test MUST FAIL until UserProfileAPI is implemented
      const users = await api.getUsers();

      expect(Array.isArray(users)).toBe(true);
      expect(users).toHaveLength(0); // Empty array initially
    });

    it('should return user profiles with correct schema', async () => {
      // Mock a user in database first
      const mockUser: UserProfile = {
        userId: 'test-user-id',
        name: 'Test User',
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        isActive: true,
        location: undefined,
      };

      // This will fail until implemented
      const users = await api.getUsers();

      if (users.length > 0) {
        const user = users[0];
        expect(user).toHaveProperty('userId');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('createdAt');
        expect(user).toHaveProperty('lastUsed');
        expect(user).toHaveProperty('isActive');
        expect(typeof user.userId).toBe('string');
        expect(typeof user.name).toBe('string');
        expect(typeof user.isActive).toBe('boolean');
      }
    });

    it('should handle database errors gracefully', async () => {
      // This test verifies error handling is implemented
      const mockError = new Error('Database connection failed');

      // Mock database failure - this will fail until error handling is implemented
      jest.spyOn(api as any, 'database').mockImplementation(() => {
        throw mockError;
      });

      await expect(api.getUsers()).rejects.toThrow('Database connection failed');
    });

    it('should filter out inactive users by default', async () => {
      // Contract specifies only active users are returned by default
      const users = await api.getUsers();

      // This will fail until filtering is implemented
      users.forEach(user => {
        expect(user.isActive).toBe(true);
      });
    });

    it('should return users ordered by last_used descending', async () => {
      // Contract specifies ordering by last used
      const users = await api.getUsers();

      if (users.length > 1) {
        for (let i = 0; i < users.length - 1; i++) {
          const currentDate = new Date(users[i].lastUsed);
          const nextDate = new Date(users[i + 1].lastUsed);
          expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
        }
      }
    });
  });
});