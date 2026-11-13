import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CurrentAuth } from '../../src/common/auth';
import { CORRELATION_ID_HEADER } from '../../src/common/correlation-id.constants';
import {
  AuthenticatedContextGuard,
  BranchScopeGuard,
  BRANCH_SCOPE_HEADER,
  RbacGuard,
} from '../../src/common/guards';
import { AuthenticatedSessionContext } from '../../src/common/auth';
import { RequireRoles } from '../../src/common/auth/auth.decorators';
import { CreateMemberDto, UpdateMemberDto } from './dto/member.dto';
import { MembershipService } from './membership.service';

@ApiTags('members')
@ApiBearerAuth()
@Controller('members')
@UseGuards(AuthenticatedContextGuard, BranchScopeGuard, RbacGuard)
@RequireRoles('admin', 'manager', 'frontdesk')
export class MembersController {
  constructor(private readonly membershipService: MembershipService) {}

  @Get()
  @ApiOperation({ summary: 'List member profiles visible in the requested branch scope.' })
  listMembers(
    @Headers(BRANCH_SCOPE_HEADER) branchId: string,
    @Headers(CORRELATION_ID_HEADER) correlationId: string,
    @CurrentAuth() auth: AuthenticatedSessionContext,
  ) {
    return this.membershipService.listMembers({ auth, branchId, correlationId });
  }

  @Post()
  @ApiOperation({ summary: 'Create a member profile in the requested branch scope.' })
  createMember(
    @Body() input: CreateMemberDto,
    @Headers(BRANCH_SCOPE_HEADER) branchId: string,
    @Headers(CORRELATION_ID_HEADER) correlationId: string,
    @CurrentAuth() auth: AuthenticatedSessionContext,
  ) {
    return this.membershipService.createMember(input, { auth, branchId, correlationId });
  }

  @Get(':memberId')
  @ApiParam({ name: 'memberId', format: 'uuid' })
  @ApiOperation({ summary: 'Get a member profile in the requested branch scope.' })
  getMember(
    @Param('memberId') memberId: string,
    @Headers(BRANCH_SCOPE_HEADER) branchId: string,
    @Headers(CORRELATION_ID_HEADER) correlationId: string,
    @CurrentAuth() auth: AuthenticatedSessionContext,
  ) {
    return this.membershipService.getMember(memberId, { auth, branchId, correlationId });
  }

  @Patch(':memberId')
  @ApiParam({ name: 'memberId', format: 'uuid' })
  @ApiOperation({ summary: 'Update or deactivate a member profile in the requested branch scope.' })
  updateMember(
    @Param('memberId') memberId: string,
    @Body() input: UpdateMemberDto,
    @Headers(BRANCH_SCOPE_HEADER) branchId: string,
    @Headers(CORRELATION_ID_HEADER) correlationId: string,
    @CurrentAuth() auth: AuthenticatedSessionContext,
  ) {
    return this.membershipService.updateMember(memberId, input, { auth, branchId, correlationId });
  }

  @Get(':memberId/eligibility')
  @ApiParam({ name: 'memberId', format: 'uuid' })
  @ApiOperation({ summary: 'Derive member access eligibility for the requested branch scope.' })
  getEligibility(
    @Param('memberId') memberId: string,
    @Headers(BRANCH_SCOPE_HEADER) branchId: string,
    @Headers(CORRELATION_ID_HEADER) correlationId: string,
    @CurrentAuth() auth: AuthenticatedSessionContext,
  ) {
    return this.membershipService.getEligibility(memberId, { auth, branchId, correlationId });
  }
}
