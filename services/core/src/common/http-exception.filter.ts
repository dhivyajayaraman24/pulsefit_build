import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CORRELATION_ID_HEADER } from './correlation-id.constants';
import { CorrelatedRequest } from './correlation-id.middleware';
import { ErrorEnvelope } from './error-envelope.interface';

type HttpResponseBody = {
  code?: string;
  error?: string;
  message?: string | string[];
  details?: unknown;
  validationErrors?: string[];
};

type WritableResponse = {
  getHeader(name: string): number | string | string[] | undefined;
  status(statusCode: number): {
    json(body: ErrorEnvelope): void;
  };
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<WritableResponse>();
    const request = context.getRequest<CorrelatedRequest>();
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const envelope = this.toEnvelope(exception, status, request, response);
    response.status(status).json(envelope);
  }

  private toEnvelope(
    exception: unknown,
    status: number,
    request: CorrelatedRequest,
    response: WritableResponse,
  ): ErrorEnvelope {
    const exceptionBody = exception instanceof HttpException ? exception.getResponse() : undefined;
    const body = this.isResponseBody(exceptionBody) ? exceptionBody : undefined;
    const messages = Array.isArray(body?.message)
      ? body.message
      : body?.message
        ? [body.message]
        : undefined;

    return {
      code: body?.code ?? this.statusToCode(status),
      message: messages?.[0] ?? body?.error ?? this.defaultMessage(status),
      details: body?.details ?? null,
      correlationId: this.resolveCorrelationId(request, response),
      validationErrors: body?.validationErrors ?? (Array.isArray(body?.message) ? body.message : []),
    };
  }

  private isResponseBody(value: unknown): value is HttpResponseBody {
    return typeof value === 'object' && value !== null;
  }

  private resolveCorrelationId(request: CorrelatedRequest, response: WritableResponse) {
    const responseHeader = response.getHeader(CORRELATION_ID_HEADER);
    if (request.correlationId) {
      return request.correlationId;
    }
    if (Array.isArray(responseHeader)) {
      return responseHeader[0] ?? 'unavailable';
    }
    return responseHeader?.toString() ?? 'unavailable';
  }

  private statusToCode(status: number) {
    if (status === HttpStatus.BAD_REQUEST) {
      return 'BAD_REQUEST';
    }
    if (status === HttpStatus.NOT_FOUND) {
      return 'NOT_FOUND';
    }
    if (status === HttpStatus.UNAUTHORIZED) {
      return 'UNAUTHORIZED';
    }
    if (status === HttpStatus.FORBIDDEN) {
      return 'FORBIDDEN';
    }
    if (status >= 500) {
      return 'INTERNAL_SERVER_ERROR';
    }
    return `HTTP_${status}`;
  }

  private defaultMessage(status: number) {
    return status >= 500 ? 'Internal server error' : 'Request failed';
  }
}
