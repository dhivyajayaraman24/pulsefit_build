import { Injectable, LoggerService } from '@nestjs/common';
import { CorrelationContextService } from './correlation-context.service';
import { RedactionService } from './redaction.service';

type LogLevel = 'log' | 'error' | 'warn' | 'debug' | 'verbose';

@Injectable()
export class JsonLoggerService implements LoggerService {
  constructor(
    private readonly correlationContext: CorrelationContextService,
    private readonly redaction: RedactionService,
  ) {}

  log(message: unknown, context?: string) {
    this.write('log', message, context);
  }

  error(message: unknown, trace?: string, context?: string) {
    this.write('error', message, context, trace ? { trace } : undefined);
  }

  warn(message: unknown, context?: string) {
    this.write('warn', message, context);
  }

  debug(message: unknown, context?: string) {
    this.write('debug', message, context);
  }

  verbose(message: unknown, context?: string) {
    this.write('verbose', message, context);
  }

  private write(level: LogLevel, message: unknown, context?: string, extra?: Record<string, unknown>) {
    const entry = this.redaction.redact({
      timestamp: new Date().toISOString(),
      level,
      context,
      correlationId: this.correlationContext.getCorrelationId() ?? 'unavailable',
      message,
      ...extra,
    });

    const line = JSON.stringify(entry);
    if (level === 'error') {
      console.error(line);
      return;
    }
    console.log(line);
  }
}

