export type PersonId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
export type MailRole = 'TO' | 'CC' | 'BCC' | 'NONE';
export type Assignment = Record<PersonId, MailRole>;
export const personIds: PersonId[] = ['A', 'B', 'C', 'D', 'E', 'F'];
export const initialAssignment: Assignment = { A: 'TO', B: 'TO', C: 'CC', D: 'CC', E: 'BCC', F: 'BCC' };
export const personRoles: Record<PersonId, string> = { A: '連絡担当・自分', B: '受付の主担当', C: '教頭', D: '行事責任者', E: '地域協力者：田中', F: '地域協力者：佐藤' };
export const addressOf = (person: PersonId) => `${person.toLowerCase()}@example.com`;
export function sendMail(assignment: Assignment) {
  return { assignment: { ...assignment }, recipients: personIds.filter(id => assignment[id] !== 'NONE'), from: 'A' as PersonId, subject: '文化祭の受付準備・確認のお願い', body: '受付主担当 Bさん\n行事連絡担当のAです。\n10月24日の文化祭は9:30受付開始です。\n受付の机と名簿を9:00までにご準備ください。\nBさんは10月21日までに準備の可否をご返信ください。\n共有・参考の皆さまは、ご確認のみお願いします。\nよろしくお願いいたします。\n行事連絡担当 A' };
}
export type SentMail = ReturnType<typeof sendMail>;
export function receivedMail(mail: SentMail, viewer: PersonId) {
  return { delivered: mail.recipients.includes(viewer), from: addressOf(mail.from), to: personIds.filter(id => mail.assignment[id] === 'TO').map(addressOf), cc: personIds.filter(id => mail.assignment[id] === 'CC').map(addressOf), subject: mail.subject, body: mail.body };
}
export function privacyResult(assignment: Assignment) {
  const selected = (['E', 'F'] as PersonId[]).filter(id => assignment[id] !== 'NONE');
  if (selected.length < 2) return { good: false, text: 'E・Fさんの両方へ案内が届くようにしよう。' };
  const exposed = selected.filter(id => assignment[id] !== 'BCC');
  if (exposed.length) return { good: false, text: `${exposed.map(id => `${id}さんのアドレス（${addressOf(id)}）`).join('と')}がTO・CC欄に表示され、ほかの受信者全員に知られます。共有の同意がないためBCCへ。` };
  return { good: true, text: 'E・Fさんの両方に届き、二人のアドレスは他の受信者へ表示されません。' };
}
export function classification(senders: number, receivers: number) {
  return senders === 1 ? receivers === 1 ? '個別型' : 'マスコミ型' : receivers === 1 ? '逆マスコミ型' : '会議型';
}
export function recipientThought(mail: SentMail, viewer: PersonId) {
  const thought = recipientReaction(mail, viewer);
  return `${thought.main} ${thought.detail}`;
}

export function recipientReaction(mail: SentMail, viewer: PersonId) {
  const role = mail.assignment[viewer];
  if (role === 'NONE') return { warning: viewer !== 'A', main: 'このメールは受け取っていません。', detail: viewer === 'A' ? '自分の受信箱に控えは届きません。送信済みフォルダでは送ったメールを確認できます。' : viewer === 'B' ? '受付主担当Bさんに依頼が届かず、準備や返信が進みません。主な依頼先としてTOへ。' : `${viewer}さんが案内を確認できません。${viewer === 'C' || viewer === 'D' ? '管理側の把握が抜けるのでCCへ。' : '協力者にも知らせる条件なのでBCCへ。'}` };
  if (viewer === mail.from) return { warning: false, main: '自分宛ての控えを確認しよう。', detail: '受信側の表示を確かめ、届いたメールを記録として残せます。' };
  if (viewer === 'B' && role !== 'TO') return { warning: true, main: `${role}なのに、本文では自分に返信依頼？`, detail: `${role}は共有・参考の指定に見え、Bさんは対応すべきか迷います。本文の依頼に従い返信しよう。受付主担当はTOにして役割をそろえます。` };
  if (viewer === 'E' || viewer === 'F') {
    if (role !== 'BCC') return { warning: true, main: '自分のアドレスが、ほかの人にも見えている。', detail: `${viewer}さんの${addressOf(viewer)}が${role}欄に表示され、${viewer === 'E' ? 'F' : 'E'}さんを含むほかの受信者に知られます。共有に同意していないのでBCCへ。本文の案内は確認のみです。` };
    const other = viewer === 'E' ? 'F' : 'E';
    if (mail.assignment[other] === 'TO' || mail.assignment[other] === 'CC') return { warning: true, main: `${other}さんのアドレスが、自分にも見えている。`, detail: `${other}さんの${addressOf(other)}が${mail.assignment[other]}欄に出ています。共有の同意がないので、その人もBCCへ。自分がBCCでも、ほかの人のアドレスは隠せません。` };
    return { warning: false, main: '把握しておく。BCCの自分は他の受信者には表示されない。', detail: '自分のアドレスをほかの受信者に知らせず案内を受け取れます。この本文なら返信は求められていないので、内容を確認します。' };
  }
  if ((viewer === 'C' || viewer === 'D') && role !== 'CC') return { warning: true, main: role === 'BCC' ? '共有を受けたことが、ほかの担当者に見えない。' : '主な宛先だが、返信依頼はBさん宛て。', detail: role === 'BCC' ? `${viewer}さんはBCCなので、${viewer === 'C' ? '行事責任者D' : '教頭C'}さんには共有済みか分かりません。別途報告して二度手間になることも。共有先を明示するCCへ。` : '管理側にも作業や返信が必要なのか迷わせます。この本文は状況の確認のみなので、役割に合うCCへ。' };
  const hiddenManager = (['C', 'D'] as PersonId[]).find(id => id !== viewer && (mail.assignment[id] === 'BCC' || mail.assignment[id] === 'NONE'));
  if (hiddenManager) return { warning: true, main: `${personRoles[hiddenManager]}${hiddenManager}さんにも共有したのかな？`, detail: mail.assignment[hiddenManager] === 'BCC' ? `解説：実際はBCCで届いていますが、${viewer}さんの画面には見えません。別途報告が必要か迷い、重複連絡につながります。管理側はCCへ。${viewer === 'B' ? 'Bさんは本文の依頼に従い返信しよう。' : ''}` : `${hiddenManager}さんは送付先になく、案内が届いていません。管理側の把握が抜けます。共有先としてCCへ。${viewer === 'B' ? 'Bさんは本文の依頼に従い返信しよう。' : ''}` };
  if (viewer === 'B') return { warning: false, main: '準備できるか、期限までに返信しよう。', detail: 'TOの受付主担当として、本文の準備と返信の依頼に対応します。CCの教頭と行事責任者にも共有されたことが分かります。' };
  return { warning: false, main: '状況を把握。この本文なら返信は求められていない。', detail: 'TOの主担当と、他のCC受信者も確認できます。管理や状況共有のために受信しています。' };
}
