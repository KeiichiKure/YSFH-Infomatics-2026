'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import arithmeticMascot from '@/public/images/03-01-mascot-arithmetic.png';
import { buildAdditionTrace, normalizeBits } from '../../03-02/components/binaryModels';
import { AdderCircuitDiagram } from './CircuitVisuals';
import { PracticeCelebration, PrintBadge, SectionHeading } from './LessonParts';
import { fullAdder, fullAdderRows, halfAdder, type Bit } from './logicModels';

function BitToggle({ label, value, onChange }: { label: 'A' | 'B' | 'X'; value: Bit; onChange: (value: Bit) => void }) {
  return <button type="button" className={value ? 'is-on' : ''} aria-pressed={value === 1} onClick={() => onChange(value ? 0 : 1)}><span>{label === 'X' ? '下の桁からの桁上がり' : '入力'}</span><b>{label} = {value}</b><small>ここを押して切り替える</small></button>;
}

function FullAdderPractice({ onSimulate }: { onSimulate: (a: Bit, b: Bit, x: Bit) => void }) {
  const practiceRows = fullAdderRows.filter(row => row.carryIn === 1);
  const [answers, setAnswers] = useState<{ carry: Bit | null; sum: Bit | null }[]>(practiceRows.map(() => ({ carry: null, sum: null })));
  const complete = practiceRows.every((row, index) => answers[index].carry === row.carry && answers[index].sum === row.sum);
  const choose = (index: number, key: 'carry' | 'sum', value: Bit) => {
    const row = practiceRows[index];
    setAnswers(previous => previous.map((answer, position) => position === index ? { ...answer, [key]: value } : answer));
    onSimulate(row.a, row.b, row.carryIn);
  };
  return <div className="full-adder-practice"><div className="logic-panel-heading"><div><p className="logic-step-label">YOUR TURN · X=1</p><h3>プリント㉞〜㊶を、上の回路で確かめよう</h3></div><PrintBadge numbers="34〜41" kind="表" /></div>
    <p className="practice-simulator-note">答えを選ぶと、その行のA・B・Xが上の全加算回路へ自動で入ります。</p>
    <div className="adder-practice-grid">{practiceRows.map((row, index) => { const answer = answers[index]; const done = answer.carry !== null && answer.sum !== null; const correct = done && answer.carry === row.carry && answer.sum === row.sum; return <fieldset key={`${row.a}-${row.b}`} className={done ? correct ? 'is-correct' : 'is-wrong' : ''}><legend>A={row.a}　B={row.b}　X=1</legend><div><span>C</span>{([0, 1] as const).map(value => <button type="button" key={value} aria-pressed={answer.carry === value} onClick={() => choose(index, 'carry', value)}>{value}</button>)}<span>S</span>{([0, 1] as const).map(value => <button type="button" key={value} aria-pressed={answer.sum === value} onClick={() => choose(index, 'sum', value)}>{value}</button>)}</div><small>{!done ? 'CとSを選ぼう' : correct ? `✓ 正解！ 合計${row.value}=${row.carry}${row.sum}₂` : <>× 上の回路へこの入力をセットしました。<a href="#adder-simulator">信号線とC・Sを見る ↑</a></>}</small></fieldset>; })}</div>
    {complete && <PracticeCelebration message="下位からの桁上がりXを含む全加算回路を説明できます。" />}
  </div>;
}

function AdditionMeaning({ mode, a, b, x, carry, sum, value }: { mode: 'half' | 'full'; a: Bit; b: Bit; x: Bit; carry: Bit; sum: Bit; value: number }) {
  return <div className="addition-meaning" aria-live="polite">
    <div className="addition-meaning-heading"><span>いま、この足し算をしています</span><b>{mode === 'half' ? '半加算回路：2つの1ビットを足す' : '全加算回路：下の桁から来たXも足す'}</b></div>
    <div className="addition-live-equation">
      <div className="addition-input-expression"><small>回路への入力</small><b>{a} ＋ {b}{mode === 'full' ? ` ＋ ${x}` : ''}</b>{mode === 'full' && <em>X={x} は下の桁からの桁上がり</em>}</div>
      <span aria-hidden="true">＝</span>
      <div className="addition-bit-pair" aria-label={`2進数の答えは${carry}${sum}`}>
        <div className={carry ? 'is-on' : ''}><small>一つ上の位へ送る</small><b>{carry}</b><strong>C<br />桁上がり</strong></div>
        <div className={sum ? 'is-on' : ''}><small>この桁に残す</small><b>{sum}</b><strong>S<br />その桁の和</strong></div>
        <i>₂</i>
      </div>
    </div>
    <p><strong>{a}＋{b}{mode === 'full' ? `＋${x}` : ''}＝{carry}{sum}₂</strong>。10進数で確かめると {value} です。<b>CとSを左から並べると、2進数の答え</b>になります。</p>
  </div>;
}

type CircuitColumn = { column: number; a: Bit; b: Bit; x: Bit; carry: Bit; sum: Bit; kind: 'half' | 'full'; place: string };

function FourBitCircuitAddition({ basis, onColumnChange }: { basis: 'basic' | 'nand'; onColumnChange: (column: CircuitColumn, message: string, jumpToCircuit?: boolean) => void }) {
  const [left, setLeft] = useState('1001');
  const [right, setRight] = useState('0001');
  const [leftInput, setLeftInput] = useState('1001');
  const [rightInput, setRightInput] = useState('0001');
  const [inputError, setInputError] = useState('');
  const [momentIndex, setMomentIndex] = useState(-1);
  const addition = useMemo(() => buildAdditionTrace(left, right), [left, right]);
  const placeNames = ['8の位', '4の位', '2の位', '1の位'] as const;
  const currentStepIndex = Math.min(3, Math.max(0, Math.floor(momentIndex / 2)));
  const currentStep = addition.steps[currentStepIndex];
  const phase = momentIndex >= 0 && momentIndex < 8 ? momentIndex % 2 : -1;
  const activeColumn = momentIndex >= 0 && momentIndex < 8 ? currentStep.column : -1;
  const isPlaced = (stepIndex: number) => momentIndex >= stepIndex * 2 + 1;
  const cleanBits = (value: string) => value.replace(/[^01]/g, '').slice(0, 4);
  const columnInfo = (stepIndex: number): CircuitColumn => { const step = addition.steps[stepIndex]; return { column: step.column, a: step.left as Bit, b: step.right as Bit, x: step.incoming as Bit, carry: step.outgoing as Bit, sum: step.result as Bit, kind: step.column === 3 ? 'half' : 'full', place: placeNames[step.column] }; };
  const setMoment = (next: number) => {
    setMomentIndex(next);
    const index = next < 0 ? 0 : Math.min(3, Math.floor(next / 2));
    const column = columnInfo(index);
    const message = next === 7 ? `答えは${addition.fullResult}₂。03-02の筆算と、4つの回路から出た答えが一致したよ。` : `${column.place}は${column.kind === 'half' ? '半加算回路' : '全加算回路'}。入力A=${column.a}、B=${column.b}${column.kind === 'full' ? `、X=${column.x}` : ''}です。`;
    onColumnChange(column, message);
  };
  const applyInputs = () => {
    try {
      const nextLeft = normalizeBits(leftInput); const nextRight = normalizeBits(rightInput);
      setLeft(nextLeft); setRight(nextRight); setLeftInput(nextLeft); setRightInput(nextRight); setInputError(''); setMomentIndex(-1);
      const first = buildAdditionTrace(nextLeft, nextRight).steps[0];
      onColumnChange({ column: 3, a: first.left as Bit, b: first.right as Bit, x: 0, carry: first.outgoing as Bit, sum: first.result as Bit, kind: 'half', place: '1の位' }, '好きな4ビットを準備しました。まず1の位を半加算回路で見ます。');
    } catch (error) { setInputError(error instanceof Error ? error.message : '入力を確認してください。'); }
  };
  return <div className="binary-addition-walkthrough">
    <div className="logic-panel-heading"><div><p className="logic-step-label">03-02「好きな4ビットで筆算を動かす」＋ CIRCUITS</p><h3>あら不思議！ 回路をつなぐと足し算になる</h3></div><div className={`binary-written-sum ${momentIndex === 7 ? 'is-complete' : ''}`} aria-label={`${left}たす${right}は${addition.fullResult}`}><span>　{left}₂</span><span>＋{right}₂</span><i /><strong>{momentIndex === 7 ? `${addition.fullResult}₂` : '□□□□₂'}</strong></div></div>
    <p className="binary-example-lead">03-02と同じように<strong>好きな4ビット</strong>を入れ、右端から「① 入力を見る → ② 加算器で計算」の2段階で進めます。</p>
    <div className="circuit-binary-inputs"><label>上の数<small>各列の入力A</small><input value={leftInput} onChange={event => setLeftInput(cleanBits(event.target.value))} inputMode="numeric" maxLength={4} aria-label="上の数、各列の入力A" /></label><b>＋</b><label>下の数<small>各列の入力B</small><input value={rightInput} onChange={event => setRightInput(cleanBits(event.target.value))} inputMode="numeric" maxLength={4} aria-label="下の数、各列の入力B" /></label><button type="button" onClick={applyInputs}>この数で準備</button></div>
    <p className="input-message" role="status">{inputError || `${left} ＋ ${right} を右端から計算します。`}</p>
    <div className="adder-role-guide"><div><b>1の位</b><span>A ＋ B</span><strong>半加算回路</strong><small>右から来る桁上がりがない</small></div><i>→</i><div><b>2の位以降</b><span>X ＋ A ＋ B</span><strong>全加算回路</strong><small>Xは右の桁から来た桁上がり</small></div></div>
    <div className="circuit-column-workspace school-circuit-workspace" aria-label={`${left}たす${right}の筆算と入力A、B、X`}>
      <div className="circuit-column-row place-row"><b>位</b>{['16', '8', '4', '2', '1'].map(place => <span key={place}>{place}の位</span>)}</div>
      <div className="circuit-column-row carry-row"><b>入力X<small>右の桁のC</small></b>{[0, 1, 2, 3, 4].map(displayIndex => {
        const traceIndex = addition.steps.findIndex(step => step.column === displayIndex);
        const visible = displayIndex < 4 && traceIndex >= 0 && isPlaced(traceIndex);
        return <span className={`${activeColumn === displayIndex - 1 ? 'is-active' : ''} ${visible && traceIndex === currentStepIndex && phase === 1 ? 'is-new-carry' : ''}`} key={displayIndex}>{visible ? addition.steps[traceIndex].outgoing : displayIndex === 4 ? '—' : ''}</span>;
      })}</div>
      <div className="circuit-column-row operand-row"><b>入力A<small>上の数</small></b><span />{[...left].map((bit, column) => <span className={activeColumn === column ? 'is-active' : ''} key={column}>{bit}</span>)}</div>
      <div className="circuit-column-row operand-row"><b>入力B<small>下の数</small></b><span className="operation-cell">＋</span>{[...right].map((bit, column) => <span className={activeColumn === column ? 'is-active' : ''} key={column}>{bit}</span>)}</div>
      <div className="circuit-column-rule" />
      <div className="circuit-column-row result-row"><b>答えS</b><span>{isPlaced(3) && addition.carryOut ? addition.carryOut : ''}</span>{[0, 1, 2, 3].map(column => {
        const traceIndex = addition.steps.findIndex(step => step.column === column);
        const visible = isPlaced(traceIndex);
        return <span className={`${activeColumn === column ? 'is-active' : ''} ${visible && traceIndex === currentStepIndex && phase === 1 ? 'is-new-result' : ''}`} key={column}>{visible ? addition.steps[traceIndex].result : ''}</span>;
      })}</div>
    </div>
    <div className="circuit-calculation-stage two-phase-stage" aria-live="polite">
      {momentIndex < 0 ? <div className="circuit-stage-ready"><Image src={arithmeticMascot} alt="計算を担当する演算装置くん" /><div><b>03-02の筆算を、今度は回路で。</b><span>「開始」を押し、この桁の入力を集めてから、加算器のCとSを見よう。</span></div></div>
        : <div className="circuit-stage-moment" key={momentIndex}><div>
          <em>{phase === 0 ? '① 見る' : `② ${currentStep.column === 3 ? '半加算回路' : '全加算回路'}で計算`}</em>
          <h4>{phase === 0 ? '上から順に、この桁の数字を集める' : `${placeNames[currentStep.column]}の計算結果`}</h4>
          {phase === 0 ? <div className="gathered-inputs">{currentStep.column !== 3 && <b className="incoming-carry">X = {currentStep.incoming}</b>}<b>A = {currentStep.left}</b><b>B = {currentStep.right}</b></div>
            : <div className="adder-split-result"><div><small>桁上がり</small><b>C = {currentStep.outgoing}</b><span>左隣の位へ送る</span></div><div><small>この桁に残る数</small><b>S = {currentStep.result}</b><span>答えの段へ置く</span></div></div>}
          <p>{currentStep.column === 3 ? '1の位は桁上がりの入力がないので、AとBを半加算回路で足します。' : `右隣のC=${currentStep.incoming}が、この桁のX=${currentStep.incoming}。X・A・Bを全加算回路で足します。`}</p>
        </div><button type="button" className="active-mini-adder" onClick={() => onColumnChange(columnInfo(currentStepIndex), `${placeNames[currentStep.column]}の入力を上の${currentStep.column === 3 ? '半加算回路' : '全加算回路'}へ入れました。${basis === 'basic' ? 'AND・OR・NOT' : 'NANDだけ'}の信号線をたどり、C=${currentStep.outgoing}、S=${currentStep.result}を確かめよう。`, true)} aria-label={`${placeNames[currentStep.column]}の${currentStep.column === 3 ? '半加算回路' : '全加算回路'}を上の回路図で確認`}><small>{placeNames[currentStep.column]}</small><b>{currentStep.column === 3 ? '半加算回路 HA' : '全加算回路 FA'}</b><span>{currentStep.column === 3 ? '' : `X=${currentStep.incoming}　`}A={currentStep.left}　B={currentStep.right}</span><em>{basis === 'basic' ? 'AND・OR・NOT' : 'NANDだけ'}</em><strong>C={phase === 1 ? currentStep.outgoing : '？'}　S={phase === 1 ? currentStep.result : '？'}</strong><i>上の回路で確認 ↑</i></button></div>}
    </div>
    <p className="circuit-addition-final" aria-live="polite">{momentIndex === 7 ? `${left}₂ ＋ ${right}₂ ＝ ${addition.fullResult}₂。半加算回路と全加算回路で、前回の筆算と同じ答えができました。` : 'Cは左隣の位の入力Xへ、Sは答えの段へ。0の桁上がりも省略しません。'}</p>
    <div className="binary-walkthrough-controls"><button type="button" disabled={momentIndex < 0} onClick={() => setMoment(momentIndex - 1)}>← 1つ戻る</button><output>{momentIndex < 0 ? '開始前' : `${momentIndex + 1} / 8`}</output><button type="button" className="is-primary" disabled={momentIndex === 7} onClick={() => setMoment(momentIndex + 1)}>{momentIndex < 0 ? '開始' : momentIndex === 7 ? '完成' : '次へ →'}</button><button type="button" onClick={() => setMoment(-1)}>最初に戻す</button></div>
  </div>;
}

export function AdderLab() {
  const [mode, setMode] = useState<'half' | 'full'>('half');
  const [basis, setBasis] = useState<'basic' | 'nand'>('basic');
  const [a, setA] = useState<Bit>(1);
  const [b, setB] = useState<Bit>(1);
  const [x, setX] = useState<Bit>(0);
  const [simulationNotice, setSimulationNotice] = useState('入力を切り替えると、回路の信号と答えが同時に変わります。');
  const [circuitFocusKey, setCircuitFocusKey] = useState(0);
  const half = halfAdder(a, b);
  const full = fullAdder(a, b, x);
  const carry = mode === 'half' ? half.carry : full.carry;
  const sum = mode === 'half' ? half.sum : full.sum;
  const value = mode === 'half' ? half.value : full.value;
  const setFromPractice = (nextA: Bit, nextB: Bit, nextX: Bit) => {
    setMode('full'); setA(nextA); setB(nextB); setX(nextX);
    setSimulationNotice(`プリントの行 A=${nextA}、B=${nextB}、X=${nextX} をセットしました。赤い導線と出力を確認しよう。`);
  };
  const setFromFourBitAddition = (column: CircuitColumn, message: string, jumpToCircuit = false) => {
    setMode(column.kind); setA(column.a); setB(column.b); setX(column.x); setSimulationNotice(message);
    if (jumpToCircuit) {
      setCircuitFocusKey(previous => previous + 1);
      window.requestAnimationFrame(() => document.getElementById('adder-simulator')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  };

  return <section className="logic-learning-section" id="adders">
    <SectionHeading number="03" label="半加算回路・全加算回路 · 教科書 pp.78–79" title="足し算をするための回路を動かそう。" question="半加算回路と全加算回路は、0と1を足して、桁上がりCとその桁の和Sを作ります。" />
    <div className="adder-purpose"><strong>これを組み合わせると、コンピュータが2進数の足し算をできる。</strong><span>半加算回路：A＋B　／　全加算回路：A＋B＋下位から来たX</span></div>
    <div className="logic-panel adder-lab" id="adder-simulator">
      <div className="logic-panel-heading"><div><p className="logic-step-label">BINARY ADDITION CIRCUIT</p><h3>入力を変えて、足し算の回路を試そう</h3></div><PrintBadge numbers="34〜41" kind="表" /></div>
      <div className="adder-mode-tabs"><button type="button" className={mode === 'half' ? 'is-selected' : ''} aria-pressed={mode === 'half'} onClick={() => { setMode('half'); setSimulationNotice('半加算回路：AとBの2つを足します。'); }}>半加算回路<small>A＋B</small></button><button type="button" className={mode === 'full' ? 'is-selected' : ''} aria-pressed={mode === 'full'} onClick={() => { setMode('full'); setSimulationNotice('全加算回路：AとBに、下位からの桁上がりXも足します。'); }}>全加算回路<small>A＋B＋X</small></button></div>
      <div className="adder-basis-switch" aria-label="回路の作り方を切り替える">
        <p><b>同じ足し算を、2つの作り方で比べよう</b><span>切り替えても入力と答えは変わりません。</span></p>
        <div className="adder-basis-tabs">
          <button type="button" className={basis === 'basic' ? 'is-selected' : ''} aria-pressed={basis === 'basic'} onClick={() => { setBasis('basic'); setSimulationNotice('XORは使わず、AND・OR・NOTだけで和Sを作っているよ。'); }}><b>AND・OR・NOTで見る</b><small>3種類の基本回路</small></button>
          <button type="button" className={basis === 'nand' ? 'is-selected' : ''} aria-pressed={basis === 'nand'} onClick={() => { setBasis('nand'); setSimulationNotice('同じ足し算をNANDだけでも作れたよ。部品が1種類なら、ぼくも楽だなあ。'); }}><b>NANDだけで見る</b><small>1種類へ置き換え</small></button>
        </div>
      </div>
      <div className="interactive-circuit-stage adder-interactive-stage"><div className="adder-inputs"><BitToggle label="A" value={a} onChange={setA} /><BitToggle label="B" value={b} onChange={setB} />{mode === 'full' && <BitToggle label="X" value={x} onChange={setX} />}</div><div className="circuit-scroll"><div className={`adder-diagram-frame ${circuitFocusKey ? 'is-confirmed' : ''}`} key={circuitFocusKey}><AdderCircuitDiagram basis={basis} mode={mode} a={a} b={b} x={x} carry={carry} sum={sum} firstSum={full.firstSum} firstCarry={full.firstCarry} secondCarry={full.secondCarry} /></div></div></div>
      <div className="adder-equivalence" role="status"><b>{basis === 'basic' ? 'AND・OR・NOTで計算中' : 'NANDだけで計算中'}</b><span>どちらの回路でも　C={carry}・S={sum}　になります。</span></div>
      <AdditionMeaning mode={mode} a={a} b={b} x={x} carry={carry} sum={sum} value={value} />
      <div className="fixed-adder-dialogue"><Image src={arithmeticMascot} alt="演算装置くん" /><p className="speech-balloon" role="status">{simulationNotice}<br /><strong>いまの答えは C={carry}、S={sum} だよ。</strong></p></div>
      <FourBitCircuitAddition basis={basis} onColumnChange={setFromFourBitAddition} />
      <FullAdderPractice onSimulate={setFromPractice} />
    </div>
  </section>;
}
