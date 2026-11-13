import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { JobMetadata } from './job-metadata.entity';
import { AuditLog } from '../../../../modules/audit-compliance/entities/audit-log.entity';

@Entity({ name: 'branches' })
export class Branch {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 160 })
  name!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  code!: string;

  @Column({ name: 'timezone', type: 'varchar', length: 80, default: 'Asia/Kolkata' })
  timezone!: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => User, (user) => user.branch)
  users!: User[];

  @OneToMany(() => JobMetadata, (job) => job.branch)
  jobs!: JobMetadata[];

  @OneToMany(() => AuditLog, (auditLog) => auditLog.branch)
  auditLogs!: AuditLog[];
}
