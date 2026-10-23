/* Classroom store: durable per-request inbox, shared read cache, non-waiting batch writer.
 * Only underscore-suffixed helpers are added; student RPCs stay in Code.gs.
 * CacheService is acceleration ONLY. An acknowledged vote is always in ScriptProperties
 * or the spreadsheet. Cache loss must never lose a vote. */
function pollProperties_() {
  const p=PropertiesService.getScriptProperties();
  if(p.getProperty('SCRIPT_ID')!==ScriptApp.getScriptId())throw new Error('コピー後の初期設定が必要です。');
  return p;
}
function readStoreCache_() {
  const cache=cache_();if(!cache)return null;
  const raw=cache.get('poll:store:v2');if(!raw)return null;
  try {
    const m=JSON.parse(raw);let text='';
    for(let i=0;i<m.count;i++){const chunk=cache.get('poll:chunk:'+m.id+':'+i);if(chunk===null)return null;text+=chunk;}
    return JSON.parse(text);
  }catch(_){return null;}
}
function writeStoreCache_(store) {
  const cache=cache_();if(!cache)return;
  const text=JSON.stringify(store),id=Utilities.getUuid(),size=24000,count=Math.ceil(text.length/size);
  // A chunk stays below the 100KB/item limit even for Japanese reasons.
  // Publish the manifest last, so readers never see half of a cache update.
  if(count>200)return;
  for(let i=0;i<count;i++)cache.put('poll:chunk:'+id+':'+i,text.slice(i*size,(i+1)*size),45);
  cache.put('poll:store:v2',JSON.stringify({id,count}),20);
}
function loadStore_(t) {
  return {lessons:rows_(t.lessons),votes:rows_(t.votes),receipts:rows_(t.receipts)};
}
function readStore_() {
  pollProperties_();const cached=readStoreCache_();if(cached)return cached;
  const lock=LockService.getScriptLock();
  // Do not occupy an Apps Script execution slot while waiting for another student.
  if(!lock.tryLock(1))throw new Error('接続が集中しています。少し待って自動で再確認します。');
  try { const second=readStoreCache_();if(second)return second;const store=loadStore_(tables_());writeStoreCache_(store);return store; }
  finally { lock.releaseLock(); }
}
function inbox_(properties) {
  const all=(properties||pollProperties_()).getProperties();
  return Object.keys(all).filter(k=>k.indexOf('poll:q:')===0).map(key=>({key,...JSON.parse(all[key])})).sort((a,b)=>a.vote.at.localeCompare(b.vote.at)||a.vote.requestId.localeCompare(b.vote.requestId));
}
function storeVotes_(store,queue) {
  const votes=new Map(),excluded=new Set();
  store.votes.forEach(r=>{if(!r[9])return;const v={...JSON.parse(r[9]),scope:r[0]};if(r[10]===false)excluded.add(v.id);else votes.set(v.id,v);});
  queue.forEach(q=>{
    const v=q.vote,old=votes.get(v.id);if(excluded.has(v.id))return;
    // A delayed/replayed request cannot replace a more recent correction.
    if(old&&(old.at>v.at||(old.at===v.at&&old.requestId>=v.requestId)))return;
    votes.set(v.id,{...v,visible:old?old.visible:v.visible,scope:q.sessionId});
  });
  return [...votes.values()];
}
function sessionFromStore_(store,queue,id) {
  const row=store.lessons.find(r=>r[0]===id);if(!row)throw new Error('授業が見つかりません。');
  const s=JSON.parse(row[8]);s.votes=storeVotes_(store,queue).filter(v=>v.scope===id);
  s.requests=store.receipts.filter(r=>r[0]===id).map(r=>({id:r[1],signature:r[2]}));
  queue.filter(q=>q.sessionId===id).forEach(q=>s.requests.push({id:q.vote.requestId,signature:q.vote.signature}));return s;
}
function fastView_(store,queue,id,participant,topic,round,resultsOnly) {
  const all=storeVotes_(store,queue),testing=new Set(store.lessons.filter(r=>r[8]&&JSON.parse(r[8]).testing===true).map(r=>r[0]));
  const votes=all.filter(v=>!testing.has(v.scope)),now=new Date().toISOString();let make;
  if(id==='community')make=(i,r)=>PollCore.publicSnapshot(votes,participant,i,now,r,resultsOnly);
  else {const s=sessionFromStore_(store,queue,id);make=(i,r)=>PollCore.withAllResults(resultsOnly?PollCore.resultsSnapshot(s,i,r,now):PollCore.learnerSnapshot(s,participant,i,r,now),votes);}
  const view=make(topic===undefined?0:topic,round===undefined?1:round);
  view.topics=[0,1,2,3].map(i=>make(i,1));view.transportVersion=2;return view;
}
function queueVote_(id,input,participant) {
  const p=pollProperties_(),store=readStore_(),queue=inbox_(p),s=sessionFromStore_(store,queue,id);
  const before=s.requests.length,now=new Date().toISOString();
  if(id==='community')PollCore.submitPublicVote(s,participant,input,now,Utilities.getUuid());
  else PollCore.submitLearnerVote(s,participant,input,now,Utilities.getUuid());
  if(s.requests.length>before){
    const vote=s.votes.find(v=>v.requestId===input.requestId);
    // Keep corrections strictly ordered even when two arrive in the same millisecond.
    const prior=storeVotes_(store,queue).find(v=>v.id===vote.id);
    if(prior&&vote.at<=prior.at)vote.at=new Date(new Date(prior.at).getTime()+1).toISOString();
    const entry={sessionId:id,vote},key='poll:q:'+sign_(id+':'+input.requestId),value=JSON.stringify(entry);
    // Leave headroom under the 500KB script-property limit. A full queue rejects
    // BEFORE acknowledgment; the browser retains and retries the same request.
    const bytes=queue.reduce((n,q)=>n+Utilities.newBlob(JSON.stringify(q)).getBytes().length,0);
    if(bytes+Utilities.newBlob(value).getBytes().length>300000){maybeFlushInbox_();throw new Error('保存が集中しています。少し待って同じ投票を再送してください。');}
    p.setProperty(key,value);queue.push({key,...entry});
  }
  // Acknowledgment and own result do not wait for a sheet lock or full-sheet scan.
  return fastView_(store,queue,id,participant,input.topic,input.round);
}
function voteCells_(id,v) {
  return [id,v.id,PollContent.topics[v.topic].title,v.condition,v.round,PollContent.choices[v.choice],textCell_(v.reason),v.visible,v.at,JSON.stringify(v),true];
}
function writeRowsTogether_(sheet,changes) {
  const list=[...changes].sort((a,b)=>a.row-b.row);let group=[];
  const send=()=>{if(group.length)sheet.getRange(group[0].row,1,group.length,group[0].data.length).setValues(group.map(x=>x.data));group=[];};
  list.forEach(x=>{if(group.length&&x.row!==group[group.length-1].row+1)send();group.push(x);});send();
}
function flushInboxLocked_(force) {
  const p=pollProperties_(),now=Date.now();
  if(!force&&now-Number(p.getProperty('POLL_LAST_BATCH')||0)<6000)return 0;
  const queue=inbox_(p);if(!queue.length)return 0;
  const t=tables_(),store=loadStore_(t),votes=storeVotes_(store,queue),byId=new Map(votes.map(v=>[v.id,v]));
  const positions=new Map(store.votes.map((r,i)=>[r[1],i+2])),changes=new Map();let next=t.votes.getLastRow()+1;
  const receipts=new Map(store.receipts.map(r=>[r[0]+':'+r[1],r[2]])),newReceipts=[];
  queue.forEach(q=>{
    const receiptKey=q.sessionId+':'+q.vote.requestId;
    if(receipts.has(receiptKey)){if(receipts.get(receiptKey)!==q.vote.signature)throw new Error('送信記録を確認してください。');return;}
    const v=byId.get(q.vote.id);
    if(v){const row=positions.get(v.id)||next++;positions.set(v.id,row);changes.set(v.id,{row,data:voteCells_(q.sessionId,v)});}
    receipts.set(receiptKey,q.vote.signature);newReceipts.push([q.sessionId,q.vote.requestId,q.vote.signature]);
  });
  writeRowsTogether_(t.votes,[...changes.values()]);
  if(newReceipts.length)t.receipts.getRange(t.receipts.getLastRow()+1,1,newReceipts.length,3).setValues(newReceipts);
  SpreadsheetApp.flush();
  // Re-read only after successful persistence; queue deletion is last. If either
  // write fails, a subsequent batch recovers without duplicating or reverting votes.
  const persisted=loadStore_(t);writeStoreCache_(persisted);
  queue.forEach(q=>p.deleteProperty(q.key));p.setProperty('POLL_LAST_BATCH',String(now));return queue.length;
}
function maybeFlushInbox_() {
  const p=pollProperties_();if(Date.now()-Number(p.getProperty('POLL_LAST_BATCH')||0)<6000)return;
  const lock=LockService.getScriptLock();if(!lock.tryLock(1))return;
  try {flushInboxLocked_(false);}catch(e){console.warn('投票は受信箱に保存済み。次の集計時にシート反映を再試行します：'+e.message);}
  finally {lock.releaseLock();}
}
function flushPendingVotes_() {
  const n=withLock_(()=>flushInboxLocked_(true));
  SpreadsheetApp.getUi().alert('保存待ちの回答をシートへ反映しました（'+n+'件）。');
}
function readFastPoll_(id,participant,topic,round) {
  maybeFlushInbox_();const store=readStore_();return fastView_(store,inbox_(),id,participant,topic,round);
}
function prepareClassroomTest_() {
  const ui=SpreadsheetApp.getUi(),answer=ui.prompt('確認する投票URL','教材のconfig.jsonに設定した、末尾が /exec のURLを入力してください。複数のデプロイがある場合も、授業で使っている公開先を確認します。',ui.ButtonSet.OK_CANCEL);
  if(answer.getSelectedButton()!==ui.Button.OK)return;
  const url=answer.getResponseText().trim();if(!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(url))throw new Error('投票URLを確認してください。');
  pollProperties_().setProperty('POLL_TEST_URL',url);
  const info=withLock_(()=>{
    flushInboxLocked_(true);const t=tables_(),sessions=rows_(t.lessons),used=sessions.filter(r=>r[6]===true).map(r=>String(r[2]));
    const code=Array.from({length:10000},(_,i)=>String(9999-i).padStart(4,'0')).find(c=>!used.includes(c));
    const s=PollCore.newSession('loadtest-'+Utilities.getUuid(),'40人同時利用の確認 '+new Date().toISOString(),code,new Date().toISOString());s.testing=true;writeLesson_(t,s);
    const key=Utilities.getUuid(),p=pollProperties_();p.setProperty('POLL_TEST_KEY',key);p.setProperty('POLL_TEST_CODE',code);p.setProperty('POLL_TEST_ID',s.id);
    return {code,key};
  });
  const testUrl=url+'?loadTest='+info.key;
  console.log('負荷確認URL：'+testUrl);ui.alert('40人同時利用の確認',testUrl,ui.ButtonSet.OK);
}
function finishClassroomTest_() {
  withLock_(()=>{flushInboxLocked_(true);const t=tables_(),id=pollProperties_().getProperty('POLL_TEST_ID');if(!id)return;const s=loadLesson_(t,id);s.active=false;writeLesson_(t,s,s._row);pollProperties_().deleteProperty('POLL_TEST_KEY');});
  console.log('確認用の授業を終了しました。授業の実回答は変更していません。');
}
