import { Module } from '@nestjs/common';
import { LoggingModule } from '../logging';
import { MetricsService } from './metrics.service';
import { ObservabilityService } from './observability.service';

@Module({
  imports: [LoggingModule],
  providers: [MetricsService, ObservabilityService],
  exports: [MetricsService, ObservabilityService],
})
export class ObservabilityModule {}

