import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditComplianceModule } from '../audit-compliance';
import {
  Member,
  Membership,
  MembershipBranchAccess,
  MembershipFreezePeriod,
  MembershipPlan,
  MembershipStatusHistory,
} from './entities';
import { MembersController } from './members.controller';
import { MembershipStatusService } from './membership-status.service';
import { MembershipService } from './membership.service';

@Module({
  imports: [
    AuditComplianceModule,
    TypeOrmModule.forFeature([
      Member,
      Membership,
      MembershipBranchAccess,
      MembershipFreezePeriod,
      MembershipPlan,
      MembershipStatusHistory,
    ]),
  ],
  controllers: [MembersController],
  providers: [MembershipService, MembershipStatusService],
  exports: [MembershipService, MembershipStatusService],
})
export class MembershipModule {}
