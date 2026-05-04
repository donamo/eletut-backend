import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  googleSubject: string;

  @Field()
  email: string;

  @Field(() => String, { nullable: true })
  displayName?: string | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
