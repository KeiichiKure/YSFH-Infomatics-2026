'use client';

import Encoding from 'encoding-japanese';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import praiseMascot from '@/public/mascots/teacher-praise.png';

const samples = [
  { char: 'A', name: '英字', jisStandard: 'JIS X 0201', jisCode: '41', shiftJis: '41', unicodeHex: '0041' },
  { char: 'あ', name: 'ひらがな', jisStandard: 'JIS X 0208', jisCode: '24 22', shiftJis: '82 A0', unicodeHex: '3042' },
  { char: '漢', name: '漢字', jisStandard: 'JIS X 0208', jisCode: '34 41', shiftJis: '8A BF', unicodeHex: '6F22' },
  { char: '¥', name: '円記号', jisStandard: 'JIS X 0201（ローマ字）', jisCode: '5C', shiftJis: '5C ※', unicodeHex: '00A5' },
  { char: '①', name: '旧来の環境差', jisStandard: 'JIS X 0208外（当時）', jisCode: '—', shiftJis: 'CP932: 87 40', unicodeHex: '2460' },
  { char: '😀', name: '絵文字', jisStandard: '対応なし', jisCode: '—', shiftJis: '対応なし', unicodeHex: '1F600' },
];

const invalidFilenameChars = ['\\', '/', ':', '*', '?', '"', '<', '>', '|'];
const symbolChoices = ['\\', '@', '/', '#', ':', '*', '-', '?', '"', '_', '<', '+', '>', '.', '|', '&'];
const legacySymbols = [
  { char: '①', name: '丸数字1', code: 'U+2460' },
  { char: '㈱', name: 'かっこ株式会社', code: 'U+3231' },
  { char: '㍻', name: '元号「平成」', code: 'U+337B' },
  { char: 'Ⅰ', name: 'ローマ数字1', code: 'U+2160' },
];

function bytesOf(text: string) {
  return Array.from(new TextEncoder().encode(text));
}

function hexBytes(bytes: number[]) {
  return bytes.map((byte) => byte.toString(16).toUpperCase().padStart(2, '0')).join(' ') || '—';
}

function BackslashGlyph() {
  return <span className="ascii-glyph" aria-label="バックスラッシュ">{'\\'}</span>;
}

export function CharacterLab() {
  const [sampleIndex, setSampleIndex] = useState(1);
  const sample = samples[sampleIndex];
  const utf8 = bytesOf(sample.char);
  const [mojibakeSource, setMojibakeSource] = useState('文字化け');
  const [mojibakeDirection, setMojibakeDirection] = useState<'utf8-to-sjis' | 'sjis-to-utf8'>('utf8-to-sjis');
  const utf8Bytes = useMemo(() => bytesOf(mojibakeSource), [mojibakeSource]);
  const sjisBytes = useMemo(() => Encoding.convert(mojibakeSource, { to: 'SJIS', from: 'UNICODE', type: 'array', fallback: 'ignore' }), [mojibakeSource]);
  const utf8AsSjis = useMemo(() => {
    try { return new TextDecoder('shift_jis').decode(Uint8Array.from(utf8Bytes)); }
    catch { return 'このブラウザではShift_JIS復号を利用できません'; }
  }, [utf8Bytes]);
  const sjisAsUtf8 = useMemo(() => new TextDecoder('utf-8').decode(Uint8Array.from(sjisBytes)), [sjisBytes]);
  const shownBytes = mojibakeDirection === 'utf8-to-sjis' ? utf8Bytes : sjisBytes;
  const mojibake = mojibakeDirection === 'utf8-to-sjis' ? utf8AsSjis : sjisAsUtf8;
  const [machineMode, setMachineMode] = useState<'legacy' | 'unicode'>('legacy');
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [filenameChecked, setFilenameChecked] = useState(false);
  const filenameCorrect = filenameChecked && selectedSymbols.length === invalidFilenameChars.length && invalidFilenameChars.every((char) => selectedSymbols.includes(char));
  const toggleSymbol = (symbol: string) => {
    setSelectedSymbols((current) => current.includes(symbol) ? current.filter((item) => item !== symbol) : [...current, symbol]);
  };
  const symbolResultClass = (symbol: string) => {
    if (!filenameChecked) return selectedSymbols.includes(symbol) ? 'selected' : '';
    if (selectedSymbols.includes(symbol) && invalidFilenameChars.includes(symbol)) return 'selected correct-choice';
    if (selectedSymbols.includes(symbol)) return 'selected wrong-choice';
    if (invalidFilenameChars.includes(symbol)) return 'missing-choice';
    return '';
  };

  return (
    <section className="learning-section" id="characters">
      <div className="section-kicker"><span>05</span><p>文字の表現 · 教科書 p.56</p></div>
      <div className="section-title-row"><div><p className="step-label">同じ文字を比べる</p><h2>「あ」は、何バイトになる？</h2></div><p className="section-question">文字そのものと、文字を保存するための番号・バイト列を分けて考えよう。</p></div>
      <div className="character-panel">
        <div className="character-picker" aria-label="比較する文字">
          {samples.map((item, index) => <button type="button" key={item.char} className={sampleIndex === index ? 'selected' : ''} aria-pressed={sampleIndex === index} onClick={() => setSampleIndex(index)}><strong>{item.char}</strong><span>{item.name}</span></button>)}
        </div>
        <div className="encoding-stage">
          <div className="chosen-character"><span>文字</span><strong>{sample.char}</strong></div>
          <div className="encoding-arrows" aria-hidden="true"><i>↘</i><i>→</i><i>↗</i></div>
          <div className="encoding-cards">
            <div><span>JISコード（{sample.jisStandard}）</span><strong>{sample.jisCode}</strong><small>JISの表でのコード値</small></div>
            <div><span>Shift_JISのバイト列</span><strong>{sample.shiftJis}</strong><small>保存・通信時の並び</small></div>
            <div><span>Unicodeコードポイント</span><strong>U+{sample.unicodeHex}</strong><small>文字に割り当てた番号</small></div>
          </div>
        </div>
        <div className="codepoint-note">
          <b>U+0041 の読み方</b>
          <p><code>U+</code>は「Unicodeのコードポイントを16進数で書く」という目印。<strong>0041</strong>が文字Aのコードポイントで、保存時のバイト列とは別物です。</p>
        </div>
        <div className="utf8-box">
          <div><p className="step-label">UTF-8で保存</p><h3>U+{sample.unicodeHex} → {utf8.length}バイト</h3></div>
          <div className="byte-blocks" aria-label={`UTF-8で${utf8.length}バイト`}>{utf8.map((byte, index) => <span key={`${byte}-${index}`}><b>{byte.toString(16).toUpperCase().padStart(2, '0')}</b><small>{byte.toString(2).padStart(8, '0')}</small></span>)}</div>
        </div>
        <div className="variable-length"><div><span>A</span><b>1 byte</b></div><div><span>é</span><b>2 bytes</b></div><div><span>あ</span><b>3 bytes</b></div><div><span>😀</span><b>4 bytes</b></div><p><mark>可変長</mark>：文字によって使うバイト数が変わる</p></div>
        <div className="print-callout print-callout-four"><span>プリント ㉕</span><strong>1バイト</strong><em>英数字や記号など</em><span>プリント ㉖</span><strong>2バイト</strong><em>JIS系での漢字など</em><span>プリント ㉙</span><strong>可変長</strong><em>現在のUTF-8は1～4バイト</em></div>

        <div className="symbol-identity" aria-label="円記号とバックスラッシュの区別">
          <div><span>円記号</span><strong>¥</strong><code>U+00A5</code></div>
          <i aria-hidden="true">≠</i>
          <div><span>バックスラッシュ</span><strong><BackslashGlyph /></strong><code>U+005C</code></div>
        </div>
        <p className="standard-note">※ 日本語の古い文字コードや一部のフォントでは、コード値5Cの字形を円記号のように表示することがあります。名称とコード値まで見れば、2つを区別できます。</p>
      </div>

      <div className="mojibake-lab">
        <div><p className="step-label">わざと失敗する</p><h3>同じバイト列を、別の約束で読んだら？</h3></div>
        <div className="mojibake-direction segmented-control" aria-label="文字化けの向き">
          <button type="button" className={mojibakeDirection === 'utf8-to-sjis' ? 'selected' : ''} aria-pressed={mojibakeDirection === 'utf8-to-sjis'} onClick={() => setMojibakeDirection('utf8-to-sjis')}>UTF-8保存 → Shift_JISで読む</button>
          <button type="button" className={mojibakeDirection === 'sjis-to-utf8' ? 'selected' : ''} aria-pressed={mojibakeDirection === 'sjis-to-utf8'} onClick={() => setMojibakeDirection('sjis-to-utf8')}>Shift_JIS保存 → UTF-8で読む</button>
        </div>
        <label><span>保存する文字</span><input value={mojibakeSource} onChange={(event) => setMojibakeSource(event.target.value.slice(0, 12))} /></label>
        <div className="mojibake-flow">
          <div><span>{mojibakeDirection === 'utf8-to-sjis' ? 'UTF-8' : 'Shift_JIS'}のバイト列</span><strong>{hexBytes(shownBytes)}</strong></div>
          <i aria-hidden="true">→ {mojibakeDirection === 'utf8-to-sjis' ? 'Shift_JIS' : 'UTF-8'}として読む →</i>
          <div className="broken-text"><span>誤った表示結果</span><strong>{mojibake || '—'}</strong></div>
        </div>
        <p className="correct-decoding">同じバイト列を保存時と同じ<strong>{mojibakeDirection === 'utf8-to-sjis' ? 'UTF-8' : 'Shift_JIS'}</strong>で読めば「{mojibakeSource || '—'}」に戻ります。</p>
        <div className="discovery-box compact"><span className="discovery-icon" aria-hidden="true">!</span><div><p>原因は文字そのものではなく…</p><h3>保存時と表示時で<strong>文字コード</strong>の約束が違うために起こる<mark>文字化け</mark>。</h3></div><span className="print-badge">㉗</span></div>
      </div>

      <div className="machine-dependent-lab">
        <div className="quiz-heading"><div><p className="step-label">環境を切り替える</p><h3><mark>機種依存文字</mark>は、なぜ注意が必要？</h3></div><span className="print-badge">プリント ㉘</span></div>
        <p>古い日本語環境では、メーカー独自の文字領域などを使ったため、別の機種へ送ると表示されない・別の文字になることがありました。</p>
        <div className="segmented-control machine-mode" aria-label="表示環境">
          <button type="button" className={machineMode === 'legacy' ? 'selected' : ''} aria-pressed={machineMode === 'legacy'} onClick={() => setMachineMode('legacy')}>旧来の別環境</button>
          <button type="button" className={machineMode === 'unicode' ? 'selected' : ''} aria-pressed={machineMode === 'unicode'} onClick={() => setMachineMode('unicode')}>Unicode環境</button>
        </div>
        <div className={`legacy-symbol-grid ${machineMode}`}>
          {legacySymbols.map((item) => <div key={item.code}><strong>{machineMode === 'legacy' ? '□' : item.char}</strong><span>{item.name}</span><code>{machineMode === 'legacy' ? '表示できないことがある' : item.code}</code></div>)}
        </div>
        <p className="machine-conclusion">Unicodeではそれぞれにコードポイントがあります。ただし、古い文字コード・OS・フォントが混ざる場面では今も表示差に注意し、共有文書では一般的な表記への置き換えも検討します。</p>
      </div>

      <div className="filename-challenge">
        <div className="quiz-heading"><div><p className="step-label">TRY</p><h3>Windowsのファイル名に使えない9記号を選ぼう</h3></div><span>{selectedSymbols.length} / 9 選択</span></div>
        <div className="symbol-grid">{symbolChoices.map((symbol) => <button type="button" key={symbol} className={symbolResultClass(symbol)} aria-pressed={selectedSymbols.includes(symbol)} aria-label={symbol === '\\' ? 'バックスラッシュ' : symbol} onClick={() => toggleSymbol(symbol)}>{symbol === '\\' ? <BackslashGlyph /> : symbol}</button>)}</div>
        <div className="quiz-actions"><button type="button" className="check-button" onClick={() => setFilenameChecked(true)}>選択を確認</button><button type="button" className="text-button" onClick={() => { setSelectedSymbols([]); setFilenameChecked(false); }}>リセット</button></div>
        {filenameChecked && !filenameCorrect && <div className="result-legend"><span className="legend-correct">正しく選択</span><span className="legend-wrong">選ばない記号</span><span className="legend-missing">選び忘れ</span></div>}
        <p className={`quiz-feedback ${filenameCorrect ? 'success' : ''}`} aria-live="polite">{filenameChecked ? (filenameCorrect ? '全問正解です。9記号すべて見つかりました！' : '色を手がかりに、間違っている記号だけ選び直せます。') : '先頭の記号はバックスラッシュ（U+005C）です。円記号とは別の文字として考えよう。'}</p>
        {filenameCorrect && <div className="success-celebration symbol-success" role="status"><span aria-hidden="true">◎</span><div><strong>全問正解！ お見事です</strong><p>Windowsで使えない9記号を見分けられました。</p></div><Image className="celebration-mascot" src={praiseMascot} alt="親指を立てて褒める先生のマスコット" /></div>}
      </div>
    </section>
  );
}

