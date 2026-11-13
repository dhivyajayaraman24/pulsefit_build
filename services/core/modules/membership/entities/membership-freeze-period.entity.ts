import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Membership } from './membership.entity';

@Entity({ name: 'membership_freeze_periods' })
@Index('idx_membership_freeze_periods_membership', ['membershipId'])
@Index('idx_membership_freeze_periods_window', ['startsAt', 'endsAt'])
export class MembershipFreezePeriod {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'membership_id', type: 'uuid' })
  membershipId!: string;

  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt!: Date;

  @Column({ name: 'ends_at', type: 'timestamptz' })
  endsAt!: Date;

  @Column({ type: 'varchar', length: 240, nullable: true })
  reason!: string | null;

  @Column({ name: 'created_by_user_id', type: 'uuid', nullable: true })
  createdByUserId!: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => Membership, (membership) => membership.freezePeriods, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'membership_id' })
  membership!: Membership;
}
