'use client';
import {useEffect,useState,type MouseEvent} from 'react';
import {createPortal} from 'react-dom';
import {bits,ipv4Number,ipText,maskPrefix,subnet} from './model';
import {Section,Frame,Terms,Details} from './Parts';

function BitRow({label,value,prefix,onBit}:{label:string;value:number;prefix:number;onBit:(i:number,e:MouseEvent<HTMLButtonElement>)=>void}){
 return <div className="in-octet-row"><b>{label}</b><div className="in-octet-groups">{ipText(value).split('.').map((part,group)=><div className="in-octet-group" key={group}><strong>{part}<small>10進数</small></strong><div>{bits(Number(part)).split('').map((bit,j)=>{const i=group*8+j;return <button key={i} className={i<prefix?'network-bit':'host-bit'} onClick={e=>onBit(i,e)} aria-label={`${label}の左から${i+1}番目、現在${bit}`}>{bit}</button>})}</div></div>)}</div></div>;
}
export function SubnetExperience(){
 const [ip,setIp]=useState('192.168.1.120'),[mask,setMask]=useState('255.255.255.0'),[bubble,setBubble]=useState<{x:number;y:number;message:string}|null>(null);
 const prefix=maskPrefix(mask),result=prefix===null?null:subnet(ip,prefix),maskNumber=ipv4Number(mask);
 useEffect(()=>{if(!bubble)return;const timer=setTimeout(()=>setBubble(null),1800);return()=>clearTimeout(timer)},[bubble]);
 const flipIp=(bit:number)=>{if(!result)return;setIp(ipText((ipv4Number(result.ip)!^(2**(31-bit)))>>>0))};
 const flipMask=(bit:number,e:MouseEvent<HTMLButtonElement>)=>{if(prefix===null)return;const next=bit===prefix-1?prefix-1:bit===prefix?prefix+1:null;if(next===null||next<8||next>30){const rect=e.currentTarget.getBoundingClientRect();setBubble({x:Math.max(8,Math.min(rect.left,innerWidth-270)),y:Math.min(rect.bottom+8,innerHeight-92),message:'× できないよ。マスクの1は左から連続。境界のビットだけ動かせます。'});return}setMask(ipText((2**32-2**(32-next))>>>0));setBubble(null)};
 const gateway=result?result.first:'',deviceCount=result?Math.max(0,result.hosts-1):0;
 return <Section id="subnet" n={3} title="ipconfigの数字から、LANの範囲を見つける" blank="⑧・⑬・⑯〜⑱" page="pp.132–133">
  <p className="in-lead">自分のIPv4とマスクを入れ、0・1を押して数値の変化を試そう。</p>
  <Frame id="subnet-lab" title="IPv4・マスクから計算"><div className="in-input-row"><label>IPv4 アドレス<input value={ip} onChange={e=>setIp(e.target.value)} inputMode="decimal" placeholder="192.168.1.120"/></label><label>サブネットマスク<input value={mask} onChange={e=>{setMask(e.target.value);setBubble(null)}} inputMode="decimal" placeholder="255.255.255.0"/></label></div>
   {!result?<p className="in-error" role="status">IPv4は0～255の4組、マスクは左から1が続く形で入力してね。この教材では /8～/30 を扱います。</p>:<>
    <p className="in-binary-cue">２進数に直すと ↓ <small>上の10進数を8ビットずつの0・1に分けました</small></p>
    <div className="in-bit-legend"><span>■ 青：ネットワーク部 {result.prefix}ビット</span><span>▧ 黄：ホスト部 {result.hostBits}ビット</span></div>
    <div className="in-octet-scroll" tabIndex={0} aria-label="IPv4とマスクの2進数。横にスクロールできます"><BitRow label="IPv4" value={ipv4Number(result.ip)!} prefix={result.prefix} onBit={flipIp}/><BitRow label="マスク" value={maskNumber!} prefix={result.prefix} onBit={flipMask}/></div>
    <div className="in-prefix-strip"><b>プレフィックス表記</b><span>左から <strong>{result.prefix}個連続で1</strong> → <strong className="in-prefix-answer">/{result.prefix}</strong></span><code>{result.ip}/{result.prefix}</code><small>ipconfigには通常この「/」の形では出ません。</small></div>
    <div className="in-calculation-path in-textbook-calcs"><div><b>① ネットワークアドレス</b><code>{result.network}/{result.prefix}</code><small>IPv4とマスクをANDすると出る、ネットワーク全体の住所。端末には付けません。</small></div><div><b>② ブロードキャストアドレス</b><code>{result.broadcast}</code><small>ネットワークアドレスのホスト部を全部1にした住所。同じLANの全員への一斉送信用で、端末には付けません。</small></div></div>
    <div className="in-range-diagram"><div className="in-range-edge"><small>左側・ネットワークアドレス</small><b><code>{result.network}</code></b><span>端末には使わない</span></div><div className="in-range-middle"><small>教科書の「接続できる台数」</small><strong>{result.first} <em>～</em> {result.last}</strong><b>{result.hosts.toLocaleString()}個</b><span>端末やルータに使える住所の候補</span></div><div className="in-range-edge last"><small>右側・ブロードキャストアドレス</small><b><code>{result.broadcast}</code></b><span>端末には使わない</span></div></div>
    <Details title="発展：デフォルトゲートウェイとは？"><p>別のネットワークへ出るとき、端末が最初に送る<strong>ルータの出入り口</strong>です。この模型では候補の先頭 <code>{gateway}</code> をルータに設定したとします。これはANDで求めたネットワークアドレス <code>{result.network}</code> とは別の番号です。ゲートウェイは必ず先頭の番号とは限らず、実際の設定は <code>ipconfig /all</code> で確認します。</p><p>教科書の計算は<strong>{result.hosts.toLocaleString()}個</strong>。そのうちルータが1個を使うこの例では、PC・スマホなど<strong>ほかの機器は{deviceCount.toLocaleString()}個</strong>までが住所の候補です。</p></Details>
    <div className="in-wifi-task"><b>自宅のWi-Fiにつなぐと、何台まで住所を付けられる？</b><p>自宅のPCで <code>ipconfig /all</code> を見て、IPv4とマスクを上に入れよう。ホスト部が {result.hostBits} ビットなら 2<sup>{result.hostBits}</sup> − 2 = <strong>{result.hosts.toLocaleString()}個</strong>。ネットワークアドレスとブロードキャストアドレスの2個を除く、教科書と同じ計算です。</p><small>実際の接続可能台数は、ルータなどが使う住所や機器の性能・設定によって少なくなります。</small></div>
   </>}
  </Frame>{bubble&&typeof document!=='undefined'&&createPortal(<div className="in-bit-error-bubble" style={{left:bubble.x,top:bubble.y}} role="alert">{bubble.message}</div>,document.body)}<Terms section={3}/>
 </Section>;
}
