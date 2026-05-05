import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  enabled: boolean;
  windowMs: number;
  globalMax: number;
  authMax: number;
};

const parsePositiveInt = (
  value: string | undefined,
  defaultValue: number,
): number => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultValue;
};

const isEnabled = (value: string | undefined) =>
  !['0', 'false', 'off', 'no'].includes((value ?? 'true').toLowerCase());

const getClientIp = (request: Request) =>
  request.ip ||
  request.socket.remoteAddress ||
  request.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ||
  'unknown';

const getRouteMax = (request: Request, options: RateLimitOptions) =>
  request.path.startsWith('/auth/') ? options.authMax : options.globalMax;

const cleanupExpiredBuckets = (
  buckets: Map<string, RateLimitBucket>,
  now: number,
) => {
  if (buckets.size < 10000) return;

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
};

export const createRateLimitMiddleware = (config: ConfigService) => {
  const logger = new Logger('RateLimit');
  const options: RateLimitOptions = {
    enabled: isEnabled(config.get<string>('RATE_LIMIT_ENABLED')),
    windowMs: parsePositiveInt(
      config.get<string>('RATE_LIMIT_WINDOW_MS'),
      60_000,
    ),
    globalMax: parsePositiveInt(config.get<string>('RATE_LIMIT_MAX'), 300),
    authMax: parsePositiveInt(config.get<string>('RATE_LIMIT_AUTH_MAX'), 30),
  };
  const buckets = new Map<string, RateLimitBucket>();

  if (!options.enabled) {
    logger.warn('Rate limiting is disabled.');
    return (_request: Request, _response: Response, next: NextFunction) =>
      next();
  }

  logger.log(
    `Rate limiting enabled windowMs=${options.windowMs} globalMax=${options.globalMax} authMax=${options.authMax}.`,
  );

  return (request: Request, response: Response, next: NextFunction) => {
    const now = Date.now();
    const max = getRouteMax(request, options);
    const key = `${getClientIp(request)}:${request.path.startsWith('/auth/') ? 'auth' : 'global'}`;
    const existing = buckets.get(key);
    const bucket =
      existing && existing.resetAt > now
        ? existing
        : { count: 0, resetAt: now + options.windowMs };

    bucket.count += 1;
    buckets.set(key, bucket);
    cleanupExpiredBuckets(buckets, now);

    const remaining = Math.max(max - bucket.count, 0);
    const resetSeconds = Math.ceil((bucket.resetAt - now) / 1000);
    response.setHeader('RateLimit-Limit', max);
    response.setHeader('RateLimit-Remaining', remaining);
    response.setHeader('RateLimit-Reset', resetSeconds);

    if (bucket.count > max) {
      response.setHeader('Retry-After', resetSeconds);
      logger.warn(
        `Too many requests ip=${getClientIp(request)} path=${request.path} count=${bucket.count} max=${max}`,
      );
      response.status(429).send({
        message: 'Too many requests.',
        retryAfterSeconds: resetSeconds,
      });
      return;
    }

    next();
  };
};
