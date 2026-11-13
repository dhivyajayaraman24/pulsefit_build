import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Branch } from './branch.entity';

export type JobStatus = 'queued' | 'active' | 'completed' | 'failed' | 'dead_lettered';

@Entity({ name: 'job_metadata' })
@Index('idx_job_metadata_queue_status', ['queueName', 'status'])
@Index('idx_job_metadata_idempotency_unique', ['queueName', 'idempotencyKey'], { unique: true })
@Index('idx_job_metadata_correlation_id', ['correlationId'])
export class JobMetadata {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'branch_id', type: 'uuid', nullable: true })
  branchId!: string | null;

  @Column({ name: 'queue_name', type: 'varchar', length: 100 })
  queueName!: string;

  @Column({ name: 'job_name', type: 'varchar', length: 120 })
  jobName!: string;

  @Column({ name: 'schema_version', type: 'integer' })
  schemaVersion!: number;

  @Column({ name: 'idempotency_key', type: 'varchar', length: 160 })
  idempotencyKey!: string;

  @Column({ name: 'correlation_id', type: 'varchar', length: 160 })
  correlationId!: string;

  @Column({ type: 'varchar', length: 32, default: 'queued' })
  status!: JobStatus;

  @Column({ name: 'attempt_count', type: 'integer', default: 0 })
  attemptCount!: number;

  @Column({ name: 'max_attempts', type: 'integer', default: 3 })
  maxAttempts!: number;

  @Column({ name: 'bull_job_id', type: 'varchar', length: 160, nullable: true })
  bullJobId!: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  payload!: Record<string, unknown>;

  @Column({ name: 'dead_letter_metadata', type: 'jsonb', nullable: true })
  deadLetterMetadata!: Record<string, unknown> | null;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError!: string | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => Branch, (branch) => branch.jobs, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'branch_id' })
  branch!: Branch | null;
}
