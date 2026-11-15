import { Injectable } from '@nestjs/common';
import {
  MemberProfileStatus,
  Membership,
  MembershipBranchAccess,
  MembershipDerivedStatus,
  MembershipFreezePeriod,
  MembershipPaymentStatus,
} from './entities';

export type StatusDerivationInput = Pick<
  Membership,
  'cancelledAt' | 'endsAt' | 'graceEndsAt' | 'paymentStatus'
> & {
  branchAccess?: MembershipBranchAccess[];
  freezePeriods?: MembershipFreezePeriod[];
  requestedBranchId?: string | null;
};

export enum MembershipEligibilityAction {
  COLLECT_PAYMENT = 'collect_payment',
  ESCALATE = 'escalate',
  RENEW = 'renew',
}

export enum MembershipEligibilityReason {
  ACTIVE = 'active_membership',
  BRANCH_INELIGIBLE = 'branch_ineligible',
  CANCELLED = 'cancelled_membership',
  DEACTIVATED_PROFILE = 'deactivated_profile',
  EXPIRED = 'expired_membership',
  FROZEN = 'frozen_membership',
  GRACE = 'grace_membership',
  INACTIVE_PROFILE = 'inactive_profile',
  NO_MEMBERSHIP = 'no_membership',
  UNPAID = 'unpaid_membership',
}

export type EligibilityDecisionInput = {
  profileStatus: MemberProfileStatus;
  derivedStatuses: MembershipDerivedStatus[];
};

export type EligibilityDecision = {
  allowed: boolean;
  result: 'allowed' | 'blocked';
  reason: MembershipEligibilityReason;
  actions: MembershipEligibilityAction[];
};

@Injectable()
export class MembershipStatusService {
  derive(input: StatusDerivationInput, now = new Date()): MembershipDerivedStatus {
    if (input.cancelledAt && input.cancelledAt <= now) {
      return MembershipDerivedStatus.CANCELLED;
    }

    if (input.requestedBranchId && !this.hasBranchAccess(input, now)) {
      return MembershipDerivedStatus.BRANCH_INELIGIBLE;
    }

    if (this.isFrozen(input.freezePeriods ?? [], now)) {
      return MembershipDerivedStatus.FROZEN;
    }

    if (input.paymentStatus === MembershipPaymentStatus.UNPAID) {
      return MembershipDerivedStatus.UNPAID;
    }

    if (input.endsAt < now) {
      if (input.graceEndsAt && input.graceEndsAt >= now) {
        return MembershipDerivedStatus.GRACE;
      }
      return MembershipDerivedStatus.EXPIRED;
    }

    return MembershipDerivedStatus.ACTIVE;
  }

  decideEligibility(input: EligibilityDecisionInput): EligibilityDecision {
    if (input.profileStatus === MemberProfileStatus.DEACTIVATED) {
      return this.blocked(MembershipEligibilityReason.DEACTIVATED_PROFILE, [
        MembershipEligibilityAction.ESCALATE,
      ]);
    }

    if (input.profileStatus === MemberProfileStatus.INACTIVE) {
      return this.blocked(MembershipEligibilityReason.INACTIVE_PROFILE, [
        MembershipEligibilityAction.RENEW,
        MembershipEligibilityAction.ESCALATE,
      ]);
    }

    if (input.derivedStatuses.includes(MembershipDerivedStatus.ACTIVE)) {
      return {
        actions: [],
        allowed: true,
        reason: MembershipEligibilityReason.ACTIVE,
        result: 'allowed',
      };
    }

    if (input.derivedStatuses.includes(MembershipDerivedStatus.GRACE)) {
      return {
        actions: [MembershipEligibilityAction.RENEW],
        allowed: true,
        reason: MembershipEligibilityReason.GRACE,
        result: 'allowed',
      };
    }

    if (input.derivedStatuses.length === 0) {
      return this.blocked(MembershipEligibilityReason.NO_MEMBERSHIP, [
        MembershipEligibilityAction.RENEW,
        MembershipEligibilityAction.ESCALATE,
      ]);
    }

    const blockingStatus = this.highestPriorityBlockingStatus(input.derivedStatuses);
    return this.blocked(
      this.reasonFor(blockingStatus),
      this.actionsFor(blockingStatus),
    );
  }

  private hasBranchAccess(input: StatusDerivationInput, now: Date) {
    return (input.branchAccess ?? []).some((access) => (
      access.branchId === input.requestedBranchId
      && access.isActive
      && access.startsAt <= now
      && (!access.endsAt || access.endsAt >= now)
    ));
  }

  private isFrozen(freezePeriods: MembershipFreezePeriod[], now: Date) {
    return freezePeriods.some((period) => period.startsAt <= now && period.endsAt >= now);
  }

  private highestPriorityBlockingStatus(statuses: MembershipDerivedStatus[]) {
    const priority = [
      MembershipDerivedStatus.UNPAID,
      MembershipDerivedStatus.EXPIRED,
      MembershipDerivedStatus.CANCELLED,
      MembershipDerivedStatus.BRANCH_INELIGIBLE,
      MembershipDerivedStatus.FROZEN,
    ];
    return priority.find((status) => statuses.includes(status)) ?? statuses[0];
  }

  private reasonFor(status: MembershipDerivedStatus) {
    switch (status) {
      case MembershipDerivedStatus.BRANCH_INELIGIBLE:
        return MembershipEligibilityReason.BRANCH_INELIGIBLE;
      case MembershipDerivedStatus.CANCELLED:
        return MembershipEligibilityReason.CANCELLED;
      case MembershipDerivedStatus.EXPIRED:
        return MembershipEligibilityReason.EXPIRED;
      case MembershipDerivedStatus.FROZEN:
        return MembershipEligibilityReason.FROZEN;
      case MembershipDerivedStatus.UNPAID:
        return MembershipEligibilityReason.UNPAID;
      case MembershipDerivedStatus.GRACE:
        return MembershipEligibilityReason.GRACE;
      case MembershipDerivedStatus.ACTIVE:
      default:
        return MembershipEligibilityReason.ACTIVE;
    }
  }

  private actionsFor(status: MembershipDerivedStatus) {
    switch (status) {
      case MembershipDerivedStatus.UNPAID:
        return [
          MembershipEligibilityAction.COLLECT_PAYMENT,
          MembershipEligibilityAction.ESCALATE,
        ];
      case MembershipDerivedStatus.EXPIRED:
      case MembershipDerivedStatus.CANCELLED:
        return [
          MembershipEligibilityAction.RENEW,
          MembershipEligibilityAction.ESCALATE,
        ];
      case MembershipDerivedStatus.BRANCH_INELIGIBLE:
      case MembershipDerivedStatus.FROZEN:
      default:
        return [MembershipEligibilityAction.ESCALATE];
    }
  }

  private blocked(
    reason: MembershipEligibilityReason,
    actions: MembershipEligibilityAction[],
  ): EligibilityDecision {
    return {
      actions,
      allowed: false,
      reason,
      result: 'blocked',
    };
  }
}
