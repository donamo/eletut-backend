import { Field, Int, ObjectType } from '@nestjs/graphql';
import { EgoStateCategory } from './ego-state-category.enum';

@ObjectType()
export class EgoState {
  @Field()
  id: string;

  @Field(() => EgoStateCategory)
  category: EgoStateCategory;

  @Field()
  name: string;

  @Field()
  essence: string;

  @Field()
  innerSentence: string;

  @Field(() => Int)
  sortOrder: number;
}
