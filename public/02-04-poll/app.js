/* Shared Google / local UI. Untrusted student text is always rendered as text nodes. */
(function () {
  'use strict';
  const C = globalThis.PollContent, app = document.getElementById('poll-app');
  const googleMode = typeof google !== 'undefined' && google.script && google.script.run;
  const prefix = location.pathname.includes('/YSFH-Infomatics-2026/') ? '/YSFH-Infomatics-2026' : '';
  let mode='all', code='', sessionId='', auth='', snap=null, selectedTopic=0, selectedRound=1, roundView=1;
  let choice=null, draft='', pending=null, editing=true, busy=false, connecting=false, failed=false, status='', timer, refreshing=false, epoch=0, showAll=false;
  const topics=new Map(), earlyDrafts=new Map(), expanded=new Set();
  function storageGet(k){try{return localStorage.getItem(k);}catch{return null;}}
  function storageSet(k,v){try{localStorage.setItem(k,v);}catch{/* Keep working in memory. */}}
  const participant=storageGet('cm-poll-browser-v1')||crypto.randomUUID();storageSet('cm-poll-browser-v1',participant);
  function el(tag,attrs,...children){const n=document.createElement(tag);Object.entries(attrs||{}).forEach(([k,v])=>{if(k.startsWith('on'))n.addEventListener(k.slice(2),v);else if(k==='class')n.className=v;else if(k==='value')n.value=v;else if(k==='disabled')n.disabled=v;else n.setAttribute(k,String(v));});children.flat().forEach(c=>{if(c!=null)n.append(c instanceof Node?c:document.createTextNode(String(c)));});return n;}
  const button=(label,fn,attrs)=>el('button',{type:'button',onclick:fn,...attrs},label);
  function embed(){const p=new URLSearchParams(location.search);return window.POLL_EMBED||{channel:p.get('channel'),parentOrigin:p.get('parentOrigin')};}
  function heading(){return el('header',{class:'activity-heading'},el('h2',{},'この場面なら、どう伝える？'),button('画面に合わせる',()=>{const e=embed();if(top!==window&&e.parentOrigin)top.postMessage({type:'cm-poll-align',channel:e.channel},e.parentOrigin);}));}
  function resize(){requestAnimationFrame(()=>{const e=embed();if(top!==window&&e.channel&&e.parentOrigin)top.postMessage({type:'cm-poll-height',channel:e.channel,height:Math.ceil(app.getBoundingClientRect().height)+16},e.parentOrigin);});}
  async function call(method,value){
    if(googleMode)return new Promise((resolve,reject)=>{const run=google.script.run.withSuccessHandler(resolve).withFailureHandler(e=>reject(new Error(e.message)));if(method==='join')run.joinPoll(value.code,participant);else if(method==='join-public')run.joinPublicPoll(participant,value.topic);else if(method==='snapshot'){if(mode==='all')run.readPublicPoll(value.topic,auth,value.round);else run.readPoll(sessionId,auth,value.topic,value.round);}else if(mode==='all')run.votePublicPoll(value,auth);else run.votePoll(sessionId,value,auth);});
    const response=await fetch(prefix+'/api/poll/'+method,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({scope:mode,...value,token:auth,participant})});
    if(response.status===404)throw new Error('共有投票の接続先が未設定です。先生の投票設定を確認してください。');
    const result=await response.json();if(!response.ok||result.error)throw new Error(result.error||'保存を確認できませんでした。');return result;
  }
  function draftKey(topic=selectedTopic,round=selectedRound){return 'cm-poll-draft:'+sessionId+':'+topic+':base:'+round;}
  function ownVote(s=snap,round=selectedRound){return s&&(round===2?s.mine.second:s.mine.first);}
  function saveDraft(){if(!snap)return;const d={choice,reason:draft,pending};if(connecting)earlyDrafts.set(selectedTopic+':'+selectedRound,d);else storageSet(draftKey(),JSON.stringify(d));}
  function loadDraft(){choice=null;draft='';pending=null;const own=ownVote();editing=!own;if(own){choice=own.choice;draft=own.reason;}const raw=storageGet(draftKey());if(raw)try{const d=JSON.parse(raw);choice=d.choice;draft=d.reason||'';pending=d.pending||null;if(pending)editing=true;}catch{/* Ignore malformed draft. */}const early=earlyDrafts.get(selectedTopic+':'+selectedRound);if(early&&(early.choice!==null||early.reason)){choice=early.choice;draft=early.reason;editing=true;}expanded.clear();}
  function placeholder(topic){return {session:{id:sessionId||'connecting',title:mode==='all'?'全クラスの蓄積':'授業コード '+code,topic,condition:'base',phase:'initial'},now:null,visible:false,mine:{first:null,second:null},first:null,second:null};}
  function forRound(base){return {...base,session:{...base.session,phase:selectedRound===2?'reconsider':'initial'}};}
  function ingest(next){const list=next.topics||[next];list.forEach(s=>topics.set(s.session.topic,s));const {topics:unused,...active}=next;topics.set(active.session.topic,active);}
  function accept(next,fromVote=false){
    const before=snap;ingest(next);snap=forRound(topics.get(selectedTopic)||placeholder(selectedTopic));
    const time=document.getElementById('poll-updated');if(time)time.textContent='最終確認：'+new Date(snap.now).toLocaleTimeString('ja-JP');
    if(fromVote){pending=null;busy=false;editing=false;failed=false;status='✓ 投票を保存しました。';saveDraft();render();return;}
    // Never replace a focused textarea or controls while the student is drafting.
    if(editing)return;
    if(JSON.stringify({...before,now:null})!==JSON.stringify({...snap,now:null})){status='';failed=false;render();}
  }
  function schedule(){clearTimeout(timer);if(!snap||connecting||editing||!auth)return;timer=setTimeout(refresh,4000+Math.random()*1000);}
  async function refresh(){
    clearTimeout(timer);if(!snap||connecting||editing||!auth)return;if(document.hidden||busy||refreshing){schedule();return;}
    const currentEpoch=epoch;refreshing=true;
    try{const next=await call('snapshot',{sessionId,topic:selectedTopic,round:selectedRound});if(currentEpoch!==epoch)return;accept(next);if(failed){failed=false;status='接続が戻りました。';render();}}
    catch(e){if(currentEpoch===epoch){failed=true;status=e.message+' 再接続を自動で試しています。';render();}}
    finally{refreshing=false;if(currentEpoch===epoch)schedule();}
  }
  async function start(nextMode,nextCode=''){
    if(busy||pending)return;
    nextCode=nextCode.trim().replace(/[０-９]/g,c=>String.fromCharCode(c.charCodeAt(0)-0xfee0));
    if(nextMode==='class'&&!/^\d{4}$/.test(nextCode)){status='授業コードは4桁の数字で入力してください。';failed=true;renderJoin(nextCode);return;}
    const currentEpoch=++epoch;clearTimeout(timer);topics.clear();earlyDrafts.clear();mode=nextMode;code=nextCode;sessionId='';auth='';selectedTopic=0;selectedRound=roundView=1;choice=null;draft='';pending=null;editing=true;connecting=true;failed=false;showAll=false;
    status='接続を準備しています。先に課題を読んで、方法を選んでおこう。';snap=placeholder(0);render();
    try{
      const joined=await call(mode==='all'?'join-public':'join',{code,topic:0});if(currentEpoch!==epoch)return;
      saveDraft();auth=joined.token;sessionId=joined.snapshot.session.id;ingest(joined.snapshot);connecting=false;snap=forRound(topics.get(selectedTopic));loadDraft();earlyDrafts.forEach((d,k)=>{const [topic,round]=k.split(':').map(Number);if(d.choice!==null||d.reason)storageSet(draftKey(topic,round),JSON.stringify(d));});earlyDrafts.clear();status='';failed=false;render();schedule();
    }catch(e){if(currentEpoch!==epoch)return;connecting=false;failed=true;status=e.message+' 「接続を再確認する」からやり直せます。';render();}
  }
  function selectTopic(topic,round=1,forceEdit=false){
    if(busy||pending)return;saveDraft();clearTimeout(timer);selectedTopic=topic;selectedRound=roundView=round;snap=forRound(topics.get(topic)||placeholder(topic));loadDraft();if(forceEdit)editing=true;status=connecting?'接続を準備しています。課題と選択肢は先に確認できます。':'';failed=false;render();if(!editing)refresh();
  }
  async function send(attempt=0){
    if(typeof attempt!=='number')attempt=0;
    if(busy||connecting||!auth||choice===null||[...draft.trim()].length>200)return;
    if(!pending)pending={sessionId,topic:selectedTopic,condition:'base',round:selectedRound,choice,reason:draft.trim(),requestId:crypto.randomUUID()};
    saveDraft();clearTimeout(timer);busy=true;failed=false;status='保存を確認しています…';render();
    try{accept(await call('vote',pending),true);schedule();}
    catch(e){
      busy=false;failed=true;
      const retry=/通信|接続|同時|実行|タイム|サービス|ネットワーク|サーバー|Lock|wait|timeout|Service|Too many|invoked|Failed to fetch/i.test(e.message)&&attempt<3;
      status=retry?'送信が集中しています。同じ投票の保存を自動で再確認します…':e.message+' 同じ内容で保存を再確認できます。';
      if(retry){busy=true;const currentEpoch=epoch;setTimeout(()=>{if(currentEpoch===epoch&&pending){busy=false;send(attempt+1);}},1800*2**attempt+Math.random()*2500);}
      render();
    }
  }
  function leave(){if(busy||pending)return;saveDraft();++epoch;clearTimeout(timer);snap=null;sessionId='';auth='';connecting=false;status='';failed=false;renderJoin();}
  function renderJoin(value=''){
    const entry=el('details',{class:'class-entry'},el('summary',{},'4桁のコードで、自分の授業に参加する'),el('label',{for:'class-code'},'授業コード（4桁の数字）'),el('input',{id:'class-code',inputmode:'numeric',autocomplete:'off',maxlength:'4',placeholder:'例：0123',value,onkeydown:e=>{if(e.key==='Enter')start('class',e.target.value);}}),button('授業に参加する',()=>start('class',document.getElementById('class-code').value)));entry.open=Boolean(value);
    app.replaceChildren(el('div',{class:'join poll-activity'},el('h2',{},'こんな場面では、あなたはどうしますか？'),el('p',{},'方法を選んで投票したら、みんなの結果と理由を比べられます。'),button('コードなしで、全体投票に参加する',()=>start('all'),{class:'primary'}),el('p',{class:'hint'},'どちらの参加方法でも、課題1〜4と考え直しを自由に選べます。'),entry,el('p',{class:'privacy'},googleMode?'Googleに方法と任意の理由を保存し、匿名で共有します。名前や実際の個人の事情は書かないでください。':'確認用サーバーへ保存します。Googleには送信しません。'),el('p',{class:'message'+(failed?' error':''),role:'status'},status||'全体投票はコード不要です。自分のクラスの結果を比べる場合は先生の4桁コードを使います。')));resize();
  }
  function reasons(view){return el('section',{class:'reasons'},el('h3',{},'この方法を選んだ理由'),el('p',{},'理由は任意です。書かれている意見を比べよう。人数の多さは正しさを決めません。'),el('div',{class:'reason-grid'},C.choices.map((label,i)=>{const list=view.reasons.filter(r=>r.choice===i),key=roundView+':'+i,shown=expanded.has(key)?list:list.slice(0,2);return el('section',{class:'reason-group'},el('h4',{},label+' · 理由 '+list.length+'件'),shown.map(r=>el('p',{class:'reason-card'},r.reason)),list.length===0?el('p',{class:'empty'},'共有されている理由は、まだありません。'):null,list.length>2?button(expanded.has(key)?'少なく表示する':'この選択の理由をすべて読む',()=>{expanded.has(key)?expanded.delete(key):expanded.add(key);render();}):null);})));}
  function render(){
    if(!snap){renderJoin();return;}
    const s=snap.session,t=C.topics[selectedTopic],own=ownVote(),showForm=editing||!own,results=mode==='class'&&showAll&&snap.all?snap.all:snap,view=roundView===2?results.second:results.first,viewOwn=ownVote(snap,roundView);
    const scene=el('section',{class:'scene'},el('h3',{},'課題：'+t.title),el('p',{},t.task),el('ul',{class:'scene-facts'},t.facts.map(f=>el('li',{},el('b',{},f[0]+'：'),f[1]))),el('p',{class:'instruction'},'主に使う方法を一つ選ぼう。理由は空欄でも投票できます。'));
    const panel=el('section',{class:'panel'}),add=(...parts)=>panel.append(...parts.filter(p=>p!=null));
    if(showForm){
      const textarea=el('textarea',{id:'vote-reason',rows:'3',maxlength:'400',value:draft,disabled:busy||Boolean(pending),placeholder:'任意・200字以内。良いところと気になるところを書いてもOK。',oninput:e=>{draft=e.target.value;saveDraft();document.getElementById('send-vote').disabled=busy||connecting||!auth||choice===null||[...draft.trim()].length>200;document.getElementById('reason-count').textContent=[...draft.trim()].length+' / 200字';}});
      add(el('h3',{},selectedRound===2?'考え直した方法を選ぼう':'あなたなら、どう伝える？'),el('div',{class:'choices'},C.choices.map((label,i)=>button(label,()=>{choice=i;saveDraft();render();},{'aria-pressed':choice===i,disabled:busy||Boolean(pending)}))),el('label',{class:'reason-label',for:'vote-reason'},'なぜ選んだ？ 良いところと気になるところ（任意）'),textarea,el('div',{class:'actions'},button(connecting?'接続を準備中…':pending?'保存を再確認する':own?'投票を修正する':selectedRound===2?'考え直しを投票する':'この方法に投票する',send,{id:'send-vote',class:'primary',disabled:busy||connecting||!auth||choice===null||[...draft.trim()].length>200}),own&&!pending?button('結果へ戻る',()=>{editing=false;render();refresh();}):null,selectedRound===2&&!own?button('初回の結果へ戻る',()=>selectTopic(selectedTopic,1)):null,el('span',{id:'reason-count',class:'counter'},[...draft.trim()].length+' / 200字')),el('p',{class:'privacy'},googleMode?'方法と任意の理由をGoogleへ匿名で保存します。':'確認用サーバーへ保存します。Googleには送信しません。'));
    }else if(snap.visible&&view){
      add(el('div',{class:'rounds'},button('初回の結果',()=>{roundView=1;render();},{'aria-pressed':roundView===1}),button('考え直しの結果',()=>{roundView=2;render();},{'aria-pressed':roundView===2}),mode==='class'?button('全投票結果を見る '+(showAll?'ON':'OFF'),()=>{showAll=!showAll;expanded.clear();render();},{'aria-label':'全投票結果を見る','aria-pressed':showAll,disabled:!snap.all}):null),el('div',{class:'totals'},el('h3',{},mode==='all'||showAll?'全クラスの投票':'この授業の投票'),el('strong',{'data-testid':'vote-total'},view.total+'票')),el('div',{class:'bars'},C.choices.map((label,i)=>{const pc=view.total?Math.round(view.counts[i]/view.total*100):0;return el('div',{class:'barrow'},el('b',{},label),el('div',{class:'bartrack'},el('span',{style:'width:'+pc+'%'})),el('strong',{},view.counts[i]+'票 · '+pc+'%'));})),viewOwn?el('div',{class:'own'},'自分の投票：'+C.choices[viewOwn.choice]):null,el('div',{class:'question'},el('b',{},'ペアで考えよう'),el('p',{},t.question)),button('もう一度投票する（考え直し）',()=>selectTopic(selectedTopic,2,true),{class:'primary'}),viewOwn?button('この回の自分の投票を修正する',()=>selectTopic(selectedTopic,roundView,true)):null);
    }
    const message=status||(showForm?'方法の選択は必須、理由は任意です。結果は投票後に見られます。':'数秒ごとに集計を自動更新しています。多数派も少数派も、理由を比べよう。');
    app.replaceChildren(el('section',{class:'poll-activity'},heading(),el('div',{class:'toolbar'},el('span',{class:'badge'},s.title+' · '+(selectedRound===2?'考え直し':'初回')),button('参加方法を変える',leave,{disabled:busy||Boolean(pending)})),el('nav',{class:'tabs','aria-label':'4つの課題'},C.topics.map((topic,i)=>button((i+1)+' '+topic.title,()=>selectTopic(i),{'aria-pressed':i===selectedTopic,disabled:busy||Boolean(pending)}))),el('div',{class:'layout','data-testid':'activity-main'},scene,panel),el('p',{class:'message'+(failed?' error':''),id:'poll-status',role:'status','aria-live':'polite'},message),!auth&&!connecting?button('接続を再確認する',()=>start(mode,code)):null,el('p',{class:'counter',id:'poll-updated'},snap.now?'最終確認：'+new Date(snap.now).toLocaleTimeString('ja-JP'):connecting?'課題はすぐに読めます。接続後に投票を保存できます。':'')));
    if(snap.visible&&view&&!showForm){const organize=el('details',{class:'organize'},el('summary',{},'伝え方の良さと課題を整理する'),t.points.map(p=>el('p',{},p)),el('p',{},'直接・非同期：対面の会話自体は同期です。事前に文章を送り、後で会う案は「間接・非同期＋直接・同期」の組合せです。'),el('p',{},'追加で考えるなら：'+t.extra));app.append(viewOwn?el('section',{class:'own-reason'},el('h3',{},'自分の理由'),el('p',{},viewOwn.reason||'理由は未記入（任意）')):el('span'),reasons(view),organize);}
    resize();
  }
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!editing&&!connecting)refresh();});
  renderJoin();new ResizeObserver(resize).observe(app);
}());
