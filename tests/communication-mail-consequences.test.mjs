import test from 'node:test';
import assert from 'node:assert/strict';
import { initialAssignment, recipientReaction, privacyResult, sendMail } from '../app/units/02-04/components/communicationModels.ts';

test('B in CC/BCC receives the reply request but sees the role mismatch', () => {
  for (const role of ['CC', 'BCC']) {
    const thought = recipientReaction(sendMail({ ...initialAssignment, B: role }), 'B');
    assert.equal(thought.warning, true);
    assert.match(thought.main, /本文では自分に返信依頼/);
    assert.match(thought.detail, /本文の依頼に従い返信しよう/);
    assert.match(thought.detail, /TO/);
  }
});
test('D cannot confirm C is informed when C is hidden, and missing C is not described as delivered', () => {
  const hidden = recipientReaction(sendMail({ ...initialAssignment, C: 'BCC' }), 'D');
  assert.equal(hidden.warning, true);
  assert.match(hidden.main, /教頭Cさん/);
  assert.match(hidden.detail, /実際はBCCで届いています/);
  assert.match(hidden.detail, /重複連絡/);
  const missing = recipientReaction(sendMail({ ...initialAssignment, C: 'NONE' }), 'D');
  assert.match(missing.detail, /届いていません/);
});
test('visible regional partners explain disclosure and the lack of consent', () => {
  for (const id of ['E', 'F']) for (const role of ['TO', 'CC']) {
    const assignment = { ...initialAssignment, [id]: role };
    const thought = recipientReaction(sendMail(assignment), id);
    assert.equal(thought.warning, true);
    assert.match(thought.detail, new RegExp(`${id.toLowerCase()}@example.com`));
    assert.match(thought.detail, /同意していない/);
    assert.match(privacyResult(assignment).text, /ほかの受信者全員/);
  }
});
test('all delivered roles have an explanation and no-delivery roles do not imply a reply request', () => {
  for (const id of ['A', 'B', 'C', 'D', 'E', 'F']) for (const role of ['TO', 'CC', 'BCC', 'NONE']) {
    const thought = recipientReaction(sendMail({ ...initialAssignment, [id]: role }), id);
    assert.equal(typeof thought.warning, 'boolean');
    assert.ok(thought.main.length > 8 && thought.detail.length > 15);
    if (role === 'NONE') assert.match(thought.main, /受け取っていません/);
  }
  assert.match(recipientReaction(sendMail({ ...initialAssignment, A: 'NONE' }), 'A').detail, /送信済みフォルダ/);
});
test('a BCC viewer is warned when the other regional partner is exposed', () => {
  const thought = recipientReaction(sendMail({ ...initialAssignment, E: 'CC' }), 'F');
  assert.equal(thought.warning, true);
  assert.match(thought.main, /Eさんのアドレス/);
  assert.match(thought.detail, /e@example.com/);
  assert.match(thought.detail, /自分がBCCでも/);
});
