import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { LifeEventColor } from '../../life-events/models/life-event-color.enum';

@InputType()
export class UpdateLabelInput {
  @ApiProperty({ example: 'family' })
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name: string;

  @ApiPropertyOptional({ example: 'childhood' })
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  newName?: string | null;

  @ApiPropertyOptional({ enum: LifeEventColor, example: LifeEventColor.TEAL })
  @Field(() => LifeEventColor, { nullable: true })
  @IsOptional()
  @IsEnum(LifeEventColor)
  color?: LifeEventColor | null;
}
