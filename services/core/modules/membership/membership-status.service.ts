import { Injectable } from '@nestjs/common';
import {
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
}
