import test from 'node:test';
import assert from 'node:assert/strict';
import { addressOf, initialAssignment, personIds, privacyResult, receivedMail, sendMail, classification } from '../app/units/02-04/components/communicationModels.ts';
import { terms, sections } from '../app/units/02-04/components/lessonData.ts';

test('worksheet: every blank is covered, review terms are unique and point to real sections', () => {
  assert.deepEqual(terms.flatMap(t => t.worksheetBlanks).sort((a, b) => a - b), Array.from({ length: 21 }, (_, i) => i + 1));
  assert.equal(new Set(terms.filter(t => t.review).map(t => t.term)).size, terms.filter(t => t.review).length);
  for (const term of terms) assert.equal(term.sectionId, sections[term.sectionNumber - 1].id);
});
test('the print assignment includes A as both sender and recipient; every recipient sees TO and CC only', () => {
  const sent = sendMail(initialAssignment);
  assert.deepEqual(sent.recipients, personIds);
  for (const person of personIds) {
    const view = receivedMail(sent, person);
    assert.equal(view.delivered, true);
    assert.deepEqual(view.to, ['a@example.com', 'b@example.com']);
    assert.deepEqual(view.cc, ['c@example.com', 'd@example.com']);
    assert.equal('bcc' in view, false);
    assert.equal(JSON.stringify(view).includes('e@example.com'), false);
    assert.equal(JSON.stringify(view).includes('f@example.com'), false);
  }
});
test('all 4096 assignments separate delivery from displayed addresses', () => {
  const roles = ['TO', 'CC', 'BCC', 'NONE'];
  for (let n = 0; n < 4096; n++) {
    const config = Object.fromEntries(personIds.map((p, i) => [p, roles[(n >> (i * 2)) & 3]]));
    const sent = sendMail(config);
    for (const person of personIds) {
      const view = receivedMail(sent, person);
      assert.equal(view.delivered, config[person] !== 'NONE');
      for (const p of personIds) {
        assert.equal(view.to.includes(addressOf(p)), config[p] === 'TO');
        assert.equal(view.cc.includes(addressOf(p)), config[p] === 'CC');
      }
    }
  }
});
test('editing configuration cannot rewrite an already delivered message', () => {
  const config = { ...initialAssignment }, sent = sendMail(config);
  config.E = 'CC'; config.B = 'NONE';
  assert.equal(receivedMail(sent, 'B').delivered, true);
  assert.equal(receivedMail(sent, 'B').cc.includes('e@example.com'), false);
  const next = sendMail(config);
  assert.equal(receivedMail(next, 'B').delivered, false);
  assert.equal(receivedMail(next, 'C').cc.includes('e@example.com'), true);
});
test('privacy assessment checks both delivery and the stated E/F privacy condition', () => {
  assert.equal(privacyResult(initialAssignment).good, true);
  assert.equal(privacyResult({ ...initialAssignment, E: 'CC' }).good, false);
  assert.equal(privacyResult({ ...initialAssignment, F: 'NONE' }).good, false);
  assert.equal(privacyResult({ ...initialAssignment, C: 'BCC' }).good, true);
});
test('four sender/receiver combinations have separate classifications', () => {
  assert.deepEqual([[1, 1], [1, 4], [4, 1], [4, 4]].map(([s, r]) => classification(s, r)), ['個別型', 'マスコミ型', '逆マスコミ型', '会議型']);
});
