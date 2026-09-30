'use client';
import {useState} from 'react';
import {Section,Frame,Terms,Details,Guide} from './Parts';

const questions=[
 {url:'https://www.kantei.go.jp/',q:'このURLが指す相手は？',options:['日本の政府機関のWebサイト','日本の学校のメールアドレス','海外の通販サイト'],correct:0,feedback:['go.jp は日本の政府機関向け。www はWeb用の名前です。','メールなら通常「利用者名@ドメイン名」の形。これはhttps://で始まるWebのURLです。','右端が.jpで、go.jp は日本の政府機関向け。海外の通販とは読み取れません。']},
 {url:'https://www.kantei.go.jp/',q:'右端の「jp」は何を示す？',options:['日本の国別ドメイン','ページが必ず日本語','サイトが必ず安全'],correct:0,feedback:['jp は日本を示す国別トップレベルドメインです。','jp のサイトに外国語のページもあります。言語の保証ではありません。','jp という名前だけで運営者や内容の安全性は保証されません。']},
 {url:'http://shop.example/order',q:'https:// と比べ、通信はどう違う？',options:['http:// でも通信は暗号化される','https:// と比べて暗号化されず、通信内容を見られるおそれがある','https:// なら偽サイトの可能性はないが、http:// ならある'],correct:1,feedback:['http:// の通信は暗号化されません。途中で通信内容を見られるおそれがあります。','正解。http:// は通信を暗号化しません。https:// はブラウザとサイトの間の通信を暗号化します。','https:// の偽サイトもあります。暗号化と、そのサイトが本物かどうかは別の問題です。']},
 {url:'https://www.kantei.go.jp/news',q:'FQDN（ホストの完全な名前）は？',options:['https://www.kantei.go.jp/news','www.kantei.go.jp','/news'],correct:1,feedback:['https:// は通信方式、/news はページの場所。FQDNには含みません。','正解。www.kantei.go.jp がホストの完全な名前です。','/news はWebサーバ内の場所を示すパスです。']},
 {url:'taro@school.example',q:'メールの送り先組織側を表すのは？',options:['taro','@','school.example'],correct:2,feedback:['taro は利用者名。組織側は@の右側を見ます。','@ は利用者とドメインを分ける記号です。','正解。@ の右側 school.example がドメイン名です。']},
 {url:'https://www.kantei.go.jp.login.example/',q:'首相官邸の公式ドメインと一致する？',options:['一致する','一致しない','HTTPSなら一致する'],correct:1,feedback:['末尾から読むと実際のドメインは login.example。kantei.go.jp はその前の名前に過ぎません。','正解。実際のドメインは login.example です。','HTTPSは通信の暗号化。ドメインの一致を保証しません。']},
 {url:'https://official.example/',q:'名前だけで「信頼できる」と決められる？',options:['official なら安全','HTTPSなら安全','URLだけでは決められない'],correct:2,feedback:['official は誰でも名前に使える文字。公式案内と運営者を確認します。','HTTPSは通信を暗号化しますが、運営者の信頼性は別です。','正解。公式案内から辿り、綴りと運営者を確かめます。']},
] as const;
const suffixes=[
 {name:'co.jp',role:'日本の会社',why:'日本で登記した会社向け'},
 {name:'ed.jp',role:'日本の小・中・高校など',why:'日本の初等中等教育機関向け'},
 {name:'go.jp',role:'日本の政府機関など',why:'政府機関など向け'},
 {name:'.uk',role:'英国',why:'英国の国別ドメイン'},
 {name:'.de',role:'ドイツ',why:'ドイツの国別ドメイン'},
 {name:'.com',role:'一般のドメイン',why:'現在は商用以外でも使える'},
 {name:'.edu',role:'主に米国の高等教育機関',why:'登録資格のある機関向け'},
] as const;
const roleOrder=[3,0,5,2,6,1,4];
function DomainLevelUp(){
 const [left,setLeft]=useState<number|null>(null),[matches,setMatches]=useState<Record<number,number>>({}),[feedback,setFeedback]=useState('左の名前を押し、右の役割と線で結ぼう。'),[wrong,setWrong]=useState<number|null>(null);
 const chooseRole=(index:number)=>{if(left===null){setFeedback('まず左のドメインを選ぼう。');return}const target=roleOrder[index];if(target===left){setMatches(m=>({...m,[left]:index}));setFeedback(`✓ ${suffixes[left].name} → ${suffixes[left].role}。${suffixes[left].why}。`);setLeft(null);setWrong(null)}else{setFeedback(`ちがいます。${suffixes[left].name} は「${suffixes[target].role}」ではありません。もう一度結ぼう。`);setWrong(index)}};
 const complete=Object.keys(matches).length===suffixes.length;
 return <div className="in-panel in-domain-level"><div className="in-heading"><h3>レベルアップ · 名前と役割を結ぼう</h3><span className="in-chip">{Object.keys(matches).length} / 7 組</span></div><div className="in-match-board"><svg viewBox="0 0 100 518" preserveAspectRatio="none" aria-hidden="true">{Object.entries(matches).map(([a,b])=><line key={a} x1="41" y1={Number(a)*74+37} x2="59" y2={Number(b)*74+37} className="in-match-line"/>)}</svg><div>{suffixes.map((s,i)=><button key={s.name} className={`in-match-item ${left===i?'is-picked':''} ${matches[i]!==undefined?'is-correct':''}`} disabled={matches[i]!==undefined} onClick={()=>{setLeft(i);setWrong(null)}}>{s.name}</button>)}</div><div>{roleOrder.map((i,j)=><button key={i} className={`in-match-item ${wrong===j?'is-wrong':''} ${matches[i]===j?'is-correct':''}`} disabled={matches[i]===j} onClick={()=>chooseRole(j)}>{suffixes[i].role}</button>)}</div></div><div className={`in-match-feedback ${wrong!==null?'is-wrong':complete?'is-complete':''}`} role="status">{complete?'🎉 全部結べた！ ドメインの末尾に、組織や国の手掛かりがあるね。':feedback}</div>{complete&&<div className="in-celebration" aria-hidden="true">✦ ✧ ★ ✦ ✧ ★</div>}<p className="in-small">名前だけで信頼できるサイトかは決まりません。<a href="https://jprs.jp/about/jp-dom/spec/" target="_blank" rel="noreferrer">JPRSの登録資格一覧</a></p></div>;
}
export function NameQuiz(){
 const [number,setNumber]=useState(0),[answers,setAnswers]=useState<(number|null)[]>(questions.map(()=>null)),[passed,setPassed]=useState<boolean[]>(questions.map(()=>false));
 const item=questions[number],answer=answers[number],all=passed.every(Boolean);
 const select=(i:number)=>{setAnswers(a=>a.map((v,j)=>j===number?i:v));if(i===item.correct)setPassed(a=>a.map((v,j)=>j===number?true:v))};
 return <Section id="names" n={4} title="いつものURL・メールを読み解く" blank="㉑㉒" page="p.133"><p className="in-lead">ブラウザのアドレス欄で見る文字列。右端や区切りから役割を予想しよう。</p>
  <Frame id="name-lab" title="住所から読み解く7問クイズ"><div className="in-quiz-pager"><span>{number+1} / {questions.length} 問 · 正解 {passed.filter(Boolean).length} 問</span><div>{questions.map((_,i)=><button key={i} aria-label={`${i+1}問目`} aria-pressed={number===i} onClick={()=>setNumber(i)}>{passed[i]?'✓':answers[i]===null?'○':'△'}</button>)}</div></div><div className="in-address-bar"><span aria-hidden="true">◀　▶　↻</span><code>{item.url}</code></div><h4 className="in-quiz-prompt">{item.q}</h4><div className="in-quiz-options">{item.options.map((choice,i)=><button key={choice} className={answer===i?(i===item.correct?'is-correct':'is-wrong'):''} aria-pressed={answer===i} onClick={()=>select(i)}><span>{'ABC'[i]}</span>{choice}</button>)}</div><div className={`in-name-reveal ${answer===null?'':answer===item.correct?'is-correct':'is-wrong'}`} role="status"><b>{answer===null?'選んで理由を確かめよう':answer===item.correct?'✓ 正解！':'もう一度。どこを読めば分かる？'}</b><p>{answer===null?'ドメインは右から、メールは @ の左右から読もう。':item.feedback[answer]}</p></div>{all&&<div className="in-quiz-win" role="status"><strong>🎉 全問正解！</strong><span className="in-celebration" aria-hidden="true">★ ✦ ✧ ★ ✦ ✧</span><p>URLを見ただけで分かることと、確認が必要なことを区別できたね。</p></div>}<div className="in-quiz-navigation"><button disabled={number===0} onClick={()=>setNumber(number-1)}>← 前の問題</button><button disabled={number===questions.length-1} onClick={()=>setNumber(number+1)}>次の問題 →</button></div></Frame>
  <DomainLevelUp/><Guide mood="understood"><b>見慣れたアドレスにも手掛かりがある。</b><p>URLは末尾のドメイン、メールは@の右側を読もう。HTTPSだけで運営者の信頼性は決まりません。</p></Guide><Details title="ほかの名前と安全性"><p>jpは国別、com・orgは一般的なトップレベルドメインの例です。HTTPSは通信を暗号化しますが、偽サイトにも使えます。公式案内からリンクをたどり、綴りと運営者を確かめましょう。</p></Details><Terms section={4}/>
 </Section>;
}
