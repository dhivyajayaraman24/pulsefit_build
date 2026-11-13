import type { ReactNode } from 'react';

export type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <section aria-label={title}>
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </section>
  );
}

export type MetricTileProps = {
  label: string;
  value: string;
};

export function MetricTile({ label, value }: MetricTileProps) {
  return (
    <article aria-label={label}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
