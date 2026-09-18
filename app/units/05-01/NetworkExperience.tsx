'use client';
import {useState} from 'react';
import {servers} from './networkModel';
import {Frame,Section} from './ExperienceUi';
import {PrintTerms} from './PrintTerms';
import {LayerModels} from './LayerModels';
import {VisualNotes} from './VisualNotes';
import {LayerLab} from './LayerExperience';
import {LetterLab,LetterSources} from './LetterExperience';
import './experience.css';
import './reconstruction.css';
import './intentions.css';
import './journey.css';
export {NetworkLab} from './GraphNetwork';
export function ServerLab(){const [task,setTask]=useState(0),[answers,setAnswers]=useState<(number|null)[]>(servers.map(()=>null));const choice=answers[task],s=servers[task];const right=answers.filter((v,i)=>v===i).length;const answered=answers.filter(v=>v!==null).length;return <Section id="servers" n={2} title="どのサーバにお願いする？" blank="③〜⑦"><Frame title={`依頼 ${task+1} / ${servers.length}`} note="依頼と返事の動きは、上のネットワーク実験で各サーバを選んで確かめられます。" controls={<><button disabled={!task} onClick={()=>setTask(t=>t-1)}>← 前の問題</button><span>{task+1} / {servers.length}</span><button disabled={task===servers.length-1} onClick={()=>setTask(t=>t+1)}>次の問題 →</button><button onClick={()=>{setAnswers(servers.map(()=>null));setTask(0)}}>解答をリセット</button><a href="#network">上の動きで確認 ↑</a></>}><div className="nx-server-quiz"><div className="quiz-progress" aria-label="確認問題の進み具合"><span>回答済み <b>{answered}</b></span><span>正解 <b>{right}</b></span><span>残り <b>{servers.length-answered}</b></span><span>正答率 <b>{answered?Math.round(right/answered*100):0}%</b></span></div><p className="nx-question">{s.request}。どのサーバにお願いする？</p><div className="nx-answer-grid">{servers.map((v,i)=><button key={v.name} aria-pressed={choice===i} onClick={()=>setAnswers(old=>old.map((x,j)=>j===task?i:x))}>{v.name}</button>)}</div><div className="nx-status" role="status">{choice===null?'答えを押すと、役割と返事が表示されます。':choice===task?<><b>✓ 正解：{s.name}</b><p>{s.action} → {s.response}</p></>:<><b>× もう一度考えよう</b><p>{servers[choice].name}は、{servers[choice].detail}</p></>}</div>{right===servers.length&&<strong>✓ 全問正解！依頼先の役割を説明できた。</strong>}</div></Frame><PrintTerms section={2}/></Section>}
export function ProtocolLab(){return <Section id="protocol" n={3} title="通信のルール（通信プロトコル）をそろえよう" blank="⑪〜㉑"><LetterLab/><LetterSources/><LayerLab/><LayerModels/><PrintTerms section={3}/><VisualNotes kind="protocol"/></Section>}
