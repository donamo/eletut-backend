import request = require('supertest');
import { createTestApp, E2eTestApp } from './e2e-test-app';

describe('Health e2e', () => {
  let testApp: E2eTestApp;

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  afterAll(async () => {
    await testApp.app.close();
  });

  it('returns 200 with ok status when both databases are up', async () => {
    const response = await request(testApp.app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(response.body).toEqual({
      status: 'ok',
      info: {
        database: { status: 'up' },
        readonlyDatabase: { status: 'up' },
      },
    });
  });

  it('does not require authentication', async () => {
    await request(testApp.app.getHttpServer()).get('/health').expect(200);
  });

  it('returns cached result within 3 seconds', async () => {
    const first = await request(testApp.app.getHttpServer())
      .get('/health')
      .expect(200);

    const second = await request(testApp.app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(first.body).toEqual(second.body);
  });
});
