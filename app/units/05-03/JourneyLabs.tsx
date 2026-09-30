'use client';
import {useState,type CSSProperties} from 'react';
import {Frame,Guide,Notice,Section,StepControls,Terms,useSteps} from './LessonParts';

type NodeId='client'|'dns'|'sender'|'r1'|'r2'|'r3'|'r4'|'r5'|'r6'|'target'|'reader';
type Packet={destination:string;protocol:string;content:string;part?:string};
type Stage={title:string;detail:string;from?:NodeId;to?:NodeId;payload?:string;packet?:Packet;actor:NodeId;focus?:NodeId;arrived?:number;heldAt?:NodeId};
type Kind='web'|'mail';
type Receive='POP'|'IMAP';
const webRequest:Packet={destination:'198.51.100.80',protocol:'HTTPS（第4層）',content:'GET /index.html'};
const mailPacket:Packet={destination:'203.0.113.25',protocol:'SMTP（第4層）',content:'宛先: taro@example.com\n件名: 明日の資料\n本文: 明日の資料を確認してください'};
const responseParts=['ページ','画像1','画像2'];
const webStages:Stage[]=[
 {title:'URLを入力',detail:'ブラウザに https://www.example.com/index.html を入力。まだWebサーバのIPアドレスは分かりません。',actor:'client'},
 {title:'DNSに名前を尋ねる',detail:'ブラウザ側が、www.example.com に対応するIPアドレスをDNSへ問い合わせます。',from:'client',to:'dns',payload:'www.example.com のIPは？',actor:'client'},
 {title:'宛先IPを受け取る',detail:'DNSは198.51.100.80を回答。DNSが返すのは住所であり、Webページの中身ではありません。',from:'dns',to:'client',payload:'198.51.100.80',actor:'dns'},
 {title:'HTTPSでページを要求',detail:'接続とTLSの準備の後、ブラウザはWebサーバへページを要求します。図の「GET」は暗号化前の内容を概念的に示しています。',from:'client',to:'r1',packet:webRequest,actor:'client',focus:'r1'},
 {title:'R1が経路表を見る',detail:'受け取った便の宛先IP 198.51.100.80 を確認。R1の経路表では次はR2です。確認したらR2へ送ります。',packet:webRequest,heldAt:'r1',actor:'r1',focus:'r1'},
 {title:'R1からR2へ',detail:'R1は記録済みの経路表に従い、要求をR2へ渡します。',from:'r1',to:'r2',packet:webRequest,actor:'r1',focus:'r1'},
 {title:'R2が経路表を見る',detail:'R2が同じ便の宛先IP 198.51.100.80 を確認。R2の経路表では次はR4です。確認したらR4へ送ります。',packet:webRequest,heldAt:'r2',actor:'r2',focus:'r2'},
 {title:'R2からR4へ',detail:'R2も自分の経路表を見て、次のR4へ転送します。',from:'r2',to:'r4',packet:webRequest,actor:'r2',focus:'r2'},
 {title:'Webサーバに届く',detail:'R4からWebサーバへ要求が届きました。サーバがindex.htmlと、必要な画像などのデータを用意します。',from:'r4',to:'target',packet:webRequest,actor:'target',focus:'r4'},
 {title:'3つの返事を用意',detail:'Webサーバが「ページ」「画像1」「画像2」の3便を先に作りました。どれも宛先は自分のPC 192.0.2.10。これから順番に送ります。',actor:'target',focus:'r4'},
 ...responseParts.flatMap((part,i):Stage[]=>{
  const packet:Packet={destination:'192.0.2.10',protocol:'HTTPS（第4層）',content:part,part:`${i+1}/3`};
  return [
   {title:`${part}をサーバから送る`,detail:`${i+1}/3 の便：${part}を自分のPCへ送ります。`,from:'target',to:'r4',packet,actor:'target',focus:'r4'},
   {title:`${part}がR2へ`,detail:'R4は宛先192.0.2.10を見てR2へ転送します。',from:'r4',to:'r2',packet,actor:'r4',focus:'r4'},
   {title:`${part}がR1へ`,detail:'R2からR1へ運びます。',from:'r2',to:'r1',packet,actor:'r2',focus:'r2'},
   {title:`${part}がPCへ到着`,detail:`自分のPCが${part}を受信しました。届いた便を右の欄に残します。`,from:'r1',to:'client',packet,actor:'client',focus:'r1',arrived:i+1},
  ];
 }),
 {title:'ブラウザに表示',detail:'3つの便がそろったので表示します。これは通信の学習用の簡略図です。実際の画像取得には画像ごとの要求・応答が必要です。',actor:'client',focus:'r1',arrived:3},
];
function mailStages(receive:Receive):Stage[]{return [
 {title:'Aさんがメールを書く',detail:'宛先はtaro@example.com。本文は「明日の資料を確認してください」。ここでの名前と住所は学習用です。',actor:'client'},
 {title:'送信側サーバに預ける',detail:'Aさんの端末がSMTPを使い、送信側のメールサーバへメールを送ります。',from:'client',to:'sender',payload:'taro@example.com 宛のメール',actor:'client'},
 {title:'DNSで送り先を調べる',detail:'教科書の説明に合わせ、DNSで名前解決して受信側のメールサーバのIPアドレスを調べます。',from:'sender',to:'dns',payload:'受信側メールサーバのIPアドレスは？',actor:'sender'},
 {title:'受信側のIPアドレスが分かる',detail:'受信側のメールサーバのIPアドレスは203.0.113.25です。この住所を宛先にしてルータを経由します。',from:'dns',to:'sender',payload:'受信側のIP：203.0.113.25',actor:'dns'},
 {title:'SMTPで配送を始める',detail:'送信側メールサーバは受信側メールサーバへ配送します。宛先IP、SMTP、メールの宛先・件名・本文を同じ便に示します。',from:'sender',to:'r1',packet:mailPacket,actor:'sender',focus:'r1'},
 {title:'R1が経路表を見る',detail:'届いた便の宛先203.0.113.25を確認。R1の経路表では次の転送先はR3です。',packet:mailPacket,heldAt:'r1',actor:'r1',focus:'r1'},
 {title:'R1からR3へ',detail:'R1は宛先IPを見てR3へ転送します。ルータがメールを保管したり、本文を読むわけではありません。',from:'r1',to:'r3',packet:mailPacket,actor:'r1',focus:'r1'},
 {title:'R3からR6へ',detail:'R3の経路表では次はR6です。',from:'r3',to:'r6',packet:mailPacket,actor:'r3',focus:'r3'},
 {title:'受信側サーバに到着',detail:'R6が受信側メールサーバへ渡します。配送に使ったSMTPの役割はここまでです。',from:'r6',to:'target',packet:mailPacket,actor:'target',focus:'r6'},
 {title:'受信側サーバに保管',detail:'taroさんのメールボックスに新着メールが入りました。読む人の端末が接続する前も、ここにあります。',actor:'target'},
 {title:receive==='POP'?'POPで受信を問い合わせる':'IMAPでサーバに問い合わせる',detail:receive==='POP'?'受信者のPCからPOPのRETRを要求。今回は「ダウンロード後にサーバから削除」の設定で試します。':'受信者の端末からIMAPのFETCHを要求。サーバにあるメールを表示するためのデータを受け取ります。',from:'reader',to:'target',payload:receive==='POP'?'POP：RETR 1（受信）':'IMAP：FETCH 1（表示）',actor:'reader'},
 {title:receive==='POP'?'メールをPCへダウンロード':'メールを端末に表示',detail:receive==='POP'?'サーバからPCへメールをダウンロードしました。この時点ではサーバにも残っています。':'サーバから端末へ表示用のデータが届きました。サーバにある元のメールは残ります。',from:'target',to:'reader',payload:'件名：明日の資料／本文：明日の資料を確認してください',actor:'target'},
 {title:receive==='POP'?'削除を指示して終了':'別の端末でも同じメールを見る',detail:receive==='POP'?'PCがDELEを送り、QUITで終了すると、サーバからメールが削除されます。「サーバに残す」設定なら削除しません。':'IMAPではメールがサーバに残っています。別の端末も同じメールボックスを確認できます。',from:receive==='POP'?'reader':undefined,to:receive==='POP'?'target':undefined,payload:receive==='POP'?'POP：DELE 1 → QUIT':undefined,actor:receive==='POP'?'reader':'target'},
]}

const positions:Record<NodeId,{x:number;y:number}>={
 client:{x:8,y:55},dns:{x:25,y:16},sender:{x:25,y:55},r1:{x:47,y:55},r2:{x:61,y:22},r3:{x:61,y:65},r4:{x:74,y:13},r5:{x:74,y:42},r6:{x:74,y:65},target:{x:88,y:43},reader:{x:88,y:12},
};
const webLinks:[NodeId,NodeId][]=[['client','dns'],['client','r1'],['r1','r2'],['r1','r3'],['r2','r4'],['r2','r5'],['r3','r5'],['r3','r6'],['r4','target']];
const mailLinks:[NodeId,NodeId][]=[['client','sender'],['sender','dns'],['sender','r1'],['r1','r2'],['r1','r3'],['r2','r4'],['r2','r5'],['r3','r5'],['r3','r6'],['r6','target'],['target','reader']];
const routerIds:NodeId[]=['r1','r2','r3','r4','r5','r6'];
function ServerPackets({step,prepareIndex,arrived}:{step:number;prepareIndex:number;arrived:number}){return <div className="s03-map-packets"><b>Webサーバが用意した3つの便</b>{responseParts.map((part,i)=><span key={part} className={arrived>i?'is-arrived':''}>📦 {i+1}/3 {part}<small>宛先 192.0.2.10　{arrived>i?'✓ PCへ到着':step>prepareIndex+i*4?'→ 配送中':'待機中'}</small></span>)}</div>}
function MailMailbox({step,receive}:{step:number;receive:Receive}){const stored=step>=9&&!(receive==='POP'&&step>=12),read=step>=11;return <div className="s03-map-mailbox"><div className="s03-mail-location"><b>📬 受信側サーバのメールボックス</b><span className={stored?'is-stored':''}>{step<9?'まだ空':stored?'✉ 件名：明日の資料を保管中':'空：受信後に削除'}</span></div><div className="s03-mail-location"><b>💻 受信者B／Cの端末</b><span className={read?'is-read':''}>{read?receive==='POP'?'✉ メールを取り込んで保存':'✉ サーバにあるメールを表示':'まだ受信していない'}</span></div>{step>=12&&<small>{receive==='POP'?'POP：今回の設定ではサーバから削除':'IMAP：元のメールはサーバに残る'}</small>}</div>}
function Map({kind,receive,stage,step,selected,onSelect,prepareIndex,arrived}:{kind:Kind;receive:Receive;stage:Stage;step:number;selected:NodeId;onSelect:(id:NodeId)=>void;prepareIndex:number;arrived:number}){
 const nodes:{id:NodeId;label:string;subtitle?:string;ip?:string}[]=[{id:'client',label:kind==='web'?'自分のPC':'送信者A',ip:kind==='web'?'192.0.2.10':undefined},{id:'dns',label:'DNS'},...(kind==='mail'?[{id:'sender' as NodeId,label:'SMTP',subtitle:'（送信側メールサーバ）'}]:[]),{id:'r1',label:'R1'},{id:'r2',label:'R2'},{id:'r3',label:'R3'},{id:'r4',label:'R4'},{id:'r5',label:'R5'},{id:'r6',label:'R6'},{id:'target',label:kind==='web'?'Webサーバ':receive,subtitle:kind==='mail'?'（受信側メールサーバ）':undefined,ip:kind==='web'?'198.51.100.80':'203.0.113.25'},...(kind==='mail'?[{id:'reader' as NodeId,label:'受信者B／C'}]:[])];
 const links=kind==='web'?webLinks:mailLinks;
 const start=stage.from?positions[stage.from]:null,end=stage.to?positions[stage.to]:null;
 const name=(id:NodeId)=>nodes.find(node=>node.id===id)?.label??id;
 const packet=stage.packet;
 const held=stage.heldAt?positions[stage.heldAt]:null;
 const packetLane=kind==='mail'?'calc(100% - 105px)':'calc(100% - 88px)';
 return <><div className={`s03-map ${kind==='mail'?'is-mail':''}`} aria-label="経路と通信の図"><div className="s03-network">
  <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{links.map(([a,b])=><line key={`${a}-${b}`} x1={positions[a].x} y1={positions[a].y} x2={positions[b].x} y2={positions[b].y} className="s03-link"/>)}{start&&end&&<line key={`${step}-${stage.from}-${stage.to}`} x1={start.x} y1={start.y} x2={end.x} y2={end.y} className="s03-active-line"/>}</svg>
  {nodes.map(({id,label,subtitle,ip})=>{const p=positions[id],classes=`s03-node ${id===stage.actor?'is-actor':''} ${id===selected?'is-selected':''} ${routerIds.includes(id)?'is-router':''}`;return routerIds.includes(id)?<button key={id} type="button" className={classes} style={{left:`${p.x}%`,top:`${p.y}%`}} onClick={()=>onSelect(id)} aria-label={`${label}の経路表を表示`}>{label}</button>:<div key={id} className={classes} style={{left:`${p.x}%`,top:`${p.y}%`}}>{subtitle?<><strong className="s03-node-service">{label}</strong><span>{subtitle}</span></>:label}{ip&&<small>IP {ip}</small>}</div>})}
  {((start&&end)||held)&&<div key={`${step}-${stage.payload}-${packet?.part}`} className={`s03-moving ${packet?'has-packet':''} ${held?'is-held':''}`} style={{left:`clamp(76px, ${held?.x??start?.x}%, calc(100% - 76px))`,top:packet?packetLane:`${held?.y??start?.y}%`,'--end-x':`clamp(76px, ${end?.x??held?.x}%, calc(100% - 76px))`,'--end-y':packet?packetLane:`${end?.y??held?.y}%`} as CSSProperties}>{packet?<><b>宛先IP {packet.destination}</b><b>{packet.protocol}</b><span>{packet.part&&`${packet.part} `}{packet.content}</span></>:<span>{stage.payload}</span>}</div>}
 </div><aside className="s03-map-side"><RouteTable kind={kind} selected={selected} destination={kind==='web'&&step>=prepareIndex?'192.0.2.10':packet?.destination}/>{kind==='web'&&step>=prepareIndex&&<ServerPackets step={step} prepareIndex={prepareIndex} arrived={arrived}/ >}{kind==='mail'&&<MailMailbox step={step} receive={receive}/>}</aside></div><div className="s03-mobile-route"><b>{start&&end?`${name(stage.from!)} → ${name(stage.to!)}`:stage.heldAt?`${name(stage.heldAt)}で宛先を確認`:`いま動く：${name(stage.actor)}`}</b><span key={`${step}-${stage.payload}-${packet?.part}`}>{packet?`宛先IP ${packet.destination} ／ ${packet.protocol} ／ ${packet.part??''} ${packet.content}`:stage.payload??'経路表と画面の状態を確認'}</span></div><div className="s03-mobile-map-state">{kind==='web'&&step>=prepareIndex&&<ServerPackets step={step} prepareIndex={prepareIndex} arrived={arrived}/ >}{kind==='mail'&&<MailMailbox step={step} receive={receive}/>}<RouteTable kind={kind} selected={selected} destination={kind==='web'&&step>=prepareIndex?'192.0.2.10':packet?.destination}/></div></>;
}
function RouteTable({kind,selected,destination}:{kind:Kind;selected:NodeId;destination?:string}){
 const web:Record<string,string>={r1:'R2',r2:'R4',r3:'この模型では行なし',r4:'Webサーバへ直結',r5:'この模型では行なし',r6:'この模型では行なし'};
 const webReturn:Record<string,string>={r1:'自分のPCへ直結',r2:'R1',r3:'この模型では行なし',r4:'R2',r5:'この模型では行なし',r6:'この模型では行なし'};
 const mail:Record<string,string>={r1:'R3',r2:'この模型では行なし',r3:'R6',r4:'この模型では行なし',r5:'この模型では行なし',r6:'受信側メールサーバへ直結'};
 return <div className="s03-route-table"><b>{selected.toUpperCase()} の経路表</b>{kind==='web'?<><div className={destination==='192.0.2.10'?'s03-route-row':'s03-route-row is-current'}><span>宛先 198.51.100.80/32（Webサーバ）</span><strong>次の転送先 → {web[selected]}</strong></div><div className={destination==='192.0.2.10'?'s03-route-row is-current':'s03-route-row'}><span>宛先 192.0.2.10/32（自分のPC）</span><strong>次の転送先 → {webReturn[selected]}</strong></div></>:<><p>宛先 203.0.113.25/32（受信側メールサーバ）</p><strong>次の転送先 → {mail[selected]}</strong></>}<small>図のルータを押すと、そのルータに記録された経路を確認できます。</small></div>;
}
function Journey({kind,receive='IMAP',onReceive}:{kind:Kind;receive?:Receive;onReceive?:(value:Receive)=>void}){
 const stages=kind==='web'?webStages:mailStages(receive),player=useSteps(stages.length-1),stage=stages[player.step];
 const [manualSelection,setManualSelection]=useState<{step:number;id:NodeId}|null>(null);
 const selected=manualSelection?.step===player.step?manualSelection.id:stage.focus??(routerIds.includes(stage.actor)?stage.actor:'r1');
 const select=(id:NodeId)=>setManualSelection({step:player.step,id});
 const arrived=kind==='web'?Math.max(0,...stages.slice(0,player.step+1).map(s=>s.arrived??0)):0;
 const prepareIndex=webStages.findIndex(s=>s.title==='3つの返事を用意');
 return <Frame id={kind==='web'?'web-journey':'mail-journey'} title={kind==='web'?'Webページはどう届く？':'メールはどう届き、どう読む？'} controls={<StepControls player={player} max={stages.length-1}/>}>
 {kind==='mail'&&onReceive&&<div className="s03-mode is-inside" role="group" aria-label="メールの受信方法"><b>受信方法を選ぶ</b><button type="button" aria-pressed={receive==='POP'} onClick={()=>onReceive('POP')}>POP：PCへ取り込む</button><button type="button" aria-pressed={receive==='IMAP'} onClick={()=>onReceive('IMAP')}>IMAP：サーバに残す</button></div>}
 <div className="s03-stage"><div><small>いまの場面 · {player.step+1}/{stages.length}</small><h4>{stage.title}</h4></div><span className="s03-stage-type">{kind==='web'?'HTTPS とパケット':'SMTP → POP / IMAP'}</span></div>
 <Map kind={kind} receive={receive} stage={stage} step={player.step} selected={selected} onSelect={select} prepareIndex={prepareIndex} arrived={arrived}/>
 {kind==='mail'&&<details className="s03-mx-note"><summary>補足：MXとは？</summary><p>MXはDNSにある「そのドメインへのメールを受け取るサーバ名」の記録です。MX自体はIPアドレスではありません。サーバ名を調べた後、そのIPアドレスを調べて配送します。この図では教科書に合わせ、その名前解決をまとめて示しています。 <a href="https://www.rfc-editor.org/rfc/rfc6950.html" target="_blank" rel="noreferrer">技術資料</a></p></details>}
 <Notice title={stage.title}>{stage.detail}</Notice><p className="in-small">05-02の「隣へ尋ねて経路表を育てる」は仕組みを学ぶための模型です。ここでは経路が記録済みとして転送します。DNSの名前の記憶とルータの経路表は別です。図のHTTPS・SMTPの内容は学習用に見せています。</p></Frame>;
}
export function WebLesson(){return <Section id="web" n={1} title="Webページが表示されるまで" blank="①〜⑥" page="p.136"><p className="in-lead">URLを入力してから画面にページが現れるまで、05-02で育てた経路表を使って追おう。</p><Journey kind="web"/><Guide mood="understood"><b>DNSが返したのは住所。<br/>ページを返すのはWebサーバだよ。</b><p>ルータは宛先IPで次を選びます。HTTPSはWebの要求と応答をTLSで保護し、データは下位層の仕組みで運ばれます。</p></Guide><Terms section={1}/></Section>}
function MailJourney(){const [receive,setReceive]=useState<Receive>('POP');return <Journey key={receive} kind="mail" receive={receive} onReceive={setReceive}/>}
export function MailLesson(){return <Section id="mail" n={2} title="メールはどう届き、どう読む？" blank="⑦〜⑨" page="p.137"><p className="in-lead">送信側サーバから受信側サーバまでの道を追い、最後の受信方法を切り替えて比べよう。</p><MailJourney/><Guide mood="understood"><b>SMTPは届ける役、<br/>POPとIMAPは読むときの役だよ。</b><p>メールは受信側サーバに届いてから、受信者の端末が取りに行きます。POPはダウンロード、IMAPはサーバ上での管理が中心です。</p></Guide><Terms section={2}/></Section>}


