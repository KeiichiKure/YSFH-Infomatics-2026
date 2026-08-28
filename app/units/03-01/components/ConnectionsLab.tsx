'use client';

import { useState } from 'react';
import { connections, connectionQuestions } from './lessonData';
import { Note, PrintTerms } from './LessonParts';

export function ConnectionsLab() {
  const [selected, setSelected] = useState<string>('type-a');
  const [question, setQuestion] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const connection = connections.find(item => item.id === selected)!;
  const problem = connectionQuestions[question];
  const correct = answer === problem.answer;

  return <div className="hw-panel">
    <div className="hw-panel-heading"><div><p className="step-label">CONNECT & COMPARE</p><h3>つなぎ方を選んでみよう</h3></div><span className="print-badge"><small>プリント</small><b>4–10</b></span></div>
    <p><strong>インタフェース</strong>は、情報をやり取りするための規格や機能。機器同士をつなぐものが<strong>ハードウェアインタフェース</strong>です。</p>
    <div className="hw-connection-grid" aria-label="接続方式を調べる">{connections.map(item => <button type="button" key={item.id} aria-pressed={selected === item.id} className={selected === item.id ? 'is-selected' : ''} onClick={() => { setSelected(item.id); setAnswer(null); }}>
      <span className={'hw-port ' + item.id} aria-hidden="true"><i />{item.id === 'vga' && <span>{Array.from({ length: 15 }, (_, index) => <i key={index} />)}</span>}{item.group === '無線' && <b>{item.id === 'bluetooth' ? '近く' : item.id === 'nfc' ? 'タッチ' : 'LAN'}</b>}</span>
      <small>{item.group}{item.number ? ` · プリント${item.number}` : ' · 補足'}</small><strong>{item.name}</strong>
    </button>)}</div>
    <div className="hw-connection-info" role="status"><div><span className="hw-status-label">{connection.shape}</span><h4>{connection.name}</h4></div><p>{connection.detail}</p></div>
    <div className="hw-scenario">
      <p className="step-label">接続チャレンジ {question + 1} / {connectionQuestions.length}</p>
      <h4>{problem.text}</h4>
      <p className="hw-caption">上のカードで接続方式を選んでから、答えを確かめよう。</p>
      <button type="button" className="hw-primary" onClick={() => setAnswer(selected)}>「{connection.name}」でつなぐ</button>
      <div className="hw-answer" role="status">{answer ? <><b>{correct ? '✓ この条件で接続できます。' : 'もう一度、機器の条件と用途を確認しよう。'}</b><p>{correct ? problem.reason : '端子が合うか、映像・音声・通信のどれを送りたいかが手がかりです。'}</p></> : <p>まだ答えを確かめていません。</p>}</div>
      <div className="hw-controls"><button type="button" onClick={() => { setQuestion((question + connectionQuestions.length - 1) % connectionQuestions.length); setAnswer(null); }}>← 前の場面</button><button type="button" onClick={() => { setQuestion((question + 1) % connectionQuestions.length); setAnswer(null); }}>次の場面 →</button></div>
    </div>
    <Note title="形が同じなら、何でもつながる？"><p>Type-A／Type-Cは<strong>端子の形状</strong>の名前です。Type-Cだから必ず映像を出せる、同じ速度で通信できる、とは限りません。機器・ケーブルの対応を確認します。</p><p>Bluetoothの通信距離は、機器の設計、出力、障害物などで変わります。「100m程度」をすべての機器で使える距離として覚えないようにしましょう。NFCは近づけて使う技術です。</p><p className="hw-caption">端子の図は特徴を示す模式図です。仕様補足：<a href="https://www.displayport.org/faq/" target="_blank" rel="noreferrer">DisplayPort公式FAQ（別タブ）</a> · <a href="https://www.bluetooth.com/learn-about-bluetooth/key-attributes/range/" target="_blank" rel="noreferrer">Bluetooth公式解説（別タブ）</a></p></Note>
    <PrintTerms numbers={[4, 5, 6, 7, 8, 9, 10]} />
  </div>;
}
