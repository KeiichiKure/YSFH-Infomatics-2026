import fs from 'node:fs/promises';import {randomUUID} from 'node:crypto';
const base='http://127.0.0.1:3065/YSFH-Infomatics-2026/api/poll/';const key=(await fs.readFile('tmp/02-04-poll/teacher-url.txt','utf8')).split('#')[1];
async function post(route,b){const r=await fetch(base+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});const j=await r.json();if(!r.ok)throw new Error(j.error);return j;}
const [action,id,value]=process.argv.slice(2);
if(action==='new'){
 await post('admin',{key,action:'new',title:'画面確認 '+value,value});const db=await post('admin',{key}),s=db.sessions.at(-1);
 const fixture={id:s.id,code:s.code,title:s.title};await fs.writeFile('tmp/02-04-poll/qa/current.json',JSON.stringify(fixture));
 for(let i=0;i<8;i++){const j=await post('join',{code:s.code,participant:randomUUID()});await post('vote',{token:j.token,sessionId:s.id,topic:0,condition:'base',round:1,choice:i%4,reason:'確認用の意見：'+['表情を見て確かめたい。でも時間を合わせる必要がある。','事前に文章を渡し、後で直接相談する組合せを考えた。','Web会議で質問できる。回線の状態が心配。','後から読み返せる。読んだかどうかの確認も必要。'][i%4],requestId:randomUUID()});}
 console.log(JSON.stringify(fixture));
}else {const a=action==='topic'?'topic':action;const v=action==='topic'?Number(value):value;const d=await post('admin',{key,action:a,sessionId:id,value:v});console.log(JSON.stringify(d.sessions.find(s=>s.id===id),(_k,v)=>_k==='votes'?undefined:v));}
