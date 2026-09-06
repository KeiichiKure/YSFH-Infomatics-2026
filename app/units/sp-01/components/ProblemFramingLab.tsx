'use client';

import { useState } from 'react';
import { getScenario, scenarios, type ScenarioId } from './designModels';
import { PrintBadge, SectionHeading } from './LessonParts';

export function ProblemFramingLab() {
  const [selected, setSelected] = useState<ScenarioId>('water-bottle');
  const [view, setView] = useState<'facts' | 'scope' | 'goal'>('facts');
  const scenario = getScenario(selected);

  return <section className="design-learning-section" id="problem">
    <SectionHeading number="01" label="問題の把握と分析" title="「忘れ物が多い」を、設計できる問題へ。" question="誰が、いつ、どこで、何を見落とすのか。観察できる事実から中核課題をつくろう。" />
    <div className="design-panel framing-lab">
      <div className="design-panel-heading"><div><p className="design-step-label">CHOOSE A SCENE</p><h3>まず、起きている場面を選ぶ</h3></div><PrintBadge number="1-1">As-Is／To-Be</PrintBadge></div>
      <div className="scene-tabs" role="group" aria-label="忘れ物の場面">
        {scenarios.map((item) => <button key={item.id} type="button" className={selected === item.id ? 'is-active' : ''} aria-pressed={selected === item.id} onClick={() => setSelected(item.id)}><span aria-hidden="true">{item.id === 'water-bottle' ? '🥤' : item.id === 'gym-clothes' ? '👕' : '▣'}</span>{item.label}</button>)}
      </div>
      <div className="latch-grid" aria-label="場面を整理する観点">
        <div><span>だれ</span><b>{scenario.who}</b></div><div><span>いつ</span><b>{scenario.when}</b></div><div><span>どこ</span><b>{scenario.where}</b></div><div><span>なに</span><b>{scenario.item}</b></div><div><span>なぜ</span><b>{scenario.cause}</b></div>
      </div>
      <div className="framing-steps" role="group" aria-label="問題を整理する3段階">
        <button type="button" className={view === 'facts' ? 'is-active' : ''} onClick={() => setView('facts')}><small>1</small>事実を見る</button>
        <button type="button" className={view === 'scope' ? 'is-active' : ''} onClick={() => setView('scope')}><small>2</small>変えられる範囲</button>
        <button type="button" className={view === 'goal' ? 'is-active' : ''} onClick={() => setView('goal')}><small>3</small>目標を決める</button>
      </div>
      <div className="framing-result" aria-live="polite">
        {view === 'facts' && <><span>観察できる As-Is</span><strong>{scenario.observable}</strong><p>「多い」「気をつけない」のような評価語だけでなく、見える行動として書くと原因を考えやすくなります。</p></>}
        {view === 'scope' && <div className="scope-compare"><div><span>ポスターで変えやすい</span><strong>○ {scenario.posterCanChange}</strong></div><div><span>ポスターだけでは変えにくい</span><strong>△ {scenario.posterCannotChange}</strong></div></div>}
        {view === 'goal' && <><span>行動で確かめる To-Be</span><strong>{scenario.target}</strong><p>「注意力を高める」ではなく、受け手が実際に取れる行動で目標を表します。</p></>}
      </div>
      <div className="core-issue"><PrintBadge number="1-2">中核課題</PrintBadge><div><span>この場面でポスターが解くこと</span><strong>{scenario.posterCanChange}</strong></div></div>
    </div>
    <aside className="design-insight"><b>構造化のコツ</b><p>情報を「場所・時間・分野・階層」などの観点で整理すると、原因の重複や優先順位が見つけやすくなります。これは教科書のLATCHや特性要因図につながる考え方です。</p></aside>
  </section>;
}

