import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { request } from 'http';
import { AddressInfo } from 'net';
import { SecurityDefaultsModule } from '../src/common/auth';
import { CorrelationContextService, JsonLoggerService, RedactionService } from '../src/common/logging';

function getJson(path: string, port: number, headers: Record<string, string> = {}) {
  return new Promise<{ statusCode: number; body: unknown }>((resolve, reject) => {
    const clientRequest = request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method: 'GET',
        headers,
      },
      (response) => {
        let rawBody = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          rawBody += chunk;
        });
        response.on('end', () => {
          resolve({
            statusCode: response.statusCode ?? 0,
            body: rawBody ? JSON.parse(rawBody) : null,
          });
        });
      },
    );
    clientRequest.on('error', reject);
    clientRequest.end();
  });
}

describe('security defaults', () => {
  let app: INestApplication;
  let port: number;
  const previousPlaceholderAuth = process.env.PLACEHOLDER_AUTH_HEADERS_ENABLED;

  beforeEach(async () => {
    process.env.PLACEHOLDER_AUTH_HEADERS_ENABLED = 'true';
    const moduleRef = await Test.createTestingModule({
      imports: [SecurityDefaultsModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('v1');
    await app.listen(0);
    port = (app.getHttpServer().address() as AddressInfo).port;
  });

  afterEach(async () => {
    if (previousPlaceholderAuth === undefined) {
      delete process.env.PLACEHOLDER_AUTH_HEADERS_ENABLED;
    } else {
      process.env.PLACEHOLDER_AUTH_HEADERS_ENABLED = previousPlaceholderAuth;
    }
    await app.close();
  });

  it('denies the protected sample endpoint without authenticated context', async () => {
    const response = await getJson('/v1/security/sample-protected', port);

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: 'Authenticated context is required.',
      }),
    );
  });

  it('denies the protected sample endpoint without the requested branch scope', async () => {
    const response = await getJson('/v1/security/sample-protected', port, {
      'x-authenticated-user-id': 'staff-1',
      'x-authenticated-principal-type': 'staff',
      'x-authenticated-roles': 'staff',
      'x-authenticated-branch-scopes': 'branch-1',
    });

    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: 'Authenticated context must include the requested branch scope.',
      }),
    );
  });
});

describe('structured logging defaults', () => {
  it('includes correlation IDs and redacts configured sensitive keys', () => {
    const context = new CorrelationContextService();
    const redaction = new RedactionService();
    const logger = new JsonLoggerService(context, redaction);
    const logSpy = jest.spyOn(console, 'log').mockImplementation();

    context.run({ correlationId: 'corr-123' }, () => {
      logger.log({
        event: 'login_attempt',
        username: 'frontdesk',
        password: 'plaintext',
        nested: {
          otpValue: '123456',
          safe: 'visible',
        },
      });
    });

    expect(logSpy).toHaveBeenCalledTimes(1);
    const entry = JSON.parse(logSpy.mock.calls[0][0]);
    expect(entry.correlationId).toBe('corr-123');
    expect(entry.message.password).toBe('[REDACTED]');
    expect(entry.message.nested.otpValue).toBe('[REDACTED]');
    expect(entry.message.nested.safe).toBe('visible');

    logSpy.mockRestore();
  });
});

