import test from 'node:test';
import assert from 'node:assert/strict';
import {
  approximateBinaryFraction,
  binaryFractionTrace,
  buildAdditionTrace,
  buildSchoolSubtractionTrace,
  buildSubtractionTrace,
  finalQuestions,
  formatBits,
  isMissionComplete,
  normalizeBits,
  roundToSignificant,
  signedValue,
  simulateInformationLoss,
  simulateUnderflow,
  simulateUnsignedAddition,
  subtractWithComplement,
  truncateDecimal,
  twosComplement,
} from '../app/units/03-02/components/binaryModels.ts';
import { reviewTerms, worksheetLinks } from '../app/units/03-02/components/lessonData.ts';

test('4-bit input accepts only binary digits and preserves the selected width', () => {
  assert.equal(normalizeBits('1', 4), '0001');
  assert.equal(normalizeBits(' 01 10 ', 4), '0110');
  assert.equal(formatBits(17, 4), '0001');
  assert.equal(formatBits(-1, 4), '1111');
  assert.throws(() => normalizeBits('1020', 4), /0と1/);
  assert.throws(() => normalizeBits('10000', 4), /4ビット/);
});

test('worksheet addition examples keep every carry and produce the answer key results', () => {
  const examples = [
    ['1001', '0101', '1110'],
    ['0110', '0110', '1100'],
    ['0001', '0011', '0100'],
    ['0011', '0011', '0110'],
    ['1100', '0011', '1111'],
  ];
  for (const [left, right, expected] of examples) {
    const trace = buildAdditionTrace(left, right);
    assert.equal(trace.result, expected);
    assert.equal(trace.steps.length, 4);
    assert.deepEqual(trace.steps.map(step => step.column), [3, 2, 1, 0]);
    for (const step of trace.steps) {
      const expectedInputs = step.column === 3
        ? `${step.left}＋${step.right}`
        : `${step.incoming}＋${step.left}＋${step.right}`;
      assert.equal(step.expression, `${expectedInputs}＝${(step.left + step.right + step.incoming).toString(2)}₂`);
    }
    for (let index = 1; index < trace.steps.length; index++) {
      assert.equal(trace.steps[index].incoming, trace.steps[index - 1].outgoing);
    }
  }
  const overflow = buildAdditionTrace('1110', '0011');
  assert.equal(overflow.fullResult, '10001');
  assert.equal(overflow.result, '0001');
  assert.equal(overflow.carryOut, 1);
});

test('direct subtraction records borrowing and matches worksheet practice 3 and 4', () => {
  const first = buildSubtractionTrace('1000', '0101');
  assert.equal(first.result, '0011');
  assert.equal(first.borrowOut, 0);
  assert.ok(first.steps.some(step => step.outgoing === 1));
  for (let index = 1; index < first.steps.length; index++) {
    assert.equal(first.steps[index].incoming, first.steps[index - 1].outgoing);
  }
  assert.equal(buildSubtractionTrace('1100', '0011').result, '1001');
});

test('school-style subtraction moves a borrowed 1 through zero columns as 2', () => {
  const trace = buildSchoolSubtractionTrace('1000', '0101');
  assert.deepEqual(trace.steps[0].borrowFrames.map(frame => frame.digits), [
    [0, 2, 0, 0], [0, 1, 2, 0], [0, 1, 1, 2],
  ]);
  assert.equal(trace.steps[0].available, 2);
  assert.equal(trace.steps[0].result, 1);
  assert.equal(trace.result, '0011');
});

test('two\'s complement uses inversion plus one at a fixed width', () => {
  assert.deepEqual(twosComplement('0001'), { bits: '0001', inverted: '1110', result: '1111', carryOut: 0 });
  assert.equal(twosComplement('0110').result, '1010');
  assert.equal(twosComplement('0111').result, '1001');
  assert.equal(twosComplement('1000').result, '1000');
  assert.equal(twosComplement('0000').result, '0000');
  assert.equal(twosComplement('0000').carryOut, 1);
});

test('worksheet subtraction examples are performed as complement addition', () => {
  const examples = [
    ['0100', '0011', '0001'],
    ['1110', '0010', '1100'],
    ['1111', '1100', '0011'],
    ['0110', '0101', '0001'],
  ];
  for (const [left, right, expected] of examples) {
    const calculation = subtractWithComplement(left, right);
    assert.equal(calculation.result, expected);
    assert.equal(calculation.addition.result, expected);
  }
});

test('signed 4-bit interpretation covers exactly -8 through 7', () => {
  const values = Array.from({ length: 16 }, (_, value) => signedValue(value.toString(2).padStart(4, '0')));
  assert.deepEqual(values.slice(0, 8), [0, 1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual(values.slice(8), [-8, -7, -6, -5, -4, -3, -2, -1]);
});

test('0.3 repeats in binary and finite rounding stays within half a unit in the last place', () => {
  const trace = binaryFractionTrace(0.3, 12);
  assert.equal(trace.map(step => step.bit).join(''), '010011001100');
  for (const precision of [2, 4, 6, 8, 10, 12]) {
    const model = approximateBinaryFraction(0.3, precision);
    assert.equal(model.bits.length, precision);
    assert.ok(Math.abs(model.error) <= 2 ** (-precision - 1) + Number.EPSILON);
  }
  assert.equal(approximateBinaryFraction(0.3, 8).approximated, 0.30078125);
});

test('finite-width error models distinguish changed and unchanged values', () => {
  assert.deepEqual(simulateUnsignedAddition(14, 3), { left: 14, right: 3, width: 4, max: 15, exact: 17, stored: 1, overflow: true });
  assert.equal(simulateUnsignedAddition(6, 3).overflow, false);
  assert.equal(simulateUnderflow(6).underflow, true);
  assert.equal(simulateUnderflow(4).stored, 0.0625);
  assert.equal(truncateDecimal(1 / 3, 3).stored, 0.333);
  assert.equal(roundToSignificant(10001, 4), 10000);
  assert.equal(simulateInformationLoss(10000, 1).lost, true);
  assert.equal(simulateInformationLoss(10000, 100).lost, false);
});

test('worksheet links distinguish exercises from blanks and cover 1 through 22', () => {
  assert.deepEqual(worksheetLinks.map(item => [item.number, item.kind, item.section]), [
    ['1〜4', '練習', 1], ['5', '空欄', 2], ['6', '空欄', 2], ['7', '空欄', 2],
    ['8〜10', '練習', 2], ['11〜16', '練習', 2], ['17', '空欄', 3], ['18', '空欄', 3],
    ['19', '空欄', 3], ['20', '空欄', 3], ['21', '空欄', 3], ['22', '空欄', 4],
  ]);
  assert.ok(reviewTerms.every(term => term.section >= 1 && term.section <= 4));
});

test('final mission requires all four unique questions to be correct', () => {
  assert.equal(new Set(finalQuestions.map(question => question.section)).size, 4);
  assert.ok(finalQuestions.every(question => question.choices.length === question.feedback.length));
  const correct = finalQuestions.map(question => question.answer);
  assert.equal(isMissionComplete(correct), true);
  assert.equal(isMissionComplete([null, null, null, null]), false);
  for (let index = 0; index < finalQuestions.length; index++) {
    const changed = [...correct];
    changed[index] = (changed[index] + 1) % finalQuestions[index].choices.length;
    assert.equal(isMissionComplete(changed), false);
  }
});
