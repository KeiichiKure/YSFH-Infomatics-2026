/* Bound spreadsheet application. Student endpoints are the class and public join/read/vote functions plus doGet. Teacher helpers end in _. */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('授業投票')
    .addItem('保存先を初期設定（コピー後も実行）', 'setup_')
    .addItem('新しい授業を作る', 'newLesson_')
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
function invalidate_(id) { const cache=cache_();if(cache)cache.removeAll(['poll:lesson:'+id,'poll:all']); }
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
function writeLesson_(t,s,row) {
  const meta = Object.assign({},s);delete meta.votes;delete meta.requests;delete meta._row;delete meta._voteRows;
  const data = [s.id,textCell_(s.title),s.code,s.topic+1,s.condition,s.phase,s.active,s.createdAt,JSON.stringify(meta)];
  const target = row || t.lessons.getLastRow() + 1;
  // Keep leading zeroes in a code such as 0123; never treat codes as numbers.
  t.lessons.getRange(target,3).setNumberFormat('@');
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
  const now=new Date().toISOString(),topics=[0,1,2,3].map(i=>PollCore.learnerSnapshot(s,participant,i,1,now));
  const view=PollCore.learnerSnapshot(s,participant,topic===undefined?0:topic,round===undefined?1:round,now);view.topics=topics;return view;
}
function writeVote_(t,s,v,excluded) {
  const row=s._voteRows&&s._voteRows[v.id];
  const data=[s.id,v.id,PollContent.topics[v.topic].title,v.condition,v.round,PollContent.choices[v.choice],textCell_(v.reason),v.visible,v.at,JSON.stringify(v),!excluded];
  if(!row)t.votes.appendRow(data);else t.votes.getRange(row,1,1,11).setValues([data]);
  invalidate_(s.id);
}
function sign_(value) { return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(value,PropertiesService.getScriptProperties().getProperty('SECRET'))).replace(/=+$/,''); }
function token_(s,participant) { const raw=Utilities.base64EncodeWebSafe(JSON.stringify({sessionId:s.id,participant})).replace(/=+$/,'');return raw+'.'+sign_(raw); }
function identity_(id,token) {
  if(typeof token!=='string'||token.length>1500)throw new Error('授業へ参加し直してください。');
  const parts=token.split('.');const expected=sign_(parts[0]);let difference=expected.length^(parts[1]||'').length;
  for(let i=0;i<expected.length;i++)difference|=expected.charCodeAt(i)^((parts[1]||'').charCodeAt(i)||0);
  if(parts.length!==2||difference)throw new Error('授業へ参加し直してください。');
  const value=JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString());
  if(value.sessionId!==id)throw new Error('授業コードを確認してください。');return value.participant;
}
function joinPoll(code,browserKey) {
  code=PollCore.validText(code,16,'授業コード').toUpperCase();browserKey=PollCore.validText(browserKey,100,'参加の情報');
  const t=tables_(),row=rows_(t.lessons).find(r=>String(r[2])===code&&r[6]===true);if(!row)throw new Error('受付中の授業コードを確認してください。');
  const s=loadLesson_(t,row[0]),participant=sign_(s.id+':'+browserKey);
  return {token:token_(s,participant),snapshot:classView_(s,participant,0,1)};
}
function readPoll(id,token,topic,round) { const participant=identity_(id,token);return classView_(lessonForRead_(id),participant,topic,round); }
function votePoll(id,input,token) {
  const participant=identity_(id,token);
  return withLock_(()=>{
    const t=tables_(),s=loadLesson_(t,id,true),before=s.requests.length;
    PollCore.submitLearnerVote(s,participant,input,new Date().toISOString(),Utilities.getUuid());
    if(s.requests.length>before){const v=s.votes.find(v=>v.requestId===input.requestId);writeVote_(t,s,v,false);t.receipts.appendRow([id,input.requestId,s.requests[s.requests.length-1].signature]);SpreadsheetApp.flush();invalidate_(id);}
    return classView_(s,participant,input.topic,input.round);
  });
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
  const t=tables_();if(!rows_(t.lessons).some(r=>r[0]==='community'))withLock_(()=>communityLesson_(t));const participant=sign_('community:'+browserKey);return {token:token_({id:'community'},participant),snapshot:publicView_(t,participant,topic)};
}
function readPublicPoll(topic,token,round) { return publicView_(null,identity_('community',token),topic,round); }
function votePublicPoll(input,token) {
  const participant=identity_('community',token);
  return withLock_(()=>{const t=tables_(),s=loadLesson_(t,'community',true),before=s.requests.length;
    PollCore.submitPublicVote(s,participant,input,new Date().toISOString(),Utilities.getUuid());
    if(s.requests.length>before){const v=s.votes.find(v=>v.requestId===input.requestId);writeVote_(t,s,v,false);t.receipts.appendRow([s.id,input.requestId,s.requests[s.requests.length-1].signature]);SpreadsheetApp.flush();invalidate_(s.id);}
    return publicView_(t,participant,input.topic,input.round,true);
  });
}
function doGet(e) {
  const template=HtmlService.createTemplateFromFile('Index');
  const p=(e&&e.parameter)||{},channel=/^[a-f0-9-]{36}$/.test(p.channel||'')?p.channel:'';
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
function act_(action,value) { withLock_(()=>{const t=tables_(),s=currentLesson_(t);PollCore.manage(s,action,value===undefined&&action==='topic'?s.topic+1:value);writeLesson_(t,s,s._row);SpreadsheetApp.flush();invalidate_(s.id);}); }
function discussion_(){act_('phase','discussion');}function reconsider_(){act_('phase','reconsider');}function closeTopic_(){act_('phase','closed');}function nextTopic_(){act_('topic');}function extra_(){act_('extra');}function finishLesson_(){act_('finish');}
function reasonAction_(action){withLock_(()=>{const t=tables_(),r=t.ss.getActiveRange();if(!r||r.getSheet().getName()!=='回答'||r.getRow()<2)throw new Error('「回答」シートの回答行を選んでください。');const values=t.votes.getRange(r.getRow(),1,1,11).getValues()[0],s=loadLesson_(t,values[0]),v=s.votes.find(v=>v.id===values[1]);if(!v)throw new Error('集計対象の回答を選んでください。');PollCore.manage(s,action,v.id);writeVote_(t,s,v,action==='exclude');SpreadsheetApp.flush();invalidate_(s.id);});}
function hideReason_(){reasonAction_('hide');}function showReason_(){reasonAction_('show');}function excludeVote_(){reasonAction_('exclude');}
function showUrl_(){SpreadsheetApp.getUi().alert('投票URL',ScriptApp.getService().getUrl()||'先に「ウェブアプリ」としてデプロイしてください。',SpreadsheetApp.getUi().ButtonSet.OK);}
