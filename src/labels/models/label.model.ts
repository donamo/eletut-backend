import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LifeEventColor } from '../../life-events/models/life-event-color.enum';

@ObjectType()
export class Label {
  @ApiProperty({ example: 'clxlabelid' })
  @Field(() => ID)
  id: string;

  @ApiProperty({ example: 'clxuserid' })
  @Field(() => ID)
  ownerUserId: string;

  @ApiProperty({ example: 'family' })
  @Field()
  name: string;

  @ApiPropertyOptional({ enum: LifeEventColor, example: LifeEventColor.GRAY })
  @Field(() => LifeEventColor)
  color: LifeEventColor;

  @ApiProperty({ format: 'date-time' })
  @Field()
  createdAt: Date;

  @ApiProperty({ format: 'date-time' })
  @Field()
  updatedAt: Date;
}
