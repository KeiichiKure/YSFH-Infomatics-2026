'use client';
import {useEffect,useState} from 'react';
import {Device,Frame,Notice} from './Parts';
import {ipv4Number} from './model';

const chain=[
 {name:'ICANNのIANA機能',range:'0.0.0.0 ～ 255.255.255.255',count:'約42億9,497万通り',note:'IPv4の数字全体。予約済み・私用の範囲も含む',real:true},
 {name:'APNIC（アジア太平洋）',range:'複数の範囲（例：1.0.0.0 ～ 1.255.255.255）',count:'約8億8,500万個',note:'2025年末の全RIR割り当て約36.87億個の約24%。例示範囲だけなら1,677万7,216個',real:true},
 {name:'日本の登録規模',range:'複数の範囲（例：1.0.16.0 ～ 1.0.31.255）',count:'1億8,874万2,464個',note:'2025年末の国別登録集計。例示範囲だけなら4,096個',real:true},
 {name:'接続事業者 A社（模型）',range:'1.0.16.0 ～ 1.0.16.255',count:'256個',note:'上の範囲から分けると仮定した例',real:false},
 {name:'家庭用ルータ（模型）',range:'外側 1.0.16.10',count:'1個',note:'A社の範囲から、この家に渡した例',real:false},
] as const;
const machines=[{name:'自分のPC',ip:'192.168.1.120',kind:'pc'},{name:'家族のスマホ',ip:'192.168.1.121',kind:'pc'},{name:'新しく買ったプリンター',ip:'192.168.1.50',kind:'server'}] as const;
const dhcp=[
 {who:'端末',say:'電源ON。まだ家の中の住所を知りません。',packet:'接続準備',direction:'none'},
 {who:'端末',say:'設定を配る人はいますか？',packet:'Discover：設定を探す',direction:'left'},
 {who:'家庭用ルータ',say:'使える住所を貸せますよ。',packet:'Offer：番号を提案',direction:'right'},
 {who:'端末',say:'その番号を使いたいです。',packet:'Request：番号を要求',direction:'left'},
 {who:'家庭用ルータ',say:'決まり！ 家の中の住所を渡します。',packet:'ACK：貸し出し確定',direction:'right'},
] as const;
export function NetworkOverview(){
 const [level,setLevel]=useState(0),[movingTo,setMovingTo]=useState<number|null>(null),[method,setMethod]=useState<'dhcp'|'fixed'>('dhcp');
 const [on,setOn]=useState<boolean[]>([false,false,false]),[active,setActive]=useState<number|null>(null),[phase,setPhase]=useState(0);
 const [fixedIps,setFixedIps]=useState<string[]>([machines[0].ip,machines[1].ip,'']),[setting,setSetting]=useState<number|null>(null),[draftIp,setDraftIp]=useState(''),[error,setError]=useState('');
 useEffect(()=>{if(movingTo===null)return;const timer=setTimeout(()=>{setLevel(movingTo);setMovingTo(null)},1100);return()=>clearTimeout(timer)},[movingTo]);
 const advanceAllocation=()=>{if(level===0)setLevel(1);else if(level<chain.length)setMovingTo(level+1)};
 const configuredIp=(i:number)=>method==='fixed'?fixedIps[i].trim():machines[i].ip;
 const inHomeRange=(ip:string)=>{const n=ipv4Number(ip);return n!==null&&n>=ipv4Number('192.168.1.2')!&&n<=ipv4Number('192.168.1.254')!};
 const duplicate=(i:number)=>method==='fixed'&&on[i]&&fixedIps[i]!==''&&on.some((other,j)=>j!==i&&other&&fixedIps[j]===fixedIps[i]);
 const connected=(i:number)=>on[i]&&(method==='dhcp'||inHomeRange(fixedIps[i])&&!duplicate(i));
 const status=(i:number)=>!on[i]?method==='dhcp'?'電源OFF':fixedIps[i]?'電源OFF · 設定済み':'電源OFF · IP未設定':method==='dhcp'?machines[i].ip:!fixedIps[i]?'× IP未設定':duplicate(i)?`× IP重複 ${fixedIps[i]}`:!inHomeRange(fixedIps[i])?`× 範囲外 ${fixedIps[i]}`:`✓ 接続 ${fixedIps[i]}`;
 const start=(i:number)=>{if(active!==null)return;setError('');if(on[i]){setOn(v=>v.map((x,j)=>j===i?false:x));if(setting===i)setSetting(null);return}if(method==='fixed'){setOn(v=>v.map((x,j)=>j===i?true:x));return}setActive(i);setPhase(0)};
 const next=()=>{if(active===null)return;if(phase===4){setOn(v=>v.map((x,j)=>j===active?true:x));setActive(null);setPhase(0)}else setPhase(v=>v+1)};
 const openSetting=(i:number)=>{setSetting(i);setDraftIp(fixedIps[i]);setError('')};
 const saveSetting=()=>{if(setting===null)return;const ip=draftIp.trim();if(ipv4Number(ip)===null){setError('IPv4アドレスを4組の0～255の数字で入力してね。');return}setFixedIps(v=>v.map((old,i)=>i===setting?ip:old));setSetting(null);setError('')};
 const switchMethod=(m:'dhcp'|'fixed')=>{setMethod(m);setActive(null);setPhase(0);setOn([false,false,false]);setSetting(null);setError('')};
 const current=dhcp[phase];
 return <>
  <Frame id="internet-overview" title="大きな住所の範囲が、家まで届く">
   <p className="in-small">まだ番号は見えません。「次へ」で、誰が<strong>どの範囲を何個</strong>受け取ったか順に確かめよう。</p>
   <div className="in-alloc-controls"><button disabled={level===0||movingTo!==null} onClick={()=>setLevel(v=>v-1)}>← 戻る</button><button className="in-primary" disabled={level===chain.length||movingTo!==null} onClick={advanceAllocation}>{movingTo!==null?'割り当て中…':'次へ →'}</button><span className="in-counter">{level} / {chain.length} 段階</span></div>
   <div className="in-alloc-flow">{chain.map((item,i)=><div className="in-alloc-piece" key={item.name}>
    <div className={`in-alloc-card ${level===i+1?'is-current':''} ${level<=i?'is-pending':''}`}><span className="in-alloc-order">{i+1}</span><div><b>{item.name}</b>{level>i?<><code className="in-alloc-reveal">{item.range}</code><strong className="in-alloc-reveal">{item.count}</strong><small>{item.note} · {item.real?'公開資料にある範囲':'授業用の仮定'}</small></>:<><code className="in-alloc-hidden">? ～ ?</code><strong className="in-alloc-hidden">? 個</strong><small>まだ受け取った範囲は見えない</small></>}</div></div>
    {i<chain.length-1&&<div className={`in-alloc-arrow ${movingTo===i+2?'is-moving':''}`}><span>↓</span><small>持っている中から分けて渡す</small>{movingTo===i+2&&<em key={movingTo}>{chain[i+1].range}</em>}</div>}
   </div>)}</div>
   <Notice title={level===0?'まず管理する全体から':'上の範囲から、下へ分ける'}>{level===0?'「次へ」を押すたび、登録規模と、その中の代表的な住所の範囲が現れます。':level===1?'IPv4は2の32乗で約43億通り。予約番号なども含む総数です。':level===2?'「登録・割り当て済み」と「経路上で公表中」は別の数です。約7億5,100万という数字と同じ基準だとは確認できないため、ここは2025年末の登録・割り当て済みの概数に統一しています。':level===3?'日本全体は4,096個ではありません。2025年末の登録規模は約1.89億個。約2億という資料も時点・集計方法が違い、4,096個はその中の一例です。':'A社と家への細分けは授業用の仮定。家の外側のグローバルIPは一つです。'}</Notice>
   <p className="in-small">根拠：<a href="https://www.iana.org/assignments/ipv4-address-space" target="_blank" rel="noreferrer">IANAのIPv4登録簿</a>・<a href="https://blog.apnic.net/2026/01/20/ip-addresses-through-2025/" target="_blank" rel="noreferrer">APNICの2025年末集計</a>。APNICの約8.85億は同集計の約36.87億×24%による概算。日本の1億8,874万2,464は同集計の国別登録数です。<a href="https://labs.apnic.net/dists/v4.html" target="_blank" rel="noreferrer">2020年のAPNIC統計</a>では日本は約2.05億とされ、数値は変化します。A社と家庭への細分けだけが模型です。</p>
  </Frame>
  <Frame id="home-power" title="家の機器の電源を入れてみよう"><div className="in-home-power">
   <div className="in-heading"><h4>外側の1個を受け取った家で</h4><span className="in-chip">外側 1.0.16.10</span></div>
   <div className="in-buttons" role="group" aria-label="IPの設定方式"><button aria-pressed={method==='dhcp'} onClick={()=>switchMethod('dhcp')}>DHCP · 自動で受け取る</button><button aria-pressed={method==='fixed'} onClick={()=>switchMethod('fixed')}>固定IP · 自分で設定</button></div>
   <div className="in-home-actions"><div><b>{method==='fixed'?'固定IP：機器ごとの番号を管理しよう':active===null?'家の機器を順に電源ONにしよう':`${phase+1} / 5 · ${current.packet}`}</b><small>{method==='fixed'?'電源ONの機器で「IPを設定・変更」を押そう。同じ番号で2台をONにすると両方が衝突します。':active===null?'最初は全機器がOFF。PC・スマホ・新しいプリンターを試そう':current.say}</small></div>{method==='dhcp'&&<><button disabled={active===null||phase===0} onClick={()=>setPhase(v=>Math.max(0,v-1))}>← 戻る</button><button className="in-primary in-home-next" disabled={active===null} onClick={next}>次へ →</button></>}</div>
   {method==='fixed'&&setting!==null&&<div className="in-printer-setting"><label>{machines[setting].name}に設定するIPv4<input value={draftIp} onChange={e=>{setDraftIp(e.target.value);setError('')}} inputMode="decimal" placeholder="例：192.168.1.50" aria-label={`${machines[setting].name}のIPv4アドレス`}/></label><small>家の範囲：192.168.1.2 ～ 192.168.1.254。別の機器と同じ番号も試せます。設定後、両方がONになると衝突します。</small><button className="in-primary" onClick={saveSetting}>このIPを設定する</button><button onClick={()=>{setSetting(null);setError('')}}>閉じる</button></div>}
   <div className="in-home-scene"><div className="in-home-router"><Device kind="router" label="家庭用ルータ" sub="外側のグローバルIP 1.0.16.10" active={active!==null&&method==='dhcp'&&current.who==='家庭用ルータ'}/>{active!==null&&method==='dhcp'&&current.who==='家庭用ルータ'&&<div className="in-local-bubble">{current.say}</div>}</div><div className="in-home-wire"><span>外側の1個から<br/>家の機器を仕分ける</span>{active!==null&&method==='dhcp'&&phase>0&&<b key={`${active}-${phase}`} className={`in-home-packet ${current.direction==='left'?'to-router':'to-device'}`}>{current.packet}</b>}</div><div className="in-home-devices">{machines.map((m,i)=><div key={m.name} className={`${active===i?'is-current':''} ${method==='fixed'&&on[i]&&!connected(i)?'is-disconnected':''}`}><Device kind={m.kind} label={m.name} sub={method==='dhcp'&&active===i?'設定中…':status(i)} active={connected(i)}/>{active===i&&method==='dhcp'&&current.who==='端末'&&<div className="in-local-bubble">{current.say}</div>}{method==='fixed'&&on[i]&&<button className={`in-ip-setting-button ${!connected(i)?'is-error':''}`} onClick={()=>openSetting(i)}>{!fixedIps[i]?'× IP未設定 · IPを設定する':`IPを変更する`}</button>}<button disabled={active!==null} onClick={()=>start(i)}>{on[i]?'電源を切る':'電源ON'}</button></div>)}</div></div>
   <div className={`in-home-feedback ${error||method==='fixed'&&on.some((value,i)=>value&&!connected(i))?'is-error':''}`} role="status"><b>{error?'× 入力を確認':method==='fixed'&&on.some((value,i)=>value&&!connected(i))?'× 接続できない機器があります':`${on.filter((_,i)=>connected(i)).length}台が接続中`}</b><p>{error|| (method==='fixed'&&on.some((value,i)=>value&&duplicate(i))?'同じIPアドレスを使う2台は両方とも通信できません。片方のIPを変更するか、電源を切って確かめよう。':method==='fixed'&&on.some((value,i)=>value&&!connected(i))?'IP未設定か、この家の範囲外です。赤い機器の「IPを設定・変更」を押そう。':active!==null?current.say:on[2]&&connected(2)?`新しいプリンターも ${configuredIp(2)} で接続できた！`:'外側には1個のグローバルIP。機器の電源を入れて違いを比べよう。')}</p></div>
   <div className="in-method-compare"><div><b>DHCP</b><p>新しい機器も電源を入れると、ルータとやり取りして空いた番号を自動でもらえる。再接続時に番号が変わることがあります。</p></div><div><b>固定IP</b><p>新しい機器には最初は番号がない。範囲内で重複しない番号を自分で設定する必要があります。番号を一定にできる利点があります。</p></div></div>
  </div></Frame>
 </>;
}
