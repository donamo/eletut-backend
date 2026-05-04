import { Module } from '@nestjs/common';
import { LifeEventsResolver } from './life-events.resolver';
import { LifeEventsService } from './life-events.service';

@Module({
  providers: [LifeEventsService, LifeEventsResolver],
})
export class LifeEventsModule {}
