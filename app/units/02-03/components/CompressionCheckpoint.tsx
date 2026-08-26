'use client';

import Image from 'next/image';
import { useState } from 'react';
import understoodMascot from '@/public/mascots/student-understood.png';

const terms = [
  ['01', '圧縮', '情報をできるだけ保ちながら、ファイルサイズを小さくする処理'],
  ['02', '冗長', '同じ情報や不要な部分が含まれている状態'],
  ['03', '可逆圧縮', '伸張すると圧縮前と同一のデータへ戻る圧縮'],
  ['04', '非可逆圧縮', '重要度の低い情報も省き、完全には元へ戻らない圧縮'],
  ['05', 'エンコード', '元のデータを決められた方法で変換すること'],
  ['06', 'デコード', '変換されたデータを利用できる形へ戻すこと'],
  ['07', 'ZIP', '文書やプログラムなどに使われる代表的な可逆圧縮形式'],
  ['08', 'JPEG', '色数の多い写真に適した非可逆圧縮形式'],
  ['09', 'ランレングス圧縮', '同じデータの連続回数を記録する方法'],
  ['10', 'LZ圧縮', '過去に現れた位置と長さで同じ並びを表す方法'],
  ['11', 'LZW圧縮', '出現した文字列を辞書へ登録し、番号で表す方法'],
  ['12', 'ハフマン圧縮', '出現頻度が高いデータへ短い符号を与える方法'],
  ['13', 'キーフレーム', '動画で一定の間隔ごとに全体を保存したフレーム'],
  ['14', 'BMP', 'すべての画素を保存する非圧縮の画像形式'],
  ['15', 'GIF', 'おもに256色以下の画像に向く可逆圧縮形式'],
  ['16', '256色', 'GIFが主に扱う色数の上限'],
  ['17', 'JPEG', '写真に向き、境界線の表現が苦手な非可逆圧縮形式'],
  ['18', 'PNG', '可逆圧縮でフルカラーや透明を扱える画像形式'],
];

const finalQuestions = [
  { text: '提出するプログラム一式をまとめる', choices: ['ZIP', 'JPEG', 'AAC'], answer: 'ZIP' },
  { text: '色数の多い旅行写真を配信する', choices: ['BMP', 'JPEG', 'GIF'], answer: 'JPEG' },
  { text: '透明部分のあるフルカラー画像を劣化させず保存する', choices: ['PNG', 'JPEG', 'BMPだけ'], answer: 'PNG' },
];

export function CompressionCheckpoint() {
  const [answers, setAnswers] = useState<string[]>(['', '', '']);
  const completed = answers.every((answer, index) => answer === finalQuestions[index].answer);
  const setAnswer = (index: number, answer: string) => setAnswers((current) => current.map((value, position) => position === index ? answer : value));

  return (
    <section className="learning-section checkpoint" id="checkpoint-02-03">
      <div className="section-kicker"><span>05</span><p>プリント最終確認</p></div>
      <div className="section-title-row"><div><p className="step-label">言葉と判断をつなぐ</p><h2>重要語を体験から説明しよう</h2></div><p className="section-question">カードで①〜⑱を確認したら、3つの保存場面に答えよう。</p></div>
      <div className="term-grid">{terms.map(([number, term, meaning]) => <details key={number}><summary><span>{number}</span><strong>{term}</strong></summary><p>{meaning}</p></details>)}</div>
      <div className="compression-final-quiz">
        <p className="step-label">FINAL CHALLENGE</p><h3>目的に合う形式を選べる？</h3>
        <div>{finalQuestions.map((question, index) => <fieldset key={question.text}><legend><span>{index + 1}</span>{question.text}</legend><div>{question.choices.map((choice) => <label className={answers[index] === choice ? (choice === question.answer ? 'correct' : 'wrong') : ''} key={choice}><input type="radio" name={`final-${index}`} checked={answers[index] === choice} onChange={() => setAnswer(index, choice)} /><span>{choice}</span></label>)}</div>{answers[index] && <small>{answers[index] === question.answer ? '✓ 用途に合っています' : '可逆性やデータの特徴をもう一度確認しよう'}</small>}</fieldset>)}</div>
      </div>
      <div className={'final-challenge digit-final compression-final ' + (completed ? 'is-complete' : '')}>
        <Image src={understoodMascot} alt="理解して手を挙げる生徒のマスコット" />
        <div><p className="step-label">今日のミッション</p><h3>{completed ? '達成！ 圧縮方法を目的から選べました。' : '「小ささ」と「元へ戻せるか」を一緒に考えよう。'}</h3><p>{completed ? '圧縮率の数値が小さいほど強く圧縮されることも、プリントへ書き戻して確認しよう。' : '3問すべてに答えると、マスコットから達成メッセージが届きます。'}</p></div>
      </div>
    </section>
  );
}
