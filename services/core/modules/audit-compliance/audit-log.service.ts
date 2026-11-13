import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditEventInput, AuditWriter } from './audit-writer.interface';
import { AuditLog } from './entities';

@Injectable()
export class AuditLogService implements AuditWriter {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogs: Repository<AuditLog>,
  ) {}

  async append(event: AuditEventInput): Promise<void> {
    const auditLog = this.auditLogs.create({
      action: event.action,
      actorUserId: event.actorUserId ?? null,
      branchId: event.branchId ?? null,
      correlationId: event.correlationId,
      idempotencyKey: event.idempotencyKey ?? null,
      metadata: event.metadata ?? {},
      resourceId: event.resourceId ?? null,
      resourceType: event.resourceType,
    });

    await this.auditLogs.save(auditLog);
  }
}
