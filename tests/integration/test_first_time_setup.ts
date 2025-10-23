import {UserProfileAPI} from '@/api/UserProfileAPI';
import {FacialRecognitionAPI} from '@/api/FacialRecognitionAPI';
import {SuggestionAPI} from '@/api/SuggestionAPI';
import {DatabaseService} from '@services/DatabaseService';

describe('Integration Test: First-Time User Setup', () => {
  let userAPI: UserProfileAPI;
  let faceAPI: FacialRecognitionAPI;
  let suggestionAPI: SuggestionAPI;
  let database: DatabaseService;

  beforeEach(async () => {
    // Initialize services
    database = new DatabaseService();
    await database.initialize();

    userAPI = new UserProfileAPI();
    faceAPI = new FacialRecognitionAPI();
    suggestionAPI = new SuggestionAPI();

    // Clean database for each test
    await database.clearAllData();
  });

  afterEach(async () => {
    await database.close();
    jest.clearAllMocks();
  });

  describe('Complete First-Time User Setup Flow', () => {
    it('should complete full user onboarding process', async () => {
      // This ENTIRE TEST will fail until all components are implemented

      // Step 1: User creates profile
      const newUser = await userAPI.createUser({
        name: 'Alice Johnson',
      });

      expect(newUser).toBeDefined();
      expect(newUser.name).toBe('Alice Johnson');
      expect(newUser.isActive).toBe(true);

      // Step 2: User sets up facial recognition
      const faceRegistration = await faceAPI.registerFace({
        userId: newUser.userId,
        imageData: 'mock_base64_face_data_alice',
        confidenceThreshold: 0.85,
      });

      expect(faceRegistration.status).toBe('success');
      expect(faceRegistration.userId).toBe(newUser.userId);

      // Step 3: User creates first preference profile
      const preferenceProfile = await userAPI.createPreferenceProfile(newUser.userId, {
        name: 'Quick Meals',
        isDefault: true,
        dietaryRestrictions: [
          {type: 'vegetarian'},
        ],
        cuisinePreferences: [
          {cuisineType: 'italian', preferenceLevel: 4},
          {cuisineType: 'mexican', preferenceLevel: 3},
        ],
      });

      expect(preferenceProfile).toBeDefined();
      expect(preferenceProfile.name).toBe('Quick Meals');
      expect(preferenceProfile.isDefault).toBe(true);

      // Step 4: User sets up cooking context
      const cookingContext = await suggestionAPI.updateCookingContext(newUser.userId, {
        skillLevel: 'intermediate',
        availableTime: 30,
        equipment: ['stove', 'oven', 'microwave'],
        ingredients: [
          {name: 'tomatoes', category: 'vegetable'},
          {name: 'pasta', category: 'grain'},
          {name: 'cheese', category: 'dairy'},
        ],
      });

      expect(cookingContext).toBeDefined();
      expect(cookingContext.skillLevel).toBe('intermediate');

      // Step 5: User gets first suggestions
      const suggestions = await suggestionAPI.generateSuggestions({
        userId: newUser.userId,
        profileId: preferenceProfile.profileId,
        mode: 'cook_at_home',
        maxSuggestions: 5,
      });

      expect(suggestions).toBeDefined();
      expect(suggestions.suggestions.length).toBeGreaterThan(0);
      expect(suggestions.suggestions.length).toBeLessThanOrEqual(5);

      // Verify suggestions respect preferences
      suggestions.suggestions.forEach(suggestion => {
        expect(suggestion.matchScore).toBeGreaterThan(0);
        expect(suggestion.type).toBe('recipe');
        // Should not suggest non-vegetarian options
        expect(suggestion.matchReasons).not.toContain('meat');
      });

      // Step 6: Verify user can be identified by face
      const identification = await faceAPI.identifyFace({
        imageData: 'mock_base64_face_data_alice',
        maxResults: 1,
      });

      expect(identification.status).toBe('success');
      expect(identification.matches).toHaveLength(1);
      expect(identification.matches[0].userId).toBe(newUser.userId);
      expect(identification.matches[0].confidence).toBeGreaterThan(0.85);

      // Step 7: Verify complete setup by getting user profile
      const users = await userAPI.getUsers();
      const createdUser = users.find(u => u.userId === newUser.userId);

      expect(createdUser).toBeDefined();
      expect(createdUser!.name).toBe('Alice Johnson');
      expect(createdUser!.isActive).toBe(true);

      // Verify preferences are saved
      const profiles = await userAPI.getPreferenceProfiles(newUser.userId);
      expect(profiles).toHaveLength(1);
      expect(profiles[0].name).toBe('Quick Meals');
      expect(profiles[0].isDefault).toBe(true);
    });

    it('should handle setup interruption gracefully', async () => {
      // Test partial setup scenarios
      const newUser = await userAPI.createUser({
        name: 'Bob Wilson',
      });

      // User creates profile but doesn't complete face registration
      expect(newUser).toBeDefined();

      // App should still function for manual profile selection
      const users = await userAPI.getUsers();
      expect(users).toContain(jasmine.objectContaining({
        userId: newUser.userId,
        name: 'Bob Wilson',
      }));

      // Face identification should fail gracefully
      const identification = await faceAPI.identifyFace({
        imageData: 'mock_face_data_bob',
      });

      expect(identification.status).toBe('no_match');
      expect(identification.matches).toHaveLength(0);
    });

    it('should prevent duplicate user creation', async () => {
      // Create first user
      await userAPI.createUser({
        name: 'Charlie Brown',
      });

      // Attempt to create user with same name should fail
      await expect(userAPI.createUser({
        name: 'Charlie Brown',
      })).rejects.toThrow(/name.*already exists/i);
    });

    it('should validate user input during setup', async () => {
      // Test various validation scenarios
      await expect(userAPI.createUser({
        name: '', // Empty name
      })).rejects.toThrow(/name.*required/i);

      await expect(userAPI.createUser({
        name: 'a'.repeat(51), // Too long
      })).rejects.toThrow(/name.*too long/i);
    });

    it('should rollback on setup failure', async () => {
      const newUser = await userAPI.createUser({
        name: 'David Smith',
      });

      // Mock face registration failure
      jest.spyOn(faceAPI, 'registerFace').mockRejectedValue(
        new Error('Face detection failed')
      );

      await expect(faceAPI.registerFace({
        userId: newUser.userId,
        imageData: 'invalid_face_data',
      })).rejects.toThrow('Face detection failed');

      // User should still exist but without face data
      const users = await userAPI.getUsers();
      const user = users.find(u => u.userId === newUser.userId);
      expect(user).toBeDefined();

      // Face data should not exist
      await expect(faceAPI.getFaceData(newUser.userId)).rejects.toThrow(/not found/i);
    });
  });
});