'use client';

import { useState, type CSSProperties } from 'react';
import { hardwareSteps } from './lessonData';
import { PrintTerms, SectionHeading } from './LessonParts';
import { ConnectionsLab } from './ConnectionsLab';
import { SystemMascot, type SystemMascotName } from './SystemMascot';

const cast: { name: SystemMascotName; label: string; role: string }[] = [
  { name: 'input', label: '入力装置さん', role: 'データを受け取る' },
  { name: 'control', label: '制御装置くん', role: 'みんなへ指示する' },
  { name: 'arithmetic', label: '演算装置くん', role: '計算・比較をする' },
  { name: 'memory', label: '主記憶ちゃん', role: '作業中だけ覚える' },
  { name: 'output', label: '出力装置くん', role: '結果を伝える' },
  { name: 'storage', label: '補助記憶お母さん', role: '長く保存する' },
];

export function HardwareLab() {
  const [step, setStep] = useState(0);
  const [started, setStarted] = useState(false);
  const current = hardwareSteps[step];
  const routes = [
    [17, 25, 17, 72], [17, 72, 50, 25], [50, 25, 50, 25], [17, 72, 50, 72], [50, 25, 50, 72],
    [50, 72, 50, 25], [50, 25, 50, 25], [17, 72, 83, 25], [50, 25, 83, 25], [17, 72, 83, 72],
    [50, 25, 83, 72], [83, 72, 83, 72], [17, 72, 50, 25], [50, 25, 50, 25],
  ];
  const [sx, sy, ex, ey] = routes[step];
  const focusedSlots = [[], [], [0, 1], [], [0, 1], [], [3], [], [3], [], [3], [], [], [0, 1, 3]][step];
  const receivingSlots = [[], [], [0, 1], [], [], [], [3], [], [], [], [], [], [], []][step];
  const numericPacket = [2, 4, 6, 8, 10].includes(step);
  const speaker = cast.find(character => current.speaker.startsWith(character.label.replace('くん', '').replace('ちゃん', '').replace('お母さん', ''))) ?? cast.find(character => (current.actors as readonly string[]).includes(character.name))!;
  const packetStyle = { '--sx': `${sx}%`, '--sy': `${sy}%`, '--ex': `${ex}%`, '--ey': `${ey}%` } as CSSProperties;
  return <section className="learning-section" id="hardware">
    <SectionHeading number="01" label="ハードウェアと接続 · 教科書 p.68" title="コンピュータの中を、キャラクターで追跡！" question="「3＋5」を入力してから「8」を保存するまで、誰が誰に何を頼むのだろう？" />
    <div className="hw-panel hw-story-panel">
      <div className="hw-panel-heading"><div><p className="step-label">CHARACTER STORY</p><h3>「3＋5」のお仕事リレー</h3></div><span className="print-badge"><small>プリント</small><b>1–3</b></span></div>
      <p className="hw-story-guide"><b>「次へ」</b>を押して、キャラクターの会話とデータの行き先を追おう。光っているキャラクターが今の担当です。</p>
      <div className="hw-character-stage" aria-label="コンピュータの5大装置を擬人化した処理の流れ">
        {cast.map(character => <div className={`hw-cast hw-cast-${character.name}`} key={character.name}><SystemMascot name={character.name} label={character.label} active={started && (current.actors as readonly string[]).includes(character.name)} /><small>{character.role}</small>{character.name === 'memory' && <><em>子</em><div className="memory-slot-stack" aria-label="主記憶ちゃんが持つ4つの箱">{(started ? current.slots : ['', '', '', '']).map((value, index) => {
          const classes = [value ? 'has-data' : '', started && focusedSlots.includes(index) ? 'is-focused' : '', started && receivingSlots.includes(index) ? 'is-receiving' : '', started && step === 10 && index === 3 ? 'is-sending' : ''].filter(Boolean).join(' ');
          return <span key={`${step}-${index}-${value}`} className={classes}><small>箱{index + 1}</small><b>{value || '空'}</b></span>;
        })}</div></>}{character.name === 'storage' && <em>親</em>}</div>)}
        <div className="hw-cpu-room"><span>CPU（中央処理装置）</span><small>制御装置＋演算装置</small></div>
        {started && <><svg className="hw-data-trail" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="hw-arrow-head" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" /></marker></defs><line x1={sx} y1={sy} x2={ex} y2={ey} markerEnd="url(#hw-arrow-head)" /></svg><div className={`hw-moving-packet ${numericPacket ? 'is-numeric' : ''}`} key={step} style={packetStyle}><b>{current.packet}</b></div></>}
      </div>
      {!started ? <div className="hw-story-start" role="status"><SystemMascot name="input" label="入力装置さん" portrait /><div className="speech-balloon"><span>入力前</span><h4>まず、ユーザーが式を入力</h4><p>まだデータは動いていません。下のボタンを押すと、入力装置さんから制御装置くんへ「3＋5」が届きます。</p><button type="button" className="hw-primary" onClick={() => { setStep(0); setStarted(true); }}>3＋5を入力する</button></div></div> : <div className="hw-story-speech" role="status"><SystemMascot name={speaker.name} label={current.speaker} portrait /><div className="speech-balloon"><span>{step + 1} / {hardwareSteps.length}</span><h4>{current.speaker}</h4><p>{current.line}</p><div className="speech-data"><b>運んでいるデータ：{current.packet}</b><strong>{current.route}</strong><small>主記憶・保存：{current.memory}</small></div></div></div>}
      <div className="fixed-step-controls"><div className="hw-controls" aria-label="キャラクターの処理を進める"><button type="button" disabled={!started || step === 0} onClick={() => setStep(step - 1)}>← 前へ</button><output>{started ? `${step + 1} / ${hardwareSteps.length}` : '入力前'}</output><button type="button" disabled={!started || step === hardwareSteps.length - 1} onClick={() => setStep(step + 1)}>次へ →</button><button type="button" onClick={() => { setStep(0); setStarted(false); }}>入力前に戻す</button></div></div>
      <div className="hw-role-recap"><b>この物語で覚えたいこと</b><ul><li><strong>入力</strong>されたデータを、<strong>制御</strong>が整理して各装置へ指示する。</li><li><strong>演算</strong>の前に主記憶から値を読み出し、結果はいったん<strong>主記憶</strong>へ返す。</li><li><strong>出力装置</strong>は結果を人へ伝える。保存するときは、主記憶のデータを<strong>補助記憶</strong>へ移す。</li><li>処理後はOSなどが主記憶の作業領域を<strong>解放</strong>し、次の処理で再利用できるようにする。この物語では制御装置くんが指示を代表する。</li></ul></div>
      <div className="memory-family-visual"><h4>主記憶ちゃんと補助記憶お母さんは、何が違う？</h4><div className="memory-family-cards"><div><SystemMascot name="memory" label="主記憶ちゃん" portrait /><div className="speech-balloon"><b>作業中はすばやく覚えるよ！</b><span className="power-off">🔌 電源OFF → <strong>忘れる</strong></span><small>主記憶装置（RAMなど）</small></div></div><div><SystemMascot name="storage" label="補助記憶お母さん" portrait /><div className="speech-balloon"><b>電源を切っても預かるよ！</b><span className="keep-data">💾 データを<strong>長く保管</strong></span><small>SSD・HDDなど</small></div></div></div><p>2人とも記憶装置の家族です。主記憶はCPUの近くで作業し、残したいデータは補助記憶へ保存します。</p></div>
      <PrintTerms numbers={[1, 2, 3]} />
    </div>
    <ConnectionsLab />
  </section>;
}
