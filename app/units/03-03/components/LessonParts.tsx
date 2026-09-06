import Image from 'next/image';
import type { ReactNode } from 'react';
import celebratingMascot from '@/public/mascots/student-celebrating.png';

export function SectionHeading({ number, label, title, question }: { number: string; label: string; title: string; question: string }) {
  return <><div className="logic-section-kicker"><span>{number}</span><p>{label}</p></div><div className="logic-section-title"><h2>{title}</h2><p>{question}</p></div></>;
}
export function PrintBadge({ numbers, kind = '空欄' }: { numbers: string; kind?: '空欄' | '表' }) {
  return <span className="logic-print-badge"><small>プリント{kind}</small><b>{numbers}</b></span>;
}

export function Note({ title, children }: { title: string; children: ReactNode }) {
  return <details className="logic-note"><summary>{title}</summary><div>{children}</div></details>;
}

export function PracticeCelebration({ message }: { message: string }) {
  return <div className="logic-celebration" role="status"><span aria-hidden="true">✓</span><div><strong>全問正解！</strong><p>{message}</p></div><Image src={celebratingMascot} alt="両手を上げて喜ぶ生徒のマスコット" /></div>;
}
