import { Module } from '@nestjs/common';
import { LabelsResolver } from './labels.resolver';
import { LabelsService } from './labels.service';

@Module({
  providers: [LabelsService, LabelsResolver],
  exports: [LabelsService],
})
export class LabelsModule {}
