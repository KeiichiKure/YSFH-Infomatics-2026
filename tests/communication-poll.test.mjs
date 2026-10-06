import test from 'node:test';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';import fs from 'node:fs';import vm from 'node:vm';import Core from '../poll/core.cjs';
const make=()=>Core.newSession('lesson','授業','CODE','2026-10-05T00:00:00Z');
const input=(s,choice=0,reason='表情を確かめたい')=>({sessionId:s.id,topic:s.topic,condition:s.condition,round:s.phase==='reconsider'?2:1,choice,reason,requestId:randomUUID()});
const vote=(s,p,x=input(s))=>Core.submitVote(s,p,x,new Date().toISOString(),randomUUID());
test('投票前は他の票・理由・参加識別子・授業コードを返さない',()=>{const s=make();vote(s,'one');const r=Core.snapshot(s,'two','now');assert.equal(r.visible,false);assert.equal(r.first,null);assert.equal(r.second,null);assert.equal(JSON.stringify(r).includes('participant'),false);assert.equal(JSON.stringify(r).includes('CODE'),false);});
test('40人の同時投票相当と同一送信の再試行で人数が増えない',()=>{const s=make(),inputs=Array.from({length:40},(_,i)=>input(s,i%4));inputs.forEach((x,i)=>vote(s,'p'+i,x));inputs.forEach((x,i)=>vote(s,'p'+i,x));const r=Core.snapshot(s,'p0','now');assert.equal(r.first.total,40);assert.deepEqual(r.first.counts,[10,10,10,10]);assert.equal(s.requests.length,40);});
test('投票の修正は置換、初回と考え直しは別々',()=>{const s=make();vote(s,'one');vote(s,'one',input(s,3,'後から読み返せる'));assert.equal(s.votes.length,1);Core.manage(s,'phase','discussion');assert.throws(()=>vote(s,'one'),/受付/);Core.manage(s,'phase','reconsider');vote(s,'one',input(s,2,'すぐ質問できる'));const r=Core.snapshot(s,'one','now');assert.equal(r.first.counts[3],1);assert.equal(r.second.counts[2],1);assert.equal(r.first.total,1);assert.equal(r.second.total,1);assert.throws(()=>vote(s,'new'),/初回/);});
test('締切後の成功済み送信の再試行は増票しない',()=>{const s=make(),x=input(s);vote(s,'one',x);Core.manage(s,'phase','discussion');vote(s,'one',x);assert.equal(s.votes.length,1);assert.throws(()=>vote(s,'one',{...x,reason:'別の理由'}),/送信/);});
test('理由を隠しても票は残り、除外した票は再送で復活しない',()=>{const s=make(),x=input(s);vote(s,'one',x);const id=s.votes[0].id;Core.manage(s,'hide',id);let r=Core.snapshot(s,'one','now');assert.equal(r.first.total,1);assert.equal(r.first.reasons.length,0);Core.manage(s,'show',id);assert.equal(Core.snapshot(s,'one','now').first.reasons.length,1);Core.manage(s,'exclude',id);vote(s,'one',x);assert.equal(s.votes.length,0);});
test('テーマ・条件・授業違いの古い送信を拒否、追加条件は別集計',()=>{const s=make(),x=input(s);Core.manage(s,'extra');assert.throws(()=>vote(s,'one',x),/課題/);vote(s,'one');Core.manage(s,'topic',1);assert.equal(Core.snapshot(s,'one','now').first,null);assert.throws(()=>vote(s,'one',{...input(s),sessionId:'other'}),/課題/);assert.throws(()=>Core.manage(s,'topic',0),/課題/);Core.manage(s,'finish');assert.throws(()=>Core.snapshot(s,'one','now'),/終了/);});
test('文字数・選択肢・空欄をサーバーで検証',()=>{const s=make();for(const x of [input(s,4),input(s,-1),input(s,0,'あ'.repeat(201))])assert.throws(()=>vote(s,'one',x));assert.equal(s.votes.length,0);vote(s,'one',input(s,1,'🙂'.repeat(200)));assert.equal(s.votes.length,1);});
test('Google用コードは構文が有効で、内部関数をRPCに公開しない',()=>{const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync('poll/google/Code.gs','utf8'),ctx);assert.equal(typeof ctx.votePoll,'function');assert.equal(typeof ctx.PollCore.submitVote,'function');assert.equal(ctx.submitVote,undefined);assert.equal(ctx.manage,undefined);assert.equal(ctx.PollContent.topics.length,4);});
test('4桁コードは先頭0を保持し、受付中の重複のみ拒否する',()=>{assert.equal(Core.validCode('0123',[]),'0123');for(const code of ['123','12345','abcd','１２３４'])assert.throws(()=>Core.validCode(code,[]),/4桁/);assert.throws(()=>Core.validCode('0123',[{code:'0123',active:true}]),/使用/);assert.equal(Core.validCode('0123',[{code:'0123',active:false}]),'0123');});
test('全体投票は全クラスの同じ課題だけを集計し、初回と考え直しを混ぜない',()=>{
 const community=Core.newSession('community','全体','', 'now');Core.submitPublicVote(community,'visitor',{...input(community,3),topic:2},'now','public-vote');
 const votes=[...community.votes.map(v=>({...v,scope:'community'})),{scope:'class-a',participant:'private-a',id:'a',topic:2,condition:'base',round:1,choice:0,reason:'対面で確認',visible:true},{scope:'closed-class',id:'b',topic:2,condition:'base',round:1,choice:2,reason:'非公開理由',visible:false},{scope:'class-a',id:'c',topic:2,condition:'base',round:2,choice:1,reason:'考え直し',visible:true},{scope:'other-topic',topic:1,condition:'base',round:1,choice:0,visible:true},{scope:'other-condition',topic:2,condition:'extra',round:1,choice:0,visible:true}];
 assert.equal(Core.publicSnapshot(votes,'new',2,'now').first,null);
 const view=Core.publicSnapshot(votes,'visitor',2,'now');assert.equal(view.first.total,3);assert.deepEqual(view.first.counts,[1,0,1,1]);assert.equal(view.second.total,1);assert.equal(view.first.reasons.length,2);assert.equal(JSON.stringify(view).includes('private-a'),false);assert.equal(Core.publicSnapshot(votes,'visitor',1,'now').visible,false);
});
test('全体の4テーマを順不同に投票でき、修正と再送で増票しない',()=>{
 const s=Core.newSession('community','全体','','now');for(const topic of [3,1,0,2]){const x={...input(s,topic),topic};Core.submitPublicVote(s,'one',x,'now',randomUUID());Core.submitPublicVote(s,'one',x,'now',randomUUID());}assert.equal(s.votes.length,4);
 Core.submitPublicVote(s,'one',{...input(s,0),topic:3},'now',randomUUID());assert.equal(s.votes.length,4);assert.equal(s.votes.find(v=>v.topic===3).choice,0);assert.throws(()=>Core.submitPublicVote(s,'one',{...input(s),topic:4},'now','bad'),/課題/);assert.throws(()=>Core.submitPublicVote(s,'one',{...input(s),sessionId:'class-a'},'now','bad'),/課題/);
});
test('生徒ごとに4課題と考え直しを選べて、他の人の進行を変えない',()=>{
 const s=make();s.topic=3;s.phase='closed';s.condition='extra';
 for(const topic of [2,0,3,1])for(const round of [1,2]){const x={...input(s,round),'topic':topic,round,condition:'base',reason:''};Core.submitLearnerVote(s,'one',x,'now',randomUUID());Core.submitLearnerVote(s,'one',x,'now',randomUUID());}
 assert.equal(s.votes.length,8);assert.equal(s.topic,3);assert.equal(s.phase,'closed');assert.equal(s.condition,'extra');
 const x={...input(s,3),topic:1,round:1,condition:'base',reason:'別の人の意見'};Core.submitLearnerVote(s,'two',x,'now',randomUUID());
 const a=Core.learnerSnapshot(s,'one',1,2,'now');assert.equal(a.first.total,2);assert.equal(a.second.total,1);assert.equal(a.first.reasons.length,1);assert.equal(a.second.reasons.length,0);
 assert.equal(Core.learnerSnapshot(s,'two',0,1,'now').visible,false);assert.throws(()=>Core.submitLearnerVote(s,'two',{...x,round:2,topic:0,requestId:randomUUID()},'now','new'),/初回/);
});
test('理由は任意だが選択必須。空の理由は意見一覧に載せない',()=>{
 const s=make();for(const choice of [null,undefined,4,-1])assert.throws(()=>Core.submitLearnerVote(s,'one',{...input(s),choice,reason:''},'now',randomUUID()),/選んで/);
 const r=Core.submitLearnerVote(s,'one',input(s,0,'   '),'now','empty');assert.equal(r.first.total,1);assert.equal(r.first.reasons.length,0);assert.equal(r.mine.first.reason,'');
});
test('全体投票も教員操作なしで考え直せ、初回は置き換えない',()=>{
 const s=Core.newSession('community','全体','','now');const first={...input(s,0,''),topic:3};Core.submitPublicVote(s,'one',first,'now','first');
 const second={...first,round:2,choice:3,requestId:'second'};Core.submitPublicVote(s,'one',second,'now','second');const v=Core.publicSnapshot(s.votes.map(v=>({...v,scope:'community'})),'one',3,'now',2);
 assert.equal(v.mine.first.choice,0);assert.equal(v.mine.second.choice,3);assert.equal(v.first.total,1);assert.equal(v.second.total,1);assert.equal(s.topic,0);
});
