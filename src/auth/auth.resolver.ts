import { Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../common/authenticated.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { User } from '../users/models/user.model';

@Resolver(() => User)
export class AuthResolver {
  @Query(() => User)
  @UseGuards(AuthenticatedGuard)
  me(@CurrentUser() user: User) {
    return user;
  }
}
