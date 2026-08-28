'use client';

import Image from 'next/image';
import { useState } from 'react';
import thinkingMascot from '@/public/mascots/student-thinking.png';
import celebratingMascot from '@/public/mascots/student-celebrating.png';
import understoodMascot from '@/public/mascots/student-understood.png';
import { worksheetTerms } from './lessonData';
import { finalQuestions, isMissionComplete } from './systemModels';
import { SectionHeading } from './LessonParts';

const additionalTerms = [
  { section: 1, term: '主記憶装置／補助記憶装置', meaning: '作業中のデータ・プログラムを保持する場所と、長く残すための保存先。' },
  { section: 2, term: 'OS／応用ソフトウェア', meaning: '機器や資源を管理する基本ソフトウェアと、文書作成など目的に応じて使うソフトウェア。' },
  { section: 2, term: '記憶管理', meaning: '各ソフトウェアが使うメモリの割り当てを管理する。プリントに番号がない欄も確認しよう。' },
  { section: 3, term: 'ユーザインタフェース', meaning: '人とコンピュータが情報をやり取りするための操作・表示などの仕組み。' },
  { section: 3, term: '抽象化', meaning: '装置ごとの違いなどを隠し、共通する情報や機能として扱えるようにする。' },
  { section: 3, term: 'Web API', meaning: 'Webサービスの機能やデータを外部のソフトウェアから利用するための窓口。' },
  { section: 4, term: 'IoT', meaning: 'モノがネットワークにつながり、情報を収集・活用したり、遠隔で制御したりする仕組み。' },
  { section: 4, term: 'センサ', meaning: '光や温度などの情報を、機器が扱える信号へ変える装置。' },
];
const reviewTerms = [...worksheetTerms, ...additionalTerms].sort((a, b) => a.section - b.section);

export function HardwareCheckpoint() {
  const [answers, setAnswers] = useState<(number | null)[]>(finalQuestions.map(() => null));
  const complete = isMissionComplete(answers);
  const correctCount = finalQuestions.filter((question, index) => answers[index] === question.answer).length;
  return <section className="learning-section checkpoint" id="checkpoint-03-01">
    <SectionHeading number="05" label="プリント最終確認" title="言葉と、働きをつなげよう。" question="緑の番号はWebの学習番号1〜4です。プリントの設問番号1〜21ではありません。カードを開いて確認しよう。" />
    <div className="term-grid">{reviewTerms.map(item => <details key={item.term}><summary><span aria-label={`Web学習${item.section}`}>{item.section}</span><strong>{item.term}</strong></summary><p>{item.meaning}</p></details>)}</div>
    <div className="hw-panel hw-checkpoint-quiz"><div className="hw-panel-heading"><div><p className="step-label">FINAL CHALLENGE</p><h3>4つの場面、説明できる？</h3></div><span className="hw-model-badge">正解 {correctCount} / 4</span></div>
      {finalQuestions.map((question, index) => <fieldset key={question.text}><legend><span>問{index + 1}</span>{question.text}</legend><div className="hw-radio-choices">{question.choices.map((choice, choiceIndex) => <label key={choice} className={answers[index] === choiceIndex ? 'is-selected' : ''}><input type="radio" name={`hw-final-${index}`} checked={answers[index] === choiceIndex} onChange={() => setAnswers(previous => previous.map((answer, position) => position === index ? choiceIndex : answer))} /><span>{choice}</span></label>)}</div><div className="hw-quiz-feedback" role="status">{answers[index] === null ? '選択肢を選ぶと説明を確認できます。' : answers[index] === question.answer ? <><b>✓ 正解。</b> {question.reason}</> : <><b>もう一度考えよう。</b> <a href={question.href}>Web学習{question.section}へ戻って確認 →</a></>}</div></fieldset>)}
      <button type="button" className="hw-button" onClick={() => setAnswers(finalQuestions.map(() => null))}>4問の解答をリセット</button>
    </div>
    <div className={'final-challenge digit-final compression-final hw-final ' + (complete ? 'is-complete' : '')}>
      <div className="final-mascot-stage">{complete && <div className="mission-confetti" aria-hidden="true">{Array.from({ length: 14 }, (_, index) => <i key={index} />)}</div>}<Image src={complete ? celebratingMascot : correctCount > 0 ? understoodMascot : thinkingMascot} alt={complete ? '笑顔で喜ぶ生徒のマスコット' : correctCount > 0 ? '理解が進んだ生徒のマスコット' : '考えている生徒のマスコット'} />{complete && <strong className="mascot-cheer">やったね！</strong>}</div>
      <div aria-live="polite"><p className="step-label">今日のミッション</p><h3>{complete ? '4問クリア！ 次は自分の言葉で。' : '「誰と誰をつなぐ？」から考えよう。'}</h3><p>{complete ? '機器・OS・アプリの協力を、印刷や照明の例で説明し、プリントに書き戻そう。' : '4問すべてに正解すると、マスコットがお祝いします。何度でも挑戦できます。'}</p></div>
    </div>
    <aside className="hw-writeback"><b>最後に、声に出して説明しよう</b><p>「アプリだけでは機器を動かせないのはなぜ？」<br />OS・API・デバイスドライバの言葉を使って、隣の人や自分自身に説明してみよう。</p><small>説明とプリント記入は自分で確認します。このページは解答を送信・保存しません。</small></aside>
  </section>;
}
