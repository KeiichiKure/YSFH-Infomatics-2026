import type { Bit, GateType, NandTarget } from './logicModels';

const circuitColors = { ink: '#17324f', teal: '#2f7c7a', coral: '#e88466' } as const;
const wireAttributes = (value: Bit = 0) => ({
  className: `circuit-wire ${value ? 'signal-on' : ''}`,
  fill: 'none',
  stroke: value ? circuitColors.coral : circuitColors.ink,
  strokeWidth: value ? 7 : 4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

function GateGlyph({ gate, x = 0, y = 0, scale = 1, label = true }: { gate: GateType; x?: number; y?: number; scale?: number; label?: boolean }) {
  const base = gate === 'NAND' ? 'AND' : gate === 'NOR' ? 'OR' : gate;
  const inverted = gate === 'NOT' || gate === 'NAND' || gate === 'NOR';
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {base === 'AND' && <path className="circuit-gate" fill="white" stroke={circuitColors.ink} strokeWidth="3" d="M32 10 H68 A28 28 0 0 1 68 66 H32 Z" />}
    {(base === 'OR' || base === 'XOR') && <>
      {base === 'XOR' && <path className="circuit-gate" fill="white" stroke={circuitColors.ink} strokeWidth="3" d="M25 10 Q43 38 25 66" />}
      <path className="circuit-gate" fill="white" stroke={circuitColors.ink} strokeWidth="3" d="M32 10 Q51 38 32 66 Q70 66 101 38 Q70 10 32 10 Z" />
    </>}
    {base === 'NOT' && <path className="circuit-gate" fill="white" stroke={circuitColors.ink} strokeWidth="3" d="M32 10 L96 38 L32 66 Z" />}
    {inverted && <circle className="circuit-gate" fill="white" stroke={circuitColors.ink} strokeWidth="3" cx={base === 'AND' ? 104 : 108} cy="38" r="7" />}
    {label && <text className="circuit-gate-label" fill={circuitColors.teal} textAnchor="middle" x="65" y="42">{gate}</text>}
  </g>;
}

export function GateSymbol({ gate }: { gate: GateType }) {
  const isNot = gate === 'NOT';
  const inverted = gate === 'NOT' || gate === 'NAND' || gate === 'NOR';
  const outputX = inverted ? 108 : 101;
  return <svg className="gate-symbol-small" viewBox="0 0 140 78" aria-hidden="true">
    <line {...wireAttributes()} x1="4" y1={isNot ? 38 : 25} x2="32" y2={isNot ? 38 : 25} />
    {!isNot && <line {...wireAttributes()} x1="4" y1="52" x2="32" y2="52" />}
    <GateGlyph gate={gate} />
    <line {...wireAttributes()} x1={outputX} y1="38" x2="136" y2="38" />
  </svg>;
}

export function VennDiagram({ gate }: { gate: GateType }) {
  const id = `venn-${gate.toLowerCase()}`;
  const isNot = gate === 'NOT';
  const maskId = `${id}-mask`;
  const intersectionId = `${id}-intersection`;
  return <figure className="venn-diagram" aria-label={`${gate}回路で出力が1になる集合の領域`}>
    <svg viewBox="0 0 270 180" role="img">
      <defs>
        <pattern id={`${id}-hatch`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#ffd9ca" /><line x1="0" y1="0" x2="0" y2="8" stroke="#d86e4f" strokeWidth="3" /></pattern>
        <clipPath id={intersectionId}><circle cx="158" cy="86" r="58" /></clipPath>
        <mask id={maskId}>
          {(gate === 'AND') && <><rect width="270" height="180" fill="black" /><circle cx="106" cy="86" r="58" fill="white" clipPath={`url(#${intersectionId})`} /></>}
          {(gate === 'OR') && <><rect width="270" height="180" fill="black" /><circle cx="106" cy="86" r="58" fill="white" /><circle cx="158" cy="86" r="58" fill="white" /></>}
          {(gate === 'XOR') && <><rect width="270" height="180" fill="black" /><circle cx="106" cy="86" r="58" fill="white" /><circle cx="158" cy="86" r="58" fill="white" /><circle cx="106" cy="86" r="58" fill="black" clipPath={`url(#${intersectionId})`} /></>}
          {(gate === 'NAND') && <><rect width="270" height="180" fill="white" /><circle cx="106" cy="86" r="58" fill="black" clipPath={`url(#${intersectionId})`} /></>}
          {(gate === 'NOR') && <><rect width="270" height="180" fill="white" /><circle cx="106" cy="86" r="58" fill="black" /><circle cx="158" cy="86" r="58" fill="black" /></>}
          {(gate === 'NOT') && <><rect width="270" height="180" fill="white" /><circle cx="132" cy="86" r="58" fill="black" /></>}
        </mask>
      </defs>
      <rect className="venn-universe" fill="white" stroke={circuitColors.ink} strokeWidth="2" x="7" y="7" width="256" height="146" rx="12" />
      <rect x="7" y="7" width="256" height="146" rx="12" fill={`url(#${id}-hatch)`} mask={`url(#${maskId})`} />
      <circle className="venn-circle" fill="none" stroke={circuitColors.ink} strokeWidth="3" cx={isNot ? 132 : 106} cy="86" r="58" />
      {!isNot && <circle className="venn-circle" fill="none" stroke={circuitColors.ink} strokeWidth="3" cx="158" cy="86" r="58" />}
      <text className="venn-set-label" fill={circuitColors.ink} textAnchor="middle" x={isNot ? 132 : 72} y="72">A</text>
      {!isNot && <text className="venn-set-label" fill={circuitColors.ink} textAnchor="middle" x="192" y="72">B</text>}
      <text className="venn-universe-label" fill={circuitColors.ink} x="18" y="25">全体</text>
    </svg>
    <figcaption>斜線部分が L=1</figcaption>
  </figure>;
}

export function NandConstructionDiagram({ target, a, b, output, first, second }: { target: NandTarget; a: Bit; b: Bit; output: Bit; first: Bit; second: Bit | null }) {
  const wire = wireAttributes;
  if (target === 'NOT') return <svg className="circuit-diagram nand-circuit" viewBox="0 0 720 245" role="img" aria-label={`NANDひとつでNOTを作る回路。A=${a}、L=${output}`}>
    <text className="circuit-input-label" x="28" y="126">A={a}</text>
    <path {...wire(a)} d="M82 121 H190 V99 H230 M190 121 V146 H230" />
    <circle {...wire(a)} fill={a ? circuitColors.coral : circuitColors.ink} cx="190" cy="121" r="5" />
    <GateGlyph gate="NAND" x={198} y={73} scale={1.35} />
    <path {...wire(output)} d="M344 124 H650" />
    <text className="circuit-value-label" x="400" y="108">NAND(A,A)={output}</text>
    <text className="circuit-output-label" x="651" y="130">L={output}</text>
    <text className="circuit-caption" x="360" y="215">同じAを2つの入口へ入れる → NOTと同じ</text>
  </svg>;
  if (target === 'AND') return <svg className="circuit-diagram nand-circuit" viewBox="0 0 720 245" role="img" aria-label={`NANDふたつでANDを作る回路。A=${a}、B=${b}、L=${output}`}>
    <text className="circuit-input-label" x="24" y="82">A={a}</text><text className="circuit-input-label" x="24" y="121">B={b}</text>
    <path {...wire(a)} d="M78 77 H150" /><path {...wire(b)} d="M78 116 H150" />
    <GateGlyph gate="NAND" x={118} y={52} scale={1.35} />
    <path {...wire(first)} d="M264 103 H340 V88 H390 M340 103 V135 H390" />
    <circle {...wire(first)} fill={first ? circuitColors.coral : circuitColors.ink} cx="340" cy="103" r="5" />
    <text className="circuit-value-label" x="286" y="88">途中={first}</text>
    <GateGlyph gate="NAND" x={358} y={62} scale={1.35} />
    <path {...wire(output)} d="M504 113 H650" /><text className="circuit-output-label" fill={circuitColors.ink} x="651" y="119">L={output}</text>
    <text className="circuit-caption" x="360" y="215">NANDの結果を、もう一度NANDで反転 → ANDと同じ</text>
  </svg>;
  return <svg className="circuit-diagram nand-circuit" viewBox="0 0 720 285" role="img" aria-label={`NANDみっつでORを作る回路。A=${a}、B=${b}、L=${output}`}>
    <text className="circuit-input-label" x="20" y="78">A={a}</text><text className="circuit-input-label" x="20" y="218">B={b}</text>
    <path {...wire(a)} d="M74 73 H112 V61 H150 M112 73 V100 H150" /><circle {...wire(a)} fill={a ? circuitColors.coral : circuitColors.ink} cx="112" cy="73" r="5" />
    <path {...wire(b)} d="M74 213 H112 V201 H150 M112 213 V240 H150" /><circle {...wire(b)} fill={b ? circuitColors.coral : circuitColors.ink} cx="112" cy="213" r="5" />
    <GateGlyph gate="NAND" x={118} y={35} scale={1.35} /><GateGlyph gate="NAND" x={118} y={175} scale={1.35} />
    <path {...wire(first)} d="M264 86 H380 V119 H430" /><path {...wire(second ?? 0)} d="M264 226 H380 V158 H430" />
    <text className="circuit-value-label" x="292" y="72">NOT A={first}</text><text className="circuit-value-label" x="292" y="242">NOT B={second}</text>
    <GateGlyph gate="NAND" x={398} y={93} scale={1.35} />
    <path {...wire(output)} d="M544 144 H650" /><text className="circuit-output-label" fill={circuitColors.ink} x="651" y="150">L={output}</text>
    <text className="circuit-caption" x="360" y="272">AとBを反転してからNANDへ → ORと同じ</text>
  </svg>;
}

type AdderBasis = 'basic' | 'nand';

function HalfAdderBlock({ x, y, number, basis, top, bottom, sum, carry }: { x: number; y: number; number: 1 | 2; basis: AdderBasis; top: Bit; bottom: Bit; sum: Bit; carry: Bit }) {
  return <g transform={`translate(${x} ${y})`}>
    <rect fill="white" stroke={circuitColors.teal} strokeWidth="3" x="0" y="0" width="310" height="225" rx="20" />
    <text className="adder-block-title" fill={circuitColors.ink} textAnchor="middle" x="155" y="28">半加算回路 {number}</text>
    <text className="adder-block-inputs" fill={circuitColors.ink} textAnchor="middle" x="155" y="51">入力 {top} ＋ {bottom}</text>
    {basis === 'basic' ? <>
      <GateGlyph gate="OR" x={18} y={67} scale={0.58} /><GateGlyph gate="AND" x={84} y={67} scale={0.58} />
      <GateGlyph gate="NOT" x={151} y={67} scale={0.58} /><GateGlyph gate="AND" x={218} y={67} scale={0.58} />
      <text className="adder-block-formula" fill={circuitColors.teal} textAnchor="middle" x="155" y="153">OR・AND → NOT → AND</text>
    </> : <>
      {[18, 72, 126, 180, 234].map((gateX, index) => <GateGlyph key={gateX} gate="NAND" x={gateX} y={70 + (index % 2) * 14} scale={0.48} />)}
      <text className="adder-block-formula" fill={circuitColors.teal} textAnchor="middle" x="155" y="153">NAND × 5</text>
    </>}
    <line {...wireAttributes(carry)} x1="18" y1="178" x2="310" y2="178" />
    <text className="adder-block-output" fill={circuitColors.ink} x="18" y="171">桁上がり C{number}={carry}</text>
    <line {...wireAttributes(sum)} x1="18" y1="211" x2="310" y2="211" />
    <text className="adder-block-output" fill={circuitColors.ink} x="18" y="204">和 S{number === 1 ? '₁' : ''}={sum}</text>
  </g>;
}

export function AdderCircuitDiagram({ basis, mode, a, b, x, carry, sum, firstSum = 0, firstCarry = 0, secondCarry = 0 }: { basis: AdderBasis; mode: 'half' | 'full'; a: Bit; b: Bit; x: Bit; carry: Bit; sum: Bit; firstSum?: Bit; firstCarry?: Bit; secondCarry?: Bit }) {
  const wire = wireAttributes;
  if (mode === 'half' && basis === 'basic') {
    const either = (a || b) as Bit;
    const notCarry = (carry ? 0 : 1) as Bit;
    return <svg className="circuit-diagram adder-circuit basic" viewBox="0 0 920 420" role="img" aria-label={`教科書と同じ配置の半加算回路。上側のANDからC、下側の組み合わせからSを出す。A=${a}、B=${b}、C=${carry}、S=${sum}`}>
      <text className="circuit-input-label" fill={circuitColors.ink} x="20" y="76">A={a}</text><text className="circuit-input-label" fill={circuitColors.ink} x="20" y="306">B={b}</text>
      <path {...wire(a)} d="M72 71 H145 V84 H251 M145 71 V255 H251" /><circle {...wire(a)} fill={a ? circuitColors.coral : circuitColors.ink} cx="145" cy="71" r="5" />
      <path {...wire(b)} d="M72 301 H178 V120 H251 M178 301 V291 H251" /><circle {...wire(b)} fill={b ? circuitColors.coral : circuitColors.ink} cx="178" cy="301" r="5" />
      <GateGlyph gate="AND" x={208} y={50} scale={1.35} /><GateGlyph gate="OR" x={208} y={221} scale={1.35} />
      <path {...wire(carry)} d="M344 101 H820" /><circle {...wire(carry)} fill={carry ? circuitColors.coral : circuitColors.ink} cx="370" cy="101" r="5" /><text className="circuit-value-label" fill={circuitColors.teal} x="390" y="84">A AND B={carry}</text><text className="circuit-output-label" fill={circuitColors.ink} x="822" y="107">C={carry}</text>
      <path {...wire(carry)} d="M370 101 V227 H435" /><GateGlyph gate="NOT" x={400} y={185} scale={1.1} />
      <path {...wire(notCarry)} d="M519 227 H585 V239 H663" /><text className="circuit-value-label" fill={circuitColors.teal} x="530" y="211">NOT C={notCarry}</text>
      <path {...wire(either)} d="M344 272 H663 V275" /><text className="circuit-value-label" fill={circuitColors.teal} x="390" y="257">P=A OR B={either}</text>
      <GateGlyph gate="AND" x={620} y={205} scale={1.35} /><path {...wire(sum)} d="M756 256 H820" /><text className="circuit-output-label" fill={circuitColors.ink} x="822" y="262">S={sum}</text>
      <text className="circuit-caption" fill={circuitColors.ink} x="460" y="392">上：C = A AND B　／　下：S = (A OR B) AND NOT C</text>
    </svg>;
  }

  if (mode === 'half') {
    const n1 = (a && b ? 0 : 1) as Bit;
    const n2 = (a && n1 ? 0 : 1) as Bit;
    const n3 = (b && n1 ? 0 : 1) as Bit;
    return <svg className="circuit-diagram adder-circuit nand" viewBox="0 0 980 405" role="img" aria-label={`NANDだけで作る半加算回路。教科書と同じくCを上、Sを下に配置。A=${a}、B=${b}、C=${carry}、S=${sum}`}>
      <text className="circuit-input-label" fill={circuitColors.ink} x="18" y="91">A={a}</text><text className="circuit-input-label" fill={circuitColors.ink} x="18" y="341">B={b}</text>
      <path {...wire(a)} d="M70 86 H140 V175 H218 M140 86 H370 V190 H458" /><circle {...wire(a)} fill={a ? circuitColors.coral : circuitColors.ink} cx="140" cy="86" r="5" />
      <path {...wire(b)} d="M70 336 H160 V207 H218 M160 336 H458" /><circle {...wire(b)} fill={b ? circuitColors.coral : circuitColors.ink} cx="160" cy="336" r="5" />
      <GateGlyph gate="NAND" x={180} y={145} scale={1.2} />
      <path {...wire(n1)} d="M305 191 H350 V222 H458 M350 191 V305 H458 M350 191 V70 H620 V102 H688 M620 70 H688" /><circle {...wire(n1)} fill={n1 ? circuitColors.coral : circuitColors.ink} cx="350" cy="191" r="5" /><text className="circuit-value-label" fill={circuitColors.teal} x="315" y="176">N1={n1}</text>
      <GateGlyph gate="NAND" x={420} y={160} scale={1.2} /><GateGlyph gate="NAND" x={420} y={275} scale={1.2} />
      <path {...wire(n2)} d="M545 206 H650 V260 H738" /><path {...wire(n3)} d="M545 321 H650 V294 H738" />
      <text className="circuit-value-label" fill={circuitColors.teal} x="560" y="192">N2={n2}</text><text className="circuit-value-label" fill={circuitColors.teal} x="560" y="338">N3={n3}</text>
      <GateGlyph gate="NAND" x={650} y={40} scale={1.2} /><path {...wire(carry)} d="M775 86 H900" /><text className="circuit-output-label" fill={circuitColors.ink} x="902" y="92">C={carry}</text>
      <GateGlyph gate="NAND" x={700} y={230} scale={1.2} /><path {...wire(sum)} d="M825 276 H900" /><text className="circuit-output-label" fill={circuitColors.ink} x="902" y="282">S={sum}</text>
      <text className="circuit-caption" fill={circuitColors.ink} x="490" y="386">NANDへ置き換えても、教科書と同じくCは上、Sは下</text>
    </svg>;
  }

  return <svg className={`circuit-diagram adder-circuit full ${basis}`} viewBox="0 0 1100 465" role="img" aria-label={`${basis === 'basic' ? 'AND、OR、NOTだけ' : 'NANDだけ'}で作る全加算回路。半加算回路を2段につなぎ、上側のORからC、下側からSを出す。A=${a}、B=${b}、X=${x}、C=${carry}、S=${sum}`}>
    <text className="circuit-input-label" fill={circuitColors.ink} x="18" y="94">A={a}</text><text className="circuit-input-label" fill={circuitColors.ink} x="18" y="164">B={b}</text>
    <path {...wire(a)} d="M70 89 H100" /><path {...wire(b)} d="M70 159 H100" />
    <HalfAdderBlock x={100} y={40} number={1} basis={basis} top={a} bottom={b} sum={firstSum} carry={firstCarry} />
    <path {...wire(firstCarry)} d="M410 218 H455 V120 H873" /><text className="circuit-value-label" fill={circuitColors.teal} x="420" y="204">C₁={firstCarry}</text>
    <path {...wire(firstSum)} d="M410 251 H465 V250 H500" /><text className="circuit-value-label" fill={circuitColors.teal} x="420" y="276">S₁={firstSum}</text>
    <text className="circuit-input-label" fill={circuitColors.ink} x="414" y="338">X={x}</text><path {...wire(x)} d="M466 333 H500" />
    <HalfAdderBlock x={500} y={180} number={2} basis={basis} top={firstSum} bottom={x} sum={sum} carry={secondCarry} />
    <path {...wire(secondCarry)} d="M810 358 H835 V156 H873" /><text className="circuit-value-label" fill={circuitColors.teal} x="816" y="344">C₂={secondCarry}</text>
    <path {...wire(sum)} d="M810 391 H1018" /><text className="circuit-output-label" fill={circuitColors.ink} x="1020" y="397">S={sum}</text>
    {basis === 'basic' ? <>
      <GateGlyph gate="OR" x={830} y={86} scale={1.35} /><path {...wire(carry)} d="M966 137 H1018" />
    </> : <>
      <rect fill="white" stroke={circuitColors.teal} strokeWidth="3" x="850" y="76" width="178" height="138" rx="18" />
      <text className="adder-block-title" fill={circuitColors.ink} textAnchor="middle" x="939" y="101">OR相当</text>
      {[862, 912, 962].map(gateX => <GateGlyph key={gateX} gate="NAND" x={gateX} y={112} scale={0.45} />)}
      <text className="adder-block-formula" fill={circuitColors.teal} textAnchor="middle" x="939" y="190">NAND × 3</text>
      <path {...wire(carry)} d="M1028 145 H1040" />
    </>}
    <text className="circuit-output-label" fill={circuitColors.ink} x={basis === 'basic' ? 1020 : 1042} y={basis === 'basic' ? 143 : 151}>C={carry}</text>
    <text className="circuit-caption" fill={circuitColors.ink} x="550" y="449">{basis === 'basic' ? '上：2つの桁上がりをORへ集めてC　／　下：2段目の半加算回路からS' : '教科書と同じC・Sの配置を、NAND 13個へ置き換えた学習用構成'}</text>
  </svg>;
}

export function QuizCircuitClue({ kind }: { kind: 'unknown-output-gate' | 'nand-equivalent' }) {
  if (kind === 'unknown-output-gate') return <svg className="quiz-circuit-clue" viewBox="0 0 560 190" role="img" aria-label="入力Aが1、Bが0、出力Lが1。中央の回路記号は疑問符で隠されている">
    <text fill={circuitColors.ink} x="20" y="65">A=1</text><text fill={circuitColors.ink} x="20" y="132">B=0</text><line {...wireAttributes(1)} x1="78" y1="59" x2="190" y2="59" /><line {...wireAttributes()} x1="78" y1="126" x2="190" y2="126" />
    <rect className="masked-gate" fill="white" stroke={circuitColors.teal} strokeWidth="4" strokeDasharray="9 7" x="190" y="29" width="160" height="126" rx="24" /><text className="masked-question" fill={circuitColors.teal} textAnchor="middle" x="270" y="112">?</text>
    <line {...wireAttributes(1)} x1="350" y1="92" x2="490" y2="92" /><text className="circuit-output-label" fill={circuitColors.ink} x="492" y="99">L=1</text>
  </svg>;
  return <svg className="quiz-circuit-clue" viewBox="0 0 680 220" role="img" aria-label="同じ入力Aを二つ入れたNAND回路と、疑問符で隠された回路記号が等しい">
    <text fill={circuitColors.ink} x="18" y="103">A</text><path {...wireAttributes()} d="M50 98 H105 V79 H150 M105 98 V128 H150" /><circle {...wireAttributes()} fill={circuitColors.ink} cx="105" cy="98" r="5" />
    <GateGlyph gate="NAND" x={118} y={53} scale={1.35} /><line {...wireAttributes()} x1="264" y1="104" x2="305" y2="104" />
    <text className="equivalent-mark" fill={circuitColors.teal} textAnchor="middle" x="342" y="115">＝</text>
    <line {...wireAttributes()} x1="392" y1="104" x2="430" y2="104" /><rect className="masked-gate" fill="white" stroke={circuitColors.teal} strokeWidth="4" strokeDasharray="9 7" x="430" y="42" width="145" height="124" rx="24" /><text className="masked-question" fill={circuitColors.teal} textAnchor="middle" x="502" y="123">?</text><line {...wireAttributes()} x1="575" y1="104" x2="650" y2="104" />
  </svg>;
}
