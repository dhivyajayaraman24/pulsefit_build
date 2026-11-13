import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common/interfaces';
import { Reflector } from '@nestjs/core';
import { ObjectLiteral, Repository } from 'typeorm';
import { AuditWriter } from '../../modules/audit-compliance';
import {
  Member,
  MemberProfileStatus,
  Membership,
  MembershipBranchAccess,
  MembershipDerivedStatus,
  MembershipFreezePeriod,
  MembershipPaymentStatus,
} from '../../modules/membership/entities';
import {
  MembershipEligibilityAction,
  MembershipEligibilityReason,
  MembershipStatusService,
} from '../../modules/membership/membership-status.service';
import { MembershipService } from '../../modules/membership/membership.service';
import { REQUIRED_ROLES_METADATA } from '../../src/common/auth';
import { AuthenticatedRequest } from '../../src/common/auth/authenticated-request.interface';
import {
  BranchScopeGuard,
  BRANCH_SCOPE_HEADER,
  RbacGuard,
} from '../../src/common/guards';

describe('MembershipStatusService branch-aware derivation', () => {
  const service = new MembershipStatusService();
  const now = new Date('2026-11-13T12:00:00.000Z');
  const activeWindow = {
    cancelledAt: null,
    endsAt: new Date('2026-12-01T00:00:00.000Z'),
    graceEndsAt: null,
    paymentStatus: MembershipPaymentStatus.PAID,
  };

  it.each([
    {
      expected: MembershipDerivedStatus.ACTIVE,
      input: activeWindow,
      name: 'active',
    },
    {
      expected: MembershipDerivedStatus.GRACE,
      input: {
        ...activeWindow,
        endsAt: new Date('2026-11-01T00:00:00.000Z'),
        graceEndsAt: new Date('2026-11-20T00:00:00.000Z'),
      },
      name: 'grace',
    },
    {
      expected: MembershipDerivedStatus.FROZEN,
      input: {
        ...activeWindow,
        freezePeriods: [
          {
            endsAt: new Date('2026-11-20T00:00:00.000Z'),
            startsAt: new Date('2026-11-01T00:00:00.000Z'),
          } as MembershipFreezePeriod,
        ],
      },
      name: 'frozen',
    },
    {
      expected: MembershipDerivedStatus.EXPIRED,
      input: {
        ...activeWindow,
        endsAt: new Date('2026-11-01T00:00:00.000Z'),
        graceEndsAt: new Date('2026-11-10T00:00:00.000Z'),
      },
      name: 'expired',
    },
    {
      expected: MembershipDerivedStatus.CANCELLED,
      input: {
        ...activeWindow,
        cancelledAt: new Date('2026-11-10T00:00:00.000Z'),
      },
      name: 'cancelled',
    },
    {
      expected: MembershipDerivedStatus.UNPAID,
      input: {
        ...activeWindow,
        paymentStatus: MembershipPaymentStatus.UNPAID,
      },
      name: 'unpaid',
    },
    {
      expected: MembershipDerivedStatus.BRANCH_INELIGIBLE,
      input: {
        ...activeWindow,
        branchAccess: [
          {
            branchId: 'branch-2',
            endsAt: null,
            isActive: true,
            startsAt: new Date('2026-01-01T00:00:00.000Z'),
          } as MembershipBranchAccess,
        ],
        requestedBranchId: 'branch-1',
      },
      name: 'branch-ineligible',
    },
  ])('derives $name membership status', ({ expected, input }) => {
    expect(service.derive(input, now)).toBe(expected);
  });

  it('returns visible eligibility reasons and role actions for blocked memberships', () => {
    expect(service.decideEligibility({
      derivedStatuses: [MembershipDerivedStatus.BRANCH_INELIGIBLE],
      profileStatus: MemberProfileStatus.ACTIVE,
    })).toEqual({
      actions: [MembershipEligibilityAction.ESCALATE],
      allowed: false,
      reason: MembershipEligibilityReason.BRANCH_INELIGIBLE,
      result: 'blocked',
    });

    expect(service.decideEligibility({
      derivedStatuses: [MembershipDerivedStatus.EXPIRED],
      profileStatus: MemberProfileStatus.ACTIVE,
    })).toEqual({
      actions: [
        MembershipEligibilityAction.RENEW,
        MembershipEligibilityAction.ESCALATE,
      ],
      allowed: false,
      reason: MembershipEligibilityReason.EXPIRED,
      result: 'blocked',
    });
  });
});

describe('membership API branch scope and RBAC authorization', () => {
  const auth = {
    principal: {
      branchScopes: ['branch-1'],
      id: 'staff-1',
      mfa: 'not_required' as const,
      roles: ['frontdesk'],
      type: 'staff' as const,
    },
  };

  it('denies requests when the requested branch is outside the authenticated scope', () => {
    const guard = new BranchScopeGuard();
    const context = executionContext({
      auth,
      headers: {
        [BRANCH_SCOPE_HEADER]: 'branch-2',
      },
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('denies requests when the principal lacks an allowed membership role', () => {
    const reflector = {
      getAllAndOverride: jest.fn((key: string) => (
        key === REQUIRED_ROLES_METADATA ? ['admin', 'manager', 'frontdesk'] : undefined
      )),
    } as Pick<Reflector, 'getAllAndOverride'>;
    const guard = new RbacGuard(reflector as Reflector);
    const context = executionContext({
      auth: {
        principal: {
          ...auth.principal,
          roles: ['trainer'],
        },
      },
      headers: {
        [BRANCH_SCOPE_HEADER]: 'branch-1',
      },
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});

describe('MembershipService branch-scoped access and audit records', () => {
  const context = {
    auth: {
      principal: {
        branchScopes: ['branch-1'],
        id: 'staff-1',
        mfa: 'not_required' as const,
        roles: ['frontdesk'],
        type: 'staff' as const,
      },
    },
    branchId: 'branch-1',
    correlationId: 'corr-1',
  };

  it('does not return records outside the requested branch scope', async () => {
    const members = repository<Member>({
      findOne: jest.fn().mockResolvedValue(null),
    });
    const service = new MembershipService(
      members,
      repository<Membership>(),
      new MembershipStatusService(),
      { append: jest.fn() },
    );

    await expect(service.getMember('member-in-branch-2', context))
      .rejects.toBeInstanceOf(NotFoundException);
    expect(members.findOne).toHaveBeenCalledWith({
      where: {
        homeBranchId: 'branch-1',
        id: 'member-in-branch-2',
      },
    });
  });

  it('records an immutable audit event when a membership profile changes', async () => {
    const member = {
      deactivatedAt: null,
      email: 'nisha@example.com',
      firstName: 'Nisha',
      homeBranchId: 'branch-1',
      id: 'member-1',
      lastName: 'Rao',
      metadata: {},
      phone: '+919988777665',
      status: MemberProfileStatus.ACTIVE,
    } as Member;
    const members = repository<Member>({
      findOne: jest.fn().mockResolvedValue(member),
      save: jest.fn(async (input: Member) => input),
    });
    const auditWriter: AuditWriter = {
      append: jest.fn().mockResolvedValue(undefined),
    };
    const service = new MembershipService(
      members,
      repository<Membership>(),
      new MembershipStatusService(),
      auditWriter,
    );

    await service.updateMember(
      'member-1',
      { status: MemberProfileStatus.DEACTIVATED },
      context,
    );

    expect(auditWriter.append).toHaveBeenCalledWith({
      action: 'member.deactivated',
      actorUserId: 'staff-1',
      branchId: 'branch-1',
      correlationId: 'corr-1',
      metadata: {
        previousStatus: MemberProfileStatus.ACTIVE,
      },
      resourceId: 'member-1',
      resourceType: 'member',
    });
  });
});

function executionContext(request: Partial<AuthenticatedRequest>): ExecutionContext {
  return {
    getClass: jest.fn(),
    getHandler: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

function repository<T extends ObjectLiteral>(overrides: Record<string, unknown> = {}): Repository<T> {
  return overrides as unknown as Repository<T>;
}
