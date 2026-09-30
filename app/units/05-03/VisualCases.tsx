'use client';
import {useEffect,useState} from 'react';
import {Frame,Notice} from './LessonParts';

export {AttackLab} from './AttackExperience';
function CaseControls({frame,count,playing,onPrev,onNext,onReplay}:{frame:number;count:number;playing:boolean;onPrev:()=>void;onNext:()=>void;onReplay:()=>void}){return <div className="s03-film-controls"><span>場面 {frame+1}/{count}</span><button type="button" onClick={onPrev} disabled={frame===0}>← 前の場面</button><button type="button" onClick={onNext} disabled={frame===count-1}>次の場面 →</button><button type="button" onClick={onReplay}>{frame===0&&!playing?'▶ 始める':'▶ 最初から再生'}</button></div>}
function useFilm(count:number,identity:number){const [frame,setFrame]=useState(0),[playing,setPlaying]=useState(false);useEffect(()=>{const timer=window.setTimeout(()=>{setFrame(0);setPlaying(false)},0);return()=>window.clearTimeout(timer)},[identity]);useEffect(()=>{if(!playing||frame>=count-1)return;const timer=window.setTimeout(()=>setFrame(v=>v+1),2800);return()=>window.clearTimeout(timer)},[frame,playing,count]);return {frame:Math.min(frame,count-1),playing,prev:()=>{setPlaying(false);setFrame(v=>Math.max(0,v-1))},next:()=>{setPlaying(false);setFrame(v=>Math.min(count-1,v+1))},replay:()=>{setFrame(0);setPlaying(true)}}}
function Celebrate({done}:{done:boolean}){return done?<div className="s03-celebrate" role="status">✦ ✨ ✦ 全問正解！ 場面から危険を見分けられたね ✦ ✨ ✦</div>:null}
type MalwareFrame={title:string;detail:string;affected:number;symbol:string};
const malwareCases=[
 {answer:'コンピュータウイルス',intro:'文化祭の画像.zip が届いた。中にある「写真を見る.exe」を開いたら…',why:'実行ファイルがほかのファイルを宿主にして感染しました。',actions:['出所不明のexeは開かない','感染を疑ったらネットワークから切り離して先生へ'],frames:[{title:'ZIPを受信',detail:'文化祭の画像.zip',affected:0,symbol:'📦'},{title:'中にexeがあった',detail:'写真を見る.exe',affected:0,symbol:'⚙️'},{title:'開くとエラー',detail:'ファイルが感染した',affected:1,symbol:'⚠️'},{title:'感染ファイルを渡すと',detail:'友人のPCにも広がった',affected:2,symbol:'🦠'}]},
 {answer:'ワーム',intro:'最初のPCだけに問題があったのに、ほかのPCにも広がっていきます。',why:'宿主ファイルを渡さなくても、自分でネットワークを通じて広がります。',actions:['更新を適用する','感染PCを切り離して管理者へ連絡'],frames:[{title:'1台目に侵入',detail:'PC Aで動き始める',affected:1,symbol:'🦠'},{title:'隣のPCへ',detail:'ファイルを開かなくても広がる',affected:2,symbol:'➡️'},{title:'さらに広がる',detail:'3台とも影響を受けた',affected:3,symbol:'⚠️'}]},
 {answer:'スパイウェア',intro:'無料の壁紙アプリを入れると、画面は普通でも裏で情報が送られます。',why:'利用者に気づかれず情報を集め、外へ送る動きが中心です。',actions:['入手先とアプリの権限を確認','怪しいアプリは削除し、先生・管理者に相談'],frames:[{title:'無料アプリを入れた',detail:'壁紙が変わった',affected:0,symbol:'🎨'},{title:'裏で情報を集める',detail:'入力内容・閲覧履歴',affected:1,symbol:'👀'},{title:'外部へ送信',detail:'気づかないうちに漏れている',affected:1,symbol:'📤'}]},
 {answer:'ランサムウェア',intro:'動画変換ツールを開いた翌日、レポートのファイルが開けなくなりました。',why:'ファイルを使えなくし、解除と引き換えに金銭を求めています。',actions:['支払いを自己判断しない','端末を切り離し、管理者へ連絡','バックアップからの復旧を相談'],frames:[{title:'ツールを開く',detail:'動画変換.exe',affected:0,symbol:'⚙️'},{title:'レポートが開けない',detail:'ファイルが暗号化された',affected:1,symbol:'🔒'},{title:'金銭を要求',detail:'解除には支払いが必要',affected:1,symbol:'💴'}]},
 {answer:'トロイの木馬',intro:'便利な課題管理アプリに見えたものを入れたら、裏に入口が作られました。',why:'役立つものに見せかけて入り込み、遠隔操作の入口を作る場合があります。',actions:['配布元と権限を確認','怪しいアプリは開かず相談'],frames:[{title:'便利そうなアプリ',detail:'課題管理アプリを入れた',affected:0,symbol:'📱'},{title:'裏で入口ができる',detail:'本人は気づかない',affected:1,symbol:'🚪'},{title:'遠隔から操作',detail:'第三者が端末に指示',affected:1,symbol:'🎮'}]},
] as const;
const malwareOptions=malwareCases.map(item=>item.answer);
function MalwareScreen({index,step,frame}:{index:number;step:number;frame:MalwareFrame}){
 return <div className="s03-malware-stage" key={`${index}-${step}`}><div className="s03-malware-window"><div className="s03-malware-titlebar"><span>● ● ●</span><b>PC A の画面</b></div><div className="s03-malware-screen">
  {index===0&&<div className="s03-malware-files"><b>📁 文化祭の画像.zip</b><span>{step===0?'画像を見ようと開いた':step===1?'⚙️ 写真を見る.exe が入っていた':step===2?'⚠️ 実行するとエラーが出た':'🦠 感染したファイルを友人に渡した'}</span></div>}
  {index===1&&<div className="s03-malware-files"><b>🦠 ネットワークの様子</b><span>{step===0?'PC A で不審なプログラムが動く':step===1?'→ PC B に自分で広がる':'→ PC C にも広がる'}</span></div>}
  {index===2&&<div className="s03-malware-files"><b>{step===0?'⬇ 無料の壁紙アプリをダウンロード':'🖼️ 壁紙アプリが起動中'}</b><span>{step===0?'［インストール］':step===1?'👀 入力内容を裏で集めている':'📤 入力情報 → 外部へ送信中'}</span></div>}
  {index===3&&<div className="s03-malware-files"><b>📄 レポート.docx　📄 発表資料.pptx</b><span>{step===0?'動画変換ツールを開いた':step===1?'🔒 ファイルを開けません':'🔒 解除には支払いが必要です'}</span></div>}
  {index===4&&<div className="s03-malware-files"><b>📱 課題管理アプリ</b><span>{step===0?'便利そうなので入れてみた':step===1?'🚪 裏で遠隔操作の入口が作られた':'🎮 第三者が離れた場所から操作中'}</span></div>}
 </div></div><strong>{frame.symbol} {frame.title}</strong><span>{frame.detail}</span><div className="s03-impact-heading">影響を受けた範囲 <b>{frame.affected}/3台</b></div><div className="s03-computers" aria-label={`${frame.affected}台が影響を受けた図`}>{[0,1,2].map(i=><div key={i} className={i<frame.affected?'is-infected':''}>💻<small>PC {String.fromCharCode(65+i)}</small>{i<frame.affected&&<b>⚠</b>}</div>)}</div></div>;
}
export function MalwareLab(){
 const [index,setIndex]=useState(0),[answers,setAnswers]=useState<(string|null)[]>(Array(malwareCases.length).fill(null));
 const item=malwareCases[index],film=useFilm(item.frames.length,index),frame:MalwareFrame=item.frames[film.frame],choice=answers[index],correct=answers.filter((answer,i)=>answer===malwareCases[i].answer).length;
 return <Frame id="malware-lab" title="マルウェアを場面から見分ける">
  <div className="s03-case-header"><span>事例 {index+1}/{malwareCases.length}　正解 {correct}/{malwareCases.length}</span><div><button type="button" disabled={index===0} onClick={()=>setIndex(index-1)}>← 前へ</button><button type="button" disabled={index===malwareCases.length-1} onClick={()=>setIndex(index+1)}>次へ →</button></div></div>
  <p className="s03-visual-intro">{item.intro}</p>
  <div className="s03-malware-layout">
   <div className="s03-malware-visual"><MalwareScreen index={index} step={film.frame} frame={frame}/><CaseControls frame={film.frame} count={item.frames.length} playing={film.playing} onPrev={film.prev} onNext={film.next} onReplay={film.replay}/></div>
   <div className="s03-malware-answer"><div className="s03-options" role="group" aria-label="マルウェアの種類">{malwareOptions.map(label=><button type="button" key={label} aria-pressed={choice===label} onClick={()=>setAnswers(old=>old.map((value,i)=>i===index?label:value))}>{label}</button>)}</div><Notice title={choice===null?'どんな動きが手掛かり？':choice===item.answer?'✓ 正解！':'× 動きを見直そう'}>{choice===null?'開いたもの、広がり方、起きた被害に注目。':item.why}</Notice>{choice&&<div className="s03-action-panel"><b>こんなときは</b><ul>{item.actions.map(action=><li key={action}>✓ {action}</li>)}</ul></div>}</div>
  </div>
  <Celebrate done={correct===malwareCases.length}/>
 </Frame>;
}


