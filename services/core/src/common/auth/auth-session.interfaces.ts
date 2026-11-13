export type AuthPrincipalType = 'member' | 'staff' | 'system';

export type MfaRequirementState = 'not_required' | 'required' | 'satisfied';

export interface AuthenticatedPrincipal {
  id: string;
  type: AuthPrincipalType;
  roles: string[];
  branchScopes: string[];
  mfa: MfaRequirementState;
}

export interface MemberOtpSessionPlaceholder {
  flow: 'member_otp';
  memberId: string;
  phoneNumberRef: string;
  otpChallengeId: string;
  mfa: MfaRequirementState;
}

export interface StaffPasswordSessionPlaceholder {
  flow: 'staff_password';
  staffUserId: string;
  username: string;
  passwordCredentialRef: string;
  mfa: MfaRequirementState;
}

export interface AuthenticatedSessionContext {
  principal: AuthenticatedPrincipal;
  sessionId?: string;
  issuedAt?: string;
  expiresAt?: string;
}

