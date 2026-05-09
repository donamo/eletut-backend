import { Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../common/authenticated.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { User } from '../users/models/user.model';
import { UsersService } from '../users/users.service';

@Resolver(() => User)
export class AuthResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => User)
  @UseGuards(AuthenticatedGuard)
  me(@CurrentUser() user: User) {
    return this.usersService.withAdminFlag(user);
  }
}
