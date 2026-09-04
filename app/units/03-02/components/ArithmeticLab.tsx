'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import arithmeticMascot from '@/public/images/03-01-mascot-arithmetic.png';
import { buildAdditionTrace, buildSchoolSubtractionTrace, normalizeBits, type ArithmeticOperation } from './binaryModels';
import { PracticeCelebration, PrintBadge, SectionHeading } from './LessonParts';

const worksheetProblems = [
  { id: '1', operation: 'add', left: '1001', right: '0101', answer: '1110' },
  { id: '2', operation: 'add', left: '0110', right: '0110', answer: '1100' },
  { id: '3', operation: 'subtract', left: '1000', right: '0101', answer: '0011' },
  { id: '4', operation: 'subtract', left: '1100', right: '0011', answer: '1001' },
] as const;
const placeNames = ['8', '4', '2', '1'] as const;
const displayPlaces = ['16', '8', '4', '2', '1'] as const;
type CheckState = 'correct' | 'wrong' | 'empty';
type Moment = { stepIndex: number; kind: 'inspect' | 'decimal' | 'binary' | 'borrow' | 'place'; borrowIndex?: number };

export function ArithmeticLab() {
  const [operation, setOperation] = useState<ArithmeticOperation>('add');
  const [left, setLeft] = useState('1001');
  const [right, setRight] = useState('0001');
  const [leftInput, setLeftInput] = useState('1001');
  const [rightInput, setRightInput] = useState('0001');
  const [inputError, setInputError] = useState('');
  const [momentIndex, setMomentIndex] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checks, setChecks] = useState<Record<string, CheckState | undefined>>({});
  const allPracticeCorrect = worksheetProblems.every(problem => checks[problem.id] === 'correct');
  const addition = useMemo(() => buildAdditionTrace(left, right), [left, right]);
  const subtraction = useMemo(() => operation === 'subtract' ? buildSchoolSubtractionTrace(left, right) : null, [operation, left, right]);
  const moments = useMemo<Moment[]>(() => {
    if (operation === 'add') return addition.steps.flatMap((_, stepIndex) => [
      { stepIndex, kind: 'inspect' as const }, { stepIndex, kind: 'decimal' as const },
      { stepIndex, kind: 'binary' as const }, { stepIndex, kind: 'place' as const },
    ]);
    return subtraction!.steps.flatMap((step, stepIndex) => [
      { stepIndex, kind: 'inspect' as const },
      ...step.borrowFrames.map((_, borrowIndex) => ({ stepIndex, kind: 'borrow' as const, borrowIndex })),
      { stepIndex, kind: 'decimal' as const }, { stepIndex, kind: 'place' as const },
    ]);
  }, [operation, addition.steps, subtraction]);
  const moment = moments[Math.max(0, momentIndex)];
  const addStep = addition.steps[moment.stepIndex];
  const subStep = subtraction?.steps[moment.stepIndex];
  const activeColumn = momentIndex >= 0 ? (operation === 'add' ? addStep.column : subStep!.column) : -1;
  const completedMoments = momentIndex < 0 ? [] : moments.slice(0, momentIndex + 1);
  const isPlaced = (stepIndex: number) => completedMoments.some(item => item.stepIndex === stepIndex && item.kind === 'place');
  const resultForColumn = (column: number) => {
    if (operation === 'add') {
      const index = addition.steps.findIndex(step => step.column === column);
      return index >= 0 && isPlaced(index) ? addition.steps[index].result : '';
    }
    const index = subtraction!.steps.findIndex(step => step.column === column);
    return index >= 0 && isPlaced(index) ? subtraction!.steps[index].result : '';
  };
  const carryForColumn = (column: number) => addition.steps.some((step, index) => isPlaced(index) && step.outgoing === 1 && step.column - 1 === column) ? '1' : '';
  const carryOutVisible = operation === 'add' && addition.carryOut === 1 && isPlaced(addition.steps.length - 1);
  const topDigits = (() => {
    if (operation === 'add' || momentIndex < 0) return [...left].map(Number);
    if (moment.kind === 'inspect') return subStep!.before;
    if (moment.kind === 'borrow') return subStep!.borrowFrames[moment.borrowIndex!].digits;
    return subStep!.working;
  })();

  useEffect(() => {
    function loadFromAnotherLab(event: Event) {
      const detail = (event as CustomEvent<{ operation: ArithmeticOperation; left: string; right: string }>).detail;
      if (!detail) return;
      applyInputs(detail.operation, detail.left, detail.right);
    }
    window.addEventListener('binary-arithmetic-load', loadFromAnotherLab);
    return () => window.removeEventListener('binary-arithmetic-load', loadFromAnotherLab);
  });

  function cleanBits(value: string) { return value.replace(/[^01]/g, '').slice(0, 4); }
  function applyInputs(nextOperation = operation, nextLeft = leftInput, nextRight = rightInput) {
    try {
      const normalizedLeft = normalizeBits(nextLeft);
      const normalizedRight = normalizeBits(nextRight);
      if (nextOperation === 'subtract' && Number.parseInt(normalizedLeft, 2) < Number.parseInt(normalizedRight, 2)) {
        setInputError('この筆算では、引かれる数を引く数以上にしてください。'); return;
      }
      setOperation(nextOperation); setLeft(normalizedLeft); setRight(normalizedRight);
      setLeftInput(normalizedLeft); setRightInput(normalizedRight); setMomentIndex(-1); setInputError('');
    } catch (error) { setInputError(error instanceof Error ? error.message : '入力を確認してください。'); }
  }
  function chooseOperation(next: ArithmeticOperation) {
    const defaults = next === 'add' ? ['1001', '0001'] : ['1000', '0011'];
    applyInputs(next, defaults[0], defaults[1]);
  }
  function loadProblem(problem: typeof worksheetProblems[number]) {
    applyInputs(problem.operation, problem.left, problem.right);
    document.getElementById('arithmetic-animation')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function updateAnswer(id: string, value: string) {
    setAnswers(previous => ({ ...previous, [id]: cleanBits(value) }));
    setChecks(previous => ({ ...previous, [id]: undefined }));
  }
  function checkAnswer(id: string, answer: string) {
    const value = answers[id] ?? '';
    setChecks(previous => ({ ...previous, [id]: value.length !== 4 ? 'empty' : value === answer ? 'correct' : 'wrong' }));
  }

  return <section className="learning-section" id="arithmetic">
    <SectionHeading number="01" label="2進数の加算と減算 · 教科書 p.72" title="右の桁から、1つずつ確かめよう。" question="見る、計算する、2進数へ変える、筆算へ置く。4段階に分けて進めます。" />
    <div className="binary-panel arithmetic-panel" id="arithmetic-animation">
      <div className="binary-panel-heading"><div><p className="step-label">CUSTOM ANIMATION</p><h3>好きな4ビットで筆算を動かす</h3></div><span className="binary-model-badge">説明用アニメーション</span></div>
      <div className="binary-tabs" aria-label="計算方法を選ぶ"><button type="button" className={operation === 'add' ? 'is-active' : ''} aria-pressed={operation === 'add'} onClick={() => chooseOperation('add')}>加算</button><button type="button" className={operation === 'subtract' ? 'is-active' : ''} aria-pressed={operation === 'subtract'} onClick={() => chooseOperation('subtract')}>減算</button></div>
      <div className="custom-bit-inputs"><label>上の数<input value={leftInput} onChange={event => setLeftInput(cleanBits(event.target.value))} inputMode="numeric" maxLength={4} aria-label="筆算の上の4ビット" /></label><b>{operation === 'add' ? '＋' : '－'}</b><label>下の数<input value={rightInput} onChange={event => setRightInput(cleanBits(event.target.value))} inputMode="numeric" maxLength={4} aria-label="筆算の下の4ビット" /></label><button type="button" onClick={() => applyInputs()}>この数で準備</button></div>
      <p className="input-message" role="status">{inputError || `${left} ${operation === 'add' ? '＋' : '－'} ${right} を右端から計算します。`}</p>

      <div className="column-workspace school-workspace" aria-label={`${left}${operation === 'add' ? '足す' : '引く'}${right}の筆算`}>
        <div className="column-row place-head-row five-column-row">{displayPlaces.map(place => <span key={place}>{place}の位</span>)}</div>
        {operation === 'add' && <><div className="column-label">繰り上がった1は、本来入る左隣の位へ</div><div className="column-row transfer-row five-column-row"><span>{carryOutVisible && <b>1</b>}</span>{[0, 1, 2, 3].map(column => <span key={column}>{carryForColumn(column) && <b>{carryForColumn(column)}</b>}</span>)}</div></>}
        <div className="column-row operand-row changing-top-row five-column-row"><span aria-hidden="true" />{topDigits.map((digit, column) => <span className={activeColumn === column ? 'is-active' : ''} key={column}>{operation === 'subtract' && digit !== Number(left[column]) ? <><del>{left[column]}</del><b className="updated-digit">{digit}</b></> : digit}</span>)}</div>
        <div className="column-row operand-row second-row five-column-row"><span className="operation-cell" aria-hidden="true">{operation === 'add' ? '＋' : '－'}</span>{[...right].map((bit, column) => <span className={activeColumn === column ? 'is-active' : ''} key={column}>{bit}</span>)}</div>
        <div className="column-rule" />
        <div className="column-row result-row five-column-row" aria-live="polite"><span className={carryOutVisible ? 'result-pop' : ''}>{carryOutVisible ? '1' : ''}</span>{[0, 1, 2, 3].map(column => <span className={activeColumn === column && moment.kind === 'place' ? 'is-active result-pop' : ''} key={column}>{resultForColumn(column)}</span>)}</div>
      </div>

      <div className="calculation-stage slow-stage" aria-live="polite">{momentIndex < 0 ? <div className="stage-ready"><Image src={arithmeticMascot} alt="計算を担当する演算装置のマスコット" /><div><b>「開始」を押して、1動作ずつ見よう。</b><span>自動では進みません。数字がどう変わったか確認してから「次へ」を押します。</span></div></div> : operation === 'add' ? <AdditionMoment moment={moment} step={addStep} /> : <SubtractionMoment moment={moment} step={subStep!} place={placeNames[subStep!.column]} />}</div>
      <div className="fixed-step-controls"><div className="binary-step-controls"><button type="button" disabled={momentIndex < 0} onClick={() => setMomentIndex(Math.max(-1, momentIndex - 1))}>← 1つ戻る</button><output>{momentIndex < 0 ? '開始前' : `${momentIndex + 1} / ${moments.length}`}</output><button type="button" className={momentIndex < 0 ? 'is-primary' : ''} disabled={momentIndex === moments.length - 1} onClick={() => setMomentIndex(momentIndex + 1)}>{momentIndex < 0 ? '開始' : '次へ →'}</button><button type="button" onClick={() => setMomentIndex(-1)}>最初に戻す</button></div></div>
    </div>

    <div className="binary-panel worksheet-practice"><div className="binary-panel-heading"><div><p className="step-label">YOUR TURN</p><h3>プリントを解いて、答えを入力しよう</h3></div><PrintBadge kind="練習" numbers="1〜4" /></div><p className="practice-instruction">まず自分で答えます。間違えたときだけ、その問題を上のアニメーションへ読み込めます。</p><div className="practice-grid">{worksheetProblems.map(problem => { const state = checks[problem.id]; return <article className={state ? `is-${state}` : ''} key={problem.id}><small>プリント練習{problem.id}</small><h4>{problem.left} {problem.operation === 'add' ? '＋' : '－'} {problem.right}</h4><label><span>4ビットの答え</span><input value={answers[problem.id] ?? ''} onChange={event => updateAnswer(problem.id, event.target.value)} inputMode="numeric" maxLength={4} placeholder="0000" aria-label={`プリント練習${problem.id}の答え`} /></label><button type="button" onClick={() => checkAnswer(problem.id, problem.answer)}>答え合わせ</button>{state === 'wrong' && <button type="button" className="secondary-practice-button" onClick={() => loadProblem(problem)}>上のアニメーションで確認</button>}<p role="status">{state === 'correct' ? '✓ 正解！' : state === 'wrong' ? '× もう一度。アニメーションで途中を確認できます。' : state === 'empty' ? '4桁すべてを入力してください。' : '　'}</p></article>; })}</div>{allPracticeCorrect && <PracticeCelebration message="加算と減算の4問を、自分の力で解き切りました。" />}</div>
  </section>;
}

function AdditionMoment({ moment, step }: { moment: Moment; step: ReturnType<typeof buildAdditionTrace>['steps'][number] }) {
  const total = step.left + step.right + step.incoming;
  const expression = `${step.incoming ? '1 ＋ ' : ''}${step.left} ＋ ${step.right}`;
  if (moment.kind === 'inspect') return <div className="micro-moment" key={`inspect-${step.column}`}><em>① 見る</em><h4>上から順に、この桁の数字を集める</h4><div className="large-calc">{step.incoming ? <><span className="incoming-carry">1</span> ＋ </> : null}{step.left} ＋ {step.right}</div><p>{step.incoming ? 'オレンジの繰り上がり → 上の数 → 下の数、の順に足します。' : '上の数 → 下の数、の順に足します。'}</p></div>;
  if (moment.kind === 'decimal') return <div className="micro-moment" key={`decimal-${step.column}`}><em>② まず10進数で計算</em><h4>{expression} ＝ <b>{total}</b></h4><p>今は答えの{total}だけを確認します。</p></div>;
  if (moment.kind === 'binary') return <div className="micro-moment" key={`binary-${step.column}`}><em>③ 2進数へ変える</em><div className="number-morph"><span>{total}</span><i>だから</i><strong>{total.toString(2)}₂</strong></div><p>{total >= 2 ? '10₂は「左へ渡す1」と「この桁に残す0」に分かれます。' : `${total}₂は1桁なので、そのまま書けます。`}</p></div>;
  return <div className="micro-moment" key={`place-${step.column}`}><em>④ 筆算へ置く</em><div className="split-result"><span className="carry-token"><small>左隣の位へ</small><b>{step.outgoing}</b></span><i>＋</i><span className="write-token"><small>この桁の答え</small><b>{step.result}</b></span></div><p>上の筆算に数字が入りました。</p></div>;
}

function SubtractionMoment({ moment, step, place }: { moment: Moment; step: ReturnType<typeof buildSchoolSubtractionTrace>['steps'][number]; place: string }) {
  if (moment.kind === 'inspect') return <div className="micro-moment" key={`sub-inspect-${step.column}`}><em>① 見る</em><h4>{step.before[step.column]} から {step.right} は引ける？</h4><p>{step.before[step.column] < step.right ? '引けないので、左の桁から1を借ります。' : '引けるので、そのまま計算します。'}</p></div>;
  if (moment.kind === 'borrow') { const frame = step.borrowFrames[moment.borrowIndex!]; return <div className="micro-moment borrow-moment" key={`borrow-${step.column}-${moment.borrowIndex}`}><em>② 借りた1を動かす</em><div className="borrow-hop"><span>{placeNames[frame.from]}の位から<b>1</b></span><i>→</i><span>{placeNames[frame.to]}の位では<b>10₂＝2</b></span></div><p>{frame.to < step.column ? '受け取った2から1を右へ貸すので、この桁には1が残ります。' : `${place}の位へ2が届きました。`}</p></div>; }
  if (moment.kind === 'decimal') return <div className="micro-moment" key={`sub-calc-${step.column}`}><em>③ 計算する</em><h4>{step.available} － {step.right} ＝ <b>{step.result}</b></h4><p>借りた後の、今ある数字で引き算します。</p></div>;
  return <div className="micro-moment" key={`sub-place-${step.column}`}><em>④ 筆算へ置く</em><div className="write-one-result"><small>{place}の位の答え</small><b>{step.result}</b></div><p>答えの段へ数字を移しました。</p></div>;
}
