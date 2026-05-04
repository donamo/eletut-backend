import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { LifeEventColor } from '../models/life-event-color.enum';

@InputType()
export class UpdateLifeEventImportanceAndColorInput {
  @ApiProperty({ example: 'clxlifeeventid' })
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 5, example: 4 })
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  importance?: number;

  @ApiPropertyOptional({ enum: LifeEventColor, example: LifeEventColor.TEAL })
  @Field(() => LifeEventColor, { nullable: true })
  @IsOptional()
  @IsEnum(LifeEventColor)
  color?: LifeEventColor | null;
}
