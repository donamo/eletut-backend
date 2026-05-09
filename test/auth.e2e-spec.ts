import request = require('supertest');
import {
  ADMIN_USER_ID,
  adminAuthHeader,
  authHeader,
  createTestApp,
  E2eTestApp,
  OTHER_USER_ID,
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
      isEnabled: true,
      isAdmin: false,
    });
  });

  it('blocks disabled users but lets the configured admin manage the whitelist', async () => {
    await testApp.prisma.user.update({
      where: { id: OTHER_USER_ID },
      data: { isEnabled: false },
    });

    const blocked = await request(testApp.app.getHttpServer())
      .get('/me')
      .set({ 'x-test-user-id': OTHER_USER_ID })
      .expect(403);
    expect(blocked.body.message).toBe('User is not enabled.');

    const adminMe = await request(testApp.app.getHttpServer())
      .get('/me')
      .set(adminAuthHeader)
      .expect(200);
    expect(adminMe.body).toMatchObject({
      id: ADMIN_USER_ID,
      email: 'admin@example.com',
      isEnabled: false,
      isAdmin: true,
    });

    const users = await request(testApp.app.getHttpServer())
      .post('/graphql')
      .set(adminAuthHeader)
      .send({
        query: `
          query {
            users {
              id
              email
              displayName
              isEnabled
              isAdmin
            }
          }
        `,
      })
      .expect(200);
    expect(users.body.errors).toBeUndefined();
    expect(users.body.data.users).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: TEST_USER_ID,
          email: 'a@example.com',
          isEnabled: true,
          isAdmin: false,
        }),
        expect.objectContaining({
          id: OTHER_USER_ID,
          email: 'b@example.com',
          isEnabled: false,
          isAdmin: false,
        }),
        expect.objectContaining({
          id: ADMIN_USER_ID,
          email: 'admin@example.com',
          isEnabled: false,
          isAdmin: true,
        }),
      ]),
    );

    const enabled = await request(testApp.app.getHttpServer())
      .post('/graphql')
      .set(adminAuthHeader)
      .send({
        query: `
          mutation UpdateUserEnabled($input: UpdateUserEnabledInput!) {
            updateUserEnabled(input: $input) {
              id
              isEnabled
            }
          }
        `,
        variables: {
          input: {
            id: OTHER_USER_ID,
            isEnabled: true,
          },
        },
      })
      .expect(200);
    expect(enabled.body.errors).toBeUndefined();
    expect(enabled.body.data.updateUserEnabled).toEqual({
      id: OTHER_USER_ID,
      isEnabled: true,
    });

    await request(testApp.app.getHttpServer())
      .get('/me')
      .set({ 'x-test-user-id': OTHER_USER_ID })
      .expect(200);
  });

  it('does not allow non-admin users to manage the whitelist', async () => {
    const response = await request(testApp.app.getHttpServer())
      .post('/graphql')
      .set(authHeader)
      .send({
        query: `
          query {
            users {
              email
            }
          }
        `,
      })
      .expect(200);

    expect(response.body.data).toBeNull();
    expect(response.body.errors[0].message).toBe('Admin access is required.');
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
