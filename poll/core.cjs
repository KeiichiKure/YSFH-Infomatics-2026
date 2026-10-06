/* Pure shared server rules: no browser, spreadsheet or account dependencies. */
function pollError(message) { throw new Error(message); }
function validText(value, max, label) {
  if (typeof value !== 'string' || !value.trim() || [...value.trim()].length > max) pollError(label + 'を確認してください。');
  return value.trim();
}
function validReason(value) {
  if (typeof value !== 'string' || [...value.trim()].length > 200) pollError('理由は200字以内で入力してください。');
  return value.trim();
}
function newSession(id, title, code, now) {
  return { id, title, code, createdAt: now, active: true, topic: 0, condition: 'base', phase: 'initial', votes: [], requests: [] };
}
function roundFor(session) { return session.phase === 'reconsider' ? 2 : 1; }
function topicKey(session) { return session.topic + ':' + session.condition; }
function assertActive(session) { if (!session || !session.active) pollError('この授業の受付・閲覧は終了しました。'); }
function matchingVotes(session, round) { return session.votes.filter(v => v.topic === session.topic && v.condition === session.condition && v.round === round); }
function snapshot(session, participant, now, teacher) {
  assertActive(session);
  const first = matchingVotes(session, 1), second = matchingVotes(session, 2);
  const mine = { first: first.find(v => v.participant === participant) || null, second: second.find(v => v.participant === participant) || null };
  const visible = Boolean(teacher || mine.first || mine.second || ['discussion', 'closed'].includes(session.phase));
  const group = votes => ({ total: votes.length, counts: [0, 1, 2, 3].map(c => votes.filter(v => v.choice === c).length), reasons: votes.filter(v => v.visible && v.reason).map(v => ({ id: v.id, choice: v.choice, reason: v.reason, at: v.at })) });
  const own = vote => vote ? { id: vote.id, choice: vote.choice, reason: vote.reason, at: vote.at } : null;
  return { session: { id: session.id, title: session.title, topic: session.topic, condition: session.condition, phase: session.phase }, now, visible, mine: { first: own(mine.first), second: own(mine.second) }, first: visible ? group(first) : null, second: visible ? group(second) : null };
}
function submitVote(session, participant, input, now, id) {
  assertActive(session);
  if (!participant) pollError('授業へ参加し直してください。');
  const requestId = validText(input.requestId, 100, '送信番号');
  const reason = validReason(input.reason);
  if (!Number.isInteger(input.choice) || input.choice < 0 || input.choice > 3) pollError('伝え方を一つ選んでください。');
  const signature = JSON.stringify([participant, input.sessionId, input.topic, input.condition, input.round, input.choice, reason]);
  const old = session.requests.find(r => r.id === requestId) || session.votes.find(v => v.requestId === requestId);
  if (old) { if (old.signature !== signature) pollError('同じ送信番号で異なる内容は送れません。'); return snapshot(session, participant, now, false); }
  if (input.sessionId !== session.id || input.topic !== session.topic || input.condition !== session.condition) pollError('課題が切り替わりました。最新の課題を確認してください。');
  if (!['initial', 'reconsider'].includes(session.phase) || input.round !== roundFor(session)) pollError('この回の投票受付は終了しました。');
  if (input.round === 2 && !matchingVotes(session, 1).some(v => v.participant === participant)) pollError('まず初回の投票に参加してください。');
  const existing = matchingVotes(session, input.round).find(v => v.participant === participant);
  const vote = { id: existing ? existing.id : id, participant, topic: session.topic, condition: session.condition, round: input.round, choice: input.choice, reason, at: now, visible: existing ? existing.visible : true, requestId, signature };
  if (existing) session.votes[session.votes.indexOf(existing)] = vote; else session.votes.push(vote);
  session.requests.push({ id: requestId, signature });
  return snapshot(session, participant, now, false);
}
function learnerView(session, topic, round) {
  assertActive(session);
  if (!Number.isInteger(topic) || topic < 0 || topic > 3 || ![1, 2].includes(round)) pollError('課題と投票回を確認してください。');
  // The student's topic and round never change another student's progress.
  return Object.assign({}, session, { topic, condition: 'base', phase: round === 2 ? 'reconsider' : 'initial' });
}
function learnerSnapshot(session, participant, topic, round, now) {
  return snapshot(learnerView(session, topic, round), participant, now, false);
}
function submitLearnerVote(session, participant, input, now, id) {
  if (input.condition !== 'base') pollError('投票条件を確認してください。');
  return submitVote(learnerView(session, input.topic, input.round), participant, input, now, id);
}
function manage(session, action, value) {
  assertActive(session);
  if (action === 'phase') {
    const allowed = { initial: ['discussion'], discussion: ['reconsider', 'closed'], reconsider: ['closed'], closed: [] };
    if (!allowed[session.phase].includes(value)) pollError('受付状態の順序を確認してください。');
    session.phase = value;
  } else if (action === 'topic') {
    if (!Number.isInteger(value) || value < 0 || value > 3 || value <= session.topic) pollError('次の課題を選んでください。');
    session.topic = value; session.condition = 'base'; session.phase = 'initial';
  } else if (action === 'extra') {
    if (session.condition !== 'base') pollError('追加条件は既に設定されています。');
    session.condition = 'extra'; session.phase = 'initial';
  } else if (action === 'hide' || action === 'show' || action === 'exclude') {
    const v = session.votes.find(v => v.id === value); if (!v) pollError('回答を確認してください。');
    if (action === 'exclude') session.votes = session.votes.filter(vote => vote.id !== value); else v.visible = action === 'show';
  } else if (action === 'finish') session.active = false;
  else pollError('操作を確認してください。');
}
function validCode(value, sessions) {
  if (typeof value !== 'string' || !/^\d{4}$/.test(value.trim())) pollError('授業コードは4桁の数字で入力してください。');
  const code = value.trim();
  if (sessions.some(s => s.active && String(s.code) === code)) pollError('このコードは受付中の授業で使用されています。別の4桁を選んでください。');
  return code;
}
function withAllResults(view, votes) {
  // A class voter can compare the same topic globally without casting a second vote.
  // Unvoted topics retain the same privacy gate as the class result.
  const matching = votes.filter(v => v.topic === view.session.topic && v.condition === 'base');
  const group = round => { const list = matching.filter(v => v.round === round); return { total: list.length, counts: [0,1,2,3].map(c => list.filter(v => v.choice === c).length), reasons: list.filter(v => v.visible && v.reason).map(v => ({ id:v.id, choice:v.choice, reason:v.reason, at:v.at })) }; };
  return { ...view, all: view.visible ? { first:group(1), second:group(2) } : null };
}
function publicSnapshot(votes, participant, topic, now, round = 1) {
  if (!Number.isInteger(topic) || topic < 0 || topic > 3) pollError('課題を選んでください。');
  const matching = votes.filter(v => v.topic === topic && v.condition === 'base');
  if (![1,2].includes(round)) pollError('投票回を確認してください。');
  const ownVotes = [1,2].map(r => matching.find(v => v.scope === 'community' && v.participant === participant && v.round === r));
  const visible = Boolean(ownVotes[0]);
  const group = round => { const list = matching.filter(v => v.round === round); return { total: list.length, counts: [0,1,2,3].map(c => list.filter(v => v.choice === c).length), reasons: list.filter(v => v.visible && v.reason).map(v => ({ id: v.id, choice: v.choice, reason: v.reason, at: v.at })) }; };
  const own = vote => vote ? { id: vote.id, choice: vote.choice, reason: vote.reason, at: vote.at } : null;
  return { session: { id:'community', title:'全クラスの蓄積', topic, condition:'base', phase:round === 2 ? 'reconsider' : 'initial', scope:'all' }, now, visible, mine:{ first:own(ownVotes[0]), second:own(ownVotes[1]) }, first:visible ? group(1) : null, second:visible ? group(2) : null };
}
function submitPublicVote(session, participant, input, now, id) {
  if (input.sessionId !== 'community' || session.id !== 'community') pollError('全体投票の課題を確認してください。');
  return submitLearnerVote(session, participant, input, now, id);
}
const PollCore = { newSession, snapshot, submitVote, learnerSnapshot, submitLearnerVote, manage, roundFor, topicKey, validText, validCode, withAllResults, publicSnapshot, submitPublicVote };
if (typeof module !== 'undefined') module.exports = PollCore;
