import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { AuthenticatedSessionContext } from '../../src/common/auth';
import { AUDIT_WRITER, AuditWriter } from '../audit-compliance';
import { CreateMemberDto, UpdateMemberDto } from './dto/member.dto';
import {
  Member,
  MemberProfileStatus,
  Membership,
  MembershipDerivedStatus,
} from './entities';
import { MembershipStatusService } from './membership-status.service';

export type MembershipRequestContext = {
  branchId: string;
  correlationId: string;
  auth?: AuthenticatedSessionContext;
};

@Injectable()
export class MembershipService {
  constructor(
    @InjectRepository(Member)
    private readonly members: Repository<Member>,
    @InjectRepository(Membership)
    private readonly memberships: Repository<Membership>,
    private readonly statusService: MembershipStatusService,
    @Inject(AUDIT_WRITER)
    private readonly auditWriter: AuditWriter,
  ) {}

  async listMembers(context: MembershipRequestContext) {
    return this.members.find({
      where: { homeBranchId: context.branchId },
      order: { createdAt: 'DESC' },
    });
  }

  async createMember(input: CreateMemberDto, context: MembershipRequestContext) {
    this.assertBranchScope(input.homeBranchId, context.branchId);
    const member = this.members.create({
      email: input.email ?? null,
      firstName: input.firstName,
      homeBranchId: input.homeBranchId,
      lastName: input.lastName,
      memberNumber: await this.nextMemberNumber(input.homeBranchId),
      metadata: input.metadata ?? {},
      phone: input.phone,
      status: input.status ?? MemberProfileStatus.ACTIVE,
    });

    const saved = await this.members.save(member);
    await this.audit('member.created', saved, context);
    return saved;
  }

  async getMember(memberId: string, context: MembershipRequestContext) {
    return this.findBranchScopedMember(memberId, context.branchId);
  }

  async updateMember(memberId: string, input: UpdateMemberDto, context: MembershipRequestContext) {
    const member = await this.findBranchScopedMember(memberId, context.branchId);
    const previousStatus = member.status;

    if (input.firstName !== undefined) {
      member.firstName = input.firstName;
    }
    if (input.lastName !== undefined) {
      member.lastName = input.lastName;
    }
    if (input.email !== undefined) {
      member.email = input.email;
    }
    if (input.phone !== undefined) {
      member.phone = input.phone;
    }
    if (input.metadata !== undefined) {
      member.metadata = input.metadata;
    }
    if (input.status !== undefined) {
      member.status = input.status;
      member.deactivatedAt = input.status === MemberProfileStatus.DEACTIVATED
        ? member.deactivatedAt ?? new Date()
        : null;
    }

    const saved = await this.members.save(member);
    await this.audit(
      saved.status === MemberProfileStatus.DEACTIVATED ? 'member.deactivated' : 'member.updated',
      saved,
      context,
      { previousStatus },
    );
    return saved;
  }

  async getEligibility(memberId: string, context: MembershipRequestContext) {
    const member = await this.findBranchScopedMember(memberId, context.branchId);
    const memberships = await this.memberships.find({
      where: { memberId: member.id } as FindOptionsWhere<Membership>,
      relations: { branchAccess: true, freezePeriods: true },
      order: { endsAt: 'DESC' },
    });

    const evaluations = memberships.map((membership) => ({
      membershipId: membership.id,
      status: this.statusService.derive({
        ...membership,
        requestedBranchId: context.branchId,
      }),
    }));
    const eligible = member.status === MemberProfileStatus.ACTIVE
      && evaluations.some((evaluation) => (
        evaluation.status === MembershipDerivedStatus.ACTIVE
        || evaluation.status === MembershipDerivedStatus.GRACE
      ));

    return {
      eligible,
      memberId: member.id,
      profileStatus: member.status,
      branchId: context.branchId,
      memberships: evaluations,
    };
  }

  private async findBranchScopedMember(memberId: string, branchId: string) {
    const member = await this.members.findOne({
      where: {
        homeBranchId: branchId,
        id: memberId,
      },
    });

    if (!member) {
      throw new NotFoundException({
        code: 'MEMBER_NOT_FOUND',
        message: 'Member was not found in the requested branch scope.',
      });
    }

    return member;
  }

  private assertBranchScope(homeBranchId: string, branchId: string) {
    if (homeBranchId !== branchId) {
      throw new ForbiddenException({
        code: 'BRANCH_SCOPE_MISMATCH',
        message: 'Member home branch must match the requested branch scope.',
      });
    }
  }

  private async nextMemberNumber(branchId: string) {
    const suffix = Date.now().toString(36).toUpperCase();
    return `${branchId.slice(0, 8).toUpperCase()}-${suffix}`;
  }

  private async audit(
    action: string,
    member: Member,
    context: MembershipRequestContext,
    metadata: Record<string, unknown> = {},
  ) {
    await this.auditWriter.append({
      action,
      actorUserId: context.auth?.principal.id ?? null,
      branchId: context.branchId,
      correlationId: context.correlationId,
      metadata,
      resourceId: member.id,
      resourceType: 'member',
    });
  }
}
