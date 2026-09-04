'use client';

import Image from 'next/image';
import { useState } from 'react';
import thinkingMascot from '@/public/mascots/student-thinking.png';
import understoodMascot from '@/public/mascots/student-understood.png';
import celebratingMascot from '@/public/mascots/student-celebrating.png';
import { finalQuestions, isMissionComplete } from './binaryModels';
import { reviewTerms } from './lessonData';
import { SectionHeading } from './LessonParts';

export function BinaryCheckpoint() {
  const [answers, setAnswers] = useState<(number | null)[]>(finalQuestions.map(() => null));
  const answeredCount = answers.filter(answer => answer !== null).length;
  const correctCount = finalQuestions.filter((question, index) => answers[index] === question.answer).length;
  const remainingCount = finalQuestions.length - answeredCount;
  const accuracy = answeredCount === 0 ? 0 : Math.round(correctCount / answeredCount * 100);
  const complete = isMissionComplete(answers);
  return <section className="learning-section checkpoint" id="checkpoint-03-02">
    <SectionHeading number="05" label="プリント最終確認" title="計算と言葉を、理由でつなごう。" question="緑の番号はWeb学習1〜4です。プリントの設問・空欄番号ではありません。" />
    <div className="term-grid">{reviewTerms.map(item => <details key={item.term}><summary><span aria-label={`Web学習${item.section}`}>{item.section}</span><strong>{item.term}</strong></summary><p>{item.meaning}</p></details>)}</div>
    <div className="binary-panel binary-checkpoint-quiz">
      <div className="binary-panel-heading"><div><p className="step-label">FINAL CHALLENGE</p><h3>4つの場面、理由まで説明できる？</h3></div><span className="binary-model-badge">正解 {correctCount} / 4</span></div>
      <div className="quiz-progress" aria-label="確認問題の進み具合"><span>回答済み <b>{answeredCount}</b></span><span>正解 <b>{correctCount}</b></span><span>残り <b>{remainingCount}</b></span><span>正答率 <b>{accuracy}%</b></span></div>
      {finalQuestions.map((question, index) => <fieldset key={question.text}><legend><span>問{index + 1}</span>{index === 2 ? <>1.xxxx × 2<sup className="checkpoint-exponent-y">Y</sup> のYに当たる部分はどれ？</> : question.text}</legend><div className="binary-radio-choices">{question.choices.map((choice, choiceIndex) => <label key={choice} className={answers[index] === choiceIndex ? 'is-selected' : ''}><input type="radio" name={`binary-final-${index}`} checked={answers[index] === choiceIndex} onChange={() => setAnswers(previous => previous.map((answer, position) => position === index ? choiceIndex : answer))} /><span>{choice}</span></label>)}</div><div className={`binary-quiz-feedback ${answers[index] === null ? '' : answers[index] === question.answer ? 'is-correct' : 'is-wrong'}`} role="status">{answers[index] === null ? '選択肢を選ぶと、理由を確認できます。' : answers[index] === question.answer ? <><b>✓ 正解！</b> {question.reason}</> : <><b>× 残念！</b> {question.feedback[answers[index]!]} <a href={question.href}>Web学習{question.section}へ戻る →</a></>}</div></fieldset>)}
      <button type="button" className="binary-reset-button" onClick={() => setAnswers(finalQuestions.map(() => null))}>4問の解答をリセット</button>
    </div>
    <div className={'final-challenge digit-final compression-final binary-final ' + (complete ? 'is-complete' : '')}>
      <div className="final-mascot-stage">{complete && <div className="mission-confetti" aria-hidden="true">{Array.from({ length: 14 }, (_, index) => <i key={index} />)}</div>}<Image src={complete ? celebratingMascot : correctCount > 0 ? understoodMascot : thinkingMascot} alt={complete ? '笑顔で喜ぶ生徒のマスコット' : correctCount > 0 ? '理解が進んだ生徒のマスコット' : '考えている生徒のマスコット'} />{complete && <strong className="mascot-cheer">やったね！</strong>}</div>
      <div aria-live="polite"><p className="step-label">今日のミッション</p><h3>{complete ? '4問クリア！ 次は自分の言葉で。' : '1桁ずつ、理由を追いかけよう。'}</h3><p>{complete ? '補数で減算できる理由と、有限ビットで誤差が生じる理由をプリントへ書き戻そう。' : '4問すべてに正解すると、マスコットがお祝いします。何度でも挑戦できます。'}</p></div>
    </div>
    <aside className="binary-writeback"><b>最後に、声に出して説明しよう</b><p>「コンピュータは、なぜ引き算を足し算へ変えるのだろう。また、どうやって変えるのだろう？」「0.3は、なぜ少しずれる？」<br />前者は<strong>減算専用の回路を用意せず、加算回路で処理できる</strong>ことと、2の補数を使う手順をつないで説明してみよう。</p><small>説明とプリント記入は自分で確認します。このページは解答を送信・保存しません。</small></aside>
  </section>;
}
