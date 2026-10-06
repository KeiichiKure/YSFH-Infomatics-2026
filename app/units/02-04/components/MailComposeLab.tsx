'use client';
import { useState } from 'react';
import { Frame, Section, Feedback } from './LessonParts';
import './mail-refinement.css';

const fixes = [
  { title: '用件が分かる件名', why: '「情報Ⅰレポートの提出」なら、開く前に用件が分かります。' },
  { title: '宛名・名乗り・用件', why: '誰から誰へ、何を伝えたいかを本文の最初で示します。' },
  { title: '読みやすい改行', why: '内容のまとまりごとに改行すると、読み手が確認しやすくなります。' },
  { title: '本文末尾の署名', why: '署名で差出人の名前や所属を確認できます。' },
  { title: '添付への言及', why: '本文にもファイル名を書くと、受け手が添付を確かめやすくなります。' },
];
const comparisons = [
  ['（件名なし）', '情報Ⅰレポートの提出'],
  ['送ります。よろしくお願いします。', '情報先生／1年A組の生徒Aです。／情報Ⅰのレポートを提出します。'],
  ['宛名・名乗り・用件が一続き', '内容のまとまりごとに改行'],
  ['本文末尾に署名なし', '1年A組 生徒A／a@example.com'],
  ['本文では添付に触れていない', '添付：情報Ⅰレポート.pdf'],
];
export function MailComposeLab() {
  const [shown, setShown] = useState(false), [applied, setApplied] = useState([false, false, false, false, false]), [focus, setFocus] = useState<number | null>(null);
  const greeting = applied[1] ? ['情報先生', '1年A組の生徒Aです。', '情報Ⅰのレポートを提出します。', 'ご確認をお願いいたします。'].join(applied[2] ? '\n' : ' ') : '送ります。よろしくお願いします。';
  const highlight = (index: number) => shown && focus === index ? 'cm-mail-change' : undefined;
  function reveal() { setShown(true); setApplied([false, false, false, false, false]); setFocus(null); }
  function toggleFix(index: number) {
    setApplied(current => current.map((value, i) => i === index ? !value : index === 1 && i === 2 ? false : value));
    setFocus(index);
  }
  return <Section number={5} question="先生へレポートを提出するメールです。どこをどう改善するか、理由もペアで話し合ってみよう。">
    <Frame id="compose-lab" title="ペアアクティビティ：提出メールを整える" controls={<>
      <button className="cm-primary" onClick={reveal}>{shown ? '模範例をもう一度見る' : '話し合いが終わった'}</button>
      <button onClick={() => { setShown(false); setApplied([false, false, false, false, false]); setFocus(null); }}>話し合いからやり直す</button>
    </>}>
      <p className="cm-task"><span className="cm-pair-badge">ペアアクティビティ</span>左のメールを読んで、改善案を考えよう。{shown ? '自分たちの案と模範例を比べます。' : '話し合いが終わったら、下のボタンで模範例を開きます。'}</p>
      <div className="cm-split">
        <div className="cm-mail"><h4>{shown ? '模範例の工夫を、一つずつ試す' : '改善前のメール'}</h4><dl><div><dt>FROM</dt><dd>a@example.com</dd></div><div><dt>TO</dt><dd>teacher@example.com</dd></div><div><dt>件名</dt><dd className={highlight(0)}>{applied[0] ? '情報Ⅰレポートの提出' : '（件名なし）'}</dd></div></dl><p className={`cm-mail-body ${focus === 2 ? 'cm-mail-linebreak-change' : ''}`}><span className={highlight(1)}>{greeting}</span>{applied[4] && <>{applied[2] ? '\n' : ' '}<span className={highlight(4)}>添付：情報Ⅰレポート.pdf</span></>}{applied[3] && <>{'\n\n'}<span className={highlight(3)}>{'1年A組 生徒A\na@example.com'}</span></>}</p><div className="cm-attachment">添付：情報Ⅰレポート.pdf <span>模擬ファイル</span></div></div>
        <div className="cm-decision">{shown ? <>
          <h4>読み手のために整える</h4><div className="cm-checks">{fixes.map((f, i) => i === 2 && !applied[1] ? null : <label key={f.title}><input type="checkbox" checked={applied[i]} onChange={() => toggleFix(i)} />{f.title}</label>)}</div>
          <Feedback state="waiting"><b>{focus === null ? '自分たちの案には、どんな工夫があった？' : fixes[focus].title}</b><p>{focus === null ? '項目を選ぶと、変更箇所が黄色で強調されます。宛名・名乗り・用件を加えたら、改行も試そう。表現は一つではありません。' : fixes[focus].why}</p>{focus !== null && <><div className="cm-mail-comparison"><div><strong>変更前</strong><p>{comparisons[focus][0]}</p></div><span aria-hidden="true">→</span><div><strong>変更後</strong><p>{comparisons[focus][1]}</p></div></div><p className="cm-mail-change-state">{applied[focus] ? '✓ 変更後をメールに反映中' : '↩ チェックを外したので、変更前に戻しています'}</p></>}</Feedback>
        </> : <div className="cm-pair-wait"><b>まず、ペアで話し合おう。</b><p>読み手がこのメールを受け取ったら、何が伝わる？ 何が分かりにくい？</p><p>改善した文面と、その理由をメモしよう。話し合いが終わるまで、模範例は表示しません。</p></div>}</div>
      </div>
    </Frame>
    <p className="cm-summary"><b>読み手に、用件と差出人が伝わることが大切。</b>表現は一つではありません。提出期限や学年・番号、適切なファイル名なども、状況に応じて工夫できます。</p>
  </Section>;
}
