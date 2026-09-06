import test from 'node:test';
import assert from 'node:assert/strict';
import { maskColor, colorMissionMet, quantizeRGB, colorCSS } from '../app/units/03-03/components/colorMaskModels.ts';
import {
  bitwiseOperation,
  evaluateGate,
  evaluateNandConstruction,
  finalQuestions,
  fullAdder,
  fullAdderWithNand,
  fullAdderRows,
  gateOrder,
  halfAdder,
  halfAdderWithNand,
  isMissionComplete,
  normalizeBitString,
  reviewTerms,
  truthRows,
  worksheetLinks,
} from '../app/units/03-03/components/logicModels.ts';

test('12-bit color masks work on every color, preserve other channels, and reverse XOR twice', () => {
  for (let r = 0; r < 16; r++) for (let g = 0; g < 16; g++) for (let b = 0; b < 16; b++) {
    const source = [r, g, b];
    const results = [maskColor(source, [0, 0, 0], 'AND'), maskColor(source, [15, 15, 15], 'OR'), maskColor(source, [15, 0, 0], 'OR'), maskColor(source, [15, 15, 15], 'XOR')];
    assert.deepEqual(results, [[0, 0, 0], [15, 15, 15], [15, g, b], [15-r, 15-g, 15-b]]);
    results.forEach((result, mission) => assert.equal(colorMissionMet(mission, source, result), true));
    assert.deepEqual(maskColor(results[3], [15, 15, 15], 'XOR'), source);
  }
  assert.deepEqual(quantizeRGB(0, 128, 255), [0, 8, 15]);
  assert.equal(colorCSS([0, 15, 8]), 'rgb(0,255,136)');
  assert.equal(colorMissionMet(2, [6, 10, 12], [15, 15, 12]), false);
});

test('six gates match the worksheet truth tables', () => {
  const expected = {
    AND: [0, 0, 0, 1], NAND: [1, 1, 1, 0], OR: [0, 1, 1, 1],
    NOR: [1, 0, 0, 0], XOR: [0, 1, 1, 0], NOT: [1, 0],
  };
  assert.deepEqual(gateOrder, ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR']);
  for (const gate of gateOrder) assert.deepEqual(truthRows(gate).map(row => row.output), expected[gate]);
});

test('automatic door OR answers are worksheet 29 through 32', () => {
  assert.deepEqual([[0, 0], [0, 1], [1, 0], [1, 1]].map(([a, b]) => evaluateGate('OR', a, b)), [0, 1, 1, 1]);
});

test('NAND alone reproduces NOT, AND, and OR for every input', () => {
  for (const a of [0, 1]) {
    assert.equal(evaluateNandConstruction('NOT', a).output, evaluateGate('NOT', a));
    for (const b of [0, 1]) {
      assert.equal(evaluateNandConstruction('AND', a, b).output, evaluateGate('AND', a, b));
      assert.equal(evaluateNandConstruction('OR', a, b).output, evaluateGate('OR', a, b));
      assert.equal(evaluateGate('NAND', a, b), evaluateGate('OR', evaluateGate('NOT', a), evaluateGate('NOT', b)));
    }
  }
});

test('half adder uses only AND, OR, and NOT for carry and sum', () => {
  const rows = [[0, 0], [0, 1], [1, 0], [1, 1]].map(([a, b]) => halfAdder(a, b));
  assert.deepEqual(rows.map(row => [row.carry, row.sum]), [[0, 0], [0, 1], [0, 1], [1, 0]]);
  for (const a of [0, 1]) for (const b of [0, 1]) {
    const carry = evaluateGate('AND', a, b);
    const expectedSum = evaluateGate('AND', evaluateGate('OR', a, b), evaluateGate('NOT', carry));
    assert.equal(halfAdder(a, b).sum, expectedSum);
  }
});

test('NAND-only half and full adders match the basic-gate circuits', () => {
  for (const a of [0, 1]) for (const b of [0, 1]) {
    assert.deepEqual(halfAdderWithNand(a, b), halfAdder(a, b));
    for (const carryIn of [0, 1]) assert.deepEqual(fullAdderWithNand(a, b, carryIn), fullAdder(a, b, carryIn));
  }
});

test('full adder covers all eight rows and matches worksheet 34 through 41', () => {
  assert.equal(fullAdderRows.length, 8);
  for (const row of fullAdderRows) assert.equal(row.value, row.carry * 2 + row.sum);
  const worksheet = fullAdderRows.filter(row => row.carryIn === 1);
  assert.deepEqual(worksheet.map(row => row.carry), [0, 1, 1, 1]);
  assert.deepEqual(worksheet.map(row => row.sum), [1, 0, 0, 1]);
  assert.deepEqual(fullAdder(1, 1, 1), { a: 1, b: 1, carryIn: 1, firstSum: 0, firstCarry: 1, secondCarry: 0, carry: 1, sum: 1, value: 3 });
});

test('0101₂ plus 0011₂ combines one half adder and three full adders into 1000₂', () => {
  const one = halfAdder(1, 1);
  const two = fullAdder(0, 1, one.carry);
  const four = fullAdder(1, 0, two.carry);
  const eight = fullAdder(0, 0, four.carry);
  assert.equal(`${eight.sum}${four.sum}${two.sum}${one.sum}`, '1000');
});

test('bit masks extract, set, and selectively invert bits', () => {
  assert.equal(bitwiseOperation('11001011', '00001111', 'AND').result, '00001011');
  assert.equal(bitwiseOperation('11001011', '00001111', 'OR').result, '11001111');
  assert.equal(bitwiseOperation('11001011', '11110000', 'XOR').result, '00111011');
  assert.equal(normalizeBitString('11001011'), '11001011');
  assert.throws(() => normalizeBitString('1101'), /8ビット/);
  assert.throws(() => normalizeBitString('11002011'), /0と1/);
});

test('worksheet mapping covers the intended 1 through 43 groups', () => {
  assert.deepEqual(worksheetLinks.map(item => [item.numbers, item.section]), [
    ['1〜6', 1], ['7〜28', 1], ['29〜32', 1], ['33', 2], ['34〜41', 3], ['42', 4], ['43', 4],
  ]);
  assert.deepEqual(reviewTerms.map(term => [term.section, term.term]), [
    [1, '論理積回路'], [1, '論理和回路'], [1, '否定回路'], [1, '否定論理積回路'], [1, '否定論理和回路'], [1, '排他的論理和回路'],
    [2, '半加算回路'], [2, '全加算回路'], [3, 'ビットセット'], [3, 'ビット反転'],
  ]);
});

test('final mission requires all four unique questions to be correct', () => {
  assert.equal(new Set(finalQuestions.map(question => question.section)).size, 4);
  assert.ok(finalQuestions.every(question => question.choices.length === question.feedback.length));
  const correct = finalQuestions.map(question => question.answer);
  assert.equal(isMissionComplete(correct), true);
  assert.equal(isMissionComplete([null, null, null, null]), false);
  for (let index = 0; index < correct.length; index++) {
    const changed = [...correct];
    changed[index] = (changed[index] + 1) % finalQuestions[index].choices.length;
    assert.equal(isMissionComplete(changed), false);
  }
});
