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
import { Branch } from '../../../src/common/database/entities';
import { Membership } from './membership.entity';

export enum MemberProfileStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DEACTIVATED = 'deactivated',
}

@Entity({ name: 'members' })
@Index('idx_members_home_branch_status', ['homeBranchId', 'status'])
@Index('idx_members_email', ['email'])
@Index('idx_members_phone', ['phone'])
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'home_branch_id', type: 'uuid' })
  homeBranchId!: string;

  @Column({ name: 'member_number', type: 'varchar', length: 64, unique: true })
  memberNumber!: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName!: string;

  @Column({ type: 'varchar', length: 180, nullable: true })
  email!: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  phone!: string | null;

  @Column({ type: 'varchar', length: 32, default: MemberProfileStatus.ACTIVE })
  status!: MemberProfileStatus;

  @Column({ name: 'deactivated_at', type: 'timestamptz', nullable: true })
  deactivatedAt!: Date | null;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => Branch, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'home_branch_id' })
  homeBranch!: Branch;

  @OneToMany(() => Membership, (membership) => membership.member)
  memberships!: Membership[];
}
