import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ReadonlyPrismaService } from './readonly-prisma.service';

@Global()
@Module({
  providers: [PrismaService, ReadonlyPrismaService],
  exports: [PrismaService, ReadonlyPrismaService],
})
export class PrismaModule {}
