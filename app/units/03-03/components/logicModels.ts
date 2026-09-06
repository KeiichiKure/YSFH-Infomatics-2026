export type Bit = 0 | 1;
export type GateType = 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR';

export const gateOrder: readonly GateType[] = ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR'];

export const gateInfo: Record<GateType, { japanese: string; number: number; rule: string; formula: string }> = {
  AND: { japanese: '論理積回路', number: 1, rule: 'AとBが両方とも1のときだけ、Lが1になる。', formula: 'L = A AND B' },
  OR: { japanese: '論理和回路', number: 2, rule: 'AとBの少なくとも一方が1なら、Lが1になる。', formula: 'L = A OR B' },
  NOT: { japanese: '否定回路', number: 3, rule: 'Aを反転し、0なら1、1なら0を出力する。', formula: 'L = NOT A' },
  NAND: { japanese: '否定論理積回路', number: 4, rule: 'ANDの結果を反転する。両方が1のときだけ0になる。', formula: 'L = NOT (A AND B)' },
  NOR: { japanese: '否定論理和回路', number: 5, rule: 'ORの結果を反転する。両方が0のときだけ1になる。', formula: 'L = NOT (A OR B)' },
  XOR: { japanese: '排他的論理和回路', number: 6, rule: 'AとBが異なるときだけ、Lが1になる。', formula: 'L = A XOR B' },
};

export function evaluateGate(gate: GateType, a: Bit, b: Bit = 0): Bit {
  if (gate === 'AND') return a === 1 && b === 1 ? 1 : 0;
  if (gate === 'OR') return a === 1 || b === 1 ? 1 : 0;
  if (gate === 'NOT') return a === 0 ? 1 : 0;
  if (gate === 'NAND') return a === 1 && b === 1 ? 0 : 1;
  if (gate === 'NOR') return a === 0 && b === 0 ? 1 : 0;
  return a !== b ? 1 : 0;
}

export function truthRows(gate: GateType) {
  if (gate === 'NOT') return ([0, 1] as const).map(a => ({ a, b: null, output: evaluateGate(gate, a) }));
  return ([0, 1] as const).flatMap(a => ([0, 1] as const).map(b => ({ a, b, output: evaluateGate(gate, a, b) })));
}

export type NandTarget = 'NOT' | 'AND' | 'OR';

export function evaluateNandConstruction(target: NandTarget, a: Bit, b: Bit = 0) {
  if (target === 'NOT') {
    const output = evaluateGate('NAND', a, a);
    return { target, a, b, first: output, second: null, output };
  }
  if (target === 'AND') {
    const first = evaluateGate('NAND', a, b);
    const output = evaluateGate('NAND', first, first);
    return { target, a, b, first, second: null, output };
  }
  const first = evaluateGate('NAND', a, a);
  const second = evaluateGate('NAND', b, b);
  const output = evaluateGate('NAND', first, second);
  return { target, a, b, first, second, output };
}

export function halfAdder(a: Bit, b: Bit) {
  const carry = evaluateGate('AND', a, b);
  const either = evaluateGate('OR', a, b);
  const notCarry = evaluateGate('NOT', carry);
  const sum = evaluateGate('AND', either, notCarry);
  return { a, b, carry, sum, value: a + b };
}

export function halfAdderWithNand(a: Bit, b: Bit) {
  const notBoth = evaluateGate('NAND', a, b);
  const aOnly = evaluateGate('NAND', a, notBoth);
  const bOnly = evaluateGate('NAND', b, notBoth);
  const sum = evaluateGate('NAND', aOnly, bOnly);
  const carry = evaluateGate('NAND', notBoth, notBoth);
  return { a, b, carry, sum, value: a + b };
}

export function fullAdder(a: Bit, b: Bit, carryIn: Bit) {
  const first = halfAdder(a, b);
  const second = halfAdder(first.sum, carryIn);
  const carry = evaluateGate('OR', first.carry, second.carry);
  return { a, b, carryIn, firstSum: first.sum, firstCarry: first.carry, secondCarry: second.carry, carry, sum: second.sum, value: a + b + carryIn };
}

export function fullAdderWithNand(a: Bit, b: Bit, carryIn: Bit) {
  const first = halfAdderWithNand(a, b);
  const second = halfAdderWithNand(first.sum, carryIn);
  const notFirstCarry = evaluateGate('NAND', first.carry, first.carry);
  const notSecondCarry = evaluateGate('NAND', second.carry, second.carry);
  const carry = evaluateGate('NAND', notFirstCarry, notSecondCarry);
  return { a, b, carryIn, firstSum: first.sum, firstCarry: first.carry, secondCarry: second.carry, carry, sum: second.sum, value: a + b + carryIn };
}

export const fullAdderRows = ([0, 1] as const).flatMap(a => ([0, 1] as const).flatMap(b => ([0, 1] as const).map(carryIn => fullAdder(a, b, carryIn))));

export type BitwiseOperation = 'AND' | 'OR' | 'XOR';

export function normalizeBitString(value: string, width = 8) {
  const compact = value.replace(/\s/g, '');
  if (!/^[01]+$/.test(compact)) throw new Error('0と1だけを入力してください。');
  if (compact.length !== width) throw new Error(`${width}ビットで入力してください。`);
  return compact;
}

export function bitwiseOperation(sourceValue: string, maskValue: string, operation: BitwiseOperation) {
  const source = normalizeBitString(sourceValue);
  const mask = normalizeBitString(maskValue);
  const bits = [...source].map((bit, index) => evaluateGate(operation, Number(bit) as Bit, Number(mask[index]) as Bit));
  return { source, mask, operation, bits, result: bits.join('') };
}

export const worksheetLinks = [
  { numbers: '1〜6', section: 1, label: '論理回路の名称' },
  { numbers: '7〜28', section: 1, label: '6回路の真理値表' },
  { numbers: '29〜32', section: 1, label: '自動ドアの真理値表' },
  { numbers: '33', section: 2, label: 'NAND回路' },
  { numbers: '34〜41', section: 3, label: '全加算回路' },
  { numbers: '42', section: 4, label: 'ビットセット' },
  { numbers: '43', section: 4, label: 'ビット反転' },
] as const;

export const reviewTerms = [
  { section: 1, term: '論理積回路', detail: 'AND回路です。AとBが両方とも1のときだけ、出力が1になります。' },
  { section: 1, term: '論理和回路', detail: 'OR回路です。AとBの少なくとも一方が1なら、出力が1になります。' },
  { section: 1, term: '否定回路', detail: 'NOT回路です。入力を反転し、0なら1、1なら0を出力します。' },
  { section: 1, term: '否定論理積回路', detail: 'NAND回路です。ANDの結果を反転し、AとBが両方1のときだけ0になります。' },
  { section: 1, term: '否定論理和回路', detail: 'NOR回路です。ORの結果を反転し、AとBが両方0のときだけ1になります。' },
  { section: 1, term: '排他的論理和回路', detail: 'XOR（EOR）回路です。AとBが異なるときだけ、出力が1になります。' },
  { section: 2, term: '半加算回路', detail: '1桁の2進数を2つ加算する回路です。入力A・Bから、桁上がりCとその桁の和Sを出します。' },
  { section: 2, term: '全加算回路', detail: '1桁の2進数を3つ加算する回路です。入力A・Bと、下位からの桁上がりXを足します。' },
  { section: 3, term: 'ビットセット', detail: 'OR演算を使い、マスクが1の位置を強制的に1にする操作です。プリント空欄42です。' },
  { section: 3, term: 'ビット反転', detail: 'XOR演算を使い、マスクが1の位置だけ0と1を反転する操作です。プリント空欄43です。' },
] as const;

export const finalQuestions = [
  {
    section: 1,
    text: '入力A=1、B=0のとき、出力Lが1になる回路はどれ？',
    choices: ['AND', 'OR', 'NOR'],
    answer: 1,
    reason: 'ORは少なくとも一方が1なら出力が1になります。',
    feedback: ['ANDは両方が1のときだけ1になります。', 'ORは少なくとも一方が1なら1です。', 'NORはORを反転するため、この入力では0です。'],
    href: '#gates',
  },
  {
    section: 2,
    text: 'NAND回路に同じ入力Aを2本とも入れると、何と同じ働きになる？',
    choices: ['NOT', 'AND', 'OR'],
    answer: 0,
    reason: 'NAND(A,A)はAが1なら0、Aが0なら1となり、NOT Aと同じです。',
    feedback: ['同じAを2入力へ入れると、Aを反転した値になります。', 'ANDはNANDの出力をもう一度反転して作ります。', 'ORを作るにはAとBをそれぞれ反転してからNANDへ入れます。'],
    href: '#combinations',
  },
  {
    section: 3,
    text: '全加算回路で A=1、B=1、X=1 のとき、出力C・Sは？',
    choices: ['C=0、S=1', 'C=1、S=0', 'C=1、S=1'],
    answer: 2,
    reason: '合計は3、2進数では11₂なので、桁上がりC=1、和S=1です。',
    feedback: ['01₂は1です。3つの1を足した合計3にはなりません。', '10₂は2です。下位からのXも加える必要があります。', '3つの1の合計は3で、11₂です。'],
    href: '#adders',
  },
  {
    section: 4,
    text: '11001011の右4ビットだけを残すマスクと演算はどれ？',
    choices: ['00001111 と AND', '00001111 と OR', '11110000 と XOR'],
    answer: 0,
    reason: 'ANDではマスクが0の位置は必ず0、1の位置は元のビットが残ります。',
    feedback: ['ANDは左4ビットを0にし、右4ビットを元のまま残します。', 'ORでは右4ビットがすべて1になります。', 'XORでは左4ビットが反転します。'],
    href: '#bitwise',
  },
] as const;

export function isMissionComplete(answers: readonly (number | null)[]) {
  return answers.length === finalQuestions.length && finalQuestions.every((question, index) => answers[index] === question.answer);
}
