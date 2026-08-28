type CodeRow = readonly [string, number, string];

export function PrefixCodeTree({ rows, step }: { rows: readonly CodeRow[]; step: number }) {
  return <figure className="prefix-code-tree">
    <figcaption><b>符号木：枝の0・1をつなぐ</b><span>オレンジ＝今回 ／ 緑＝割り当て済み</span></figcaption>
    <div className="tree-scroll" role="region" aria-label="符号木">
      <svg viewBox="0 0 330 305" role="img" aria-label={`割り当て${step + 1}。${rows.slice(0, step + 1).map(([char, , code]) => `${char}は${code}`).join('、')}。葉で文字が確定し、分岐ではまだ確定しない。`}>
        {rows.slice(0, Math.min(step + 1, rows.length - 1)).map(([char, , code], index) => {
          const x = 22 + index * 17;
          const y = 32 + index * 39;
          const finalBranch = index === rows.length - 2;
          const lastAssigned = step === rows.length - 1;
          return <g key={char}>
            <g className={index === step ? 'tree-edge is-current' : 'tree-edge is-assigned'}>
              <path d={`M${x},${y} H${x + 51}`} />
              <text x={x + 27} y={y - 6}>0</text>
              <rect x={x + 51} y={y - 14} width="157" height="29" rx="7" />
              <text className="tree-leaf-label" x={x + 59} y={y + 6}>{char} = {code}</text>
            </g>
            <g className={`tree-edge ${index < step ? 'is-current' : 'is-pending'}`}>
              <path d={`M${x},${y} L${x + 17},${y + 39}`} />
              <text x={x - 8} y={y + 27}>1</text>
            </g>
            <circle className="tree-node" cx={x} cy={y} r="6" />
            {index === 0 && <text className="tree-root-label" x={x - 15} y="14">開始</text>}
            {index === Math.min(step, rows.length - 2) && <g className={`tree-edge ${finalBranch && lastAssigned ? 'is-current' : 'is-pending'}`}>
              {finalBranch && lastAssigned ? <>
                <rect x={x + 17} y={y + 25} width="157" height="29" rx="7" />
                <text className="tree-leaf-label" x={x + 25} y={y + 45}>{rows.at(-1)?.[0]} = {rows.at(-1)?.[2]}</text>
              </> : <>
                <circle className="tree-node" cx={x + 17} cy={y + 39} r="6" />
                <text className="tree-pending-label" x={x + 29} y={y + 45}>{'1'.repeat(index + 1)}… 残りの文字へ</text>
              </>}
            </g>}
          </g>;
        })}
      </svg>
    </div>
    <p>葉で文字が確定。分岐なら次のビットへ。</p>
  </figure>;
}
