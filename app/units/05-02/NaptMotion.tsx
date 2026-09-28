'use client';
import {useState} from 'react';
import {Device,Frame,Notice,Player,usePlayer,Details} from './Parts';

type Step={actor:'A'|'B'|'router'|'news'|'video';speech:string;label:string;from:string;to:string;travel:'client-router'|'router-web'|'web-router'|'router-client'|'at-router'|'at-memo';memo?:'write-a'|'write-b'|'read-a'|'read-b'};
const onSteps:Step[]=[
 {actor:'A',speech:'ニュースを見たい！ 最終宛先は198.51.100.80。まずデフォルトゲートウェイ（家の出入り口）へ。',label:'AのWeb要求 → デフォルトゲートウェイ',from:'192.168.1.120:51000',to:'次の機器 192.168.1.1',travel:'client-router'},
 {actor:'router',speech:'内側の住所は外では使えない。送り主を203.0.113.1:50000に変えよう。',label:'送り主を外側の番号へ変換',from:'203.0.113.1:50000',to:'198.51.100.80:443',travel:'at-router'},
 {actor:'router',speech:'50000に返事が来たらAへ。忘れないようメモ！',label:'返事用メモにAを書き込む',from:'203.0.113.1:50000',to:'A 192.168.1.120:51000',travel:'at-memo',memo:'write-a'},
 {actor:'router',speech:'メモできた。ニュースサイトへ要求を送るよ。',label:'ニュースサイトへWeb要求',from:'203.0.113.1:50000',to:'198.51.100.80:443',travel:'router-web'},
 {actor:'B',speech:'動画を見たい！ まずデフォルトゲートウェイ（家の出入り口）へ。',label:'BのWeb要求 → デフォルトゲートウェイ',from:'192.168.1.121:51000',to:'次の機器 192.168.1.1',travel:'client-router'},
 {actor:'router',speech:'Bの送り主は203.0.113.1:60000に変えよう。',label:'Bの送り主を変換',from:'203.0.113.1:60000',to:'198.51.100.90:8443',travel:'at-router'},
 {actor:'router',speech:'60000の返事はBへ。もう1行書き足そう。',label:'返事用メモにBを書き込む',from:'203.0.113.1:60000',to:'B 192.168.1.121:51000',travel:'at-memo',memo:'write-b'},
 {actor:'router',speech:'動画サイトへ要求を送るよ。',label:'動画サイトへWeb要求',from:'203.0.113.1:60000',to:'198.51.100.90:8443',travel:'router-web'},
 {actor:'news',speech:'ニュースのページだよ。203.0.113.1:50000へ返すね。',label:'ニュースの返事 → 家のルータ',from:'198.51.100.80:443',to:'203.0.113.1:50000',travel:'web-router'},
 {actor:'router',speech:'50000は誰宛？ 返事用メモを確かめよう。',label:'メモの50000の行を探す',from:'203.0.113.1:50000',to:'メモ → A',travel:'at-memo',memo:'read-a'},
 {actor:'router',speech:'Aだ！ 宛先を192.168.1.120:51000に戻す。',label:'宛先をAの内側IPに書き換える',from:'198.51.100.80:443',to:'192.168.1.120:51000',travel:'at-router'},
 {actor:'router',speech:'ニュースをAへ届けるよ。',label:'ニュースのページ → A',from:'198.51.100.80:443',to:'192.168.1.120:51000',travel:'router-client'},
 {actor:'video',speech:'動画のデータだよ。203.0.113.1:60000へ返すね。',label:'動画の返事 → 家のルータ',from:'198.51.100.90:8443',to:'203.0.113.1:60000',travel:'web-router'},
 {actor:'router',speech:'60000は誰宛？ 返事用メモを確かめよう。',label:'メモの60000の行を探す',from:'203.0.113.1:60000',to:'メモ → B',travel:'at-memo',memo:'read-b'},
 {actor:'router',speech:'Bだ！ 宛先を192.168.1.121:51000に戻す。',label:'宛先をBの内側IPに書き換える',from:'198.51.100.90:8443',to:'192.168.1.121:51000',travel:'at-router'},
 {actor:'router',speech:'動画をBへ届けるよ。',label:'動画のデータ → B',from:'198.51.100.90:8443',to:'192.168.1.121:51000',travel:'router-client'},
];
const offSteps:Step[]=[
 {actor:'A',speech:'ニュースを見たい！ まずデフォルトゲートウェイ（家の出入り口）192.168.1.1へ。',label:'Aの要求 → デフォルトゲートウェイ',from:'192.168.1.120:51000',to:'次の機器 192.168.1.1',travel:'client-router'},
 {actor:'router',speech:'送り主だけ外側203.0.113.1に変え、ポートの区別は記録しない。',label:'区別せずニュースサイトへ',from:'203.0.113.1:51000',to:'198.51.100.80:443',travel:'router-web'},
 {actor:'B',speech:'動画を見たい！ 私もデフォルトゲートウェイへ。',label:'Bの要求 → デフォルトゲートウェイ',from:'192.168.1.121:51000',to:'次の機器 192.168.1.1',travel:'client-router'},
 {actor:'router',speech:'Bも送り主だけ外側に変え、対応は記録せず動画サイトへ。',label:'区別せず動画サイトへ',from:'203.0.113.1:51000',to:'198.51.100.90:8443',travel:'router-web'},
 {actor:'news',speech:'ページを203.0.113.1:51000へ返すよ。',label:'ニュースサイトから返事',from:'198.51.100.80:443',to:'203.0.113.1:51000',travel:'web-router'},
 {actor:'router',speech:'あれ、AとBのどちらに返す？ 記録がないから決められない！',label:'返事の送り先が分からない',from:'203.0.113.1:51000',to:'宛先不明',travel:'at-router'},
 {actor:'video',speech:'動画のデータを203.0.113.1:51000へ返すよ。',label:'動画サイトから返事',from:'198.51.100.90:8443',to:'203.0.113.1:51000',travel:'web-router'},
 {actor:'router',speech:'こちらも対応の記録がなく、送り先を決められない！',label:'動画の送り先も分からない',from:'203.0.113.1:51000',to:'宛先不明',travel:'at-router'},
];
function Lab({enabled,onToggle}:{enabled:boolean;onToggle:(value:boolean)=>void}){
 const steps=enabled?onSteps:offSteps,max=steps.length,p=usePlayer(max),step=p.step?steps[p.step-1]:null;
 const speech=(who:Step['actor'])=>step?.actor===who?<div className="in-local-bubble" role="status">{step.speech}</div>:null;
 const memoA=enabled&&p.step>=3,memoB=enabled&&p.step>=7;
 const evidence=enabled&&p.step>=1&&p.step<=3?[{label:'Aが入口へ送った要求',route:'192.168.1.120:51000 → 198.51.100.80:443'},...(p.step>=2?[{label:'ルータが書き換えた要求',route:'203.0.113.1:50000 → 198.51.100.80:443'}]:[])]:enabled&&p.step>=5&&p.step<=7?[{label:'Bが入口へ送った要求',route:'192.168.1.121:51000 → 198.51.100.90:8443'},...(p.step>=6?[{label:'ルータが書き換えた要求',route:'203.0.113.1:60000 → 198.51.100.90:8443'}]:[])]:enabled&&p.step>=9&&p.step<=11?[{label:'ニュースサイトから届いた返事',route:'198.51.100.80:443 → 203.0.113.1:50000'},...(p.step>=11?[{label:'Aへ届けるため書き換え',route:'198.51.100.80:443 → 192.168.1.120:51000'}]:[])]:enabled&&p.step>=13&&p.step<=15?[{label:'動画サイトから届いた返事',route:'198.51.100.90:8443 → 203.0.113.1:60000'},...(p.step>=15?[{label:'Bへ届けるため書き換え',route:'198.51.100.90:8443 → 192.168.1.121:51000'}]:[])]:[];
 return <Frame id="napt-lab" title="返事はA・B、どちらの端末へ？" controls={<Player p={p} max={max}/>}>
  <div className="in-buttons in-napt-switch" aria-label="NAPTの切り替え"><button aria-pressed={enabled} onClick={()=>onToggle(true)}>NAPTあり</button><button aria-pressed={!enabled} onClick={()=>onToggle(false)}>NAPTなし</button></div>
  <p className="in-small">家のルータの<strong>内側 192.168.1.1 がデフォルトゲートウェイ（家の出入り口）</strong>、外側 <strong>203.0.113.1</strong>。要求の次の送り先と、返事の宛先を追おう。</p>
  <div className="in-napt-stage"><div className="in-napt-actor"><Device label="端末A" sub="192.168.1.120:51000" active={step?.actor==='A'}/><div className="in-local-bubble always">ニュースを見たい！</div>{speech('A')}{p.step>=12&&enabled&&<strong className="in-arrival">ニュースが届いた ✓</strong>}<Device label="端末B" sub="192.168.1.121:51000" active={step?.actor==='B'}/>{speech('B')}{p.step>=16&&enabled&&<strong className="in-arrival">動画が届いた ✓</strong>}</div>
   <span className="in-napt-link">⇄</span><div className="in-napt-actor"><Device kind="router" label={enabled?'NAPTルータ':'共用ルータ · 区別なし'} sub="内側 192.168.1.1／外側 203.0.113.1" active={step?.actor==='router'}/>{speech('router')}</div><span className="in-napt-link">⇄</span><div className="in-napt-actor"><Device kind="server" label="ニュースサイト" sub="198.51.100.80:443" active={step?.actor==='news'}/>{speech('news')}<Device kind="server" label="動画サイト" sub="198.51.100.90:8443" active={step?.actor==='video'}/>{speech('video')}</div>
   {step&&step.travel!=='at-memo'&&<div key={`${enabled}-${p.step}`} className={`in-napt-moving ${step.travel}`}><b>{step.label}</b><small>{step.from} → {step.to}</small></div>}
  </div>
  <div className="in-napt-packet-card"><b>{step?.label||'「次へ」で要求と返事を動かそう'}</b>{evidence.length?<div className="in-napt-evidence">{evidence.map((item,i)=><div key={item.label} className={i===1?'is-new':''}><strong>{item.label}</strong><code>{item.route}</code></div>)}</div>:<div className="in-napt-current-route"><span>送信元 <code>{step?.from||'—'}</code></span><span>次の宛先 <code>{step?.to||'—'}</code></span></div>}</div>
  {enabled?<div className="in-napt-mapping"><b>ルータの返事用メモ</b><span className={`in-memo-row ${step?.memo==='write-a'||step?.memo==='read-a'?'is-flashing':''}`}>{memoA?'203.0.113.1:50000 → A 192.168.1.120:51000':'A：まだ記録なし'}</span><span className={`in-memo-row ${step?.memo==='write-b'||step?.memo==='read-b'?'is-flashing':''}`}>{memoB?'203.0.113.1:60000 → B 192.168.1.121:51000':'B：まだ記録なし'}</span>{step?.memo&&<strong key={p.step} className="in-memo-stamp">{step.memo.startsWith('write')?'✎ 新しく書き込んだ！':'🔎 該当する行を発見！'}</strong>}</div>:<div className="in-napt-mapping is-absent"><b>返事用メモ：なし</b><span>外側の1個を共有するなら、返事を分ける記録が必要です。</span></div>}
  <Notice title={enabled?step?.label||'送り主と宛先を比べよう':step?.label||'記録なしで試す'}>{step?.speech||'Aの要求から始めよう。メモの行は、ルータが書き込む段階になるまで現れません。'}</Notice>
  <Details title="ポート番号と、この比較模型について"><p>IPアドレスは機器を、ポート番号はその機器の通信の入口を区別します。443はHTTPSの代表的な入口。動画サイトの8443はこの模型の別入口で、動画サイトが必ず8443を使う意味ではありません。端末の51000は一時的な番号で、NAPTは外側の50000・60000を返事の識別にも使います。</p><p>「NAPTなし」は<strong>同じ外側IPへ送り主だけ変え、端末ごとの対応を記録しない</strong>比較模型です。実際にプライベートIPをそのまま公開インターネットへ出す場合は、返信経路がありません。図の203.0.113.x・198.51.100.xは説明用アドレスです。</p></Details>
 </Frame>;
}
export function NaptMotion(){const [enabled,setEnabled]=useState(true);return <Lab key={enabled?'on':'off'} enabled={enabled} onToggle={setEnabled}/>}
