export type AuditEventInput = {
  action: string;
  resourceType: string;
  correlationId: string;
  branchId?: string | null;
  actorUserId?: string | null;
  resourceId?: string | null;
  idempotencyKey?: string | null;
  metadata?: Record<string, unknown>;
};

export interface AuditWriter {
  append(event: AuditEventInput): Promise<void>;
}

export const AUDIT_WRITER = Symbol('AUDIT_WRITER');
