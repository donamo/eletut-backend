import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AdminGuard } from '../common/admin.guard';
import { AuthenticatedGuard } from '../common/authenticated.guard';
import { UpdateUserEnabledInput } from './dto/update-user-enabled.input';
import { User } from './models/user.model';
import { UsersService } from './users.service';

@Resolver(() => User)
@UseGuards(AuthenticatedGuard, AdminGuard)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User])
  users() {
    return this.usersService.list();
  }

  @Mutation(() => User)
  updateUserEnabled(@Args('input') input: UpdateUserEnabledInput) {
    return this.usersService.updateEnabled(input.id, input.isEnabled);
  }
}
