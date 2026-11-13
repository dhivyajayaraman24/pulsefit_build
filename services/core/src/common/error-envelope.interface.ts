export type ErrorEnvelope = {
  code: string;
  message: string;
  details: unknown;
  correlationId: string;
  validationErrors: string[];
};
