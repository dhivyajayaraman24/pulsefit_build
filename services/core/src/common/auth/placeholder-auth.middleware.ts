import { Injectable, NestMiddleware } from '@nestjs/common';
import { AuthenticatedRequest } from './authenticated-request.interface';
import { AuthPrincipalType, MfaRequirementState } from './auth-session.interfaces';
import { loadSecurityConfig } from './security-secrets.config';

type WritableResponse = unknown;

const USER_ID_HEADER = 'x-authenticated-user-id';
const PRINCIPAL_TYPE_HEADER = 'x-authenticated-principal-type';
const ROLES_HEADER = 'x-authenticated-roles';
const BRANCH_SCOPES_HEADER = 'x-authenticated-branch-scopes';
const MFA_HEADER = 'x-authenticated-mfa';
const SESSION_ID_HEADER = 'x-authenticated-session-id';

@Injectable()
export class PlaceholderAuthMiddleware implements NestMiddleware {
  use(request: AuthenticatedRequest, _response: WritableResponse, next: () => void) {
    if (!loadSecurityConfig().placeholderAuthHeadersEnabled) {
      next();
      return;
    }

    const userId = this.header(request, USER_ID_HEADER);
    if (!userId) {
      next();
      return;
    }

    request.auth = {
      principal: {
        id: userId,
        type: this.principalType(this.header(request, PRINCIPAL_TYPE_HEADER)),
        roles: this.csv(request, ROLES_HEADER),
        branchScopes: this.csv(request, BRANCH_SCOPES_HEADER),
        mfa: this.mfaState(this.header(request, MFA_HEADER)),
      },
      sessionId: this.header(request, SESSION_ID_HEADER),
      issuedAt: new Date().toISOString(),
    };

    next();
  }

  private header(request: AuthenticatedRequest, name: string) {
    const value = request.headers[name];
    return Array.isArray(value) ? value[0]?.trim() : value?.trim();
  }

  private csv(request: AuthenticatedRequest, name: string) {
    return (this.header(request, name) ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  }

  private principalType(value?: string): AuthPrincipalType {
    if (value === 'member' || value === 'system') {
      return value;
    }
    return 'staff';
  }

  private mfaState(value?: string): MfaRequirementState {
    if (value === 'required' || value === 'satisfied') {
      return value;
    }
    return 'not_required';
  }
}

