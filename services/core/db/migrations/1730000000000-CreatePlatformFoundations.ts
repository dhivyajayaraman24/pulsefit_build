import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePlatformFoundations1730000000000 implements MigrationInterface {
  name = 'CreatePlatformFoundations1730000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    await queryRunner.query(`
      CREATE TABLE branches (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(160) NOT NULL,
        code varchar(64) NOT NULL UNIQUE,
        timezone varchar(80) NOT NULL DEFAULT 'Asia/Kolkata',
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE roles (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(80) NOT NULL UNIQUE,
        description varchar(240) NOT NULL,
        permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        branch_id uuid NULL REFERENCES branches(id) ON DELETE SET NULL,
        email varchar(180) NOT NULL,
        display_name varchar(160) NOT NULL,
        status varchar(32) NOT NULL DEFAULT 'active',
        password_hash varchar(255) NULL,
        last_login_at timestamptz NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query('CREATE UNIQUE INDEX idx_users_email_unique ON users(email)');
    await queryRunner.query('CREATE INDEX idx_users_branch_id ON users(branch_id)');
    await queryRunner.query(`
      CREATE TABLE user_roles (
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, role_id)
      )
    `);
    await queryRunner.query('CREATE INDEX idx_user_roles_role_id ON user_roles(role_id)');
    await queryRunner.query(`
      CREATE TABLE audit_logs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        branch_id uuid NULL REFERENCES branches(id) ON DELETE SET NULL,
        actor_user_id uuid NULL,
        action varchar(120) NOT NULL,
        resource_type varchar(120) NOT NULL,
        resource_id varchar(160) NULL,
        correlation_id varchar(160) NOT NULL,
        idempotency_key varchar(160) NULL,
        metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query('CREATE INDEX idx_audit_logs_branch_created_at ON audit_logs(branch_id, created_at)');
    await queryRunner.query('CREATE INDEX idx_audit_logs_correlation_id ON audit_logs(correlation_id)');
    await queryRunner.query(`
      CREATE TABLE job_metadata (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        branch_id uuid NULL REFERENCES branches(id) ON DELETE SET NULL,
        queue_name varchar(100) NOT NULL,
        job_name varchar(120) NOT NULL,
        schema_version integer NOT NULL,
        idempotency_key varchar(160) NOT NULL,
        correlation_id varchar(160) NOT NULL,
        status varchar(32) NOT NULL DEFAULT 'queued',
        attempt_count integer NOT NULL DEFAULT 0,
        max_attempts integer NOT NULL DEFAULT 3,
        bull_job_id varchar(160) NULL,
        payload jsonb NOT NULL DEFAULT '{}'::jsonb,
        dead_letter_metadata jsonb NULL,
        last_error text NULL,
        completed_at timestamptz NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query('CREATE INDEX idx_job_metadata_queue_status ON job_metadata(queue_name, status)');
    await queryRunner.query('CREATE UNIQUE INDEX idx_job_metadata_idempotency_unique ON job_metadata(queue_name, idempotency_key)');
    await queryRunner.query('CREATE INDEX idx_job_metadata_correlation_id ON job_metadata(correlation_id)');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS idx_job_metadata_correlation_id');
    await queryRunner.query('DROP INDEX IF EXISTS idx_job_metadata_idempotency_unique');
    await queryRunner.query('DROP INDEX IF EXISTS idx_job_metadata_queue_status');
    await queryRunner.query('DROP TABLE IF EXISTS job_metadata');
    await queryRunner.query('DROP INDEX IF EXISTS idx_audit_logs_correlation_id');
    await queryRunner.query('DROP INDEX IF EXISTS idx_audit_logs_branch_created_at');
    await queryRunner.query('DROP TABLE IF EXISTS audit_logs');
    await queryRunner.query('DROP INDEX IF EXISTS idx_user_roles_role_id');
    await queryRunner.query('DROP TABLE IF EXISTS user_roles');
    await queryRunner.query('DROP INDEX IF EXISTS idx_users_branch_id');
    await queryRunner.query('DROP INDEX IF EXISTS idx_users_email_unique');
    await queryRunner.query('DROP TABLE IF EXISTS users');
    await queryRunner.query('DROP TABLE IF EXISTS roles');
    await queryRunner.query('DROP TABLE IF EXISTS branches');
  }
}
