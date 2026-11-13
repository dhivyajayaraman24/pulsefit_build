import { Injectable, NestMiddleware } from '@nestjs/common';
import { CORRELATION_ID_HEADER } from '../correlation-id.constants';
import { CorrelatedRequest } from '../correlation-id.middleware';
import { JsonLoggerService } from './json-logger.service';
import { RedactionService } from './redaction.service';

type ObservableResponse = {
  statusCode?: number;
  on(event: 'finish', listener: () => void): void;
};

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(
    private readonly logger: JsonLoggerService,
    private readonly redaction: RedactionService,
  ) {}

  use(request: CorrelatedRequest, response: ObservableResponse, next: () => void) {
    const startedAt = Date.now();
    response.on('finish', () => {
      this.logger.log(
        this.redaction.redact({
          event: 'http_request_completed',
          method: request.method,
          path: request.url,
          statusCode: response.statusCode,
          durationMs: Date.now() - startedAt,
          correlationId: request.correlationId ?? request.headers[CORRELATION_ID_HEADER],
          headers: request.headers,
        }),
        'HttpRequest',
      );
    });
    next();
  }
}

