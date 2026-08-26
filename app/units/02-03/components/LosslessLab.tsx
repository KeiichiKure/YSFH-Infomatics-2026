'use client';

import { useMemo, useState } from 'react';

type Method = 'rle' | 'lz' | 'lzw' | 'huffman';

function runLengthEncode(input: string) {
  const chars = Array.from(input);
  const groups: { char: string; count: number }[] = [];
  for (const char of chars) {
    const last = groups.at(-1);
    if (last?.char === char) last.count += 1;
    else groups.push({ char, count: 1 });
  }
  return groups;
}

function lzwSteps(input: string) {
  const chars = Array.from(input);
  const alphabet = Array.from(new Set(chars));
  const dictionary = new Map(alphabet.map((char, index) => [char, index]));
  const additions: { code: number; text: string }[] = [];
  const output: number[] = [];
  let phrase = chars.shift() ?? '';
  for (const char of chars) {
    const joined = phrase + char;
    if (dictionary.has(joined)) phrase = joined;
    else {
      output.push(dictionary.get(phrase) ?? 0);
      const code = dictionary.size;
      dictionary.set(joined, code);
      additions.push({ code, text: joined });
      phrase = char;
    }
  }
  if (phrase) output.push(dictionary.get(phrase) ?? 0);
  return { alphabet, additions, output, dictionarySize: dictionary.size };
}

const lzText = Array.from('ABCXYZ123'.repeat(5));
const lzParts = [
  { start: 0, length: 9, sourceStart: -1, token: '最初の「ABCXYZ123」は、そのまま記録' },
  { start: 9, length: 9, sourceStart: 0, token: '9文字前と同じ9文字 → [9, 9]' },
  { start: 18, length: 9, sourceStart: 9, token: '9文字前と同じ9文字 → [9, 9]' },
  { start: 27, length: 9, sourceStart: 18, token: '9文字前と同じ9文字 → [9, 9]' },
  { start: 36, length: 9, sourceStart: 27, token: '9文字前と同じ9文字 → [9, 9]' },
];
const lzOutput = 'ABCXYZ123 [9,9] [9,9] [9,9] [9,9]';
const lzOriginalBits = lzText.length * 8;
const lzCompressedBits = 9 * 8 + 4 * 16;

const huffmanRows = [
  ['キ', 16, '0'], ['マ', 8, '10'], ['ガ', 4, '110'], ['ミ', 2, '1110'],
  ['ア', 1, '11110'], ['カ', 1, '111110'], ['オ', 1, '111111'],
] as const;
const huffmanSource = huffmanRows.map(([char, count]) => char.repeat(count)).join('');

export function LosslessLab() {
  const [method, setMethod] = useState<Method>('rle');
  const [rleInput, setRleInput] = useState('すもももももももものうち');
  const [lzStep, setLzStep] = useState(2);
  const [lzwInput, setLzwInput] = useState('ABCABCABCABCABCABCABCABCABCABCABCABC');
  const [frame, setFrame] = useState(1);
  const rleGroups = useMemo(() => runLengthEncode(rleInput), [rleInput]);
  const rleOutput = rleGroups.map(({ char, count }) => count > 1 ? `${char}${count}` : char).join('');
  const lzw = useMemo(() => lzwSteps(lzwInput), [lzwInput]);
  const lzwCodeBits = Math.max(1, Math.ceil(Math.log2(Math.max(2, lzw.dictionarySize))));
  const lzwOriginalBits = Array.from(lzwInput).length * 8;
  const lzwCompressedBits = lzw.output.length * lzwCodeBits;
  const huffmanBits = huffmanRows.reduce((sum, [, count, code]) => sum + count * code.length, 0);
  const huffmanFixedBits = huffmanSource.length * 3;
  const huffmanEncoded = Array.from(huffmanSource).map((char) => huffmanRows.find(([symbol]) => symbol === char)?.[2] ?? '').join('');

  return (
    <section className="learning-section" id="lossless">
      <div className="section-kicker"><span>03</span><p>可逆圧縮の考え方 · 教科書 p.64</p></div>
      <div className="section-title-row">
        <div><p className="step-label">規則を見つける</p><h2>同じ情報を、どう短く記録する？</h2></div>
        <p className="section-question">4つの方法を切り替え、何を番号や短い符号へ置き換えるか比べよう。</p>
      </div>

      <div className="lossless-workbench">
        <div className="lab-heading"><div><p className="step-label">LOSSLESS WORKBENCH</p><h3>圧縮方法を切り替える</h3></div><span className="print-badge"><small>プリント</small><b>9〜12</b></span></div>
        <div className="method-tabs" role="tablist" aria-label="可逆圧縮の方法">
          {([['rle', 'ランレングス'], ['lz', 'LZ'], ['lzw', 'LZW'], ['huffman', 'ハフマン']] as const).map(([id, label]) => <button type="button" role="tab" aria-selected={method === id} className={method === id ? 'is-active' : ''} onClick={() => setMethod(id)} key={id}>{label}</button>)}
        </div>

        {method === 'rle' && <div className="method-panel" role="tabpanel">
          <div className="method-copy"><span>同じデータが何個並ぶかを記録</span><h4>連続する文字を、文字＋回数へ</h4><p>同じ値が長く続く白黒画像などに向きます。連続が少ないデータでは、かえって長くなる場合があります。</p></div>
          <label className="text-input"><span>圧縮したい文字列</span><input value={rleInput} maxLength={24} onChange={(event) => setRleInput(event.target.value)} /></label>
          <div className="rle-groups" aria-label="連続する文字のまとまり">{rleGroups.map((group, index) => <div key={index}><b>{group.char}</b><span>×{group.count}</span></div>)}</div>
          <div className="method-result"><span>圧縮後</span><code>{rleOutput || '文字を入力'}</code><small>元 {Array.from(rleInput).length}文字 → 表記 {Array.from(rleOutput).length}文字</small></div>
        </div>}

        {method === 'lz' && <div className="method-panel" role="tabpanel">
          <div className="method-copy"><span>以前に現れた位置と長さを記録</span><h4>同じ並びを、過去への参照へ</h4><p>前から順に一致する文字列を探し、見つかった場所までの距離と長さで表します。</p></div>
          <div className="lz-stage">
            <div className="lz-string">{lzText.map((char, index) => { const current = lzParts[lzStep]; const active = index >= current.start && index < current.start + current.length; const source = current.sourceStart >= 0 && index >= current.sourceStart && index < current.sourceStart + current.length; return <i className={active ? 'active' : source ? 'source' : ''} key={index}>{char}</i>; })}</div>
            <div className="lz-readout"><span>手順 {lzStep + 1} / {lzParts.length}</span><strong>{lzParts[lzStep].token}</strong></div>
            <input aria-label="LZ圧縮の手順" type="range" min="0" max={lzParts.length - 1} value={lzStep} onChange={(event) => setLzStep(Number(event.target.value))} />
            <div className="method-result"><span>この手順で記録する値</span><code>{lzStep === 0 ? 'ABCXYZ123' : '[9, 9]'}</code><small>青は参照される過去、オレンジは位置と長さへ置き換える部分</small></div>
            <div className="compression-size-result"><span>最終的な圧縮結果</span><code>{lzOutput}</code><div><b>元：{lzText.length}文字 × 8 bit ＝ {lzOriginalBits} bit</b><i>→</i><strong>圧縮後：{lzCompressedBits} bit</strong></div><small>簡略モデル：1文字8 bit、[距離, 長さ]を各8 bitと仮定。短い文字列では参照情報の分だけ増える場合もありますが、同じ並びが長く繰り返されるほど効果が大きくなります。</small></div>
          </div>
        </div>}

        {method === 'lzw' && <div className="method-panel" role="tabpanel">
          <div className="method-copy"><span>出現した文字列を辞書へ登録</span><h4>繰り返しを、辞書番号へ</h4><p>LZを改良し、見つけた文字列へ番号を付けます。同じ並びが再登場すると番号だけで記録できます。</p></div>
          <label className="text-input"><span>辞書を作る文字列</span><input value={lzwInput} maxLength={60} onChange={(event) => setLzwInput(event.target.value)} /></label>
          <div className="lzw-layout">
            <div><span>最初の文字</span><p>{lzw.alphabet.map((char, index) => <i key={char}><b>{index}</b>{char}</i>)}</p></div>
            <div><span>新しく登録</span><p>{lzw.additions.slice(0, 8).map((item) => <i key={item.code}><b>{item.code}</b>{item.text}</i>)}</p></div>
          </div>
          <div className="method-result"><span>記録する辞書番号</span><code>{lzw.output.join(' · ') || '—'}</code><small>長い文字列が辞書へ増えるほど、繰り返しを短い番号で表せます。</small></div>
          <div className={'compression-size-result ' + (lzwCompressedBits < lzwOriginalBits ? 'is-smaller' : 'is-larger')}><span>同じ尺度でデータ量を比較</span><div><b>元：{Array.from(lzwInput).length}文字 × 8 bit ＝ {lzwOriginalBits} bit</b><i>→</i><strong>辞書番号 {lzw.output.length}個 × {lzwCodeBits} bit ＝ {lzwCompressedBits} bit</strong></div><small>初期の文字辞書を共有する簡略モデルです。{lzwCompressedBits < lzwOriginalBits ? `この例では ${lzwOriginalBits - lzwCompressedBits} bit減りました。` : '短い・繰り返しの少ない入力では、圧縮後の方が大きくなることがあります。'}</small></div>
        </div>}

        {method === 'huffman' && <div className="method-panel" role="tabpanel">
          <div className="method-copy"><span>出現頻度が高いデータほど短い符号</span><h4>よく出る「キ」は1ビット</h4><p>どの符号も別の符号の先頭にならないように割り当てるため、区切り記号なしでデコードできます。</p></div>
          <div className="huffman-source"><span>圧縮前の文字列（33文字）</span><code>{huffmanSource}</code><small>キ16回・マ8回・ガ4回・ミ2回・ア／カ／オ各1回</small></div>
          <div className="huffman-table" aria-label="文字の出現回数とハフマン符号">
            {huffmanRows.map(([char, count, code]) => <div key={char}><b>{char}</b><span><i style={{ width: `${count / 16 * 100}%` }} />{count}回</span><code>{code}</code></div>)}
          </div>
          <div className="huffman-encoded"><span>圧縮後のビット列</span><code>{huffmanEncoded}</code></div>
          <div className="huffman-summary"><div><span>7種類を固定長3 bitで表す</span><strong>33文字 × 3 ＝ {huffmanFixedBits} bit</strong></div><i aria-hidden="true">→</i><div><span>出現頻度に応じたハフマン符号</span><strong>{huffmanBits} bit</strong></div></div>
          <p className="data-tradeoff">この例では {huffmanFixedBits - huffmanBits} bit減ります。同じ出現回数があると符号の形は複数通りありますが、よく出る文字を短い符号にする考え方は同じです。</p>
        </div>}
      </div>

      <div className="keyframe-lab">
        <div className="lab-heading"><div><p className="step-label">KEYFRAME &amp; DIFFERENCE</p><h3>動画は変化した部分だけを保存</h3></div><span className="print-badge"><small>プリント</small><b>13</b></span></div>
        <div className="frame-switch" aria-label="表示するフレーム">{[1, 2, 3].map((value) => <button type="button" className={frame === value ? 'is-active' : ''} key={value} onClick={() => setFrame(value)}>フレーム{value}</button>)}</div>
        <div className="keyframe-compare">
          <div className="mini-frame"><span>{frame === 1 ? 'キーフレーム：全体' : '再生時の画面'}</span><i className="mini-sky" /><i className="mini-house" /><i className="mini-tree" /><i className="mini-person" style={{ left: `${20 + frame * 16}%` }} /></div>
          <i aria-hidden="true">→</i>
          <div className={'mini-frame difference frame-' + frame}><span>{frame === 1 ? '全体を保存' : '差分だけを保存'}</span><i className="difference-person" style={{ left: `${20 + frame * 16}%` }} /><b>{frame === 1 ? '背景・家・木・人' : '人の位置の変化だけ'}</b></div>
        </div>
        <p className="teacher-note">一定の間隔で全体を保存するキーフレームを作り、その間は前後で変化した差分だけを記録します。</p>
      </div>
    </section>
  );
}
