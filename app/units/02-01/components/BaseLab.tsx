'use client';

import { useMemo, useState } from 'react';

type Base = 2 | 10 | 16;

function parseValue(text: string, base: Base) {
  const normalized = text.trim();
  const patterns = { 2: /^[01]{1,8}$/, 10: /^\d{1,3}$/, 16: /^[0-9a-fA-F]{1,2}$/ };
  if (!patterns[base].test(normalized)) return null;
  const value = parseInt(normalized, base);
  return value >= 0 && value <= 255 ? value : null;
}

function ConversionSteps({ value, base }: { value: number; base: Base }) {
  if (base === 10) {
    if (value === 0) return <p className="calculation-line">0 は2進数でも 0</p>;
    const steps: { n: number; q: number; r: number }[] = [];
    let current = value;
    while (current > 0) {
      steps.push({ n: current, q: Math.floor(current / 2), r: current % 2 });
      current = Math.floor(current / 2);
    }
    return <div className="division-steps"><p>2で割り、余りを<strong>下から上へ</strong>読む</p>{steps.map((step) => <div key={step.n}><span>{step.n}</span><i>÷ 2 =</i><b>{step.q}</b><em>余り {step.r}</em></div>)}</div>;
  }
  if (base === 2) {
    const binary = value.toString(2).padStart(8, '0');
    const active = binary.split('').map((digit, index) => ({ digit, power: 7 - index })).filter((item) => item.digit === '1');
    return <div className="weight-steps"><p>1が立っている桁の重みを足す</p><div>{active.length ? active.map((item, index) => <span key={item.power}>{index > 0 && ' + '}2<sup>{item.power}</sup></span>) : <span>0</span>}<b> = {value}</b></div></div>;
  }
  const hex = value.toString(16).toUpperCase().padStart(2, '0');
  return <div className="weight-steps"><p>各桁に16の重みを掛ける</p><div><span>{hex[0]} × 16<sup>1</sup> + {hex[1]} × 16<sup>0</sup></span><b> = {value}</b></div></div>;
}

const practiceSets = [
  { given: '10進数 120', answers: [{ label: '⑬ 2進数', value: '01111000' }, { label: '⑭ 16進数', value: '78' }] },
  { given: '10進数 255', answers: [{ label: '⑮ 2進数', value: '11111111' }, { label: '⑯ 16進数', value: 'FF' }] },
  { given: '2進数 11100011', answers: [{ label: '⑰ 10進数', value: '227' }, { label: '⑱ 16進数', value: 'E3' }] },
  { given: '2進数 01101011', answers: [{ label: '⑲ 10進数', value: '107' }, { label: '⑳ 16進数', value: '6B' }] },
  { given: '16進数 FD', answers: [{ label: '㉑ 10進数', value: '253' }, { label: '㉒ 2進数', value: '11111101' }] },
  { given: '16進数 AC', answers: [{ label: '㉓ 10進数', value: '172' }, { label: '㉔ 2進数', value: '10101100' }] },
];

export function BaseLab() {
  const [base, setBase] = useState<Base>(10);
  const [input, setInput] = useState('120');
  const value = useMemo(() => parseValue(input, base), [input, base]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [responses, setResponses] = useState(['', '']);
  const [checked, setChecked] = useState(false);
  const current = practiceSets[quizIndex];
  const allCorrect = checked && current.answers.every((answer, index) => responses[index].trim().toUpperCase() === answer.value);
  const changeBase = (next: Base) => {
    const currentValue = parseValue(input, base) ?? 120;
    setBase(next);
    setInput(currentValue.toString(next).toUpperCase());
  };
  const nextQuestion = () => {
    setQuizIndex((index) => (index + 1) % practiceSets.length);
    setResponses(['', '']);
    setChecked(false);
  };

  return (
    <section className="learning-section" id="bases">
      <div className="section-kicker"><span>04</span><p>進法の関係</p></div>
      <div className="section-title-row"><div><p className="step-label">変換する</p><h2>同じ数を、3つの顔で見る</h2></div><p className="section-question">答えだけでなく、変換の道筋を説明できるようになろう。</p></div>
      <div className="converter-panel">
        <div className="converter-input">
          <div className="segmented-control" aria-label="入力する進法">
            {[10, 2, 16].map((item) => <button type="button" key={item} className={base === item ? 'selected' : ''} aria-pressed={base === item} onClick={() => changeBase(item as Base)}>{item}進数から</button>)}
          </div>
          <label><span>0～255の値を入力</span><input value={input} onChange={(event) => setInput(event.target.value)} inputMode={base === 16 ? 'text' : 'numeric'} aria-invalid={value === null} /></label>
          {value === null && <p className="input-error" role="alert">この進法で表せる0～255の値を入力してください。</p>}
        </div>
        <div className="conversion-output" aria-live="polite">
          <div><span>10進数</span><strong>{value === null ? '—' : value}</strong></div>
          <div><span>2進数（8ビット）</span><strong>{value === null ? '—' : value.toString(2).padStart(8, '0')}</strong></div>
          <div><span>16進数</span><strong>{value === null ? '—' : value.toString(16).toUpperCase().padStart(2, '0')}</strong></div>
        </div>
        {value !== null && <ConversionSteps value={value} base={base} />}
        <div className="nibble-tip"><span>{value === null ? '----' : value.toString(2).padStart(8, '0').slice(0, 4)}</span><span>{value === null ? '----' : value.toString(2).padStart(8, '0').slice(4)}</span><i>4ビットずつ区切ると、16進数2桁になる</i></div>
        <div className="print-callout"><span>プリント ⑨・⑩</span><strong>10進法・10進数</strong><em>0～9の10種類</em><span>プリント ⑪・⑫</span><strong>16進法・16進数</strong><em>0～9とA～Fの16種類</em></div>
      </div>

      <div className="worksheet-quiz">
        <div className="quiz-heading"><div><p className="step-label">プリント連動</p><h3>⑬～㉔を自力で変換</h3></div><span>{quizIndex + 1} / {practiceSets.length}</span></div>
        <div className="quiz-given"><span>問題</span><strong>{current.given}</strong></div>
        <div className="quiz-answer-grid">
          {current.answers.map((answer, index) => <label key={answer.label}><span>{answer.label}</span><input value={responses[index]} onChange={(event) => { const next = [...responses]; next[index] = event.target.value; setResponses(next); setChecked(false); }} /><small>{checked ? (responses[index].trim().toUpperCase() === answer.value ? '正解！' : 'もう一度、途中式を確認') : '入力してください'}</small></label>)}
        </div>
        <div className="quiz-actions"><button type="button" className="check-button" onClick={() => setChecked(true)}>答えを確認</button><button type="button" className="text-button" onClick={nextQuestion}>{allCorrect ? '次の問題へ →' : '別の問題へ'}</button></div>
        <p className={`quiz-feedback ${allCorrect ? 'success' : ''}`} aria-live="polite">{checked ? (allCorrect ? '2つとも正解です。変換の流れがつながりました。' : '上の変換ラボに同じ値を入れて、途中式を確かめよう。') : '必要なら上の変換ラボをヒントとして使ってかまいません。'}</p>
      </div>
    </section>
  );
}

