import { randomUUID } from 'crypto';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { CORRELATION_ID_HEADER } from './correlation-id.constants';

export type CorrelatedRequest = {
  headers: Record<string, string | string[] | undefined>;
  correlationId?: string;
};

type CorrelatedResponse = {
  setHeader(name: string, value: string): void;
};

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(request: CorrelatedRequest, response: CorrelatedResponse, next: () => void) {
    const headerValue = request.headers[CORRELATION_ID_HEADER];
    const correlationId = Array.isArray(headerValue) ? headerValue[0] : headerValue;

    request.correlationId = correlationId?.trim() || randomUUID();
    response.setHeader(CORRELATION_ID_HEADER, request.correlationId);
    next();
  }
}
