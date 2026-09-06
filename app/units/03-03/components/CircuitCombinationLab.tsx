'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import arithmeticMascot from '@/public/images/03-01-mascot-arithmetic.png';
import { GateSymbol, NandConstructionDiagram } from './CircuitVisuals';
import { Note, PrintBadge, SectionHeading } from './LessonParts';
import { evaluateGate, evaluateNandConstruction, gateInfo, truthRows, type Bit, type NandTarget } from './logicModels';

const targets: { id: NandTarget; detail: string }[] = [
  { id: 'NOT', detail: 'NAND 1個' },
  { id: 'AND', detail: 'NAND 2個' },
  { id: 'OR', detail: 'NAND 3個' },
];

export function CircuitCombinationLab() {
  const [target, setTarget] = useState<NandTarget>('NOT');
  const [a, setA] = useState<Bit>(0);
  const [b, setB] = useState<Bit>(1);
  const construction = useMemo(() => evaluateNandConstruction(target, a, b), [target, a, b]);
  const rows = truthRows(target);

  return <section className="logic-learning-section" id="combinations">
    <SectionHeading number="02" label="論理回路の組み合わせ · 教科書 p.78" title="NANDひとつで、3つの仕事を引き受ける？" question="入力を切り替え、NANDだけの回路がNOT・AND・ORと同じ出力になることを試そう。" />
    <aside className="nand-foreshadow-payoff"><Image src={arithmeticMascot} alt="演算装置くん" /><div className="speech-balloon"><span>伏線回収 · 演算装置くん</span><h3>NANDだけ、たくさん置けばよくない？</h3><p>部品の種類を減らせば、同じ回路を使い回せる。NOTもANDもORも、<strong>NANDだけで作れる</strong>んだ。ぼく、同じ得意技だけで済ませたいんだよね。</p></div></aside>
    <div className="logic-panel nand-builder">
      <div className="logic-panel-heading"><div><p className="logic-step-label">BUILD WITH NAND ONLY</p><h3>NAND作戦を回路図で試そう</h3></div><PrintBadge numbers="33" /></div>
      <p className="logic-panel-lead">作りたい回路を選び、入力A・Bを切り替えてください。赤い導線は1、紺の導線は0を表します。</p>
      <div className="nand-targets">{targets.map(item => <button type="button" key={item.id} className={target === item.id ? 'is-selected' : ''} aria-pressed={target === item.id} onClick={() => setTarget(item.id)}><GateSymbol gate={item.id} /><b>{item.id}・{gateInfo[item.id].japanese}</b><small>{item.detail}で作る</small></button>)}</div>
      <div className="interactive-circuit-stage nand-interactive-stage"><div className="nand-input-row"><button type="button" className={a ? 'is-on' : ''} aria-pressed={a === 1} onClick={() => setA(a ? 0 : 1)}><span>入力A</span><b>A = {a}</b><small>ここを押して切り替える</small></button>{target !== 'NOT' && <button type="button" className={b ? 'is-on' : ''} aria-pressed={b === 1} onClick={() => setB(b ? 0 : 1)}><span>入力B</span><b>B = {b}</b><small>ここを押して切り替える</small></button>}</div><div className="circuit-scroll"><NandConstructionDiagram target={target} a={a} b={b} output={construction.output} first={construction.first} second={construction.second} /></div></div>
      <div className="fixed-nand-dialogue"><Image src={arithmeticMascot} alt="演算装置くん" /><p className="speech-balloon">入力を変えても、左右のLはいつも同じ。<strong>NANDだけで{target}ができた</strong>ってことだね。部品を使い回せて楽だなあ。</p></div>
      <div className="truth-table-wrap nand-truth"><h4>{target}と同じになるか、全入力で確認</h4><table><thead><tr><th>入力 A</th>{target !== 'NOT' && <th>入力 B</th>}<th>NANDだけの出力</th><th>{target}の出力</th></tr></thead><tbody>{rows.map(row => { const made = evaluateNandConstruction(target, row.a, row.b ?? 0).output; const current = row.a === a && (target === 'NOT' || row.b === b); return <tr key={`${row.a}-${row.b ?? 'n'}`} className={current ? 'is-current' : ''}><td>{row.a}</td>{target !== 'NOT' && <td>{row.b}</td>}<td>{made}</td><td>{row.output}</td></tr>; })}</tbody></table></div>
      <p className="technical-note">回路図は学習用に信号の流れを整理したものです。実際の回路でも、それぞれの導線は入力に応じて0または1になります。</p>
    </div>
    <Note title="発展：ド・モルガンの法則を、4行で確かめる">
      <p><code>NOT (A AND B)</code> と <code>NOT A OR NOT B</code> を比べます。式の見た目は違っても、4通りの出力はすべて同じです。</p>
      <div className="demorgan-table"><table><thead><tr><th>A</th><th>B</th><th>NOT(A AND B)</th><th>NOT A OR NOT B</th></tr></thead><tbody>{([0, 1] as const).flatMap(left => ([0, 1] as const).map(right => { const first = evaluateGate('NAND', left, right); const second = evaluateGate('OR', evaluateGate('NOT', left), evaluateGate('NOT', right)); return <tr key={`${left}-${right}`}><td>{left}</td><td>{right}</td><td>{first}</td><td>{second} <b>一致</b></td></tr>; }))}</tbody></table></div>
    </Note>
  </section>;
}
