'use client';

import { useState } from 'react';
import { connections, connectionQuestions } from './lessonData';
import { Note, PrintTerms } from './LessonParts';

function ConnectionIllustration({ id }: { id: string }) {
  if (id === 'bluetooth') return <span className="connection-picture wireless bluetooth-picture" aria-hidden="true"><i className="device-phone" /><i className="radio-wave">)))</i><i className="device-earbuds" /></span>;
  if (id === 'nfc') return <span className="connection-picture wireless nfc-picture" aria-hidden="true"><i className="device-phone" /><i className="tap-mark">)))</i><i className="device-reader" /></span>;
  if (id === 'wifi') return <span className="connection-picture wireless wifi-picture" aria-hidden="true"><i className="device-laptop" /><i className="radio-wave">)))</i><i className="device-router" /><i className="network-cable" /><i className="network-cloud">NET</i></span>;
  return <span className={`connection-picture wired ${id}`} aria-hidden="true"><i className="device-laptop" /><i className="wire-line" /><i className={`plug plug-${id}`} /><i className="device-screen" /></span>;
}

function ConnectorShape({ id }: { id: string }) {
  if (id === 'bluetooth' || id === 'nfc' || id === 'wifi') return <span className={`connector-symbol ${id}`} aria-hidden="true">{id === 'bluetooth' ? ')))' : id === 'nfc' ? 'TOUCH' : 'Wi-Fi'}</span>;
  return <span className={`connector-shape connector-${id}`} aria-hidden="true"><i />{id === 'vga' && <span>•••••<br />•••••<br />•••••</span>}</span>;
}

function MissionDevice({ name }: { name: string }) {
  const icon = /キーボード/.test(name) ? '⌨️' : /イヤホン/.test(name) ? '🎧' : /決済/.test(name) ? '💳' : /プロジェクタ/.test(name) ? '📽️' : /ディスプレイ/.test(name) ? '🖥️' : /アクセスポイント/.test(name) ? '📡' : /スマートフォン/.test(name) ? '📱' : '💻';
  return <span className="mission-device">{/USBメモリ/.test(name) ? <span className="usb-memory-icon" aria-hidden="true"><i /><strong>USB</strong><small>Type-C</small></span> : <i aria-hidden="true">{icon}</i>}<b>{name}</b></span>;
}

export function ConnectionsLab() {
  const [question, setQuestion] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [solved, setSolved] = useState<Set<number>>(() => new Set());
  const [attempts, setAttempts] = useState(0);
  const [correctAttempts, setCorrectAttempts] = useState(0);
  const problem = connectionQuestions[question];
  const selected = answer ? connections.find(item => item.id === answer) : null;
  const correct = answer === problem.answer;
  const choose = (id: string) => {
    setAnswer(id);
    setAttempts(value => value + 1);
    if (id === problem.answer) {
      setCorrectAttempts(value => value + 1);
      setSolved(previous => new Set(previous).add(question));
    }
  };
  const restart = () => { setQuestion(0); setAnswer(null); setSolved(new Set()); setAttempts(0); setCorrectAttempts(0); };
  return <div className="hw-panel hw-connection-quiz">
    <div className="hw-panel-heading"><div><p className="step-label">CONNECTION QUIZ</p><h3>何と何を、どうつなぐ？</h3></div><span className="print-badge"><small>プリント</small><b>4–10</b></span></div>
    <p>つなぎたい2つの機器と目的を見て、使える接続を選ぼう。選ぶと、その場で理由がわかります。</p>
    <div className="connection-question-card">
      <div className="connection-mission"><MissionDevice name={problem.left} /><div className="connection-missing"><span>何でつなぐ？</span><b>?</b></div><MissionDevice name={problem.right} /></div>
      <div className="connection-prompt"><span>Q{question + 1}</span><div><h4>{problem.text}</h4><p>{problem.focus.map(word => <strong key={word}>{word}</strong>)}</p></div></div>
      <div className="connection-options">{problem.choices.map(id => {
      const item = connections.find(connection => connection.id === id)!;
      const chosen = answer === id;
      return <button type="button" key={id} className={chosen ? (correct ? 'is-correct' : 'is-wrong') : ''} aria-pressed={chosen} onClick={() => choose(id)}><div className="connector-choice-visual"><ConnectorShape id={id} /><ConnectionIllustration id={id} /></div><strong>{item.name}</strong><span>{item.shape}</span><small>{item.group}{item.number ? ` · プリント${item.number}` : ''}</small></button>;
    })}</div>
    </div>
    <div className={`connection-explanation ${answer ? (correct ? 'is-correct' : 'is-wrong') : ''}`} role="status">{answer ? <><b>{correct ? 'そうだね！ つなげます。' : `残念！「${selected?.name}」は…`}</b><p>{correct ? problem.reason : selected?.detail}</p>{!correct && <small>機器の端子、送りたいもの、使う距離をもう一度見よう。</small>}</> : <><b>どれだと思う？</b><p>イラストも手がかりにして、1つ選んでみよう。</p></>}</div>
    <div className="connection-progress"><div><b>正解した問題</b><strong>{solved.size} / {connectionQuestions.length}</strong></div><progress max={connectionQuestions.length} value={solved.size} /><span>正解率 {attempts ? Math.round(correctAttempts / attempts * 100) : 0}%</span></div>
    {solved.size === connectionQuestions.length && <div className="connection-celebration" role="status"><span aria-hidden="true">🎉</span><div><b>8問すべて正解！ やったね！</b><p>端子の形、送る情報、距離を見分けて接続を選べました。</p></div></div>}
    <div className="hw-controls"><button type="button" disabled={question === 0} onClick={() => { setQuestion(question - 1); setAnswer(null); }}>← 前の問題</button><output>{question + 1} / {connectionQuestions.length}</output><button type="button" disabled={question === connectionQuestions.length - 1} onClick={() => { setQuestion(question + 1); setAnswer(null); }}>次の問題 →</button><button type="button" onClick={restart}>最初から</button></div>
    <Note title="有線・無線の図と端子を見比べる"><div className="connection-reference">{connections.map(item => <div key={item.id}><div className="reference-visual"><ConnectorShape id={item.id} /><ConnectionIllustration id={item.id} /></div><b>{item.name}</b><strong>{item.shape}</strong><p>{item.detail}</p></div>)}</div><p>Type-Cは端子の形の名前です。同じ形でも映像出力・速度・給電などの機能が同じとは限りません。Bluetoothの通信距離も機器や障害物などで変わります。</p></Note>
    <PrintTerms numbers={[4, 5, 6, 7, 8, 9, 10]} />
  </div>;
}
