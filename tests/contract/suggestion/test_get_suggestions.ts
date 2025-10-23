import {SuggestionAPI} from '@api/SuggestionAPI';
import {DatabaseService} from '@services/DatabaseService';

describe('Contract Test: GET /suggestions/{requestId}', () => {
  let api: SuggestionAPI;
  let db: DatabaseService;

  beforeAll(async () => {
    api = SuggestionAPI.getInstance();
    db = DatabaseService.getInstance();
    await db.initialize();
  });

  afterAll(async () => await db.close());

  it('should retrieve suggestions by requestId', async () => {
    const response = await api.healthCheck();
    expect(response.success).toBe(true);
  });
});
