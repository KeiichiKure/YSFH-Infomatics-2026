type CodeRow = readonly [string, number, string];

export function PrefixCodeTree({ rows, step }: { rows: readonly CodeRow[]; step: number }) {
  return <figure className="prefix-code-tree">
    <figcaption><b>枝の0・1をつなぐと、その文字の符号になる</b><span>オレンジ＝今回たどる道と確定する文字 ／ 緑＝割り当て済み</span></figcaption>
    <div className="tree-scroll" tabIndex={0} role="region" aria-label="符号木。横にスクロールできます">
      <svg viewBox={`0 0 660 ${Math.min(step + 2, 7) * 57 + 40}`} role="img" aria-label={`割り当て${step + 1}。${rows.slice(0, step + 1).map(([char, , code]) => `${char}は${code}`).join('、')}。葉で文字が確定し、分岐ではまだ確定しない。`}>
        {rows.slice(0, Math.min(step + 1, rows.length - 1)).map(([char, , code], index) => {
          const x = 35 + index * 48;
          const y = 42 + index * 57;
          const finalBranch = index === rows.length - 2;
          const lastAssigned = step === rows.length - 1;
          return <g key={char}>
            <g className={index === step ? 'tree-edge is-current' : 'tree-edge is-assigned'}>
              <path d={`M${x},${y} H${x + 114}`} />
              <text x={x + 56} y={y - 9}>0</text>
              <rect x={x + 114} y={y - 18} width="174" height="36" rx="8" />
              <text className="tree-leaf-label" x={x + 124} y={y + 6}>{char} = {code}</text>
            </g>
            <g className={`tree-edge ${index < step ? 'is-current' : 'is-pending'}`}>
              <path d={`M${x},${y} L${x + 48},${y + 57}`} />
              <text x={x + 12} y={y + 36}>1</text>
            </g>
            <circle className="tree-node" cx={x} cy={y} r="6" />
            {index === 0 && <text className="tree-root-label" x={x - 18} y="17">開始</text>}
            {index === Math.min(step, rows.length - 2) && <g className={`tree-edge ${finalBranch && lastAssigned ? 'is-current' : 'is-pending'}`}>
              {finalBranch && lastAssigned ? <>
                <rect x={x + 48} y={y + 39} width="174" height="36" rx="8" />
                <text className="tree-leaf-label" x={x + 58} y={y + 63}>{rows.at(-1)?.[0]} = {rows.at(-1)?.[2]}</text>
              </> : <>
                <circle className="tree-node" cx={x + 48} cy={y + 57} r="6" />
                <text className="tree-pending-label" x={x + 64} y={y + 63}>{'1'.repeat(index + 1)}… 残りの文字へ</text>
              </>}
            </g>}
          </g>;
        })}
      </svg>
    </div>
    <p>文字のある終点（葉）に着いたら確定。途中の分岐では、次のビットへ進みます。確定した文字の先に、別の文字の枝は伸ばしません。</p>
  </figure>;
}
