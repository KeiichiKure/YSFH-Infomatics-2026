'use client';

import { useState } from 'react';
import { getPersona, personas, type PersonaId } from './designModels';
import { PrintBadge, SectionHeading } from './LessonParts';

export function PersonaLab() {
  const [selected, setSelected] = useState<PersonaId>('rushing');
  const [message, setMessage] = useState<'weak' | 'strong'>('weak');
  const persona = getPersona(selected);

  return <section className="design-learning-section" id="persona">
    <SectionHeading number="02" label="ターゲット設定と情報の整理" title="ペルソナを、デザイン判断に使う。" question="プロフィールを飾るのではなく、コピー・掲示場所・強調情報を決めるための仮説にしよう。" />
    <div className="design-panel persona-lab">
      <div className="design-panel-heading"><div><p className="design-step-label">PERSONA → DECISION</p><h3>受け手が変わると、伝え方も変わる</h3></div><PrintBadge number="2-1">ペルソナ</PrintBadge></div>
      <div className="persona-tabs" role="group" aria-label="比較するペルソナ">
        {personas.map((item) => <button key={item.id} type="button" className={selected === item.id ? 'is-active' : ''} aria-pressed={selected === item.id} onClick={() => { setSelected(item.id); setMessage('weak'); }}>{item.label}</button>)}
      </div>
      <div className="persona-workspace">
        <article className="persona-card">
          <span>仮説としての人物像</span><h4>{persona.name}</h4>
          <dl><div><dt>場面</dt><dd>{persona.situation}</dd></div><div><dt>注意の状態</dt><dd>{persona.attention}</dd></div><div><dt>対象物</dt><dd>{persona.item}</dd></div><div><dt>見る場所</dt><dd>{persona.viewingPlace}</dd></div></dl>
        </article>
        <div className="decision-arrow" aria-hidden="true">→</div>
        <div className="message-test">
          <span>どちらが行動につながる？</span>
          <div className="message-buttons"><button type="button" className={message === 'weak' ? 'is-active' : ''} onClick={() => setMessage('weak')}><small>A</small>{persona.weakMessage}</button><button type="button" className={message === 'strong' ? 'is-active' : ''} onClick={() => setMessage('strong')}><small>B</small>{persona.headline}</button></div>
          <div className={`message-feedback ${message === 'strong' ? 'is-good' : ''}`} role="status">{message === 'strong' ? <><b>✓ 場面と行動がつながった</b><p>{persona.rationale}</p><strong>促す行動：{persona.action}</strong></> : <><b>△ 目的は分かるが、行動が見えない</b><p>「いつ・どこで・何をする」を加えると、このペルソナが迷わず動けます。</p></>}</div>
        </div>
      </div>
      <div className="persona-output"><span>このペルソナから決まる3つ</span><ol><li><b>コピー</b>{persona.headline}</li><li><b>掲示場所</b>{persona.viewingPlace}</li><li><b>最重要情報</b>{persona.action}</li></ol></div>
    </div>
    <aside className="design-caution"><b>ペルソナは「決めつけ」ではありません</b><p>実在の一人を評価するものではなく、観察した共通傾向を設計判断へつなぐ仮説です。年齢や性別だけを細かくしても、コピーや配置の理由にならなければ役立ちません。</p></aside>
  </section>;
}

