import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest } from './authenticated-request.interface';

export const REQUIRED_ROLES_METADATA = 'pulsefit:required_roles';

export const RequireRoles = (...roles: string[]) => SetMetadata(REQUIRED_ROLES_METADATA, roles);

export const CurrentAuth = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.auth;
  },
);

