import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { JsonLoggerService } from '../logging';
import { ObservabilityConfig, loadObservabilityConfig } from './observability.config';

@Injectable()
export class ObservabilityService implements OnApplicationShutdown {
  private started = false;
  private readonly config: ObservabilityConfig;

  constructor(private readonly logger: JsonLoggerService) {
    this.config = loadObservabilityConfig();
  }

  start() {
    if (this.started) {
      return this.config;
    }

    this.started = true;
    this.logger.log(
      {
        event: 'observability_initialized',
        serviceName: this.config.serviceName,
        environment: this.config.environment,
        otlpEndpointConfigured: Boolean(this.config.otlpEndpoint),
        metricsEnabled: this.config.metricsEnabled,
        tracesEnabled: this.config.tracesEnabled,
      },
      'Observability',
    );
    return this.config;
  }

  onApplicationShutdown() {
    if (!this.started) {
      return;
    }
    this.logger.log({ event: 'observability_shutdown' }, 'Observability');
  }
}

