import { Field, ID, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class UpdateUserEnabledInput {
  @ApiProperty({ example: 'clxuserid' })
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: true })
  @Field()
  @IsBoolean()
  isEnabled: boolean;
}
