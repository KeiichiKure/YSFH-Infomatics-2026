'use client';

import { useMemo, useState } from 'react';
import { approximateBinaryFraction, binaryFractionTrace, formatBits, simulateUnsignedAddition } from './binaryModels';
import { PrintBadge, SectionHeading } from './LessonParts';

type Experiment = 'overflow' | 'underflow' | 'truncation' | 'information' | 'cancellation';
type PrecisionMode = 'custom' | 'single' | 'double';

function decimalText(value: number, digits = 16) {
  return Number(value.toFixed(digits)).toString();
}

const FOUR_BIT_STEP = 1 / 16;

function roundFourFraction(value: number) {
  return Math.round(Math.max(0, value) / FOUR_BIT_STEP) * FOUR_BIT_STEP;
}

function fourFractionBits(value: number) {
  return Math.max(0, Math.min(15, Math.round(value / FOUR_BIT_STEP))).toString(2).padStart(4, '0');
}

function plainBinary(value: number, fractionDigits = 6) {
  const safe = Math.max(0, Number.isFinite(value) ? value : 0);
  const integer = Math.floor(safe).toString(2);
  let remainder = safe - Math.floor(safe);
  let fraction = '';
  for (let index = 0; index < fractionDigits; index++) { remainder *= 2; const bit = remainder >= 1 ? '1' : '0'; fraction += bit; if (bit === '1') remainder -= 1; }
  return `${integer}.${fraction}${remainder > 0 ? '…' : ''}₂`;
}

function compactBinary(value: number, fractionDigits = 8) {
  const raw = plainBinary(value, fractionDigits).replace('₂', '').replace('…', '');
  const [whole, fraction = ''] = raw.split('.');
  const trimmedFraction = fraction.replace(/0+$/, '');
  return trimmedFraction ? `${whole}.${trimmedFraction}` : whole;
}

function roundBinarySignificant(value: number, bits = 4) {
  if (!Number.isFinite(value) || value === 0) return 0;
  const exponent = Math.floor(Math.log2(Math.abs(value)));
  const step = 2 ** (exponent - bits + 1);
  return Math.round(value / step) * step;
}

function floatMantissaBits(value: number, mode: 'single' | 'double') {
  const view = new DataView(new ArrayBuffer(8));
  if (mode === 'single') {
    view.setFloat32(0, value, false);
    return (view.getUint32(0, false) & 0x7fffff).toString(2).padStart(23, '0');
  }
  view.setFloat64(0, value, false);
  const bits = (BigInt(view.getUint32(0, false)) << BigInt(32)) | BigInt(view.getUint32(4, false));
  return (bits & ((BigInt(1) << BigInt(52)) - BigInt(1))).toString(2).padStart(52, '0');
}

function summarizeBits(bits: string) {
  return bits.length <= 24 ? bits : `${bits.slice(0, 14)}…${bits.slice(-8)}`;
}

function exactDecimalDifference(decimal: string, stored: number) {
  const normalized = decimal.trim();
  if (!/^\d*\.?\d+$/.test(normalized) || !Number.isFinite(stored)) return 0;
  const [whole = '0', fraction = ''] = normalized.split('.');
  const decimalNumerator = BigInt(`${whole || '0'}${fraction}`);
  const decimalDenominator = BigInt(10) ** BigInt(fraction.length);
  const view = new DataView(new ArrayBuffer(8));
  view.setFloat64(0, stored, false);
  const raw = (BigInt(view.getUint32(0, false)) << BigInt(32)) | BigInt(view.getUint32(4, false));
  const exponentBits = Number((raw >> BigInt(52)) & BigInt(0x7ff));
  const fractionBits = raw & ((BigInt(1) << BigInt(52)) - BigInt(1));
  let binaryNumerator = exponentBits === 0 ? fractionBits : (BigInt(1) << BigInt(52)) | fractionBits;
  const binaryPower = exponentBits === 0 ? -1074 : exponentBits - 1023 - 52;
  let binaryDenominator = BigInt(1);
  if (binaryPower >= 0) binaryNumerator <<= BigInt(binaryPower);
  else binaryDenominator <<= BigInt(-binaryPower);
  const differenceNumerator = binaryNumerator * decimalDenominator - decimalNumerator * binaryDenominator;
  return Number(differenceNumerator) / Number(binaryDenominator * decimalDenominator);
}

function plainDifference(value: number) {
  if (value === 0) return '0';
  const sign = value < 0 ? '−' : '+';
  const fixed = Math.abs(value).toFixed(60);
  const [whole, fraction = ''] = fixed.split('.');
  const firstNonZero = fraction.search(/[1-9]/);
  const shortened = firstNonZero < 0 ? fraction : fraction.slice(0, firstNonZero + 9);
  return `${sign}${whole}.${shortened.replace(/0+$/, '')}`;
}

function fixedBinary(value: number, fractionBits = 7) {
  const safe = Math.max(0, value);
  const integer = Math.floor(safe).toString(2);
  const fraction = Math.round((safe - Math.floor(safe)) * 2 ** fractionBits).toString(2).padStart(fractionBits, '0').slice(-fractionBits);
  return `${integer}.${fraction}`;
}

function learningFloat(value: number, mantissaBits = 8) {
  if (!Number.isFinite(value) || value === 0) return { mantissa: `0.${'0'.repeat(mantissaBits - 1)}`, exponent: 0 };
  const exponent = Math.floor(Math.log2(Math.abs(value)));
  const coefficient = Math.abs(value) / 2 ** exponent;
  let remainder = coefficient - 1;
  let fraction = '';
  for (let index = 0; index < mantissaBits - 1; index++) {
    remainder *= 2;
    const bit = remainder >= 1 ? '1' : '0';
    fraction += bit;
    if (bit === '1') remainder -= 1;
  }
  return { mantissa: `1.${fraction}`, exponent };
}

function alignedCoefficient(value: number, exponent: number, fractionDigits = 8) {
  return plainBinary(Math.abs(value) / 2 ** exponent, fractionDigits).replace('₂', '');
}

function signedExponentBits(exponent: number) {
  return (((Math.trunc(exponent) % 16) + 16) % 16).toString(2).padStart(4, '0');
}

function plainDecimal(text: string) {
  const trimmed = text.trim();
  if (trimmed.length === 0 || trimmed.length > 16 || !/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(trimmed)) return undefined;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : undefined;
}

function roundingInputError(text: string) {
  const value = plainDecimal(text);
  if (value === undefined) return '0より大きく1より小さい小数を、普通の小数表記で入力してください。';
  if (value <= 0 || value >= 1) return 'この実験で入力できるのは、0より大きく1より小さい小数です。';
  return '';
}

function unsignedInputError(text: string, max: number) {
  if (!/^\d+$/.test(text.trim())) return `0〜${max}の整数を入力してください。小数や負数は使えません。`;
  const value = Number(text);
  return Number.isSafeInteger(value) && value <= max ? '' : `4ビット符号なし整数で保存できる範囲は0〜${max}です。`;
}

function fourBitFractionError(text: string) {
  const value = plainDecimal(text);
  if (value === undefined || value <= 0 || value > 0.9375) return '0.0625〜0.9375の小数を入力してください。';
  if (Math.abs(value / FOUR_BIT_STEP - Math.round(value / FOUR_BIT_STEP)) > 1e-9) return '入力する2数は、小数部4ビットへ正確に入る0.0625の倍数にしてください。';
  return '';
}

function learningFloatInputError(text: string) {
  const value = plainDecimal(text);
  if (value === undefined) return '指数表記や負数は使わず、正の数を普通の小数表記で入力してください。';
  if (value < 2 ** -8 || value > 240) return '指数部4ビットで扱うため、0.00390625〜240の範囲で入力してください。';
  return '';
}

function cancellationInputError(text: string) {
  const value = plainDecimal(text);
  if (value === undefined || value < 1 || value > 1.99) return '桁落ちの実験では、1〜1.99の数を普通の小数表記で入力してください。';
  return '';
}

function ExperimentStepControls({ step, max, onChange }: { step: number; max: number; onChange: (next: number) => void }) {
  return <div className="experiment-step-controls"><button type="button" disabled={step === 0} onClick={() => onChange(step - 1)}>← 1つ戻る</button><output>段階 {step + 1} / {max + 1}</output><button type="button" className={step < max ? 'is-primary' : ''} disabled={step === max} onClick={() => onChange(step + 1)}>{step === max - 1 ? '結果を確かめる →' : '次へ →'}</button><button type="button" onClick={() => onChange(0)}>最初に戻す</button></div>;
}

export function ErrorLab() {
  const [fractionText, setFractionText] = useState('0.3');
  const fractionError = roundingInputError(fractionText);
  const fractionValue = fractionError ? 0.3 : Number(fractionText);
  const [precision, setPrecision] = useState(4);
  const [precisionMode, setPrecisionMode] = useState<PrecisionMode>('custom');
  const [experiment, setExperiment] = useState<Experiment>('overflow');
  const [run, setRun] = useState(0);
  const [overflowLeftText, setOverflowLeftText] = useState('14');
  const [overflowRightText, setOverflowRightText] = useState('3');
  const [underflowLeftText, setUnderflowLeftText] = useState('0.25');
  const [underflowRightText, setUnderflowRightText] = useState('0.125');
  const [truncationValue, setTruncationValue] = useState(1 / 3);
  const [largeText, setLargeText] = useState('8');
  const [smallText, setSmallText] = useState('0.25');
  const [cancelLeftText, setCancelLeftText] = useState('1.1719');
  const [cancelRightText, setCancelRightText] = useState('1.164');
  const [accumulationRun, setAccumulationRun] = useState(false);
  const approximation = useMemo(() => approximateBinaryFraction(fractionValue, precision), [fractionValue, precision]);
  const trace = useMemo(() => binaryFractionTrace(fractionValue, 12), [fractionValue]);
  const shownBits = approximation.sourceBits.slice(0, 12);
  const beforeRoundingBits = shownBits.slice(0, precision);
  const nextRoundingBit = shownBits[precision] ?? '0';
  const roundingChangedBits = beforeRoundingBits !== approximation.bits;
  const machineMode = precisionMode === 'custom' ? undefined : precisionMode;
  const machinePrecision = machineMode === 'single' ? 23 : 52;
  const machineStored = machineMode === 'single' ? Math.fround(fractionValue) : fractionValue;
  const machineMantissa = machineMode ? floatMantissaBits(machineStored, machineMode) : '';
  const machineError = machineMode ? exactDecimalDifference(fractionText, machineStored) : 0;
  const overflowWidth = 4;
  const overflowMax = 15;
  const overflowError = unsignedInputError(overflowLeftText, overflowMax) || unsignedInputError(overflowRightText, overflowMax);
  const safeOverflowLeft = overflowError ? 0 : Number(overflowLeftText);
  const safeOverflowRight = overflowError ? 0 : Number(overflowRightText);
  const overflow = simulateUnsignedAddition(safeOverflowLeft, safeOverflowRight, overflowWidth);
  const underflowError = fourBitFractionError(underflowLeftText) || fourBitFractionError(underflowRightText);
  const underflowLeft = underflowError ? 0.25 : Number(underflowLeftText);
  const underflowRight = underflowError ? 0.125 : Number(underflowRightText);
  const underflowExact = Math.max(0, underflowLeft * underflowRight);
  const underflowMinimum = FOUR_BIT_STEP;
  const underflowStored = underflowExact > 0 && underflowExact < underflowMinimum ? 0 : roundFourFraction(underflowExact);
  const underflowHappened = underflowExact > 0 && underflowStored === 0;
  const truncated = roundFourFraction(truncationValue);
  const truncationTrace = binaryFractionTrace(Math.min(0.999999, Math.max(0, truncationValue)), 12);
  const truncationStream = truncationTrace.map(step => step.bit).join('');
  const truncationContinues = (truncationTrace.at(-1)?.remainder ?? 0) !== 0;
  const repeatedFour = (count: number) => Array.from({ length: count }).reduce<number>(sum => roundFourFraction(sum + roundFourFraction(truncationValue)), 0);
  const informationFieldError = learningFloatInputError(largeText) || learningFloatInputError(smallText);
  const informationOrderError = !informationFieldError && Number(largeText) < Number(smallText) ? '「大きい値」には、「小さい値」以上の数を入力してください。' : '';
  const informationResultError = !informationFieldError && !informationOrderError && Number(largeText) + Number(smallText) > 240 ? '2数の和が240を超えると、情報落ちではなくオーバーフローの実験になります。和が240以下になる組み合わせにしてください。' : '';
  const informationError = informationFieldError || informationOrderError || informationResultError;
  const largeValue = informationError ? 8 : Number(largeText);
  const smallValue = informationError ? 0.25 : Number(smallText);
  const roundedLarge = roundBinarySignificant(largeValue);
  const roundedInformation = roundBinarySignificant(largeValue + smallValue);
  const informationLost = roundedInformation === roundedLarge && smallValue !== 0;
  const largeFloat = learningFloat(largeValue, 4);
  const smallFloat = learningFloat(smallValue, 4);
  const informationExponent = Math.max(largeFloat.exponent, smallFloat.exponent);
  const alignedLarge = alignedCoefficient(largeValue, informationExponent);
  const alignedSmall = alignedCoefficient(smallValue, informationExponent);
  const alignedInformationSum = alignedCoefficient(largeValue + smallValue, informationExponent);
  const informationDigits = alignedInformationSum.replace('.', '').replace('…', '');
  const informationKept = informationDigits.slice(0, 4);
  const informationOutside = informationDigits.slice(4);
  const cancelError = cancellationInputError(cancelLeftText) || cancellationInputError(cancelRightText);
  const cancelLeft = cancelError ? 1.1719 : Number(cancelLeftText);
  const cancelRight = cancelError ? 1.164 : Number(cancelRightText);
  const exactCancellation = cancelLeft - cancelRight;
  const cancellationStep = 1 / 128;
  const storedCancelLeft = Math.round(cancelLeft / cancellationStep) * cancellationStep;
  const storedCancelRight = Math.round(cancelRight / cancellationStep) * cancellationStep;
  const storedCancellation = storedCancelLeft - storedCancelRight;
  const cancellationIsZero = storedCancellation === 0;
  const cancellationExactIsZero = exactCancellation === 0;
  const orderedCancelHigh = Math.max(storedCancelLeft, storedCancelRight);
  const orderedCancelLow = Math.min(storedCancelLeft, storedCancelRight);
  const cancelLeftBits = fixedBinary(orderedCancelHigh, 7);
  const cancelRightBits = fixedBinary(orderedCancelLow, 7);
  const commonPrefix = [...cancelLeftBits].findIndex((bit, index) => bit !== cancelRightBits[index]);
  const commonCount = commonPrefix < 0 ? cancelLeftBits.length : commonPrefix;
  const cancellationBits = fixedBinary(Math.abs(storedCancellation), 7);
  const storedCancellationFloat = learningFloat(Math.abs(storedCancellation), 8);
  const cancelLeftFloat = learningFloat(storedCancelLeft, 8);
  const cancelRightFloat = learningFloat(storedCancelRight, 8);
  const firstResultOne = cancellationBits.indexOf('1');
  const normalizationShift = firstResultOne > cancellationBits.indexOf('.') ? firstResultOne - cancellationBits.indexOf('.') : 0;
  const repeatedSum = Array.from({ length: 500 }).reduce<number>(sum => sum + 0.01, 0);

  function resetRounding(next?: number) {
    if (typeof next === 'number') setFractionText(String(next));
  }
  function chooseExperiment(next: Experiment) { setExperiment(next); setRun(0); }

  return <section className="learning-section" id="errors">
    <SectionHeading number="04" label="コンピュータによる演算誤差 · 教科書 p.75" title="まず試して、値が変わる瞬間を見よう。" question="限られたビットへ保存すると、本来の値とどんな差が生まれるだろう？" />

    <div className="binary-panel rounding-lab">
      <div className="binary-panel-heading"><div><p className="step-label">ROUNDING LAB</p><h3>好きな小数を2進数へ直してみる</h3></div><PrintBadge numbers="22" /></div>
      <div className="fraction-presets" aria-label="変換する10進小数を選ぶ">{[0.1, 0.25, 0.3, 0.5, 0.7].map(value => <button type="button" className={Number(fractionText) === value ? 'is-active' : ''} onClick={() => resetRounding(value)} key={value}>{value}</button>)}</div>
      <label className="decimal-custom-input">自分で入力（0より大きく1より小さい数）<input type="text" inputMode="decimal" maxLength={16} value={fractionText} onChange={event => setFractionText(event.target.value)} aria-invalid={Boolean(fractionError)} /></label>
      {fractionError && <p className="input-validation-message" role="alert"><b>！入力を確認</b>{fractionError}<span>入力が正しくなるまで、変換結果は表示しません。</span></p>}
      {!fractionError && <>
      <div className="fraction-place-ruler" aria-label={`${fractionValue}を2進小数の位へ当てはめる`}><div className="fraction-target"><small>10進小数</small><b>{fractionText}</b><span>を2進数へ</span></div><i>→</i><div className="fraction-place-cells">{shownBits.slice(0,8).split('').map((bit,index)=><span className={precisionMode === 'custom' && index < precision ? 'is-kept' : ''} key={index}><small>1/{2**(index+1)}の位</small><b>{bit}</b><i>{2**-(index+1)}</i></span>)}</div></div>
      <div className="precision-mode-buttons" aria-label="保存精度を選ぶ"><button type="button" className={precisionMode === 'custom' ? 'is-active' : ''} onClick={() => setPrecisionMode('custom')}>学習用 2〜10ビット</button><button type="button" className={precisionMode === 'single' ? 'is-active' : ''} onClick={() => setPrecisionMode('single')}>単精度・仮数23ビット</button><button type="button" className={precisionMode === 'double' ? 'is-active' : ''} onClick={() => setPrecisionMode('double')}>倍精度・仮数52ビット</button></div>
      {precisionMode === 'custom' && <label className="representation-control precision-control"><span>保存する小数部 <output>{precision}ビット</output></span><input type="range" min="2" max="10" value={precision} onChange={event => { setPrecision(Number(event.target.value)); setPrecisionMode('custom'); }} /></label>}
        <div className={`fraction-stream ${precisionMode !== 'custom' ? 'is-machine' : ''}`} key={`${fractionValue}-${precisionMode}-${precision}`} aria-label={`${fractionValue}の2進小数`}><b>{precisionMode === 'custom' ? '0.' : '仮数部 M：'}</b>{precisionMode === 'custom' ? [...shownBits].map((bit, index) => <span key={index} className={index < precision ? 'is-kept' : index === precision ? 'is-next' : ''}>{bit}</span>) : <span className="machine-bit-summary">{summarizeBits(machineMantissa)}</span>}{precisionMode === 'custom' && <i>…</i>}</div>
        {precisionMode === 'custom' ? <><div className="rounding-decision"><span><small>切る直前</small><b>0.{beforeRoundingBits}<i>|</i><em>{nextRoundingBit}</em>…₂</b></span><strong>{nextRoundingBit === '1' ? '次のビットが1 → 1を繰り上げる' : '次のビットが0 → そのまま保存'}</strong><span><small>丸めた後</small><b>0.{approximation.bits}₂</b></span>{roundingChangedBits && <p>上の <b>0.{beforeRoundingBits}</b> と下の <b>0.{approximation.bits}</b> が違うのは、次のビットを見て丸めたためです。</p>}</div>
        <div className="rounding-comparison" aria-live="polite"><div className="rounding-original"><small>本来保存したい10進数</small><b>{fractionValue}</b></div><i>2進数を{precision}ビットへ丸める</i><div className="rounding-stored"><small>同じ保存値を、2通りで読む</small><span><b>0.{approximation.bits}₂</b><em>＝</em><b>{approximation.approximated}₁₀</b></span><p>左は丸めて保存したビット列、右はそれを10進数で読み直した値です。</p></div><strong>本来の{fractionValue}との差：<b>{approximation.error >= 0 ? '+' : ''}{approximation.error.toFixed(10)}</b></strong></div>
        <p className={`rounding-message ${approximation.error === 0 ? 'is-exact' : ''}`}><b>{approximation.error === 0 ? '✓ このビット数なら正確に表せました。' : '差が生まれました。これが丸め誤差（演算誤差）です。'}</b> 値や保存ビット数を変え、起こる場合と起こらない場合を比べよう。</p></> : <><div className="machine-precision-result"><span><small>{precisionMode === 'single' ? '単精度' : '倍精度'}の仮数部</small><b>{machinePrecision}ビット</b><code>1.{summarizeBits(machineMantissa)}₂</code></span><span><small>コンピュータに保存された10進数</small><b>{precisionMode === 'single' ? machineStored.toPrecision(10) : machineStored.toPrecision(17)}</b></span><strong>入力した{fractionText}との差：<b>{plainDifference(machineError)}</b></strong><p>長いビット列は中央を「…」で省略しています。差は指数表記を使わず、普通の小数で示しています。</p></div><p className={`rounding-message ${machineError === 0 ? 'is-exact' : ''}`}><b>{machineError === 0 ? '✓ この値は正確に保存できます。' : 'ごく小さな差があります。ビット数を増やすと差が小さくなることを確かめよう。'}</b></p></>}
        <p className="continuing-bits">{fractionValue}₁₀ ＝ 0.{trace.map(step=>step.bit).join('')}…₂　<span>{trace.at(-1)?.remainder === 0 ? '有限の桁で終わります。' : 'まだ続くため、有限ビットではどこかで丸めます。'}</span></p>
      </>}
    </div>

    <div className="try-outside"><div><p className="step-label">EXCEL / SPREADSHEET ACTIVITY</p><h3>0.01を500回足すと、本当に5になる？</h3><p>表計算ソフトでA1を<code>0</code>、A2を<code>=A1+0.01</code>としてA501までコピーし、表示桁数を増やしてみよう。</p></div><button type="button" onClick={() => setAccumulationRun(true)}>Webでも500回足してみる</button>{accumulationRun && <div className="accumulation-result" role="status"><span>期待する値 <b>5</b></span><i>↔</i><span>実際の計算 <b>{repeatedSum.toPrecision(17)}</b></span><strong>差は {decimalText(repeatedSum - 5, 18)}</strong></div>}</div>

    <div className="binary-panel error-simulator">
      <div className="binary-panel-heading"><div><p className="step-label">OTHER ERRORS</p><h3>小さなビット数の箱で、演算誤差を体験する</h3></div><span className="binary-model-badge">学習用4〜8ビット</span></div>
      <div className="error-tab-group"><div className="digit-overflow-bracket"><span>桁あふれ誤差</span></div><div aria-hidden="true" /></div>
      <div className="error-tabs" aria-label="実験する誤差を選ぶ">
        <button type="button" className={experiment === 'overflow' ? 'is-active' : ''} onClick={() => chooseExperiment('overflow')}>オーバーフロー</button>
        <button type="button" className={experiment === 'underflow' ? 'is-active' : ''} onClick={() => chooseExperiment('underflow')}>アンダーフロー</button>
        <button type="button" className={experiment === 'truncation' ? 'is-active' : ''} onClick={() => chooseExperiment('truncation')}>打ち切り誤差</button>
        <button type="button" className={experiment === 'information' ? 'is-active' : ''} onClick={() => chooseExperiment('information')}>情報落ち</button>
        <button type="button" className={experiment === 'cancellation' ? 'is-active' : ''} onClick={() => chooseExperiment('cancellation')}>桁落ち</button>
      </div>

      {experiment === 'overflow' && <div className="experiment-panel">
        <div className="error-explanation"><h4>オーバーフローとは</h4><p>計算結果が、決めたビット数で表せる最大値を超える現象です。この実験は<strong>4ビット固定</strong>なので、0〜15までしか保存できません。</p></div>
        <div className="four-bit-rule"><b>整数用の4ビット箱</b><span>8の位</span><span>4の位</span><span>2の位</span><span>1の位</span><strong>最大15</strong></div>
        <div className="number-inputs"><label>左の値<input type="text" inputMode="numeric" maxLength={2} value={overflowLeftText} onChange={event => { setOverflowLeftText(event.target.value); setRun(0); }} aria-invalid={Boolean(overflowError)} /></label><span>＋</span><label>右の値<input type="text" inputMode="numeric" maxLength={2} value={overflowRightText} onChange={event => { setOverflowRightText(event.target.value); setRun(0); }} aria-invalid={Boolean(overflowError)} /></label></div>
        {overflowError ? <p className="input-validation-message" role="alert"><b>！入力を確認</b>{overflowError}<span>4ビットへ勝手に丸めたり、15へ置き換えたりはしません。</span></p> : <>
        <div className={`overflow-step-stage ${overflow.overflow ? 'has-error' : 'no-error'}`} aria-live="polite"><p><b>段階{run+1}</b>　{['入力を決めたビットへそろえる','ビット数を制限せず計算する',`${overflowWidth}ビットの箱と外側に分ける`,overflow.overflow?'箱の外を保存できない':'箱の中へそのまま保存'][run]}</p>
          {run===0&&<div className="overflow-operands"><span>{formatBits(safeOverflowLeft, overflowWidth)}</span><i>＋</i><span>{formatBits(safeOverflowRight, overflowWidth)}</span></div>}
          {run===1&&<div className="overflow-exact"><b>{safeOverflowLeft}＋{safeOverflowRight}＝{overflow.exact}</b><strong>{overflow.exact.toString(2)}₂</strong></div>}
          {run===2&&<div className="overflow-boxes dynamic-boxes" style={{gridTemplateColumns:`repeat(${overflowWidth+1}, minmax(28px, 1fr))`}}>{overflow.exact.toString(2).padStart(overflowWidth+1,'0').split('').map((bit,index)=><span className={index===0&&overflow.overflow?'is-outside':''} key={index}>{bit}<small>{index===0 ? overflow.overflow ? '箱の外' : '先頭0' : '箱の中'}</small></span>)}</div>}
          {run===3&&<div className="overflow-final">{overflow.overflow&&<del>{overflow.exact.toString(2).padStart(overflowWidth+1,'0')[0]}</del>}<b>{formatBits(overflow.stored, overflowWidth)}</b><span>＝ {overflow.stored}</span><strong>{overflow.overflow?`！本来の${overflow.exact}から変わった`:'✓ はみ出さないので変わらない'}</strong></div>}
        </div>
        <div className="experiment-step-controls"><button type="button" disabled={run===0} onClick={()=>setRun(run-1)}>← 戻る</button><output>{run+1} / 4</output><button type="button" disabled={run===3} onClick={()=>setRun(run+1)}>次へ →</button><button type="button" onClick={()=>setRun(0)}>最初から</button></div>
        </>}
      </div>}

      {experiment === 'underflow' && <div className="experiment-panel">
        <div className="error-explanation"><h4>アンダーフローとは</h4><p>計算結果が、用意した小数の最小の位より小さくなり、保存すると0になってしまう現象です。ここでは<strong>小数部4ビット</strong>で、どちらも保存できる2数を掛け合わせます。</p></div>
        <div className="four-bit-rule fraction-rule"><b>小数用の4ビット箱</b><span>0.5</span><span>0.25</span><span>0.125</span><span>0.0625</span><strong>最小0.0625</strong></div>
        <div className="number-inputs"><label>掛ける数A<input type="text" inputMode="decimal" maxLength={8} value={underflowLeftText} onChange={event => { setUnderflowLeftText(event.target.value); setRun(0); }} aria-invalid={Boolean(underflowError)} /></label><span>×</span><label>掛ける数B<input type="text" inputMode="decimal" maxLength={8} value={underflowRightText} onChange={event => { setUnderflowRightText(event.target.value); setRun(0); }} aria-invalid={Boolean(underflowError)} /></label></div>
        {underflowError ? <p className="input-validation-message" role="alert"><b>！入力を確認</b>{underflowError}<span>入力する2数そのものが4ビットへ入る場合だけ、積のアンダーフローを実験します。</span></p> : <>
        <div className="error-history" aria-live="polite">
          <section><h5>1　掛ける前の2数は、どちらも4ビットへ入る</h5><div className="stored-number-pair"><span><small>A：{underflowLeft}</small><b>0.{fourFractionBits(underflowLeft)}₂</b><i>保存できる</i></span><span><small>B：{underflowRight}</small><b>0.{fourFractionBits(underflowRight)}₂</b><i>保存できる</i></span></div></section>
          {run>=1&&<section><h5>2　普通の小数として掛け算する</h5><div className="exact-operation"><b>{underflowLeft} × {underflowRight}</b><i>＝</i><strong>{decimalText(underflowExact, 8)}</strong><span>これが本来の答え</span></div></section>}
          {run>=2&&<section><h5>3　4ビット箱の最小値と比べる</h5><div className="minimum-comparison"><span>本来の答え<br /><b>{decimalText(underflowExact, 8)}</b></span><i>{underflowExact < underflowMinimum ? '＜' : '≧'}</i><span>箱の最小値<br /><b>0.0625</b></span></div><p className="stage-instruction">掛ける前の2数は入ったのに、計算結果は最小の位より小さくなりました。</p></section>}
          {run>=3&&<section><h5>4　どの位にも1を置けず、0として保存される</h5><div className="four-fraction-cells"><span><small>0.5</small><b>0</b></span><span><small>0.25</small><b>0</b></span><span><small>0.125</small><b>0</b></span><span><small>0.0625</small><b>{underflowStored >= 0.0625 ? '1' : '0'}</b></span></div><div className={`experiment-result ${underflowHappened ? 'has-error' : 'no-error'}`}><div><small>本来の答え</small><b>{decimalText(underflowExact, 8)}</b></div><i>小数部4ビットへ保存</i><div><small>保存された値</small><b>0.{fourFractionBits(underflowStored)}₂ ＝ {underflowStored}</b></div><strong>{underflowHappened ? '！両方の入力は保存できたのに、積が小さすぎて0になりました。これがアンダーフローです。' : '✓ 0.0625以上なので、4ビット箱へ残せました。'}</strong></div></section>}
        </div>
        <ExperimentStepControls step={run} max={3} onChange={setRun} />
        </>}
      </div>}

      {experiment === 'truncation' && <div className="experiment-panel">
        <div className="error-explanation"><h4>打ち切り誤差とは</h4><p>終わらない2進小数を途中で止めるため、本来の値との差が生まれる現象です。ここでは<strong>小数点以下4ビット</strong>で止めます。</p></div>
        <div className="value-buttons">{[{label:'0.1',value:0.1},{label:'1÷3',value:1/3},{label:'0.25（比較）',value:0.25}].map(item=><button type="button" className={truncationValue===item.value?'is-active':''} onClick={()=>{setTruncationValue(item.value);setRun(0);}} key={item.label}>{item.label}</button>)}</div>
        <div className="four-bit-rule fraction-rule"><b>小数用の4ビット箱</b><span>0.5</span><span>0.25</span><span>0.125</span><span>0.0625</span><strong>ここで止める</strong></div>
        <div className="error-history" aria-live="polite">
          <section><h5>1　元の2進小数を見る</h5><div className="exact-binary-form"><b>0.{truncationStream}{truncationContinues ? '…' : ''}₂</b><span>{truncationContinues ? '右側へまだ続いています' : 'この数は途中で終わります'}</span></div></section>
          {run>=1&&<section><h5>2　4ビットの後ろで止め、次の1桁を確認する</h5><div className="binary-cut-visual four-bit-cut"><b>0.</b>{[...truncationStream.slice(0,8)].map((bit,index)=><span className={index<4?'is-kept':index===4?'is-next':'is-cut'} key={index}>{bit}</span>)}{truncationContinues&&<i>…</i>}<strong>✂</strong></div><p className="stage-instruction">最初の4桁は <b>{truncationStream.slice(0,4)}</b>。次の桁が{truncationStream[4]}なので、{truncationStream[4]==='1'?'繰り上げて丸めます':'そのままにします'}。</p></section>}
          {run>=2&&<section><h5>3　4ビットで保存した値と比べる</h5><div className={`experiment-result ${truncated!==truncationValue?'has-error':'no-error'}`}><div><small>本来の値</small><b>{decimalText(truncationValue, 8)}</b></div><i>0.{fourFractionBits(truncated)}₂ として保存</i><div><small>保存後の値</small><b>{truncated}</b></div><strong>{truncated!==truncationValue?`差は ${decimalText(Math.abs(truncated-truncationValue),8)}。4ビットで止めたためです。`:'この数は4ビットで正確に保存できました。'}</strong></div></section>}
          {run>=3&&<section><h5>4　4ビットへ毎回丸めて、100回足し算する</h5><div className="repetition-results two-results"><span><small>本来の値を100回足す</small><b>{decimalText(truncationValue,6)} × 100</b><strong>＝ {decimalText(truncationValue*100,6)}</strong></span><i>比べる</i><span><small>毎回4ビットへ丸めて足す</small><b>{decimalText(roundFourFraction(truncationValue),6)} × 100</b><strong>＝ {decimalText(repeatedFour(100),6)}</strong></span><p>本来は約{decimalText(truncationValue*100,6)}ですが、毎回丸めると{decimalText(repeatedFour(100),6)}になりました。小さな差が100回分積み重なっています。</p></div></section>}
        </div>
        <ExperimentStepControls step={run} max={3} onChange={setRun} />
      </div>}

      {experiment === 'information' && <div className="experiment-panel">
        <div className="error-explanation"><h4>情報落ちとは</h4><p>大きな数へ小さな数を足すときは、先に<strong>指数を同じ値へそろえます</strong>。すると小さい数の仮数部が右へずれ、仮数部の保存枠から出た1が結果へ残らないことがあります。</p></div>
        <div className="learning-float-rule"><b>学習用の浮動小数点数</b><span><small>仮数部 M</small><strong>有効数字4ビット</strong></span><i>×</i><span><small>指数部 E</small><strong>符号付き4ビット</strong></span></div>
        <div className="number-inputs"><label>大きい値<input type="text" inputMode="decimal" maxLength={16} value={largeText} onChange={event=>{setLargeText(event.target.value);setRun(0);}} aria-invalid={Boolean(informationError)} /></label><span>＋</span><label>小さい値<input type="text" inputMode="decimal" maxLength={16} value={smallText} onChange={event=>{setSmallText(event.target.value);setRun(0);}} aria-invalid={Boolean(informationError)} /></label></div>
        {informationError ? <p className="input-validation-message" role="alert"><b>！入力を確認</b>{informationError}<span>この実験では、仮数部4ビット・指数部4ビットで扱える正の数だけを使います。</span></p> : <>
        <div className="error-history" aria-live="polite"><section><h5>1　10進数を2進数に直し、学習用浮動小数点数へ入れる</h5><div className="float-value-pair"><span><small>大きい数</small><div className="decimal-binary-pair"><b>{largeValue}<sub>10</sub></b><i>↓ 2進数</i><strong>{compactBinary(largeValue)}₂</strong></div><em>先頭を1.にそろえる</em><b>{largeFloat.mantissa}₂ × 2<sup>{largeFloat.exponent}</sup></b><div className="float-field-pair"><i>M</i><strong>{largeFloat.mantissa.replace('.','')}</strong><i>E</i><strong>{signedExponentBits(largeFloat.exponent)} <em>({largeFloat.exponent})</em></strong></div></span><span><small>小さい数</small><div className="decimal-binary-pair"><b>{smallValue}<sub>10</sub></b><i>↓ 2進数</i><strong>{compactBinary(smallValue)}₂</strong></div><em>先頭を1.にそろえる</em><b>{smallFloat.mantissa}₂ × 2<sup>{smallFloat.exponent}</sup></b><div className="float-field-pair"><i>M</i><strong>{smallFloat.mantissa.replace('.','')}</strong><i>E</i><strong>{signedExponentBits(smallFloat.exponent)} <em>({smallFloat.exponent})</em></strong></div></span></div><p className="stage-instruction">初期値では、8は1000₂、0.25は0.01₂です。そこから正規化し、M（仮数部4ビット）とE（指数部4ビット）へ分けて保存します。</p></section>
          {run>=1&&<section><h5>2　指数をそろえてから、仮数部どうしを足す</h5><div className="float-exponent-alignment"><span><small>大きい数</small><b>{largeFloat.mantissa}₂ × 2<sup>{largeFloat.exponent}</sup></b><i>{alignedLarge}₂ × 2<sup>{informationExponent}</sup></i></span><span><small>小さい数</small><b>{smallFloat.mantissa}₂ × 2<sup>{smallFloat.exponent}</sup></b><i>{alignedSmall}₂ × 2<sup>{informationExponent}</sup></i></span><strong>足し算するため、両方の指数を {informationExponent} にそろえる</strong></div><div className="aligned-mantissa-addition"><span>{alignedLarge}</span><b>＋</b><span>{alignedSmall}</span><i></i><strong>{alignedInformationSum}</strong><small>すべて × 2<sup>{informationExponent}</sup></small></div><p className="stage-instruction">指数をそろえると、小さい数の仮数部は右へ移動します。本来の和は{largeValue + smallValue}です。</p></section>}
          {run>=2&&<section><h5>3　仮数部は4ビットしかないため、右側が保存枠から出る</h5><div className="mantissa-storage-window"><small>和の仮数部　{alignedInformationSum}₂ × 2<sup>{informationExponent}</sup></small><div><span className="kept-mantissa"><b>{informationKept[0]}</b><i>.</i>{[...informationKept.slice(1)].map((bit,index)=><b key={index}>{bit}</b>)}</span><span className="lost-mantissa">{informationOutside || '0'}…</span></div><strong>仮数部は4ビットだけ保存。右側の「{informationOutside.includes('1') ? '1' : '桁'}」は枠の外です。</strong></div><p className="stage-instruction">指数部には{signedExponentBits(informationExponent)}₂（{informationExponent}）を保存できますが、仮数部は{informationKept}までなので、小さい数の情報が落ちます。</p></section>}
          {run>=3&&<section><h5>4　足す前後の保存値を比べる</h5><div className={`experiment-result ${informationLost?'has-error':'no-error'}`}><div><small>本来の答え</small><b>{largeValue}＋{smallValue}＝{largeValue+smallValue}</b></div><i>4ビットへ保存</i><div><small>保存された答え</small><b>{roundedInformation}</b></div><strong>{informationLost?`！${smallValue}を足したのに、保存値は${roundedLarge}のままです。これが情報落ちです。`:'✓ この値では小さい数も結果へ残りました。'}</strong></div></section>}
        </div>
        <ExperimentStepControls step={run} max={3} onChange={setRun} />
        </>}
      </div>}

      {experiment === 'cancellation' && <div className="experiment-panel">
        <div className="error-explanation"><h4>桁落ちとは</h4><p>ほとんど同じ2数を引くと、仮数部の先頭にある確かな桁どうしが0になります。残った小さな数を再び1.の形へ直すと指数が変わり、空いた仮数部を0で埋めるため、有効な数字が大きく減ります。</p></div>
        <div className="learning-float-rule cancellation-float-rule"><b>学習用の浮動小数点数</b><span><small>仮数部</small><strong>8ビット</strong></span><i>×</i><span><small>指数部</small><strong>計算後に位置を直す</strong></span></div>
        <div className="number-inputs"><label>近い数A<input type="text" inputMode="decimal" maxLength={16} value={cancelLeftText} onChange={event=>{setCancelLeftText(event.target.value);setRun(0);}} aria-invalid={Boolean(cancelError)} /></label><span>－</span><label>近い数B<input type="text" inputMode="decimal" maxLength={16} value={cancelRightText} onChange={event=>{setCancelRightText(event.target.value);setRun(0);}} aria-invalid={Boolean(cancelError)} /></label></div>
        {cancelError ? <p className="input-validation-message" role="alert"><b>！入力を確認</b>{cancelError}<span>指数表記や負数は使わず、近い2数を普通の小数表記で入力してください。</span></p> : <>
        <div className="error-history" aria-live="polite"><section><h5>1　本来の差を普通の小数で求める</h5><div className="exact-operation"><b>{cancelLeft} − {cancelRight}</b><i>＝</i><strong>{decimalText(exactCancellation,8)}</strong><span>これが本来の答え</span></div></section>
          {run>=1&&<section><h5>2　計算前に、仮数部8ビットと指数部で保存する</h5><div className="stored-number-pair"><span><small>A：本来 {cancelLeft}</small><b>{cancelLeftFloat.mantissa}₂ × 2<sup>{cancelLeftFloat.exponent}</sup></b><i>保存値 {storedCancelLeft}</i></span><span><small>B：本来 {cancelRight}</small><b>{cancelRightFloat.mantissa}₂ × 2<sup>{cancelRightFloat.exponent}</sup></b><i>保存値 {storedCancelRight}</i></span></div><p className="stage-instruction">どちらも指数は0でそろっています。仮数部の末尾を丸めた小さな差は、まだ目立ちません。</p></section>}
          {run>=2&&<section><h5>3　近い2数を引くと、先頭の同じ桁が次々に0になる</h5><div className="cancellation-column"><span><small>大きい方</small>{[...cancelLeftBits].map((bit,index)=><b className={bit !== '.' && index<commonCount?'is-cancelled':bit === '.'?'is-point':''} key={`a-${index}`}>{bit}</b>)}</span><span><small>小さい方</small>{[...cancelRightBits].map((bit,index)=><b className={bit !== '.' && index<commonCount?'is-cancelled':bit === '.'?'is-point':''} key={`b-${index}`}>{bit}</b>)}</span><i></i><span className="cancellation-result-row"><small>差の大きさ</small>{[...cancellationBits].map((bit,index)=><b className={bit === '.'?'is-point':''} key={`result-${index}`}>{bit}</b>)}</span></div><p className="stage-instruction">{cancellationIsZero ? '小数点の位置と全桁をそろえて引くと、保存値どうしの差はすべて0になりました。' : `小数点の位置と全桁をそろえたまま、大きい方から小さい方を引いて差の大きさを求めます。元の式が負なら、最後に−を付けます。先頭の同じ部分が打ち消され、最初に残る1は小数点から${normalizationShift}桁右です。`}</p></section>}
          {run>=3&&<section><h5>4　{cancellationIsZero ? cancellationExactIsZero ? '同じ数の差が、正確に0であることを確認する' : '丸めによって差の情報が消えたことを確認する' : '仮数部を1.に直すと指数が変わり、空きを0で埋める'}</h5>{cancellationIsZero ? <div className="cancellation-zero-result"><b>0.0000000₂</b><i>正規化しようとしても、先頭の1がない</i><strong>差は0として保存</strong><p>{cancellationExactIsZero ? '入力した2数が同じなので、差は正確に0です。これは桁落ちによる誤差ではありません。' : '計算前の丸めでAとBが同じ値になったため、引き算すると全部0です。本来あった差の情報が消え、1.xxxxの形には直せません。'}</p></div> : <div className="cancellation-normalization"><span><small>引き算直後・指数0</small><b>{storedCancellation < 0 ? '−' : ''}{cancellationBits}₂ × 2<sup>0</sup></b></span><i>小数点を右へ{normalizationShift}桁移動</i><span><small>正規化後・指数{storedCancellationFloat.exponent}</small><b>{storedCancellation < 0 ? '−' : ''}{storedCancellationFloat.mantissa}₂ × 2<sup>{storedCancellationFloat.exponent}</sup></b></span><div><strong>仮数部8ビット</strong>{[...storedCancellationFloat.mantissa.replace('.','')].map((bit,index)=>index===0?<b key={index}>{bit}</b>:<i key={index}>{bit}</i>)}</div><p>引き算後に残った数字だけが有効な数字です。元の式が負なら符号を別に保存します。指数部へ小数点の新しい位置を記録しますが、仮数部の空いた場所には0しか入れられず、元の細かな情報は戻りません。</p></div>}<div className={`experiment-result ${storedCancellation!==exactCancellation?'has-error':'no-error'}`}><div><small>本来の差</small><b>{decimalText(exactCancellation,8)}</b></div><i>8ビット保存後に引く</i><div><small>保存値どうしの差</small><b>{decimalText(storedCancellation,8)}</b></div><strong>{cancellationExactIsZero ? '✓ 同じ2数を引いたので、差は正確に0です。' : cancellationIsZero ? '！本来は差があるのに、保存後は0になりました。差の情報そのものが消えた桁落ちです。' : storedCancellation!==exactCancellation?`！差が${decimalText(Math.abs(storedCancellation-exactCancellation),8)}あります。確かな上位桁が消え、0で埋めた桁ばかりになるのが桁落ちです。`:'✓ この組み合わせでは桁落ちによる差が出ませんでした。'}</strong></div></section>}
        </div>
        <ExperimentStepControls step={run} max={3} onChange={setRun} />
        </>}
      </div>}
    </div>
    <details className="learn-more practical-error-notes"><summary>発展：Excel・スプレッドシートではどうなる？</summary><div><p>上の実験は、仕組みを見やすくするため、主に<strong>4ビット（桁落ちは8ビット）の学習モデル</strong>を使っています。実際の表計算ソフトはもっと多くのビットを使うため、同じ小さな数では誤差が見えないことがあります。誤差がなくなったのではなく、細かく保存できているためです。</p><div className="spreadsheet-challenges"><article><b>丸め・桁落ちを試す</b><code>=1-0.9-0.1</code><span>表示桁数を増やし、0に非常に近い値が残るか確認。</span></article><article><b>情報落ちを試す</b><code>=(10^16+1)-10^16</code><span>本来は1。ソフトの保存・表示方法で結果を比べる。</span></article><article><b>実用上の工夫</b><span>表示時に丸める、より多くのビットを使う、金額を整数で扱う、足す順序を工夫することで影響を小さくします。</span></article></div><p className="practical-caution">結果はソフトや設定で異なります。式と表示桁数を一緒に記録しましょう。</p></div></details>
    <div className="print-term-strip single-term"><span><small>プリント空欄</small><b>22</b><strong>丸め誤差</strong></span></div>
  </section>;
}
