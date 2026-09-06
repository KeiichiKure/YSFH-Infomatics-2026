'use client';

import { useState } from 'react';
import { SectionHeading } from './LessonParts';

const checks = [
  'A4縦・片面・フルカラーになっている',
  '端から約5mm以内に重要な文字や図を置いていない',
  '写真・写真風画像・画像生成物を使用していない',
  '無料素材は利用条件を確認し、自作または利用可能なイラストだけを使っている',
  'ペルソナ、掲示場所、促したい行動が一貫している',
  '最重要情報が3秒程度で識別できる',
  'ジャンプ率だけでなく、余白・整列・近接で優先順位を示している',
  '色だけに頼らず、文字・形・記号を併用している',
  '縮小表示と離れた位置の両方で読める',
  'ピアフィードバックを反映したか、理由とともに説明できる',
] as const;

export function PosterChecklist() {
  const [checked, setChecked] = useState<boolean[]>(checks.map(() => false));
  const count = checked.filter(Boolean).length;
  const complete = count === checks.length;
  return <section className="design-learning-section production-check" id="production-check">
    <SectionHeading number="05" label="制作・改善" title="提出前に、条件と伝え方を点検しよう。" question="4〜6時間目は、制作画面の横でこのチェックを使えます。チェック状態は保存されません。" />
    <div className={`design-panel checklist-panel ${complete ? 'is-complete' : ''}`}>
      <div className="checklist-heading"><div><p className="design-step-label">POSTER READINESS</p><h3>{complete ? '10項目クリア！' : '制作条件と設計判断'}</h3></div><span><b>{count}</b> / {checks.length}</span></div>
      <div className="check-progress" aria-hidden="true"><i style={{ width: `${count / checks.length * 100}%` }} /></div>
      <div className="checklist-items">{checks.map((label, index) => <label key={label} className={checked[index] ? 'is-checked' : ''}><input type="checkbox" checked={checked[index]} onChange={(event) => setChecked((previous) => previous.map((value, position) => position === index ? event.target.checked : value))} /><span aria-hidden="true">{checked[index] ? '✓' : index + 1}</span><b>{label}</b></label>)}</div>
      <div className="checklist-status" role="status">{complete ? <><b>✓ 制作条件の確認が完了</b><p>最後に、ペルソナへ実際に見せたつもりで「最初に見た場所」「覚えた内容」「取る行動」を説明しましょう。</p></> : <><b>あと {checks.length - count} 項目</b><p>チェックするだけでなく、ポスター上のどこで満たしているか指差して確認しましょう。</p></>}</div>
      <button type="button" className="design-reset" onClick={() => setChecked(checks.map(() => false))}>チェックをリセット</button>
    </div>
  </section>;
}
