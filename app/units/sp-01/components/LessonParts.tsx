import type { ReactNode } from 'react';

export function SectionHeading({ number, label, title, question }: { number: string; label: string; title: string; question: string }) {
  return <>
    <div className="design-section-kicker"><span>{number}</span><p>{label}</p></div>
    <div className="design-section-title"><h2>{title}</h2><p>{question}</p></div>
  </>;
}

export function PrintBadge({ number, children }: { number: string; children?: ReactNode }) {
  return <span className="design-print-badge"><small>ワークシート</small><b>{number}</b>{children && <em>{children}</em>}</span>;
}

export function Note({ title, children }: { title: string; children: ReactNode }) {
  return <details className="design-note"><summary>{title}</summary><div>{children}</div></details>;
}

