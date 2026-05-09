import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsString,
  ArrayUnique,
  MaxLength,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DatePrecision } from '../models/date-precision.enum';
import { LifeEventColor } from '../models/life-event-color.enum';

@InputType()
export class CreateLifeEventInput {
  @ApiProperty({ maxLength: 150, example: 'First school day' })
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @ApiPropertyOptional({
    maxLength: 10000,
    example: 'A personal memory from that day.',
  })
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  description?: string | null;

  @ApiPropertyOptional({
    maxLength: 200,
    example: 'Budapest',
  })
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string | null;

  @ApiPropertyOptional({ type: [String], example: ['gyermeki-boldog-gyerek'] })
  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  gyermekiStateIds?: string[] | null;

  @ApiPropertyOptional({ type: [String], example: ['szuloi-gondoskodo-szulo'] })
  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  szuloiStateIds?: string[] | null;

  @ApiPropertyOptional({ type: [String], example: ['felnott-racionalis-felnott'] })
  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  felnottStateIds?: string[] | null;

  @ApiPropertyOptional({ type: [String], example: ['family', 'school'] })
  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  labelNames?: string[] | null;

  @ApiProperty({ minimum: 1, maximum: 5, example: 3 })
  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(5)
  importance: number;

  @ApiPropertyOptional({ enum: LifeEventColor, example: LifeEventColor.BLUE })
  @Field(() => LifeEventColor, { nullable: true })
  @IsOptional()
  @IsEnum(LifeEventColor)
  color?: LifeEventColor | null;

  @ApiProperty({
    format: 'date-time',
    example: '2007-09-01T00:00:00.000Z',
  })
  @Field()
  @Type(() => Date)
  @IsDate()
  dateValue: Date;

  @ApiProperty({ enum: DatePrecision, example: DatePrecision.DAY })
  @Field(() => DatePrecision)
  @IsEnum(DatePrecision)
  datePrecision: DatePrecision;
}
