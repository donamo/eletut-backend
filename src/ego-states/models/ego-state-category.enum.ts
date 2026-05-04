import { registerEnumType } from '@nestjs/graphql';

export enum EgoStateCategory {
  GYERMEKI = 'GYERMEKI',
  SZULOI = 'SZULOI',
  FELNOTT = 'FELNOTT',
}

registerEnumType(EgoStateCategory, { name: 'EgoStateCategory' });
