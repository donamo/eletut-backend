import { Injectable } from '@nestjs/common';
import { EgoStateCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EgoStatesService {
  constructor(private readonly prisma: PrismaService) {}

  async catalog() {
    const [gyermeki, szuloi, felnott] = await Promise.all([
      this.listByCategory(EgoStateCategory.GYERMEKI),
      this.listByCategory(EgoStateCategory.SZULOI),
      this.listByCategory(EgoStateCategory.FELNOTT),
    ]);

    return { gyermeki, szuloi, felnott };
  }

  listByCategory(category: EgoStateCategory) {
    return this.prisma.egoState.findMany({
      where: { category },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
