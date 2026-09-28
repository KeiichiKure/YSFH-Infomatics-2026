'use client';
import {useState} from 'react';
import {Details,Notice} from './Parts';

const observations=[
 {label:'設定を読む',command:'ipconfig /all',lines:[['IPv4 Address : 192.168.1.120','自分の端末のIPv4アドレスです。'],['Subnet Mask : 255.255.255.0','/24に対応するマスクです。'],['Default Gateway : 192.168.1.1','デフォルトゲートウェイ（家の出入り口）です。'],['DNS Servers : 192.168.1.53','名前を問い合わせるDNSのIPです。']]},
 {label:'名前を調べる',command:'nslookup www.festival.example.jp',lines:[['Server : dns.example.jp','問い合わせ先DNSの名前です。'],['Address : 192.168.1.53','こちらはDNS自身のIPです。'],['Name : www.festival.example.jp','調べた名前です。'],['Address : 198.51.100.80','こちらは調べた名前に対応するIPです。']]},
 {label:'応答を読む',command:'ping 192.168.1.1',lines:[['Reply from 192.168.1.1: bytes=32 time=1ms TTL=64','IP層の疎通確認に対する応答です。Webサービスの正常動作までは分かりません。'],['Request timed out.','応答なしは、機器や回線の問題だけでなく、応答を制限する設定でも起こり得ます。']]},
];
export function Observation(){const [tab,setTab]=useState(0),[line,setLine]=useState(0);const o=observations[tab];return <Details title="任意の観察：Windowsのコマンド出力を読んでみる"><p>以下はクリックして読む<strong>模擬出力</strong>です。このページからコマンドや外部通信は実行しません。</p><div className="in-buttons">{observations.map((x,i)=><button aria-pressed={tab===i} key={x.label} onClick={()=>{setTab(i);setLine(0)}}>{x.label}</button>)}</div><div className="in-terminal"><b>C:\ &gt; {o.command}</b>{o.lines.map(([text],i)=><button key={text} aria-pressed={line===i} onClick={()=>setLine(i)}>{text}</button>)}</div><Notice title="選んだ行の読み方">{o.lines[line][1]}</Notice><p>実際に観察するときは、Windowsのコマンドプロンプトで行います。学校の利用条件と先生の指定に従い、名前やIPは指定された対象に置き換えてください。架空の .example は実際には名前解決できません。端末のアドレスをこの教材へ入力・送信する必要はありません。</p></Details>}
