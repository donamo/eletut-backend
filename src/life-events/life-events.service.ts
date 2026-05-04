import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EgoStateCategory, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLifeEventInput } from './dto/create-life-event.input';
import { UpdateLifeEventImportanceAndColorInput } from './dto/update-life-event-importance-and-color.input';
import { UpdateLifeEventInput } from './dto/update-life-event.input';

const normalizeOptionalText = (value: string | null | undefined) =>
  value?.trim() || null;

const uniqueIds = (ids: string[] | null | undefined) =>
  Array.from(new Set(ids ?? []));

const lifeEventInclude = {
  gyermekiStates: { include: { egoState: true } },
  szuloiStates: { include: { egoState: true } },
  felnottStates: { include: { egoState: true } },
} satisfies Prisma.LifeEventInclude;

@Injectable()
export class LifeEventsService {
  constructor(private readonly prisma: PrismaService) {}

  list(ownerUserId: string) {
    return this.prisma.lifeEvent.findMany({
      where: { ownerUserId },
      include: lifeEventInclude,
      orderBy: [{ dateValue: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async topLocations(ownerUserId: string) {
    const rows = await this.prisma.lifeEvent.groupBy({
      by: ['location'],
      where: {
        ownerUserId,
        location: { not: null },
      },
      _count: { location: true },
      orderBy: [{ _count: { location: 'desc' } }, { location: 'asc' }],
      take: 10,
    });

    return rows
      .filter((row): row is typeof row & { location: string } =>
        Boolean(row.location),
      )
      .map((row) => ({
        location: row.location,
        count: row._count.location,
      }));
  }

  async get(ownerUserId: string, id: string) {
    const event = await this.prisma.lifeEvent.findFirst({
      where: { id, ownerUserId },
      include: lifeEventInclude,
    });

    if (!event) {
      throw new NotFoundException(
        'Life event was not found or is not owned by the current user.',
      );
    }

    return event;
  }

  async create(ownerUserId: string, input: CreateLifeEventInput) {
    await this.validateEgoStateSelections(input);

    return this.prisma.lifeEvent.create({
      data: {
        ownerUserId,
        title: input.title.trim(),
        description: normalizeOptionalText(input.description),
        location: normalizeOptionalText(input.location),
        importance: input.importance,
        color: input.color ?? null,
        dateValue: input.dateValue,
        datePrecision: input.datePrecision,
        gyermekiStates: this.buildNestedStateLinks(input.gyermekiStateIds),
        szuloiStates: this.buildNestedStateLinks(input.szuloiStateIds),
        felnottStates: this.buildNestedStateLinks(input.felnottStateIds),
      },
      include: lifeEventInclude,
    });
  }

  async update(ownerUserId: string, input: UpdateLifeEventInput) {
    await this.get(ownerUserId, input.id);
    await this.validateEgoStateSelections(input);

    const data: Prisma.LifeEventUpdateInput = {};
    if (input.title !== undefined) data.title = input.title.trim();
    if (input.description !== undefined) {
      data.description = normalizeOptionalText(input.description);
    }
    if (input.location !== undefined) {
      data.location = normalizeOptionalText(input.location);
    }
    if (input.importance !== undefined) data.importance = input.importance;
    if (input.color !== undefined) data.color = input.color ?? null;
    if (input.dateValue !== undefined) data.dateValue = input.dateValue;
    if (input.datePrecision !== undefined) {
      data.datePrecision = input.datePrecision;
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.lifeEvent.update({
        where: { id: input.id },
        data,
      });

      await this.replaceStateLinks(
        tx,
        'lifeEventGyermekiState',
        input.id,
        input.gyermekiStateIds,
      );
      await this.replaceStateLinks(
        tx,
        'lifeEventSzuloiState',
        input.id,
        input.szuloiStateIds,
      );
      await this.replaceStateLinks(
        tx,
        'lifeEventFelnottState',
        input.id,
        input.felnottStateIds,
      );

      return tx.lifeEvent.findUniqueOrThrow({
        where: { id: input.id },
        include: lifeEventInclude,
      });
    });
  }

  async updateImportanceAndColor(
    ownerUserId: string,
    input: UpdateLifeEventImportanceAndColorInput,
  ) {
    await this.get(ownerUserId, input.id);

    const data: Prisma.LifeEventUpdateInput = {};
    if (input.importance !== undefined) data.importance = input.importance;
    if (input.color !== undefined) data.color = input.color ?? null;

    if (Object.keys(data).length === 0) {
      throw new BadRequestException(
        'At least one of importance or color must be provided.',
      );
    }

    return this.prisma.lifeEvent.update({
      where: { id: input.id },
      data,
      include: lifeEventInclude,
    });
  }

  async delete(ownerUserId: string, id: string) {
    await this.get(ownerUserId, id);
    return this.prisma.lifeEvent.delete({ where: { id } });
  }

  private buildNestedStateLinks(ids: string[] | null | undefined) {
    const data = uniqueIds(ids).map((egoStateId) => ({ egoStateId }));
    return data.length > 0 ? { createMany: { data } } : undefined;
  }

  private async validateEgoStateSelections(input: {
    gyermekiStateIds?: string[] | null;
    szuloiStateIds?: string[] | null;
    felnottStateIds?: string[] | null;
  }) {
    await Promise.all([
      this.validateEgoStateIds(
        EgoStateCategory.GYERMEKI,
        input.gyermekiStateIds,
      ),
      this.validateEgoStateIds(EgoStateCategory.SZULOI, input.szuloiStateIds),
      this.validateEgoStateIds(EgoStateCategory.FELNOTT, input.felnottStateIds),
    ]);
  }

  private async validateEgoStateIds(
    category: EgoStateCategory,
    ids: string[] | null | undefined,
  ) {
    const stateIds = uniqueIds(ids);
    if (stateIds.length === 0) return;

    const count = await this.prisma.egoState.count({
      where: { id: { in: stateIds }, category },
    });

    if (count !== stateIds.length) {
      throw new BadRequestException(
        `Invalid ego state selection for category ${category}.`,
      );
    }
  }

  private async replaceStateLinks(
    tx: Prisma.TransactionClient,
    model:
      | 'lifeEventGyermekiState'
      | 'lifeEventSzuloiState'
      | 'lifeEventFelnottState',
    lifeEventId: string,
    ids: string[] | null | undefined,
  ) {
    if (ids === undefined) return;

    const data = uniqueIds(ids).map((egoStateId) => ({
      lifeEventId,
      egoStateId,
    }));

    if (model === 'lifeEventGyermekiState') {
      await tx.lifeEventGyermekiState.deleteMany({ where: { lifeEventId } });
      if (data.length > 0) {
        await tx.lifeEventGyermekiState.createMany({ data });
      }
      return;
    }

    if (model === 'lifeEventSzuloiState') {
      await tx.lifeEventSzuloiState.deleteMany({ where: { lifeEventId } });
      if (data.length > 0) {
        await tx.lifeEventSzuloiState.createMany({ data });
      }
      return;
    }

    if (model === 'lifeEventFelnottState') {
      await tx.lifeEventFelnottState.deleteMany({ where: { lifeEventId } });
      if (data.length > 0) {
        await tx.lifeEventFelnottState.createMany({ data });
      }
    }
  }
}
