import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import passport from 'passport';
import connectPgSimple from 'connect-pg-simple';
import { isDebugLoggingEnabled } from './common/logging';

type ClosableSessionStore = session.Store & {
  close?: () => void;
};

export function configureApp(app: INestApplication) {
  const config = app.get(ConfigService);
  const logger = new Logger('HttpSession');
  const nodeEnv = config.get<string>('NODE_ENV');
  const trustProxyConfig =
    config.get<string>('TRUST_PROXY') ?? (nodeEnv === 'production' ? '1' : '');
  if (trustProxyConfig) {
    const trustProxy = Number.isNaN(Number(trustProxyConfig))
      ? trustProxyConfig
      : Number(trustProxyConfig);
    app.getHttpAdapter().getInstance().set('trust proxy', trustProxy);
    logger.log(`Trust proxy enabled: ${trustProxyConfig}.`);
  }
  const sessionStore = config.get<string>('SESSION_STORE') ?? 'postgres';
  const sessionTtlSeconds = Number.parseInt(
    config.get<string>('SESSION_TTL_SECONDS') ?? '1209600',
    10,
  );
  const store: ClosableSessionStore | undefined =
    sessionStore === 'memory'
      ? undefined
      : new (connectPgSimple(session))({
          conString: config.getOrThrow<string>('DATABASE_URL'),
          tableName: 'session',
          createTableIfMissing: false,
          ttl: sessionTtlSeconds,
          pruneSessionInterval: false,
          errorLog: (...args: unknown[]) =>
            logger.error(`Postgres session store error: ${args.join(' ')}`),
        });

  if (store?.close) {
    const closeApp = app.close.bind(app);
    app.close = async () => {
      await closeApp();
      store.close?.();
    };
  }

  logger.log(`Using ${sessionStore} session store.`);

  app.use(
    session({
      store,
      secret: config.getOrThrow<string>('SESSION_SECRET'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: nodeEnv === 'production',
        maxAge: sessionTtlSeconds * 1000,
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use((request: Request, response: Response, next: NextFunction) => {
    const startedAt = Date.now();

    response.on('finish', () => {
      const hasCookie = Boolean(request.headers.cookie);
      const setCookie = response.getHeader('set-cookie');
      const hasSetCookie = Array.isArray(setCookie)
        ? setCookie.length > 0
        : Boolean(setCookie);
      const user = request.user as { id?: string } | undefined;
      const userId = user?.id ?? 'anonymous';
      const sessionId = request.sessionID ?? 'none';
      const message = `${request.method} ${request.originalUrl} ${response.statusCode} ${Date.now() - startedAt}ms session=${sessionId} cookie=${hasCookie ? 'yes' : 'no'} setCookie=${hasSetCookie ? 'yes' : 'no'} user=${userId}`;

      if (response.statusCode >= 500) {
        logger.error(message);
        return;
      }

      if (response.statusCode >= 400) {
        logger.warn(message);
        return;
      }

      if (isDebugLoggingEnabled(logger)) {
        logger.debug(message);
      }
    });

    next();
  });

  app.enableCors({
    origin: config.get<string>('FRONTEND_URL') ?? true,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
}
