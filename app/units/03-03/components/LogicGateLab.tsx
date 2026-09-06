'use client';

import { useState } from 'react';
import { GateDiagram } from './GateDiagram';
import { GateSymbol, VennDiagram } from './CircuitVisuals';
import { PracticeCelebration, PrintBadge, SectionHeading } from './LessonParts';
import { evaluateGate, gateInfo, gateOrder, truthRows, type Bit, type GateType } from './logicModels';

const doorRows = ([0, 1] as const).flatMap(person => ([0, 1] as const).map(remote => ({ person, remote, output: evaluateGate('OR', person, remote) })));

function PersonIllustration({ active, compact = false }: { active: boolean; compact?: boolean }) {
  return <svg className={`door-state-illustration person ${active ? 'is-active' : ''} ${compact ? 'is-compact' : ''}`} viewBox="0 0 120 92" role="img" aria-label={active ? '人が近づいているイラスト' : '人がいないイラスト'}>
    <path className="door-sensor-wave" d="M77 18c16 8 16 36 0 44M86 10c24 13 24 52 0 65" />
    {active ? <g className="door-person"><circle cx="45" cy="22" r="12" /><path d="M45 35v27M28 46l17-9 17 9M45 61 31 83M45 61l18 22" /></g> : <><path className="door-empty-mark" d="M31 21h31v48H31z" /><path className="door-empty-dash" d="M23 78h49" /></>}
    <circle className="door-sensor" cx="104" cy="45" r="7" />
  </svg>;
}

function RemoteIllustration({ active, compact = false }: { active: boolean; compact?: boolean }) {
  return <svg className={`door-state-illustration remote ${active ? 'is-active' : ''} ${compact ? 'is-compact' : ''}`} viewBox="0 0 120 92" role="img" aria-label={active ? 'リモコンのボタンを押しているイラスト' : 'リモコンのボタンを押していないイラスト'}>
    <rect className="remote-body" x="39" y="9" width="42" height="73" rx="12" />
    <circle className="remote-button" cx="60" cy="32" r="10" />
    <circle cx="51" cy="58" r="4" /><circle cx="69" cy="58" r="4" />
    {active ? <><path className="remote-finger" d="M15 44c15 0 20-12 34-12" /><path className="remote-wave" d="M89 24c10 5 10 16 0 21M96 17c18 9 18 28 0 37" /></> : <path className="remote-idle" d="M18 72h21" />}
  </svg>;
}

function DoorIllustration({ open, compact = false }: { open: boolean | null; compact?: boolean }) {
  return <div className={`door-illustration ${open === null ? 'is-unknown' : open ? 'is-open' : ''} ${compact ? 'is-compact' : ''}`} role="img" aria-label={open === null ? 'ドアは開く？閉じる？' : open ? '自動ドアが開いているイラスト' : '自動ドアが閉じているイラスト'}><span className="door-sign">AUTO</span><div className="door-frame"><i /><i /><b aria-hidden="true">→</b><b aria-hidden="true">←</b>{open === null && <strong className="door-question-mark">?</strong>}</div></div>;
}

function DoorLab() {
  const [person, setPerson] = useState<Bit>(0);
  const [remote, setRemote] = useState<Bit>(0);
  const [answers, setAnswers] = useState<(Bit | null)[]>([null, null, null, null]);
  const output = evaluateGate('OR', person, remote);
  const complete = doorRows.every((row, index) => answers[index] === row.output);
  return <div className="logic-panel door-lab">
    <div className="logic-panel-heading"><div><p className="logic-step-label">REAL-LIFE OR CIRCUIT</p><h3>人が近づく「か」、ボタンを押すと開く</h3></div><PrintBadge numbers="29〜32" kind="表" /></div>
    <p className="logic-panel-lead">「か」に注目。人感センサAとリモコンBの少なくとも一方が1なら、自動ドアMは開きます。</p>
    <div className="door-circuit">
      <div className="door-inputs"><button type="button" className={person ? 'is-on' : ''} aria-pressed={person === 1} onClick={() => setPerson(person ? 0 : 1)}><PersonIllustration active={person === 1} /><span>人感センサ A</span><b>A = {person}</b><small>{person ? '人が近づいている' : '人がいない'}</small></button><button type="button" className={remote ? 'is-on' : ''} aria-pressed={remote === 1} onClick={() => setRemote(remote ? 0 : 1)}><RemoteIllustration active={remote === 1} /><span>リモコン B</span><b>B = {remote}</b><small>{remote ? 'ボタンを押している' : 'ボタンを押していない'}</small></button></div>
      <GateDiagram gate="OR" a={person} b={remote} output={output} compact />
      <div className={`door-output ${output ? 'is-open' : ''}`} role="status"><span>出力 M={output}</span><DoorIllustration open={output === 1} /><b>ドアが{output ? '開く' : '閉じる'}</b></div>
    </div>
    <div className="door-practice"><h4>プリントの4行を完成させよう</h4><p>人物をA、リモコンをB、ドアの動きをMとして考えます。</p><div className="door-practice-grid">{doorRows.map((row, index) => <div key={`${row.person}-${row.remote}`} className={answers[index] === null ? '' : answers[index] === row.output ? 'is-correct' : 'is-wrong'}><div className="door-question-visual"><div><PersonIllustration active={row.person === 1} compact /><span>A={row.person}<small>{row.person ? '人がいる' : '人がいない'}</small></span></div><b>かつ</b><div><RemoteIllustration active={row.remote === 1} compact /><span>B={row.remote}<small>{row.remote ? '押す' : '押さない'}</small></span></div><i>→</i><DoorIllustration open={answers[index] === null ? null : answers[index] === 1} compact /></div><span><b>{row.person ? '人が近づいている' : '人が近づいていない'}</b>（A={row.person}）／ <b>{row.remote ? 'リモコンを押した' : 'リモコンを押していない'}</b>（B={row.remote}）</span><div><button type="button" aria-pressed={answers[index] === 0} onClick={() => setAnswers(previous => previous.map((value, position) => position === index ? 0 : value))}>ドアが閉じる<small>（M=0）</small></button><button type="button" aria-pressed={answers[index] === 1} onClick={() => setAnswers(previous => previous.map((value, position) => position === index ? 1 : value))}>ドアが開く<small>（M=1）</small></button></div><small>{answers[index] === null ? 'ドアの動きを選ぼう' : answers[index] === row.output ? '✓ 正解！' : '× 「どちらかが1」を確認'}</small></div>)}</div></div>
    {complete && <PracticeCelebration message="自動ドアのOR回路、㉙〜㉜を完成できました。" />}
  </div>;
}

export function LogicGateLab() {
  const [gate, setGate] = useState<GateType>('AND');
  const [a, setA] = useState<Bit>(0);
  const [b, setB] = useState<Bit>(0);
  const output = evaluateGate(gate, a, b);
  const info = gateInfo[gate];
  const rows = truthRows(gate);
  return <section className="logic-learning-section" id="gates">
    <SectionHeading number="01" label="論理回路 · 教科書 pp.76–77" title="スイッチを入れると、どの回路が答える？" question="入力A・Bを動かし、回路記号・真理値表・出力Lを一緒に見よう。" />
    <div className="logic-panel gate-lab">
      <div className="logic-panel-heading"><div><p className="logic-step-label">SWITCH → GATE → OUTPUT</p><h3>6つの回路を比べよう</h3></div><div className="badge-pair"><PrintBadge numbers="1〜6" /><PrintBadge numbers="7〜28" kind="表" /></div></div>
      <div className="gate-picker" aria-label="確認する論理回路">{gateOrder.map(item => <button key={item} type="button" className={`gate-choice ${gate === item ? 'is-selected' : ''}`} aria-pressed={gate === item} onClick={() => setGate(item)}><span className="gate-choice-title"><b>{item}</b><strong>{gateInfo[item].japanese}</strong></span><GateSymbol gate={item} /></button>)}</div>
      <div className="gate-workspace">
        <div className="input-switches" aria-label="論理回路の入力">
          <button type="button" className={a ? 'is-on' : ''} aria-pressed={a === 1} onClick={() => setA(a ? 0 : 1)}><span>入力A</span><b>{a}</b><small>{a ? 'ON' : 'OFF'} · 切り替える</small></button>
          <button type="button" disabled={gate === 'NOT'} className={b ? 'is-on' : ''} aria-pressed={b === 1} onClick={() => setB(b ? 0 : 1)}><span>入力B</span><b>{gate === 'NOT' ? '—' : b}</b><small>{gate === 'NOT' ? 'NOTでは使いません' : `${b ? 'ON' : 'OFF'} · 切り替える`}</small></button>
        </div>
        <div className="gate-stage"><GateDiagram gate={gate} a={a} b={b} output={output} /><div className={`logic-lamp ${output ? 'is-on' : ''}`} role="status" aria-label={`出力Lは${output}`}><i aria-hidden="true" /><span>出力 L</span><b>{output}</b><small>{output ? '点灯' : '消灯'}</small></div></div>
      </div>
      <div className="gate-explanation"><div><span>プリント空欄 {info.number}</span><h4>{gate}回路＝{info.japanese}</h4><p>{info.rule}</p><code>{info.formula}</code></div><VennDiagram gate={gate} /></div>
      <div className="truth-table-wrap"><h4>{gate}回路の真理値表</h4><table><thead><tr><th>入力 A</th>{gate !== 'NOT' && <th>入力 B</th>}<th>出力 L</th></tr></thead><tbody>{rows.map(row => { const active = row.a === a && (gate === 'NOT' || row.b === b); return <tr key={`${row.a}-${row.b ?? 'n'}`} className={active ? 'is-current' : ''}><td>{row.a}</td>{gate !== 'NOT' && <td>{row.b}</td>}<td>{row.output}</td></tr>; })}</tbody></table><p><b>いまの入力</b>に当たる行を太枠で示しています。</p></div>
    </div>
    <DoorLab />
  </section>;
}
