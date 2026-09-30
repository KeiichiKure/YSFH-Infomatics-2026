'use client';
import {useCallback,useEffect,useRef,useState,type FormEvent,type ReactNode} from 'react';

export function Browser({url,children}:{url:string;children:ReactNode}){
 return <div className="s03-faux-browser"><div className="s03-browser-bar"><i/><i/><i/><span>{url}</span></div><div className="s03-browser-body">{children}</div></div>;
}

type AutoPhase='typing'|'pressing'|'rejected'|'success';
type AutoFrame={candidate:string;running:boolean;success:boolean;phase:AutoPhase};
type AutoIndex=1|2;
const settings={
 1:{total:10000,successCount:7393,start:'0000',end:'9999',fixed:'ID：Students01を固定'},
 2:{total:1000000,successCount:735421,start:'y16000000',end:'y16999999',fixed:'パスワード：123456を固定'},
} as const;
function candidateAt(index:AutoIndex,attempt:number){
 const number=Math.max(0,attempt-1);
 return index===1?String(number).padStart(4,'0'):`y${16000000+number}`;
}

function autoStep(elapsed:number,successCount:number):{count:number;phase:AutoPhase}{
 // Show four complete attempts before the accelerated sequence.
 const slowAttemptMs=1500,slowCount=4,slowTotalMs=slowAttemptMs*slowCount;
 if(elapsed<slowTotalMs){
  const attempt=Math.floor(elapsed/slowAttemptMs);
  const withinAttempt=elapsed%slowAttemptMs;
  return {count:attempt+2,phase:withinAttempt<600?'typing':withinAttempt<950?'pressing':'rejected'};
 }
 const progress=Math.min(1,(elapsed-slowTotalMs)/3600);
 const count=Math.min(successCount,6+Math.floor(progress*(successCount-6)));
 if(count===successCount)return {count,phase:'success'};
 const cycle=(elapsed-slowTotalMs)%240;
 return {count,phase:cycle<90?'typing':cycle<150?'pressing':'rejected'};
}

function AutoAttemptDemo({index,onFrame,onComplete}:{index:AutoIndex;onFrame:(frame:AutoFrame|null)=>void;onComplete:()=>void}){
 const {total,successCount,start,end,fixed}=settings[index];
 const [count,setCount]=useState(0);
 const [phase,setPhase]=useState<AutoPhase>('typing');
 const [running,setRunning]=useState(false);
 const elapsedBeforeRun=useRef(0);
 const latestElapsed=useRef(0);
 useEffect(()=>{
  if(!running)return;
  const started=performance.now()-elapsedBeforeRun.current;
  const timer=window.setInterval(()=>{
   const elapsed=performance.now()-started;
   latestElapsed.current=elapsed;
   const step=autoStep(elapsed,successCount);
   const candidate=candidateAt(index,step.count);
   setCount(step.count);
   setPhase(step.phase);
   onFrame({candidate,running:step.phase!=='success',success:step.phase==='success',phase:step.phase});
   if(step.phase==='success'){setRunning(false);onComplete()}
  },50);
  return()=>window.clearInterval(timer);
 },[running,index,successCount,onFrame,onComplete]);
 const candidate=candidateAt(index,count);
 const success=count===successCount;
 const startRun=()=>{
  if(success){setCount(0);setPhase('typing');elapsedBeforeRun.current=0;latestElapsed.current=0}
  else elapsedBeforeRun.current=latestElapsed.current;
  const step=autoStep(elapsedBeforeRun.current,successCount);
  onFrame({candidate:candidateAt(index,step.count),running:true,success:false,phase:step.phase});
  setRunning(true);
 };
 const pause=()=>{setRunning(false);elapsedBeforeRun.current=latestElapsed.current;onFrame({candidate,running:false,success:false,phase})};
 const reset=()=>{setRunning(false);setCount(0);setPhase('typing');elapsedBeforeRun.current=0;latestElapsed.current=0;onFrame(null)};
 return <div className={`s03-auto-demo ${success?'is-success':''}`}>
  <div className="s03-auto-heading"><b>💻 自動試行プログラム（学習用の再現）</b><span>{fixed}</span></div>
  <p>{start} から {end} の候補。最初の4回をゆっくり見せ、その後は高速で試します。</p>
  <div className="s03-auto-live" aria-live="off"><span>{index===1?'試すパスワード':'試すID'}</span><strong key={candidate}>{candidate}</strong><b>{success?'✓ ログイン成功':running?count<=5?phase==='typing'?'入力中':phase==='pressing'?'↵ ログインを押す':'× 認証失敗':'⚡ 高速試行中':count>0?'一時停止中':'開始前'}</b></div>
  <div className="s03-auto-progress" role="progressbar" aria-label="自動試行の進み具合" aria-valuemin={0} aria-valuemax={total} aria-valuenow={count}><span style={{width:`${count/total*100}%`}}/></div>
  <div className="s03-auto-controls"><b>{count.toLocaleString('ja-JP')} / {total.toLocaleString('ja-JP')} 件</b><button type="button" onClick={running?pause:startRun}>{running?'一時停止':count===0?'▶ 自動試行を始める':success?'↻ もう一度見る':'▶ 再開する'}</button><button type="button" onClick={reset}>最初に戻す</button></div>
  <small>実際のログイン認証・通信は行いません。学校の学習サイトの入力欄にも同じ候補を表示します。</small>
 </div>;
}

export function LoginExperience({index,onComplete}:{index:number;onComplete:()=>void}){
 const [value,setValue]=useState('');
 const [attempts,setAttempts]=useState<string[]>([]);
 const [loggedIn,setLoggedIn]=useState(false);
 const [duplicate,setDuplicate]=useState(false);
 const [autoFrame,setAutoFrame]=useState<AutoFrame|null>(null);
 const variable=index===2?'ID':'パスワード';
 const onAutoFrame=useCallback((frame:AutoFrame|null)=>{setAutoFrame(frame);if(frame?.running)setLoggedIn(false)},[]);
 const submit=(event:FormEvent<HTMLFormElement>)=>{
  event.preventDefault();
  if(index===0){setLoggedIn(true);onComplete();return}
  if(!value.trim()||attempts.length>=3||autoFrame)return;
  if(attempts.includes(value.trim())){setDuplicate(true);return}
  const next=[...attempts,value.trim()];
  setAttempts(next);setValue('');setDuplicate(false);
  if(next.length===3){setLoggedIn(true);onComplete()}
 };
 const changeValue=(next:string)=>{setValue(next);setDuplicate(false)};
 const autoLocked=autoFrame!==null;
 return <>
  <Browser url="school.example.jp · 学習サイト（架空）"><b>学校の学習サイト</b>
   {loggedIn&&!autoFrame?<div className="s03-dashboard">✓ ログイン成功<small>{index===0?'前の人の提出物と個人の記録が見えてしまった。':`3回目の${variable}でログインできた。`}</small></div>:
    <form onSubmit={submit} className="s03-demo-form">
     <div className="s03-login-line"><span>ID</span>{index===2?<input aria-label="試すID" className={autoFrame?'is-auto-input':''} placeholder="例：Students01" value={autoFrame?.candidate??value} readOnly={autoLocked} onChange={event=>changeValue(event.target.value)} autoComplete="off"/>:<strong>{index===0?'friend01':'Students01'}</strong>}</div>
     <div className="s03-login-line"><span>パスワード</span>{index===0?<strong>●●●●●●（保存済み）</strong>:index===2?<strong>123456（固定）</strong>:<input aria-label="試すパスワード" className={autoFrame?'is-auto-input':''} placeholder={index===3?'例：部活名・学校名・誕生日':'例：spring'} value={autoFrame?.candidate??value} readOnly={autoLocked} onChange={event=>changeValue(event.target.value)} autoComplete="off"/>}</div>
     {index===3&&<div className="s03-candidate-list"><b>候補を選んでも入力できます：</b>{['basketball','schoolname','0915','password','01234','123456'].map(word=><button key={word} type="button" onClick={()=>changeValue(word)}>{word}</button>)}</div>}
     {duplicate&&<p className="s03-demo-error" role="alert">前とは違う{variable}を試そう。</p>}
     {autoFrame?<div className="s03-login-feedback-slot" role="status">{autoFrame.success?<div className="s03-login-status is-success">✓ ログイン成功</div>:autoFrame.phase==='rejected'?<div className="s03-login-status is-fail">{index===2?'IDまたはパスワードが正しくありません。':'パスワードが間違っています。'}</div>:null}</div>:attempts.length>0&&!loggedIn?<div className="s03-login-status is-fail" role="status">{index===2?'IDまたはパスワードが正しくありません。':'パスワードが間違っています。'}</div>:null}
     <button type="submit" className={`s03-demo-submit ${autoFrame?.phase==='pressing'?'is-auto-pressing':''}`} aria-disabled={autoLocked} disabled={index!==0&&!autoLocked&&!value.trim()}>{index===0?'保存された情報でログインする':'ログインする'}</button>
    </form>}
  </Browser>
  {attempts.length>0&&<div className="s03-attempt-history" aria-live="polite"><b>試行の記録</b><div className="s03-attempt-list">{attempts.map((attempt,i)=><div key={i} className={i===2?'is-success':'is-fail'}><b>{i+1}回目</b><span>{variable}「{attempt}」</span><strong>{i===2?'✓ 成功':'× 失敗'}</strong></div>)}</div></div>}
  {(index===1||index===2)&&<AutoAttemptDemo index={index as AutoIndex} onFrame={onAutoFrame} onComplete={onComplete}/>}
  <p className="s03-demo-hint">{autoFrame?.success?'自動試行で見つかった候補が学習サイトの入力欄にも表示されています。下から行為の名前を選ぼう。':loggedIn?'画面で起きたことを見て、下から行為の名前を選ぼう。':index===0?'ログインボタンを押して、何が見えるか確かめよう。':`${variable}を変えて手動で試すか、自動試行を動かそう。本物のパスワードは入力しないでください。`}</p>
 </>;
}
