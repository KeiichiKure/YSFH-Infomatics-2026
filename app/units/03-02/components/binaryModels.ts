export type ArithmeticOperation = 'add' | 'subtract';

export type ColumnStep = {
  column: number;
  left: number;
  right: number;
  incoming: number;
  result: number;
  outgoing: number;
  expression: string;
};

export function normalizeBits(value: string, width = 4) {
  const compact = value.replace(/\s/g, '');
  if (!/^[01]+$/.test(compact)) throw new Error('0と1だけを入力してください。');
  if (compact.length > width) throw new Error(`${width}ビット以内で入力してください。`);
  return compact.padStart(width, '0');
}

export function parseBits(value: string, width = 4) {
  return Number.parseInt(normalizeBits(value, width), 2);
}

export function formatBits(value: number, width = 4) {
  const modulus = 2 ** width;
  const wrapped = ((Math.trunc(value) % modulus) + modulus) % modulus;
  return wrapped.toString(2).padStart(width, '0');
}

export function buildAdditionTrace(leftValue: string, rightValue: string, width = 4) {
  const left = normalizeBits(leftValue, width);
  const right = normalizeBits(rightValue, width);
  const steps: ColumnStep[] = [];
  let carry = 0;
  for (let column = width - 1; column >= 0; column--) {
    const leftBit = Number(left[column]);
    const rightBit = Number(right[column]);
    const total = leftBit + rightBit + carry;
    const result = total % 2;
    const outgoing = Math.floor(total / 2);
    steps.push({
      column,
      left: leftBit,
      right: rightBit,
      incoming: carry,
      result,
      outgoing,
      expression: `${leftBit}＋${rightBit}${carry ? '＋繰り上がり1' : ''}＝${total.toString(2)}₂`,
    });
    carry = outgoing;
  }
  return {
    left,
    right,
    steps,
    result: steps.slice().reverse().map(step => step.result).join(''),
    carryOut: carry,
    fullResult: `${carry || ''}${steps.slice().reverse().map(step => step.result).join('')}`,
  };
}

export function buildSubtractionTrace(leftValue: string, rightValue: string, width = 4) {
  const left = normalizeBits(leftValue, width);
  const right = normalizeBits(rightValue, width);
  const steps: ColumnStep[] = [];
  let borrow = 0;
  for (let column = width - 1; column >= 0; column--) {
    const leftBit = Number(left[column]);
    const rightBit = Number(right[column]);
    const available = leftBit - borrow;
    const needsBorrow = available < rightBit;
    const result = available + (needsBorrow ? 2 : 0) - rightBit;
    const outgoing = needsBorrow ? 1 : 0;
    const shownLeft = available + (needsBorrow ? 2 : 0);
    steps.push({
      column,
      left: leftBit,
      right: rightBit,
      incoming: borrow,
      result,
      outgoing,
      expression: `${shownLeft.toString(2)}₂－${rightBit}${borrow ? '（右隣へ1を貸した後）' : ''}＝${result}`,
    });
    borrow = outgoing;
  }
  return {
    left,
    right,
    steps,
    result: steps.slice().reverse().map(step => step.result).join(''),
    borrowOut: borrow,
  };
}

export type BorrowFrame = {
  digits: number[];
  from: number;
  to: number;
};

export type SchoolSubtractionStep = {
  column: number;
  before: number[];
  borrowFrames: BorrowFrame[];
  working: number[];
  right: number;
  available: number;
  result: number;
};

export function buildSchoolSubtractionTrace(leftValue: string, rightValue: string, width = 4) {
  const left = normalizeBits(leftValue, width);
  const right = normalizeBits(rightValue, width);
  if (Number.parseInt(left, 2) < Number.parseInt(right, 2)) throw new Error('筆算の例は、引かれる数を引く数以上にしてください。');
  const digits = [...left].map(Number);
  const steps: SchoolSubtractionStep[] = [];
  for (let column = width - 1; column >= 0; column--) {
    const before = [...digits];
    const borrowFrames: BorrowFrame[] = [];
    const rightBit = Number(right[column]);
    if (digits[column] < rightBit) {
      let lender = column - 1;
      while (lender >= 0 && digits[lender] === 0) lender--;
      if (lender < 0) throw new Error('借りられる上位の桁がありません。');
      digits[lender] -= 1;
      digits[lender + 1] += 2;
      borrowFrames.push({ digits: [...digits], from: lender, to: lender + 1 });
      for (let position = lender + 1; position < column; position++) {
        digits[position] -= 1;
        digits[position + 1] += 2;
        borrowFrames.push({ digits: [...digits], from: position, to: position + 1 });
      }
    }
    const available = digits[column];
    const result = available - rightBit;
    steps.push({ column, before, borrowFrames, working: [...digits], right: rightBit, available, result });
  }
  return { left, right, steps, result: steps.slice().reverse().map(step => step.result).join('') };
}

export function twosComplement(value: string, width = 4) {
  const bits = normalizeBits(value, width);
  const inverted = [...bits].map(bit => bit === '0' ? '1' : '0').join('');
  const plusOne = buildAdditionTrace(inverted, formatBits(1, width), width);
  return { bits, inverted, result: plusOne.result, carryOut: plusOne.carryOut };
}

export function signedValue(value: string, width = 4) {
  const bits = normalizeBits(value, width);
  const unsigned = Number.parseInt(bits, 2);
  return bits[0] === '1' ? unsigned - 2 ** width : unsigned;
}

export function subtractWithComplement(minuendValue: string, subtrahendValue: string, width = 4) {
  const minuend = normalizeBits(minuendValue, width);
  const subtrahend = normalizeBits(subtrahendValue, width);
  const complement = twosComplement(subtrahend, width);
  const addition = buildAdditionTrace(minuend, complement.result, width);
  return { minuend, subtrahend, complement, addition, result: addition.result };
}

export function binaryFractionTrace(value: number, count = 16) {
  if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error('0以上1未満の値を指定してください。');
  const steps: { before: number; doubled: number; bit: 0 | 1; remainder: number }[] = [];
  let remainder = value;
  for (let index = 0; index < count; index++) {
    const before = remainder;
    const doubled = before * 2;
    const bit = (doubled >= 1 ? 1 : 0) as 0 | 1;
    remainder = doubled - bit;
    steps.push({ before, doubled, bit, remainder });
  }
  return steps;
}

export function approximateBinaryFraction(value: number, precision: number) {
  if (!Number.isInteger(precision) || precision < 2 || precision > 12) throw new Error('精度は2〜12ビットで指定してください。');
  const scale = 2 ** precision;
  const roundedInteger = Math.round(value * scale);
  const approximated = roundedInteger / scale;
  const bits = formatBits(roundedInteger, precision);
  return {
    value,
    precision,
    bits,
    approximated,
    error: approximated - value,
    sourceBits: binaryFractionTrace(value, Math.max(16, precision + 4)).map(step => step.bit).join(''),
  };
}

export function simulateUnsignedAddition(left: number, right: number, width = 4) {
  const max = 2 ** width - 1;
  const exact = Math.trunc(left) + Math.trunc(right);
  const stored = ((exact % (max + 1)) + max + 1) % (max + 1);
  return { left: Math.trunc(left), right: Math.trunc(right), width, max, exact, stored, overflow: exact > max || exact < 0 };
}

export function simulateUnderflow(power: number, fractionBits = 4) {
  const value = 2 ** -Math.trunc(power);
  const minimum = 2 ** -fractionBits;
  const stored = value < minimum ? 0 : value;
  return { value, minimum, stored, underflow: value > 0 && stored === 0 };
}

export function truncateDecimal(value: number, digits: number) {
  const scale = 10 ** Math.trunc(digits);
  const stored = Math.trunc(value * scale) / scale;
  return { value, digits: Math.trunc(digits), stored, error: stored - value, truncated: stored !== value };
}

export function roundToSignificant(value: number, digits = 4) {
  if (value === 0) return 0;
  const scale = 10 ** (digits - 1 - Math.floor(Math.log10(Math.abs(value))));
  return Math.round(value * scale) / scale;
}

export function simulateInformationLoss(large: number, small: number, digits = 4) {
  const before = roundToSignificant(large, digits);
  const exact = large + small;
  const stored = roundToSignificant(exact, digits);
  return { large, small, digits, before, exact, stored, lost: stored === before && small !== 0 };
}

export const finalQuestions = [
  {
    section: 1,
    text: '2進数の加算で1＋1を計算したとき、次の桁へ渡すものは？',
    choices: ['0を1つ', '1を1つ', '10をそのまま'],
    answer: 1,
    reason: '1＋1＝10₂なので、この桁には0を書き、上の桁へ1を繰り上げます。',
    feedback: ['0は今の桁へ書く値です。次の桁へは1を渡します。', '1＋1＝10₂なので、今の桁へ0を書き、次の桁へ1を渡します。', '10₂を同じ桁へ置かず、0と繰り上がり1に分けます。'],
    href: '#arithmetic',
  },
  {
    section: 2,
    text: '4ビットの減算を2の補数で行うとき、引く数に最初にする操作は？',
    choices: ['各桁の0と1を反転する', '左端の1だけ消す', '小数点を移動する'],
    answer: 0,
    reason: '各桁を反転してから1を加えると、同じ4ビット幅の2の補数になります。',
    feedback: ['各桁を反転してから1を加えると、同じビット幅の2の補数になります。', '左端は符号の判断にも使います。勝手に消してはいけません。', '小数点の移動は浮動小数点数で指数を考える操作です。'],
    href: '#complement',
  },
  {
    section: 3,
    text: '1.xxxx × 2ʸ のYに当たる部分はどれ？',
    choices: ['符号部', '指数部', '仮数部'],
    answer: 1,
    reason: '小数点を何桁動かしたかを表すYが指数部です。',
    feedback: ['符号部は正負を表します。Yは小数点を動かした回数です。', '小数点を何桁動かしたかを表すYが指数部です。', '仮数部は1.xxxxのxxxxに当たる有効な数字の並びです。'],
    href: '#real-numbers',
  },
  {
    section: 4,
    text: '0.3を有限桁の2進小数へ丸めると元の値と少しずれる主な理由は？',
    choices: ['0と1では小数を一切表せないから', '保持できるビット数が有限だから', '加算回路が減算を行うから'],
    answer: 1,
    reason: '0.3の2進表現は続くため、有限のビット数へ丸めると近似値になります。',
    feedback: ['2進数でも小数は表現できます。ただし0.3のように有限桁で終わらない値があります。', '0.3の2進表現は続くため、有限のビット数へ丸めると近似値になります。', '補数による減算とは別の現象です。有限のビット数で小数を表すことが原因です。'],
    href: '#errors',
  },
] as const;

export function isMissionComplete(answers: readonly (number | null)[]) {
  return answers.length === finalQuestions.length && finalQuestions.every((question, index) => answers[index] === question.answer);
}
