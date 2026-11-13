import { Global, Module } from '@nestjs/common';
import { CorrelationContextService } from './correlation-context.service';
import { JsonLoggerService } from './json-logger.service';
import { RedactionService } from './redaction.service';
import { RequestLoggingMiddleware } from './request-logging.middleware';

@Global()
@Module({
  providers: [
    CorrelationContextService,
    JsonLoggerService,
    RedactionService,
    RequestLoggingMiddleware,
  ],
  exports: [
    CorrelationContextService,
    JsonLoggerService,
    RedactionService,
    RequestLoggingMiddleware,
  ],
})
export class LoggingModule {}

