import { ConfigService } from '@nestjs/config';
import { describe, expect, it, jest } from '@jest/globals';
import { getNotFoundDelayMs } from './bootstrap';

const createConfig = (value: string | undefined) =>
  ({
    get: jest.fn().mockReturnValue(value),
  }) as unknown as ConfigService;

describe('getNotFoundDelayMs', () => {
  it('returns zero when NOT_FOUND_DELAY_MS is missing', () => {
    expect(getNotFoundDelayMs(createConfig(undefined))).toBe(0);
  });

  it('returns zero when NOT_FOUND_DELAY_MS is zero', () => {
    expect(getNotFoundDelayMs(createConfig('0'))).toBe(0);
  });

  it('returns the configured positive delay', () => {
    expect(getNotFoundDelayMs(createConfig('1500'))).toBe(1500);
  });
});
