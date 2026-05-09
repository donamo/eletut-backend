import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../common/authenticated.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { User } from '../users/models/user.model';
import { UpdateLabelInput } from './dto/update-label.input';
import { LabelsService } from './labels.service';
import { Label } from './models/label.model';

@Resolver(() => Label)
@UseGuards(AuthenticatedGuard)
export class LabelsResolver {
  constructor(private readonly labelsService: LabelsService) {}

  @Query(() => [Label])
  labels(@CurrentUser() user: User) {
    return this.labelsService.list(user.id);
  }

  @Mutation(() => Label)
  updateLabel(@CurrentUser() user: User, @Args('input') input: UpdateLabelInput) {
    return this.labelsService.update(user.id, input);
  }
}
