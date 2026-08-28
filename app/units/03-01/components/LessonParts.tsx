import type { ReactNode } from 'react';
import { worksheetTerms } from './lessonData';

export function SectionHeading({ number, label, title, question }: { number: string; label: string; title: string; question: string }) {
  return <><div className="section-kicker"><span>{number}</span><p>{label}</p></div><div className="section-title-row"><h2>{title}</h2><p className="section-question">{question}</p></div></>;
}

export function PrintTerms({ numbers }: { numbers: number[] }) {
  return <aside className="hw-print"><p><b>プリントへ戻ろう</b><span>番号と重要語を確かめて、自分の言葉で説明しよう。</span></p><div>{numbers.map(number => {
    const entry = worksheetTerms.find(term => term.number === number);
    return entry ? <span className="hw-print-term" key={number}><small>プリント</small><b>{entry.number}</b><strong>{entry.term}</strong></span> : null;
  })}</div></aside>;
}

export function Note({ title, children }: { title: string; children: ReactNode }) {
  return <details className="learn-more"><summary>{title}</summary><div>{children}</div></details>;
}

export function StepControls({ step, count, onChange, label }: { step: number; count: number; onChange: (step: number) => void; label: string }) {
  return <div className="hw-controls" aria-label={label}><button type="button" onClick={() => onChange(step - 1)} disabled={step === 0}>← 前へ</button><output aria-live="polite">{step + 1} / {count}</output><button type="button" onClick={() => onChange(step + 1)} disabled={step === count - 1}>次へ →</button><button type="button" onClick={() => onChange(0)} disabled={step === 0}>最初に戻す</button></div>;
}
