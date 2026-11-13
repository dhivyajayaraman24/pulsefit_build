import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentAuth, RequireRoles } from './auth.decorators';
import { AuthenticatedSessionContext } from './auth-session.interfaces';
import { AuthenticatedContextGuard, BranchScopeGuard, BRANCH_SCOPE_HEADER, RbacGuard } from '../guards';

@ApiTags('security')
@ApiBearerAuth()
@ApiHeader({
  name: BRANCH_SCOPE_HEADER,
  required: true,
  description: 'Branch being accessed by the protected operation.',
})
@Controller('security/sample-protected')
@UseGuards(AuthenticatedContextGuard, BranchScopeGuard, RbacGuard)
export class SecurityDefaultsController {
  @Get()
  @RequireRoles('staff')
  @ApiOkResponse({
    schema: {
      type: 'object',
      required: ['status', 'principalId', 'branchScopes'],
      properties: {
        status: { type: 'string', example: 'authorized' },
        principalId: { type: 'string', example: 'staff-123' },
        branchScopes: {
          type: 'array',
          items: { type: 'string' },
          example: ['branch-1'],
        },
      },
    },
  })
  sample(@CurrentAuth() auth: AuthenticatedSessionContext) {
    return {
      status: 'authorized',
      principalId: auth.principal.id,
      branchScopes: auth.principal.branchScopes,
    };
  }
}

