import { Field, ID, InputType, PartialType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { CreateLifeEventInput } from './create-life-event.input';

@InputType()
export class UpdateLifeEventInput extends PartialType(CreateLifeEventInput) {
  @ApiProperty({ example: 'clxlifeeventid' })
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  id: string;
}
