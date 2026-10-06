import http from 'node:http';
import { readFile, stat, mkdir, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID, randomBytes, createHmac, timingSafeEqual } from 'node:crypto';
import Core from '../poll/core.cjs';
const root=path.resolve('out'), publicRoot=path.resolve('public'), prefix='/YSFH-Infomatics-2026';
const privateDir=path.resolve('tmp/02-04-poll');await mkdir(privateDir,{recursive:true});
let db;try{db=JSON.parse(await readFile(path.join(privateDir,'state.json'),'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;db={secret:randomBytes(32).toString('hex'),admin:randomBytes(32).toString('hex'),sessions:[Core.newSession(randomUUID(),'動作確認用の授業','0123',new Date().toISOString())]};}
if(!db.sessions.some(s=>s.id==='community'))db.sessions.push(Core.newSession('community','全体投票（コードなし）','',new Date().toISOString()));
const allVotes=()=>db.sessions.flatMap(s=>s.votes.map(v=>({...v,scope:s.id})));
function learnerView(s,p,topic=0,round=1){const now=new Date().toISOString(),v=Core.learnerSnapshot(s,p,topic,round,now);v.topics=[0,1,2,3].map(t=>Core.learnerSnapshot(s,p,t,1,now));return v;}
function publicView(p,topic=0,round=1){const now=new Date().toISOString(),votes=allVotes(),v=Core.publicSnapshot(votes,p,topic,now,round);v.topics=[0,1,2,3].map(t=>Core.publicSnapshot(votes,p,t,now));return v;}
async function persist(){const file=path.join(privateDir,'state.json');await writeFile(file+'.next',JSON.stringify(db));await rename(file+'.next',file);}await persist();
await writeFile(path.join(privateDir,'teacher-url.txt'),'http://127.0.0.1:3065'+prefix+'/02-04-poll/teacher.html#'+db.admin);
const sign=value=>createHmac('sha256',db.secret).update(value).digest('base64url');
function token(sessionId,participant){const payload=Buffer.from(JSON.stringify({sessionId,participant})).toString('base64url');return payload+'.'+sign(payload);}
function decode(value){if(typeof value!=='string')throw new Error('授業へ参加し直してください。');const [payload,sig]=value.split('.');const expected=sign(payload||'');if(!sig||sig.length!==expected.length||!timingSafeEqual(Buffer.from(sig),Buffer.from(expected)))throw new Error('授業へ参加し直してください。');return JSON.parse(Buffer.from(payload,'base64url').toString());}
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.txt':'text/plain; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.webp':'image/webp','.csv':'text/csv; charset=utf-8'};
let queue=Promise.resolve();const serialized=fn=>{const next=queue.then(fn);queue=next.catch(()=>{});return next;};
async function body(req){let data='';for await(const chunk of req){data+=chunk;if(Buffer.byteLength(data)>16384)throw new Error('入力が長すぎます。');}return JSON.parse(data);}
function response(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
http.createServer(async(req,res)=>{
 try{
  let url=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);if(url===prefix||url.startsWith(prefix+'/'))url=url.slice(prefix.length)||'/';
  if(url.startsWith('/api/poll/')){
   if(req.method!=='POST'){response(res,405,{error:'送信方法を確認してください。'});return;}
   if(req.headers.origin&&req.headers.origin!=='http://'+req.headers.host){response(res,403,{error:'この画面からは操作できません。'});return;}
   const b=await body(req);const method=url.split('/').at(-1);
   const result=await serialized(async()=>{
    if(method==='admin'){
     if(b.key!==db.admin)throw new Error('先生用の確認リンクから開いてください。');
     if(b.action==='new'){db.sessions.push(Core.newSession(randomUUID(),Core.validText(b.title,60,'授業名'),Core.validCode(b.value,db.sessions),new Date().toISOString()));await persist();}
     else if(b.action){const s=db.sessions.find(s=>s.id===b.sessionId);Core.manage(s,b.action,b.value);await persist();}
     return{sessions:db.sessions.map(s=>({...s,requests:undefined,votes:s.votes.map(v=>({id:v.id,topic:v.topic,condition:v.condition,round:v.round,choice:v.choice,reason:v.reason,visible:v.visible}))}))};
    }
    if(method==='join-public'){
     const s=db.sessions.find(s=>s.id==='community'),participant=sign('community:'+Core.validText(b.participant,100,'参加の情報'));
     return {token:token(s.id,participant),snapshot:publicView(participant,b.topic)};
    }
    if(method==='join'){
     const code=Core.validText(b.code,16,'授業コード').toUpperCase(),device=Core.validText(b.participant,100,'参加番号');
     const s=db.sessions.find(s=>s.active&&s.code===code);if(!s)throw new Error('授業コードを確認してください。受付が終了した授業には参加できません。');
     const participant=sign(device+':'+s.id);return{token:token(s.id,participant),snapshot:learnerView(s,participant)};
    }
    const identity=decode(b.token),s=db.sessions.find(s=>s.id===identity.sessionId);
    if(identity.sessionId==='community'){
      if(method==='snapshot')return publicView(identity.participant,b.topic,b.round);
      if(method==='vote'){Core.submitPublicVote(s,identity.participant,b,new Date().toISOString(),randomUUID());await persist();return publicView(identity.participant,b.topic,b.round);}
    }
    if(method==='snapshot')return learnerView(s,identity.participant,b.topic,b.round);
    if(method==='vote'){Core.submitLearnerVote(s,identity.participant,b,new Date().toISOString(),randomUUID());await persist();return learnerView(s,identity.participant,b.topic,b.round);}
    throw new Error('操作を確認してください。');
   });response(res,200,result);return;
  }
  const base=url.startsWith('/02-04-poll/')?publicRoot:root;
  let file=path.resolve(base,'.'+url);if(file!==base&&!file.startsWith(base+path.sep)){res.writeHead(403);res.end();return;}
  if((await stat(file)).isDirectory())file=path.join(file,'index.html');
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(await readFile(file));
 }catch(e){if(req.url.includes('/api/poll/'))response(res,400,{error:e.message});else{res.writeHead(404);res.end('Not found');}}
}).listen(3065,'127.0.0.1',()=>console.log('共有投票つき教材: http://127.0.0.1:3065'+prefix+'/units/02-04/\n確認用授業コード: '+(db.sessions.find(s=>s.active&&/^\d{4}$/.test(s.code))?.code||'先生用画面で作成')+'\n先生用リンク: tmp/02-04-poll/teacher-url.txt'));
