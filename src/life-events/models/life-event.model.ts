import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EgoState } from '../../ego-states/models/ego-state.model';
import { DatePrecision } from './date-precision.enum';
import { LifeEventColor } from './life-event-color.enum';

@ObjectType()
export class LifeEvent {
  @ApiProperty({ example: 'clxlifeeventid' })
  @Field(() => ID)
  id: string;

  @ApiProperty({ example: 'clxuserid' })
  @Field(() => ID)
  ownerUserId: string;

  @ApiProperty({ example: 'First school day' })
  @Field()
  title: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'A personal memory from that day.',
  })
  @Field(() => String, { nullable: true })
  description?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'Budapest',
  })
  @Field(() => String, { nullable: true })
  location?: string | null;

  @Field(() => [EgoState])
  gyermekiStates: EgoState[];

  @Field(() => [EgoState])
  szuloiStates: EgoState[];

  @Field(() => [EgoState])
  felnottStates: EgoState[];

  @ApiProperty({ minimum: 1, maximum: 5, example: 3 })
  @Field(() => Int)
  importance: number;

  @ApiPropertyOptional({
    enum: LifeEventColor,
    nullable: true,
    example: LifeEventColor.BLUE,
  })
  @Field(() => LifeEventColor, { nullable: true })
  color?: LifeEventColor | null;

  @ApiProperty({
    format: 'date-time',
    example: '2007-09-01T00:00:00.000Z',
  })
  @Field()
  dateValue: Date;

  @ApiProperty({ enum: DatePrecision, example: DatePrecision.DAY })
  @Field(() => DatePrecision)
  datePrecision: DatePrecision;

  @ApiProperty({ format: 'date-time' })
  @Field()
  createdAt: Date;

  @ApiProperty({ format: 'date-time' })
  @Field()
  updatedAt: Date;
}
