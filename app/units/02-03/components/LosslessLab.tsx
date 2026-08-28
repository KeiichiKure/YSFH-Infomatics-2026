'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { PrefixCodeTree } from './PrefixCodeTree';
import { VideoDifferenceScene } from './VideoDifferenceScene';

type Method = 'rle' | 'lz' | 'lzw' | 'huffman';
type HuffmanPhase = 'count' | 'assign' | 'encode' | 'decode';
type LzToken = { start: number; length: number; sourceStart: number; result: string; explanation: string; literalBytes: number };
type LzwStep = { phrase: string; joined: string; start: number; end: number; action: string; added?: { code: number; text: string }; outputAfter: number[] };
type LzwDecodeStep = {
  kind: 'read' | 'add';
  code: number;
  codeIndex: number;
  text: string;
  result: string;
  action: string;
  dictionary: { code: number; text: string }[];
  added?: { code: number; text: string };
};

function runLengthEncode(input: string) {
  const groups: { char: string; count: number }[] = [];
  for (const char of Array.from(input)) {
    const last = groups.at(-1);
    if (last?.char === char) last.count += 1;
    else groups.push({ char, count: 1 });
  }
  return groups;
}

function encodeLz(input: string) {
  const chars = Array.from(input);
  const tokens: LzToken[] = [];
  let position = 0;
  while (position < chars.length) {
    let bestLength = 0;
    let bestDistance = 0;
    for (let distance = 1; distance <= Math.min(position, 15); distance += 1) {
      let length = 0;
      while (length < 15 && position + length < chars.length && chars[position + length] === chars[position + length - distance]) length += 1;
      if (length > bestLength) { bestLength = length; bestDistance = distance; }
    }
    if (bestLength >= 3) {
      tokens.push({ start: position, length: bestLength, sourceStart: position - bestDistance, result: `[${bestDistance}, ${bestLength}]`, explanation: `${bestDistance}文字前へ戻り、そこから${bestLength}文字を読み写す`, literalBytes: 0 });
      position += bestLength;
    } else {
      const char = chars[position];
      tokens.push({ start: position, length: 1, sourceStart: -1, result: char, explanation: `前に同じ長い並びがないので「${char}」をそのまま記録する`, literalBytes: new TextEncoder().encode(char).length });
      position += 1;
    }
  }
  return tokens;
}

function buildLzwModel(input: string) {
  const chars = Array.from(input);
  const unique = Array.from(new Set(chars));
  const dictionary = new Map(unique.map((char, index) => [char, index + 1]));
  const initial = unique.map((text, index) => ({ code: index + 1, text }));
  const additions: { code: number; text: string }[] = [];
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

function decodeLzw(output: number[], initial: { code: number; text: string }[]) {
  const dictionary = new Map(initial.map(({ code, text }) => [code, text]));
  const steps: LzwDecodeStep[] = [];
  let previous = '';
  let result = '';
  for (const [codeIndex, code] of output.entries()) {
    let text = dictionary.get(code) ?? '';
    const isNewCode = !text && previous && code === dictionary.size + 1;
    if (isNewCode) text = previous + previous[0];
    result += text;
    steps.push({
      kind: 'read', code, codeIndex, text, result,
      action: isNewCode
        ? `番号${code}はまだ辞書にないが、次に作る番号だと分かる。直前の「${previous}」＋その先頭「${previous[0]}」で「${text}」と復元する。`
        : `番号${code}を現在の辞書で調べると「${text}」。復元結果の後ろへ付ける。`,
      dictionary: Array.from(dictionary, ([dictionaryCode, dictionaryText]) => ({ code: dictionaryCode, text: dictionaryText })),
    });
    if (previous && text) {
      const added = { code: dictionary.size + 1, text: previous + text[0] };
      dictionary.set(added.code, added.text);
      steps.push({
        kind: 'add', code, codeIndex, text, result, added,
        action: `前に復元したかたまり「${previous}」の後ろへ、今復元した「${text}」の先頭「${text[0]}」を足す。だから辞書${added.code}＝「${added.text}」を追加する。`,
        dictionary: Array.from(dictionary, ([dictionaryCode, dictionaryText]) => ({ code: dictionaryCode, text: dictionaryText })),
      });
    }
    previous = text;
  }
  return steps;
}

const lzwSource = 'ABABABA';
const huffmanSource = 'なまむぎなまごめなまたまご';
const huffmanRows = [
  ['ま', 4, '0'], ['な', 3, '10'], ['ご', 2, '110'], ['む', 1, '1110'],
  ['ぎ', 1, '11110'], ['め', 1, '111110'], ['た', 1, '111111'],
] as const;
const huffmanAssignmentReasons = [
  '最も多い「ま」へ、最短の1 bit「0」を割り当てる。',
  '「00」「01」は0を読んだ時点で「ま」と決まるため使えない。次に短い2 bitの「10」を「な」へ割り当てる。',
  '「100」「101」は先頭の10で「な」と決まるため使えない。「11」を文字にすると残り5種類を置く枝がなくなるので、11は分岐として残し、その先の「110」を「ご」へ割り当てる。',
  '1回の文字は、まだ文字が決まらない「111」の枝を使い、「む」を4 bitの1110にする。',
  '1110は「む」で確定したため使えない。残る1111の枝で「ぎ」を5 bitの11110にする。',
  '11110は「ぎ」で確定したため、残りは11111の枝へ進む。「め」を111110にする。',
  '最後の「た」は、残った枝の111111（6 bit）へ。この割り当てでは4 bitは使えません。1110は「む」で確定し、1111は「ぎ・め・た」へ続く分岐なので、途中で「た」と確定させると他の符号を読めなくなります。',
];
const huffmanMap = new Map<string, string>(huffmanRows.map(([symbol, , code]) => [symbol, code]));
const huffmanEncoded = Array.from(huffmanSource).map((char) => huffmanMap.get(char) ?? '').join('');

export function LosslessLab() {
  const [method, setMethod] = useState<Method>('rle');
  const [rleInput, setRleInput] = useState('すもももももももものうち');
  const [lzInput, setLzInput] = useState('すもももももももものうち');
  const [lzStep, setLzStep] = useState(0);
  const [lzwStep, setLzwStep] = useState(0);
  const [lzwDecodeStep, setLzwDecodeStep] = useState(0);
  const [huffmanPhase, setHuffmanPhase] = useState<HuffmanPhase>('count');
  const [huffmanCountStep, setHuffmanCountStep] = useState(0);
  const [huffmanAssignStep, setHuffmanAssignStep] = useState(0);
  const [huffmanStep, setHuffmanStep] = useState(0);
  const [huffmanDecodeStep, setHuffmanDecodeStep] = useState(0);
  const [huffmanDecodeBitStep, setHuffmanDecodeBitStep] = useState(0);
  const bitstreamRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const rleGroups = useMemo(() => runLengthEncode(rleInput), [rleInput]);
  const rleOutput = rleGroups.map(({ char, count }) => count > 1 ? `${char}${count}` : char).join('');
  const lzTokens = useMemo(() => encodeLz(lzInput), [lzInput]);
  const safeLzStep = Math.min(lzStep, Math.max(0, lzTokens.length - 1));
  const lzCurrent = lzTokens[safeLzStep];
  const lzOriginalBytes = new TextEncoder().encode(lzInput).length;
  const lzEstimatedBytes = lzTokens.reduce((sum, token) => sum + (token.sourceStart >= 0 ? 4 : token.literalBytes), 0);
  const lzw = useMemo(() => buildLzwModel(lzwSource), []);
  const lzwDecoded = useMemo(() => decodeLzw(lzw.output, lzw.initial), [lzw]);
  const currentLzwStep = lzw.steps[lzwStep];
  const currentLzwDecodeStep = lzwDecoded[lzwDecodeStep];
  const hasNewLzwOutput = currentLzwStep.outputAfter.length > (lzw.steps[lzwStep - 1]?.outputAfter.length ?? 0);
  const additionsAtStep = lzw.steps.slice(0, lzwStep + 1).flatMap((step) => step.added ? [step.added] : []);
  const huffmanChars = Array.from(huffmanSource);
  const countedHuffmanChars = huffmanChars.slice(0, huffmanCountStep + 1);
  const runningHuffmanCounts = huffmanRows.map(([char]) => [char, countedHuffmanChars.filter((value) => value === char).length] as const);
  const currentHuffmanAssignment = huffmanRows[huffmanAssignStep];
  const currentHuffmanChar = huffmanChars[huffmanStep];
  const currentHuffmanCode = huffmanMap.get(currentHuffmanChar) ?? '';
  const encodedHuffmanCodes = huffmanChars.slice(0, huffmanStep + 1).map((char) => huffmanMap.get(char) ?? '');
  const currentDecodedHuffmanChar = huffmanChars[huffmanDecodeStep];
  const currentDecodedHuffmanCode = huffmanMap.get(currentDecodedHuffmanChar) ?? '';
  const currentDecodedPrefix = currentDecodedHuffmanCode.slice(0, huffmanDecodeBitStep + 1);
  const isHuffmanCharacterDecided = currentDecodedPrefix === currentDecodedHuffmanCode;
  const decodedHuffmanText = huffmanChars.slice(0, huffmanDecodeStep).join('') + (isHuffmanCharacterDecided ? currentDecodedHuffmanChar : '');
  const confirmedHuffmanCount = huffmanDecodeStep + (isHuffmanCharacterDecided ? 1 : 0);
  const confirmedHuffmanCodes = huffmanChars.slice(0, confirmedHuffmanCount).map((char) => huffmanMap.get(char) ?? '');
  const confirmedBitCount = confirmedHuffmanCodes.join('').length;
  const unconfirmedPrefix = isHuffmanCharacterDecided ? '' : currentDecodedPrefix;

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => setFrame((current) => current >= 10 ? 1 : current + 1), 650);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => {
    const stream = bitstreamRef.current;
    const active = stream?.querySelector('.is-reading') ?? stream?.querySelector('.is-confirmed:last-child');
    if (!stream || !active) return;
    const activeBounds = active.getBoundingClientRect();
    const streamBounds = stream.getBoundingClientRect();
    stream.scrollLeft += activeBounds.left - streamBounds.left - stream.clientWidth / 2;
  }, [huffmanPhase, huffmanDecodeStep, huffmanDecodeBitStep, method]);

  const moveHuffmanDecodeForward = () => {
    if (huffmanDecodeBitStep < currentDecodedHuffmanCode.length - 1) {
      setHuffmanDecodeBitStep((value) => value + 1);
    } else if (huffmanDecodeStep < huffmanChars.length - 1) {
      setHuffmanDecodeStep((value) => value + 1);
      setHuffmanDecodeBitStep(0);
    }
  };

  const moveHuffmanDecodeBack = () => {
    if (huffmanDecodeBitStep > 0) {
      setHuffmanDecodeBitStep((value) => value - 1);
    } else if (huffmanDecodeStep > 0) {
      const previousIndex = huffmanDecodeStep - 1;
      setHuffmanDecodeStep(previousIndex);
      setHuffmanDecodeBitStep((huffmanMap.get(huffmanChars[previousIndex]) ?? '').length - 1);
    }
  };

  return (
    <section className="learning-section" id="lossless">
      <div className="section-kicker"><span>03</span><p>可逆圧縮の考え方 · 教科書 p.64</p></div>
      <div className="section-title-row"><div><p className="step-label">規則を見つける</p><h2>同じ情報を、どう短く記録する？</h2></div><p className="section-question">文字列を一手ずつ読み、圧縮と伸張の仕組みを体験しよう。</p></div>
      <div className="lossless-workbench">
        <div className="lab-heading"><div><p className="step-label">LOSSLESS WORKBENCH</p><h3>圧縮方法を切り替える</h3></div><span className="print-badge"><small>プリント</small><b>9〜12</b></span></div>
        <div className="method-tabs" role="tablist" aria-label="可逆圧縮の方法">{([['rle', 'ランレングス'], ['lz', 'LZ'], ['lzw', 'LZW'], ['huffman', 'ハフマン']] as const).map(([id, label]) => <button type="button" role="tab" aria-selected={method === id} className={method === id ? 'is-active' : ''} onClick={() => setMethod(id)} key={id}>{label}</button>)}</div>

        {method === 'rle' && <div className="method-panel" role="tabpanel">
          <div className="method-copy"><span>同じデータが何個並ぶかを記録</span><h4>連続する文字を、文字＋回数へ</h4><p>同じ値が長く続く白黒画像などに向きます。連続が少ないデータでは、かえって長くなる場合があります。</p></div>
          <label className="text-input"><span>圧縮したい文字列</span><input value={rleInput} maxLength={24} onChange={(event) => setRleInput(event.target.value)} /></label>
          <div className="rle-groups" aria-label="連続する文字のまとまり">{rleGroups.map((group, index) => <div key={index}><b>{group.char}</b><span>×{group.count}</span></div>)}</div>
          <div className="method-result"><span>圧縮後</span><code>{rleOutput || '文字を入力'}</code><small>元 {Array.from(rleInput).length}文字 → 表記 {Array.from(rleOutput).length}文字</small></div>
        </div>}

        {method === 'lz' && <div className="method-panel" role="tabpanel">
          <div className="method-copy"><span>前に出た並びを「距離と長さ」へ</span><h4>前の文字を読み写す仕組みを体験</h4><p>同じ並びをもう一度書かず、「何文字前から、何文字分か」で表します。下の文字は自由に変えられます。</p></div>
          <label className="text-input"><span>圧縮したい文字列</span><input value={lzInput} maxLength={32} onChange={(event) => { setLzInput(event.target.value); setLzStep(0); }} /></label>
          {lzCurrent ? <div className="step-experience lz-stage">
            <div className="lz-string" aria-label="LZで処理している文字列">{Array.from(lzInput).map((char, index) => { const active = index >= lzCurrent.start && index < lzCurrent.start + lzCurrent.length; const source = lzCurrent.sourceStart >= 0 && index >= lzCurrent.sourceStart && index < lzCurrent.sourceStart + lzCurrent.length; return <i className={active ? 'active' : source ? 'source' : ''} key={index}>{char}</i>; })}</div>
            <div className="step-legend"><span><i className="source" />参照する場所</span><span><i className="active" />今まとめる場所</span></div>
            <div className="lz-readout"><span>手順 {safeLzStep + 1} / {lzTokens.length}</span><strong>{lzCurrent.explanation}</strong></div>
            <input aria-label="LZ圧縮の手順" type="range" min="0" max={Math.max(0, lzTokens.length - 1)} value={safeLzStep} onChange={(event) => setLzStep(Number(event.target.value))} />
            <div className="step-buttons"><button type="button" disabled={safeLzStep === 0} onClick={() => setLzStep((value) => Math.max(0, value - 1))}>← 前へ</button><button type="button" disabled={safeLzStep >= lzTokens.length - 1} onClick={() => setLzStep((value) => Math.min(lzTokens.length - 1, value + 1))}>次へ →</button></div>
            <div className="method-result"><span>この手順で記録</span><code>{lzCurrent.result}</code><small>伸張するときは、参照先から同じ文字を読み写します。</small></div>
          </div> : <p className="empty-guide">文字を入力すると、LZの手順がここに表示されます。</p>}
          <div className="compression-size-result"><span>すべての手順をつなぐと</span><code>{lzTokens.map((token) => token.result).join('・') || '—'}</code><div><b>元：{lzOriginalBytes} byte</b><i>→</i><strong>簡略表現：約{lzEstimatedBytes} byte</strong></div><small>参照を4 byteとした学習用の概算です。実際には文字と参照を区別する印やヘッダーも必要で、短い文字列では圧縮後が増える場合があります。</small></div>
        </div>}

        {method === 'lzw' && <div className="method-panel" role="tabpanel">
          <div className="method-copy"><span>文字の並びを辞書へ登録</span><h4>辞書が育つ手順を1つずつ見る</h4><p><code>{lzwSource}</code> を左から読みます。最初はAとBだけの辞書から始め、見つけた並びへ新しい番号を付けます。</p></div>
          <div className="initial-dictionary"><span>最初から共有する辞書</span>{lzw.initial.map((item) => <i key={item.code}><b>{item.code}</b>{item.text}</i>)}</div>
          <div className="lzw-rules"><h5>操作の前に：辞書を作る約束</h5><p>圧縮側も復元側も <b>1＝A、2＝B</b> から出発。新しい並びは <b>3、4、5…の順</b> に登録します。</p><ol><li><b>圧縮側：</b>「今のかたまり＋次の1文字」が辞書になければ、今のかたまりの番号を出力し、その新しい並びを登録。辞書にあれば、さらに1文字先まで調べます。最後は残ったかたまりの番号を出力します。</li><li><b>復元側：</b>番号から文字列を戻した後、<b>「前に復元したかたまり＋今回復元したかたまりの先頭1文字」</b>を登録。最初の番号では、前のかたまりがないので登録しません。</li></ol><p className="rule-example">例：前が A、今回が B → 3＝AB を登録。次に、前が B、今回が AB → 4＝BA を登録。</p><small>まだ辞書にない「次の登録番号」が来た場合だけ、「前のかたまり＋その先頭1文字」で復元します。この例の番号5で体験できます。</small></div>
          <p className="current-action-legend">オレンジの枠と「今回」の表示＝その手順で新しく行ったこと。前の手順の結果は残して表示します。</p>
          <div className="step-experience lzw-stage">
            <span className="experience-label">オレンジの囲みが、今調べている並び</span>
            <div className="source-progress" aria-label="LZWで読む文字列">{Array.from(lzwSource).map((char, index) => {
              const isCurrent = index >= currentLzwStep.start && index <= currentLzwStep.end;
              return <i className={isCurrent ? 'is-current' : index < currentLzwStep.start ? 'is-read' : ''} key={index}>{char}<small>{index + 1}</small></i>;
            })}</div>
            <div className="step-card"><span>手順 {lzwStep + 1} / {lzw.steps.length}</span><strong>{currentLzwStep.action}</strong><p>いま調べる並び：<code>{currentLzwStep.joined}</code></p></div>
            <input aria-label="LZW圧縮の手順" type="range" min="0" max={lzw.steps.length - 1} value={lzwStep} onChange={(event) => setLzwStep(Number(event.target.value))} />
            <div className="step-buttons"><button type="button" disabled={lzwStep === 0} onClick={() => setLzwStep((value) => Math.max(0, value - 1))}>← 前へ</button><button type="button" disabled={lzwStep >= lzw.steps.length - 1} onClick={() => setLzwStep((value) => Math.min(lzw.steps.length - 1, value + 1))}>次へ →</button></div>
            <div className="dictionary-growth"><div><span>ここまでに追加した辞書</span><p>{additionsAtStep.length ? additionsAtStep.map((item) => <i className={currentLzwStep.added?.code === item.code ? 'is-new' : ''} key={item.code}><b>{item.code}</b>{item.text}{currentLzwStep.added?.code === item.code && <small>今回追加</small>}</i>) : 'まだ追加されていません'}</p><small>{currentLzwStep.added ? `今回：${currentLzwStep.added.code}＝${currentLzwStep.added.text}を登録` : '今回は辞書を追加しません'}</small></div><div><span>ここまでに出力した番号</span><div className="lzw-emitted-codes">{currentLzwStep.outputAfter.map((code, index) => <i className={hasNewLzwOutput && index === currentLzwStep.outputAfter.length - 1 ? 'is-new' : ''} key={index}><b>{code}</b>{hasNewLzwOutput && index === currentLzwStep.outputAfter.length - 1 && <small>今回出力</small>}</i>)}</div><small>{hasNewLzwOutput ? `今回：番号${currentLzwStep.outputAfter.at(-1)}を出力` : '今回はまだ番号を出しません'}</small></div></div>
          </div>
          <div className="dictionary-answer"><span>追加した辞書そのものは送らなくてよい</span><p>受信側も同じ初期辞書と同じ規則を使い、コードを読むたびに同じ順番で辞書を作れます。実際のファイルには、辞書の初期状態・番号のビット幅・リセット規則などを示す情報が必要です。</p></div>
          <div className="decode-lab">
            <div className="decode-heading"><span>DECODE</span><h4>番号だけから元の文字列へ戻す</h4><p>A＝1、B＝2の初期辞書と、圧縮時と同じ追加規則があれば復元できます。</p></div>
            <div className="output-code-row" aria-label="LZWで復元する番号列">{lzw.output.map((code, index) => <i className={index === currentLzwDecodeStep.codeIndex ? 'is-current' : index < currentLzwDecodeStep.codeIndex ? 'is-read' : ''} key={index}>{code}</i>)}</div>
            <div className="step-card"><span>復元 {lzwDecodeStep + 1} / {lzwDecoded.length} · {currentLzwDecodeStep.kind === 'read' ? '番号を読む' : '辞書へ登録'}</span><strong>{currentLzwDecodeStep.action}</strong>{currentLzwDecodeStep.kind === 'read' && <p>番号 <code>{currentLzwDecodeStep.code}</code> → 文字列 <code>{currentLzwDecodeStep.text}</code></p>}</div>
            <input aria-label="LZW復元の手順" type="range" min="0" max={lzwDecoded.length - 1} value={lzwDecodeStep} onChange={(event) => setLzwDecodeStep(Number(event.target.value))} />
            <div className="step-buttons"><button type="button" disabled={lzwDecodeStep === 0} onClick={() => setLzwDecodeStep((value) => Math.max(0, value - 1))}>← 前へ</button><button type="button" disabled={lzwDecodeStep >= lzwDecoded.length - 1} onClick={() => setLzwDecodeStep((value) => Math.min(lzwDecoded.length - 1, value + 1))}>次へ →</button></div>
            <div className="decode-dictionary"><span>復元側で育てる辞書</span><div>{currentLzwDecodeStep.dictionary.map((item) => <i className={currentLzwDecodeStep.added?.code === item.code ? 'is-new' : item.code <= 2 ? 'is-initial' : ''} key={item.code}><b>{item.code}</b><em>{item.text}</em><small>{currentLzwDecodeStep.added?.code === item.code ? '今回追加' : item.code <= 2 ? '初期辞書' : '追加済み'}</small></i>)}</div><small>{currentLzwDecodeStep.kind === 'add' ? `今回：${currentLzwDecodeStep.added?.code}＝${currentLzwDecodeStep.added?.text}を登録` : 'この手順は番号を読むだけ。辞書はまだ追加しません。'}</small></div>
            <div className="decode-result"><span>ここまでの復元結果</span><strong>{currentLzwDecodeStep.kind === 'read' ? <>{currentLzwDecodeStep.result.slice(0, -currentLzwDecodeStep.text.length)}<mark className="current-decoded-text">{currentLzwDecodeStep.text}</mark></> : currentLzwDecodeStep.result}</strong><small>{currentLzwDecodeStep.kind === 'add' ? '今回は辞書だけを追加。復元結果の文字列は変わりません。' : `今回復元：${currentLzwDecodeStep.text}（オレンジの枠）を後ろにつなぎました。`}</small></div>
          </div>
          <div className="compression-size-result"><span>この短い例の結果</span><code>出力する番号：{lzw.output.join('・')}</code><div><b>元：7文字 × 8 ＝ 56 bit</b><i>→</i><strong>番号部分：{lzw.output.length}個 × {lzw.codeBits} ＝ {lzw.output.length * lzw.codeBits} bit</strong></div><small>これは番号部分だけの値です。辞書の約束やヘッダーを含めると、この短い例では全体が増えることがあります。ここでは辞書を育てる仕組みを理解することが目的です。</small></div>
        </div>}

        {method === 'huffman' && <div className="method-panel" role="tabpanel">
          <div className="method-copy"><span>よく出る文字ほど短い符号</span><h4>数えるところから、復元まで体験</h4><p>出現回数を調べ、符号が重ならないように割り当て、その符号で圧縮・復元します。</p></div>
          <div className="huffman-phase-tabs" aria-label="ハフマン圧縮の学習段階">{([['count', '1 回数を数える'], ['assign', '2 符号を割り当てる'], ['encode', '3 圧縮する'], ['decode', '4 復元する']] as const).map(([phase, label]) => <button type="button" className={huffmanPhase === phase ? 'is-active' : ''} onClick={() => setHuffmanPhase(phase)} key={phase}>{label}</button>)}</div>

          {huffmanPhase === 'count' && <div className="step-experience">
            <span className="experience-label">圧縮前の文字列を左から1文字ずつ数える</span>
            <div className="huffman-source-characters">{huffmanChars.map((char, index) => <i className={index === huffmanCountStep ? 'is-current' : index < huffmanCountStep ? 'is-read' : ''} key={index}>{char}<small>{index + 1}</small></i>)}</div>
            <div className="step-card"><span>計測 {huffmanCountStep + 1} / {huffmanChars.length}</span><strong>{huffmanCountStep + 1}文字目の「{huffmanChars[huffmanCountStep]}」を数える</strong><p>ここまでに {huffmanCountStep + 1}文字を確認しました。</p></div>
            <input aria-label="ハフマンの文字数を数える手順" type="range" min="0" max={huffmanChars.length - 1} value={huffmanCountStep} onChange={(event) => setHuffmanCountStep(Number(event.target.value))} />
            <div className="step-buttons"><button type="button" disabled={huffmanCountStep === 0} onClick={() => setHuffmanCountStep((value) => Math.max(0, value - 1))}>← 前へ</button><button type="button" disabled={huffmanCountStep >= huffmanChars.length - 1} onClick={() => setHuffmanCountStep((value) => Math.min(huffmanChars.length - 1, value + 1))}>次へ →</button></div>
            <div className="frequency-counter">{runningHuffmanCounts.map(([char, count]) => <div className={char === huffmanChars[huffmanCountStep] ? 'is-current' : ''} key={char}><b>{char}</b><span>{count}回</span></div>)}</div>
            {huffmanCountStep === huffmanChars.length - 1 && <button type="button" className="phase-next" onClick={() => setHuffmanPhase('assign')}>数え終わった → 符号を割り当てる</button>}
          </div>}

          {huffmanPhase === 'assign' && <div className="step-experience huffman-assignment">
            <div className="step-card"><span>割り当て {huffmanAssignStep + 1} / {huffmanRows.length}</span><strong>「{currentHuffmanAssignment[0]}」＝ {currentHuffmanAssignment[2]}（{currentHuffmanAssignment[2].length} bit）</strong><p>{huffmanAssignmentReasons[huffmanAssignStep]}</p></div>
            <div className="assignment-controls step-buttons"><button type="button" disabled={huffmanAssignStep === 0} onClick={() => setHuffmanAssignStep((value) => Math.max(0, value - 1))}>← 前へ</button><input aria-label="ハフマン符号を割り当てる手順" type="range" min="0" max={huffmanRows.length - 1} value={huffmanAssignStep} onChange={(event) => setHuffmanAssignStep(Number(event.target.value))} /><button type="button" onClick={() => { if (huffmanAssignStep < huffmanRows.length - 1) setHuffmanAssignStep((value) => value + 1); else { setHuffmanPhase('encode'); setHuffmanStep(0); } }}>{huffmanAssignStep === huffmanRows.length - 1 ? '圧縮する →' : '次へ →'}</button></div>
            <div className="huffman-assignment-visuals">
              <PrefixCodeTree rows={huffmanRows} step={huffmanAssignStep} />
              <div className="assignment-code-table"><div className="huffman-table-head"><span>文字</span><span>回数</span><span>対応する符号</span></div><div className="huffman-table assignment-table" aria-label="ハフマン符号の対応表">{huffmanRows.map(([char, count, code], index) => <div className={index === huffmanAssignStep ? 'is-current' : index < huffmanAssignStep ? 'is-assigned' : 'is-waiting'} key={char}><b>{char}</b><span><i style={{ width: `${count / 4 * 100}%` }} />{count}回</span><code>{index <= huffmanAssignStep ? code : '？'}<small>{index <= huffmanAssignStep ? `${code.length} bit` : '未割当'}</small></code></div>)}</div></div>
            </div>
            <p className="assignment-footnote"><b>確定した符号は、他の符号の先頭にしない（接頭語条件）。</b><br />長さの違いを体験する学習用の木です。実際のハフマン法では出現回数の少ないものを2つずつまとめるため、この例の木は最短の結果とは異なります。</p>
          </div>}

          {huffmanPhase === 'encode' && <div className="step-experience huffman-stepper">
            <div className="encoding-codebook"><span>割り当てられた符号：この表を見て置き換えよう</span><div>{huffmanRows.map(([char, , code]) => <i className={char === currentHuffmanChar ? 'is-current' : ''} key={char}><b>{char}</b><code>{code}</code><small>{code.length} bit</small></i>)}</div></div>
            <div className="huffman-source"><span>圧縮前の文字列（13文字）</span><div className="huffman-source-characters compact">{huffmanChars.map((char, index) => <i className={index === huffmanStep ? 'is-current' : index < huffmanStep ? 'is-read' : ''} key={index}>{char}</i>)}</div><small>完成した符号表どおりに、1文字ずつ0と1へ置き換えます。</small></div>
            <div className="step-card"><span>圧縮 {huffmanStep + 1} / {huffmanChars.length}</span><strong>「{currentHuffmanChar}」を <code>{currentHuffmanCode}</code> へ置き換える</strong><p>{currentHuffmanCode.length} bitの符号です。</p></div>
            <input aria-label="ハフマンで圧縮する文字" type="range" min="0" max={huffmanChars.length - 1} value={huffmanStep} onChange={(event) => setHuffmanStep(Number(event.target.value))} />
            <div className="step-buttons"><button type="button" disabled={huffmanStep === 0} onClick={() => setHuffmanStep((value) => Math.max(0, value - 1))}>← 前へ</button><button type="button" disabled={huffmanStep >= huffmanChars.length - 1} onClick={() => setHuffmanStep((value) => Math.min(huffmanChars.length - 1, value + 1))}>次へ →</button></div>
            <div className="encoded-progress"><span>ここまでに入力した符号</span><div className="encoded-symbols">{huffmanChars.map((char, index) => <i className={index === huffmanStep ? 'is-current' : index < huffmanStep ? 'is-read' : 'is-waiting'} key={index}><b>{char}</b><code>{index <= huffmanStep ? huffmanMap.get(char) : '　'}</code><small>{index === huffmanStep ? '今回入力' : index < huffmanStep ? '入力済み' : '未入力'}</small></i>)}</div><p>連続ビット列：<code>{encodedHuffmanCodes.join('')}</code></p></div>
            {huffmanStep === huffmanChars.length - 1 && <button type="button" className="phase-next" onClick={() => { setHuffmanPhase('decode'); setHuffmanDecodeStep(0); setHuffmanDecodeBitStep(0); }}>圧縮完了 → 復元する</button>}
          </div>}

          {huffmanPhase === 'decode' && <div className="step-experience huffman-stepper">
            <span className="experience-label">実際のビット列には区切りがありません。左から符号表と照らして読みます。</span>
            <div ref={bitstreamRef} className="continuous-bitstream" tabIndex={0} role="region" aria-label="区切りのない圧縮ビット列。緑の枠は確定した符号だけ。"><code>{confirmedHuffmanCodes.map((code, index) => <span className="is-confirmed" key={index}>{code}</span>)}{unconfirmedPrefix && <span className="is-reading">{unconfirmedPrefix}</span>}{huffmanEncoded.slice(confirmedBitCount + unconfirmedPrefix.length)}</code></div>
            <p className="bitstream-legend">オレンジの下線＝今読んだビット。文字が確定したときだけ緑の枠が付きます。続きのビットは、まだ区切りません。横に入りきらない場合はスクロールできます。</p>
            <div className="step-card"><span>復元する文字 {huffmanDecodeStep + 1} / {huffmanChars.length} · {huffmanDecodeBitStep + 1} bit目</span><strong>{isHuffmanCharacterDecided ? `${currentDecodedPrefix}まで読むと候補が1つになり、「${currentDecodedHuffmanChar}」に決定。` : `${currentDecodedPrefix}まで読んだ。まだ候補が複数あるので、次の1 bitを読む。`}</strong></div>
            <div className="decode-step-stable"><div className="bit-reading" aria-label="ハフマン符号を1ビットずつ読む">{Array.from({ length: 6 }, (_, index) => { const prefix = currentDecodedPrefix.slice(0, index + 1); const bit = currentDecodedPrefix[index]; const decided = prefix === currentDecodedHuffmanCode; return bit ? <div className={decided ? 'is-decided' : ''} key={index}><b>{bit}</b><span>{prefix}</span><small>{decided ? `「${currentDecodedHuffmanChar}」に決定` : '候補を絞る'}</small></div> : <div className="is-placeholder" aria-hidden="true" key={index} />; })}</div>
            <div className="decode-candidates"><span>現在残っている候補</span><div>{huffmanRows.map(([char, , code]) => { const possible = code.startsWith(currentDecodedPrefix); const decided = code === currentDecodedPrefix; return <i className={possible ? decided ? 'is-decided' : 'is-possible' : 'is-eliminated'} key={char}><b>{char}</b><code>{code}</code><small>{decided ? '確定' : possible ? '可能性あり' : '候補から外れた'}</small></i>; })}</div></div>
            <div className="step-buttons"><button type="button" disabled={huffmanDecodeStep === 0 && huffmanDecodeBitStep === 0} onClick={moveHuffmanDecodeBack}>← 1つ戻る</button><button type="button" disabled={huffmanDecodeStep === huffmanChars.length - 1 && isHuffmanCharacterDecided} onClick={moveHuffmanDecodeForward}>{isHuffmanCharacterDecided && huffmanDecodeStep < huffmanChars.length - 1 ? '次の文字へ →' : '次の1 bit →'}</button></div></div>
            <div className="decode-result"><span>ここまでの復元結果</span><strong>{decodedHuffmanText}</strong><small>符号の区切りが一意に決まるので、元の13文字へ完全に戻せます。</small></div>
          </div>}

          <div className="huffman-summary"><div><span>全て固定長なら</span><strong>{huffmanChars.length * 3} bit</strong></div><i aria-hidden="true">→</i><div><span>この学習用符号の本体</span><strong>{huffmanEncoded.length} bit</strong></div></div>
          <p className="data-caution">実際のファイルには、この対応表または木を復元するための情報も保存します。短いデータでは表の分だけ全体が増えることがあります。</p>
        </div>}
      </div>

      <div className="keyframe-lab">
        <div className="lab-heading"><div><p className="step-label">KEYFRAME &amp; DIFFERENCE</p><h3>動画は変化した部分だけを保存</h3></div><span className="print-badge"><small>プリント</small><b>13</b></span></div>
        <div className="frame-timeline"><div className="frame-step-buttons"><button type="button" disabled={frame === 1} onClick={() => { setFrame((value) => Math.max(1, value - 1)); setIsPlaying(false); }}>← 前へ</button><button type="button" className={isPlaying ? 'is-playing' : ''} onClick={() => setIsPlaying((value) => !value)}>{isPlaying ? '一時停止' : '▶ 再生'}</button><button type="button" disabled={frame === 10} onClick={() => { setFrame((value) => Math.min(10, value + 1)); setIsPlaying(false); }}>次へ →</button></div><label><span>フレーム <output>{frame} / 10</output></span><input aria-label="動画のフレーム" type="range" min="1" max="10" value={frame} onChange={(event) => { setFrame(Number(event.target.value)); setIsPlaying(false); }} /></label></div>
        <VideoDifferenceScene frame={frame} />
        <div className="video-difference-legend"><i aria-hidden="true" /><p><b>網目の場所＝差分なし。「消す」ではなく「上書きしない」</b><br />家・木の場所には前の画面がそのまま残ります。フレーム8で空と地面だけが夕方になり、9・10でも家と木は消えません。差分にある空色の鳥の跡・地面色の人の跡は、移動前の場所を背景へ戻すための変更です。</p></div>
        <p className="teacher-note">フレーム1だけをキーフレームとして全体保存し、以降は直前の画面から変化した画素だけを保存する学習モデルです。人や鳥がいた場所を背景へ戻す変更も含みます。左は、キーフレームへ差分を順に重ねて実際に復元した画面です。</p>
      </div>
    </section>
  );
}
