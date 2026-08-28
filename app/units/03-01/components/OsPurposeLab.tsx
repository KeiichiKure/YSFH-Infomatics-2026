'use client';

import { useState } from 'react';
import { buildResourceSchedule, fileTypes, inspectRename } from './systemModels';
import { Note, PrintTerms, SectionHeading, StepControls } from './LessonParts';

function FileLab() {
  const [original, setOriginal] = useState('.jpg');
  const [named, setNamed] = useState('.jpg');
  const [opened, setOpened] = useState(false);
  const { actual, associated, mismatch } = inspectRename(original, named);
  return <div className="hw-panel">
    <div className="hw-panel-heading"><div><p className="step-label">01 · 操作支援</p><h3>ファイルを開く、その裏側</h3></div><span className="print-badge"><small>プリント</small><b>18–21</b></span></div>
    <p>OSは、ファイルとアプリの<strong>関連付け</strong>などで操作を助けます。種類を選んで「開く」を試そう。</p>
    <div className="hw-file-grid" aria-label="ファイルの種類を選ぶ">{fileTypes.map(file => <button type="button" key={file.extension} className={original === file.extension ? 'is-selected' : ''} aria-pressed={original === file.extension} onClick={() => { setOriginal(file.extension); setNamed(file.extension); setOpened(false); }}><b>{file.extension}</b><small>{file.name}</small></button>)}</div>
    <div className="hw-file-window">
      <div className="hw-window-title"><span aria-hidden="true">● ● ●</span><b>教材用ファイルビューア</b><small>実ファイルは変更しません</small></div>
      <div className="hw-file-workbench">
        <div className="hw-file-icon" aria-hidden="true"><span>{actual.kind === 'image' ? 'IMAGE' : actual.kind === 'audio' ? 'AUDIO' : 'FILE'}</span><b>{named}</b></div>
        <div><label className="hw-select-label" htmlFor="hw-extension">ファイル名の末尾だけ変えてみる</label><div className="hw-file-name"><span>{actual.sample}</span><select id="hw-extension" value={named} onChange={event => { setNamed(event.target.value); setOpened(false); }}>{fileTypes.map(file => <option key={file.extension} value={file.extension}>{file.extension}</option>)}</select></div><p className="hw-caption">保存されている中身：<strong>{actual.format}</strong></p><button className="hw-primary" type="button" onClick={() => setOpened(true)}>このファイルを開く →</button></div>
      </div>
      <div className={'hw-file-result ' + (opened && mismatch ? 'hw-warning' : '')} role="status">{opened ? <><span className="hw-status-label">拡張子から呼び出すアプリの例</span><h4>{associated.app}</h4><p>{mismatch ? `名前は${named}ですが、中身は${actual.format}のまま。このモデルでは形式が一致せず、正しく開けません。名前の変更だけでは変換されません。` : `${actual.sample}${named}を開けました。OSが対応アプリへ橋渡しするので、自分でアプリを探す手間を減らせます。`}</p></> : <><h4>名前と中身、同じかな？</h4><p>拡張子を選んだだけでは、中身は変わりません。「開く」で確認しよう。</p></>}</div>
    </div>
    <Note title="拡張子・アプリ・クラウド上の文書の注意点"><p>ファイル名の末尾の<strong>拡張子</strong>は種類を判断する手がかりです。開くアプリはOSの設定で変えられ、実際のアプリには中身を判定できるものもあります。この実験は拡張子による関連付けを単純化しています。</p><p>JPEGからPDFなど、形式を変えるには、対応するアプリで<strong>変換・書き出し</strong>を行います。</p><p>Googleドキュメントなどのクラウド上の文書と、ダウンロードしたファイルは区別しましょう。ダウンロード時にはWord（.docx）やPDF（.pdf）などの形式を選べます。</p><p className="hw-caption">参考：<a href="https://support.google.com/docs/answer/49114?hl=ja" target="_blank" rel="noreferrer">Google公式ヘルプ（別タブ）</a></p></Note>
    <PrintTerms numbers={[18, 19, 20, 21]} />
  </div>;
}

function CommonApiLab() {
  const [device, setDevice] = useState('マウス');
  const [cell, setCell] = useState(4);
  const [fetched, setFetched] = useState(false);
  const x = (cell % 3 + 1) * 25;
  const y = (Math.floor(cell / 3) + 1) * 25;
  return <div className="hw-panel">
    <div className="hw-panel-heading"><div><p className="step-label">02 · 基本機能の提供</p><h3>道具が変わっても、同じ「位置」</h3></div></div>
    <p>OSは装置の違いを<strong>共通の操作や情報へ抽象化</strong>します。ここでは装置を選び、9つの点のどれかを指してみよう。</p>
    <div className="hw-pills" aria-label="模擬入力装置">{['マウス', 'タッチパネル', 'ペン'].map(name => <button type="button" key={name} className={device === name ? 'is-selected' : ''} aria-pressed={device === name} onClick={() => setDevice(name)}>{name}</button>)}</div>
    <div className="hw-pointer-demo"><div className="hw-pointer-grid" aria-label={`${device}で位置を指定する模擬操作`}>{Array.from({ length: 9 }, (_, index) => <button type="button" key={index} aria-label={`横${(index % 3 + 1) * 25}、縦${(Math.floor(index / 3) + 1) * 25}を指す`} aria-pressed={cell === index} className={cell === index ? 'is-selected' : ''} onClick={() => setCell(index)}>{cell === index ? '●' : '＋'}</button>)}</div><div className="hw-api-output" role="status"><small>{device}による入力（模擬）</small><span aria-hidden="true">↓</span><b>OSのAPI · 共通の窓口</b><code>位置 = ({x}, {y})</code><p>アプリは、同じ形式の位置情報として使える。</p></div></div>
    <p className="hw-caption">実際の装置を検出する機能ではありません。現実には装置の種類や筆圧など、必要に応じて違いも利用できます。</p>
    <Note title="人への窓口と、ソフトウェアへの窓口"><p>人とコンピュータが情報をやり取りする仕組みが<strong>ユーザインタフェース</strong>です。ボタンやメニューなどは人が使います。一方、<strong>API</strong>はソフトウェアが機能を使うための窓口です。</p><p><strong>Web API</strong>は、Webサービスの機能やデータを外部のソフトウェアから利用できるようにするもの。OSのAPIだけがAPIではありません。</p><button type="button" className="hw-button" onClick={() => setFetched(true)}>模擬Web APIで天気を取得</button><p role="status">{fetched ? '練習用の応答：晴れ・24℃。実際の天気ではありません。' : '別のアプリが提供するデータを受け取るイメージを試せます。'}</p><p className="hw-caption">このボタンは外部へ通信しません。決められた練習用データを表示するだけです。</p></Note>
  </div>;
}

function ResourceLab() {
  const [mode, setMode] = useState<'sequential' | 'shared'>('sequential');
  const [step, setStep] = useState(0);
  const ticks = buildResourceSchedule(mode);
  const current = ticks[step];
  const used = ticks.filter(tick => tick.cpu !== null).length;
  const names = { cpu: 'CPUを使用', io: '入出力装置を使用', wait: '待機', done: '完了' };
  return <div className="hw-panel">
    <div className="hw-panel-heading"><div><p className="step-label">03 · 資源の有効利用</p><h3>待っている間、別の仕事を。</h3></div></div>
    <p>CPUと入出力装置がそれぞれ1つあるモデルです。Aは<strong>CPU 3 → 入出力 3 → CPU 1</strong>、Bは<strong>CPU 2 → 入出力 2 → CPU 1</strong>の順に使います。</p>
    <div className="hw-pills" aria-label="資源の割り当て方法">{([['sequential', 'Aの終了後にBを開始'], ['shared', '待ち時間にBも進める']] as const).map(([value, label]) => <button type="button" key={value} className={mode === value ? 'is-selected' : ''} aria-pressed={mode === value} onClick={() => { setMode(value); setStep(0); }}>{label}</button>)}</div>
    <div className="hw-resource-summary"><div><small>全体の所要時間</small><b>{ticks.length}<span>目盛り</span></b></div><div><small>CPUが働いた時間</small><b>{used}<span>目盛り</span></b></div><div><small>CPU使用率</small><b>{Math.round(used / ticks.length * 100)}<span>%</span></b></div></div>
    <p className="hw-caption">両モードとも横軸は0〜12の共通尺度。数字は説明用の時間単位です。小さな画面では表を横にスクロールできます。</p>
    <div className="hw-timeline-scroll" tabIndex={0} role="region" aria-label="CPUと入出力装置の使用時間表"><table className="hw-timeline"><caption>同じ装置を同じ時刻に使うアプリは1つ</caption><thead><tr><th scope="col">時間</th>{Array.from({ length: 12 }, (_, index) => <th scope="col" key={index}>{index}–{index + 1}</th>)}</tr></thead><tbody>{(['cpu', 'io'] as const).map(resource => <tr key={resource}><th scope="row">{resource === 'cpu' ? 'CPU' : '入出力'}</th>{Array.from({ length: 12 }, (_, index) => <td key={index} className={(ticks[index]?.[resource] ? 'job-' + ticks[index][resource] : 'job-idle') + (index === step ? ' is-current' : '')}>{index >= ticks.length ? '済' : ticks[index][resource] ?? '休'}</td>)}</tr>)}</tbody></table></div>
    <div className="hw-feedback" role="status"><h4>時間 {step}〜{step + 1}：{current.cpu ? `CPUはアプリ${current.cpu}を処理` : 'CPUは待機中'}</h4><p>A：{names[current.a]} ／ B：{names[current.b]}</p><p>{current.cpu && current.io ? 'CPUと入出力装置が、別々のアプリの仕事を進めています。' : '必要な装置が空くまで待つ場合があります。'}</p></div>
    <StepControls step={step} count={ticks.length} onChange={setStep} label="資源の割り当てを1目盛りずつ確認" />
    <Note title="同時に動かせば、必ず速くなる？"><p>このモデルでは、入出力待ちを利用して別のアプリの処理を進めるため、全体の時間が短くなります。各アプリが必要とするCPU処理量は変わりません。</p><p>実際のOSは短い時間での切り替えなども行います。切り替えの負担、メモリ不足、同じ装置の取り合いもあるため、<strong>同時実行なら必ず速いわけではありません</strong>。複数コアでの並列処理とは区別して考えます。</p></Note>
    <aside className="hw-writeback"><b>プリント「OSの目的」へ</b><p>操作支援／基本機能の提供／資源の有効利用について、今の体験から具体例を1つずつ説明しよう。</p></aside>
  </div>;
}

export function OsPurposeLab() {
  return <section className="learning-section" id="os-purpose"><SectionHeading number="03" label="OSの目的とファイル · 教科書 pp.70–71" title="使いやすさを、OSが支える。" question="ファイルを開く、違う装置を使う、仕事を同時に進める。OSは何を助けている？" /><FileLab /><CommonApiLab /><ResourceLab /></section>;
}
