import type { Bit, GateType } from './logicModels';

export function GateDiagram({ gate, a, b, output, compact = false }: { gate: GateType; a: Bit; b: Bit; output: Bit; compact?: boolean }) {
  const isNot = gate === 'NOT';
  const isInverted = gate === 'NOT' || gate === 'NAND' || gate === 'NOR';
  const base = gate === 'NAND' ? 'AND' : gate === 'NOR' ? 'OR' : gate;
  return <svg className={`gate-diagram ${compact ? 'is-compact' : ''}`} viewBox="0 0 260 150" role="img" aria-label={`${gate}回路。入力Aは${a}${isNot ? '' : `、入力Bは${b}`}、出力Lは${output}`}>
    <line className={a ? 'signal-on' : ''} x1="12" y1={isNot ? 75 : 52} x2="72" y2={isNot ? 75 : 52} />
    {!isNot && <line className={b ? 'signal-on' : ''} x1="12" y1="98" x2="72" y2="98" />}
    <text x="17" y={isNot ? 65 : 42}>A={a}</text>
    {!isNot && <text x="17" y="118">B={b}</text>}
    {base === 'AND' && <path className="gate-body" d="M72 28 H126 A47 47 0 0 1 126 122 H72 Z" />}
    {(base === 'OR' || base === 'XOR') && <>
      {base === 'XOR' && <path className="gate-body xor-mark" d="M63 28 Q91 75 63 122" />}
      <path className="gate-body" d="M72 28 Q107 75 72 122 Q132 122 174 75 Q132 28 72 28 Z" />
    </>}
    {base === 'NOT' && <path className="gate-body" d="M76 30 L172 75 L76 120 Z" />}
    {isInverted && <circle className="gate-body" cx="183" cy="75" r="10" />}
    <line className={output ? 'signal-on' : ''} x1={isInverted ? 193 : 174} y1="75" x2="244" y2="75" />
    <text x="210" y="62">L={output}</text>
    <text className="gate-name" x="124" y="140">{gate}</text>
  </svg>;
}
