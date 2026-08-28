import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLzwModel, decodeLzw, buildHuffmanModel, decodePrefixBits, validateCompressionInput } from '../app/units/02-03/components/compressionModels.ts';

test('input validation: limits, scripts, normalization, and symbol counts', () => {
  for (const text of ['A', 'ABC', 'A'.repeat(32)]) assert.equal(validateCompressionInput(text, 'lzw'), '');
  for (const text of ['', 'abc', 'ＡＢ', 'AB C', 'ABD', 'A'.repeat(33)]) assert.ok(validateCompressionInput(text, 'lzw'));
  for (const text of ['あい', 'あいうえおかき', 'あ'.repeat(31) + 'い', 'か\u3099き']) assert.equal(validateCompressionInput(text, 'huffman'), '');
  for (const text of ['', 'あ', 'あああ', 'あいうえおかきく', 'あい '.repeat(2), 'アイ', '漢字', '😀あ', 'あ'.repeat(32) + 'い']) assert.ok(validateCompressionInput(text, 'huffman'));
});

test('LZW basic example: three inference steps precede output and registration', () => {
  const model = buildLzwModel('ABABABA');
  assert.deepEqual(model.output, [1, 2, 3, 5]);
  const steps = decodeLzw(model.output, model.initial);
  assert.equal(steps.length, 10);
  const inference = steps.filter(s => s.kind === 'infer');
  assert.equal(inference.length, 3);
  for (const step of inference) { assert.equal(step.code, 5); assert.equal(step.result, 'ABAB'); assert.equal(step.dictionary.length, 4); }
  assert.match(inference[1].action, /既存の番号3/);
  assert.match(inference[2].action, /AB＋A＝ABA/);
  assert.equal(steps[8].result, 'ABABABA');
  assert.equal(steps[8].dictionary.length, 4);
  assert.deepEqual(steps[9].added, { code: 5, text: 'ABA' });
});

test('LZW round trips every ABC string of length 1–8 and long boundary inputs', () => {
  let inputs = [''];
  for (let length = 1; length <= 8; length++) {
    inputs = inputs.flatMap(s => ['A', 'B', 'C'].map(c => s + c));
    for (const input of inputs) {
      const model = buildLzwModel(input);
      assert.equal(decodeLzw(model.output, model.initial).at(-1).result, input);
      assert.ok(model.output.every(code => code < 2 ** model.codeBits));
    }
  }
  for (const input of ['A'.repeat(32), 'ABC'.repeat(10) + 'AB', 'CBACBACBACBA', 'ABABABA'.repeat(4)]) {
    const model = buildLzwModel(input);
    const steps = decodeLzw(model.output, model.initial);
    assert.equal(steps.at(-1).result, input);
    for (const step of steps.filter(s => s.kind === 'infer')) assert.equal(step.code, step.dictionary.length + 1);
  }
  assert.throws(() => decodeLzw([1, 9], [{ code: 1, text: 'A' }]));
});

function checkHuffman(input) {
  const { rows, fixedBits } = buildHuffmanModel(input);
  assert.deepEqual(rows, buildHuffmanModel(input).rows);
  const lookup = new Map(rows.map(([char, , code]) => [char, code]));
  const bits = Array.from(input).map(c => lookup.get(c)).join('');
  assert.equal(decodePrefixBits(bits, rows).map(s => s.char).join(''), input);
  assert.equal(rows.reduce((sum, [, count]) => sum + count, 0), input.length);
  assert.ok(rows.every(([, , a]) => /^[01]+$/.test(a) && rows.every(([, , b]) => a === b || !b.startsWith(a))));
  assert.ok(Math.max(...rows.map(([, , code]) => code.length)) <= 6);
  assert.ok(bits.length <= input.length * fixedBits);
}

test('Huffman generated trees: balanced, skewed, maximum kinds and lengths', () => {
  for (const input of ['なまむぎなまごめなまたまご', 'すもももももももものうち', 'あいうえあいうえ', 'あい', 'あ'.repeat(31) + 'い', 'あいうえおかき', 'あいううえええお'.repeat(3)]) checkHuffman(input);
  const deepest = 'あ' + 'い' + 'う'.repeat(2) + 'え'.repeat(3) + 'お'.repeat(5) + 'か'.repeat(8) + 'き'.repeat(12);
  checkHuffman(deepest);
  assert.equal(Math.max(...buildHuffmanModel(deepest).rows.map(([, , code]) => code.length)), 5);
  assert.ok(buildHuffmanModel('あいうえあいうえ').rows.every(([, , code]) => code.length === 2));
  for (let a = 1; a <= 10; a++) for (let b = 1; b <= 10; b++) for (let c = 1; c <= 10; c++) checkHuffman('あ'.repeat(a) + 'い'.repeat(b) + 'う'.repeat(c));
  assert.throws(() => buildHuffmanModel('あ'));
  assert.throws(() => decodePrefixBits('2', [['あ', 1, '0'], ['い', 1, '1']]));
});
