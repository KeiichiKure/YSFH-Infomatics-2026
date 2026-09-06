'use client';

import Image from 'next/image';
import { useState } from 'react';
import thinkingMascot from '@/public/mascots/student-thinking.png';
import understoodMascot from '@/public/mascots/student-understood.png';
import celebratingMascot from '@/public/mascots/student-celebrating.png';
import teacherMascot from '@/public/mascots/teacher-praise.png';
import { QuizCircuitClue } from './CircuitVisuals';
import { finalQuestions, isMissionComplete, reviewTerms } from './logicModels';
import { SectionHeading } from './LessonParts';

export function LogicCheckpoint() {
  const [answers, setAnswers] = useState<(number | null)[]>(finalQuestions.map(() => null));
  const answered = answers.filter(answer => answer !== null).length;
  const correct = finalQuestions.filter((question, index) => answers[index] === question.answer).length;
  const remaining = finalQuestions.length - answered;
  const accuracy = answered ? Math.round(correct / answered * 100) : 0;
  const complete = isMissionComplete(answers);
  return <section className="logic-learning-section logic-checkpoint" id="checkpoint-03-03">
    <SectionHeading number="05" label="プリント最終確認" title="プリントの重要語を、登場順に説明しよう。" question="閉じた状態では日本語の用語だけを確認し、開くと回路名や働きを確かめられます。" />
    <p className="review-section-note">緑の数字はプリントの空欄番号ではなく、プリント内の学習セクション番号です。</p>
    <div className="logic-term-grid">{reviewTerms.map(item => <details key={item.term}><summary><span aria-label={`プリントの学習セクション${item.section}`}>{item.section}</span><div><strong>{item.term}</strong></div></summary><p>{item.detail}</p></details>)}</div>
    <div className="logic-panel logic-final-quiz">
      <div className="logic-panel-heading"><div><p className="logic-step-label">FINAL CHALLENGE</p><h3>4つの場面を、理由で判断</h3></div><span className="score-badge">正解 {correct} / 4</span></div>
      <div className="logic-quiz-progress" aria-label="確認問題の進み具合"><span>回答済み<b>{answered}</b></span><span>正解<b>{correct}</b></span><span>残り<b>{remaining}</b></span><span>正答率<b>{accuracy}%</b></span></div>
      {finalQuestions.map((question, index) => <fieldset key={question.text}><legend><span>問{index + 1}</span>{question.text}</legend>{index === 0 && <QuizCircuitClue kind="unknown-output-gate" />}{index === 1 && <QuizCircuitClue kind="nand-equivalent" />}<div className="logic-radio-choices">{question.choices.map((choice, choiceIndex) => <label key={choice} className={answers[index] === choiceIndex ? 'is-selected' : ''}><input type="radio" name={`logic-final-${index}`} checked={answers[index] === choiceIndex} onChange={() => setAnswers(previous => previous.map((answer, position) => position === index ? choiceIndex : answer))} /><span>{choice}</span></label>)}</div><div className={`logic-quiz-feedback ${answers[index] === null ? '' : answers[index] === question.answer ? 'is-correct' : 'is-wrong'}`} role="status">{answers[index] === null ? '選択肢を選ぶと、理由を確認できます。' : answers[index] === question.answer ? <><b>✓ 正解！</b> {question.reason}</> : <><b>× 残念！</b> {question.feedback[answers[index]!]} <a href={question.href}>Web学習{question.section}へ戻る →</a></>}</div></fieldset>)}
      <button type="button" className="logic-reset" onClick={() => setAnswers(finalQuestions.map(() => null))}>4問の解答をリセット</button>
    </div>
    <div className={`logic-finale ${complete ? 'is-complete' : ''}`}><div className="logic-finale-mascots"><Image src={complete ? celebratingMascot : correct ? understoodMascot : thinkingMascot} alt={complete ? '全問正解を喜ぶ生徒のマスコット' : correct ? '理解が進んだ生徒のマスコット' : '考えている生徒のマスコット'} />{complete && <Image src={teacherMascot} alt="よくできたと褒める先生のマスコット" />}</div><div aria-live="polite"><p className="logic-step-label">今日のミッション</p><h3>{complete ? '4問クリア！ 小さな判断が計算になった。' : '入力から出力まで、信号を追おう。'}</h3><p>{complete ? 'AND・OR・NOTの組み合わせが、加算やビット操作へつながることを自分の言葉で説明しよう。' : '4問すべてに正解すると、生徒と先生のマスコットが登場します。'}</p></div></div>
    <aside className="logic-writeback"><b>最後に、演算装置くんの秘密を説明しよう</b><p>「3つの基本回路だけで、なぜ計算ができる？」「NANDだけでも基本回路を作れるとは、どういうこと？」<br />入力・出力・組み合わせ・半加算回路の言葉を使って、隣の人や自分自身に説明してみよう。</p><small>説明とプリント記入は自分で確認します。このページは解答を送信・保存しません。</small></aside>
  </section>;
}
