import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {randomUUID} from 'node:crypto';
const base='http://127.0.0.1:3065/YSFH-Infomatics-2026/api/poll/';const key=(await fs.readFile('tmp/02-04-poll/teacher-url.txt','utf8')).split('#')[1];
async function post(route,b,fail=false){const r=await fetch(base+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});const j=await r.json();if(!fail)assert.equal(r.status,200,JSON.stringify(j));return j;}
const priorCodes=(await post('admin',{key})).sessions.filter(s=>s.active).map(s=>s.code);const code=Array.from({length:10000},(_,i)=>String(i).padStart(4,'0')).find(c=>!priorCodes.includes(c));
await post('admin',{key,action:'new',value:code,title:'API自動確認 '+new Date().toISOString()});const db=await post('admin',{key});const s=db.sessions.at(-1);assert.equal(s.code,code);
const joins=await Promise.all(Array.from({length:40},()=>post('join',{code:s.code,participant:randomUUID()})));assert(joins.every(j=>j.snapshot.first===null));
const payloads=joins.map((j,i)=>({token:j.token,sessionId:s.id,topic:0,condition:'base',round:1,choice:i%4,reason:i===0?'<img src=x onerror=alert(1)>：後で読み返せる':'自動確認 '+i+'：相手の都合と理解を確かめたい',requestId:randomUUID()}));
await Promise.all(payloads.map(p=>post('vote',p)));await Promise.all(payloads.map(p=>post('vote',p)));let r=await post('snapshot',{token:joins[0].token});assert.equal(r.first.total,40);assert.deepEqual(r.first.counts,[10,10,10,10]);
await post('admin',{key,action:'phase',sessionId:s.id,value:'discussion'});await post('vote',payloads[0]);await post('admin',{key,action:'phase',sessionId:s.id,value:'reconsider'});
await Promise.all(payloads.map(p=>post('vote',{...p,round:2,choice:3,requestId:randomUUID()})));r=await post('snapshot',{token:joins[0].token});assert.equal(r.first.total,40);assert.equal(r.second.total,40);assert.equal(r.second.counts[3],40);
const prior=await post('admin',{key});const first=prior.sessions.find(x=>x.id===s.id).votes[0];await post('admin',{key,action:'hide',sessionId:s.id,value:first.id});r=await post('snapshot',{token:joins[0].token});assert.equal(r.first.total,40);assert.equal(r.first.reasons.length,39);
const wrong=await post('snapshot',{token:joins[0].token+'x'},true);assert(wrong.error);await post('admin',{key,action:'finish',sessionId:s.id});assert((await post('snapshot',{token:joins[0].token},true)).error);
const visitor=randomUUID(),global=await post('join-public',{participant:visitor,topic:0});assert.equal(global.snapshot.first,null);
const x={token:global.token,sessionId:'community',topic:0,condition:'base',round:1,choice:1,reason:'全体投票の確認：文章で整理してから対面で相談する。',requestId:randomUUID()};
let view=await post('vote',x);const total=view.first.total;assert(total>=41);assert(view.second.total>=40);assert(view.first.reasons.some(r=>r.reason===x.reason));assert.equal((await post('vote',x)).first.total,total);
for(const topic of [3,1,2]){assert.equal((await post('snapshot',{token:global.token,topic})).visible,false);const y={...x,topic,requestId:randomUUID()};view=await post('vote',y);assert(view.first.total>=1);}
assert((await post('snapshot',{token:global.token,topic:0})).visible);assert((await post('snapshot',{token:global.token,topic:5},true)).error);
console.log('API検証成功：4桁コード、40参加者・80回答、再送、非表示・改ざん、終了授業の全体集計、コードなし4テーマ切替');
