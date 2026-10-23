/* Bound spreadsheet application. Student endpoints are the class and public join/read/vote functions plus doGet. Teacher helpers end in _. */
function onOpen() {
  if(PropertiesService.getScriptProperties().getProperty('SCRIPT_ID')===ScriptApp.getScriptId())maybeFlushInbox_();
  SpreadsheetApp.getUi().createMenu('授業投票')
    .addItem('保存先を初期設定（コピー後も実行）', 'setup_')
    .addItem('新しい授業を作る', 'newLesson_')
    .addItem('一括登録用シートを開く', 'openRegistration_')
    .addItem('入力した授業を一括登録', 'registerFromSheet_')
    .addItem('保存待ちの回答をシートへ反映', 'flushPendingVotes_')
    .addItem('40人同時利用の確認画面を作る', 'prepareClassroomTest_')
    .addItem('確認用の授業を終了する', 'finishClassroomTest_')
    .addItem('テストデータを退避して削除', 'archiveTestData_')
    .addSeparator().addItem('授業の受付・閲覧を終了', 'finishLesson_')
    .addSeparator().addItem('選択した回答の理由を非表示', 'hideReason_')
    .addItem('選択した回答の理由を再公開', 'showReason_')
    .addItem('選択した回答を集計から除外（記録は残す）', 'excludeVote_')
    .addItem('投票URLを表示', 'showUrl_').addToUi();
}
function tables_() {
  if (PropertiesService.getScriptProperties().getProperty('SCRIPT_ID') !== ScriptApp.getScriptId()) throw new Error('コピー後の初期設定が必要です。シートの「授業投票」メニューから実行してください。');
  const id = PropertiesService.getScriptProperties().getProperty('BOUND_ID');
  const ss = SpreadsheetApp.getActiveSpreadsheet() || (id ? SpreadsheetApp.openById(id) : null);
  if (!ss) throw new Error('保存先がありません。コピーしたシートから初期設定してください。');
  if (PropertiesService.getScriptProperties().getProperty('BOUND_ID') !== ss.getId()) throw new Error('コピー後の初期設定が必要です。シートの「授業投票」メニューから実行してください。');
  return { ss, lessons: ss.getSheetByName('授業'), votes: ss.getSheetByName('回答'), receipts: ss.getSheetByName('送信記録') };
}
function rows_(sheet) { return sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues() : []; }
function cache_() { return typeof CacheService === 'undefined' ? null : CacheService.getScriptCache(); }
function cacheRead_(key) { const cache=cache_(),value=cache&&cache.get(key);if(!value)return null;try{return JSON.parse(value);}catch(_){return null;} }
function cacheWrite_(key,value) { const cache=cache_(),text=JSON.stringify(value);if(cache&&Utilities.newBlob(text).getBytes().length<95000)cache.put(key,text,3); }
function invalidate_(id) { const cache=cache_();if(cache)cache.removeAll(['poll:lesson:'+id,'poll:all','poll:store:v2']); }
function textCell_(s) { return /^[=+\-@]/.test(String(s)) ? "'" + s : String(s); }
function withLock_(fn) { const lock = LockService.getScriptLock(); lock.waitLock(20000); try { return fn(); } finally { lock.releaseLock(); } }
function setup_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet(), p = PropertiesService.getScriptProperties();
  const changed = p.getProperty('BOUND_ID') !== ss.getId();
  const headers = { '授業': ['授業ID','授業名','授業コード','課題番号','条件','進行','受付・閲覧','作成日時','内部データ'], '回答': ['授業ID','回答ID','課題','条件','投票回','方法','理由','理由公開','保存日時','内部データ','集計対象'], '送信記録': ['授業ID','送信ID','確認データ'] };
  Object.keys(headers).forEach(name => {
    const sh = ss.getSheetByName(name) || ss.insertSheet(name);
    if (!sh.getLastRow()) sh.appendRow(headers[name]);
    sh.setFrozenRows(1); sh.getRange(1,1,1,headers[name].length).setBackground('#247b7e').setFontColor('#ffffff').setFontWeight('bold');
    sh.setColumnWidths(1,headers[name].length,130); sh.getDataRange().setVerticalAlignment('top');
    if (name === '回答') { sh.setColumnWidth(7,450); sh.getRange('G:G').setWrap(true); sh.hideColumns(10); }
    if (name === '授業') { sh.setColumnWidth(2,230); sh.hideColumns(9); }
  });
  if (changed) {
    p.setProperties({ BOUND_ID: ss.getId(), SECRET: Utilities.getUuid() + Utilities.getUuid() });
    // Copies must never keep another class's old codes active. Preserve all old records.
    const t = { ss, lessons:ss.getSheetByName('授業') };
    rows_(t.lessons).forEach((r,i) => { if(r[8]) { const s=JSON.parse(r[8]);s.active=false;writeLesson_(t,s,i+2); } });
    p.deleteProperty('CURRENT_LESSON');
  }
  p.setProperty('SCRIPT_ID',ScriptApp.getScriptId());
  ss.getSheetByName('送信記録').hideSheet(); onOpen();
  SpreadsheetApp.getUi().alert('保存先を設定しました。新しい授業を作り、授業コードを案内してください。');
}
function lessonRow_(s) {
  const meta = Object.assign({},s);delete meta.votes;delete meta.requests;delete meta._row;delete meta._voteRows;
  return [s.id,textCell_(s.title),s.code,s.topic+1,s.condition,s.phase,s.active,s.createdAt,JSON.stringify(meta)];
}
function writeLesson_(t,s,row) {
  const data = lessonRow_(s);
  const target = row || t.lessons.getLastRow() + 1;
  // Keep leading zeroes in a code such as 0123; never treat codes as numbers.
  t.lessons.getRange(target,2,1,2).setNumberFormat('@');
  if(row)t.lessons.getRange(row,1,1,9).setValues([data]);else t.lessons.appendRow(data);
  invalidate_(s.id);
}
function loadLesson_(t,id,includeRequests) {
  const rs = rows_(t.lessons), i = rs.findIndex(r=>r[0]===id);if(i<0)throw new Error('授業が見つかりません。');
  const s=JSON.parse(rs[i][8]);s._row=i+2;
  s._voteRows={};s.votes=rows_(t.votes).map((r,i)=>({r,row:i+2})).filter(x=>x.r[0]===id&&x.r[10]!==false).map(x=>{const v=JSON.parse(x.r[9]);s._voteRows[v.id]=x.row;return v;});
  s.requests=includeRequests ? rows_(t.receipts).filter(r=>r[0]===id).map(r=>({id:r[1],signature:r[2]})) : [];return s;
}
function lessonForRead_(id) { const key='poll:lesson:'+id,cached=cacheRead_(key);if(cached)return cached;const s=loadLesson_(tables_(),id,false);cacheWrite_(key,s);return s; }
function classView_(s,participant,topic,round) {
  const now=new Date().toISOString(),votes=s.votes.some(v=>v.participant===participant)?publicVotes_():[];
  const make=(i,r)=>PollCore.withAllResults(PollCore.learnerSnapshot(s,participant,i,r,now),votes);
  const topics=[0,1,2,3].map(i=>make(i,1));
  const view=make(topic===undefined?0:topic,round===undefined?1:round);view.topics=topics;return view;
}
function writeVote_(t,s,v,excluded) {
  const row=s._voteRows&&s._voteRows[v.id];
  const data=[s.id,v.id,PollContent.topics[v.topic].title,v.condition,v.round,PollContent.choices[v.choice],textCell_(v.reason),v.visible,v.at,JSON.stringify(v),!excluded];
  if(!row)t.votes.appendRow(data);else t.votes.getRange(row,1,1,11).setValues([data]);
  invalidate_(s.id);
}
function sign_(value) { return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(value,PropertiesService.getScriptProperties().getProperty('SECRET'))).replace(/=+$/,''); }
function token_(s,participant,role) { const raw=Utilities.base64EncodeWebSafe(JSON.stringify({sessionId:s.id,participant,role:role||'voter'})).replace(/=+$/,'');return raw+'.'+sign_(raw); }
function identity_(id,token,role) {
  if(typeof token!=='string'||token.length>1500)throw new Error('授業へ参加し直してください。');
  const parts=token.split('.');const expected=sign_(parts[0]);let difference=expected.length^(parts[1]||'').length;
  for(let i=0;i<expected.length;i++)difference|=expected.charCodeAt(i)^((parts[1]||'').charCodeAt(i)||0);
  if(parts.length!==2||difference)throw new Error('授業へ参加し直してください。');
  const value=JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString());
  if(value.sessionId!==id)throw new Error('授業コードを確認してください。');
  if((value.role||'voter')!==(role||'voter'))throw new Error('閲覧専用の画面からは投票できません。参加方法を変えてください。');return value.participant;
}
function joinResults(code,topic) {
  code=String(code||'').trim();if(code&&!/^\d{4}$/.test(code))throw new Error('授業コードは4桁の数字で入力してください。');
  maybeFlushInbox_();const store=readStore_();let id='community';
  if(code){const rows=store.lessons.filter(r=>String(r[2])===code);const row=rows.find(r=>r[6]===true)||rows[rows.length-1];if(!row)throw new Error('授業コードを確認してください。');id=row[0];}
  return {token:token_({id},null,'viewer'),snapshot:fastView_(store,inbox_(),id,null,topic,1,true)};
}
function readResults(id,token,topic,round) {
  identity_(id,token,'viewer');maybeFlushInbox_();return fastView_(readStore_(),inbox_(),id,null,topic,round,true);
}
function joinPoll(code,browserKey) {
  code=PollCore.validText(code,16,'授業コード').toUpperCase();browserKey=PollCore.validText(browserKey,100,'参加の情報');
  const store=readStore_(),row=store.lessons.find(r=>String(r[2])===code&&r[6]===true);if(!row)throw new Error('受付中の授業コードを確認してください。');
  const id=row[0],participant=sign_(id+':'+browserKey);
  return {token:token_({id},participant),snapshot:fastView_(store,inbox_(),id,participant,0,1)};
}
function readPoll(id,token,topic,round) { return readFastPoll_(id,identity_(id,token),topic,round); }
function votePoll(id,input,token) {
  return queueVote_(id,input,identity_(id,token));
}
function communityLesson_(t) {
  const row = rows_(t.lessons).find(r => r[0] === 'community');
  if (row) return loadLesson_(t,'community');
  const s = PollCore.newSession('community','全体投票（コードなし）','',new Date().toISOString());
  writeLesson_(t,s);return s;
}
function publicVotes_(t,fresh) {
  const cached=!fresh&&cacheRead_('poll:all');if(cached)return cached;
  const votes=rows_((t||tables_()).votes).filter(r=>r[10]!==false&&r[9]).map(r=>Object.assign({},JSON.parse(r[9]),{scope:r[0]}));cacheWrite_('poll:all',votes);return votes;
}
function publicView_(t,participant,topic,round,fresh) {
  const votes=publicVotes_(t,fresh),now=new Date().toISOString(),view=PollCore.publicSnapshot(votes,participant,topic,now,round===undefined?1:round);
  view.topics=[0,1,2,3].map(i=>PollCore.publicSnapshot(votes,participant,i,now));return view;
}
function joinPublicPoll(browserKey,topic) {
  browserKey = PollCore.validText(browserKey,100,'参加の情報');
  let store=readStore_();if(!store.lessons.some(r=>r[0]==='community')){withLock_(()=>communityLesson_(tables_()));store=readStore_();}
  const participant=sign_('community:'+browserKey);return {token:token_({id:'community'},participant),snapshot:fastView_(store,inbox_(),'community',participant,topic)};
}
function readPublicPoll(topic,token,round) { return readFastPoll_('community',identity_('community',token),topic,round); }
function votePublicPoll(input,token) {
  return queueVote_('community',input,identity_('community',token));
}
function doGet(e) {
  const p=(e&&e.parameter)||{},channel=/^[a-f0-9-]{36}$/.test(p.channel||'')?p.channel:'';
  if(p.loadTest&&p.loadTest===pollProperties_().getProperty('POLL_TEST_KEY')){
    const test=HtmlService.createTemplateFromFile('LoadTest');test.config=JSON.stringify({key:p.loadTest,code:pollProperties_().getProperty('POLL_TEST_CODE'),url:pollProperties_().getProperty('POLL_TEST_URL')||ScriptApp.getService().getUrl(),worker:/^[0-3]$/.test(p.worker||'')?Number(p.worker):null,runAt:Number(p.runAt)||0});
    return test.evaluate().setTitle('40人同時利用の確認').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  const template=HtmlService.createTemplateFromFile('Index');
  const origin=/^https:\/\/[a-z0-9-]+\.github\.io$/.test(p.parentOrigin||'')||/^http:\/\/127\.0\.0\.1:\d+$/.test(p.parentOrigin||'')||/^http:\/\/localhost:\d+$/.test(p.parentOrigin||'')?p.parentOrigin:'';
  template.embed=JSON.stringify({channel,parentOrigin:origin});
  return template.evaluate().setTitle('伝え方の投票・理由共有').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function currentLesson_(t) {
  const range=t.ss.getActiveRange();let id;
  if(range&&range.getSheet().getName()==='授業'&&range.getRow()>1)id=t.lessons.getRange(range.getRow(),1).getValue();
  id=id||PropertiesService.getScriptProperties().getProperty('CURRENT_LESSON');if(!id)throw new Error('「授業」シートの授業行を選んでください。');return loadLesson_(t,id);
}
function newLesson_() {
  const ui=SpreadsheetApp.getUi(),r=ui.prompt('新しい授業','授業名（クラス名など、60字以内）',ui.ButtonSet.OK_CANCEL);if(r.getSelectedButton()!==ui.Button.OK)return;
  const title=PollCore.validText(r.getResponseText(),60,'授業名');
  const codeInput=ui.prompt('授業コードを指定','生徒に案内する4桁の数字（例：0123、1001）',ui.ButtonSet.OK_CANCEL);if(codeInput.getSelectedButton()!==ui.Button.OK)return;
  const s=withLock_(()=>{const t=tables_(),code=PollCore.validCode(codeInput.getResponseText(),rows_(t.lessons).map(r=>({code:r[2],active:r[6]===true})));const s=PollCore.newSession(Utilities.getUuid(),title,code,new Date().toISOString());writeLesson_(t,s);PropertiesService.getScriptProperties().setProperty('CURRENT_LESSON',s.id);t.ss.setActiveSheet(t.lessons);return s;});
  ui.alert('授業を作りました','授業コード：'+s.code+'\n生徒は投票画面で入力します。',ui.ButtonSet.OK);
}
function openRegistration_() {
  const t=tables_(),sh=t.ss.getSheetByName('授業登録')||t.ss.insertSheet('授業登録');
  if(!sh.getLastRow()){
    sh.getRange(1,1,1,4).setValues([['授業コード（4桁）','授業名','登録結果','授業コードを授業名にする']]);
    sh.getRange('A:B').setNumberFormat('@');sh.getRange('D2').insertCheckboxes().setValue(false);
    sh.getRange('D2').setNote('チェックすると、全ての入力行で授業コードを授業名として登録します。授業名の列は空欄で構いません。');
    sh.getRange('A1').setNote('2行目から4桁のコードと授業名を入力し、授業投票メニューの「入力した授業を一括登録」を選びます。');
    sh.setFrozenRows(1);sh.getRange(1,1,1,4).setBackground('#247b7e').setFontColor('#ffffff').setFontWeight('bold');
    sh.setColumnWidth(1,160);sh.setColumnWidth(2,240);sh.setColumnWidth(3,430);sh.setColumnWidth(4,280);sh.getRange('C:C').setWrap(true);
  }
  t.ss.setActiveSheet(sh);
}
function registerLessons_(entries,useCodeAsTitle) {
  if(!Array.isArray(entries)||entries.length>100)throw new Error('一度に登録する授業は100件以内にしてください。');
  return withLock_(()=>{
    const t=tables_(),existing=rows_(t.lessons).filter(r=>r[0]&&r[8]).map(r=>({id:r[0],title:JSON.parse(r[8]).title,code:String(r[2]),active:r[6]===true})),created=[];
    const results=entries.map(entry=>{
      if(!String(entry.code||'').trim()&&!String(entry.title||'').trim())return '';
      try{
        const code=PollCore.validCode(String(entry.code||'').trim(),[]),title=useCodeAsTitle?code:PollCore.validText(String(entry.title||''),60,'授業名');
        const current=existing.find(s=>s.active&&s.code===code);
        if(current){if(current.title===title)return '登録済み（既存の授業を使用）';throw new Error('このコードは受付中の別の授業名で使用されています。');}
        const s=PollCore.newSession(Utilities.getUuid(),title,code,new Date().toISOString());created.push(s);existing.push(s);return '登録しました';
      }catch(e){return 'エラー：'+e.message;}
    });
    if(created.length){const start=t.lessons.getLastRow()+1;t.lessons.getRange(start,2,created.length,2).setNumberFormat('@');t.lessons.getRange(start,1,created.length,9).setValues(created.map(lessonRow_));PropertiesService.getScriptProperties().setProperty('CURRENT_LESSON',created[created.length-1].id);SpreadsheetApp.flush();}
    return {results,created:created.length,existing:results.filter(r=>r.indexOf('登録済み')===0).length,errors:results.filter(r=>r.indexOf('エラー')===0).length};
  });
}
function registerFromSheet_() {
  const t=tables_(),sh=t.ss.getSheetByName('授業登録');if(!sh){openRegistration_();SpreadsheetApp.getUi().alert('「授業登録」のA列に4桁コード、B列に授業名を入力してください。入力後にもう一度「入力した授業を一括登録」を選びます。');return;}
  const rows=sh.getLastRow()>1?sh.getRange(2,1,sh.getLastRow()-1,2).getDisplayValues():[];
  while(rows.length&&!rows[rows.length-1][0].trim()&&!rows[rows.length-1][1].trim())rows.pop();
  if(!rows.length){SpreadsheetApp.getUi().alert('A列に登録する4桁コードを入力してください。');return;}
  const result=registerLessons_(rows.map(r=>({code:r[0],title:r[1]})),sh.getRange('D2').getValue()===true);
  sh.getRange(2,3,result.results.length,1).setValues(result.results.map(r=>[r]));t.ss.setActiveSheet(sh);
  SpreadsheetApp.getUi().alert('一括登録しました','新規：'+result.created+'件 ／ 登録済み：'+result.existing+'件 ／ エラー：'+result.errors+'件\n各行の「登録結果」を確認してください。',SpreadsheetApp.getUi().ButtonSet.OK);
}
function act_(action,value) { withLock_(()=>{flushInboxLocked_(true);const t=tables_(),s=currentLesson_(t);PollCore.manage(s,action,value===undefined&&action==='topic'?s.topic+1:value);writeLesson_(t,s,s._row);SpreadsheetApp.flush();invalidate_(s.id);}); }
function discussion_(){act_('phase','discussion');}function reconsider_(){act_('phase','reconsider');}function closeTopic_(){act_('phase','closed');}function nextTopic_(){act_('topic');}function extra_(){act_('extra');}function finishLesson_(){act_('finish');}
function reasonAction_(action){withLock_(()=>{flushInboxLocked_(true);const t=tables_(),r=t.ss.getActiveRange();if(!r||r.getSheet().getName()!=='回答'||r.getRow()<2)throw new Error('「回答」シートの回答行を選んでください。');const values=t.votes.getRange(r.getRow(),1,1,11).getValues()[0],s=loadLesson_(t,values[0]),v=s.votes.find(v=>v.id===values[1]);if(!v)throw new Error('集計対象の回答を選んでください。');PollCore.manage(s,action,v.id);writeVote_(t,s,v,action==='exclude');SpreadsheetApp.flush();invalidate_(s.id);});}
function hideReason_(){reasonAction_('hide');}function showReason_(){reasonAction_('show');}function excludeVote_(){reasonAction_('exclude');}
function showUrl_(){SpreadsheetApp.getUi().alert('投票URL',ScriptApp.getService().getUrl()||'先に「ウェブアプリ」としてデプロイしてください。',SpreadsheetApp.getUi().ButtonSet.OK);}

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

/* Owner-only cleanup. Match identified test IDs, never class names/numeric codes. */
function testLessonIds_(lessons) {
  const legacy=new Set(['88597275-40fe-4f73-92e6-76b36e512057','6146b3a8-c7f9-4fa7-84ce-5873ce58b6db','e7c09133-9906-4a74-bc1d-0f7b8358565b','7e64abdd-11e4-480a-bc2a-f51b2f8553cc','495ac8b2-def6-49b5-b356-997b965d5b4e','1f98b2e3-02b7-4b0d-b26c-152cf3e55361','39658367-3154-4242-9615-f7b8a04af5a1','fea13b04-3a51-454e-bab4-b0ed21fa82fb']);
  const ids=new Set();lessons.forEach(r=>{const meta=r[8]?JSON.parse(r[8]):{},id=r[0]||meta.id;if(id&&(legacy.has(id)||meta.testing===true||/^loadtest-/.test(id)))ids.add(id);});return ids;
}
function testCleanupPlan_(store) {
  const ids=testLessonIds_(store.lessons),pick=(rows,meta)=>rows.map((data,i)=>({row:i+2,data})).filter(x=>ids.has(x.data[0]||(meta&&x.data[8]?JSON.parse(x.data[8]).id:'')));
  return {ids:[...ids],lessons:pick(store.lessons,true),votes:pick(store.votes,false),receipts:pick(store.receipts,false)};
}
function archiveTestData_() {
  const result=withLock_(()=>{
    flushInboxLocked_(true);const t=tables_(),plan=testCleanupPlan_(loadStore_(t));
    if(!plan.ids.length)return {lessons:0,votes:0,receipts:0,backups:[]};
    const suffix=new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14),backups=[];
    // All backups must be written and verified BEFORE deleting any source rows.
    ['lessons','votes','receipts'].forEach(key=>{
      const entries=plan[key];if(!entries.length)return;const source=t[key],width=source.getLastColumn(),name='退避_'+suffix+'_'+source.getName(),sh=t.ss.insertSheet(name);
      // Sheets may coerce booleans/numbers when formatting copied cells. Keep an
      // exact JSON row alongside the readable columns and verify that copy.
      const originals=entries.map(x=>JSON.stringify(x.data)),data=[[...source.getRange(1,1,1,width).getValues()[0],'元データ（復元用JSON）'],...entries.map((x,i)=>[...x.data,originals[i]])];
      sh.getRange(1,1,data.length,width+1).setNumberFormat('@');sh.getRange(1,1,data.length,width+1).setValues(data);
      SpreadsheetApp.flush();if(JSON.stringify(sh.getRange(2,width+1,originals.length,1).getValues().map(r=>r[0]))!==JSON.stringify(originals))throw new Error('退避の確認ができなかったため削除しませんでした。');
      sh.setFrozenRows(1);backups.push(name);
    });
    ['receipts','votes','lessons'].forEach(key=>{
      const rows=plan[key].map(x=>x.row).sort((a,b)=>b-a);let start=null,count=0;
      const remove=()=>{if(count)t[key].deleteRows(start,count);};
      rows.forEach(row=>{if(start!==null&&row===start-1){start=row;count++;}else{remove();start=row;count=1;}});remove();
    });
    const p=pollProperties_();if(plan.ids.includes(p.getProperty('POLL_TEST_ID'))){['POLL_TEST_ID','POLL_TEST_KEY','POLL_TEST_CODE'].forEach(k=>p.deleteProperty(k));}
    if(plan.ids.includes(p.getProperty('CURRENT_LESSON')))p.deleteProperty('CURRENT_LESSON');
    SpreadsheetApp.flush();invalidate_('community');
    return {lessons:plan.lessons.length,votes:plan.votes.length,receipts:plan.receipts.length,backups};
  });
  console.log(JSON.stringify(result));SpreadsheetApp.getUi().alert('テストデータの整理','授業：'+result.lessons+'件 ／ 回答：'+result.votes+'件 ／ 送信記録：'+result.receipts+'件\n元データは「退避_」で始まるシートに保存しています。実際の授業・全体投票の回答は変更しません。',SpreadsheetApp.getUi().ButtonSet.OK);
}

var PollCore = (function(){
/* Pure shared server rules: no browser, spreadsheet or account dependencies. */
function pollError(message) { throw new Error(message); }
function validText(value, max, label) {
  if (typeof value !== 'string' || !value.trim() || [...value.trim()].length > max) pollError(label + 'を確認してください。');
  return value.trim();
}
function validReason(value) {
  if (typeof value !== 'string' || [...value.trim()].length > 200) pollError('理由は200字以内で入力してください。');
  return value.trim();
}
function newSession(id, title, code, now) {
  return { id, title, code, createdAt: now, active: true, topic: 0, condition: 'base', phase: 'initial', votes: [], requests: [] };
}
function roundFor(session) { return session.phase === 'reconsider' ? 2 : 1; }
function topicKey(session) { return session.topic + ':' + session.condition; }
function assertActive(session) { if (!session || !session.active) pollError('この授業の受付・閲覧は終了しました。'); }
function matchingVotes(session, round) { return session.votes.filter(v => v.topic === session.topic && v.condition === session.condition && v.round === round); }
function snapshot(session, participant, now, teacher) {
  assertActive(session);
  const first = matchingVotes(session, 1), second = matchingVotes(session, 2);
  const mine = { first: first.find(v => v.participant === participant) || null, second: second.find(v => v.participant === participant) || null };
  const visible = Boolean(teacher || mine.first || mine.second || ['discussion', 'closed'].includes(session.phase));
  const group = votes => ({ total: votes.length, counts: [0, 1, 2, 3].map(c => votes.filter(v => v.choice === c).length), reasons: votes.filter(v => v.visible && v.reason).map(v => ({ id: v.id, choice: v.choice, reason: v.reason, at: v.at })) });
  const own = vote => vote ? { id: vote.id, choice: vote.choice, reason: vote.reason, at: vote.at } : null;
  return { session: { id: session.id, title: session.title, topic: session.topic, condition: session.condition, phase: session.phase }, now, visible, mine: { first: own(mine.first), second: own(mine.second) }, first: visible ? group(first) : null, second: visible ? group(second) : null };
}
function submitVote(session, participant, input, now, id) {
  assertActive(session);
  if (!participant) pollError('授業へ参加し直してください。');
  const requestId = validText(input.requestId, 100, '送信番号');
  const reason = validReason(input.reason);
  if (!Number.isInteger(input.choice) || input.choice < 0 || input.choice > 3) pollError('伝え方を一つ選んでください。');
  const signature = JSON.stringify([participant, input.sessionId, input.topic, input.condition, input.round, input.choice, reason]);
  const old = session.requests.find(r => r.id === requestId) || session.votes.find(v => v.requestId === requestId);
  if (old) { if (old.signature !== signature) pollError('同じ送信番号で異なる内容は送れません。'); return snapshot(session, participant, now, false); }
  if (input.sessionId !== session.id || input.topic !== session.topic || input.condition !== session.condition) pollError('課題が切り替わりました。最新の課題を確認してください。');
  if (!['initial', 'reconsider'].includes(session.phase) || input.round !== roundFor(session)) pollError('この回の投票受付は終了しました。');
  if (input.round === 2 && !matchingVotes(session, 1).some(v => v.participant === participant)) pollError('まず初回の投票に参加してください。');
  const existing = matchingVotes(session, input.round).find(v => v.participant === participant);
  const vote = { id: existing ? existing.id : id, participant, topic: session.topic, condition: session.condition, round: input.round, choice: input.choice, reason, at: now, visible: existing ? existing.visible : true, requestId, signature };
  if (existing) session.votes[session.votes.indexOf(existing)] = vote; else session.votes.push(vote);
  session.requests.push({ id: requestId, signature });
  return snapshot(session, participant, now, false);
}
function learnerView(session, topic, round) {
  assertActive(session);
  if (!Number.isInteger(topic) || topic < 0 || topic > 3 || ![1, 2].includes(round)) pollError('課題と投票回を確認してください。');
  // The student's topic and round never change another student's progress.
  return Object.assign({}, session, { topic, condition: 'base', phase: round === 2 ? 'reconsider' : 'initial' });
}
function learnerSnapshot(session, participant, topic, round, now) {
  return snapshot(learnerView(session, topic, round), participant, now, false);
}
function resultsSnapshot(session, topic, round, now) {
  // Viewing an ended class is allowed; it never reopens voting or creates a voter.
  return snapshot(learnerView({...session, active:true}, topic, round), null, now, true);
}
function submitLearnerVote(session, participant, input, now, id) {
  if (input.condition !== 'base') pollError('投票条件を確認してください。');
  return submitVote(learnerView(session, input.topic, input.round), participant, input, now, id);
}
function manage(session, action, value) {
  assertActive(session);
  if (action === 'phase') {
    const allowed = { initial: ['discussion'], discussion: ['reconsider', 'closed'], reconsider: ['closed'], closed: [] };
    if (!allowed[session.phase].includes(value)) pollError('受付状態の順序を確認してください。');
    session.phase = value;
  } else if (action === 'topic') {
    if (!Number.isInteger(value) || value < 0 || value > 3 || value <= session.topic) pollError('次の課題を選んでください。');
    session.topic = value; session.condition = 'base'; session.phase = 'initial';
  } else if (action === 'extra') {
    if (session.condition !== 'base') pollError('追加条件は既に設定されています。');
    session.condition = 'extra'; session.phase = 'initial';
  } else if (action === 'hide' || action === 'show' || action === 'exclude') {
    const v = session.votes.find(v => v.id === value); if (!v) pollError('回答を確認してください。');
    if (action === 'exclude') session.votes = session.votes.filter(vote => vote.id !== value); else v.visible = action === 'show';
  } else if (action === 'finish') session.active = false;
  else pollError('操作を確認してください。');
}
function validCode(value, sessions) {
  if (typeof value !== 'string' || !/^\d{4}$/.test(value.trim())) pollError('授業コードは4桁の数字で入力してください。');
  const code = value.trim();
  if (sessions.some(s => s.active && String(s.code) === code)) pollError('このコードは受付中の授業で使用されています。別の4桁を選んでください。');
  return code;
}
function withAllResults(view, votes) {
  // A class voter can compare the same topic globally without casting a second vote.
  // Unvoted topics retain the same privacy gate as the class result.
  const matching = votes.filter(v => v.topic === view.session.topic && v.condition === 'base');
  const group = round => { const list = matching.filter(v => v.round === round); return { total: list.length, counts: [0,1,2,3].map(c => list.filter(v => v.choice === c).length), reasons: list.filter(v => v.visible && v.reason).map(v => ({ id:v.id, choice:v.choice, reason:v.reason, at:v.at })) }; };
  return { ...view, all: view.visible ? { first:group(1), second:group(2) } : null };
}
function publicSnapshot(votes, participant, topic, now, round = 1, resultsOnly = false) {
  if (!Number.isInteger(topic) || topic < 0 || topic > 3) pollError('課題を選んでください。');
  const matching = votes.filter(v => v.topic === topic && v.condition === 'base');
  if (![1,2].includes(round)) pollError('投票回を確認してください。');
  const ownVotes = [1,2].map(r => matching.find(v => v.scope === 'community' && v.participant === participant && v.round === r));
  const visible = resultsOnly || Boolean(ownVotes[0]);
  const group = round => { const list = matching.filter(v => v.round === round); return { total: list.length, counts: [0,1,2,3].map(c => list.filter(v => v.choice === c).length), reasons: list.filter(v => v.visible && v.reason).map(v => ({ id: v.id, choice: v.choice, reason: v.reason, at: v.at })) }; };
  const own = vote => vote ? { id: vote.id, choice: vote.choice, reason: vote.reason, at: vote.at } : null;
  return { session: { id:'community', title:'全クラスの蓄積', topic, condition:'base', phase:round === 2 ? 'reconsider' : 'initial', scope:'all' }, now, visible, mine:{ first:own(ownVotes[0]), second:own(ownVotes[1]) }, first:visible ? group(1) : null, second:visible ? group(2) : null };
}
function submitPublicVote(session, participant, input, now, id) {
  if (input.sessionId !== 'community' || session.id !== 'community') pollError('全体投票の課題を確認してください。');
  return submitLearnerVote(session, participant, input, now, id);
}
const PollCore = { newSession, snapshot, submitVote, learnerSnapshot, resultsSnapshot, submitLearnerVote, manage, roundFor, topicKey, validText, validCode, withAllResults, publicSnapshot, submitPublicVote };

return {newSession,validText,snapshot,submitVote,learnerSnapshot,resultsSnapshot,submitLearnerVote,manage,validCode,withAllResults,publicSnapshot,submitPublicVote};
}());

/* Shared lesson content; copied into the Apps Script package by the packaging script. */
globalThis.PollContent = {
  choices: ['直接・同期', '直接・非同期', '間接・同期', '間接・非同期'],
  phases: { initial: '初回の投票', discussion: '理由を比較', reconsider: '考え直して投票', closed: 'このテーマの投票終了' },
  topics: [
    { id:'career', title:'進路の大事な相談', task:'進学先を二つで迷っている。理由も説明し、先生の考えを聞きたい。最初にどう伝える？', facts:[['今・期限','今日15:40。明日12:00までに相談を始めたい。'],['自分の場所','学校。16:00までなら20分使える。'],['相手の状況','先生は職員室。16:00までは相談できる。'],['使える手段','対面・電話・学校のメッセージ。'],['考えたいこと','緊張して話しにくいが、先生の反応も確かめたい。']], question:'表情や返事を確かめることと、自分の考えを整理すること。両方を大切にするには？', extra:'先生が出張中だったら、どうする？', points:['対面なら反応を見て、その場で聞き返せる。','文章なら緊張せず、自分の考えを整理して伝えやすい。','先に文章を送り、後で会うなど、方法を組み合わせられる。'] },
    { id:'club', title:'明日の部活動の連絡', task:'明日の練習場所が体育館から第2グラウンドに変わった。部員全員へ場所と時刻を知らせたい。', facts:[['今・集合','今日16:00。集合は明日8:30。約16時間半ある。'],['自分の場所','部室。学校にいる部員には今会える。'],['相手の状況','14人中10人は校内、4人は欠席して自宅。'],['使える手段','対面・電話・部のグループメッセージ。'],['考えたいこと','場所を後で見返してほしい。連絡を見落とす部員もいる。']], question:'後から読み返せることと、読んだか確かめること。どう両立する？', extra:'まだ返事のない人が3人いたら、どうする？', points:['メッセージなら時刻や地図を残し、後から読み返せる。','対面なら理解を確かめやすいが、欠席者へは別の連絡が必要。','未返信の人へ通話するなど、届いたかを確かめる工夫ができる。'] },
    { id:'urgent', title:'集合まであと15分', task:'校門で会う予定が、雨のため体育館入口へ変更になった。友人に今知らせたい。', facts:[['今・集合','15:45。集合は16:00。残り15分。'],['自分の場所','体育館入口。図書室までは歩いて5分。'],['相手の状況','友人は図書室。スマートフォンは持っている。'],['使える手段','会いに行く・電話・メッセージ。'],['考えたいこと','友人が画面を見ているかは不明。場所を理解したか確かめたい。']], question:'「送った」だけで「伝わった」と考えてよい？', extra:'電話にも出なかったら、どうする？', points:['メッセージに場所を残せるが、読む時刻は保証されない。','電話ならその場で確認できるが、出られない場合もある。','直接探す場合も時間がかかる。返事や安全な伝達経路を考える。'] },
    { id:'festival', title:'文化祭の出し物を決める', task:'展示・劇・クイズの3案から、5人の班で一つ選ぶ。全員の意見を聞いて決めたい。', facts:[['今・期限','今日の放課後。提出は2日後12:00。'],['自分の場所','学校。今は30分話し合える。'],['相手の状況','4人は教室、1人は欠席して自宅。'],['使える手段','対面・Web会議・班のグループメッセージ。'],['考えたいこと','欠席者は18:00から参加可能。すぐ意見がまとまらない人もいる。']], question:'早く話を深めることと、全員が考えて参加すること。どう両立する？', extra:'今日中に仮決定が必要になったら、どうする？', points:['対面やWeb会議なら、質問しながら話を深めやすい。','文章なら各自が考えて意見を書けるが、返事に時間がかかる。','欠席者や発言の少ない人の意見を確かめ、決まったことも記録する。'] }
  ]
};
