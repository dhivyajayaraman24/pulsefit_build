import { CorrelatedRequest } from '../correlation-id.middleware';
import { AuthenticatedSessionContext } from './auth-session.interfaces';

export interface AuthenticatedRequest extends CorrelatedRequest {
  auth?: AuthenticatedSessionContext;
}

