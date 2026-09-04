import Image from 'next/image';
import type { ReactNode } from 'react';
import celebratingMascot from '@/public/mascots/student-celebrating.png';

export function SectionHeading({ number, label, title, question }: { number: string; label: string; title: string; question: string }) {
  return <><div className="section-kicker"><span>{number}</span><p>{label}</p></div><div className="section-title-row"><h2>{title}</h2><p className="section-question">{question}</p></div></>;
}

export function PrintBadge({ kind = '空欄', numbers }: { kind?: '空欄' | '練習'; numbers: string }) {
  return <span className="print-badge"><small>プリント{kind}</small><b>{numbers}</b></span>;
}

export function Note({ title, children }: { title: string; children: ReactNode }) {
  return <details className="learn-more"><summary>{title}</summary><div>{children}</div></details>;
}

export function PracticeCelebration({ message }: { message: string }) {
  return <div className="practice-celebration" role="status">
    <div className="mission-confetti" aria-hidden="true">{Array.from({ length: 14 }, (_, index) => <i key={index} />)}</div>
    <span aria-hidden="true">🎉</span><div><strong>全問正解！</strong><p>{message}</p></div>
    <Image src={celebratingMascot} alt="両手を上げて全問正解を喜ぶ生徒のマスコット" />
  </div>;
}
