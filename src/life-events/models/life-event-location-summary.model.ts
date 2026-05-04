import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class LifeEventLocationSummary {
  @Field()
  location: string;

  @Field(() => Int)
  count: number;
}
