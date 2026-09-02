'use client';

import { useState } from 'react';
import { managementFunctions } from './systemModels';
import { Note, PrintTerms, SectionHeading } from './LessonParts';
import { SystemMascot, type SystemMascotName } from './SystemMascot';

type PrinterCase = 'ready' | 'download' | 'missing';
type StoryActor = SystemMascotName | 'user' | 'api';
const printerCases = {
  ready: { name: 'いつもの学校プリンタ', note: 'ドライバくんは最初からいる' },
  download: { name: '新しく接続したプリンタ', note: 'OSくんがドライバを呼んでくる' },
  missing: { name: 'とても古い特殊プリンタ', note: 'OSくんが探しても見つからない' },
} as const;

function ApiMail({ active = false, phase = 'static' }: { active?: boolean; phase?: 'static' | 'created' | 'delivering' }) {
  return <div className={`api-mail ${active ? 'is-active' : ''} is-${phase}`} aria-label="APIという決められた形式で依頼を運ぶ仕組み"><span className="api-envelope">印刷して！</span><span className="api-truck" aria-hidden="true">▰</span><b>API</b><small>決められた書き方のお手紙</small></div>;
}

function printStory(kind: PrinterCase, installed: boolean, searched: boolean): { actor: StoryActor; title: string; line: string }[] {
  const common = [
    { actor: 'user' as StoryActor, title: 'ユーザーが印刷を指示', line: 'ユーザー「この文書を印刷したい。印刷ボタンを押そう！」' },
    { actor: 'app' as StoryActor, title: 'アプリがお手紙を作る', line: 'アプリちゃん「了解！ OSくんに伝わる決まった書き方で、印刷依頼のお手紙を作るね。」' },
    { actor: 'api' as StoryActor, title: 'APIでOSへ届ける', line: 'APIのお手紙「宛先と頼み方は決まりどおり。『この文書を印刷して！』をOSくんへ届けます。」' },
    { actor: 'os' as StoryActor, title: 'OSが依頼を受け取る', line: kind === 'ready' ? 'OSくん「印刷の依頼だね。いつものプリンタ用ドライバくんがいることを確認できたよ。」' : 'OSくん「印刷の依頼だね。あれ？ このプリンタの言葉へ翻訳できるドライバくんがいない。プラグ＆プレイで探してみよう！」' },
  ];
  if (kind === 'ready') return [...common,
    { actor: 'driver', title: 'いつものドライバが翻訳', line: 'ドライバくん「いつもの学校プリンタなら任せて。機器にわかる命令へ翻訳したよ！」' },
    { actor: 'printer', title: 'プリンタが出力', line: 'プリンタくん「命令が読めたよ。文書を紙に印刷しました！」' },
  ];
  if (kind === 'download') return [...common,
    { actor: 'os', title: 'プラグ＆プレイで探す', line: installed ? 'OSくん「対応ドライバくんを見つけて、自動でインストールしたよ。これで橋渡しできる！」' : 'OSくん「新しい機器だ。プラグ＆プレイで対応ドライバを探して呼んでこよう。」' },
    { actor: 'driver', title: '呼ばれたドライバが翻訳', line: 'ドライバくん「新しいプリンタ用の命令へ翻訳して渡すね！」' },
    { actor: 'printer', title: 'プリンタが出力', line: 'プリンタくん「新しいドライバくんのおかげで読めたよ。印刷完了！」' },
  ];
  return [...common,
    { actor: 'os', title: 'プラグ＆プレイで探す', line: searched ? 'OSくん「機器の情報を手がかりに探したけれど、対応ドライバを見つけられなかった……。」' : 'OSくん「古い特殊プリンタだね。プラグ＆プレイで対応ドライバを探してみよう。」' },
    { actor: 'os', title: 'ユーザーへエラーを返す', line: 'OSくん「ごめん、印刷命令を届けられなかった。対応ドライバを手動でインストールしてください。」' },
  ];
}

function SpeakerVisual({ actor }: { actor: StoryActor }) {
  if (actor === 'user') return <div className="story-user-portrait"><span aria-hidden="true">👤</span><b>ユーザー</b></div>;
  if (actor === 'api') return <ApiMail active />;
  return <SystemMascot name={actor} label={actor === 'app' ? 'アプリちゃん' : actor === 'os' ? 'OSくん' : actor === 'driver' ? 'ドライバくん' : 'プリンタくん'} portrait />;
}

function PrintStoryLab() {
  const [printer, setPrinter] = useState<PrinterCase>('ready');
  const [step, setStep] = useState(0);
  const [installed, setInstalled] = useState(false);
  const [searched, setSearched] = useState(false);
  const story = printStory(printer, installed, searched);
  const current = story[step];
  const needsSearch = printer !== 'ready' && step === 4 && !searched;
  const driverVisible = printer === 'ready' || installed;
  const reset = (value: PrinterCase) => { setPrinter(value); setStep(0); setInstalled(false); setSearched(false); };
  const actorItems: { name: SystemMascotName; label: string }[] = [
    { name: 'app', label: 'アプリちゃん' }, { name: 'os', label: 'OSくん' }, { name: 'driver', label: 'ドライバくん' }, { name: 'printer', label: 'プリンタくん' },
  ];
  return <div className="hw-panel hw-print-story-panel">
    <div className="hw-panel-heading"><div><p className="step-label">USER → APP → API → OS → DRIVER → PRINTER</p><h3>「これ印刷して！」を届けよう</h3></div><span className="print-badge"><small>プリント</small><b>11・12</b></span></div>
    <p>プリンタを選び、誰が何を伝えるか会話とイラストで追おう。ドライバくんの出現に注目してください。</p>
    <div className="printer-case-tabs" aria-label="プリンタとドライバの状態">{Object.entries(printerCases).map(([value, item]) => <button type="button" key={value} aria-pressed={printer === value} className={printer === value ? 'is-selected' : ''} onClick={() => reset(value as PrinterCase)}><b>{item.name}</b><small>{item.note}</small></button>)}</div>
    <div className="software-cast">
      <div className={`software-user ${current.actor === 'user' ? 'is-active' : ''}`}><span aria-hidden="true">👤</span><b>ユーザー</b></div>
      {actorItems.map((actor, index) => <div key={actor.name} className={`software-actor-wrap ${actor.name === 'driver' && !driverVisible ? 'is-missing' : ''}`}>
        {index === 1 && (step === 1 || step === 2) && <ApiMail phase={step === 1 ? 'created' : 'delivering'} />}
        {actor.name === 'driver' && !driverVisible ? <div className="driver-empty"><span>?</span><b>{printer === 'download' ? 'まだ呼ばれていない' : searched ? '見つからなかった' : 'まだ探していない'}</b></div> : <SystemMascot name={actor.name} label={actor.label} active={current.actor === actor.name} portrait />}
        {actor.name === 'printer' && current.actor === 'printer' && <div className="printed-page-output" role="status"><span>印刷完了</span><b>✓</b></div>}
      </div>)}
    </div>
    <div className="software-speech"><SpeakerVisual actor={current.actor} /><div className="speech-balloon" role="status"><span>{step + 1} / {story.length}</span><h4>{current.title}</h4><p>{current.line}</p>{current.actor === 'api' && <small><strong>API</strong>は、アプリがOSなどの機能へ依頼するときの、決められた呼び出し方・窓口です。</small>}</div></div>
    <div className="plug-play-slot">
      {needsSearch ? <div className="plug-play-action"><b>プラグ＆プレイ</b><p>OSが接続機器を認識しました。ボタンを押して、対応ドライバを自動で探してみよう。</p><button type="button" className="hw-primary" onClick={() => { setSearched(true); if (printer === 'download') setInstalled(true); }}>{printer === 'download' ? 'ドライバを探してインストール' : '対応ドライバを探す'}</button></div> :
      printer === 'missing' && step === story.length - 1 ? <div className="print-error" role="alert"><b>× 印刷できませんでした</b><p>このプリンタに対応するドライバがありません。メーカーの案内を確認し、対応ドライバを手動でインストールしてください。</p></div> :
      <div className="driver-status"><span>{driverVisible ? '✓' : searched ? '×' : '…'}</span><b>{driverVisible ? '対応ドライバ：利用できます' : searched ? '対応ドライバ：見つかりませんでした' : '対応ドライバ：検索前です'}</b></div>}
    </div>
    <div className="fixed-step-controls"><div className="hw-controls"><button type="button" disabled={step === 0} onClick={() => setStep(step - 1)}>← 前へ</button><output>{step + 1} / {story.length}</output><button type="button" disabled={step === story.length - 1 || needsSearch} onClick={() => setStep(step + 1)}>次へ →</button><button type="button" onClick={() => reset(printer)}>最初から</button></div></div>
    <div className="software-role-summary illustrated"><div><ApiMail /><b>API</b><span>決められた形式で、アプリの依頼をOSへ運ぶ手段</span></div><div><SystemMascot name="os" label="OS" portrait showLabel={false} /><b>OS</b><span>依頼と機器を確認し、担当のドライバを探す</span></div><div><SystemMascot name="driver" label="ドライバ" portrait showLabel={false} /><b>ドライバ</b><span>OSの指示を、特定の機器が読める命令へ翻訳する</span></div></div>
    <PrintTerms numbers={[11, 12]} />
  </div>;
}

const recallActors: { name: SystemMascotName; label: string; command: string }[] = [
  { name: 'control', label: '制御装置くん', command: 'OSから実行順 → CPUへ指示' },
  { name: 'memory', label: '主記憶ちゃん', command: 'OSから領域指定 → 読み書き' },
  { name: 'input', label: '入力装置さん', command: '入力データ → OSへ渡す' },
  { name: 'storage', label: '補助記憶お母さん', command: 'OSから保存指示 → 完了を返す' },
  { name: 'control', label: '制御装置くん', command: 'OSから割当指示 → 装置を動かす' },
  { name: 'os', label: 'OSくん', command: 'アカウントと権限を管理' },
];
const shuffle = (values: number[]) => values.map(value => ({ value, key: Math.random() })).sort((a, b) => a.key - b.key).map(item => item.value);

function ManagementLab() {
  const [order, setOrder] = useState([3, 0, 5, 2, 4, 1]);
  const [scene, setScene] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [solved, setSolved] = useState<Set<number>>(() => new Set());
  const [attempts, setAttempts] = useState(0);
  const [correctAttempts, setCorrectAttempts] = useState(0);
  const problemIndex = order[scene];
  const problem = managementFunctions[problemIndex];
  const correct = answer === problem.name;
  const choiceOrder = managementFunctions.map((_, index) => index).sort((a, b) => ((a + problemIndex * 2 + 1) % 6) - ((b + problemIndex * 2 + 1) % 6));
  const choose = (name: string) => {
    setAnswer(name); setAttempts(value => value + 1);
    if (name === problem.name) { setCorrectAttempts(value => value + 1); setSolved(previous => new Set(previous).add(problemIndex)); }
  };
  const restart = () => { setOrder(shuffle(managementFunctions.map((_, index) => index))); setScene(0); setAnswer(null); setSolved(new Set()); setAttempts(0); setCorrectAttempts(0); };
  return <div className="hw-panel management-panel">
    <div className="hw-panel-heading"><div><p className="step-label">OS FUNCTIONS → CLASSIFICATION</p><h3>OSの機能</h3><p className="management-subtitle">この仕事は、どの管理？</p></div><span className="print-badge"><small>プリント</small><b>13–17</b></span></div>
    <p>場面と働きを見比べて、OSの6つの機能を分類しよう。</p>
    <div className="management-recall">{managementFunctions.map((item, index) => { const actor = recallActors[index]; return <div key={item.name}><span className="recall-time">{item.number ? `プリント${item.number}` : '5大装置で登場'}</span><div className="recall-scene"><div className="recall-actor"><SystemMascot name={actor.name} label={actor.label} portrait /><span className="management-command">{actor.command}</span></div><p className="speech-balloon">{item.seen}</p></div><h4>{item.name}</h4><strong>{item.meaning}</strong></div>; })}</div>
    <div className="management-progress"><div><b>正解した管理</b><strong>{solved.size} / 6</strong></div><progress max="6" value={solved.size} /><span>正解率 {attempts ? Math.round(correctAttempts / attempts * 100) : 0}%</span></div>
    {solved.size === 6 && <div className="management-celebration" role="status"><span aria-hidden="true">🎉</span><div><b>6問すべて正解！ やったね！</b><p>OSの6つの管理を、具体的な場面と結び付けられました。</p></div></div>}
    <div className="hw-scenario management-quiz"><p className="step-label">OSの機能分類クイズ {scene + 1} / 6</p><h4>{problem.example}</h4><p>この場面で、中心となる管理はどれ？</p><div className="hw-choice-grid">{choiceOrder.map(index => { const item = managementFunctions[index]; return <button type="button" key={item.name} aria-pressed={answer === item.name} className={answer === item.name ? (correct ? 'is-correct' : 'is-wrong') : ''} onClick={() => choose(item.name)}>{item.name}</button>; })}</div><div className={`hw-answer ${answer ? (correct ? 'is-correct' : 'is-wrong') : ''}`} role="status">{answer ? <><b>{correct ? '✓ そうだね！ 正解！' : '× 残念！'}</b><p>{correct ? problem.meaning : `「${answer}」ではありません。何を割り当てたり管理したりしている場面か、上のイラストを見直そう。`}</p></> : <p>上のイラストと吹き出しを手がかりに選ぼう。</p>}</div><div className="hw-controls"><button type="button" disabled={scene === 0} onClick={() => { setScene(scene - 1); setAnswer(null); }}>← 前へ</button><button type="button" disabled={scene === 5} onClick={() => { setScene(scene + 1); setAnswer(null); }}>次へ →</button><button type="button" onClick={restart}>問題を並べ替えてやり直す</button></div></div>
    <Note title="6つの管理は完全に別々？"><p>分類には重なりがあります。例えば印刷では、入出力管理だけでなく、依頼の順番を決めるタスク管理や、プリンタという資源を割り当てる資源管理も関係します。クイズでは、説明の中心となる働きを選びます。</p></Note>
    <PrintTerms numbers={[13, 14, 15, 16, 17]} />
  </div>;
}

export function SoftwareLab() {
  return <section className="learning-section" id="software"><SectionHeading number="02" label="ソフトウェアとOS · 教科書 p.69" title="「印刷して！」は、誰が届ける？" question="ユーザーの指示から印刷まで、API・OS・ドライバは何をしている？" /><PrintStoryLab /><ManagementLab /></section>;
}
