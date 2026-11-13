import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthenticatedRequest } from '../auth';

export const BRANCH_SCOPE_HEADER = 'x-branch-id';

@Injectable()
export class BranchScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const branchId = this.header(request, BRANCH_SCOPE_HEADER);
    const branchScopes = request.auth?.principal.branchScopes ?? [];

    if (!branchId || !branchScopes.includes(branchId)) {
      throw new ForbiddenException({
        code: 'BRANCH_SCOPE_REQUIRED',
        message: 'Authenticated context must include the requested branch scope.',
      });
    }

    return true;
  }

  private header(request: AuthenticatedRequest, name: string) {
    const value = request.headers[name];
    return Array.isArray(value) ? value[0]?.trim() : value?.trim();
  }
}

