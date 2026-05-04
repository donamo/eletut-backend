import { Module } from '@nestjs/common';
import { EgoStatesResolver } from './ego-states.resolver';
import { EgoStatesService } from './ego-states.service';

@Module({
  providers: [EgoStatesService, EgoStatesResolver],
  exports: [EgoStatesService],
})
export class EgoStatesModule {}
