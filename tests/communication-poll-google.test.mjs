import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import fs from 'node:fs';import {createHmac,randomUUID} from 'node:crypto';
function mock(){
 let reads=0;const cacheValues=new Map();
 class Sheet{constructor(cols){this.values=[Array(cols).fill('header')];this.failAppend=false;}getLastRow(){return this.values.length;}getLastColumn(){return this.values[0].length;}appendRow(row){if(this.failAppend){this.failAppend=false;throw new Error('通信テスト');}this.values.push([...row]);}getRange(r,c,h=1,w=1){return {setNumberFormat:()=>{},getValues:()=>{reads++;return Array.from({length:h},(_,i)=>Array.from({length:w},(_,j)=>this.values[r-1+i]?.[c-1+j]??''));},setValues:rows=>rows.forEach((row,i)=>{this.values[r-1+i]||=[];row.forEach((v,j)=>this.values[r-1+i][c-1+j]=v);})};}}
 const sheets={'授業':new Sheet(9),'回答':new Sheet(11),'送信記録':new Sheet(3)},props=new Map([['BOUND_ID','new-sheet'],['SCRIPT_ID','new-script'],['SECRET','private-test-secret']]);let opens=0,locked=0;
 const ss={getId:()=> 'new-sheet',getSheetByName:name=>sheets[name]};
 const ctx={CacheService:{getScriptCache:()=>({get:k=>cacheValues.get(k)||null,put:(k,v)=>cacheValues.set(k,v),removeAll:ks=>ks.forEach(k=>cacheValues.delete(k))})},SpreadsheetApp:{getActiveSpreadsheet:()=>null,openById:id=>{assert.equal(id,'new-sheet');opens++;return ss;},flush:()=>{}},PropertiesService:{getScriptProperties:()=>({getProperty:k=>props.get(k)})},ScriptApp:{getScriptId:()=> 'new-script'},LockService:{getScriptLock:()=>({waitLock:()=>{locked++;},releaseLock:()=>{locked--;}})},Utilities:{getUuid:randomUUID,base64EncodeWebSafe:v=>Buffer.from(typeof v==='string'?v:v).toString('base64url'),base64DecodeWebSafe:v=>Buffer.from(v,'base64url'),computeHmacSha256Signature:(v,s)=>[...createHmac('sha256',s).update(v).digest()],newBlob:v=>({getDataAsString:()=>Buffer.from(v).toString('utf8'),getBytes:()=>[...Buffer.from(v)]})}};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync('poll/google/Code.gs','utf8'),ctx);const s=ctx.PollCore.newSession('lesson','確認授業','TESTCODE',new Date().toISOString());ctx.writeLesson_({lessons:sheets['授業']},s);
 return {ctx,sheets,props,reads:()=>reads,opens:()=>opens,locked:()=>locked};
}
const payload=()=>({sessionId:'lesson',topic:0,condition:'base',round:1,choice:3,reason:'=IMPORTXML("example","x")',requestId:randomUUID()});
test('Webアプリにアクティブなシートがなくても固定の保存先へ書く',()=>{const m=mock(),j=m.ctx.joinPoll('TESTCODE','browser-one'),p=payload();assert.equal(j.snapshot.first,null);const r=m.ctx.votePoll('lesson',p,j.token);assert.equal(r.first.total,1);assert.equal(m.sheets['回答'].values.length,2);assert.equal(m.sheets['送信記録'].values.length,2);assert.equal(m.sheets['回答'].values[1][6][0],"'");assert.equal(m.locked(),0);assert.equal(m.ctx.readPoll('lesson',j.token).mine.first.reason,p.reason);assert(m.opens()>0);});
test('回答保存後の確認記録の通信失敗でも再送時に票が増えない',()=>{const m=mock(),j=m.ctx.joinPoll('TESTCODE','browser-one'),p=payload();m.sheets['送信記録'].failAppend=true;assert.throws(()=>m.ctx.votePoll('lesson',p,j.token),/通信/);const r=m.ctx.votePoll('lesson',p,j.token);assert.equal(r.first.total,1);assert.equal(m.sheets['回答'].values.length,2);assert.equal(m.locked(),0);});
test('別ブラウザの投票前は非公開、改ざんされた参加情報を拒否',()=>{const m=mock(),j=m.ctx.joinPoll('TESTCODE','browser-one');m.ctx.votePoll('lesson',payload(),j.token);const k=m.ctx.joinPoll('TESTCODE','browser-two');assert.equal(k.snapshot.first,null);assert.throws(()=>m.ctx.readPoll('lesson',j.token+'x'));assert.throws(()=>m.ctx.readPoll('other',j.token));});
test('学校へコピーした未初期設定のプロジェクトは保存先を開けない',()=>{const m=mock();m.props.set('SCRIPT_ID','personal-old-script');assert.throws(()=>m.ctx.joinPoll('TESTCODE','browser-one'),/コピー後/);assert.equal(m.opens(),0);});
test('コードなし参加は授業票を蓄積し、終了した授業も集計する',()=>{
 const m=mock(),j=m.ctx.joinPoll('TESTCODE','class-browser');m.ctx.votePoll('lesson',payload(),j.token);
 const lesson=m.ctx.loadLesson_(m.ctx.tables_(),'lesson');lesson.active=false;m.ctx.writeLesson_(m.ctx.tables_(),lesson,lesson._row);
 const global=m.ctx.joinPublicPoll('public-browser',0);assert.equal(global.snapshot.first,null);
 const x={...payload(),sessionId:'community'};const r=m.ctx.votePublicPoll(x,global.token);assert.equal(r.first.total,2);assert.equal(r.first.reasons.length,2);assert.equal(m.ctx.votePublicPoll(x,global.token).first.total,2);assert.equal(m.ctx.readPublicPoll(2,global.token).visible,false);assert.equal(m.locked(),0);
 const others=m.ctx.joinPublicPoll('another-browser',0);assert.equal(others.snapshot.first,null);assert.throws(()=>m.ctx.readPublicPoll(0,j.token),/コード/);
 const next={...payload(),sessionId:'community',topic:2};assert.equal(m.ctx.votePublicPoll(next,global.token).first.total,1);assert.equal(m.ctx.loadLesson_(m.ctx.tables_(),'lesson').topic,0);
});
test('全体集計は除外票と非公開理由を表示しない',()=>{
 const m=mock(),j=m.ctx.joinPoll('TESTCODE','class-browser');m.ctx.votePoll('lesson',payload(),j.token);m.sheets['回答'].values[1][10]=false;
 const global=m.ctx.joinPublicPoll('public-browser',0);let r=m.ctx.votePublicPoll({...payload(),sessionId:'community'},global.token);assert.equal(r.first.total,1);
 const row=m.sheets['回答'].values.find(r=>r[0]==='community');const vote=JSON.parse(row[9]);vote.visible=false;row[9]=JSON.stringify(vote);m.ctx.invalidate_('community');r=m.ctx.readPublicPoll(0,global.token);assert.equal(r.first.total,1);assert.equal(r.first.reasons.length,0);
});
test('4課題を一括取得し、自由な課題・考え直しと理由空欄を保存する',()=>{
 const m=mock(),j=m.ctx.joinPoll('TESTCODE','browser-one');assert.equal(j.snapshot.topics.length,4);
 for(const topic of [3,0,2,1])for(const round of [1,2]){const p={...payload(),topic,round,reason:''};const v=m.ctx.votePoll('lesson',p,j.token);assert.equal(v.session.topic,topic);assert.equal(v.mine[round===2?'second':'first'].reason,'');}
 const v=m.ctx.readPoll('lesson',j.token,3,2);assert.equal(v.first.total,1);assert.equal(v.second.total,1);assert.equal(v.second.reasons.length,0);assert.equal(m.ctx.loadLesson_(m.ctx.tables_(),'lesson').topic,0);
});
test('集計のキャッシュを共有し、保存後は新しい結果へ更新する',()=>{
 const m=mock(),a=m.ctx.joinPoll('TESTCODE','browser-a'),b=m.ctx.joinPoll('TESTCODE','browser-b');m.ctx.votePoll('lesson',payload(),a.token);
 m.ctx.readPoll('lesson',a.token,0,1);const reads=m.reads();m.ctx.readPoll('lesson',a.token,0,1);assert.equal(m.reads(),reads);
 const hidden=m.ctx.readPoll('lesson',b.token,0,1);assert.equal(hidden.first,null);assert.equal(hidden.topics[0].first,null);
 m.ctx.votePoll('lesson',{...payload(),reason:''},b.token);const next=m.ctx.readPoll('lesson',a.token,0,1);assert.equal(next.first.total,2);assert.equal(next.first.reasons.length,1);assert(m.reads()>reads);
});
test('全体の考え直しを保存し、全体キャッシュも更新する',()=>{
 const m=mock(),j=m.ctx.joinPublicPoll('visitor',2),p={...payload(),sessionId:'community',topic:2,reason:''};m.ctx.votePublicPoll(p,j.token);
 const initial=m.ctx.readPublicPoll(2,j.token,1);assert.equal(initial.first.total,1);const reads=m.reads();m.ctx.readPublicPoll(2,j.token,1);assert.equal(m.reads(),reads);
 m.ctx.votePublicPoll({...p,round:2,choice:0,requestId:randomUUID()},j.token);const after=m.ctx.readPublicPoll(2,j.token,2);assert.equal(after.first.total,1);assert.equal(after.second.total,1);assert.equal(after.mine.second.choice,0);
});
