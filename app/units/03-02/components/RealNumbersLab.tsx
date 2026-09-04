'use client';

import { useMemo, useState } from 'react';
import { twosComplement } from './binaryModels';
import { PrintBadge, SectionHeading } from './LessonParts';

function placeName(power: number) {
  if (power >= 0) return `${2 ** power}の位`;
  return `1/${2 ** Math.abs(power)}の位`;
}

function magnitudeWithPoint(bits: string, fractionBits: number) {
  const split = bits.length - fractionBits;
  return `${bits.slice(0, split) || '0'}.${bits.slice(split)}`;
}

function roundToEightSignificantBits(value: number) {
  if (!(value > 0)) return { significantBits: '00000000', digits: '00000000', pointAfter: 8, display: '00000000.', exponent: 0, roundedValue: 0 };
  let exponent = Math.floor(Math.log2(value));
  let significandInteger = Math.round((value / 2 ** exponent) * 128);
  if (significandInteger === 256) { significandInteger = 128; exponent += 1; }
  const significantBits = significandInteger.toString(2).padStart(8, '0');
  const digits = exponent >= 0
    ? `${significantBits}${'0'.repeat(Math.max(0, exponent - 7))}`
    : `${'0'.repeat(-exponent)}${significantBits}`;
  const pointAfter = exponent >= 0 ? exponent + 1 : 1;
  const display = `${digits.slice(0, pointAfter)}.${digits.slice(pointAfter)}`;
  return { significantBits, digits, pointAfter, display, exponent, roundedValue: (significandInteger / 128) * 2 ** exponent };
}

export function RealNumbersLab() {
  const [bits, setBits] = useState('00101101');
  const [fractionBits, setFractionBits] = useState(4);
  const [normalizationInput, setNormalizationInput] = useState('-45.25');
  const [mantissaAnswer, setMantissaAnswer] = useState('');
  const [exponentAnswer, setExponentAnswer] = useState('');
  const [quizState, setQuizState] = useState<'correct' | 'wrong'>();
  const storedValueBits = bits.slice(1);
  const signedInteger = Number.parseInt(bits, 2) - (bits[0] === '1' ? 256 : 0);
  const magnitudeConversion = twosComplement(bits, 8);
  const fixedMagnitudeBits = Math.abs(signedInteger).toString(2).padStart(7, '0');
  const normalizationDecimal = Number(normalizationInput);
  const normalizationInputValid = normalizationInput !== '' && normalizationInput !== '-' && normalizationInput !== '.' && normalizationInput !== '-.' && Number.isFinite(normalizationDecimal) && Math.abs(normalizationDecimal) <= 255 && (normalizationDecimal === 0 || Math.abs(normalizationDecimal) >= 1 / 256);
  const normalizationValue = normalizationInputValid ? normalizationDecimal : 0;
  const magnitudeInteger = Math.abs(normalizationValue);
  const normalizationSign = normalizationValue < 0 ? '1' : '0';
  const binaryApproximation = roundToEightSignificantBits(magnitudeInteger);
  const numericBits = binaryApproximation.digits;
  const normalizationUnavailable = !normalizationInputValid || magnitudeInteger === 0;
  const integerBits = 7 - fractionBits;
  const powers = useMemo(() => Array.from({ length: 7 }, (_, index) => integerBits - index - 1), [integerBits]);
  const magnitudePowers = useMemo(() => Array.from({ length: 8 }, (_, index) => integerBits - index), [integerBits]);
  const decimalValue = signedInteger / 2 ** fractionBits;
  const sumText = [...fixedMagnitudeBits].map((bit, index) => bit === '1' ? `${2 ** powers[index]}` : null).filter((value): value is string => value !== null).join(' ＋ ');
  const magnitudeSumText = [...magnitudeConversion.result].map((bit, index) => bit === '1' ? `${2 ** magnitudePowers[index]}` : null).filter((value): value is string => value !== null).join(' ＋ ');
  const firstOne = numericBits.indexOf('1');
  const normalizedExponent = binaryApproximation.exponent;
  const significandTail = binaryApproximation.significantBits.slice(1);
  const mantissa = significandTail.padEnd(7, '0');
  const mantissa23 = significandTail.padEnd(23, '0');
  const normalizedMantissa = firstOne < 0 ? '0' : `1.${significandTail.replace(/0+$/, '') || '0'}`;
  const originalMagnitude = binaryApproximation.display;
  const originalMagnitudePointIndex = originalMagnitude.indexOf('.');
  const leadingZeroCount = Math.max(0, firstOne);
  const originalPointAfter = binaryApproximation.pointAfter;
  const normalizedPointAfter = firstOne < 0 ? 1 : firstOne + 1;
  const pointTrackColumns = numericBits.length * 2 + 1;
  const exponentBits = Math.max(0, Math.min(255, normalizedExponent + 127)).toString(2).padStart(8, '0');
  const fixedStep = 2 ** -fractionBits;

  function resetQuiz() { setMantissaAnswer(''); setExponentAnswer(''); setQuizState(undefined); }
  function toggleBit(index: number) {
    const next = [...bits]; next[index] = next[index] === '0' ? '1' : '0'; setBits(next.join('')); resetQuiz();
  }
  function changeFractionBits(next: number) { setFractionBits(next); resetQuiz(); }
  function changeNormalizationInput(value: string) {
    const cleaned = value.replace(/[^0-9.-]/g, '').replace(/(?!^)-/g, '');
    if (!/^-?(?:\d+\.?\d*|\.\d*)?$/.test(cleaned)) return;
    if (cleaned === '' || cleaned === '-' || cleaned === '.' || cleaned === '-.') { setNormalizationInput(cleaned); resetQuiz(); return; }
    const next = Number(cleaned);
    if (Number.isFinite(next) && Math.abs(next) <= 255) { setNormalizationInput(cleaned); resetQuiz(); }
  }
  function checkNormalization() {
    if (normalizationUnavailable) { setQuizState(undefined); return; }
    const normalizedInput = mantissaAnswer.replace(/₂/g, '').trim().replace(/0+$/, '').replace(/\.$/, '');
    const expectedMantissa = normalizedMantissa.replace(/0+$/, '').replace(/\.$/, '');
    const exponentInput = Number(exponentAnswer);
    setQuizState(normalizedInput === expectedMantissa && exponentInput === normalizedExponent ? 'correct' : 'wrong');
  }

  return <section className="learning-section" id="real-numbers">
    <SectionHeading number="03" label="コンピュータでの実数の表現 · 教科書 p.74" title="固定した小数点から、動かせる小数点へ。" question="固定小数点数の仕組みを確認したあと、新しい十進数を浮動小数点数の形へ直します。" />

    <div className="binary-panel fraction-basics" id="fixed-point-lab">
      <div className="binary-panel-heading"><div><p className="step-label">FIXED POINT</p><h3>固定小数点数：符号を含む8ビット</h3></div><PrintBadge numbers="17" /></div>
      <p className="fixed-first-explanation"><strong>固定小数点数</strong>は、小数点を置く場所を先に決めておく表し方です。先頭の1ビットを符号部S、残り7ビットを数値に使います。</p>
      <div className="place-direction"><span>← 左へ1つで2倍</span><b>小数点の位置を動かせます</b><span>右へ1つで1/2倍 →</span></div>
      <label className="representation-control fixed-point-control"><span>7つの数値ビット中、小数部に使う数 <output>{fractionBits}ビット</output></span><input type="range" min="1" max="6" value={fractionBits} onChange={event => changeFractionBits(Number(event.target.value))} /></label>
      <div className="place-value-board signed-place-board" aria-label={`符号${bits[0]}、${magnitudeWithPoint(storedValueBits, fractionBits)} 2進数`}>
        <div className="fixed-sign-place"><small>符号ビット S</small><button type="button" onClick={() => toggleBit(0)} aria-label={`符号ビットは${bits[0]}。押すと変更`}>{bits[0]}</button><span>{bits[0] === '0' ? '正の数' : `−${2 ** integerBits}の位`}</span></div>
        {powers.map((power, index) => <div className={index === integerBits ? 'after-point' : ''} key={index}>
          <small>{placeName(power)}</small><button type="button" onClick={() => toggleBit(index + 1)} aria-label={`${placeName(power)}は${storedValueBits[index]}。押すと変更`}>{storedValueBits[index]}</button><span>{2 ** power}</span>
        </div>)}
      </div>
      <div className="fraction-total" aria-live="polite"><span>{bits.slice(0, 8 - fractionBits)}<b>.</b>{bits.slice(8 - fractionBits)}₂</span><i>＝</i>{bits[0] === '0' && <><span>{sumText || '0'}</span><i>＝</i></>}<strong>{Number(decimalValue.toFixed(8))}₁₀</strong></div>
      {bits[0] === '1' && <div className="fixed-complement-reading" aria-live="polite"><h4>符号ビットが1のとき：負の数なので、2の補数で大きさを求める</h4><p className="fixed-negative-rule">先頭が1ならマイナスです。まず8ビット全体の<strong>2の補数</strong>を作り、求めた大きさの前に「−」を付けます。</p><div className="fixed-complement-flow"><span><small>元の保存ビット</small><b>{bits}</b></span><i>すべて反転</i><span><small>反転</small><b>{magnitudeConversion.inverted}</b></span><i>＋00000001</i><span><small>2の補数（大きさ）</small><b>{magnitudeConversion.result}</b></span></div><div className="complement-place-board" style={{gridTemplateColumns: `repeat(8, minmax(0, 1fr))`}}>{[...magnitudeConversion.result].map((bit, index) => <span className={`${index === 8 - fractionBits ? 'after-point' : ''} ${bit === '1' ? 'is-one' : ''}`} key={index}><small>{placeName(magnitudePowers[index])}</small><b>{bit}</b><i>{bit === '1' ? 2 ** magnitudePowers[index] : 0}</i></span>)}</div><div className="magnitude-addition"><small>1になっている位を足す</small><b>{magnitudeSumText || '0'} ＝ {Math.abs(Number(decimalValue.toFixed(8)))}</b><span>元の符号ビットが1なので、答えは <strong>−{Math.abs(Number(decimalValue.toFixed(8)))}</strong></span></div></div>}
      <div className="fixed-point-summary"><span>符号部 <b>1ビット</b></span><span>整数部 <b>{integerBits}ビット</b></span><span>小数部 <b>{fractionBits}ビット</b></span></div>
      <p className="foundation-note"><b>小数点の右は、1/2、1/4、1/8、1/16…の位。</b>下には同じ位を10進小数（0.5、0.25、0.125、0.0625…）で表示しています。最小の刻みは{fixedStep}です。</p>
    </div>

    <div className="binary-panel floating-introduction-panel">
      <div className="binary-panel-heading"><div><p className="step-label">FLOATING POINT</p><h3>浮動小数点数：小数点の位置も一緒に保存する</h3></div><span className="binary-model-badge">まず仕組みを確認</span></div>
      <div className="floating-origin-story"><span><small>固定小数点数の困りごと</small><b>小数点の位置を、最初に決める必要がある</b></span><i>→</i><span><small>考えられた工夫</small><b>小数点の位置も数と一緒に保存する</b></span><i>→</i><span><small>浮動小数点数</small><b>先頭を1.にそろえ、動かした数を指数にする</b></span></div>
      <p className="floating-origin-note"><strong>浮動小数点数</strong>なら、小数点を固定せず、大きい数から小さい数まで同じ形式で表せます。作る第一歩が「先頭を1.にそろえる」です。負の数でも仮数部は2の補数にせず、<strong>絶対値を正規化</strong>し、マイナスは符号部Sへ保存します。</p>
      <div className="floating-formula-overview"><div className="formula-main"><span className="overview-mantissa"><b>1.</b><em>xxxx</em>₂<small>仮数部 M</small></span><i>×</i><span className="overview-exponent"><b>2</b><sup>E</sup><small>指数部 E</small></span></div><div className="formula-storage"><span><small>仮数部へ保存</small><b>1.の右側の数字</b></span><span><small>指数部へ保存</small><b>小数点を動かした数</b></span></div><strong>仮数部に数字、指数部に小数点の位置を入れることで、小数点の位置まで一緒に保存できます。</strong></div>
      <p className="floating-ready-note">仕組みが分かったら、実際の数を<strong>1.xxxx₂ × 2<sup>E</sup></strong>の形へ直してみよう。</p>
    </div>

    <div className="binary-panel representation-card floating-linked-card" id="normalization-quiz">
      <div className="binary-panel-heading"><div><p className="step-label">NORMALIZATION QUIZ</p><h3>クイズ：先頭を1.にそろえよう</h3></div><PrintBadge numbers="18〜21" /></div>
      <label className="normalization-decimal-input"><span>正規化する十進数を入力</span><input type="text" inputMode="decimal" value={normalizationInput} onChange={event => changeNormalizationInput(event.target.value)} aria-describedby="normalization-input-rule" /><small id="normalization-input-rule">−255〜255の小数を入力できます。2進数は有効数字8ビットに丸めます（0以外の最小値は0.00390625）。初期値は−45.25です。</small></label>
      <div className="normalization-source-bridge decimal-normalization-flow"><span><small>入力した十進数</small><strong>{normalizationInput || '—'}₁₀</strong></span><i>→</i><span><small>符号を分けて絶対値にする</small><strong>{normalizationInputValid ? magnitudeInteger : '—'}₁₀</strong></span><i>→</i><span><small>有効数字8ビットの2進数へ</small><strong>{normalizationInputValid ? binaryApproximation.display : '—'}₂</strong></span></div>
      <p className="normalization-rounding-note">{normalizationInputValid && magnitudeInteger > 0 ? Math.abs(binaryApproximation.roundedValue - magnitudeInteger) < 1e-12 ? <>この値は8ビットで<strong>正確に表せます</strong>。</> : <>8ビットへ丸めると、絶対値は約<strong>{Number(binaryApproximation.roundedValue.toPrecision(10))}</strong>になります。</> : '入力すると、8ビットに丸めた2進数をここへ表示します。'}</p>
      <p className="normalization-source-note"><strong>ここでは固定小数点数と連動しません。</strong>浮動小数点数では、負数の仮数部を2の補数にはしません。符号は符号部Sへ分け、<strong>絶対値を2進数に直して正規化</strong>します。{normalizationInputValid && normalizationValue < 0 && <span>{normalizationValue}₁₀は、S＝1としてマイナスを保存し、絶対値{magnitudeInteger}₁₀を表す{binaryApproximation.display}₂を正規化します。</span>}</p>
      <div className="normalization-target-banner" aria-label={`${binaryApproximation.display}を1点何々かける2のE乗へ直す`}>
        <span><small>絶対値を2進数にした数</small><strong>{normalizationInputValid ? binaryApproximation.display : '—'}₂</strong>{normalizationInputValid && <small>符号部 S＝{normalizationSign}（{normalizationSign === '0' ? 'プラス' : 'マイナス'}）</small>}</span>
        <i>→</i>
        <span><small>絶対値をこの形へ直す</small><strong>{normalizationInputValid && normalizationValue < 0 ? '−' : ''}1.<em>xxxx</em>₂ × 2<sup>E</sup></strong></span>
      </div>
      <div className="normalization-quiz">
        <label>絶対値を1.にそろえた数（−は入力しない）<input value={mantissaAnswer} onChange={event => { setMantissaAnswer(event.target.value.replace(/[^01.]/g, '')); setQuizState(undefined); }} placeholder={normalizationUnavailable ? '0は正規化できません' : '例 1.101'} inputMode="decimal" disabled={normalizationUnavailable} /></label>
        <span>× 2<sup>E</sup></span>
        <label>指数E<input value={exponentAnswer} onChange={event => { setExponentAnswer(event.target.value.replace(/[^0-9-]/g, '')); setQuizState(undefined); }} placeholder={normalizationUnavailable ? '—' : '例 2'} inputMode="numeric" disabled={normalizationUnavailable} /></label>
        <button type="button" onClick={checkNormalization} disabled={normalizationUnavailable}>答え合わせ</button>
      </div>
      <p className={`normalization-feedback ${normalizationUnavailable ? 'is-zero' : quizState ? `is-${quizState}` : ''}`} role="status">{!normalizationInputValid ? '！−255〜255の範囲で、絶対値が0.00390625以上の小数を入力してください。' : magnitudeInteger === 0 ? '！0には先頭の1がないため、1.xxxx₂ × 2ᴱの形へ正規化できません。0以外の数を入力してください。' : quizState === 'correct' ? '✓ 正解！ 仮数部と指数部へ保存する流れを見よう。' : quizState === 'wrong' ? `× 絶対値の2進数で小数点を動かし、左端を1.にします。動かした向きと桁数も確認しよう。` : '絶対値の2進数を使い、小数点を動かしても数の大きさが変わらない指数を考えよう。'}</p>
      {quizState === 'wrong' && <div className="normalization-hints" aria-live="polite"><h4>ヒント：3つに分けて考えよう</h4><div><span><b>1</b><small>先頭の0を外す</small><strong className="leading-zero-removal">{[...originalMagnitude].map((character, index) => { const numericIndex = index > originalMagnitudePointIndex ? index - 1 : index; return <i className={character === '0' && numericIndex < leadingZeroCount ? 'is-removed' : character === '.' ? 'is-point' : ''} key={`${character}-${index}`}>{character}</i>; })}</strong><em>{leadingZeroCount > 0 ? `オレンジの0を${leadingZeroCount}個だけ外します。数全体は改行しません。` : '先頭に外せる0がないので、この手順では何も外しません。'}</em></span><span><b>2</b><small>最初の1の直後へ点を置く</small><strong>1<span className="hint-point">.</span>{numericBits.slice(Math.max(0, firstOne + 1))}</strong></span><span className="shift-hint-card"><b>3</b><small>数字は動かさず、小数点だけを移す</small><div className="point-movement-board"><p>上段は元の0を消さず、そのまま表示しています。下段では薄い先頭0を目印にして、オレンジの小数点だけを追いかけよう。</p><span><i>もとの点</i><code style={{gridTemplateColumns: `repeat(${pointTrackColumns}, minmax(12px,1fr))`}}>{[...numericBits].map((character,index)=><b style={{gridColumn: index * 2 + 1}} key={`original-digit-${index}`}>{character}</b>)}<em style={{gridColumn: originalPointAfter * 2}}>.</em></code></span><div><b>{normalizedExponent >= 0 ? '←'.repeat(Math.max(1, normalizedExponent)) : '→'.repeat(Math.max(1, Math.abs(normalizedExponent)))}</b><small>小数点だけを{normalizedExponent >= 0 ? `左へ${normalizedExponent}桁` : `右へ${Math.abs(normalizedExponent)}桁`}移動</small></div><span><i>1.にそろえた点</i><code style={{gridTemplateColumns: `repeat(${pointTrackColumns}, minmax(12px,1fr))`}}>{[...numericBits].map((character,index)=><b className={index < leadingZeroCount ? 'is-leading-zero' : ''} style={{gridColumn: index * 2 + 1}} key={`normalized-digit-${index}`}>{character}</b>)}<em style={{gridColumn: normalizedPointAfter * 2}}>.</em></code></span></div><strong>{normalizedExponent >= 0 ? `左へ${normalizedExponent}桁 → 指数は ＋${normalizedExponent}` : `右へ${Math.abs(normalizedExponent)}桁 → 指数は ${normalizedExponent}`}</strong><i>左へ動かした回数は正、右へ動かした回数は負の整数です。</i></span></div></div>}

      {quizState === 'correct' && <div className="floating-answer-reveal" aria-live="polite">
        <div className="underlined-floating-formula">
          <span className="mantissa-underline"><span className="formula-token"><b>{normalizationSign === '1' ? '−' : ''}1.</b><em>{mantissa.replace(/0+$/, '') || '0'}</em><sub>2</sub></span><small>絶対値の「1.」より右側を仮数部 Mへ入れる</small></span>
          <b className="formula-times">×</b>
          <span className="exponent-underline"><span className="formula-token"><b>2</b><sup><em>{normalizedExponent}</em></sup></span><small>右上の数が指数 E</small></span>
        </div>
        <p>小数点を{normalizedExponent >= 0 ? `左へ${normalizedExponent}桁` : `右へ${Math.abs(normalizedExponent)}桁`}動かして1.xxxxにしたので、元の大きさへ戻す指数は2<sup>{normalizedExponent}</sup>です。</p>
        <div className="floating-record is-filling" aria-label="単精度の符号部、指数部、仮数部"><div className="sign-part"><small>符号部 S・1ビット</small><b>{normalizationSign}</b><span>{normalizationSign === '0' ? 'プラス' : 'マイナス'}</span></div><div className="exponent-part"><small>指数部 E・8ビット</small><b>{exponentBits}</b><span>指数Eをバイアス127で保存</span></div><div className="mantissa-part"><small>仮数部 M・23ビット</small><b>{mantissa23}</b><span>2の補数にはせず、絶対値の「1.」より右側を入れて残りは0</span></div></div>
        <p className="representation-note">固定小数点数は<strong>小数点の位置をあらかじめ決めておく</strong>表し方です。浮動小数点数は、小数点を動かした数を指数部へ保存します。指数部・仮数部は有限なので、表せる範囲と精度には限界があります。</p>
        <details className="learn-more bias-note"><summary>発展：指数の「バイアス127」とは？</summary><div><p>単精度では、負の指数も8ビットの正の整数として保存できるよう、指数Eに127を足します。例えば指数2は、2＋127＝129＝10000001₂として指数部へ入ります。読み出すときは127を引いて元の指数へ戻します。</p></div></details>
      </div>}
    </div>

    <details className="learn-more ieee-note"><summary>発展：単精度32ビットと倍精度64ビット</summary><div className="ieee-comparison">
      <div className="ieee-format single"><h4>単精度（32ビット）</h4><div className="ieee-strip"><span>S<br /><b>1</b></span><span>E<br /><b>8</b></span><span>M<br /><b>23</b></span></div><p>指数8ビット、仮数23ビット。</p></div>
      <div className="ieee-format double"><h4>倍精度（64ビット）</h4><div className="ieee-strip double-strip"><span>S<br /><b>1</b></span><span>E<br /><b>11</b></span><span>M<br /><b>52</b></span></div><p>単精度の2倍の保存容量。指数の範囲も仮数の精度も増えます。</p></div>
      <p>指数部が大きいほど広い範囲、仮数部が大きいほど細かな値を保存できます。ただし、どちらもビット数で上限があります。</p>
    </div></details>
    <div className="print-term-strip five-terms"><span><small>プリント空欄</small><b>17</b><strong>固定</strong></span><span><small>プリント空欄</small><b>18</b><strong>移動</strong></span><span><small>プリント空欄</small><b>19</b><strong>符号部</strong></span><span><small>プリント空欄</small><b>20</b><strong>指数部</strong></span><span><small>プリント空欄</small><b>21</b><strong>仮数部</strong></span></div>
  </section>;
}
