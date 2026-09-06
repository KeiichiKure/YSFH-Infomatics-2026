import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateJumpRate,
  contrastRatio,
  getPersona,
  getScenario,
  jumpRateLabel,
  personas,
  scenarios,
  worksheetLinks,
} from '../app/units/sp-01/components/designModels.ts';

test('jump rate examples match the worksheet explanation', () => {
  assert.equal(calculateJumpRate(36, 18), 2);
  assert.equal(calculateJumpRate(54, 18), 3);
  assert.equal(calculateJumpRate(72, 18), 4);
  assert.match(jumpRateLabel(2), /低め/);
  assert.match(jumpRateLabel(3), /中程度/);
  assert.match(jumpRateLabel(4), /高め/);
  assert.throws(() => calculateJumpRate(72, 0), /0より大きい/);
});

test('contrast ratio returns known black-white and identical-color values', () => {
  assert.equal(contrastRatio('#000000', '#ffffff'), 21);
  assert.equal(contrastRatio('#ffffff', '#ffffff'), 1);
  assert.throws(() => contrastRatio('#fff', '#ffffff'), /6桁/);
});

test('each scenario turns an observable state into an actionable target', () => {
  assert.equal(scenarios.length, 3);
  for (const scenario of scenarios) {
    const found = getScenario(scenario.id);
    assert.equal(found.id, scenario.id);
    assert.ok(found.observable.includes(found.item.split('・')[0]));
    assert.ok(found.target.length > 15);
    assert.notEqual(found.posterCanChange, found.posterCannotChange);
  }
});

test('persona data connects context to copy, place, and action', () => {
  assert.equal(personas.length, 3);
  for (const persona of personas) {
    const found = getPersona(persona.id);
    assert.equal(found.id, persona.id);
    assert.ok(found.headline.length < found.weakMessage.length + 10);
    assert.ok(found.viewingPlace.length > 0);
    assert.ok(found.rationale.endsWith('ため。'));
  }
});

test('worksheet mapping covers every planned worksheet entry', () => {
  assert.deepEqual(worksheetLinks.map((item) => [item.number, item.section]), [
    ['1-1', 1], ['1-2', 1], ['2-1', 2], ['3-1', 3], ['3-2', 3], ['3-3', 4],
  ]);
});
