'use client';
import {useState} from 'react';
import {Frame,Notice} from './LessonParts';

const actions=[
 {name:'Webページを見る',target:'公開Webサーバ',port:'443',service:'HTTPS',example:'ブラウザで公開されたWebページを開く'},
 {name:'学校の管理機器を変更する',target:'学校の管理機器',port:'22',service:'管理用接続',example:'機器の設定画面につながる入口へ接続する'},
 {name:'授業データを取り出す',target:'授業用サーバ',port:'8443',service:'授業用アプリ',example:'授業の資料を校内のサーバから取得する'},
] as const;
type Source='学習用PC'|'外部の端末';
const sources:Source[]=['学習用PC','外部の端末'];
const keyFor=(source:Source,port:string)=>`${source}:${port}`;
const startingRules:Record<string,boolean>={
 '学習用PC:443':false,'学習用PC:22':false,'学習用PC:8443':false,
 '外部の端末:443':false,'外部の端末:22':false,'外部の端末:8443':false,
};
function startingRecommendation(source:Source,port:string){return port==='443'||(source==='学習用PC'&&port==='8443')}
function firewallOutcome(source:Source,port:string,allowed:boolean){
 if(port==='443')return allowed?'✓ 公開Webページを表示できました。':'× 公開Webサイトが見られません。443番を通す設定が必要です。';
 if(port==='22')return allowed?`⚠ ${source}から学校の管理機器に接続できてしまいます。設定変更につながるため、管理担当者だけに限定しよう。`:'✓ 管理用の入口を止め、学校の機器を守れました。';
 return source==='学習用PC'?(allowed?'✓ 学習用PCから授業データを取り出せました。':'× 生徒が必要な授業データを取れません。8443番を見直そう。'):(allowed?'⚠ 外部の端末から授業データが取り出せてしまいます。校内だけに限定しよう。':'✓ 外部の端末から授業データを取り出す操作を止めました。');
}
export function FirewallLab(){
 const [rules,setRules]=useState(startingRules),[source,setSource]=useState<Source|null>(null),[action,setAction]=useState<number|null>(null);
 const item=action===null?null:actions[action];
 const ready=source!==null&&item!==null;
 const allowed=ready?rules[keyFor(source,item.port)]:false;
 const good=ready&&allowed===startingRecommendation(source,item.port);
 return <Frame id="firewall-lab" title="ファイアウォールを設定する">
  <p>送信元ごとに、3つの行為を「通す／止める」で設定しよう。公開Webページの名前は利用者側のDNSで調べられるため、ここでは校内DNSを扱いません。</p>
  <div className="s03-port-key" aria-label="ポート番号の意味">{actions.map(value=><div key={value.port}><b>{value.port}番</b><span>{value.service}</span></div>)}</div>
  <div className="s03-firewall-layout"><div className="s03-firewall-matrix">{sources.map(from=><div className="s03-matrix-group" key={from}><h4>{from==='学習用PC'?'💻':'🌐'} {from}から</h4>{actions.map(value=>{const rule=rules[keyFor(from,value.port)];return <div className="s03-matrix-row" key={value.port}><span>{value.target}<small>{value.port}番・{value.service}</small></span><div className="s03-rule-choices" role="group" aria-label={`${from}から${value.target}への通信。どちらか一つを選ぶ`}>{[true,false].map(choice=><label key={String(choice)} className={rule===choice?'is-chosen':''}><input type="checkbox" checked={rule===choice} onChange={()=>setRules(old=>({...old,[keyFor(from,value.port)]:choice}))}/>{choice?'通す':'止める'}</label>)}</div></div>})}</div>)}</div>
  <div className="s03-firewall-simulator"><div className="s03-firewall-try"><b>この設定で何が起きる？</b><div className="s03-firewall-choice-group"><strong>① どこから？</strong><div className="s03-source-picker" role="group" aria-label="どこから通信するか">{sources.map(value=><button type="button" key={value} aria-pressed={source===value} onClick={()=>setSource(value)}>{value==='学習用PC'?'💻':'🌐'} {value}</button>)}</div></div><div className="s03-firewall-choice-group"><strong>② 何をする？</strong><div className="s03-action-picker" role="group" aria-label="何をするか">{actions.map((value,i)=><button type="button" key={value.port} aria-pressed={action===i} onClick={()=>setAction(i)}>{value.name}</button>)}</div></div><p>{ready?item.example:'①と②を選ぶと、通信の結果が表示されます。'}</p></div>
  {ready?<><div className="s03-firewall-big" aria-label="選んだ行為の結果"><div><small>送信元</small><b>{source}</b></div><span>{item.port}番 →</span><div className={allowed?'is-open':'is-blocked'}><strong>🛡️ ファイアウォール</strong><b>{allowed?'通す':'止める'}</b></div><span>→</span><div><small>宛先</small><b>{item.target}</b></div></div><div className={`s03-outcome ${good?'is-good':'is-bad'}`} role="status"><Notice title={good?'✓ この設定でよい':'⚠ 設定を見直そう'}>{firewallOutcome(source,item.port,allowed)}</Notice></div></>:null}
  <div className="s03-rule"><b>「ファイアウォールを解除してください」と出たら？</b><p>全体を解除せず、アプリ・送信元・宛先・ポートを確かめて必要な通信だけ許可します。学校の端末なら先生や管理者に相談しましょう。</p></div></div></div>
  <p className="in-small">説明の参考：<a href="https://support.microsoft.com/en-us/windows/security/windows-security/firewall-and-network-protection-in-the-windows-security-app" target="_blank" rel="noreferrer">Microsoft「ファイアウォールとネットワーク保護」</a> ／ <a href="https://www.cloudflare.com/learning/dns/what-is-dns/" target="_blank" rel="noreferrer">Cloudflare「DNSのしくみ」</a></p>
 </Frame>;
}

type Role='生徒'|'教員';type Folder='全体共有'|'教員資料';type Permission={read:boolean;edit:boolean};
const matrixRows:{role:Role;folder:Folder;read:boolean;edit:boolean}[]=[
 {role:'生徒',folder:'全体共有',read:true,edit:false},
 {role:'生徒',folder:'教員資料',read:false,edit:false},
 {role:'教員',folder:'全体共有',read:true,edit:true},
 {role:'教員',folder:'教員資料',read:true,edit:true},
];
const initialPermissions:Record<string,Permission>=Object.fromEntries(matrixRows.map(row=>[`${row.role}:${row.folder}`,{read:false,edit:false}]));
const accessScenes=[
 {role:'生徒' as Role,folder:'全体共有' as Folder,action:'read' as const,expect:true,title:'生徒が配布資料を開く',success:'✓ 必要な資料を読めました。',failure:'😕 授業の資料が開けません。読み取りを許可しよう。'},
 {role:'生徒' as Role,folder:'全体共有' as Folder,action:'edit' as const,expect:false,title:'生徒が配布資料を書き換える',success:'⚠ 配布資料を書き換えられました。誤編集を防ぐため変更権限を外そう。',failure:'✓ 読めても変更はできません。'},
 {role:'生徒' as Role,folder:'教員資料' as Folder,action:'read' as const,expect:false,title:'生徒が教員資料を開く',success:'⚠ 教員資料が見えてしまいました。読み取りを止めよう。',failure:'✓ 教員資料へのアクセスを断りました。'},
 {role:'教員' as Role,folder:'教員資料' as Folder,action:'edit' as const,expect:true,title:'教員が教材を更新する',success:'✓ 必要な資料を保存できました。',failure:'😕 保存できません。教員の変更権限を確認しよう。'},
];
export function AccessLab(){
 const [permissions,setPermissions]=useState(initialPermissions),[scene,setScene]=useState<number|null>(null);const current=scene===null?null:accessScenes[scene],key=current?`${current.role}:${current.folder}`:null,right=key?permissions[key]:null,allowed=current&&right?(current.action==='read'?right.read:right.edit):false,good=matrixRows.filter(row=>{const value=permissions[`${row.role}:${row.folder}`];return value.read===row.read&&value.edit===row.edit}).length;
 const setRight=(rowKey:string,type:keyof Permission,value:boolean)=>setPermissions(old=>({...old,[rowKey]:{...old[rowKey],[type]:value,...(type==='edit'&&value?{read:true}:{}),...(type==='read'&&!value?{edit:false}:{})}}));
 return <Frame id="access-lab" title="アクセス制御（アクセス権を設定する）"><p>Windowsの「プロパティ → セキュリティ」を学習用にまとめた表です。最初はすべて未設定。必要な操作だけ「許可」にチェックを入れ、実際の作業を試そう。</p><div className="s03-access-matrix" role="table" aria-label="フォルダのアクセス許可"><div className="s03-access-matrix-head" role="row"><b>利用者</b><b>フォルダ</b><b>読み取り</b><b>変更</b></div>{matrixRows.map(row=>{const rowKey=`${row.role}:${row.folder}`,value=permissions[rowKey];return <div className="s03-access-matrix-row" role="row" key={rowKey}><b role="cell">{row.role}</b><span role="cell">📁 {row.folder}</span><label role="cell"><input type="checkbox" aria-label={`${row.role}が${row.folder}を読み取る`} checked={value.read} onChange={e=>setRight(rowKey,'read',e.target.checked)}/>許可</label><label role="cell"><input type="checkbox" aria-label={`${row.role}が${row.folder}を変更する`} checked={value.edit} onChange={e=>setRight(rowKey,'edit',e.target.checked)}/>許可</label></div>})}</div><p className="s03-config-score">適切な設定：{good}/4 行　（必要な操作は許可し、不要な操作は拒否する）</p><div className="s03-scenario-picker" role="group" aria-label="試す操作">{accessScenes.map((s,i)=><button type="button" key={s.title} aria-pressed={scene===i} onClick={()=>setScene(i)}>{i+1}. {s.title}</button>)}</div>{current&&<><div className="s03-access-scene"><div>👤<b>{current.role}</b></div><span>→ {current.action==='read'?'読む':'変更する'} →</span><div>📁<b>{current.folder}</b></div><strong className={allowed?'is-allowed':'is-denied'}>{allowed?'開く・保存できた':'アクセス拒否'}</strong></div><div className={`s03-outcome ${allowed===current.expect?'is-good':'is-bad'}`} role="status"><Notice title={allowed===current.expect?'✓ 意図どおりの結果':'⚠ 設定を見直そう'}>{allowed?current.success:current.failure}</Notice></div></>}<p className="in-small">実際のWindowsには権限の継承などもあります。操作例：<a href="https://learn.microsoft.com/en-us/windows/security/identity-protection/access-control/access-control" target="_blank" rel="noreferrer">Microsoft「Access Control Overview」</a></p></Frame>;
}

