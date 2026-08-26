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

function lzwEncodeBytes(input: string) {
  const bytes = Array.from(new TextEncoder().encode(input));
  const dictionary = new Map(Array.from({ length: 256 }, (_, code) => [String.fromCharCode(code), code]));
  const additions: { code: number; text: string }[] = [];
  const output: number[] = [];
  let phrase = bytes.length ? String.fromCharCode(bytes[0]) : '';
  for (const byte of bytes.slice(1)) {
    const char = String.fromCharCode(byte);
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
  const codeBits = Math.max(9, Math.ceil(Math.log2(Math.max(2, dictionary.size))));
  return { additions, output, dictionarySize: dictionary.size, originalBytes: bytes.length, codeBits, compressedBits: output.length * codeBits };
}

const lzText = Array.from('すもももももももものうち');
const lzParts = [
  { start: 0, length: 1, sourceStart: -1, token: '最初の「す」は、そのまま記録', result: 'す' },
  { start: 1, length: 1, sourceStart: -1, token: '初めて出る「も」は、そのまま記録', result: 'も' },
  { start: 2, length: 7, sourceStart: 1, token: '1文字前から続く7文字を参照', result: '[1, 7]' },
  { start: 9, length: 1, sourceStart: -1, token: '初めて出る「の」は、そのまま記録', result: 'の' },
  { start: 10, length: 2, sourceStart: -1, token: '残りの「う」「ち」を、そのまま記録', result: 'う・ち' },
];
const lzOutput = 'す・も・[1,7]・の・う・ち';

const lzwDemo = 'BANANA_BANDANA';
const lzwLongPhrase = '情報を送る。情報を守る。';

const huffmanSource = 'なまむぎなまごめなまたまご';
const huffmanRows = [
  ['ま', 4, '11'], ['な', 3, '01'], ['ご', 2, '00'], ['む', 1, '1010'],
  ['ぎ', 1, '1000'], ['め', 1, '1011'], ['た', 1, '1001'],
] as const;
const huffmanEncoded = Array.from(huffmanSource).map((char) => huffmanRows.find(([symbol]) => symbol === char)?.[2] ?? '').join('');
const huffmanBits = huffmanEncoded.length;
const huffmanFixedBits = huffmanSource.length * 3;

function visibleByteText(value: string) {
  return Array.from(value).map((char) => {
    const code = char.charCodeAt(0);
    return code >= 32 && code <= 126 ? char : `0x${code.toString(16).padStart(2, '0')}`;
  }).join('');
}

export function LosslessLab() {
  const [method, setMethod] = useState<Method>('rle');
  const [rleInput, setRleInput] = useState('すもももももももものうち');
  const [lzStep, setLzStep] = useState(0);
  const [lzwRepeats, setLzwRepeats] = useState(12);
  const [frame, setFrame] = useState(1);
  const rleGroups = useMemo(() => runLengthEncode(rleInput), [rleInput]);
  const rleOutput = rleGroups.map(({ char, count }) => count > 1 ? `${char}${count}` : char).join('');
  const lzwShort = useMemo(() => lzwEncodeBytes(lzwDemo), []);
  const lzwLong = useMemo(() => lzwEncodeBytes(lzwLongPhrase.repeat(lzwRepeats)), [lzwRepeats]);

  return (
    <section className="learning-section" id="lossless">
      <div className="section-kicker"><span>03</span><p>可逆圧縮の考え方 · 教科書 p.64</p></div>
      <div className="section-title-row">
        <div><p className="step-label">規則を見つける</p><h2>同じ情報を、どう短く記録する？</h2></div>
        <p className="section-question">まず「何を短くするか」をつかみ、詳しく知りたいときだけ手順や付加情報を開こう。</p>
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
          <div className="method-copy"><span>前に出た並びを「距離と長さ」へ</span><h4>「すもも…」の繰り返しを参照する</h4><p>同じ並びをもう一度書かず、「何文字前から、何文字分か」で表します。伸張側は前に戻って読み写すので、完全に元へ戻せます。</p></div>
          <div className="method-story">
            <div><span>元の言葉</span><strong>すもももももももものうち</strong><small>12文字・UTF-8では36 byte</small></div><i aria-hidden="true">→</i><div><span>LZの考え方</span><strong>{lzOutput}</strong><small>続く7個の「も」を参照へ置換</small></div>
          </div>
          <div className="compression-size-result is-smaller"><span>簡略モデルで比べる</span><div><b>元：36 byte</b><i>→</i><strong>圧縮後：約19 byte</strong></div><small>日本語1文字をUTF-8の3 byte、参照［距離, 長さ］を4 byteとして計算。実際のファイルには方式や区切りを示す情報も必要です。</small></div>
          <div className="real-compression-example"><span>長い文章なら効果がはっきり</span><p>「情報を小さく保存し、必要なときに元へ戻します。」を40回</p><div><b>2,760 byte</b><i>→</i><strong>89 byte</strong></div><small>ZIPでも使われるDEFLATE（LZ＋ハフマン）の圧縮本体を実測。ZIPのヘッダーは別に加わります。</small></div>
          <details className="advanced-details">
            <summary>もっと詳しく：5つの手順を見る</summary>
            <div className="lz-stage">
              <div className="lz-string">{lzText.map((char, index) => { const current = lzParts[lzStep]; const active = index >= current.start && index < current.start + current.length; const source = current.sourceStart >= 0 && index >= current.sourceStart && index < current.sourceStart + current.length; return <i className={active ? 'active' : source ? 'source' : ''} key={index}>{char}</i>; })}</div>
              <div className="lz-readout"><span>手順 {lzStep + 1} / {lzParts.length}</span><strong>{lzParts[lzStep].token}</strong></div>
              <input aria-label="LZ圧縮の手順" type="range" min="0" max={lzParts.length - 1} value={lzStep} onChange={(event) => setLzStep(Number(event.target.value))} />
              <div className="method-result"><span>この手順で記録する値</span><code>{lzParts[lzStep].result}</code><small>青は参照元、オレンジは現在処理している部分です。手順1から順に動かしてみよう。</small></div>
            </div>
          </details>
        </div>}

        {method === 'lzw' && <div className="method-panel" role="tabpanel">
          <div className="method-copy"><span>よく出る並びへ辞書番号を付ける</span><h4>辞書は送らず、両側で同じものを育てる</h4><p>送信側と受信側は、最初に同じ「0〜255の1 byte辞書」を持ちます。受信側もコードを読む順に同じ項目を追加できるため、新しく作った辞書表を丸ごと送る必要はありません。</p></div>
          <label className="repeat-control"><span>例文を繰り返す回数 <output>{lzwRepeats}回</output></span><input type="range" min="1" max="30" value={lzwRepeats} onChange={(event) => setLzwRepeats(Number(event.target.value))} /><small>「{lzwLongPhrase}」× {lzwRepeats}</small></label>
          <div className="compression-size-result is-smaller"><span>コード列として送る量</span><div><b>元：{lzwLong.originalBytes} byte ＝ {lzwLong.originalBytes * 8} bit</b><i>→</i><strong>{lzwLong.output.length}コード × {lzwLong.codeBits} bit ＝ {lzwLong.compressedBits} bit</strong></div><small>この範囲ではコード1個を9 bitで表す簡略モデルです。実際にはコード幅を9→10→11 bitと増やす規則や、辞書をリセットする規則を形式側で共有します。</small></div>
          <div className="dictionary-answer"><span>「辞書を登録するビット数」はどこへ？</span><ol><li><b>初期辞書：</b>規格で決まっているので送らない</li><li><b>追加辞書：</b>受信側もコードから同じ順に再現するので送らない</li><li><b>送るもの：</b>コード列と、コード幅・リセットなどを示すヘッダー</li></ol><p>独自の初期辞書を使う方式なら、その辞書もヘッダーに保存する必要があります。短いデータではヘッダーの分だけ圧縮後が大きくなることがあります。</p></div>
          <details className="advanced-details">
            <summary>もっと詳しく：短い英字例で辞書の増え方を見る</summary>
            <div className="advanced-body">
              <p><code>{lzwDemo}</code> をbyte単位で読みます。最初の辞書0〜255は共有済みです。</p>
              <div className="lzw-layout"><div><span>新しく作る辞書（先頭）</span><p>{lzwShort.additions.slice(0, 8).map((item) => <i key={item.code}><b>{item.code}</b>{visibleByteText(item.text)}</i>)}</p></div><div><span>実際に送るコード</span><p className="code-stream">{lzwShort.output.join(' · ')}</p></div></div>
              <div className="method-result"><span>短い例の圧縮本体</span><code>元112 bit → コード列90 bit</code><small>ここにファイルヘッダーが加わるため、14文字だけをファイル化すると全体では増える可能性があります。</small></div>
            </div>
          </details>
        </div>}

        {method === 'huffman' && <div className="method-panel" role="tabpanel">
          <div className="method-copy"><span>よく出る文字ほど短い符号</span><h4>意味のある言葉で、符号の長さを変える</h4><p>短い早口言葉「なまむぎなまごめなまたまご」を使います。「ま」「な」はよく出るため2 bit、1回だけの文字は4 bitにします。</p></div>
          <div className="huffman-source"><span>圧縮前の文字列（13文字）</span><code>{huffmanSource}</code><small>7種類を同じ長さで表すなら、1文字3 bit必要です。</small></div>
          <div className="huffman-table" aria-label="文字の出現回数とハフマン符号">
            {huffmanRows.map(([char, count, code]) => <div key={char}><b>{char}</b><span><i style={{ width: `${count / 4 * 100}%` }} />{count}回</span><code>{code}</code></div>)}
          </div>
          <div className="huffman-encoded"><span>圧縮本体のビット列</span><code>{huffmanEncoded}</code></div>
          <div className="huffman-summary"><div><span>固定長の符号</span><strong>13文字 × 3 ＝ {huffmanFixedBits} bit</strong></div><i aria-hidden="true">→</i><div><span>ハフマン符号の本体</span><strong>{huffmanBits} bit</strong></div></div>
          <div className="real-compression-example"><span>符号表も含めた長文モデル</span><p>同じ早口言葉を40回（UTF-8で1,560 byte）</p><div><b>1,560 byte</b><i>→</i><strong>約198 byte</strong></div><small>圧縮本体170 byte＋正規ハフマン符号表の簡略見積り28 byte。実際には形式固有のヘッダーも加わります。</small></div>
          <details className="advanced-details">
            <summary>もっと詳しく：木や0・1の情報はどう保存する？</summary>
            <div className="advanced-body huffman-answer">
              <ol><li><b>頻度の小さい2つを結ぶ</b><span>これを1本の木になるまで繰り返します。</span></li><li><b>左を0、右を1と決める</b><span>根から文字までの道が符号になります。</span></li><li><b>符号表をヘッダーへ保存</b><span>木そのもの、または各文字の「符号の長さ」を保存します。</span></li><li><b>本体のビット列を続ける</b><span>受信側はヘッダーから同じ木を復元してデコードします。</span></li></ol>
              <p><b>実用形式でよく使う正規ハフマン符号：</b>文字と符号長だけを保存すれば、0・1の並びを規則どおりに再現できます。固定の符号表を使う方式なら表自体を送らない場合もあります。したがって、実際の圧縮率には符号表やヘッダーの量も必ず含めて考えます。</p>
            </div>
          </details>
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
