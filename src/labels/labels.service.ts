import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ReadonlyPrismaService } from '../prisma/readonly-prisma.service';
import { UpdateLabelInput } from './dto/update-label.input';

const normalizeLabelName = (name: string) =>
  name.trim().toLocaleLowerCase('hu-HU');

@Injectable()
export class LabelsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly readonlyPrisma: ReadonlyPrismaService,
  ) {}

  list(ownerUserId: string) {
    return this.readonlyPrisma.label.findMany({
      where: { ownerUserId },
      orderBy: [{ name: 'asc' }],
    });
  }

  async update(ownerUserId: string, input: UpdateLabelInput) {
    const name = normalizeLabelName(input.name);
    const newName =
      input.newName === undefined || input.newName === null
        ? undefined
        : normalizeLabelName(input.newName);
    const data: Prisma.LabelUpdateInput = {};

    if (!name) {
      throw new BadRequestException('Label name must not be empty.');
    }

    if (newName !== undefined) {
      if (!newName) {
        throw new BadRequestException('New label name must not be empty.');
      }
      data.name = newName;
    }

    if (input.color !== undefined) {
      data.color = input.color ?? 'GRAY';
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException(
        'At least one of newName or color must be provided.',
      );
    }

    const label = await this.prisma.label.findUnique({
      where: { ownerUserId_name: { ownerUserId, name } },
    });
    if (!label) {
      throw new NotFoundException('Label was not found for the current user.');
    }

    if (newName && newName !== name) {
      const existing = await this.prisma.label.findUnique({
        where: { ownerUserId_name: { ownerUserId, name: newName } },
      });
      if (existing) {
        throw new BadRequestException('Label name already exists.');
      }
    }

    return this.prisma.label.update({
      where: { id: label.id },
      data,
    });
  }
}
