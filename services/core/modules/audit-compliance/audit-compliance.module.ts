import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AUDIT_WRITER } from './audit-writer.interface';
import { AuditLogService } from './audit-log.service';
import { AuditLog } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [
    AuditLogService,
    {
      provide: AUDIT_WRITER,
      useExisting: AuditLogService,
    },
  ],
  exports: [AUDIT_WRITER, AuditLogService],
})
export class AuditComplianceModule {}
