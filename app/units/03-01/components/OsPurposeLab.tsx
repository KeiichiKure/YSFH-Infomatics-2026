'use client';

import { useState } from 'react';
import { Note, PrintTerms, SectionHeading } from './LessonParts';
import { SystemMascot } from './SystemMascot';

const createdFiles = [
  { id: 'photo', title: '校外学習の写真', actual: '.jpg', kind: 'JPEG画像', icon: '🌄', correctApp: '画像ビューア' },
  { id: 'voice', title: '発表練習の録音', actual: '.mp3', kind: 'MP3音声', icon: '🎙️', correctApp: '音楽プレーヤー' },
  { id: 'report', title: '完成したレポート', actual: '.pdf', kind: 'PDF文書', icon: '📄', correctApp: 'PDFビューア' },
  { id: 'memo', title: '連絡事項のメモ', actual: '.txt', kind: 'テキスト', icon: '📝', correctApp: 'テキストエディタ' },
] as const;
const associations = {
  '.jpg': { app: '画像ビューアーくん', accepts: 'JPEG画像', kind: 'image' }, '.mp3': { app: '音楽プレーヤーちゃん', accepts: 'MP3音声', kind: 'music' },
  '.pdf': { app: 'PDFビューアー先生', accepts: 'PDF文書', kind: 'pdf' }, '.txt': { app: 'テキストエディタくん', accepts: 'テキスト', kind: 'text' },
} as const;

function AppCharacter({ kind, name, upset = false }: { kind: string; name: string; upset?: boolean }) {
  const tool = kind === 'image' ? '🖼️' : kind === 'music' ? '🎧' : kind === 'pdf' ? '📕' : '✏️';
  return <div className={`viewer-character viewer-${kind} ${upset ? 'is-upset' : ''}`}><span className="viewer-face" aria-hidden="true">{upset ? '×﹏×' : '•ᴗ•'}</span><i aria-hidden="true">{tool}</i><b>{name}</b></div>;
}

function appFailureLine(kind: string) {
  if (kind === 'music') return '「音声データの並びだと思って読んだけれど、音として再生できないよ！」';
  if (kind === 'image') return '「画像の色や位置のデータとして読もうとしたけれど、絵を作れないよ！」';
  if (kind === 'pdf') return '「PDFのページを組み立てようとしたけれど、決まりに合わなくて開けないよ！」';
  return '「文字コードとして読んでみたけれど、意味のある文字にならないよ！」';
}

function FileLab() {
  const [fileId, setFileId] = useState('photo');
  const [extension, setExtension] = useState<keyof typeof associations>('.jpg');
  const [opened, setOpened] = useState(false);
  const file = createdFiles.find(item => item.id === fileId)!;
  const association = associations[extension];
  const matches = file.actual === extension;
  const chooseFile = (id: string) => { const next = createdFiles.find(item => item.id === id)!; setFileId(id); setExtension(next.actual); setOpened(false); };
  return <div className="hw-panel file-story-panel">
    <div className="hw-panel-heading"><div><p className="step-label">01 · 操作支援</p><h3>拡張子を見て、誰に渡す？</h3></div><span className="print-badge"><small>プリント</small><b>18–21</b></span></div>
    <div className="extension-explainer"><b>拡張子とは？</b><p>ファイル名の最後にある「<strong>.jpg</strong>」「<strong>.mp3</strong>」などの文字です。OSくんはこれを手がかりに、どの種類のファイルか、どのアプリへ渡すかを判断します。</p><code>校外学習 <mark>.jpg</mark></code></div>
    <p><b>① まず、作ったファイルの中身を選ぶ</b></p>
    <div className="created-file-options">{createdFiles.map(item => <button type="button" key={item.id} aria-pressed={fileId === item.id} className={fileId === item.id ? 'is-selected' : ''} onClick={() => chooseFile(item.id)}><span aria-hidden="true">{item.icon}</span><b>{item.title}</b><small>本当の中身：{item.kind}</small></button>)}</div>
    <div className="extension-controls"><label htmlFor="rename-extension"><b>② ファイル名につける拡張子</b><select id="rename-extension" value={extension} onChange={event => { setExtension(event.target.value as keyof typeof associations); setOpened(false); }}>{Object.keys(associations).map(value => <option key={value}>{value}</option>)}</select></label><button type="button" className="hw-primary" onClick={() => setOpened(true)}>③ OSくんに開いてもらう</button></div>
    <div className="file-routing-lab">
      <div className="created-file-card"><span aria-hidden="true">{file.icon}</span><b>{file.title}{extension}</b><small>保存されている本当の中身</small><strong>{file.kind}</strong></div>
      <div className="file-route-arrow" aria-hidden="true">→</div>
      <div className="file-os"><SystemMascot name="os" label="OSくん" portrait /><p className="speech-balloon">「名前の最後は<strong>{extension}</strong>だね。<br /><strong>{association.app}</strong>へ渡そう！」</p></div>
      <div className="file-route-arrow" aria-hidden="true">→</div>
      <div className="file-app"><AppCharacter kind={association.kind} name={association.app} /><p className="speech-balloon">「受け取った中身を読んでみるね」</p></div>
    </div>
    <div className={`file-app-dialogue ${opened ? (matches ? 'is-correct' : 'is-wrong') : ''}`} role="status"><AppCharacter kind={association.kind} name={association.app} upset={opened && !matches} /><div className="speech-balloon">{opened ? matches ? <><b>{association.app}</b><p>{association.kind === 'music' ? '「♪ 音声を再生できたよ！」' : `「うん、${association.accepts}として正しく開けたよ！」`}</p></> : <><b>{association.app}</b><p>{appFailureLine(association.kind)}</p><small>アプリは自分が扱える形式として読み取ろうとします。ファイル名の拡張子だけを変えても、中身の形式は変換されません。</small></> : <><b>まだ開いていません</b><p>正しい拡張子、またはわざと違う拡張子を選び、アプリの表情と反応を比べよう。</p></>}</div></div>
    <Note title="拡張子を変えることと、形式を変換すること"><p>JPEG画像をPDF文書にしたい場合は、対応するアプリで「PDFとして書き出す」などの<strong>変換</strong>が必要です。ファイル名を「写真.pdf」にするだけでは、保存されているJPEGのデータは変わりません。</p><p>実際のOSやアプリには中身を調べて開けるものもあります。この実験では、拡張子による関連付けをわかりやすく単純化しています。</p></Note>
    <PrintTerms numbers={[18, 19, 20, 21]} />
  </div>;
}

const platforms = [
  { id: 'pc', name: 'Windows PC＋マウス', device: 'マウス', os: 'Windows', direct: 'マウス用の位置判定処理', driver: 'マウス用ドライバ' },
  { id: 'tablet', name: 'Androidタブレット＋タッチ', device: 'タッチパネル', os: 'Android', direct: 'タッチ座標の判定処理', driver: 'タッチ用ドライバ' },
  { id: 'pen', name: 'iPad＋ペン', device: 'ペン', os: 'iPadOS', direct: 'ペン位置・接触の判定処理', driver: 'ペン入力の処理' },
] as const;
const apps = [
  { name: 'お絵描きアプリ', kind: 'paint', tool: '🎨' },
  { name: '発表アプリ', kind: 'presentation', tool: '📊' },
  { name: 'Webブラウザ', kind: 'browser', tool: '🌐' },
] as const;

function LearningAppCharacter({ app, busy }: { app: typeof apps[number]; busy: boolean }) {
  return <div className={`learning-app-character app-${app.kind} ${busy ? 'is-busy' : 'is-relaxed'}`}><span className="learning-app-tool" aria-hidden="true">{app.tool}</span><span className="learning-app-face" aria-hidden="true">{busy ? '＞﹏＜' : '•ᴗ•'}</span><b>{app.name}</b><small>{busy ? '機器ごとの処理で大忙し！' : '共通APIで余裕あり'}</small>{busy && <i aria-hidden="true">💦</i>}</div>;
}

function PlatformDevice({ id, label }: { id: typeof platforms[number]['id']; label: string }) {
  return <div className={`platform-device-visual platform-${id}`} role="img" aria-label={`${label}のイラスト`}>
    <span className="platform-screen"><i /></span>
    {id === 'pc' && <><span className="platform-stand" /><span className="platform-mouse" /></>}
    {id === 'tablet' && <span className="platform-touch"><i /><i /><i /></span>}
    {id === 'pen' && <span className="platform-stylus" />}
  </div>;
}

function ApiAbstractionLab() {
  const [withOs, setWithOs] = useState(false);
  const [platform, setPlatform] = useState(0);
  const [app, setApp] = useState(0);
  const current = platforms[platform];
  const currentApp = apps[app];
  return <div className="hw-panel api-compare-panel">
    <div className="hw-panel-heading"><div><p className="step-label">02 · 基本機能の提供</p><h3>OSがいない世界／いる世界</h3></div></div>
    <p>端末とアプリを切り替えて、「ポインタの位置を知る」ために誰が機器の違いへ対応するか比べよう。</p>
    <div className="compare-switch" aria-label="OSによる抽象化の比較"><button type="button" className={!withOs ? 'is-selected' : ''} aria-pressed={!withOs} onClick={() => setWithOs(false)}>OSの共通機能を使わない</button><button type="button" className={withOs ? 'is-selected' : ''} aria-pressed={withOs} onClick={() => setWithOs(true)}>OS＋APIを使う</button></div>
    <div className="platform-pickers"><div><b>端末を選ぶ</b>{platforms.map((item, index) => <button type="button" key={item.id} className={platform === index ? 'is-selected' : ''} onClick={() => setPlatform(index)}>{item.name}</button>)}</div><div><b>アプリを選ぶ</b>{apps.map((item, index) => <button type="button" key={item.name} className={app === index ? 'is-selected' : ''} onClick={() => setApp(index)}>{item.tool} {item.name}</button>)}</div></div>
    <div className={`api-world ${withOs ? 'with-os' : 'without-os'}`}>
      <div className="api-world-device"><PlatformDevice id={current.id} label={current.name} /><b>{current.name}</b><span>{current.device}で位置を入力</span></div><i aria-hidden="true">→</i>
      {withOs ? <><div className="api-world-os"><SystemMascot name="os" label={`${current.os}のOSくん`} portrait /><span>{current.driver}で受け取る</span><strong>API「位置を教えて」</strong></div><i aria-hidden="true">→</i><div className="api-world-app"><LearningAppCharacter app={currentApp} busy={false} /><code>APIから位置を受け取る</code><span>端末固有の読み方を知らなくてよい</span></div></> : <div className="api-world-app direct"><LearningAppCharacter app={currentApp} busy /><p>このアプリ自身に、3種類すべての判定処理が必要</p><div className="direct-handlers">{platforms.map((item, index) => <span key={item.id} className={platform === index ? 'is-current' : ''}><b>{item.device}</b><small>{item.direct}</small></span>)}</div><strong>いま使っている：{current.device}</strong></div>}
    </div>
    <div className="implementation-matrix"><b>3つのアプリ × 3種類の入力機器</b>{withOs ? <p><strong>OS側：</strong>機器ごとの3つの対応　＋　<strong>アプリ側：</strong>各OSの共通APIを利用</p> : <p><strong>各アプリに同じ3種類</strong>を入れるため、3×3＝9通りの機器別処理が必要</p>}<div>{apps.map(appItem => <span key={appItem.name}><strong>{appItem.tool} {appItem.name}</strong><small>{withOs ? '共通API「位置を教えて」' : '🖱 マウス　👆 タッチ　✎ ペン'}</small></span>)}</div></div>
    <div className="hw-dialogue" role="status"><h4>{withOs ? 'OSくんが機器の違いを引き受ける' : '各アプリが機器の違いを引き受ける'}</h4><p>{withOs ? `${currentApp.name}は、${current.device}の細かな読み取り方をOSへ任せ、APIで共通化された位置を受け取れます。` : `${currentApp.name}自身に「${current.direct}」を書かなければ、この端末の入力を使えません。`}</p></div>
    <Note title="OSが違っても、まったく同じAPI？"><p>Windows・Android・iPadOSなどでは、実際のAPIやアプリの作り方が異なります。そのためアプリには対応OS向けの版が必要です。ただし、<strong>対応するOSの中では、OSが機器の違いを吸収する</strong>ため、アプリがすべての製品を個別に制御する必要を減らせます。</p></Note>
  </div>;
}

type TaskId = 'print' | 'save' | 'music';
type Job = { id: TaskId; phase: number };
const tasks = {
  print: { name: 'レポートを印刷', device: 'プリンタ', phases: ['CPUで印刷準備', 'プリンタへ出力', 'CPUで完了処理'] },
  save: { name: '写真を保存', device: 'SSD', phases: ['CPUで保存準備', 'SSDへ書き込み', 'CPUで完了処理'] },
  music: { name: '音楽を再生', device: 'スピーカー', phases: ['CPUで再生準備', 'スピーカーへ出力', 'CPUで次を準備'] },
} as const;

function LazyComputer() {
  return <div className="lazy-computer" aria-label="資源を管理しない、眠そうなコンピュータ"><span className="lazy-screen"><i>−　−</i><b>ふぅ…</b></span><span className="lazy-zzz">Zzz</span><strong>管理しないコンピュータ</strong></div>;
}

function ResourceManagerLab() {
  const [managed, setManaged] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [message, setMessage] = useState('やりたい仕事を押して、OSの違いを比べよう。');
  const [blocked, setBlocked] = useState(false);
  const reset = (value = managed) => { setManaged(value); setJobs([]); setBlocked(false); setMessage('3つの仕事を続けて依頼し、受け付け方を比べよう。'); };
  const request = (id: TaskId) => {
    if (jobs.some(job => job.id === id)) return setMessage(`「${tasks[id].name}」は、すでに依頼されています。`);
    if (!managed && jobs.length) { setBlocked(true); return setMessage(`ブブー！ 「${tasks[jobs[0].id].name}」の作業中です。終わるまで「${tasks[id].name}」は始められません。`); }
    setBlocked(false);
    setJobs([...jobs, { id, phase: 0 }]);
    setMessage(managed ? `OSくんが「${tasks[id].name}」を待ち行列へ追加しました。` : `「${tasks[id].name}」を開始。ほかの仕事はこれが終わるまで待ちます。`);
  };
  const advance = () => {
    if (!jobs.length) return setMessage('先に仕事を依頼してください。');
    setBlocked(false);
    if (!managed) {
      const first = jobs[0]; const next = first.phase + 1;
      if (next >= 3) { setJobs(jobs.slice(1)); setMessage(`「${tasks[first.id].name}」が完了。これで次の依頼を受け付けられます。`); }
      else { setJobs([{ ...first, phase: next }]); setMessage(`1つの仕事だけを進めました：${tasks[first.id].phases[next]}`); }
      return;
    }
    let cpuUsed = false; const devices = new Set<string>(); const advanced: string[] = [];
    const nextJobs = jobs.map(job => {
      const needsCpu = job.phase !== 1; const device = tasks[job.id].device;
      if (needsCpu ? cpuUsed : devices.has(device)) return job;
      if (needsCpu) cpuUsed = true; else devices.add(device);
      advanced.push(`${tasks[job.id].name}：${tasks[job.id].phases[job.phase]}`);
      return { ...job, phase: job.phase + 1 };
    }).filter(job => job.phase < 3);
    setJobs(nextJobs); setMessage(`OSくん「空いているCPUや機器へ割り当てたよ」 ${advanced.join('／')}`);
  };
  return <div className="hw-panel resource-story-panel">
    <div className="hw-panel-heading"><div><p className="step-label">03 · 資源の有効利用</p><h3>OSくんは「空いている係」を見つける</h3></div></div>
    <div className="compare-switch"><button type="button" className={!managed ? 'is-selected' : ''} onClick={() => reset(false)}>資源を管理しない</button><button type="button" className={managed ? 'is-selected' : ''} onClick={() => reset(true)}>OSが資源を管理する</button></div>
    <div className="resource-mission"><b>実験：3つの仕事を、続けて依頼してみよう</b><p>管理しない場合は2つ目で止まります。OSが管理する場合は複数の依頼を受け付け、空いた係へ割り当てます。</p></div>
    <div className="resource-request-buttons">{(Object.keys(tasks) as TaskId[]).map(id => <button type="button" key={id} className={jobs.some(job => job.id === id) ? 'is-requested' : ''} onClick={() => request(id)}><b>{tasks[id].name}</b><small>{jobs.some(job => job.id === id) ? '✓ 依頼済み' : `CPU → ${tasks[id].device} → CPU`}</small></button>)}</div>
    <div className="resource-story-world"><div className="resource-os">{managed ? <SystemMascot name="os" label="管理するOSくん" portrait /> : <LazyComputer />}</div><div className="resource-units"><span className={jobs.some(job => job.phase !== 1) ? 'is-busy' : ''}><b>CPU</b>{jobs.some(job => job.phase !== 1) ? '計算・準備中' : '空き'}</span><span className={jobs.some(job => job.id === 'print' && job.phase === 1) ? 'is-busy' : ''}><b>プリンタ</b>{jobs.some(job => job.id === 'print' && job.phase === 1) ? '印刷中' : '空き'}</span><span className={jobs.some(job => job.id === 'save' && job.phase === 1) ? 'is-busy' : ''}><b>SSD</b>{jobs.some(job => job.id === 'save' && job.phase === 1) ? '保存中' : '空き'}</span><span className={jobs.some(job => job.id === 'music' && job.phase === 1) ? 'is-busy' : ''}><b>スピーカー</b>{jobs.some(job => job.id === 'music' && job.phase === 1) ? '再生中' : '空き'}</span></div></div>
    <div className="resource-job-list">{jobs.length ? jobs.map(job => <div key={job.id}><b>{tasks[job.id].name}</b><span>いま：{tasks[job.id].phases[Math.min(job.phase, 2)]}</span><progress max="3" value={job.phase} /></div>) : <p>依頼待ちです。</p>}</div>
    <button type="button" className="hw-primary resource-next" onClick={advance}>{managed ? 'OSくんに1手進めてもらう' : 'いまの仕事を1手進める'}</button>
    <div className={`resource-speech ${blocked ? 'is-blocked' : ''}`} role="status">{managed ? <SystemMascot name="os" label="管理するOSくん" portrait /> : <LazyComputer />}<div className="speech-balloon"><h4>{blocked ? '× いま仕事中！ 次は待って！' : managed ? '空いている係へ割り当てるよ' : '1つずつしか受け付けられないよ'}</h4><p>{message}</p></div></div>
    <Note title="同時に見えるのは、なぜ？"><p>CPUが計算している間、プリンタやSSDは別の仕事をできます。OSは各仕事の状態を見て、空いている資源へ仕事を割り当てます。短い時間で処理を切り替えることで、複数のアプリが並行して進んでいるようにも見えます。</p><p>実際には切り替えの負担や資源の取り合いもあるため、仕事を増やせば必ず速くなるわけではありません。</p></Note>
    <aside className="hw-writeback"><b>プリント「OSの目的」へ</b><p>操作支援／基本機能の提供／資源の有効利用を、今の3つの体験から説明しよう。</p></aside>
  </div>;
}

export function OsPurposeLab() {
  return <section className="learning-section" id="os-purpose"><SectionHeading number="03" label="OSの目的とファイル · 教科書 pp.70–71" title="OSがいると、何が楽になる？" question="ファイルを開く、違う端末で入力する、複数の仕事を進める。OSの助けを比べよう。" /><FileLab /><ApiAbstractionLab /><ResourceManagerLab /></section>;
}
