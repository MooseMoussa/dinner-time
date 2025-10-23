import {FacialRecognitionAPI} from '@api/FacialRecognitionAPI';
import {DatabaseService} from '@services/DatabaseService';

describe('Contract Test: POST /face/identify', () => {
  let api: FacialRecognitionAPI;
  let db: DatabaseService;

  beforeAll(async () => {
    api = FacialRecognitionAPI.getInstance();
    db = DatabaseService.getInstance();
    await db.initialize();
  });

  afterAll(async () => await db.close());

  it('should identify registered face', async () => {
    const response = await api.identifyFace({imageUri: 'test://image.jpg'});
    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
  });
});
