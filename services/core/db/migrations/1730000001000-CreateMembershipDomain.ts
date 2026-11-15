import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMembershipDomain1730000001000 implements MigrationInterface {
  name = 'CreateMembershipDomain1730000001000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE members (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        home_branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
        member_number varchar(64) NOT NULL UNIQUE,
        first_name varchar(100) NOT NULL,
        last_name varchar(100) NOT NULL,
        email varchar(180) NULL,
        phone varchar(32) NULL,
        status varchar(32) NOT NULL DEFAULT 'active',
        deactivated_at timestamptz NULL,
        metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query('CREATE INDEX idx_members_home_branch_status ON members(home_branch_id, status)');
    await queryRunner.query('CREATE INDEX idx_members_email ON members(email)');
    await queryRunner.query('CREATE INDEX idx_members_phone ON members(phone)');

    await queryRunner.query(`
      CREATE TABLE membership_plans (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        branch_id uuid NULL REFERENCES branches(id) ON DELETE RESTRICT,
        name varchar(120) NOT NULL,
        code varchar(64) NOT NULL,
        status varchar(32) NOT NULL DEFAULT 'active',
        billing_period varchar(32) NOT NULL,
        price_cents integer NOT NULL,
        currency varchar(3) NOT NULL DEFAULT 'INR',
        duration_days integer NOT NULL,
        grace_days integer NOT NULL DEFAULT 0,
        allows_multi_branch boolean NOT NULL DEFAULT false,
        default_auto_renew boolean NOT NULL DEFAULT true,
        metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query('CREATE UNIQUE INDEX idx_membership_plans_code_unique ON membership_plans(code)');
    await queryRunner.query('CREATE INDEX idx_membership_plans_branch_status ON membership_plans(branch_id, status)');

    await queryRunner.query(`
      CREATE TABLE memberships (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
        plan_id uuid NOT NULL REFERENCES membership_plans(id) ON DELETE RESTRICT,
        home_branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
        status varchar(32) NOT NULL DEFAULT 'active',
        payment_status varchar(32) NOT NULL DEFAULT 'paid',
        starts_at timestamptz NOT NULL,
        ends_at timestamptz NOT NULL,
        grace_ends_at timestamptz NULL,
        cancelled_at timestamptz NULL,
        cancellation_reason varchar(240) NULL,
        auto_renew boolean NOT NULL DEFAULT true,
        status_evaluated_at timestamptz NULL,
        metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query('CREATE INDEX idx_memberships_member_status ON memberships(member_id, status)');
    await queryRunner.query('CREATE INDEX idx_memberships_branch_status ON memberships(home_branch_id, status)');

    await queryRunner.query(`
      CREATE TABLE membership_branch_access (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        membership_id uuid NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
        branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
        starts_at timestamptz NOT NULL,
        ends_at timestamptz NULL,
        is_active boolean NOT NULL DEFAULT true,
        metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query('CREATE INDEX idx_membership_branch_access_membership ON membership_branch_access(membership_id)');
    await queryRunner.query('CREATE INDEX idx_membership_branch_access_branch_active ON membership_branch_access(branch_id, is_active)');

    await queryRunner.query(`
      CREATE TABLE membership_freeze_periods (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        membership_id uuid NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
        starts_at timestamptz NOT NULL,
        ends_at timestamptz NOT NULL,
        reason varchar(240) NULL,
        created_by_user_id uuid NULL,
        metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query('CREATE INDEX idx_membership_freeze_periods_membership ON membership_freeze_periods(membership_id)');
    await queryRunner.query('CREATE INDEX idx_membership_freeze_periods_window ON membership_freeze_periods(starts_at, ends_at)');

    await queryRunner.query(`
      CREATE TABLE membership_status_history (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        membership_id uuid NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
        from_status varchar(32) NULL,
        to_status varchar(32) NOT NULL,
        reason varchar(160) NOT NULL,
        effective_at timestamptz NOT NULL,
        actor_user_id uuid NULL,
        metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query('CREATE INDEX idx_membership_status_history_membership_created ON membership_status_history(membership_id, created_at)');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS idx_membership_status_history_membership_created');
    await queryRunner.query('DROP TABLE IF EXISTS membership_status_history');
    await queryRunner.query('DROP INDEX IF EXISTS idx_membership_freeze_periods_window');
    await queryRunner.query('DROP INDEX IF EXISTS idx_membership_freeze_periods_membership');
    await queryRunner.query('DROP TABLE IF EXISTS membership_freeze_periods');
    await queryRunner.query('DROP INDEX IF EXISTS idx_membership_branch_access_branch_active');
    await queryRunner.query('DROP INDEX IF EXISTS idx_membership_branch_access_membership');
    await queryRunner.query('DROP TABLE IF EXISTS membership_branch_access');
    await queryRunner.query('DROP INDEX IF EXISTS idx_memberships_branch_status');
    await queryRunner.query('DROP INDEX IF EXISTS idx_memberships_member_status');
    await queryRunner.query('DROP TABLE IF EXISTS memberships');
    await queryRunner.query('DROP INDEX IF EXISTS idx_membership_plans_branch_status');
    await queryRunner.query('DROP INDEX IF EXISTS idx_membership_plans_code_unique');
    await queryRunner.query('DROP TABLE IF EXISTS membership_plans');
    await queryRunner.query('DROP INDEX IF EXISTS idx_members_phone');
    await queryRunner.query('DROP INDEX IF EXISTS idx_members_email');
    await queryRunner.query('DROP INDEX IF EXISTS idx_members_home_branch_status');
    await queryRunner.query('DROP TABLE IF EXISTS members');
  }
}
