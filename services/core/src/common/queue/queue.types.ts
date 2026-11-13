export type QueueJobEnvelope<TPayload extends Record<string, unknown> = Record<string, unknown>> = {
  schemaVersion: number;
  idempotencyKey: string;
  correlationId: string;
  branchId?: string | null;
  payload: TPayload;
};

export type EnqueueJobInput<TPayload extends Record<string, unknown> = Record<string, unknown>> =
  QueueJobEnvelope<TPayload> & {
    jobName: string;
    maxAttempts?: number;
  };
