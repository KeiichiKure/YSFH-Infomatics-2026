'use client';
import { useState } from 'react';
import { Frame, Section, Feedback, Note } from './LessonParts';
import { addressOf, initialAssignment, personIds, personRoles, privacyResult, recipientReaction, receivedMail, sendMail, type Assignment, type MailRole, type PersonId, type SentMail } from './communicationModels';
import './mail-refinement.css';

const roles: { value: MailRole; label: string }[] = [{ value: 'TO', label: 'TO' }, { value: 'CC', label: 'CC' }, { value: 'BCC', label: 'BCC' }, { value: 'NONE', label: '送らない' }];
export function MailVisibilityLab({ basePath }: { basePath: string }) {
  const [assignment, setAssignment] = useState<Assignment>({ ...initialAssignment }), [mail, setMail] = useState<SentMail | null>(null), [viewer, setViewer] = useState<PersonId>('B');
  const received = mail ? receivedMail(mail, viewer) : null, privacy = mail ? privacyResult(mail.assignment) : null;
  const configure = (next: Assignment) => { setAssignment(next); setMail(current => current ? sendMail(next) : null); };
  const thought = mail ? recipientReaction(mail, viewer) : null;
  const viewRole = assignment[viewer];
  const addressList = (list: string[]) => list.length ? list.map((address, i) => <span key={address}>{i > 0 && '、'}<span className={address === addressOf(viewer) ? 'cm-viewer-address' : undefined}>{address}</span></span>) : '（表示なし）';
  return <Section number={6} question="同じメールが届いても、すべての受信者のアドレスが見えるとは限らない。誰に何が見える？">
    <Frame id="visibility-lab" title="Aさんのメールを、B〜Fさんで見る" controls={<>
      <button className="cm-primary" onClick={() => setMail(sendMail(assignment))}>模擬送信する</button>
      <span className="cm-counter">{mail ? `${mail.recipients.length}人に配送` : '未送信'}</span>
      <button onClick={() => { setAssignment({ ...initialAssignment }); setMail(null); setViewer('B'); }}>プリントの設定へ戻す</button>
    </>}>
      <p className="cm-task"><b>条件：</b>地域の協力者E・Fさんにも案内。二人はアドレスの共有に同意していません。</p>
      <div className="cm-split cm-visibility-split">
        <div className="cm-config">
          <h4>送信者Aさんの設定</h4><p className="cm-from">FROM：a@example.com</p>
          <div className="cm-role-table">{personIds.map(id => <fieldset key={id} className={viewer === id ? 'cm-viewer-setting' : undefined}>
            <legend><b>{id}さん</b><span>{personRoles[id]}</span></legend>
            <div role="group" aria-label={`${id}さんの宛先`}>{roles.map(r => <button key={r.value} className={viewer === id && assignment[id] === r.value ? 'cm-viewer-role' : undefined} aria-pressed={assignment[id] === r.value} onClick={() => configure({ ...assignment, [id]: r.value })}>{r.label}</button>)}</div>
          </fieldset>)}</div>
          <div className="cm-presets"><button onClick={() => configure({ ...initialAssignment })}>プリントの設定</button><button onClick={() => configure({ ...initialAssignment, E: 'CC', F: 'CC' })}>E・FをCCへ</button></div>
          <Feedback state={privacy ? privacy.good ? 'good' : 'bad' : 'waiting'}>{privacy ? <><b>{privacy.good ? '✓ E・Fへの条件に合う設定' : '⚠ E・Fの宛先を見直そう'}</b><p>{privacy.text}</p></> : <><b>まず模擬送信しよう。</b><p>Aは自分にも送り、受信側の表示と控えを確認します。</p></>}</Feedback>
        </div>
        <div className="cm-received">
          <h4>誰の受信画面を見る？</h4>
          <div className="cm-tabs cm-viewers" aria-label="受信者を選ぶ">{personIds.map(id => <button key={id} aria-pressed={viewer === id} onClick={() => setViewer(id)}>{id}さん</button>)}</div>
          <div className="cm-mail cm-received-mail">
            <h4>{viewer}さん（{personRoles[viewer]}）の受信画面</h4>
            {received?.delivered ? <>
              <dl><div><dt>FROM</dt><dd>{received.from}</dd></div><div className={viewRole === 'TO' ? 'cm-viewer-header' : undefined}><dt>TO</dt><dd>{addressList(received.to)}</dd></div><div className={viewRole === 'CC' ? 'cm-viewer-header' : undefined}><dt>CC</dt><dd>{addressList(received.cc)}</dd></div><div><dt>件名</dt><dd>{received.subject}</dd></div></dl>
              <p className="cm-mail-body">{received.body}</p>
            </> : <div className="cm-inbox-wait"><span aria-hidden="true">✉</span><b>{mail ? 'このメールは届いていません' : 'まだ送信されていません'}</b><p>{mail ? `${viewer}さんは「送らない」に指定されています。` : `${viewer}さんの指定は「${viewRole === 'NONE' ? '送らない' : viewRole}」。模擬送信して、受信画面を確かめよう。`}</p></div>}
          </div>
          {thought && <div className={`cm-recipient-reaction ${thought.warning ? 'is-warning' : ''}`} role="status" aria-live="polite"><h4>{viewer}さんの受け止め{thought.warning && '・この設定で困ること'}</h4><strong>{thought.warning ? '⚠ ' : '✓ '}{thought.main}</strong><p>{thought.detail}</p></div>}
        </div>
      </div>
    </Frame>
    <p className="cm-summary"><b>届く人と、アドレスが見える人は別。</b>TOは主な相手、CCは共有用、BCCは他の受信者へアドレスを知らせずに送る相手です。</p>
    <Note title="FROMとメールアドレスの補足"><p><b>FROM</b>は差出人。今回はa@example.comで、Aさんが送信者です。<b>メールアドレスはユーザ名＠ドメイン名</b>の形で、aがユーザ名、example.comがドメイン名です。</p><p><a href={basePath + '/units/05-02/#names'}>既習のドメイン名・メールアドレスを確認する →</a></p></Note>
    <Note title="TO・CC・BCCと返信の考え方"><p>この本文は、TOの受付主担当Bさんに準備の可否と期限を指定して返信を依頼しています。Cさん（教頭）とDさん（行事責任者）は状況を把握するためCC、E・Fさんは互いのアドレスを知らせず参考共有するためBCCです。</p><p>TOなら必ず返信、CC・BCCなら返信しないという決まりではありません。設定を変えても、本文のBさんへの依頼は変わりません。実際の依頼・役割・本文から判断します。BCC受信者が全員返信すると、自分の受信を他の人へ知らせてしまう場合もあります。</p></Note>
    <Note title="BCCの表示と使い方の補足"><p>この模型はプリントの基本的な想定に合わせ、他のBCC受信者のアドレスを表示しません。自分の指定は送信者側の設定で確認できます。実際のメールアプリではBCC欄の表示方法に差があります。</p><p>BCCは本文の秘密保持を保証するものではありません。返信や転送で情報を知らせてしまう場合があります。</p><p>規格の補足：<a href="https://www.rfc-editor.org/rfc/rfc5322.html#section-3.6.3" target="_blank" rel="noreferrer">RFC 5322 §3.6.3</a>。このページは模擬送信のみで、実際のメールは送信しません。</p></Note>
  </Section>;
}
