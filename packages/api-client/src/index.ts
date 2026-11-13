export type ApiClientConfig = {
  baseUrl: string;
  correlationId?: string;
};

export type ApiErrorEnvelope = {
  error: {
    code: string;
    message: string;
    correlationId?: string;
    details?: unknown;
  };
};

export type HealthResponse = {
  status: 'ok';
  service: string;
  timestamp?: string;
};

export function createApiClient(config: ApiClientConfig) {
  async function getHealth(): Promise<HealthResponse> {
    const response = await fetch(`${config.baseUrl.replace(/\/$/, '')}/health`, {
      headers: config.correlationId ? { 'x-correlation-id': config.correlationId } : undefined,
    });

    if (!response.ok) {
      throw (await response.json()) as ApiErrorEnvelope;
    }

    return (await response.json()) as HealthResponse;
  }

  return {
    getHealth,
  };
}
