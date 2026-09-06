'use client';

import { useMemo, useState } from 'react';
import { ColorMaskLab } from './ColorMaskLab';
import { Note, PrintBadge, SectionHeading } from './LessonParts';
import { bitwiseOperation, type BitwiseOperation } from './logicModels';

const operationInfo: Record<BitwiseOperation, { defaultMask: string; title: string; action: string; badge: string }> = {
  AND: { defaultMask: '00001111', title: '必要なビットだけ取り出す', action: 'マスクが0の位置を0にし、1の位置は元のビットを残す。', badge: '教科書例3' },
  OR: { defaultMask: '00001111', title: '指定したビットを1にする', action: 'マスクが1の位置を、元の値に関係なく1にする。', badge: '42' },
  XOR: { defaultMask: '11110000', title: '指定したビットを反転する', action: 'マスクが1の位置だけ、0と1を入れ替える。', badge: '43' },
};

export function BitwiseLab() {
  const [operation, setOperation] = useState<BitwiseOperation>('AND');
  const [source, setSource] = useState('11001011');
  const [masks, setMasks] = useState<Record<BitwiseOperation, string>>({ AND: '00001111', OR: '00001111', XOR: '11110000' });
  const [executedResult, setExecutedResult] = useState<string | null>(null);
  const info = operationInfo[operation];
  const mask = masks[operation];
  const computed = useMemo(() => bitwiseOperation(source, mask, operation), [source, mask, operation]);
  const toggle = (value: string, index: number) => [...value].map((bit, position) => position === index ? bit === '0' ? '1' : '0' : bit).join('');
  const toggleSource = (index: number) => { setSource(value => toggle(value, index)); setExecutedResult(null); };
  const toggleMask = (index: number) => { setMasks(previous => ({ ...previous, [operation]: toggle(previous[operation], index) })); setExecutedResult(null); };
  const chooseOperation = (next: BitwiseOperation) => { setOperation(next); setExecutedResult(null); };
  const reset = () => { setSource('11001011'); setMasks(previous => ({ ...previous, [operation]: info.defaultMask })); setExecutedResult(null); };

  return <section className="logic-learning-section" id="bitwise">
    <SectionHeading number="04" label="論理演算 · 教科書 p.79" title="8個の回路で、ビット列を一気に操作。" question="元のビットとマスクを変え、実行ボタンで8桁をまとめて計算しよう。" />
    <div className="logic-panel bitwise-lab">
      <div className="logic-panel-heading"><div><p className="logic-step-label">BIT MASK LAB</p><h3>取り出す・1にする・反転する</h3></div><div className="badge-pair"><PrintBadge numbers="42" /><PrintBadge numbers="43" /></div></div>
      <div className="bitwise-tabs">{(['AND', 'OR', 'XOR'] as const).map(item => <button type="button" key={item} className={operation === item ? 'is-selected' : ''} aria-pressed={operation === item} onClick={() => chooseOperation(item)}><b>{item}</b><span>{operationInfo[item].title}</span></button>)}</div>
      <div className="bitwise-story"><span>{info.badge}</span><h4>{info.title}</h4><p>{info.action}</p></div>
      <div className="bit-matrix" role="group" aria-label="8ビットの論理演算">
        <div className="bit-row"><strong>元のビット</strong>{[...source].map((bit, index) => { const relation = executedResult ? bit === executedResult[index] ? 'is-same' : 'is-changed' : ''; return <button type="button" className={relation} key={index} aria-label={`左から${index + 1}番目の元ビット${bit}。押すと切り替え`} onClick={() => toggleSource(index)}>{bit}</button>; })}</div>
        <div className="bit-row mask"><strong>{operation}マスク</strong>{[...mask].map((bit, index) => { const relation = bit === '1' ? 'mask-one' : 'mask-zero'; return <button type="button" className={relation} key={index} aria-label={`左から${index + 1}番目のマスク${bit}。押すと切り替え`} onClick={() => toggleMask(index)}>{bit}</button>; })}</div>
        <div className="bit-operator"><b>{operation}</b><i aria-hidden="true" /></div>
        <div className="bit-row result"><strong>実行結果</strong>{(executedResult ? [...executedResult] : Array(8).fill('?')).map((bit, index) => <span key={index} className={executedResult ? source[index] === bit ? 'is-same' : 'is-changed' : ''}>{bit}</span>)}</div>
      </div>
      <p className="mask-key">マスク：紫の1／淡い紫の0。XORは1の位置を反転、ORは1の位置を1に、ANDは0の位置を0にします。</p>
      {executedResult && <div className="bit-relation-legend" role="status"><span><i className="is-same" />緑：元と同じ数字のまま</span><span><i className="is-changed" />オレンジ：演算で数字が変わった</span><b>緑とオレンジは「元のビット」と「実行結果」の比較です。</b></div>}
      <div className="bit-execute-bar"><button type="button" onClick={() => setExecutedResult(computed.result)}>8ビットをまとめて実行</button><p role="status">{executedResult ? <><b>実行結果：{executedResult}</b><span>{source} {operation} {mask}</span></> : <>元のビットとマスクを押して変えたら、実行してください。</>}</p><button type="button" className="secondary" onClick={reset}>この例を元に戻す</button></div>
      <ColorMaskLab />
      <Note title="NOTとXORの「反転」は、何が違う？"><p><strong>NOT</strong>は入力したすべてのビットを反転します。<strong>XOR</strong>はマスクが1の場所だけを反転できるので、変えたい位置を選べます。</p></Note>
    </div>
  </section>;
}
