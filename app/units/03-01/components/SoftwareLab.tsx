'use client';

import Image from 'next/image';
import { useState } from 'react';
import teacherMascot from '@/public/mascots/teacher-praise.png';
import { canAdvancePrint, managementFunctions, printSteps } from './systemModels';
import { Note, PrintTerms, SectionHeading } from './LessonParts';

export function SoftwareLab() {
  const [step, setStep] = useState(0);
  const [driver, setDriver] = useState(true);
  const [scene, setScene] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const current = printSteps[step];
  const blocked = step === 3 && !driver;
  const problem = managementFunctions[scene];

  return <section className="learning-section" id="software">
    <SectionHeading number="02" label="ソフトウェアとOS · 教科書 p.69" title="アプリのお願い、誰が届ける？" question="文書作成アプリは、プリンタの機種が違っても印刷できる。間で何が働くのだろう？" />
    <div className="hw-software-pair"><div><small>基本ソフトウェア</small><h3>OS</h3><p>機器や資源を管理し、アプリや人がコンピュータを使うための土台をつくる。</p></div><div><small>応用ソフトウェア</small><h3>アプリ</h3><p>文書作成・表計算・画像編集・Web閲覧など、目的に応じた作業をする。</p></div></div>
    <div className="hw-panel">
      <div className="hw-panel-heading"><div><p className="step-label">APP → OS → DEVICE</p><h3>印刷の依頼を届けよう</h3></div><span className="print-badge"><small>プリント</small><b>11・12</b></span></div>
      <ol className="hw-print-flow" aria-label="印刷の流れ">{printSteps.map((item, index) => <li key={item.title} className={(step === index ? 'is-active ' : '') + (index < step ? 'is-past' : '')} aria-current={step === index ? 'step' : undefined}><span>{index + 1}</span><b>{item.title}</b><small>{index === 3 && !driver ? 'この機器用がない' : index === 4 && step === 4 ? '印刷できた！' : item.action}</small></li>)}</ol>
      <label className="hw-switch"><input type="checkbox" checked={driver} onChange={event => { setDriver(event.target.checked); if (!event.target.checked && step > 3) setStep(3); }} /><span>このプリンタに対応するドライバがある</span></label>
      <div className={'hw-feedback ' + (blocked ? 'hw-warning' : '')} role="status"><span className="hw-status-label">{blocked ? 'ここで止まる' : `${step + 1} / 5 · ${current.title}`}</span><h4>{blocked ? '機器への橋渡しができない' : current.action}</h4><p>{blocked ? 'このモデルでは対応ドライバがないと印刷へ進めません。チェックを入れて、もう一度「次へ」を押そう。' : current.detail}</p></div>
      <div className="hw-controls" aria-label="印刷を進める"><button type="button" disabled={step === 0} onClick={() => setStep(step - 1)}>← 前へ</button><button type="button" disabled={!canAdvancePrint(step, driver)} onClick={() => setStep(step + 1)}>次へ →</button><button type="button" onClick={() => { setStep(0); setDriver(true); }}>最初に戻す</button></div>
      <p className="hw-caption">関係を単純化した模式図です。APIは窓口、ドライバはプログラムです。APIもドライバも、OSと連携して機能します。</p>
      <aside className="mascot-guide"><Image src={teacherMascot} alt="説明する先生のマスコット" /><p><b>つなぐ相手が違うんだね。</b><span>APIはソフトウェア同士。ドライバはOSと機器を橋渡しするよ。</span></p></aside>
      <Note title="つないだだけで使えるのはなぜ？"><p>標準的な機器のドライバはOSに付属していることがあり、接続すると自動的に設定されて使える場合があります。これが<strong>プラグアンドプレイ</strong>です。必要なドライバを別途導入する場合もあります。</p></Note>
      <PrintTerms numbers={[11, 12]} />
    </div>
    <div className="hw-panel">
      <div className="hw-panel-heading"><div><p className="step-label">WHAT DOES THE OS MANAGE?</p><h3>この仕事、どの管理？</h3></div><span className="print-badge"><small>プリント</small><b>13–17</b></span></div>
      <p>OSは複数の働きでアプリを支えます。次の場面で<strong>特に注目している働き</strong>を選ぼう。</p>
      <div className="hw-scenario"><p className="step-label">場面 {scene + 1} / 6</p><h4>{problem.example}</h4><div className="hw-choice-grid">{managementFunctions.map(item => <button type="button" key={item.name} aria-pressed={answer === item.name} className={answer === item.name ? 'is-selected' : ''} onClick={() => setAnswer(item.name)}>{item.name}<small>{item.number ? `プリント${item.number}` : 'プリントの番号なし欄'}</small></button>)}</div><div className="hw-answer" role="status">{answer ? <><b>{answer === problem.name ? '✓ その働きに注目しています。' : '管理する対象を、もう一度見てみよう。'}</b><p>{answer === problem.name ? problem.meaning : '実行順序・メモリ・入出力・ファイル・資源全体・利用者のどれが中心でしょう？'}</p></> : <p>管理機能を選ぶと、ヒントや説明が出ます。</p>}</div><div className="hw-controls"><button type="button" onClick={() => { setScene((scene + 5) % 6); setAnswer(null); }}>← 前の場面</button><button type="button" onClick={() => { setScene((scene + 1) % 6); setAnswer(null); }}>次の場面 →</button></div></div>
      <Note title="6つの働きを一覧で確かめる"><dl className="hw-definition-list">{managementFunctions.map(item => <div key={item.name}><dt>{item.name}</dt><dd>{item.meaning}</dd></div>)}</dl><p>これらの分類には重なりがあります。資源管理はCPUやメモリなどを広く扱い、タスク管理・記憶管理などとも関係します。</p></Note>
      <PrintTerms numbers={[13, 14, 15, 16, 17]} />
    </div>
  </section>;
}
