'use client';

import { useMemo, useState } from 'react';

const samples = [
  { char: 'A', name: '英字', jis: 'JIS X 0201: 41', shiftJis: '41', unicode: 'U+0041' },
  { char: 'あ', name: 'ひらがな', jis: 'JIS X 0208: 24 22', shiftJis: '82 A0', unicode: 'U+3042' },
  { char: '漢', name: '漢字', jis: 'JIS X 0208: 34 41', shiftJis: '8A BF', unicode: 'U+6F22' },
  { char: '¥', name: '円記号', jis: 'JIS X 0201: 5C', shiftJis: '5C ※', unicode: 'U+00A5' },
  { char: '①', name: '旧来の環境差', jis: '標準JIS外（当時）', shiftJis: 'CP932: 87 40', unicode: 'U+2460' },
  { char: '😀', name: '絵文字', jis: '対応なし', shiftJis: '対応なし', unicode: 'U+1F600' },
];

const invalidFilenameChars = ['\\', '/', ':', '*', '?', '"', '<', '>', '|'];
const symbolChoices = ['\\', '@', '/', '#', ':', '*', '-', '?', '"', '_', '<', '+', '>', '.', '|', '&'];

function bytesOf(text: string) {
  return Array.from(new TextEncoder().encode(text));
}

export function CharacterLab() {
  const [sampleIndex, setSampleIndex] = useState(1);
  const sample = samples[sampleIndex];
  const utf8 = bytesOf(sample.char);
  const [mojibakeSource, setMojibakeSource] = useState('文字化け');
  const mojibake = useMemo(() => {
    try { return new TextDecoder('shift_jis').decode(new TextEncoder().encode(mojibakeSource)); }
    catch { return 'このブラウザではShift_JIS復号を利用できません'; }
  }, [mojibakeSource]);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [filenameChecked, setFilenameChecked] = useState(false);
  const filenameCorrect = filenameChecked && selectedSymbols.length === invalidFilenameChars.length && invalidFilenameChars.every((char) => selectedSymbols.includes(char));
  const toggleSymbol = (symbol: string) => {
    setFilenameChecked(false);
    setSelectedSymbols((current) => current.includes(symbol) ? current.filter((item) => item !== symbol) : [...current, symbol]);
  };

  return (
    <section className="learning-section" id="characters">
      <div className="section-kicker"><span>05</span><p>文字の表現</p></div>
      <div className="section-title-row"><div><p className="step-label">同じ文字を比べる</p><h2>「あ」は、何バイトになる？</h2></div><p className="section-question">文字そのものと、文字を保存するための番号・バイト列を分けて考えよう。</p></div>
      <div className="character-panel">
        <div className="character-picker" aria-label="比較する文字">
          {samples.map((item, index) => <button type="button" key={item.char} className={sampleIndex === index ? 'selected' : ''} aria-pressed={sampleIndex === index} onClick={() => setSampleIndex(index)}><strong>{item.char}</strong><span>{item.name}</span></button>)}
        </div>
        <div className="encoding-stage">
          <div className="chosen-character"><span>文字</span><strong>{sample.char}</strong></div>
          <div className="encoding-arrows" aria-hidden="true"><i>↘</i><i>→</i><i>↗</i></div>
          <div className="encoding-cards">
            <div><span>JIS</span><strong>{sample.jis}</strong><small>文字集合の位置・コード</small></div>
            <div><span>Shift_JIS</span><strong>{sample.shiftJis}</strong><small>保存・通信時のバイト列</small></div>
            <div><span>Unicode</span><strong>{sample.unicode}</strong><small>世界共通のコードポイント</small></div>
          </div>
        </div>
        <div className="utf8-box">
          <div><p className="step-label">UTF-8で保存</p><h3>{sample.unicode} → {utf8.length}バイト</h3></div>
          <div className="byte-blocks" aria-label={`UTF-8で${utf8.length}バイト`}>{utf8.map((byte, index) => <span key={`${byte}-${index}`}><b>{byte.toString(16).toUpperCase().padStart(2, '0')}</b><small>{byte.toString(2).padStart(8, '0')}</small></span>)}</div>
        </div>
        <div className="variable-length"><div><span>A</span><b>1 byte</b></div><div><span>é</span><b>2 bytes</b></div><div><span>あ</span><b>3 bytes</b></div><div><span>😀</span><b>4 bytes</b></div><p><mark>可変長</mark>：文字によって使うバイト数が変わる</p></div>
        <div className="print-callout print-callout-four"><span>プリント ㉕</span><strong>1バイト</strong><em>英数字や記号など</em><span>プリント ㉖</span><strong>2バイト</strong><em>JIS系での漢字など</em><span>プリント ㉙</span><strong>可変長</strong><em>現在のUTF-8は1～4バイト</em></div>
        <p className="standard-note">※ 5Cは歴史的に「¥」と「\」の表示が環境で異なる代表例です。JIS、Shift_JIS、Unicodeは役割が同じではありません。</p>
      </div>

      <div className="mojibake-lab">
        <div><p className="step-label">わざと失敗する</p><h3>同じバイト列を、別の約束で読んだら？</h3></div>
        <label><span>UTF-8で保存する文字</span><input value={mojibakeSource} onChange={(event) => setMojibakeSource(event.target.value.slice(0, 12))} /></label>
        <div className="mojibake-flow"><div><span>UTF-8のバイト列</span><strong>{bytesOf(mojibakeSource).map((byte) => byte.toString(16).toUpperCase().padStart(2, '0')).join(' ') || '—'}</strong></div><i aria-hidden="true">→ Shift_JISとして読む →</i><div className="broken-text"><span>表示結果</span><strong>{mojibake || '—'}</strong></div></div>
        <div className="discovery-box compact"><span className="discovery-icon" aria-hidden="true">!</span><div><p>原因は文字そのものではなく…</p><h3>保存時と表示時で<strong>文字コード</strong>の約束が違うために起こる<mark>文字化け</mark>。</h3></div><span className="print-badge">㉗</span></div>
        <p className="machine-dependent"><b>機種依存文字</b><span>①などは旧来の文字コード環境で機種差が生じました。Unicodeでは番号が与えられていますが、フォントや古い環境による表示差には今も注意が必要です。</span><em>プリント ㉘</em></p>
      </div>

      <div className="filename-challenge">
        <div className="quiz-heading"><div><p className="step-label">TRY</p><h3>Windowsのファイル名に使えない9記号を選ぼう</h3></div><span>{selectedSymbols.length} / 9 選択</span></div>
        <div className="symbol-grid">{symbolChoices.map((symbol) => <button type="button" key={symbol} className={selectedSymbols.includes(symbol) ? 'selected' : ''} aria-pressed={selectedSymbols.includes(symbol)} onClick={() => toggleSymbol(symbol)}>{symbol}</button>)}</div>
        <div className="quiz-actions"><button type="button" className="check-button" onClick={() => setFilenameChecked(true)}>選択を確認</button><button type="button" className="text-button" onClick={() => { setSelectedSymbols([]); setFilenameChecked(false); }}>リセット</button></div>
        <p className={`quiz-feedback ${filenameCorrect ? 'success' : ''}`} aria-live="polite">{filenameChecked ? (filenameCorrect ? '正解です。9記号すべて見つかりました。' : 'まだ違う記号が含まれているか、選び忘れがあります。') : '記号の形だけでなく、文字コード上の位置も意識してみよう。'}</p>
      </div>
    </section>
  );
}

