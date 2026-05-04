import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../common/authenticated.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { EgoState } from '../ego-states/models/ego-state.model';
import { User } from '../users/models/user.model';
import { CreateLifeEventInput } from './dto/create-life-event.input';
import { UpdateLifeEventImportanceAndColorInput } from './dto/update-life-event-importance-and-color.input';
import { UpdateLifeEventInput } from './dto/update-life-event.input';
import { LifeEventLocationSummary } from './models/life-event-location-summary.model';
import { LifeEvent } from './models/life-event.model';
import { LifeEventsService } from './life-events.service';

type EgoStateLink = { egoState: EgoState };
type LifeEventWithEgoStateLinks = Omit<
  LifeEvent,
  'gyermekiStates' | 'szuloiStates' | 'felnottStates'
> & {
  gyermekiStates?: EgoStateLink[];
  szuloiStates?: EgoStateLink[];
  felnottStates?: EgoStateLink[];
};

@Resolver(() => LifeEvent)
@UseGuards(AuthenticatedGuard)
export class LifeEventsResolver {
  constructor(private readonly lifeEventsService: LifeEventsService) {}

  @ResolveField(() => [EgoState])
  gyermekiStates(@Parent() event: LifeEventWithEgoStateLinks) {
    return this.extractSortedEgoStates(event.gyermekiStates);
  }

  @ResolveField(() => [EgoState])
  szuloiStates(@Parent() event: LifeEventWithEgoStateLinks) {
    return this.extractSortedEgoStates(event.szuloiStates);
  }

  @ResolveField(() => [EgoState])
  felnottStates(@Parent() event: LifeEventWithEgoStateLinks) {
    return this.extractSortedEgoStates(event.felnottStates);
  }

  @Query(() => [LifeEvent])
  lifeEvents(@CurrentUser() user: User) {
    return this.lifeEventsService.list(user.id);
  }

  @Query(() => [LifeEventLocationSummary])
  topLifeEventLocations(@CurrentUser() user: User) {
    return this.lifeEventsService.topLocations(user.id);
  }

  @Query(() => LifeEvent)
  lifeEvent(@CurrentUser() user: User, @Args('id') id: string) {
    return this.lifeEventsService.get(user.id, id);
  }

  @Mutation(() => LifeEvent)
  createLifeEvent(
    @CurrentUser() user: User,
    @Args('input') input: CreateLifeEventInput,
  ) {
    return this.lifeEventsService.create(user.id, input);
  }

  @Mutation(() => LifeEvent)
  updateLifeEvent(
    @CurrentUser() user: User,
    @Args('input') input: UpdateLifeEventInput,
  ) {
    return this.lifeEventsService.update(user.id, input);
  }

  @Mutation(() => LifeEvent)
  updateLifeEventImportanceAndColor(
    @CurrentUser() user: User,
    @Args('input') input: UpdateLifeEventImportanceAndColorInput,
  ) {
    return this.lifeEventsService.updateImportanceAndColor(user.id, input);
  }

  @Mutation(() => LifeEvent)
  deleteLifeEvent(@CurrentUser() user: User, @Args('id') id: string) {
    return this.lifeEventsService.delete(user.id, id);
  }

  private extractSortedEgoStates(links?: EgoStateLink[]) {
    return (links ?? [])
      .map((link) => link.egoState)
      .sort((left, right) => left.sortOrder - right.sortOrder);
  }
}
