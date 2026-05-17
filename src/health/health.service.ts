import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReadonlyPrismaService } from '../prisma/readonly-prisma.service';

type DbStatus = { status: 'up' } | { status: 'down'; message: string };

type HealthResult = {
  status: 'ok' | 'error';
  info: Record<string, DbStatus>;
};

const CACHE_TTL_MS = 3000;

@Injectable()
export class HealthService {
  private cachedResult: HealthResult | null = null;
  private cachedAt = 0;

  constructor(
    private readonly prisma: PrismaService,
    private readonly readonlyPrisma: ReadonlyPrismaService,
  ) {}

  async check(): Promise<HealthResult> {
    if (Date.now() - this.cachedAt < CACHE_TTL_MS && this.cachedResult) {
      return this.cachedResult;
    }

    const [primary, readonly] = await Promise.all([
      this.ping(this.prisma),
      this.ping(this.readonlyPrisma),
    ]);

    const info = { database: primary, readonlyDatabase: readonly };
    const result: HealthResult = {
      status:
        primary.status === 'up' && readonly.status === 'up' ? 'ok' : 'error',
      info,
    };

    this.cachedResult = result;
    this.cachedAt = Date.now();

    return result;
  }

  private async ping(
    client: PrismaService | ReadonlyPrismaService,
  ): Promise<DbStatus> {
    try {
      await client.$queryRaw`SELECT 1`;
      return { status: 'up' };
    } catch (error) {
      return {
        status: 'down',
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
