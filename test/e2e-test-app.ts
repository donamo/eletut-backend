import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { NextFunction, Request, Response } from 'express';
import { execFileSync } from 'node:child_process';
import { Client } from 'pg';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';
import { PrismaService } from '../src/prisma/prisma.service';
import { User } from '../src/users/models/user.model';

export const TEST_USER_ID = 'e2e-user-a';
export const OTHER_USER_ID = 'e2e-user-b';
export const authHeader = { 'x-test-user-id': TEST_USER_ID };

let migrated = false;

const ensureE2eDatabase = async (databaseUrl: string) => {
  const url = new URL(databaseUrl);
  const databaseName = url.pathname.replace(/^\//, '');

  if (!/^[a-zA-Z0-9_-]+$/.test(databaseName)) {
    throw new Error(`Unsafe test database name: ${databaseName}`);
  }

  if (!/(e2e|test)/i.test(databaseName)) {
    throw new Error(
      `Refusing to run e2e tests against non-test database: ${databaseName}`,
    );
  }

  const adminUrl = new URL(databaseUrl);
  adminUrl.pathname = '/postgres';

  const client = new Client({ connectionString: adminUrl.toString() });
  await client.connect();

  const result = await client.query<{ exists: boolean }>(
    'SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = $1)',
    [databaseName],
  );

  if (!result.rows[0]?.exists) {
    await client.query(`CREATE DATABASE "${databaseName}"`);
  }

  await client.end();
};

const migrateE2eDatabase = async () => {
  if (migrated) return;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required for e2e tests.');
  }

  await ensureE2eDatabase(databaseUrl);
  execFileSync('npx', ['prisma', 'migrate', 'deploy'], {
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'inherit',
  });
  migrated = true;
};

export const createTestApp = async () => {
  await migrateE2eDatabase();

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  configureApp(app);

  const prisma = app.get(PrismaService);
  app.use(async (req: Request, _res: Response, next: NextFunction) => {
    const userId = req.header('x-test-user-id');
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) req.user = user as User;
    }
    next();
  });
  app.use(
    '/__e2e/login',
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.header('x-test-user-id') ?? TEST_USER_ID;
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        res.status(404).send({ message: 'Test user not found.' });
        return;
      }

      req.logIn(user, (error) => {
        if (error) {
          next(error);
          return;
        }

        req.session.save((saveError) => {
          if (saveError) {
            next(saveError);
            return;
          }

          res.status(204).send();
        });
      });
    },
  );

  await app.init();
  return { app, prisma };
};

export const resetE2eDatabase = async (prisma: PrismaService) => {
  await prisma.lifeEvent.deleteMany();
  await prisma.$executeRawUnsafe('DELETE FROM "session"');
  await prisma.user.deleteMany();
  await prisma.user.createMany({
    data: [
      {
        id: TEST_USER_ID,
        googleSubject: 'google-subject-a',
        email: 'a@example.com',
        displayName: 'User A',
      },
      {
        id: OTHER_USER_ID,
        googleSubject: 'google-subject-b',
        email: 'b@example.com',
        displayName: 'User B',
      },
    ],
  });
};

export type E2eTestApp = {
  app: INestApplication;
  prisma: PrismaService;
};
