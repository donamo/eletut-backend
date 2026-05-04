import request = require('supertest');
import {
  authHeader,
  createTestApp,
  E2eTestApp,
  resetE2eDatabase,
  TEST_USER_ID,
} from './e2e-test-app';

describe('Auth e2e', () => {
  let testApp: E2eTestApp;

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  beforeEach(async () => {
    await resetE2eDatabase(testApp.prisma);
  });

  afterAll(async () => {
    await testApp.app.close();
  });

  it('rejects anonymous /me and returns mocked authenticated user', async () => {
    await request(testApp.app.getHttpServer()).get('/me').expect(401);

    const response = await request(testApp.app.getHttpServer())
      .get('/me')
      .set(authHeader)
      .expect(200);

    expect(response.body).toMatchObject({
      id: TEST_USER_ID,
      email: 'a@example.com',
      displayName: 'User A',
    });
  });

  it('persists sessions in Postgres across app instances', async () => {
    const loginResponse = await request(testApp.app.getHttpServer())
      .get('/__e2e/login')
      .set(authHeader)
      .expect(204);
    const cookie = loginResponse.headers['set-cookie'];

    expect(cookie).toBeDefined();

    const sessionRows = await testApp.prisma.$queryRaw<
      Array<{ count: bigint }>
    >`
      SELECT COUNT(*)::bigint AS count FROM "session"
    `;
    expect(sessionRows[0]?.count).toBe(1n);

    const restarted = await createTestApp();
    try {
      const response = await request(restarted.app.getHttpServer())
        .get('/me')
        .set('Cookie', cookie)
        .expect(200);

      expect(response.body).toMatchObject({
        id: TEST_USER_ID,
        email: 'a@example.com',
      });
    } finally {
      await restarted.app.close();
    }
  });
});
