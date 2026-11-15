import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Membership, MembershipDerivedStatus } from './membership.entity';

@Entity({ name: 'membership_status_history' })
@Index('idx_membership_status_history_membership_created', ['membershipId', 'createdAt'])
export class MembershipStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'membership_id', type: 'uuid' })
  membershipId!: string;

  @Column({ name: 'from_status', type: 'varchar', length: 32, nullable: true })
  fromStatus!: MembershipDerivedStatus | null;

  @Column({ name: 'to_status', type: 'varchar', length: 32 })
  toStatus!: MembershipDerivedStatus;

  @Column({ type: 'varchar', length: 160 })
  reason!: string;

  @Column({ name: 'effective_at', type: 'timestamptz' })
  effectiveAt!: Date;

  @Column({ name: 'actor_user_id', type: 'uuid', nullable: true })
  actorUserId!: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => Membership, (membership) => membership.statusHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'membership_id' })
  membership!: Membership;
}
