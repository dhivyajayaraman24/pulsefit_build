import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Member } from './member.entity';
import { MembershipBranchAccess } from './membership-branch-access.entity';
import { MembershipFreezePeriod } from './membership-freeze-period.entity';
import { MembershipPlan } from './membership-plan.entity';
import { MembershipStatusHistory } from './membership-status-history.entity';

export enum MembershipDerivedStatus {
  ACTIVE = 'active',
  GRACE = 'grace',
  FROZEN = 'frozen',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  UNPAID = 'unpaid',
  BRANCH_INELIGIBLE = 'branch_ineligible',
}

export enum MembershipPaymentStatus {
  PAID = 'paid',
  PAST_DUE = 'past_due',
  UNPAID = 'unpaid',
}

@Entity({ name: 'memberships' })
@Index('idx_memberships_member_status', ['memberId', 'status'])
@Index('idx_memberships_branch_status', ['homeBranchId', 'status'])
export class Membership {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'member_id', type: 'uuid' })
  memberId!: string;

  @Column({ name: 'plan_id', type: 'uuid' })
  planId!: string;

  @Column({ name: 'home_branch_id', type: 'uuid' })
  homeBranchId!: string;

  @Column({ type: 'varchar', length: 32, default: MembershipDerivedStatus.ACTIVE })
  status!: MembershipDerivedStatus;

  @Column({ name: 'payment_status', type: 'varchar', length: 32, default: MembershipPaymentStatus.PAID })
  paymentStatus!: MembershipPaymentStatus;

  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt!: Date;

  @Column({ name: 'ends_at', type: 'timestamptz' })
  endsAt!: Date;

  @Column({ name: 'grace_ends_at', type: 'timestamptz', nullable: true })
  graceEndsAt!: Date | null;

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt!: Date | null;

  @Column({ name: 'cancellation_reason', type: 'varchar', length: 240, nullable: true })
  cancellationReason!: string | null;

  @Column({ name: 'auto_renew', type: 'boolean', default: true })
  autoRenew!: boolean;

  @Column({ name: 'status_evaluated_at', type: 'timestamptz', nullable: true })
  statusEvaluatedAt!: Date | null;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => Member, (member) => member.memberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id' })
  member!: Member;

  @ManyToOne(() => MembershipPlan, (plan) => plan.memberships, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'plan_id' })
  plan!: MembershipPlan;

  @OneToMany(() => MembershipBranchAccess, (branchAccess) => branchAccess.membership)
  branchAccess!: MembershipBranchAccess[];

  @OneToMany(() => MembershipFreezePeriod, (freezePeriod) => freezePeriod.membership)
  freezePeriods!: MembershipFreezePeriod[];

  @OneToMany(() => MembershipStatusHistory, (statusHistory) => statusHistory.membership)
  statusHistory!: MembershipStatusHistory[];
}
