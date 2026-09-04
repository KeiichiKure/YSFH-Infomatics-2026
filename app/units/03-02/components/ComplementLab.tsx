'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import arithmeticMascot from '@/public/images/03-01-mascot-arithmetic.png';
import { buildAdditionTrace, normalizeBits, signedValue, subtractWithComplement, twosComplement } from './binaryModels';
import { PracticeCelebration, PrintBadge, SectionHeading } from './LessonParts';

const complementProblems = [
  { id: '8', value: '0001', answer: '1111' }, { id: '9', value: '0110', answer: '1010' }, { id: '10', value: '0111', answer: '1001' },
] as const;
const calculationProblems = [
  { id: '11', operator: '＋', left: '0001', right: '0011', answer: '0100' }, { id: '12', operator: '＋', left: '0011', right: '0011', answer: '0110' },
  { id: '13', operator: '＋', left: '1100', right: '0011', answer: '1111' }, { id: '14', operator: '－', left: '0100', right: '0011', answer: '0001' },
  { id: '15', operator: '－', left: '1110', right: '0010', answer: '1100' }, { id: '16', operator: '－', left: '1111', right: '1100', answer: '0011' },
] as const;
type CheckState = 'correct' | 'wrong' | 'empty';

function BitAnswerInput({ id, label, answer, onAnimate, onStateChange }: { id: string; label: string; answer: string; onAnimate: () => void; onStateChange: (id: string, state: CheckState | undefined) => void }) {
  const [value, setValue] = useState('');
  const [state, setState] = useState<CheckState>();
  function update(next: string) { setValue(next.replace(/[^01]/g, '').slice(0, 4)); setState(undefined); onStateChange(id, undefined); }
  function check() { const next = value.length !== 4 ? 'empty' : value === answer ? 'correct' : 'wrong'; setState(next); onStateChange(id, next); }
  return <article className={state ? `is-${state}` : ''}>
    <small>プリント練習{id}</small><h4>{label}</h4>
    <label><span>4ビットの答え</span><input value={value} onChange={event => update(event.target.value)} inputMode="numeric" maxLength={4} placeholder="0000" aria-label={`プリント練習${id}の答え`} /></label>
    <button type="button" onClick={check}>答え合わせ</button>
    {state === 'wrong' && <button type="button" className="secondary-practice-button" onClick={onAnimate}>上のアニメーションで確認</button>}
    <p role="status">{state === 'correct' ? '✓ 正解！' : state === 'wrong' ? '× もう一度。アニメーションで途中を確認しよう。' : state === 'empty' ? '4桁すべてを入力してください。' : '　'}</p>
  </article>;
}

export function ComplementLab() {
  const [bits, setBits] = useState('0110');
  const [bitsInput, setBitsInput] = useState('0110');
  const [phase, setPhase] = useState(0);
  const [inputError, setInputError] = useState('');
  const [width, setWidth] = useState<4 | 8>(4);
  const [minuend, setMinuend] = useState('0110');
  const [subtrahend, setSubtrahend] = useState('0011');
  const [minuendInput, setMinuendInput] = useState('0110');
  const [subtrahendInput, setSubtrahendInput] = useState('0011');
  const [subtractionPhase, setSubtractionPhase] = useState(0);
  const [subtractionInputError, setSubtractionInputError] = useState('');
  const [complementChecks, setComplementChecks] = useState<Record<string, CheckState | undefined>>({});
  const [calculationChecks, setCalculationChecks] = useState<Record<string, CheckState | undefined>>({});
  const complement = useMemo(() => twosComplement(bits), [bits]);
  const plusOne = useMemo(() => buildAdditionTrace(complement.inverted, '0001'), [complement.inverted]);
  const subtraction = useMemo(() => subtractWithComplement(minuend, subtrahend, width), [minuend, subtrahend, width]);
  const minuendDecimal = Number.parseInt(minuend, 2);
  const subtrahendDecimal = Number.parseInt(subtrahend, 2);
  const subtractionResultDecimal = Number.parseInt(subtraction.result, 2);
  const flipCount = Math.min(phase, 4);
  const plusCount = Math.max(0, phase - 5);
  const plusResultAt = (column: number) => plusOne.steps.slice(0, plusCount).find(step => step.column === column)?.result ?? '';
  const plusCarryAt = (column: number) => plusOne.steps.slice(0, plusCount).some(step => step.outgoing === 1 && step.column - 1 === column) ? '1' : '';
  const complementComplete = complementProblems.every(problem => complementChecks[problem.id] === 'correct');
  const calculationComplete = calculationProblems.every(problem => calculationChecks[problem.id] === 'correct');
  const subtractionDraftComplete = minuendInput.length === width && subtrahendInput.length === width;
  const subtractionDraftOrderInvalid = subtractionDraftComplete && Number.parseInt(minuendInput, 2) < Number.parseInt(subtrahendInput, 2);
  const subtractionDraftMessage = !subtractionDraftComplete ? `${width}桁すべてを入力してください。` : subtractionDraftOrderInvalid ? '引かれる数を、引く数以上にしてください。この実験には符号ビットがないため、マイナスになる減算は扱いません。' : '';
  function clean(value: string, size = 4) { return value.replace(/[^01]/g, '').slice(0, size); }
  function applyComplement(next = bitsInput) {
    try { const normalized = normalizeBits(next); setBits(normalized); setBitsInput(normalized); setPhase(0); setInputError(''); }
    catch (error) { setInputError(error instanceof Error ? error.message : '入力を確認してください。'); }
  }
  function applySubtraction(nextLeft = minuendInput, nextRight = subtrahendInput, size = width) {
    try { const left = normalizeBits(nextLeft, size); const right = normalizeBits(nextRight, size); if (Number.parseInt(left, 2) < Number.parseInt(right, 2)) { setSubtractionInputError('引かれる数を、引く数以上にしてください。この実験には符号ビットがないため、マイナスになる減算は扱いません。'); return; } setMinuend(left); setSubtrahend(right); setMinuendInput(left); setSubtrahendInput(right); setSubtractionPhase(0); setSubtractionInputError(''); }
    catch { setSubtractionInputError(`${size}桁すべてを0か1で入力してください。入力がそろうまで、前の計算結果は更新しません。`); }
  }
  function changeWidth(next: 4 | 8) {
    setWidth(next);
    const left = next === 4 ? '0110' : '00010110';
    const right = next === 4 ? '0011' : '00000011';
    applySubtraction(left, right, next);
  }
  function loadComplement(value: string) { applyComplement(value); document.getElementById('complement-animation')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  function loadSubtraction(left: string, right: string) { setWidth(4); applySubtraction(left, right, 4); document.getElementById('complement-subtraction-animation')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  function loadAddition(left: string, right: string) {
    window.dispatchEvent(new CustomEvent('binary-arithmetic-load', { detail: { operation: 'add', left, right } }));
    document.getElementById('arithmetic-animation')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return <section className="learning-section" id="complement">
    <SectionHeading number="02" label="補数 · 教科書 pp.72–73" title="元の数を残し、コピーを反転しよう。" question="1桁ずつ反転し、式を作ってから1を加える筆算まで確認します。" />
    <div className="why-complement-scene">
      <Image src={arithmeticMascot} alt="加算回路だけで計算したい演算装置のマスコット" />
      <div className="speech-balloon"><span>演算装置くん</span><h3>引き算も、足し算の回路で計算したい！</h3><p>この単元では、ぼくは<strong>加算回路だけを使うモデル</strong>で考えるよ。引く数を「負の数」に変えれば、引き算を足し算として処理できるんだ。</p></div>
      <div className="subtraction-to-addition"><span><small>もとの減算</small><b>A − B</b></span><i>→</i><span><small>Bを負の数へ</small><b>A ＋（−B）</b></span><i>→</i><strong>加算回路で計算</strong></div>
      <p>こうすれば、加算とは別に<strong>減算専用の回路を用意しなくてよい</strong>のが利点です。負の数を作るときに使うのが「2の補数」です。回路の詳しい仕組みは、次回のプリント06で学びます。</p>
    </div>
    <div className="complement-introduction">
      <div><span>?</span><div><h3>2の補数とは？</h3><p><strong>決められたビット数のまま、負の数を表すための形</strong>です。コンピュータは引き算を「負の数を足す計算」へ置き換えられます。</p></div></div>
      <div className="complement-purpose"><b>作り方は2手順だけ</b><span>① すべての0と1を反転</span><i>→</i><span>② 1を足す</span></div>
      <p>元の数とその2の補数を足すと、固定ビットの外へ1が出て、中はすべて0になります。この性質を減算に使います。</p>
    </div>
    <div className="binary-panel complement-builder" id="complement-animation">
      <div className="binary-panel-heading"><div><p className="step-label">CUSTOM COMPLEMENT</p><h3>好きな4ビットの2の補数を作る</h3></div><span className="binary-model-badge">上下を見比べます</span></div>
      <div className="single-bit-input"><label>元の4ビット<input value={bitsInput} onChange={event => setBitsInput(clean(event.target.value))} inputMode="numeric" maxLength={4} aria-label="補数を作る元の4ビット" /></label><button type="button" onClick={() => applyComplement()}>この数で準備</button></div>
      <p className="input-message" role="status">{inputError || `${bits} の補数を作ります。`}</p>
      <h4 className="process-title"><span>1</span>すべてのビットを反転させる</h4>
      <div className="vertical-flip-stage" aria-live="polite">
        <div className="flip-row-label">元の数</div><div className="source-bit-row">{[...bits].map((bit, index) => <span key={index}>{bit}</span>)}</div>
        <div className="flip-row-label">反転したコピー</div><div className="target-bit-row">{[...complement.inverted].map((bit, index) => <span className={`${index < flipCount ? 'is-visible' : ''} ${index === flipCount - 1 && phase <= 4 ? 'is-copying' : ''}`} key={index}>{index < flipCount ? bit : '·'}</span>)}</div>
      </div>
      <div className="binary-step-controls embedded-step-controls"><button type="button" disabled={phase === 0 || phase > 4} onClick={() => setPhase(phase - 1)}>← 1つ戻る</button><output>{phase > 4 ? 'ステップ1 完了' : phase === 0 ? '開始前' : `反転 ${phase}/4`}</output><button type="button" className={phase === 0 ? 'is-primary' : ''} disabled={phase > 4} onClick={() => setPhase(phase + 1)}>{phase === 0 ? '開始' : phase < 4 ? '次へ →' : 'ステップ2へ →'}</button><button type="button" onClick={() => setPhase(0)}>最初に戻す</button></div>
      <h4 className="process-title"><span>2</span>反転した数に1を足す</h4>
      <div className={`plus-one-calculation ${phase >= 5 ? 'is-active' : ''} ${phase === 5 ? 'is-setting' : ''}`}>
        <div className="column-row mini-carry-row">{[0,1,2,3].map(column => <span key={column}>{plusCarryAt(column)}</span>)}</div>
        <div className="column-row inverted-addend-row">{[...complement.inverted].map((bit, column) => <span key={column}>{phase >= 5 ? bit : '·'}</span>)}</div>
        <div className="column-row mini-plus-row"><i>＋</i><span>0</span><span>0</span><span>0</span><span>1</span></div><div className="column-rule" />
        <div className="column-row result-row">{[0,1,2,3].map(column => <span key={column}>{plusResultAt(column)}</span>)}</div>
        <p>{phase < 5 ? '4桁の反転が終わると、下に筆算を作れます。' : phase === 5 ? `反転した${complement.inverted}を式へ移し、その下に＋0001を置きました。次に計算します。` : plusOne.steps[Math.min(plusCount - 1, 3)].outgoing ? '1＋1＝10₂。0を書き、左隣へ1を繰り上げます。' : 'この桁の答えを書きます。'}</p>
      </div>
      <div className="binary-step-controls embedded-step-controls"><button type="button" disabled={phase < 5} onClick={() => setPhase(Math.max(4, phase - 1))}>← 1つ戻る</button><output>{phase < 5 ? 'ステップ1の後' : phase === 5 ? '式を準備' : `＋1の筆算 ${plusCount}/4`}</output><button type="button" className={phase === 5 ? 'is-primary' : ''} disabled={phase < 5 || phase === 9} onClick={() => setPhase(phase + 1)}>{phase === 5 ? '計算を始める' : phase < 9 ? '次へ →' : '完了'}</button><button type="button" onClick={() => setPhase(0)}>最初に戻す</button></div>
      <div className={`arithmetic-dialogue complement-dialogue ${phase === 9 ? 'is-conclusion' : ''}`} role="status"><Image src={arithmeticMascot} alt="補数を作る演算装置のマスコット" /><div className="speech-balloon"><span>演算装置くん</span><h4>{phase === 0 ? '元のカードは、その場所に残すよ。' : phase <= 4 ? `${bits[phase - 1]}をコピーして回すと、下では${complement.inverted[phase - 1]}になる。` : phase === 5 ? '反転した数と＋0001で式を作ったよ。' : phase < 9 ? '右端から、1を加算中。' : `${bits}の2の補数は、${complement.result}とわかったね！`}</h4><p>{phase <= 4 ? `反転 ${flipCount} / 4 桁` : phase === 5 ? '＋1の式を準備' : phase < 9 ? `＋1の筆算 ${plusCount} / 4 桁` : `元の数 ${bits} → 2の補数 ${complement.result}`}</p></div></div>
      <SignBitExplorer />
      <div className="print-term-strip"><span><small>プリント空欄</small><b>5</b><strong>減算</strong></span><span><small>プリント空欄</small><b>6</b><strong>加算</strong></span><span><small>プリント空欄</small><b>7</b><strong>符号ビット</strong></span></div>
    </div>

    <div className="binary-panel worksheet-practice"><div className="binary-panel-heading"><div><p className="step-label">YOUR TURN</p><h3>2の補数を自分で求めよう</h3></div><PrintBadge kind="練習" numbers="8〜10" /></div><div className="practice-grid three-columns">{complementProblems.map(problem => <BitAnswerInput key={problem.id} id={problem.id} label={`${problem.value} の2の補数`} answer={problem.answer} onAnimate={() => loadComplement(problem.value)} onStateChange={(id, state) => setComplementChecks(previous => ({ ...previous, [id]: state }))} />)}</div>{complementComplete && <PracticeCelebration message="反転して1を足す手順を、3問すべて使いこなせました。" />}</div>

    <div className="binary-panel complement-subtraction" id="complement-subtraction-animation">
      <div className="binary-panel-heading"><div><p className="step-label">CUSTOM SUBTRACTION</p><h3>補数を使った減算を動かす</h3></div><span className="binary-model-badge">4ビット／8ビット</span></div>
      <div className="binary-tabs"><button type="button" className={width === 4 ? 'is-active' : ''} onClick={() => changeWidth(4)}>4ビット</button><button type="button" className={width === 8 ? 'is-active' : ''} onClick={() => changeWidth(8)}>8ビット</button></div>
      <div className="custom-bit-inputs"><label>引かれる数<input value={minuendInput} onChange={event => { setMinuendInput(clean(event.target.value, width)); setSubtractionInputError(''); }} inputMode="numeric" maxLength={width} aria-invalid={Boolean(subtractionInputError) || minuendInput.length !== width || subtractionDraftOrderInvalid} /></label><b>－</b><label>引く数<input value={subtrahendInput} onChange={event => { setSubtrahendInput(clean(event.target.value, width)); setSubtractionInputError(''); }} inputMode="numeric" maxLength={width} aria-invalid={Boolean(subtractionInputError) || subtrahendInput.length !== width || subtractionDraftOrderInvalid} /></label><button type="button" disabled={!subtractionDraftComplete || subtractionDraftOrderInvalid} onClick={() => applySubtraction()}>この数で準備</button></div>
      {(subtractionInputError || subtractionDraftMessage) && <p className="input-validation-message" role="alert"><b>！入力を確認</b>{subtractionInputError || subtractionDraftMessage}<span>{subtractionDraftOrderInvalid ? '負の数を計算するには、別に符号ビットを用意する必要があります。' : '0と1以外は入力できません。'}</span></p>}
      <div className="subtraction-steps-vertical" aria-live="polite">
        <article className={subtractionPhase <= 2 ? 'is-current' : subtractionPhase > 2 ? 'is-complete' : ''}>
          <h4><span>1</span>引く数の2の補数を作る</h4>
          <div className="vertical-step-equation"><b>{subtrahend}</b><i>すべて反転</i><b>{subtractionPhase >= 1 ? subtraction.complement.inverted : '?'.repeat(width)}</b><i>＋{'0'.repeat(width - 1)}1</i><strong>{subtractionPhase >= 2 ? subtraction.complement.result : '?'.repeat(width)}</strong></div>
          <p>引く数{` ${subtrahend} `}を反転し、1を足すと2の補数になります。</p>
          <div className="binary-step-controls embedded-step-controls"><button type="button" disabled={subtractionPhase === 0 || subtractionPhase > 2} onClick={() => setSubtractionPhase(subtractionPhase - 1)}>← 1つ戻る</button><output>{subtractionPhase > 2 ? 'ステップ1 完了' : subtractionPhase === 0 ? '開始前' : subtractionPhase === 1 ? '反転完了' : '2の補数完成'}</output><button type="button" disabled={subtractionPhase > 2} onClick={() => setSubtractionPhase(subtractionPhase + 1)}>{subtractionPhase === 0 ? '反転する →' : subtractionPhase === 1 ? '1を足す →' : 'ステップ2へ →'}</button><button type="button" onClick={() => setSubtractionPhase(0)}>最初に戻す</button></div>
        </article>
        <article className={subtractionPhase >= 3 && subtractionPhase <= 4 ? 'is-current' : subtractionPhase > 4 ? 'is-complete' : ''}>
          <h4><span>2</span>引かれる数 ＋ 引く数の2の補数</h4>
          <div className="subtraction-equation-stage">
            {subtractionPhase === 3 && <div className="moving-complement-token" key={`${subtrahend}-${width}-${subtractionPhase}`}><small>ステップ1で完成</small><b>{subtraction.complement.result}</b><span>↓ 下段へ運ぶ</span></div>}
            <div className={`stacked-subtraction-addition ${subtractionPhase === 3 ? 'is-building' : ''} ${subtractionPhase === 4 ? 'is-solving' : ''}`}><b>{minuend}</b><b className={subtractionPhase === 3 ? 'is-receiving' : ''}>＋ {subtractionPhase >= 3 ? subtraction.complement.result : '□'.repeat(width)}</b><i /><strong>{subtractionPhase >= 4 ? subtraction.addition.fullResult.padStart(width + 1,'0') : '　'.repeat(width + 1)}</strong></div>
          </div>
          <p>{subtractionPhase < 3 ? 'ステップ1で2の補数を完成させると、ここへ運びます。' : subtractionPhase === 3 ? `2の補数${subtraction.complement.result}が上から下段へ入り、「${minuend}＋${subtraction.complement.result}」という足し算の式ができました。` : `${minuend}＋${subtraction.complement.result}＝${subtraction.addition.fullResult.padStart(width + 1,'0')}を計算しました。`}</p>
          <div className="binary-step-controls embedded-step-controls"><button type="button" disabled={subtractionPhase < 3 || subtractionPhase > 4} onClick={() => setSubtractionPhase(subtractionPhase - 1)}>← 1つ戻る</button><output>{subtractionPhase < 3 ? 'ステップ1の後' : subtractionPhase === 3 ? '足し算の式が完成' : '足し算が完了'}</output><button type="button" className={subtractionPhase >= 3 && subtractionPhase <= 4 ? 'is-primary' : ''} disabled={subtractionPhase < 3 || subtractionPhase > 4} onClick={() => setSubtractionPhase(subtractionPhase + 1)}>{subtractionPhase < 3 ? 'ステップ1の後' : subtractionPhase === 3 ? '足し算をする →' : 'ステップ3へ →'}</button><button type="button" onClick={() => setSubtractionPhase(0)}>最初に戻す</button></div>
        </article>
        <article className={subtractionPhase >= 5 ? 'is-current' : ''}>
          <h4><span>3</span>{width}ビットの枠からはみ出した桁を取り除く</h4>
          {subtractionPhase < 5 ? <div className="pending-discard">ステップ2の計算結果を見てから、枠の外側だけを取ります。</div> : <div className={`carry-removal-stage ${subtractionPhase === 6 ? 'is-removing' : ''}`} key={`${minuend}-${subtrahend}-${width}`}><small>{subtractionPhase === 5 ? `計算結果 ${subtraction.addition.fullResult.padStart(width + 1,'0')} をそのまま置きます` : `${width}ビットの枠外だけを取り除きます`}</small><div className="carry-removal-bits"><span className="outside-bit">{subtraction.addition.fullResult.padStart(width + 1,'0')[0]}</span><div><small className="fixed-width-label">{width}ビットの保存範囲</small><div className="fixed-width-result">{[...subtraction.addition.fullResult.padStart(width + 1,'0').slice(1)].map((bit, index) => <span className="inside-bit" key={index}>{bit}</span>)}</div></div></div><p>{subtractionPhase === 5 ? `枠で囲まれた${width}桁が保存範囲です。その左の1桁だけが枠の外へはみ出しています。` : <><strong>枠内に残った答え：{subtraction.result}</strong><br />数の「一番左」ではなく、{width}ビットの枠より外へ出た桁だけを取り除きます。</>}</p></div>}
          <div className="binary-step-controls embedded-step-controls"><button type="button" disabled={subtractionPhase < 5} onClick={() => setSubtractionPhase(subtractionPhase - 1)}>← 1つ戻る</button><output>{subtractionPhase < 5 ? 'ステップ2の後' : subtractionPhase === 5 ? '枠外を確認' : '完了'}</output><button type="button" className={subtractionPhase === 5 ? 'is-primary' : ''} disabled={subtractionPhase !== 5} onClick={() => setSubtractionPhase(6)}>{width}ビットの枠外を取り除く</button><button type="button" onClick={() => setSubtractionPhase(0)}>最初に戻す</button></div>
          {subtractionPhase === 6 && <div className="subtraction-proof" aria-live="polite"><h5>確かめ算：2進数と10進数を縦に並べる</h5><div><span><small>2進数の式</small><b>{minuend}₂ − {subtrahend}₂ ＝ {subtraction.result}₂</b></span><i>それぞれ10進数へ直す</i><span><small>10進数の式</small><b>{minuendDecimal} − {subtrahendDecimal} ＝ {minuendDecimal - subtrahendDecimal}</b></span><strong>{minuendDecimal - subtrahendDecimal === subtractionResultDecimal ? `✓ ${subtraction.result}₂は10進数で${subtractionResultDecimal}。答えが一致しました。` : `固定${width}ビットでは答えを${2 ** width}で一周させて保存するため、保存値は${subtractionResultDecimal}です。`}</strong></div></div>}
        </article>
      </div>
      <p className="machine-message" role="status">{[
        'まず、引かれる数と引く数を確認します。',
        `ステップ1：引く数${subtrahend}の0と1を反転します。`,
        `反転した${subtraction.complement.inverted}に1を加えて、2の補数${subtraction.complement.result}が完成しました。`,
        `完成した2の補数${subtraction.complement.result}を下段へ運び、${minuend}＋${subtraction.complement.result}という式を作りました。`,
        `足し算をして、結果${subtraction.addition.fullResult.padStart(width + 1,'0')}が出ました。`,
        `結果${subtraction.addition.fullResult.padStart(width + 1,'0')}を置きます。囲まれた${width}ビットより外の桁を確認します。`,
        subtraction.addition.carryOut ? `${width}ビットの枠からはみ出した桁だけを取り除きます。枠内に残る答えは${subtraction.result}です。` : `枠からはみ出した1はありません。${width}ビットの答えは${subtraction.result}です。`,
      ][subtractionPhase]}</p>
      <div className="review-links"><button type="button" onClick={() => width === 4 ? loadComplement(subtrahend) : document.getElementById('complement-animation')?.scrollIntoView({ behavior: 'smooth' })}>2の補数の作り方を確認</button><button type="button" onClick={() => loadAddition(minuend.slice(-4), subtraction.complement.result.slice(-4))}>足し算の仕方を確認</button></div>
      <aside className="important-rule"><b>無視するのは、固定した{width}ビットの外へ出た桁だけ</b><p>補数を作る → 引かれる数へ加える → 最後にはみ出した左端だけを取り除く、の順です。計算途中のビットは消しません。</p></aside>
    </div>

    <div className="binary-panel worksheet-practice"><div className="binary-panel-heading"><div><p className="step-label">YOUR TURN</p><h3>プリントの計算を自分で確かめよう</h3></div><PrintBadge kind="練習" numbers="11〜16" /></div><p className="practice-method-note"><strong>減算は補数を使って求めよう。</strong>引く数の2の補数を作り、引かれる数との加算に直して計算します。</p><div className="practice-grid three-columns">{calculationProblems.map(problem => <BitAnswerInput key={problem.id} id={problem.id} label={`${problem.left} ${problem.operator} ${problem.right}`} answer={problem.answer} onAnimate={problem.operator === '－' ? () => loadSubtraction(problem.left, problem.right) : () => loadAddition(problem.left, problem.right)} onStateChange={(id, state) => setCalculationChecks(previous => ({ ...previous, [id]: state }))} />)}</div>{calculationComplete && <PracticeCelebration message="補数を使う減算まで、6問すべて正解です。" />}</div>
  </section>;
}

function SignBitExplorer() {
  const [width, setWidth] = useState<4 | 8>(4);
  const [value, setValue] = useState('1011');
  const normalized = value.padStart(width, '0');
  const unsigned = Number.parseInt(normalized, 2);
  const signed = signedValue(normalized, width);
  const valueBits = normalized.slice(1);
  const valueComplement = twosComplement(valueBits, width - 1);
  const magnitudeBits = valueComplement.result;
  const magnitude = valueComplement.carryOut ? 2 ** (width - 1) : Number.parseInt(magnitudeBits, 2);
  const magnitudeDisplayBits = valueComplement.carryOut ? `1${magnitudeBits}` : magnitudeBits;
  const unsignedTerms = [...normalized].map((bit, index) => bit === '1' ? 2 ** (width - index - 1) : null).filter((item): item is number => item !== null);
  const signedTerms = [...valueBits].map((bit, index) => bit === '1' ? 2 ** (width - index - 2) : null).filter((item): item is number => item !== null);
  function changeWidth(next: 4 | 8) { setWidth(next); setValue(next === 4 ? '1011' : '10001011'); }
  return <div className="sign-bit-explorer">
    <div><p className="step-label">SIGN BIT LAB</p><h4>同じビット列を「符号なし／符号付き」で読む</h4></div>
    <div className="binary-tabs"><button type="button" className={width === 4 ? 'is-active' : ''} onClick={() => changeWidth(4)}>4ビット</button><button type="button" className={width === 8 ? 'is-active' : ''} onClick={() => changeWidth(8)}>8ビット</button></div>
    <label className="sign-input">0と1を入力<input value={value} onChange={event => setValue(event.target.value.replace(/[^01]/g,'').slice(0,width))} inputMode="numeric" maxLength={width} /></label>
    <div className={`sign-bit-cells width-${width}`}>{[...normalized].map((bit,index)=><span className={index===0?'is-sign':''} key={index}><small>{index===0?'一番左＝符号ビット':'数値の桁'}</small><b>{bit}</b><i>符号なし {2 ** (width-index-1)}</i><strong>{index===0?'0:＋ / 1:－':`${2 ** (width-index-1)}の位`}</strong></span>)}</div>
    <div className="sign-results">
      <div><small>符号なしで読む</small><b>{normalized}₂ ＝ {unsigned}</b><p>{unsignedTerms.join(' ＋ ') || '0'} ＝ {unsigned}。全部の桁を正の位として足します。</p></div>
      <div><small>2の補数（符号付き）で読む</small><b>{normalized}₂ ＝ {signed}</b>{normalized[0] === '0' ? <p>符号ビットが0なのでプラス。符号ビットを除くと <strong>{valueBits}₂</strong>。{signedTerms.join(' ＋ ') || '0'} ＝ {signed} なので、答えは ＋{signed} です。</p> : <p>符号ビットが1なのでマイナス。符号ビットを除いた <strong>{valueBits}₂</strong> を反転して {[...valueBits].map(bit => bit === '0' ? '1' : '0').join('')}、さらに1を加えると <strong>{magnitudeDisplayBits}₂＝{magnitude}</strong>。よって −{magnitude} です。</p>}</div>
    </div>
    <p className="range-note">{width}ビットの範囲：符号なし 0〜{2**width-1} ／ 符号付き −{2**(width-1)}〜{2**(width-1)-1}。符号に1ビット使うため、表せる正の最大値が小さくなります。</p>
  </div>;
}
