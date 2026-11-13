import { ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateMembershipDomain1730000001000 } from '../db/migrations/1730000001000-CreateMembershipDomain';
import { AuditWriter } from '../modules/audit-compliance';
import { CreateMemberDto } from '../modules/membership/dto/member.dto';
import {
  Member,
  MemberProfileStatus,
  Membership,
  MembershipBranchAccess,
  MembershipDerivedStatus,
  MembershipFreezePeriod,
  MembershipPaymentStatus,
} from '../modules/membership/entities';
import { MembershipStatusService } from '../modules/membership/membership-status.service';
import { MembershipService } from '../modules/membership/membership.service';

describe('membership persistence domain', () => {
  it('migration creates member, plan, membership, access, freeze, and status history tables', async () => {
    const queries: string[] = [];
    const migration = new CreateMembershipDomain1730000001000();
    const queryRunner = {
      query: jest.fn((sql: string) => {
        queries.push(sql);
        return Promise.resolve();
      }),
    };

    await migration.up(queryRunner as never);

    const allSql = queries.join('\n');
    expect(allSql).toContain('CREATE TABLE members');
    expect(allSql).toContain('CREATE TABLE membership_plans');
    expect(allSql).toContain('CREATE TABLE memberships');
    expect(allSql).toContain('CREATE TABLE membership_branch_access');
    expect(allSql).toContain('CREATE TABLE membership_freeze_periods');
    expect(allSql).toContain('CREATE TABLE membership_status_history');
    expect(allSql).toContain('CREATE INDEX idx_members_home_branch_status');
  });
});

describe('MembershipStatusService', () => {
  const service = new MembershipStatusService();
  const now = new Date('2026-01-15T10:00:00.000Z');

  const base = {
    cancelledAt: null,
    endsAt: new Date('2026-02-01T00:00:00.000Z'),
    graceEndsAt: null,
    paymentStatus: MembershipPaymentStatus.PAID,
  };

  it('derives cancelled, branch-ineligible, frozen, unpaid, grace, expired, and active states', () => {
    expect(service.derive({ ...base, cancelledAt: now }, now)).toBe(MembershipDerivedStatus.CANCELLED);
    expect(service.derive({ ...base, branchAccess: [], requestedBranchId: 'branch-2' }, now))
      .toBe(MembershipDerivedStatus.BRANCH_INELIGIBLE);
    expect(service.derive({
      ...base,
      freezePeriods: [{
        startsAt: new Date('2026-01-01T00:00:00.000Z'),
        endsAt: new Date('2026-01-20T00:00:00.000Z'),
      } as MembershipFreezePeriod],
    }, now)).toBe(MembershipDerivedStatus.FROZEN);
    expect(service.derive({ ...base, paymentStatus: MembershipPaymentStatus.UNPAID }, now))
      .toBe(MembershipDerivedStatus.UNPAID);
    expect(service.derive({
      ...base,
      endsAt: new Date('2026-01-01T00:00:00.000Z'),
      graceEndsAt: new Date('2026-01-20T00:00:00.000Z'),
    }, now)).toBe(MembershipDerivedStatus.GRACE);
    expect(service.derive({
      ...base,
      endsAt: new Date('2026-01-01T00:00:00.000Z'),
      graceEndsAt: new Date('2026-01-10T00:00:00.000Z'),
    }, now)).toBe(MembershipDerivedStatus.EXPIRED);
    expect(service.derive({
      ...base,
      branchAccess: [{
        branchId: 'branch-1',
        isActive: true,
        startsAt: new Date('2026-01-01T00:00:00.000Z'),
        endsAt: null,
      } as MembershipBranchAccess],
      requestedBranchId: 'branch-1',
    }, now)).toBe(MembershipDerivedStatus.ACTIVE);
  });
});

describe('MembershipService member operations', () => {
  const makeMembersRepository = () => {
    const saved: Member[] = [];
    return {
      create: jest.fn((input: Partial<Member>) => input as Member),
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn((input: Member) => {
        const persisted = {
          ...input,
          id: input.id ?? `member-${saved.length + 1}`,
        } as Member;
        saved.push(persisted);
        return Promise.resolve(persisted);
      }),
      saved,
    };
  };

  const context = {
    auth: {
      principal: {
        branchScopes: ['branch-1'],
        id: 'staff-1',
        mfa: 'not_required' as const,
        roles: ['frontdesk'],
        type: 'staff' as const,
      },
      issuedAt: '2026-01-01T00:00:00.000Z',
    },
    branchId: 'branch-1',
    correlationId: 'corr-1',
  };

  it('creates branch-scoped members and records an audit event', async () => {
    const members = makeMembersRepository();
    const auditWriter: AuditWriter = { append: jest.fn().mockResolvedValue(undefined) };
    const service = new MembershipService(
      members as unknown as Repository<Member>,
      { find: jest.fn() } as unknown as Repository<Membership>,
      new MembershipStatusService(),
      auditWriter,
    );
    const input: CreateMemberDto = {
      email: 'member@example.com',
      firstName: 'Asha',
      homeBranchId: 'branch-1',
      lastName: 'Rao',
      phone: '+919876543210',
      status: MemberProfileStatus.ACTIVE,
    };

    const result = await service.createMember(input, context);

    expect(result.homeBranchId).toBe('branch-1');
    expect(result.memberNumber).toMatch(/^BRANCH-1-/);
    expect(auditWriter.append).toHaveBeenCalledWith(expect.objectContaining({
      action: 'member.created',
      actorUserId: 'staff-1',
      branchId: 'branch-1',
      correlationId: 'corr-1',
      resourceId: 'member-1',
      resourceType: 'member',
    }));
  });

  it('rejects creating a member outside the requested branch scope', async () => {
    const members = makeMembersRepository();
    const service = new MembershipService(
      members as unknown as Repository<Member>,
      { find: jest.fn() } as unknown as Repository<Membership>,
      new MembershipStatusService(),
      { append: jest.fn() },
    );

    await expect(service.createMember({
      firstName: 'Asha',
      homeBranchId: 'branch-2',
      lastName: 'Rao',
      phone: '+919876543210',
    }, context)).rejects.toBeInstanceOf(ForbiddenException);
    expect(members.save).not.toHaveBeenCalled();
  });
});
