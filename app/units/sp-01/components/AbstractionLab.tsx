'use client';

import { useState } from 'react';
import { PrintBadge, SectionHeading } from './LessonParts';

const levels = [
  { title: '細部が多い', note: '模様・光沢・目盛りまであるため、遠くからは輪郭をつかみにくい。' },
  { title: '特徴を整理', note: '水筒らしさに必要な「縦長・ふた・持ち手」を残し、細部を減らした。' },
  { title: 'ピクトグラム', note: '太い輪郭と少ない要素で、短時間でも対象を識別しやすい。' },
] as const;

function BottleMark({ level }: { level: number }) {
  return <svg className={`bottle-mark level-${level}`} viewBox="0 0 180 220" role="img" aria-label={`${levels[level].title}の水筒表現`}>
    {level === 0 && <><circle cx="32" cy="42" r="8" /><circle cx="146" cy="168" r="10" /><path d="M18 82h28M136 68h26M24 190h34" /></>}
    <path className="bottle-body" d="M60 48h60l10 24v116c0 12-10 20-22 20H72c-12 0-22-8-22-20V72z" />
    <path className="bottle-cap" d="M66 22h48v28H66z" />
    <path className="bottle-handle" d="M118 66c32-5 35 42 9 47" />
    {level === 0 && <><path className="bottle-detail" d="M61 91h58M61 105h58M73 126c12-18 24 18 36 0M67 159h46" /><circle className="bottle-detail" cx="78" cy="177" r="6" /><circle className="bottle-detail" cx="101" cy="177" r="6" /></>}
    {level === 1 && <path className="bottle-detail" d="M65 112h50" />}
  </svg>;
}

type PlacePictogramName = 'desk' | 'locker' | 'floor';

function PlacePictogram({ name }: { name: PlacePictogramName }) {
  return <svg className="place-pictogram" viewBox="0 0 96 72" aria-hidden="true" focusable="false">
    {name === 'desk' && <>
      <path d="M13 25h70v13H13zM21 38v25M75 38v25M29 38v13h38V38" />
      <path className="pictogram-accent" d="M51 12h23v13H51z" />
    </>}
    {name === 'locker' && <>
      <rect x="22" y="6" width="52" height="60" rx="4" />
      <path d="M48 6v60M28 17h14M54 17h14" />
      <circle className="pictogram-accent" cx="42" cy="37" r="3" />
      <circle className="pictogram-accent" cx="54" cy="37" r="3" />
    </>}
    {name === 'floor' && <>
      <path d="M12 60h72L72 29H24zM31 29l-8 31M65 29l8 31M18 45h60" />
      <path className="pictogram-accent" d="M48 5v20M38 16l10 10 10-10" />
    </>}
  </svg>;
}

export function AbstractionLab() {
  const [level, setLevel] = useState(0);
  return <section className="design-learning-section" id="abstract">
    <SectionHeading number="03" label="情報の抽象化と行動の手がかり" title="削るほど伝わる？ 本質だけを残そう。" question="抽象化は、単に簡単に描くことではありません。目的に必要な特徴を選び直す操作です。" />
    <div className="design-panel abstraction-lab">
      <div className="design-panel-heading"><div><p className="design-step-label">DETAIL → ESSENCE</p><h3>水筒らしさを残して、細部を減らす</h3></div><PrintBadge number="3-1">ピクトグラム</PrintBadge></div>
      <div className="abstraction-workspace">
        <div className="abstraction-preview"><BottleMark level={level} /><span>{levels[level].title}</span></div>
        <div className="abstraction-controls">
          <p>表現の段階を選ぶ</p>
          <div role="group" aria-label="抽象化の段階">{levels.map((item, index) => <button key={item.title} type="button" className={level === index ? 'is-active' : ''} aria-pressed={level === index} onClick={() => setLevel(index)}><small>{index + 1}</small><b>{item.title}</b></button>)}</div>
          <div className="abstraction-feedback" aria-live="polite"><b>{level === 2 ? '✓ 本質的な特徴が残った' : level === 1 ? 'あと一歩。遠くから見比べよう' : '情報が多いと、輪郭が埋もれる'}</b><p>{levels[level].note}</p></div>
        </div>
      </div>
      <div className="essence-strip"><span>残す特徴</span><b>縦長の容器</b><b>ふた</b><b>持ち手</b><i aria-hidden="true">→</i><strong>「水筒」を識別</strong></div>
      <p className="context-note">同じ図形でも、掲示場所や文化によって受け取り方が変わります。文字ラベルや周囲の情報と組み合わせ、意図が伝わるか確かめましょう。</p>
    </div>
    <SignifierLab />
  </section>;
}

function SignifierLab() {
  const [mode, setMode] = useState<'list' | 'layout' | 'clear'>('list');
  const description = mode === 'clear'
    ? '机・ロッカー・床のピクトグラムに、番号、矢印、チェック記号を組み合わせ、「どこを、どの順番で確認するか」を示しています。'
    : mode === 'layout'
      ? '見出しと確認場所をカードで整理したため、情報は探しやすくなりました。ただし、確認する順番と次の行動はまだ曖昧です。'
      : '必要な場所は読めますが、文字の強弱やまとまりがなく、急いでいる人の視線を導けません。';
  const feedbackTitle = mode === 'clear'
    ? '✓ 見る場所と、次の行動がひと目で分かる'
    : mode === 'layout'
      ? '△ 情報は整理された。では、どの順番で見る？'
      : '△ 情報を箇条書きにしただけ';

  return <div className="design-panel signifier-lab">
    <div className="design-panel-heading"><div><p className="design-step-label">CUE → ACTION</p><h3>「確認する」手がかりを加える</h3></div><PrintBadge number="3-2">シグニファイア</PrintBadge></div>
    <div className="signifier-modes" role="group" aria-label="行動の手がかりの強さ">
      <button type="button" className={mode === 'list' ? 'is-active' : ''} aria-pressed={mode === 'list'} onClick={() => setMode('list')}>文字だけ（箇条書き）</button>
      <button type="button" className={mode === 'layout' ? 'is-active' : ''} aria-pressed={mode === 'layout'} onClick={() => setMode('layout')}>レイアウト</button>
      <button type="button" className={mode === 'clear' ? 'is-active' : ''} aria-pressed={mode === 'clear'} onClick={() => setMode('clear')}>行動が分かる</button>
    </div>
    <div className={`signifier-poster mode-${mode}`} aria-label="机、ロッカー、床の確認を促すポスター例">
      {mode === 'list' ? <div className="signifier-plain-text">
        <strong>帰る前に忘れ物に注意</strong>
        <ul><li>机</li><li>ロッカー</li><li>床</li></ul>
        <p>を確認</p>
      </div> : <>
        <header><small>帰る前に</small><strong>{mode === 'clear' ? '3秒チェック' : '忘れ物に注意'}</strong></header>
        <div className="signifier-route">
          {([
            { label: '机', pictogram: 'desk' },
            { label: 'ロッカー', pictogram: 'locker' },
            { label: '床', pictogram: 'floor' },
          ] as const).map((place, index) => <div key={place.label} className="signifier-stop">
            {mode === 'clear' && <span>{index + 1}</span>}
            {mode === 'clear' && <PlacePictogram name={place.pictogram} />}
            <b>{place.label}</b>
            {mode === 'clear' && <i aria-hidden="true">✓</i>}
            {mode === 'layout' && <small>確認</small>}
          </div>)}
        </div>
        {mode === 'clear' && <p>見たら、出口へ →</p>}
      </>}
    </div>
    <div className={`signifier-feedback ${mode === 'clear' ? 'is-good' : ''}`} role="status"><b>{feedbackTitle}</b><p>{description}</p></div>
    <div className="affordance-note"><b>アフォーダンスとの違い</b><p>扉の取っ手の形が「引ける」ことを可能にする性質がアフォーダンス。矢印や「引く」の表示で、その行動を見える形にする手がかりがシグニファイアです。</p></div>
  </div>;
}
