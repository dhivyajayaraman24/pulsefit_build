import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Edit3,
  LockKeyhole,
  Plus,
  Search,
  Snowflake,
  UserRound,
} from 'lucide-react';

type Persona = 'owner' | 'finance' | 'marketingAdmin' | 'branchManager';
type MemberStatus = 'active' | 'atRisk' | 'frozen' | 'grace' | 'blocked';
type EligibilityReason =
  | 'active_membership'
  | 'branch_ineligible'
  | 'expired_membership'
  | 'frozen_membership'
  | 'grace_membership'
  | 'unpaid_membership';

type MemberRecord = {
  id: string;
  name: string;
  phone: string;
  homeBranch: string;
  plan: string;
  renewalDate: string;
  status: MemberStatus;
  autoRenew: boolean;
  freezeUntil?: string;
  graceUntil?: string;
  eligibility: {
    allowed: boolean;
    reason: EligibilityReason;
    resolutionPath: string;
  };
};

const roleCapabilities: Record<Persona, { canCreate: boolean; canEdit: boolean; branchScope: string }> = {
  owner: { canCreate: true, canEdit: true, branchScope: 'All branches' },
  finance: { canCreate: false, canEdit: false, branchScope: 'All branches' },
  marketingAdmin: { canCreate: false, canEdit: false, branchScope: 'Campaign-visible members' },
  branchManager: { canCreate: true, canEdit: true, branchScope: 'Indiranagar branch' },
};

const members: MemberRecord[] = [
  {
    id: 'PF-1024',
    name: 'Aarav Mehta',
    phone: '+91 98765 43210',
    homeBranch: 'Indiranagar',
    plan: 'Annual Unlimited',
    renewalDate: '2027-02-18',
    status: 'active',
    autoRenew: true,
    eligibility: {
      allowed: true,
      reason: 'active_membership',
      resolutionPath: 'Allow booking and check-in.',
    },
  },
  {
    id: 'PF-1148',
    name: 'Nisha Rao',
    phone: '+91 99887 77665',
    homeBranch: 'Indiranagar',
    plan: 'Quarterly Strength',
    renewalDate: '2026-11-19',
    status: 'atRisk',
    autoRenew: false,
    graceUntil: '2026-11-22',
    eligibility: {
      allowed: false,
      reason: 'unpaid_membership',
      resolutionPath: 'Collect payment or send renewal link before booking.',
    },
  },
  {
    id: 'PF-1207',
    name: 'Kabir Shah',
    phone: '+91 91234 56780',
    homeBranch: 'HSR Layout',
    plan: 'Monthly Access',
    renewalDate: '2026-11-08',
    status: 'grace',
    autoRenew: true,
    graceUntil: '2026-11-15',
    eligibility: {
      allowed: false,
      reason: 'grace_membership',
      resolutionPath: 'Escalate to branch manager or complete renewal.',
    },
  },
  {
    id: 'PF-1333',
    name: 'Meera Iyer',
    phone: '+91 90000 11223',
    homeBranch: 'Koramangala',
    plan: 'Six Month Mobility',
    renewalDate: '2027-01-04',
    status: 'frozen',
    autoRenew: false,
    freezeUntil: '2026-12-05',
    eligibility: {
      allowed: false,
      reason: 'frozen_membership',
      resolutionPath: 'Resume membership or create a manager override.',
    },
  },
  {
    id: 'PF-1412',
    name: 'Dev Malhotra',
    phone: '+91 94444 22110',
    homeBranch: 'Whitefield',
    plan: 'Weekend Studio',
    renewalDate: '2026-10-30',
    status: 'blocked',
    autoRenew: false,
    eligibility: {
      allowed: false,
      reason: 'branch_ineligible',
      resolutionPath: 'Transfer access to this branch or deny check-in.',
    },
  },
];

const statusLabels: Record<MemberStatus, string> = {
  active: 'Active',
  atRisk: 'At risk',
  frozen: 'Frozen',
  grace: 'Grace',
  blocked: 'Blocked',
};

const reasonLabels: Record<EligibilityReason, string> = {
  active_membership: 'Active membership',
  branch_ineligible: 'Branch not included',
  expired_membership: 'Membership expired',
  frozen_membership: 'Membership frozen',
  grace_membership: 'Grace period review',
  unpaid_membership: 'Payment due',
};

type Props = {
  persona: Persona;
};

export function MembersWorkspace({ persona }: Props) {
  const [query, setQuery] = useState('');
  const [riskOnly, setRiskOnly] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(members[1].id);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | null>(null);
  const capabilities = roleCapabilities[persona];
  const selectedMember = members.find((member) => member.id === selectedMemberId) ?? members[0];

  const visibleMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return members.filter((member) => {
      const matchesQuery =
        !normalizedQuery ||
        `${member.name} ${member.phone} ${member.id} ${member.homeBranch}`
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesRisk = !riskOnly || !member.eligibility.allowed || member.status === 'atRisk';
      const matchesScope =
        persona !== 'branchManager' || member.homeBranch.toLowerCase() === 'indiranagar';
      return matchesQuery && matchesRisk && matchesScope;
    });
  }, [persona, query, riskOnly]);

  return (
    <section className="members-workspace" id="members">
      <div className="section-heading">
        <div>
          <p>Membership operations</p>
          <h2>Member Records</h2>
        </div>
        <div className="member-actions">
          <span className="scope-pill">
            <LockKeyhole aria-hidden="true" size={15} />
            {capabilities.branchScope}
          </span>
          {capabilities.canCreate && (
            <button type="button" className="primary-action" onClick={() => setDialogMode('create')}>
              <Plus aria-hidden="true" size={16} />
              New member
            </button>
          )}
        </div>
      </div>

      <div className="member-tools">
        <label className="search-field">
          <Search aria-hidden="true" size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, phone, ID, or branch"
          />
        </label>
        <label className="toggle-filter">
          <input
            type="checkbox"
            checked={riskOnly}
            onChange={(event) => setRiskOnly(event.target.checked)}
          />
          At-risk and blocked
        </label>
      </div>

      <div className="member-layout">
        <div className="member-list" aria-label="Members">
          {visibleMembers.map((member) => (
            <button
              type="button"
              key={member.id}
              className={selectedMember.id === member.id ? 'member-row selected' : 'member-row'}
              onClick={() => setSelectedMemberId(member.id)}
            >
              <span className={`status-dot ${member.status}`} aria-hidden="true" />
              <span>
                <strong>{member.name}</strong>
                <small>
                  {member.id} · {member.homeBranch}
                </small>
              </span>
              <StatusBadge status={member.status} />
            </button>
          ))}
        </div>

        <article className="member-detail" aria-label="Selected member details">
          <div className="member-detail-header">
            <div>
              <p>{selectedMember.id}</p>
              <h3>{selectedMember.name}</h3>
              <span>{selectedMember.phone}</span>
            </div>
            {capabilities.canEdit ? (
              <button type="button" className="icon-action" onClick={() => setDialogMode('edit')} aria-label="Edit member">
                <Edit3 aria-hidden="true" size={17} />
              </button>
            ) : (
              <span className="readonly-note">Read only</span>
            )}
          </div>

          <dl className="plan-grid">
            <div>
              <dt>Plan</dt>
              <dd>{selectedMember.plan}</dd>
            </div>
            <div>
              <dt>Renewal</dt>
              <dd>{formatDate(selectedMember.renewalDate)}</dd>
            </div>
            <div>
              <dt>Auto-renew</dt>
              <dd>{selectedMember.autoRenew ? 'Enabled' : 'Off'}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <StatusBadge status={selectedMember.status} />
              </dd>
            </div>
          </dl>

          <div className="indicator-strip">
            {selectedMember.freezeUntil && (
              <span>
                <Snowflake aria-hidden="true" size={16} />
                Frozen until {formatDate(selectedMember.freezeUntil)}
              </span>
            )}
            {selectedMember.graceUntil && (
              <span>
                <AlertTriangle aria-hidden="true" size={16} />
                Grace until {formatDate(selectedMember.graceUntil)}
              </span>
            )}
            {!selectedMember.freezeUntil && !selectedMember.graceUntil && (
              <span>
                <CheckCircle2 aria-hidden="true" size={16} />
                No freeze or grace flags
              </span>
            )}
          </div>

          <EligibilityBlock member={selectedMember} />
        </article>
      </div>

      {dialogMode && (
        <MemberDialog
          mode={dialogMode}
          member={dialogMode === 'edit' ? selectedMember : undefined}
          onClose={() => setDialogMode(null)}
        />
      )}
    </section>
  );
}

function StatusBadge({ status }: { status: MemberStatus }) {
  return <span className={`status-badge ${status}`}>{statusLabels[status]}</span>;
}

function EligibilityBlock({ member }: { member: MemberRecord }) {
  return (
    <div className={member.eligibility.allowed ? 'eligibility-card allowed' : 'eligibility-card blocked'}>
      {member.eligibility.allowed ? (
        <CheckCircle2 aria-hidden="true" size={22} />
      ) : (
        <Ban aria-hidden="true" size={22} />
      )}
      <div>
        <strong>{member.eligibility.allowed ? 'Eligible for booking and check-in' : 'Booking/check-in blocked'}</strong>
        <p>
          Reason: {reasonLabels[member.eligibility.reason]}. Resolution: {member.eligibility.resolutionPath}
        </p>
      </div>
    </div>
  );
}

function MemberDialog({
  mode,
  member,
  onClose,
}: {
  mode: 'create' | 'edit';
  member?: MemberRecord;
  onClose: () => void;
}) {
  return (
    <div className="dialog-backdrop" role="presentation">
      <div className="member-dialog" role="dialog" aria-modal="true" aria-labelledby="member-dialog-title">
        <div className="dialog-title">
          <UserRound aria-hidden="true" size={22} />
          <div>
            <h3 id="member-dialog-title">{mode === 'create' ? 'Create member' : 'Edit member'}</h3>
            <p>{mode === 'create' ? 'Branch-scoped profile setup' : member?.name}</p>
          </div>
        </div>
        <div className="form-grid">
          <label>
            First name
            <input defaultValue={member?.name.split(' ')[0] ?? ''} />
          </label>
          <label>
            Last name
            <input defaultValue={member?.name.split(' ').slice(1).join(' ') ?? ''} />
          </label>
          <label>
            Phone
            <input defaultValue={member?.phone ?? ''} />
          </label>
          <label>
            Home branch
            <select defaultValue={member?.homeBranch ?? 'Indiranagar'}>
              <option>Indiranagar</option>
              <option>Koramangala</option>
              <option>HSR Layout</option>
              <option>Whitefield</option>
            </select>
          </label>
          <label>
            Plan
            <select defaultValue={member?.plan ?? 'Annual Unlimited'}>
              <option>Annual Unlimited</option>
              <option>Quarterly Strength</option>
              <option>Monthly Access</option>
              <option>Weekend Studio</option>
            </select>
          </label>
          <label className="checkbox-row">
            <input type="checkbox" defaultChecked={member?.autoRenew ?? true} />
            Auto-renew enabled
          </label>
        </div>
        <div className="dialog-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="primary-action" onClick={onClose}>
            {mode === 'create' ? 'Create' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(`${value}T00:00:00`),
  );
}
