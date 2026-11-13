import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AlertTriangle,
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  Dumbbell,
  QrCode,
  Search,
  UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import './styles.css';

type Persona = 'frontDesk' | 'trainer';
type NavItem = {
  label: string;
  icon: LucideIcon;
  personas: Persona[];
};

const personaLabels: Record<Persona, string> = {
  frontDesk: 'Front Desk',
  trainer: 'Trainer',
};

const navItems: NavItem[] = [
  { label: 'Check-In', icon: QrCode, personas: ['frontDesk'] },
  { label: 'Member Lookup', icon: Search, personas: ['frontDesk'] },
  { label: 'Assisted Renewals', icon: CreditCard, personas: ['frontDesk'] },
  { label: 'Exception Queue', icon: AlertTriangle, personas: ['frontDesk'] },
  { label: 'Schedule', icon: CalendarDays, personas: ['frontDesk', 'trainer'] },
  { label: 'Attendance', icon: ClipboardCheck, personas: ['frontDesk', 'trainer'] },
  { label: 'Sessions', icon: Dumbbell, personas: ['trainer'] },
  { label: 'Payouts', icon: UserRound, personas: ['trainer'] },
];

function App() {
  const [persona, setPersona] = useState<Persona>('frontDesk');
  const visibleItems = useMemo(
    () => navItems.filter((item) => item.personas.includes(persona)),
    [persona],
  );

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand">
          <span className="brand-mark">PF</span>
          <div>
            <strong>PulseFit</strong>
            <span>Branch Operations</span>
          </div>
        </div>
        <div className="persona-switch" role="group" aria-label="Persona">
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
        <nav>
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <a href={`#${toAnchor(item.label)}`} key={item.label}>
                <Icon aria-hidden="true" size={20} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </aside>
      <section className="workspace">
        <header className="topbar">
          <div>
            <p>{personaLabels[persona]}</p>
            <h1>Today at Indiranagar Branch</h1>
          </div>
          <span className="status-pill">API: {import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/v1'}</span>
        </header>
        <section className="metrics" aria-label="Operational snapshot">
          <article>
            <span>Check-ins</span>
            <strong>42</strong>
          </article>
          <article>
            <span>Renewals Due</span>
            <strong>18</strong>
          </article>
          <article>
            <span>Classes</span>
            <strong>9</strong>
          </article>
        </section>
        <section className="work-grid">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <article className="workflow-card" key={item.label} id={toAnchor(item.label)}>
                <Icon aria-hidden="true" size={24} />
                <div>
                  <h2>{item.label}</h2>
                  <p>{copyFor(item.label)}</p>
                </div>
              </article>
            );
          })}
        </section>
      </section>
    </main>
  );
}

function copyFor(label: string) {
  const copy: Record<string, string> = {
    'Check-In': 'QR scanning, eligibility feedback, and offline-tolerant sync placeholder.',
    'Member Lookup': 'Fast branch-scoped member search and membership status review.',
    'Assisted Renewals': 'Staff-led renewal and payment link workflow placeholder.',
    'Exception Queue': 'Failed renewals, payment issues, and check-in exceptions.',
    Schedule: 'Branch class calendar and trainer assignment overview.',
    Attendance: 'Class attendance capture and no-show tracking.',
    Sessions: 'Assigned trainer sessions for the day.',
    Payouts: 'Commission and payout visibility placeholder.',
  };
  return copy[label] ?? 'Workflow placeholder.';
}

function toAnchor(label: string) {
  return label.toLowerCase().replace(/\s+/g, '-');
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
