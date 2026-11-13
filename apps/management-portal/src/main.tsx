import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BarChart3,
  Bell,
  Building2,
  CreditCard,
  FileDown,
  Settings,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import './styles.css';

type Persona = 'owner' | 'finance' | 'marketingAdmin' | 'branchManager';
type NavItem = {
  label: string;
  icon: LucideIcon;
  personas: Persona[];
};

const personaLabels: Record<Persona, string> = {
  owner: 'Owner',
  finance: 'Finance',
  marketingAdmin: 'Marketing/Admin',
  branchManager: 'Branch Manager',
};

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: BarChart3, personas: ['owner', 'finance', 'branchManager'] },
  { label: 'Branches', icon: Building2, personas: ['owner', 'branchManager'] },
  { label: 'Plans', icon: Settings, personas: ['owner', 'branchManager'] },
  { label: 'Users & RBAC', icon: ShieldCheck, personas: ['owner'] },
  { label: 'Finance', icon: CreditCard, personas: ['owner', 'finance'] },
  { label: 'Reports & Exports', icon: FileDown, personas: ['owner', 'finance', 'branchManager'] },
  { label: 'Leads', icon: UsersRound, personas: ['owner', 'marketingAdmin', 'branchManager'] },
  { label: 'Notifications', icon: Bell, personas: ['owner', 'marketingAdmin'] },
];

function App() {
  const [persona, setPersona] = useState<Persona>('owner');
  const visibleItems = useMemo(
    () => navItems.filter((item) => item.personas.includes(persona)),
    [persona],
  );

  return (
    <main className="portal-shell">
      <header className="masthead">
        <div className="brand">
          <span>PF</span>
          <div>
            <strong>PulseFit</strong>
            <small>Management Portal</small>
          </div>
        </div>
        <div className="persona-menu" aria-label="Management persona">
          {(Object.keys(personaLabels) as Persona[]).map((key) => (
            <button
              key={key}
              className={persona === key ? 'active' : ''}
              onClick={() => setPersona(key)}
              type="button"
            >
              {personaLabels[key]}
            </button>
          ))}
        </div>
      </header>
      <div className="content-shell">
        <aside aria-label="Portal navigation">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <a href={`#${toAnchor(item.label)}`} key={item.label}>
                <Icon aria-hidden="true" size={19} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </aside>
        <section className="workspace">
          <div className="page-title">
            <div>
              <p>{personaLabels[persona]}</p>
              <h1>Multi-Branch Command Center</h1>
            </div>
            <span>{import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/v1'}</span>
          </div>
          <section className="scoreboard" aria-label="Business snapshot">
            <article>
              <span>Revenue MTD</span>
              <strong>₹18.4L</strong>
            </article>
            <article>
              <span>Active Members</span>
              <strong>8,942</strong>
            </article>
            <article>
              <span>Renewal Risk</span>
              <strong>126</strong>
            </article>
            <article>
              <span>Lead Conversion</span>
              <strong>31%</strong>
            </article>
          </section>
          <section className="module-grid">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              return (
                <article className="module-card" id={toAnchor(item.label)} key={item.label}>
                  <Icon aria-hidden="true" size={24} />
                  <h2>{item.label}</h2>
                  <p>{copyFor(item.label)}</p>
                </article>
              );
            })}
          </section>
        </section>
      </div>
    </main>
  );
}

function copyFor(label: string) {
  const copy: Record<string, string> = {
    Dashboard: 'Revenue, renewals, members, bookings, trainer utilization, and branch comparisons.',
    Branches: 'Central branch controls and launch-ready branch-level overrides.',
    Plans: 'Global membership plans with configurable local branch behavior.',
    'Users & RBAC': 'Role assignment, permissions, and branch-scoped access placeholders.',
    Finance: 'Payments, invoices, refunds, GST split, settlements, and exports.',
    'Reports & Exports': 'Standard reports, audit-ready exports, and reconciliation views.',
    Leads: 'Lead owner assignment, status pipeline, follow-ups, and conversion.',
    Notifications: 'Template-based customer communications with consent awareness.',
  };
  return copy[label] ?? 'Management workflow placeholder.';
}

function toAnchor(label: string) {
  return label.toLowerCase().replace(/\s+/g, '-');
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
