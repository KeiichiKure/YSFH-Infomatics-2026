(function(){
 'use strict';const root=document.getElementById('teacher-app'),C=globalThis.PollContent;
 const prefix=location.pathname.includes('/YSFH-Infomatics-2026/')?'/YSFH-Infomatics-2026':'';
 let key=location.hash.slice(1)||sessionStorage.getItem('cm-poll-admin');if(key)sessionStorage.setItem('cm-poll-admin',key);history.replaceState(null,'',location.pathname);
 let error='',busy=false;
 function e(tag,text){const x=document.createElement(tag);if(text!=null)x.textContent=text;return x;}
 function button(label,fn){const b=e('button',label);b.type='button';b.disabled=busy;b.onclick=fn;return b;}
 async function load(action,sessionId,value,title){if(busy)return;busy=true;try{const r=await fetch(prefix+'/api/poll/admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key,action,sessionId,value,title})});const d=await r.json();if(!r.ok)throw new Error(d.error);busy=false;error='';render(d.sessions);}catch(err){busy=false;error=err.message;root.replaceChildren(e('h2','先生用の確認画面'),e('p',error),button('もう一度確認する',()=>load()));}}
 function render(sessions){
  root.replaceChildren(e('h2','先生用操作 · 確認用サーバー'),e('p','この画面はローカルテスト用です。Google版はスプレッドシートの「授業投票」メニューで操作します。'));
  const newPanel=e('section');newPanel.append(e('h3','新しい授業を始める'));const label=e('label','授業名'),input=e('input');input.id='new-title';input.maxLength=60;label.htmlFor=input.id;const codeLabel=e('label','4桁の授業コード（自分で指定）'),code=e('input');code.id='new-code';code.inputMode='numeric';code.maxLength=4;codeLabel.htmlFor=code.id;newPanel.append(label,input,codeLabel,code,button('新しい授業を作る',()=>load('new',null,code.value,input.value)),button('最新の集計を確認する',()=>load()));root.append(newPanel);
  sessions.slice().reverse().forEach(s=>{
   const panel=e('section');panel.append(e('h3',s.title),e('p',s.active?C.topics[s.topic].title+' · '+C.phases[s.phase]+(s.condition==='extra'?' · 追加条件':''):'この授業は終了しました。'));
   if(s.active){panel.append(e('p','生徒に案内する授業コード'),e('code',s.code));const link=e('a','生徒の投票画面を開く');link.href='index.html';link.target='_blank';const linkRow=e('p');linkRow.append(link);panel.append(linkRow);
    const actions=e('div');actions.className='controls';
    if(s.phase==='initial')actions.append(button('初回を締めて理由を比較',()=>load('phase',s.id,'discussion')));
    if(s.phase==='discussion')actions.append(button('考え直しの投票を開く',()=>load('phase',s.id,'reconsider')));
    if(s.phase==='discussion'||s.phase==='reconsider')actions.append(button('このテーマを終了',()=>load('phase',s.id,'closed')));
    if(s.topic<3)actions.append(button('次の課題へ',()=>load('topic',s.id,s.topic+1)));
    if(s.condition==='base')actions.append(button('追加条件で新しく投票',()=>load('extra',s.id)));
    actions.append(button('授業の受付・閲覧を終了',()=>{if(confirm('この授業の参加・閲覧を終了します。記録は残ります。'))load('finish',s.id);}));panel.append(actions);
   }
   const counts=s.votes.filter(v=>v.topic===s.topic&&v.condition===s.condition);panel.append(e('p','初回 '+counts.filter(v=>v.round===1).length+'人 ／ 考え直し '+counts.filter(v=>v.round===2).length+'人'));
   const list=e('ul');counts.forEach(v=>{const row=e('li',v.round+'回目 · '+C.choices[v.choice]+'：'+v.reason+(v.visible?'':'［理由を非表示］'));if(s.active){row.append(button(v.visible?'理由を非表示にする':'理由を共有する',()=>load(v.visible?'hide':'show',s.id,v.id)));row.append(button('この票を集計から除く',()=>{if(confirm('このテスト票を除きます。理由を隠すだけなら「理由を非表示にする」を使ってください。'))load('exclude',s.id,v.id);}));}list.append(row);});panel.append(list);root.append(panel);
  });if(error)root.append(e('p',error));
 }
 load();
}());
