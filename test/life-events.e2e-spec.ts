import request = require('supertest');
import {
  authHeader,
  createTestApp,
  E2eTestApp,
  OTHER_USER_ID,
  resetE2eDatabase,
  TEST_USER_ID,
} from './e2e-test-app';

describe('Life events e2e', () => {
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

  it('does not expose life events through REST', async () => {
    await request(testApp.app.getHttpServer()).get('/life-events').expect(404);
    await request(testApp.app.getHttpServer())
      .post('/life-events')
      .set(authHeader)
      .send({})
      .expect(404);
  });

  it('returns ego state catalog through GraphQL', async () => {
    const response = await request(testApp.app.getHttpServer())
      .post('/graphql')
      .set(authHeader)
      .send({
        query: `
          query {
            egoStates {
              gyermeki {
                id
                name
                sortOrder
              }
              szuloi {
                id
                name
              }
              felnott {
                id
                name
              }
            }
          }
        `,
      })
      .expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.egoStates.gyermeki).toHaveLength(29);
    expect(response.body.data.egoStates.szuloi).toHaveLength(29);
    expect(response.body.data.egoStates.felnott).toHaveLength(25);
    expect(response.body.data.egoStates.gyermeki[0]).toEqual({
      id: 'gyermeki-boldog-gyerek',
      name: 'Boldog gyerek',
      sortOrder: 1,
    });
  });

  it('creates, lists, updates and deletes a minimal life event through GraphQL', async () => {
    const created = await request(testApp.app.getHttpServer())
      .post('/graphql')
      .set(authHeader)
      .send({
        query: `
          mutation CreateLifeEvent($input: CreateLifeEventInput!) {
            createLifeEvent(input: $input) {
              id
              title
              description
              location
              importance
              color
              gyermekiStates { id }
              szuloiStates { id }
              felnottStates { id }
              datePrecision
              ownerUserId
            }
          }
        `,
        variables: {
          input: {
            title: 'Minimal event',
            importance: 3,
            dateValue: '2020-05-01T00:00:00.000Z',
            datePrecision: 'MONTH',
          },
        },
      })
      .expect(200);

    expect(created.body.errors).toBeUndefined();
    expect(created.body.data.createLifeEvent).toMatchObject({
      title: 'Minimal event',
      description: null,
      location: null,
      importance: 3,
      color: null,
      gyermekiStates: [],
      szuloiStates: [],
      felnottStates: [],
      datePrecision: 'MONTH',
      ownerUserId: TEST_USER_ID,
    });

    const eventId = created.body.data.createLifeEvent.id;

    const list = await request(testApp.app.getHttpServer())
      .post('/graphql')
      .set(authHeader)
      .send({
        query: `
          query {
            lifeEvents {
              id
              title
              description
              location
              importance
              color
              gyermekiStates { id }
              szuloiStates { id }
              felnottStates { id }
            }
          }
        `,
      })
      .expect(200);

    expect(list.body.errors).toBeUndefined();
    expect(list.body.data.lifeEvents).toEqual([
      {
        id: eventId,
        title: 'Minimal event',
        description: null,
        location: null,
        importance: 3,
        color: null,
        gyermekiStates: [],
        szuloiStates: [],
        felnottStates: [],
      },
    ]);

    const updated = await request(testApp.app.getHttpServer())
      .post('/graphql')
      .set(authHeader)
      .send({
        query: `
          mutation UpdateLifeEvent($input: UpdateLifeEventInput!) {
            updateLifeEvent(input: $input) {
              id
              title
              location
              color
            }
          }
        `,
        variables: {
          input: {
            id: eventId,
            title: 'Minimal event updated',
            location: null,
            color: null,
          },
        },
      })
      .expect(200);

    expect(updated.body.errors).toBeUndefined();
    expect(updated.body.data.updateLifeEvent).toEqual({
      id: eventId,
      title: 'Minimal event updated',
      location: null,
      color: null,
    });

    const deleted = await request(testApp.app.getHttpServer())
      .post('/graphql')
      .set(authHeader)
      .send({
        query: `
          mutation DeleteLifeEvent($id: String!) {
            deleteLifeEvent(id: $id) {
              id
            }
          }
        `,
        variables: { id: eventId },
      })
      .expect(200);

    expect(deleted.body.errors).toBeUndefined();
    expect(deleted.body.data.deleteLifeEvent).toEqual({ id: eventId });
  });

  it('creates, lists, updates and deletes a life event with all optional fields through GraphQL', async () => {
    await testApp.prisma.lifeEvent.create({
      data: {
        ownerUserId: OTHER_USER_ID,
        title: 'Other private event',
        dateValue: new Date('2024-01-01T00:00:00.000Z'),
        datePrecision: 'YEAR',
      },
    });

    const created = await request(testApp.app.getHttpServer())
      .post('/graphql')
      .set(authHeader)
      .send({
        query: `
          mutation CreateLifeEvent($input: CreateLifeEventInput!) {
            createLifeEvent(input: $input) {
              id
              title
              description
              location
              importance
              color
              gyermekiStates { id name }
              szuloiStates { id name }
              felnottStates { id name }
              datePrecision
              ownerUserId
            }
          }
        `,
        variables: {
          input: {
            title: 'Moved out',
            description: 'First own apartment.',
            location: 'Budapest',
            importance: 4,
            color: 'BLUE',
            gyermekiStateIds: [
              'gyermeki-boldog-gyerek',
              'gyermeki-jatekos-gyerek',
            ],
            szuloiStateIds: [
              'szuloi-kritikus-szulo',
              'szuloi-szigoru-szulo',
            ],
            felnottStateIds: [
              'felnott-megfigyelo-felnott',
              'felnott-racionalis-felnott',
            ],
            dateValue: '2020-05-01T00:00:00.000Z',
            datePrecision: 'MONTH',
          },
        },
      })
      .expect(200);

    expect(created.body.errors).toBeUndefined();
    expect(created.body.data.createLifeEvent).toMatchObject({
      title: 'Moved out',
      description: 'First own apartment.',
      location: 'Budapest',
      importance: 4,
      color: 'BLUE',
      gyermekiStates: [
        { id: 'gyermeki-boldog-gyerek', name: 'Boldog gyerek' },
        { id: 'gyermeki-jatekos-gyerek', name: 'Játékos gyerek' },
      ],
      szuloiStates: [
        { id: 'szuloi-kritikus-szulo', name: 'Kritikus szülő' },
        { id: 'szuloi-szigoru-szulo', name: 'Szigorú szülő' },
      ],
      felnottStates: [
        { id: 'felnott-megfigyelo-felnott', name: 'Megfigyelő felnőtt' },
        { id: 'felnott-racionalis-felnott', name: 'Racionális felnőtt' },
      ],
      datePrecision: 'MONTH',
      ownerUserId: TEST_USER_ID,
    });

    const eventId = created.body.data.createLifeEvent.id;

    const list = await request(testApp.app.getHttpServer())
      .post('/graphql')
      .set(authHeader)
      .send({
        query: `
          query {
            lifeEvents {
              id
              title
              description
              location
              importance
              color
              gyermekiStates { id }
              szuloiStates { id }
              felnottStates { id }
            }
          }
        `,
      })
      .expect(200);

    expect(list.body.errors).toBeUndefined();
    expect(list.body.data.lifeEvents).toEqual([
      {
        id: eventId,
        title: 'Moved out',
        description: 'First own apartment.',
        location: 'Budapest',
        importance: 4,
        color: 'BLUE',
        gyermekiStates: [
          { id: 'gyermeki-boldog-gyerek' },
          { id: 'gyermeki-jatekos-gyerek' },
        ],
        szuloiStates: [
          { id: 'szuloi-kritikus-szulo' },
          { id: 'szuloi-szigoru-szulo' },
        ],
        felnottStates: [
          { id: 'felnott-megfigyelo-felnott' },
          { id: 'felnott-racionalis-felnott' },
        ],
      },
    ]);

    const updated = await request(testApp.app.getHttpServer())
      .post('/graphql')
      .set(authHeader)
      .send({
        query: `
          mutation UpdateLifeEvent($input: UpdateLifeEventInput!) {
            updateLifeEvent(input: $input) {
              id
              title
              location
              importance
              color
              gyermekiStates { id }
              szuloiStates { id }
              felnottStates { id }
            }
          }
        `,
        variables: {
          input: {
            id: eventId,
            title: 'Moved out updated',
            location: 'Szeged',
            importance: 5,
            color: 'TEAL',
            gyermekiStateIds: ['gyermeki-szabad-gyerek'],
            szuloiStateIds: [],
            felnottStateIds: ['felnott-donto-felnott'],
          },
        },
      })
      .expect(200);

    expect(updated.body.errors).toBeUndefined();
    expect(updated.body.data.updateLifeEvent).toEqual({
      id: eventId,
      title: 'Moved out updated',
      location: 'Szeged',
      importance: 5,
      color: 'TEAL',
      gyermekiStates: [{ id: 'gyermeki-szabad-gyerek' }],
      szuloiStates: [],
      felnottStates: [{ id: 'felnott-donto-felnott' }],
    });

    const clearedOptionals = await request(testApp.app.getHttpServer())
      .post('/graphql')
      .set(authHeader)
      .send({
        query: `
          mutation UpdateLifeEvent($input: UpdateLifeEventInput!) {
            updateLifeEvent(input: $input) {
              id
              description
              location
              color
              gyermekiStates { id }
              szuloiStates { id }
              felnottStates { id }
            }
          }
        `,
        variables: {
          input: {
            id: eventId,
            description: 'Still has description',
            location: null,
            color: null,
            gyermekiStateIds: null,
            szuloiStateIds: null,
            felnottStateIds: null,
          },
        },
      })
      .expect(200);

    expect(clearedOptionals.body.errors).toBeUndefined();
    expect(clearedOptionals.body.data.updateLifeEvent).toEqual({
      id: eventId,
      description: 'Still has description',
      location: null,
      color: null,
      gyermekiStates: [],
      szuloiStates: [],
      felnottStates: [],
    });

    await request(testApp.app.getHttpServer())
      .post('/graphql')
      .set(authHeader)
      .send({
        query: `
          mutation DeleteLifeEvent($id: String!) {
            deleteLifeEvent(id: $id) {
              id
            }
          }
        `,
        variables: { id: eventId },
      })
      .expect(200);
  });

  it('updates only life event importance or color through GraphQL', async () => {
    const event = await testApp.prisma.lifeEvent.create({
      data: {
        ownerUserId: TEST_USER_ID,
        title: 'Style-only update event',
        description: 'Should remain untouched.',
        importance: 2,
        color: 'BLUE',
        dateValue: new Date('2024-01-01T00:00:00.000Z'),
        datePrecision: 'YEAR',
      },
    });

    const importanceOnly = await request(testApp.app.getHttpServer())
      .post('/graphql')
      .set(authHeader)
      .send({
        query: `
          mutation UpdateLifeEventImportanceAndColor($input: UpdateLifeEventImportanceAndColorInput!) {
            updateLifeEventImportanceAndColor(input: $input) {
              id
              title
              description
              importance
              color
            }
          }
        `,
        variables: {
          input: {
            id: event.id,
            importance: 5,
          },
        },
      })
      .expect(200);

    expect(importanceOnly.body.errors).toBeUndefined();
    expect(importanceOnly.body.data.updateLifeEventImportanceAndColor).toEqual({
      id: event.id,
      title: 'Style-only update event',
      description: 'Should remain untouched.',
      importance: 5,
      color: 'BLUE',
    });

    const colorOnly = await request(testApp.app.getHttpServer())
      .post('/graphql')
      .set(authHeader)
      .send({
        query: `
          mutation UpdateLifeEventImportanceAndColor($input: UpdateLifeEventImportanceAndColorInput!) {
            updateLifeEventImportanceAndColor(input: $input) {
              id
              importance
              color
            }
          }
        `,
        variables: {
          input: {
            id: event.id,
            color: null,
          },
        },
      })
      .expect(200);

    expect(colorOnly.body.errors).toBeUndefined();
    expect(colorOnly.body.data.updateLifeEventImportanceAndColor).toEqual({
      id: event.id,
      importance: 5,
      color: null,
    });
  });

  it('rejects anonymous GraphQL calls', async () => {
    const response = await request(testApp.app.getHttpServer())
      .post('/graphql')
      .send({ query: '{ lifeEvents { id } }' })
      .expect(200);

    expect(response.body.data).toBeNull();
    expect(response.body.errors[0].message).toBe(
      'Authentication is required.',
    );
  });

  it('rejects life event importance outside the allowed range', async () => {
    const response = await request(testApp.app.getHttpServer())
      .post('/graphql')
      .set(authHeader)
      .send({
        query: `
          mutation CreateLifeEvent($input: CreateLifeEventInput!) {
            createLifeEvent(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            title: 'Invalid importance',
            dateValue: '2020-05-01T00:00:00.000Z',
            datePrecision: 'MONTH',
            importance: 6,
          },
        },
      })
      .expect(200);

    expect(response.body.data).toBeNull();
    expect(response.body.errors[0].message).toBe('Bad Request Exception');
  });

  it('rejects ego state ids from the wrong category', async () => {
    const response = await request(testApp.app.getHttpServer())
      .post('/graphql')
      .set(authHeader)
      .send({
        query: `
          mutation CreateLifeEvent($input: CreateLifeEventInput!) {
            createLifeEvent(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            title: 'Wrong ego state category',
            dateValue: '2020-05-01T00:00:00.000Z',
            datePrecision: 'MONTH',
            importance: 3,
            gyermekiStateIds: ['szuloi-kritikus-szulo'],
          },
        },
      })
      .expect(200);

    expect(response.body.data).toBeNull();
    expect(response.body.errors[0].message).toBe(
      'Invalid ego state selection for category GYERMEKI.',
    );
  });

  it('returns the current user top 10 life event locations through GraphQL', async () => {
    const ownLocations = [
      ['Budapest', 5],
      ['Szeged', 4],
      ['Pecs', 3],
      ['Debrecen', 2],
      ['Gyor', 2],
      ['Miskolc', 1],
      ['Eger', 1],
      ['Veszprem', 1],
      ['Kecskemet', 1],
      ['Sopron', 1],
      ['Nyiregyhaza', 1],
    ] as const;

    await testApp.prisma.lifeEvent.createMany({
      data: [
        ...ownLocations.flatMap(([location, count]) =>
          Array.from({ length: count }, (_, index) => ({
            ownerUserId: TEST_USER_ID,
            title: `${location} event ${index}`,
            location,
            dateValue: new Date('2024-01-01T00:00:00.000Z'),
            datePrecision: 'YEAR' as const,
          })),
        ),
        {
          ownerUserId: TEST_USER_ID,
          title: 'No location event',
          location: null,
          dateValue: new Date('2024-01-01T00:00:00.000Z'),
          datePrecision: 'YEAR',
        },
        {
          ownerUserId: OTHER_USER_ID,
          title: 'Other user Budapest event',
          location: 'Budapest',
          dateValue: new Date('2024-01-01T00:00:00.000Z'),
          datePrecision: 'YEAR',
        },
      ],
    });

    const response = await request(testApp.app.getHttpServer())
      .post('/graphql')
      .set(authHeader)
      .send({
        query: `
          query {
            topLifeEventLocations {
              location
              count
            }
          }
        `,
      })
      .expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.topLifeEventLocations).toEqual([
      { location: 'Budapest', count: 5 },
      { location: 'Szeged', count: 4 },
      { location: 'Pecs', count: 3 },
      { location: 'Debrecen', count: 2 },
      { location: 'Gyor', count: 2 },
      { location: 'Eger', count: 1 },
      { location: 'Kecskemet', count: 1 },
      { location: 'Miskolc', count: 1 },
      { location: 'Nyiregyhaza', count: 1 },
      { location: 'Sopron', count: 1 },
    ]);
  });

  it('does not allow GraphQL access to another user event', async () => {
    const otherEvent = await testApp.prisma.lifeEvent.create({
      data: {
        ownerUserId: OTHER_USER_ID,
        title: 'Other private event',
        dateValue: new Date('2024-01-01T00:00:00.000Z'),
        datePrecision: 'YEAR',
      },
    });

    const response = await request(testApp.app.getHttpServer())
      .post('/graphql')
      .set(authHeader)
      .send({
        query: `
          query LifeEvent($id: String!) {
            lifeEvent(id: $id) {
              id
            }
          }
        `,
        variables: { id: otherEvent.id },
      })
      .expect(200);

    expect(response.body.data).toBeNull();
    expect(response.body.errors[0].message).toBe(
      'Life event was not found or is not owned by the current user.',
    );
  });
});
