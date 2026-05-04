import { registerEnumType } from '@nestjs/graphql';

export enum DatePrecision {
  YEAR = 'YEAR',
  MONTH = 'MONTH',
  DAY = 'DAY',
}

registerEnumType(DatePrecision, { name: 'DatePrecision' });
