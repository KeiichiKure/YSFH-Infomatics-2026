'use client';
import {useState} from 'react';
import {Frame,Notice} from './Parts';

type Destination='Web'|'Video';
type Router='R1'|'R2'|'R3'|'R4'|'R5'|'R6';
type Stage={title:string;speaker:string;speech:string;detail:string;edges:string[]};
const destinations={Web:{name:'ニュースWeb',host:'www.news.example.jp',ip:'198.51.100.80',first:'R2',last:'R4'},Video:{name:'動画サーバ',host:'www.video.example.jp',ip:'198.51.100.90',first:'R3',last:'R6'}} as const;
const nodes=[{id:'PC',x:8,y:52,label:'自分のPC',ip:''},{id:'DNS',x:25,y:12,label:'DNS',ip:''},{id:'R1',x:26,y:52,label:'R1',ip:''},{id:'R2',x:44,y:27,label:'R2',ip:''},{id:'R3',x:44,y:77,label:'R3',ip:''},{id:'R4',x:62,y:18,label:'R4',ip:''},{id:'R5',x:62,y:48,label:'R5',ip:''},{id:'R6',x:62,y:82,label:'R6',ip:''},{id:'Web',x:88,y:28,label:'ニュースWeb',ip:'198.51.100.80'},{id:'Video',x:88,y:75,label:'動画サーバ',ip:'198.51.100.90'}] as const;
const links=[['PC','DNS'],['PC','R1'],['R1','R2'],['R1','R3'],['R2','R4'],['R2','R5'],['R3','R5'],['R3','R6'],['R4','Web'],['R6','Video']] as const;
const routers:Router[]=['R1','R2','R3','R4','R5','R6'];

function stages(dest:Destination):Stage[]{
 const d=destinations[dest];
 return [
  {title:`${d.name}を見たい`,speaker:'PC',speech:`${d.host}を開きたい！`,detail:'まずDNSで名前からIPアドレスを調べます。',edges:[]},
  {title:'DNSへ問い合わせ',speaker:'PC',speech:`${d.host}のIPは？`,detail:'名前をDNSに尋ねます。',edges:['PC-DNS']},
  {title:'DNSからIPを受け取る',speaker:'DNS',speech:`${d.ip}だよ。`,detail:'PCは宛先IPを知りました。',edges:['DNS-PC']},
  {title:'要求をR1へ送る',speaker:'PC',speech:`宛先${d.ip}へWeb要求！`,detail:'宛先IPを書いた要求を入口のR1へ送ります。',edges:['PC-R1']},
  {title:'R1の経路表を確認',speaker:'R1',speech:`${d.ip}への道はまだ表にない。`,detail:'R1の経路表には、このサーバへ進む行がまだありません。',edges:[]},
  {title:'R1が隣に道を尋ねる',speaker:'R1',speech:'R2・R3、道を知ってる？',detail:'模型では隣のルータから順に接続情報を集めます。',edges:['R1-R2','R1-R3']},
  {title:'R2・R3がさらに確かめる',speaker:'R2',speech:'R4・R5にも確かめよう。',detail:'R2はR4・R5へ、R3はR5・R6へ尋ねます。',edges:['R2-R4','R2-R5','R3-R5','R3-R6']},
  {title:`${d.last}が接続を知らせる`,speaker:d.last,speech:`${d.name}に直接つながっているよ！`,detail:`${d.last}だけが${d.name}へ直結します。R5にはサーバへの直結がありません。`,edges:[`${d.last}-${d.first}`]},
  {title:`${d.first}の表に記録`,speaker:d.first,speech:`次は${d.last}へ。表に書こう！`,detail:`${d.first}が「${d.ip}/32 → ${d.last}」を記録します。`,edges:[`${d.first}-R1`]},
  {title:'R1の表にも記録',speaker:'R1',speech:`${d.ip}/32 → ${d.first}！`,detail:`R1も「${d.name}への次の道は${d.first}」と記録します。`,edges:[]},
  {title:`R1から${d.first}へ送る`,speaker:'R1',speech:`表にある${d.first}へ。`,detail:'ここからは見つけた経路を使ってWeb要求を送ります。',edges:[`R1-${d.first}`]},
  {title:`${d.first}が表を確認`,speaker:d.first,speech:`次は${d.last}だ。`,detail:`${d.first}も自分の経路表を見て、次を決めます。`,edges:[]},
  {title:`${d.name}へ届く`,speaker:d.last,speech:`${d.name}へ届けよう！`,detail:`${d.first} → ${d.last} → ${d.name} と要求が進みます。`,edges:[`${d.first}-${d.last}`,`${d.last}-${dest}`]},
  {title:'サーバからページの返事',speaker:dest,speech:'ページを返すよ！',detail:'返事がPCへ届きました。',edges:[`${dest}-${d.last}`,`${d.last}-${d.first}`,`${d.first}-R1`,'R1-PC']},
 ];
}
function repeatStages(dest:Destination):Stage[]{
 const d=destinations[dest];
 return [
  {title:`もう一度${d.name}を開く`,speaker:'PC',speech:`また${d.host}を見たい！`,detail:'前回の宛先IPと経路表の記録が残っています。',edges:[]},
  {title:'要求をR1へ送る',speaker:'PC',speech:`${d.ip}へWeb要求！`,detail:'PCが宛先IPを書いた要求をR1へ送ります。',edges:['PC-R1']},
  {title:'R1は記録を確認',speaker:'R1',speech:`${d.ip}/32 の次は${d.first}だ。`,detail:'R1は経路表に答えがあるので、隣へ道を尋ね直しません。',edges:[]},
  {title:`R1から${d.first}へ`,speaker:'R1',speech:`記録どおり${d.first}へ送ろう。`,detail:'R1が表に書かれた次のルータへ転送します。',edges:[`R1-${d.first}`]},
  {title:`${d.first}も記録を確認`,speaker:d.first,speech:`私の表では次は${d.last}！`,detail:`${d.first}も問い合わせず、自分の表から${d.last}を選びます。`,edges:[]},
  {title:`${d.first}から${d.last}へ`,speaker:d.first,speech:`${d.last}へ進めるよ。`,detail:'記録済みの道を一段ずつ進みます。',edges:[`${d.first}-${d.last}`]},
  {title:`${d.name}へ届く`,speaker:d.last,speech:`直接つながる${d.name}へ。`,detail:'Web要求がサーバへ到着しました。',edges:[`${d.last}-${dest}`]},
  {title:'ページが再び届く',speaker:dest,speech:'またページを返すよ！',detail:'R1も途中のルータも、新たな経路の問い合わせをせずに転送できました。',edges:[`${dest}-${d.last}`,`${d.last}-${d.first}`,`${d.first}-R1`,'R1-PC']},
 ];
}
function nextHop(router:Router,dest:Destination){
 if(router==='R1')return destinations[dest].first;
 if(router==='R2')return dest==='Web'?'R4':'—';
 if(router==='R3')return dest==='Video'?'R6':'—';
 if(router==='R4')return dest==='Web'?'ニュースWebに直結':'—';
 if(router==='R6')return dest==='Video'?'動画サーバに直結':'—';
 return '道なし';
}
function available(router:Router,dest:Destination,step:number,known:boolean,discoveringCurrent:boolean){if(router==='R4')return dest==='Web';if(router==='R6')return dest==='Video';if(router==='R5')return false;if(known)return router==='R1'||router===(dest==='Web'?'R2':'R3');return discoveringCurrent&&(router==='R1'?step>=9:router===(dest==='Web'?'R2':'R3')&&step>=8)}

export function RoutingExperience(){
 const [destination,setDestination]=useState<Destination>('Web'),[step,setStep]=useState(0),[selected,setSelected]=useState<Router>('R1');
 const [known,setKnown]=useState<Record<Destination,boolean>>({Web:false,Video:false}),[mode,setMode]=useState<'discover'|'repeat'>('discover');
 const route=mode==='discover'?stages(destination):repeatStages(destination),current=route[step],d=destinations[destination];
 const focusedRouter=(stage:Stage):Router=>routers.includes(stage.speaker as Router)?stage.speaker as Router:stage.speaker===destination?d.last:'R1';
 const advance=()=>{if(step===route.length-1){setMode('repeat');setStep(0);setSelected('R1');return}if(mode==='discover'&&step===8)setKnown(v=>({...v,[destination]:true}));setSelected(focusedRouter(route[step+1]));setStep(v=>v+1)};
 const back=()=>{if(step===0)return;setSelected(focusedRouter(route[step-1]));setStep(v=>v-1)};
 const changeDestination=(v:Destination)=>{setDestination(v);setMode(known[v]?'repeat':'discover');setStep(0);setSelected('R1')};
 const restart=()=>{setKnown({Web:false,Video:false});setMode('discover');setStep(0);setSelected('R1')};
 const activeNodes=new Set([current.speaker]);
 const selectedRows=(['Web','Video'] as Destination[]).map(target=>({target,visible:available(selected,target,target===destination?step:0,known[target],mode==='discover'&&target===destination)}));
 return <Frame id="routing-lab" title="【発展】矢印を追って、経路表を育てる">
  <div className="in-route-controls"><button disabled={step===0} onClick={back}>← 戻る</button><button className="in-primary" onClick={advance}>{step===route.length-1?'もう一度見る →':'次へ →'}</button><span className="in-counter">{step+1} / {route.length}</span><button onClick={restart}>最初から</button></div>
  <div className="in-route-options"><label>どちらを見たい？<select value={destination} onChange={e=>changeDestination(e.target.value as Destination)}><option value="Web">ニュースWeb</option><option value="Video">動画サーバ</option></select></label><span className="in-route-mode">{mode==='repeat'?'✓ 経路表に記録あり · 問い合わせを省略':'初回 · 経路表にまだ記録なし'}</span></div>
  <p className="in-route-intent">{d.host} を開く · 宛先IP <strong>{mode==='repeat'||step>=2?d.ip:'DNSで調べる前は？'}</strong></p><div className="in-route-legend"><span><i className="is-working"/> オレンジ＝いま動く機器</span><span><i className="is-table"/> 緑の枠＝下に表示中の経路表</span></div>
  <div className="in-web-topology in-discovery-topology"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="route-arrow" markerWidth="4" markerHeight="4" refX="3.5" refY="2" orient="auto"><path d="M0 0 L4 2 L0 4" fill="#d37836"/></marker></defs>{links.map(([a,b])=>{const x=nodes.find(n=>n.id===a)!,y=nodes.find(n=>n.id===b)!;return <line key={a+b} x1={x.x} y1={x.y} x2={y.x} y2={y.y} className="in-web-link"/>})}{current.edges.map((pair,i)=>{const [a,b]=pair.split('-'),x=nodes.find(n=>n.id===a)!,y=nodes.find(n=>n.id===b)!;return <line key={`${mode}-${step}-${pair}`} x1={x.x} y1={x.y} x2={y.x} y2={y.y} className="in-web-explore in-route-message-line" markerEnd="url(#route-arrow)" style={{animationDelay:`${i*.15}s`}}/>})}</svg>
   {nodes.map(n=>{const extra=mode==='discover'&&step===6&&n.id==='R3'?'R5・R6へ聞いてみよう':null,speech=current.speaker===n.id?current.speech:extra,isRouter=routers.includes(n.id as Router);const cls=`in-web-node in-route-node ${activeNodes.has(n.id)?'is-active':''} ${selected===n.id?'is-selected':''}`;const content=<><b>{n.label}</b>{n.ip&&<small>{n.ip}</small>}{speech&&<span key={`${mode}-${step}`} className="in-local-bubble">{speech}</span>}</>;return isRouter?<button key={n.id} type="button" className={cls} style={{left:`${n.x}%`,top:`${n.y}%`}} onClick={()=>setSelected(n.id as Router)} aria-label={`${n.label}の経路表を表示`}>{content}</button>:<div key={n.id} className={cls} style={{left:`${n.x}%`,top:`${n.y}%`}}>{content}</div>})}
  </div>
  <div className="in-route-table"><b>{selected}の経路表 <small>「次へ」で確認中のルータへ自動切替。図を押して手動でも見られます。</small></b>{selected!=='R1'&&<p>隣接：{selected==='R2'?'R1・R4・R5':selected==='R3'?'R1・R5・R6':selected==='R4'?'R2・ニュースWeb':selected==='R5'?'R2・R3（サーバへの直結なし）':'R3・動画サーバ'}</p>}{selectedRows.map(({target,visible})=><div key={target} className={visible?`is-known ${target===destination&&mode==='discover'&&step>=8?'in-route-new-row':''}`:''}><span>{destinations[target].ip}/32<br/><small>（{destinations[target].name}）</small></span><strong>{visible?`→ ${nextHop(selected,target)}`:'まだ記録なし'}</strong></div>)}</div>
  <Notice title={current.title}>{current.detail}</Notice>
  <p className="in-small">宛先 <code>{d.ip}</code> の1台を示す行は <code>{d.ip}/32</code>。この探索の会話は学習用の模型です。実際のルータは通信前から経路情報を交換し、表を更新します。</p>
 </Frame>;
}
