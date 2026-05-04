import { Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../common/authenticated.guard';
import { EgoStateCatalog } from './models/ego-state-catalog.model';
import { EgoStatesService } from './ego-states.service';

@Resolver(() => EgoStateCatalog)
@UseGuards(AuthenticatedGuard)
export class EgoStatesResolver {
  constructor(private readonly egoStatesService: EgoStatesService) {}

  @Query(() => EgoStateCatalog)
  egoStates() {
    return this.egoStatesService.catalog();
  }
}
