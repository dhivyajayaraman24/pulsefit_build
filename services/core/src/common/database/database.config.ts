import { DataSourceOptions } from 'typeorm';
import { AuditLog } from '../../../modules/audit-compliance/entities';
import {
  Member,
  Membership,
  MembershipBranchAccess,
  MembershipFreezePeriod,
  MembershipPlan,
  MembershipStatusHistory,
} from '../../../modules/membership/entities';
import { Branch, JobMetadata, Role, User } from './entities';

const entities = [
  AuditLog,
  Branch,
  JobMetadata,
  Member,
  Membership,
  MembershipBranchAccess,
  MembershipFreezePeriod,
  MembershipPlan,
  MembershipStatusHistory,
  Role,
  User,
];

export function buildDatabaseOptions(): DataSourceOptions {
  return {
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME ?? process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_DATABASE ?? process.env.DB_NAME ?? 'pulsefit_core',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    entities,
    migrations: ['dist/db/migrations/*.js'],
    synchronize: false,
  };
}

export const databaseEntities = entities;
