export type DictionaryEntry = { code: number; text: string };
export type LzwStep = { phrase: string; joined: string; start: number; end: number; action: string; added?: DictionaryEntry; outputAfter: number[] };
export type LzwDecodeStep = {
  kind: 'read' | 'infer' | 'add';
  code: number;
  codeIndex: number;
  text: string;
  result: string;
  action: string;
  dictionary: DictionaryEntry[];
  added?: DictionaryEntry;
};
export type CodeRow = readonly [symbol: string, count: number, code: string];

export function validateCompressionInput(input: string, method: 'lzw' | 'huffman') {
  const text = input.normalize('NFC');
  const length = Array.from(text).length;
  if (!length) return '圧縮したい文字列を入力してください。';
  if (length > 32) return `32文字以内にしてください（現在${length}文字）。`;
  if (method === 'lzw') {
    return /^[ABC]+$/.test(text) ? '' : '半角の大文字 A・B・C だけで入力してください。空白は使えません。';
  }
  if (!/^[ぁ-ゖー]+$/.test(text)) return 'ひらがなで入力してください。空白・漢字・絵文字は使えません。';
  const kinds = new Set(text).size;
  if (kinds < 2 || kinds > 7) return `文字の種類を2〜7種類にしてください（現在${kinds}種類）。`;
  return '';
}

export function buildLzwModel(input: string) {
  const chars = Array.from(input);
  const unique = Array.from(new Set(chars)).sort();
  const dictionary = new Map(unique.map((char, index) => [char, index + 1]));
  const initial = unique.map((text, index) => ({ code: index + 1, text }));
  const additions: DictionaryEntry[] = [];
  const output: number[] = [];
  const steps: LzwStep[] = [];
  let phrase = chars[0] ?? '';
  let phraseStart = 0;
  for (const [offset, next] of chars.slice(1).entries()) {
    const nextIndex = offset + 1;
    const joined = phrase + next;
    if (dictionary.has(joined)) {
      phrase = joined;
      steps.push({ phrase, joined, start: phraseStart, end: nextIndex, action: `囲んだ「${joined}」は辞書にある。まだ番号を出さず、もう1文字読む。`, outputAfter: [...output] });
    } else {
      output.push(dictionary.get(phrase) ?? 0);
      const added = { code: dictionary.size + 1, text: joined };
      dictionary.set(joined, added.code);
      additions.push(added);
      steps.push({ phrase, joined, start: phraseStart, end: nextIndex, action: `囲んだ「${joined}」は辞書にない。「${phrase}」の番号を出力し、「${joined}」を辞書へ追加する。`, added, outputAfter: [...output] });
      phrase = next;
      phraseStart = nextIndex;
    }
  }
  if (phrase) {
    output.push(dictionary.get(phrase) ?? 0);
    steps.push({ phrase, joined: phrase, start: phraseStart, end: chars.length - 1, action: `入力が終わったので、囲んだ「${phrase}」の番号を出力する。`, outputAfter: [...output] });
  }
  return { initial, additions, output, steps, codeBits: Math.max(1, Math.ceil(Math.log2(Math.max(2, dictionary.size + 1)))) };
}

export function decodeLzw(output: number[], initial: DictionaryEntry[]) {
  const dictionary = new Map(initial.map(({ code, text }) => [code, text]));
  const steps: LzwDecodeStep[] = [];
  const snapshot = () => Array.from(dictionary, ([code, text]) => ({ code, text }));
  let previous = '';
  let result = '';
  for (const [codeIndex, code] of output.entries()) {
    let text = dictionary.get(code) ?? '';
    const nextCode = dictionary.size + 1;
    const isNewCode = !text && previous !== '' && code === nextCode;
    if (isNewCode) {
      const previousCode = Array.from(dictionary).find(([, value]) => value === previous)?.[0];
      const first = Array.from(previous)[0];
      const inference = [
        `① 次の番号を確かめる：復元側の辞書は1〜${dictionary.size}まで。番号は順番に付けるので、次に登録する番号は${nextCode}。届いた番号も${code}です。圧縮側が先に作り、復元側がまだ登録できていない並びだと分かります。`,
        `② 中身を「${previous}＋？」まで絞る：圧縮側は前の「${previous}」を出力した直後に「${previous}＋次のかたまりの先頭1文字」を登録しています。復元側はその先頭文字が分からず登録待ちです。「${previous}」だけなら既存の番号${previousCode}になるので、番号${code}はそれより1文字長い並びです。`,
        `③ 「？」を決める：今届いた番号${code}の並び自体が「${previous}」から始まります。だから今回の先頭文字は「${first}」。②の「？」もその同じ先頭文字なので、「${previous}＋${first}＝${previous + first}」と一意に決まります。`,
      ];
      for (const action of inference) steps.push({ kind: 'infer', code, codeIndex, text: '', result, action, dictionary: snapshot() });
      text = previous + first;
    }
    if (!text) throw new Error(`復元できないLZW番号: ${code}`);
    result += text;
    steps.push({
      kind: 'read', code, codeIndex, text, result,
      action: isNewCode ? `推論できたので、番号${code}を「${text}」として復元結果につなぐ。次の手順で、この並びを辞書にも登録します。` : `番号${code}を現在の辞書で調べると「${text}」。復元結果の後ろへ付ける。`,
      dictionary: snapshot(),
    });
    if (previous) {
      const added = { code: dictionary.size + 1, text: previous + Array.from(text)[0] };
      dictionary.set(added.code, added.text);
      steps.push({ kind: 'add', code, codeIndex, text, result, added,
        action: `前に復元したかたまり「${previous}」の後ろへ、今復元した「${text}」の先頭「${Array.from(text)[0]}」を足す。だから辞書${added.code}＝「${added.text}」を追加する。`, dictionary: snapshot() });
    }
    previous = text;
  }
  return steps;
}

type HuffmanNode = { count: number; order: number; symbol?: string; zero?: HuffmanNode; one?: HuffmanNode };

export function buildHuffmanModel(input: string) {
  const counts = new Map<string, number>();
  for (const char of input) counts.set(char, (counts.get(char) ?? 0) + 1);
  if (counts.size < 2) throw new Error('ハフマンの学習には2種類以上の文字が必要です。');
  let order = 0;
  const queue: HuffmanNode[] = Array.from(counts).sort(([a], [b]) => a < b ? -1 : 1).map(([symbol, count]) => ({ symbol, count, order: order++ }));
  while (queue.length > 1) {
    queue.sort((a, b) => a.count - b.count || a.order - b.order);
    const zero = queue.shift()!;
    const one = queue.shift()!;
    queue.push({ count: zero.count + one.count, order: order++, zero, one });
  }
  const rows: CodeRow[] = [];
  function visit(node: HuffmanNode, code: string) {
    if (node.symbol !== undefined) rows.push([node.symbol, node.count, code]);
    else { visit(node.zero!, code + '0'); visit(node.one!, code + '1'); }
  }
  visit(queue[0], '');
  rows.sort((a, b) => a[2].length - b[2].length || (a[2] < b[2] ? -1 : 1));
  return { rows, fixedBits: Math.ceil(Math.log2(counts.size)) };
}

// Read the code stream itself, rather than consulting the original text.
export function decodePrefixBits(bits: string, rows: readonly CodeRow[]) {
  const symbols = new Map(rows.map(([symbol, , code]) => [code, symbol]));
  const decoded: { char: string; code: string }[] = [];
  let prefix = '';
  for (const bit of bits) {
    if (bit !== '0' && bit !== '1') throw new Error('ビット列は0と1だけです。');
    prefix += bit;
    const char = symbols.get(prefix);
    if (char !== undefined) { decoded.push({ char, code: prefix }); prefix = ''; }
    else if (!rows.some(([, , code]) => code.startsWith(prefix))) throw new Error('対応する符号がありません。');
  }
  if (prefix) throw new Error('ビット列が途中で終わっています。');
  return decoded;
}
