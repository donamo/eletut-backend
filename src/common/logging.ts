import { LoggerService, LogLevel } from '@nestjs/common';

const levelOrder: LogLevel[] = ['error', 'warn', 'log', 'debug', 'verbose'];

export function getNestLogLevels(rawLevel?: string): LogLevel[] {
  const level = rawLevel?.toLowerCase() ?? 'log';

  if (level === 'silent' || level === 'off') return [];
  if (level === 'info') return ['error', 'warn', 'log'];
  if (level === 'debug' || level === 'dev' || level === 'develop') {
    return ['error', 'warn', 'log', 'debug'];
  }

  const index = levelOrder.indexOf(level as LogLevel);
  if (index === -1) return ['error', 'warn', 'log'];

  return levelOrder.slice(0, index + 1);
}

export function isDebugLoggingEnabled(logger: LoggerService): boolean {
  return typeof logger.debug === 'function';
}
