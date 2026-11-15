import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Membership } from './membership.entity';

export enum MembershipPlanStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DEACTIVATED = 'deactivated',
}

export enum MembershipBillingPeriod {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUAL = 'annual',
  PREPAID = 'prepaid',
}

@Entity({ name: 'membership_plans' })
@Index('idx_membership_plans_branch_status', ['branchId', 'status'])
@Index('idx_membership_plans_code_unique', ['code'], { unique: true })
export class MembershipPlan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'branch_id', type: 'uuid', nullable: true })
  branchId!: string | null;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'varchar', length: 64 })
  code!: string;

  @Column({ type: 'varchar', length: 32, default: MembershipPlanStatus.ACTIVE })
  status!: MembershipPlanStatus;

  @Column({ name: 'billing_period', type: 'varchar', length: 32 })
  billingPeriod!: MembershipBillingPeriod;

  @Column({ name: 'price_cents', type: 'integer' })
  priceCents!: number;

  @Column({ type: 'varchar', length: 3, default: 'INR' })
  currency!: string;

  @Column({ name: 'duration_days', type: 'integer' })
  durationDays!: number;

  @Column({ name: 'grace_days', type: 'integer', default: 0 })
  graceDays!: number;

  @Column({ name: 'allows_multi_branch', type: 'boolean', default: false })
  allowsMultiBranch!: boolean;

  @Column({ name: 'default_auto_renew', type: 'boolean', default: true })
  defaultAutoRenew!: boolean;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => Membership, (membership) => membership.plan)
  memberships!: Membership[];
}
