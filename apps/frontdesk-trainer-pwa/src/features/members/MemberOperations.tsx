import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Megaphone,
  PhoneCall,
  Search,
  ShieldAlert,
  Snowflake,
} from 'lucide-react';

type Persona = 'frontDesk' | 'trainer';
type MemberStatus = 'active' | 'renewalDue' | 'frozen' | 'grace' | 'blocked';
type EligibilityAction = 'allow' | 'collect_payment' | 'renew' | 'escalate' | 'resume_membership';

type BranchMember = {
  id: string;
  name: string;
  phone: string;
  plan: string;
  status: MemberStatus;
  homeBranch: string;
  autoRenew: boolean;
  renewalDate: string;
  freezeUntil?: string;
  graceUntil?: string;
  eligibility: {
    allowed: boolean;
    reason: string;
    resolutionPath: string;
    actions: EligibilityAction[];
  };
};

const branchMembers: BranchMember[] = [
  {
    id: 'PF-1024',
    name: 'Aarav Mehta',
    phone: '+91 98765 43210',
    plan: 'Annual Unlimited',
    status: 'active',
    homeBranch: 'Indiranagar',
    autoRenew: true,
    renewalDate: '2027-02-18',
    eligibility: {
      allowed: true,
      reason: 'Active membership covers this branch.',
      resolutionPath: 'Proceed with booking or check-in.',
      actions: ['allow'],
    },
  },
  {
    id: 'PF-1148',
    name: 'Nisha Rao',
    phone: '+91 99887 77665',
    plan: 'Quarterly Strength',
    status: 'renewalDue',
    homeBranch: 'Indiranagar',
    autoRenew: false,
    renewalDate: '2026-11-19',
    graceUntil: '2026-11-22',
    eligibility: {
      allowed: false,
      reason: 'Payment is due before this booking/check-in can continue.',
      resolutionPath: 'Collect payment at desk or send a renewal link.',
      actions: ['collect_payment', 'renew'],
    },
  },
  {
    id: 'PF-1333',
    name: 'Meera Iyer',
    phone: '+91 90000 11223',
    plan: 'Six Month Mobility',
    status: 'frozen',
    homeBranch: 'Koramangala',
    autoRenew: false,
    renewalDate: '2027-01-04',
    freezeUntil: '2026-12-05',
    eligibility: {
      allowed: false,
      reason: 'Membership is frozen through 05 Dec 2026.',
      resolutionPath: 'Resume membership or escalate for a branch manager override.',
      actions: ['resume_membership', 'escalate'],
    },
  },
  {
    id: 'PF-1412',
    name: 'Dev Malhotra',
    phone: '+91 94444 22110',
    plan: 'Weekend Studio',
    status: 'blocked',
    homeBranch: 'Whitefield',
    autoRenew: false,
    renewalDate: '2026-10-30',
    eligibility: {
      allowed: false,
      reason: 'Plan access does not include Indiranagar branch.',
      resolutionPath: 'Escalate to manager for branch transfer or deny check-in.',
      actions: ['escalate'],
    },
  },
];

const actionLabels: Record<EligibilityAction, string> = {
  allow: 'Allow check-in',
  collect_payment: 'Collect payment',
  renew: 'Send renewal link',
  escalate: 'Escalate',
  resume_membership: 'Resume membership',
};

const statusLabels: Record<MemberStatus, string> = {
  active: 'Active',
  renewalDue: 'Renewal due',
  frozen: 'Frozen',
  grace: 'Grace',
  blocked: 'Blocked',
};

export function MemberOperations({ persona }: { persona: Persona }) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(branchMembers[1].id);
  const selectedMember = branchMembers.find((member) => member.id === selectedId) ?? branchMembers[0];
  const canEscalate = persona === 'frontDesk';

  const matches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return branchMembers;
    }
    return branchMembers.filter((member) =>
      `${member.id} ${member.name} ${member.phone} ${member.plan}`.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  return (
    <section className="member-ops" id="member-lookup">
      <div className="ops-heading">
        <div>
          <p>Member lookup</p>
          <h2>Branch Eligibility Desk</h2>
        </div>
        <span>Indiranagar scope</span>
      </div>

      <label className="lookup-field">
        <Search aria-hidden="true" size={18} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Scan QR or search member"
        />
      </label>

      <div className="ops-layout">
        <div className="lookup-results" aria-label="Member search results">
          {matches.map((member) => (
            <button
              type="button"
              key={member.id}
              className={member.id === selectedMember.id ? 'lookup-row selected' : 'lookup-row'}
              onClick={() => setSelectedId(member.id)}
            >
              <span>
                <strong>{member.name}</strong>
                <small>{member.id} · {member.phone}</small>
              </span>
              <span className={`mini-status ${member.status}`}>{statusLabels[member.status]}</span>
            </button>
          ))}
        </div>

        <article className="eligibility-panel" aria-label="Booking and check-in eligibility">
          <div className="panel-title">
            {selectedMember.eligibility.allowed ? (
              <CheckCircle2 aria-hidden="true" size={26} />
            ) : (
              <ShieldAlert aria-hidden="true" size={26} />
            )}
            <div>
              <h3>{selectedMember.eligibility.allowed ? 'Eligible' : 'Ineligible'}</h3>
              <p>{selectedMember.name}</p>
            </div>
          </div>

          <dl className="ops-details">
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
              <dt>Home branch</dt>
              <dd>{selectedMember.homeBranch}</dd>
            </div>
          </dl>

          <div className="ops-flags">
            {selectedMember.freezeUntil && (
              <span>
                <Snowflake aria-hidden="true" size={16} />
                Frozen until {formatDate(selectedMember.freezeUntil)}
              </span>
            )}
            {selectedMember.graceUntil && (
              <span>
                <AlertTriangle aria-hidden="true" size={16} />
                Grace through {formatDate(selectedMember.graceUntil)}
              </span>
            )}
          </div>

          <div className={selectedMember.eligibility.allowed ? 'decision-card allowed' : 'decision-card blocked'}>
            <strong>{selectedMember.eligibility.allowed ? 'Access approved' : 'Access blocked'}</strong>
            <p>Reason: {selectedMember.eligibility.reason}</p>
            <p>Resolution: {selectedMember.eligibility.resolutionPath}</p>
          </div>

          <div className="resolution-actions">
            {selectedMember.eligibility.actions.map((action) => (
              <button
                type="button"
                key={action}
                disabled={action === 'escalate' && !canEscalate}
                className={action === 'allow' ? 'success-action' : undefined}
              >
                {iconFor(action)}
                {actionLabels[action]}
              </button>
            ))}
            <button type="button">
              <PhoneCall aria-hidden="true" size={16} />
              Call member
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}

function iconFor(action: EligibilityAction) {
  if (action === 'allow') {
    return <ClipboardCheck aria-hidden="true" size={16} />;
  }
  if (action === 'collect_payment') {
    return <CircleDollarSign aria-hidden="true" size={16} />;
  }
  if (action === 'escalate') {
    return <Megaphone aria-hidden="true" size={16} />;
  }
  return <AlertTriangle aria-hidden="true" size={16} />;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(`${value}T00:00:00`),
  );
}
