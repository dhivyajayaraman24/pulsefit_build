import { Injectable } from '@nestjs/common';

export const DEFAULT_SENSITIVE_KEYS = [
  'authorization',
  'cookie',
  'password',
  'otp',
  'token',
  'secret',
  'credential',
  'kyc',
  'healthDeclaration',
  'paymentData',
];

@Injectable()
export class RedactionService {
  private readonly sensitiveKeyMatchers = DEFAULT_SENSITIVE_KEYS.map((key) => key.toLowerCase());

  redact<T>(value: T): T {
    return this.redactValue(value) as T;
  }

  private redactValue(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => this.redactValue(item));
    }

    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: value.stack,
      };
    }

    if (!value || typeof value !== 'object') {
      return value;
    }

    return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>(
      (redacted, [key, nestedValue]) => {
        redacted[key] = this.isSensitiveKey(key) ? '[REDACTED]' : this.redactValue(nestedValue);
        return redacted;
      },
      {},
    );
  }

  private isSensitiveKey(key: string) {
    const normalized = key.toLowerCase();
    return this.sensitiveKeyMatchers.some((matcher) => normalized.includes(matcher));
  }
}

