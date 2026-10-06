'use client';
import { useState } from 'react';
import '../people-integration.css';
import { SceneImage } from './SceneImage';
import { classification } from './communicationModels';
import { Section, Frame, Feedback, useAnswers, Stats, Celebration } from './LessonParts';

const cases = [
  { title: '友人へ個別に相談', senders: 1, receivers: 1, message: '受付の準備を相談したい。', received: '友人が相談を受け取る。', image: 'people-individual', alt: '静かな場所で向かい合って相談する二人の高校生。', example: '友人への悩み相談、先生との面談、個別の問い合わせ。', merit: '相手に合わせて話を深めやすく、個別の事情を共有できる。', limit: '多くの相手へ同じ説明を繰り返すと時間がかかる。', idea: '個別の相談は静かな場所で。共通の案内は別の形も組み合わせる。' },
  { title: '代表者が全員へ発表', senders: 1, receivers: 4, message: '受付は9:30からです。', received: '聞き手の全員が同じ案内を受け取る。', image: 'people-mass', alt: '代表の生徒がマイクで多数の生徒へ一斉に案内する。', example: '朝礼の連絡、避難の一斉案内、ラジオ・テレビ放送。', merit: '多くの人へ、同じ内容を一度に届けやすい。', limit: '一人一人の理解や事情を確かめにくい。返事の経路が別に必要。', idea: '一斉の案内に、質問窓口や個別確認を加える。' },
  { title: 'アンケートの回答を回収', senders: 4, receivers: 1, message: '参加できる時刻を答えます。', received: '一人の担当者に回答が集まる。', image: 'people-reverse', alt: '四人の生徒から、一人の担当者へアンケート用紙が集まる。', example: 'アンケートの回収、出欠調査、相談窓口への問い合わせ。', merit: '担当者が、多くの人の状況や意見をまとめて把握できる。', limit: '受信が集中し、担当者の確認が追い付かないことがある。', idea: '回答項目や期限をそろえ、集計しやすくする。' },
  { title: 'グループで意見交換', senders: 4, receivers: 4, message: '互いに案を出して相談する。', received: '各参加者が発信と受信の両方を行う。', image: 'people-conference', alt: '四人の生徒が机を囲み、互いに文化祭の計画を相談する。', example: '班の話し合い、会議、グループチャットでの意見交換。', merit: '異なる意見を持ち寄り、質問し合って案を深められる。', limit: '発言が重なったり、少数の人だけが話したりすることがある。', idea: '進行役や発言順を決め、決まったことを記録する。' },
] as const;
const options = ['個別型', 'マスコミ型', '逆マスコミ型', '会議型'];
function Node({ x, y, name }: { x: number; y: number; name: string }) { return <g className="cm-node"><circle cx={x} cy={y} r="29" /><text x={x} y={y + 8} textAnchor="middle">{name}</text></g>; }

export function PeopleLab({ basePath }: { basePath: string }) {
  const [index, setIndex] = useState(0), [answer, setAnswer] = useState<string | null>(null);
  const progress = useAnswers(4), s = cases[index], correct = classification(s.senders, s.receivers);
  const change = (i: number) => { setIndex(i); setAnswer(null); };
  const ys = (n: number) => n === 1 ? [145] : [54, 114, 174, 234];
  const chosen = answer === correct ? s : null;
  return <Section number={2} question="大勢がいる場面でも、情報が一人に集まるときと、全員で共有するときは同じ型？">
    <Frame id="people-lab" title="人数と矢印で見分ける">
      <div className="cm-people-top"><div className="cm-tabs" aria-label="人数の場面">{cases.map((c, i) => <button key={c.title} aria-pressed={index === i} onClick={() => change(i)}>{c.senders} → {c.receivers}人</button>)}</div><Stats answers={progress.answers} /></div>
      <div className="cm-split cm-people-integrated">
        <div className="cm-scene"><h4>{s.title}</h4>
          <svg className="cm-people-map" viewBox="0 0 500 270" role="img" aria-label={`${s.senders}人の発信者から${s.receivers}人の受信者へ。${s.senders > 1 && s.receivers > 1 ? '参加者は両方の役割を持ちます。' : ''}`}>
            <defs><marker id="cm-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10" /></marker></defs>
            <text x="80" y="19" textAnchor="middle">発信する側</text><text x="420" y="19" textAnchor="middle">受け取る側</text>
            {ys(s.senders).flatMap((y, i) => ys(s.receivers).map((to, j) => <path key={`${i}-${j}`} className="cm-flow has-delivered" d={`M112 ${y} L388 ${to}`} markerEnd="url(#cm-arrow)" markerStart={s.senders > 1 && s.receivers > 1 ? 'url(#cm-arrow)' : undefined} />))}
            {ys(s.senders).map((y, i) => <Node key={i} x={80} y={y} name={String.fromCharCode(65 + i)} />)}
            {ys(s.receivers).map((y, i) => <Node key={i} x={420} y={y} name={s.senders > 1 && s.receivers > 1 ? String.fromCharCode(65 + i) : String.fromCharCode((s.senders === 1 ? 66 : 69) + i)} />)}
          </svg>
        </div>
        <div className="cm-decision"><h4>この場面はどの型？</h4>
          <div className="cm-options cm-people-choices">{options.map(v => <button key={v} aria-pressed={answer === v} onClick={() => { setAnswer(v); progress.set(index, v === correct); }}>{v}</button>)}</div>
          {!chosen && <Feedback state={answer === null ? 'waiting' : 'bad'}>{answer === null ? <p>人数と矢印を根拠に選ぼう。正解すると、具体例と良さ・難しさが見られます。</p> : <b>× 残念。選び直してみよう。</b>}</Feedback>}
        </div>
      </div>
      {chosen && <div className="cm-people-answer" role="status" aria-live="polite"><figure className="cm-people-illustration"><SceneImage name={chosen.image} alt={chosen.alt} basePath={basePath} /></figure><section className="cm-chosen-context" aria-label={`${correct}の具体例と特性`}>
            <b>✓ 正解！ この図は{correct}</b>
            <p>{s.senders === 4 && s.receivers === 4 ? '同じ参加者が発信・受信の両方を行います。' : `発信者${s.senders === 1 ? '一人' : '多数'}から、受信者${s.receivers === 1 ? '一人' : '多数'}への伝達です。`}</p>
              <h4>{correct}を活かす場面</h4>
              <p className="cm-chosen-example"><strong>具体例：</strong>{chosen.example}</p>
              <div className="cm-trait is-benefit"><strong>＋ 良さ</strong><p>{chosen.merit}</p></div><div className="cm-trait is-limit"><strong>△ 難しさ</strong><p>{chosen.limit}</p></div><p className="cm-chosen-idea"><strong>工夫：</strong>{chosen.idea}</p>
            </section></div>}
    </Frame>
    {progress.answers.every(a => a === true) && <Celebration />}
    <p className="cm-summary">分類の根拠は、そこにいる人数だけでなく、<b>発信者と受信者の役割</b>です。同じ活動でも、一斉連絡・回答回収・意見交換を組み合わせられます。</p>
  </Section>;
}
