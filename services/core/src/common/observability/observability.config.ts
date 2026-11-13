export interface ObservabilityConfig {
  serviceName: string;
  environment: string;
  otlpEndpoint?: string;
  metricsEnabled: boolean;
  tracesEnabled: boolean;
}

export function loadObservabilityConfig(env: NodeJS.ProcessEnv = process.env): ObservabilityConfig {
  return {
    serviceName: env.OTEL_SERVICE_NAME ?? 'pulsefit-core',
    environment: env.NODE_ENV ?? 'development',
    otlpEndpoint: env.OTEL_EXPORTER_OTLP_ENDPOINT,
    metricsEnabled: env.OTEL_METRICS_ENABLED !== 'false',
    tracesEnabled: env.OTEL_TRACES_ENABLED !== 'false',
  };
}

