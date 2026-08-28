'use client';

import { useId, useState } from 'react';
import { validateCompressionInput } from './compressionModels';

export function CompressionTextInput({ method, example, activeText, isBasic, onApply }: {
  method: 'lzw' | 'huffman'; example: string; activeText: string; isBasic: boolean; onApply: (text: string, basic: boolean) => void;
}) {
  const [draft, setDraft] = useState(activeText);
  const [error, setError] = useState('');
  const id = useId();
  const samples = method === 'lzw'
    ? [['ABCのくり返し', 'ABCABCABCABC'], ['Aが連続', 'AAAAAAAAAAAA']]
    : [['「も」が多い', 'すもももももももものうち'], ['4種類が同じ回数', 'あいうえあいうえ']];
  const apply = (text: string, basic = false) => {
    const normalized = text.normalize('NFC');
    const issue = validateCompressionInput(normalized, method);
    setError(issue);
    if (issue) return;
    setDraft(normalized);
    onApply(normalized, basic);
  };
  return <form className="compression-input" onSubmit={(event) => { event.preventDefault(); apply(draft); }}>
    <label className="text-input" htmlFor={id}><span>圧縮したい文字列（{method === 'lzw' ? 'LZW' : 'ハフマン'}）</span>
      <input id={id} value={draft} autoComplete="off" spellCheck={false} aria-invalid={Boolean(error)} aria-describedby={`${id}-help ${id}-error`} onChange={(event) => { setDraft(event.target.value); setError(''); }} onKeyDown={(event) => { if (event.key === 'Enter' && (event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault(); }} />
    </label>
    <p id={`${id}-help`}>{method === 'lzw' ? '半角の大文字 A・B・C、1〜32文字。ボタンで反映。入力は送信・保存しません。' : 'ひらがな（長音「ー」も可）、32文字以内・2〜7種類。回数に偏りのある文字列を試してみよう。 編集中は下の手順を変えず、ボタンを押すと最初から計算します。入力は送信・保存しません。'}</p>
    <div className="compression-input-tools">
      <div className="compression-input-actions"><button type="submit">この文字列で試す</button><button type="button" onClick={() => apply(example, true)}>基本例に戻す</button></div>
      <div className="compression-samples"><span>例を試す：</span>{samples.map(([label, text]) => <button type="button" key={label} onClick={() => apply(text)}>{label}</button>)}</div>
    </div>
    <p className="input-error" id={`${id}-error`} role="alert">{error}</p>
    <p className="active-input" role="status">{method === 'lzw' ? <>下に表示中：{isBasic ? '基本例' : '自分の入力'}</> : <>{isBasic ? '基本例' : '自分で試す'}：<b>{activeText}</b></>}（{Array.from(activeText).length}文字・{new Set(activeText).size}種類）{draft.normalize('NFC') !== activeText && <em>編集は未反映です。「この文字列で試す」で更新。</em>}</p>
  </form>;
}
