import { Field, ObjectType } from '@nestjs/graphql';
import { EgoState } from './ego-state.model';

@ObjectType()
export class EgoStateCatalog {
  @Field(() => [EgoState])
  gyermeki: EgoState[];

  @Field(() => [EgoState])
  szuloi: EgoState[];

  @Field(() => [EgoState])
  felnott: EgoState[];
}
