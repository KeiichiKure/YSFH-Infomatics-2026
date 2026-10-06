import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
const base='http://127.0.0.1:3065/YSFH-Infomatics-2026/api/poll/';
const key=(await fs.readFile('tmp/02-04-poll/teacher-url.txt','utf8')).split('#')[1];
async function post(route,b){const r=await fetch(base+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});const j=await r.json();assert.equal(r.status,200,JSON.stringify(j));return j;}
const before=await post('admin',{key}),code=Array.from({length:10000},(_,i)=>String(i).padStart(4,'0')).find(c=>!before.sessions.some(s=>s.active&&s.code===c));
await post('admin',{key,action:'new',value:code,title:'自由投票・40人同時送信の自動確認'});
const joins=await Promise.all(Array.from({length:40},()=>post('join',{code,participant:randomUUID()})));assert(joins.every(j=>j.snapshot.topics.length===4));
const sessionId=joins[0].snapshot.session.id,inputs=[];
for(const round of [1,2]){
 const roundInputs=joins.flatMap((j,i)=>[0,1,2,3].map(topic=>({token:j.token,sessionId,topic,round,condition:'base',choice:(i+round)%4,reason:i%2?'':'任意の確認用の理由',requestId:randomUUID()})));
 await Promise.all(roundInputs.map(p=>post('vote',p)));inputs.push(...roundInputs);
}
await Promise.all(inputs.map(p=>post('vote',p)));
for(const topic of [3,1,0,2]){const v=await post('snapshot',{token:joins[0].token,topic,round:2});assert.equal(v.first.total,40);assert.equal(v.second.total,40);assert.deepEqual(v.first.counts,[10,10,10,10]);assert.equal(v.first.reasons.length,20);assert.equal(v.second.reasons.length,20);}
const actual=(await post('admin',{key})).sessions.find(s=>s.id===sessionId);assert.equal(actual.topic,0);assert.equal(actual.phase,'initial');assert.equal(actual.votes.length,320);
await post('admin',{key,sessionId,action:'finish'});
const publicJoin=await post('join-public',{participant:randomUUID(),topic:3});const publicFirst={token:publicJoin.token,sessionId:'community',topic:3,round:1,condition:'base',choice:0,reason:'',requestId:randomUUID()};
const a=await post('vote',publicFirst);const b=await post('vote',{...publicFirst,round:2,choice:3,requestId:randomUUID()});assert.equal(a.first.total,b.first.total);assert.equal(b.mine.first.choice,0);assert.equal(b.mine.second.choice,3);
console.log('自由投票API検証成功：40人×4課題×初回・考え直し＝320票、同時送信・再送、理由任意、全体投票の考え直し');
