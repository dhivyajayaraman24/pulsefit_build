import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedRequest, REQUIRED_ROLES_METADATA } from '../auth';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      REQUIRED_ROLES_METADATA,
      [context.getHandler(), context.getClass()],
    ) ?? [];

    if (requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const actualRoles = request.auth?.principal.roles ?? [];
    const hasRole = requiredRoles.some((role) => actualRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException({
        code: 'ROLE_REQUIRED',
        message: 'Authenticated principal does not have a required role.',
      });
    }

    return true;
  }
}

