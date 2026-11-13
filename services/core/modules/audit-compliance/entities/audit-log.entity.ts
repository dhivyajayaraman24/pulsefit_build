import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Branch } from '../../../src/common/database/entities/branch.entity';

@Entity({ name: 'audit_logs' })
@Index('idx_audit_logs_branch_created_at', ['branchId', 'createdAt'])
@Index('idx_audit_logs_correlation_id', ['correlationId'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'branch_id', type: 'uuid', nullable: true })
  branchId!: string | null;

  @Column({ name: 'actor_user_id', type: 'uuid', nullable: true })
  actorUserId!: string | null;

  @Column({ type: 'varchar', length: 120 })
  action!: string;

  @Column({ name: 'resource_type', type: 'varchar', length: 120 })
  resourceType!: string;

  @Column({ name: 'resource_id', type: 'varchar', length: 160, nullable: true })
  resourceId!: string | null;

  @Column({ name: 'correlation_id', type: 'varchar', length: 160 })
  correlationId!: string;

  @Column({ name: 'idempotency_key', type: 'varchar', length: 160, nullable: true })
  idempotencyKey!: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => Branch, (branch) => branch.auditLogs, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'branch_id' })
  branch!: Branch | null;
}
