export interface ManagedSecretsConfig {
  provider: 'aws-secrets-manager' | 'environment';
  secretPrefix: string;
  rotationDays: number;
}

export interface EncryptionConfig {
  kmsKeyId: string;
  dataKeyAlgorithm: 'AES-256-GCM';
  piiFieldEncryptionEnabled: boolean;
}

export interface SecurityConfig {
  placeholderAuthHeadersEnabled: boolean;
  managedSecrets: ManagedSecretsConfig;
  encryption: EncryptionConfig;
}

export function loadSecurityConfig(env: NodeJS.ProcessEnv = process.env): SecurityConfig {
  return {
    placeholderAuthHeadersEnabled: env.PLACEHOLDER_AUTH_HEADERS_ENABLED === 'true',
    managedSecrets: {
      provider: env.SECRETS_PROVIDER === 'environment' ? 'environment' : 'aws-secrets-manager',
      secretPrefix: env.SECRETS_PREFIX ?? '/pulsefit/core',
      rotationDays: Number(env.SECRETS_ROTATION_DAYS ?? 90),
    },
    encryption: {
      kmsKeyId: env.PII_KMS_KEY_ID ?? 'managed/pulsefit/core/pii',
      dataKeyAlgorithm: 'AES-256-GCM',
      piiFieldEncryptionEnabled: env.PII_FIELD_ENCRYPTION_ENABLED !== 'false',
    },
  };
}

