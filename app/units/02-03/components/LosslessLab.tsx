'use client';

import { useEffect, useMemo, useState } from 'react';

type Method = 'rle' | 'lz' | 'lzw' | 'huffman';
type LzToken = { start: number; length: number; sourceStart: number; result: string; explanation: string; literalBytes: number };
type LzwStep = { phrase: string; joined: string; action: string; added?: { code: number; text: string }; outputAfter: number[] };

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
  for (const next of chars.slice(1)) {
    const joined = phrase + next;
    if (dictionary.has(joined)) {
      phrase = joined;
      steps.push({ phrase, joined, action: `「${joined}」は辞書にある。まだ番号を出さず、もう1文字読む。`, outputAfter: [...output] });
    } else {
      output.push(dictionary.get(phrase) ?? 0);
      const added = { code: dictionary.size + 1, text: joined };
      dictionary.set(joined, added.code);
      additions.push(added);
      steps.push({ phrase, joined, action: `「${joined}」は辞書にない。「${phrase}」の番号を出力し、「${joined}」を辞書へ追加する。`, added, outputAfter: [...output] });
      phrase = next;
    }
  }
  if (phrase) {
    output.push(dictionary.get(phrase) ?? 0);
    steps.push({ phrase, joined: phrase, action: `入力が終わったので、残っている「${phrase}」の番号を出力する。`, outputAfter: [...output] });
  }
  return { initial, additions, output, steps, codeBits: Math.max(1, Math.ceil(Math.log2(Math.max(2, dictionary.size + 1)))) };
}

const lzwSource = 'ABABABA';
const huffmanSource = 'なまむぎなまごめなまたまご';
const huffmanRows = [
  ['ま', 4, '0'], ['な', 3, '100'], ['ご', 2, '101'], ['む', 1, '1100'],
  ['ぎ', 1, '1101'], ['め', 1, '1110'], ['た', 1, '1111'],
] as const;
const huffmanMap = new Map<string, string>(huffmanRows.map(([symbol, , code]) => [symbol, code]));
const huffmanEncoded = Array.from(huffmanSource).map((char) => huffmanMap.get(char) ?? '').join('');

export function LosslessLab() {
  const [method, setMethod] = useState<Method>('rle');
  const [rleInput, setRleInput] = useState('すもももももももものうち');
  const [lzInput, setLzInput] = useState('すもももももももものうち');
  const [lzStep, setLzStep] = useState(0);
  const [lzwStep, setLzwStep] = useState(0);
  const [huffmanStep, setHuffmanStep] = useState(0);
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
  const currentLzwStep = lzw.steps[lzwStep];
  const additionsAtStep = lzw.steps.slice(0, lzwStep + 1).flatMap((step) => step.added ? [step.added] : []);
  const huffmanChars = Array.from(huffmanSource);
  const currentHuffmanChar = huffmanChars[huffmanStep];
  const currentHuffmanCode = huffmanMap.get(currentHuffmanChar) ?? '';
  const birdVisible = frame >= 3;
  const personLeft = 18 + frame * 5;
  const birdLeft = 96 - (frame - 3) * 11;

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => setFrame((current) => current >= 10 ? 1 : current + 1), 650);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

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
          <div className="step-experience lzw-stage">
            <div className="source-progress" aria-label="LZWで読む文字列">{Array.from(lzwSource).map((char, index) => <i className={index <= lzwStep ? 'is-read' : ''} key={index}>{char}</i>)}</div>
            <div className="step-card"><span>手順 {lzwStep + 1} / {lzw.steps.length}</span><strong>{currentLzwStep.action}</strong><p>いま調べる並び：<code>{currentLzwStep.joined}</code></p></div>
            <input aria-label="LZW圧縮の手順" type="range" min="0" max={lzw.steps.length - 1} value={lzwStep} onChange={(event) => setLzwStep(Number(event.target.value))} />
            <div className="step-buttons"><button type="button" disabled={lzwStep === 0} onClick={() => setLzwStep((value) => Math.max(0, value - 1))}>← 前へ</button><button type="button" disabled={lzwStep >= lzw.steps.length - 1} onClick={() => setLzwStep((value) => Math.min(lzw.steps.length - 1, value + 1))}>次へ →</button></div>
            <div className="dictionary-growth"><div><span>ここまでに追加した辞書</span><p>{additionsAtStep.length ? additionsAtStep.map((item) => <i key={item.code}><b>{item.code}</b>{item.text}</i>) : 'まだ追加されていません'}</p></div><div><span>ここまでに出力した番号</span><code>{currentLzwStep.outputAfter.join('・') || 'まだ出力していません'}</code></div></div>
          </div>
          <div className="dictionary-answer"><span>追加した辞書そのものは送らなくてよい</span><p>受信側も同じ初期辞書と同じ規則を使い、コードを読むたびに同じ順番で辞書を作れます。実際のファイルには、辞書の初期状態・番号のビット幅・リセット規則などを示す情報が必要です。</p></div>
          <div className="compression-size-result"><span>この短い例の結果</span><code>出力する番号：{lzw.output.join('・')}</code><div><b>元：7文字 × 8 ＝ 56 bit</b><i>→</i><strong>番号部分：{lzw.output.length}個 × {lzw.codeBits} ＝ {lzw.output.length * lzw.codeBits} bit</strong></div><small>これは番号部分だけの値です。辞書の約束やヘッダーを含めると、この短い例では全体が増えることがあります。ここでは辞書を育てる仕組みを理解することが目的です。</small></div>
        </div>}

        {method === 'huffman' && <div className="method-panel" role="tabpanel">
          <div className="method-copy"><span>よく出る文字ほど短い符号</span><h4>0と1を読み、文字が決まる瞬間を体験</h4><p>「なまむぎなまごめなまたまご」では、最も多い「ま」を1 bit、次に多い文字を3 bit、少ない文字を4 bitにします。</p></div>
          <div className="huffman-source"><span>圧縮前の文字列（13文字）</span><code>{huffmanSource}</code><small>7種類をすべて同じ長さで表すなら、1文字3 bit必要です。</small></div>
          <div className="huffman-table" aria-label="文字の出現回数とハフマン符号">{huffmanRows.map(([char, count, code]) => <div className={char === currentHuffmanChar ? 'is-current' : ''} key={char}><b>{char}</b><span><i style={{ width: `${count / 4 * 100}%` }} />{count}回</span><code>{code}<small>{code.length} bit</small></code></div>)}</div>
          <div className="step-experience huffman-stepper">
            <div className="step-card"><span>文字 {huffmanStep + 1} / {huffmanChars.length}：「{currentHuffmanChar}」を読む</span><strong>{currentHuffmanCode.length === 1 ? '最初の0だけで文字が決まる' : `最初の1では決まらない。${currentHuffmanCode.length} bit目まで読むと決まる`}</strong></div>
            <div className="bit-reading" aria-label="ハフマン符号を1ビットずつ読む">{Array.from(currentHuffmanCode).map((bit, index) => { const prefix = currentHuffmanCode.slice(0, index + 1); const decided = index === currentHuffmanCode.length - 1; return <div className={decided ? 'is-decided' : ''} key={prefix}><b>{bit}</b><span>{prefix}</span><small>{decided ? `「${currentHuffmanChar}」に決定` : 'まだ続く'}</small></div>; })}</div>
            <input aria-label="ハフマン符号を読む文字" type="range" min="0" max={huffmanChars.length - 1} value={huffmanStep} onChange={(event) => setHuffmanStep(Number(event.target.value))} />
            <div className="step-buttons"><button type="button" disabled={huffmanStep === 0} onClick={() => setHuffmanStep((value) => Math.max(0, value - 1))}>← 前へ</button><button type="button" disabled={huffmanStep >= huffmanChars.length - 1} onClick={() => setHuffmanStep((value) => Math.min(huffmanChars.length - 1, value + 1))}>次へ →</button></div>
          </div>
          <div className="prefix-rule"><span>符号が重ならない工夫（接頭語条件）</span><div><code>0</code><p><b>「ま」で確定。</b>ほかの符号は0から始めません。</p></div><div><code>1…</code><p><b>まだ続く合図。</b>100・101・1100…のどれかになるまで読みます。</p></div><small>どの符号も、別の符号の「先頭部分」になっていません。そのため区切り記号がなくても、先頭から迷わず1文字ずつ復元できます。</small></div>
          <div className="huffman-summary"><div><span>全て固定長なら</span><strong>{huffmanChars.length * 3} bit</strong></div><i aria-hidden="true">→</i><div><span>ハフマン符号の本体</span><strong>{huffmanEncoded.length} bit</strong></div></div>
          <p className="data-caution">実際のファイルには、この対応表または木を復元するための情報も保存します。短いデータでは表の分だけ全体が増えることがあります。</p>
        </div>}
      </div>

      <div className="keyframe-lab">
        <div className="lab-heading"><div><p className="step-label">KEYFRAME &amp; DIFFERENCE</p><h3>動画は変化した部分だけを保存</h3></div><span className="print-badge"><small>プリント</small><b>13</b></span></div>
        <div className="frame-timeline"><button type="button" className={isPlaying ? 'is-playing' : ''} onClick={() => setIsPlaying((value) => !value)}>{isPlaying ? '一時停止' : '▶ 再生'}</button><label><span>フレーム <output>{frame} / 10</output></span><input aria-label="動画のフレーム" type="range" min="1" max="10" value={frame} onChange={(event) => { setFrame(Number(event.target.value)); setIsPlaying(false); }} /></label></div>
        <div className="keyframe-compare">
          <div className="mini-frame"><span>{frame === 1 ? 'キーフレーム：全体' : `再生時の画面 ${frame}`}</span><i className="mini-house" /><i className="mini-tree" /><i className="mini-person" style={{ left: `${personLeft}%` }} />{birdVisible && <i className="mini-bird" style={{ left: `${birdLeft}%`, top: `${20 + (frame % 3) * 4}%` }} />}</div>
          <i aria-hidden="true">→</i>
          <div className={'mini-frame difference frame-' + frame}><span>{frame === 1 ? 'フレーム1：全体を保存' : `フレーム${frame}：差分だけ`}</span>{frame === 1 && <><i className="mini-house" /><i className="mini-tree" /></>}<i className="difference-person" style={{ left: `${personLeft}%` }} />{birdVisible && <i className="mini-bird difference-bird" style={{ left: `${birdLeft}%`, top: `${20 + (frame % 3) * 4}%` }} />}<b>{frame === 1 ? '背景・家・木・人を保存' : birdVisible ? '人と鳥の位置だけを保存' : '人の位置だけを保存'}</b></div>
        </div>
        <p className="teacher-note">フレーム1では背景・家・木・人を丸ごと保存します。続くフレームでは、動いた人や飛んできた鳥など、前の画面から変化した部分だけを記録します。</p>
      </div>
    </section>
  );
}
