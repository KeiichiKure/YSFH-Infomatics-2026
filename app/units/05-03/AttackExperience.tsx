'use client';
import {useCallback,useState,type FormEvent} from 'react';
import {Browser,LoginExperience} from './LoginExperience';
import {Frame,Notice} from './LessonParts';

const cases=[
 {answer:'なりすまし',intro:'共有PCに前の人のIDとパスワードが残っています。ログインすると何が起こるでしょう。',reason:'他人の認証情報を無断で使い、本人になってログインする行為です。',actions:['共有PCにはパスワードを保存しない','使い終わったらログアウトする','必要に応じてシークレットモードを使う'],legal:true},
 {answer:'ブルートフォースアタック',intro:'IDは Students01 に固定されています。パスワードを変えてログインを試してみよう。',reason:'同じIDに対して異なるパスワードを何度も試しています。',actions:['長く推測しにくいパスワードを使う','管理者は試行回数を制限する','不審なログイン履歴を確認する']},
 {answer:'リバースブルートフォースアタック',intro:'今度はパスワードを「123456」に固定。IDを変えてログインを試してみよう。',reason:'同じパスワードを多数のIDへ試すため、IDごとの回数制限だけでは見落とす場合があります。',actions:['共通の初期パスワードを変更する','パスワードを使い回さない','管理者は多数のIDへの試行も監視する']},
 {answer:'辞書攻撃',intro:'IDは分かっています。部活名・学校名・誕生日など、思い付きやすい候補を試してみよう。',reason:'よくある単語や、本人に結び付く語をパスワードの候補にする攻撃です。',actions:['誕生日・名前・学校名をそのまま使わない','長く独自のパスワードを作る','別のサービスと使い回さない']},
 {answer:'フィッシング',intro:'「学校アカウントの期限切れ」というメールが届きました。リンク先で何が起こるか確かめよう。',reason:'学校を装った偽のログインページへ誘導し、入力されたIDとパスワードを盗もうとしています。',actions:['メールのリンク先のドメインを確認する','メールのリンクからID・パスワードを入力しない','公式サイトやブックマークから開く','入力してしまったら先生に知らせてパスワードを変更する']},
] as const;
const options=cases.map(item=>item.answer);
type ExperienceProps={index:number;onComplete:()=>void};
function PhishingExperience({onComplete}:Pick<ExperienceProps,'onComplete'>){
 const [phase,setPhase]=useState(0),[id,setId]=useState(''),[password,setPassword]=useState('');
 const submit=(event:FormEvent<HTMLFormElement>)=>{event.preventDefault();if(!id.trim()||!password.trim())return;setPhase(2)};
 return <><Browser url={phase===0?'メールアプリ · 受信トレイ':'school-login.example.test'}>
  {phase===0?<><b>✉ 学校アカウントのお知らせ</b><div className="s03-mail-card">本日中にアカウントを確認してください<small>差出人：学習支援センターを名乗る相手</small></div><button type="button" className="s03-demo-submit" onClick={()=>setPhase(1)}>メールのリンクを開く →</button></>:
   phase===1?<><b>学校アカウント確認</b><p>アカウントの期限が切れます。IDとパスワードを入力してください。</p><form onSubmit={submit} className="s03-demo-form"><div className="s03-login-line"><span>ID</span><input aria-label="学習用の架空のID" value={id} onChange={event=>setId(event.target.value)} placeholder="例：Students01" autoComplete="off"/></div><div className="s03-login-line"><span>パスワード</span><input aria-label="学習用の架空のパスワード" value={password} onChange={event=>setPassword(event.target.value)} placeholder="架空の文字列を入力" autoComplete="off"/></div><button className="s03-demo-submit" type="submit" disabled={!id.trim()||!password.trim()}>ログインする</button></form></>:
   phase===2?<><div className="s03-dashboard">✓ ログインが完了しました<small>学校アカウントの確認が終わりました。画面を閉じて構いません。</small></div><button type="button" className="s03-demo-submit" onClick={()=>{setPhase(3);onComplete()}}>数日後を見る →</button></>:
   <div className="s03-phish-aftermath" role="status"><span>⚠ 数日後 · 不審な動き</span><strong>身に覚えのないメールが届くようになった</strong><div>🚨 偽ページを作った相手にIDとパスワードが渡り、アカウントが使われた可能性があります。</div><small>先生から「このログインに心当たりはありますか？」と確認の連絡。</small></div>}
 </Browser><p className="s03-demo-hint">{phase===3?'あのページは偽サイトでした。リンク先のアドレスを見直そう。':'入力はこのページ内だけで動く学習用の画面です。本物のIDやパスワードは入力しないでください。'}</p></>;
}
export function AttackLab(){
 const [index,setIndex]=useState(0),[answers,setAnswers]=useState<(string|null)[]>(Array(cases.length).fill(null)),[completed,setCompleted]=useState<boolean[]>(Array(cases.length).fill(false));
 const item=cases[index],choice=answers[index],correct=answers.filter((answer,i)=>answer===cases[i].answer).length;
 const complete=useCallback(()=>setCompleted(old=>old.map((value,i)=>i===index?true:value)),[index]);
 return <Frame id="attack-lab" title="画面から不正アクセスを見分ける">
  <div className="s03-case-header"><span>事例 {index+1}/{cases.length}　正解 {correct}/{cases.length}</span><div><button type="button" disabled={index===0} onClick={()=>setIndex(index-1)}>← 前へ</button><button type="button" disabled={index===cases.length-1} onClick={()=>setIndex(index+1)}>次へ →</button></div></div>
  <p className="s03-visual-intro">{item.intro}</p>
  <div className="s03-attack-layout"><div className="s03-attack-visual">{index===4?<PhishingExperience key={index} onComplete={complete}/>:<LoginExperience key={index} index={index} onComplete={complete}/>}</div>
   <div className="s03-attack-answer"><div className="s03-options" role="group" aria-label="行為の分類">{options.map(label=><button type="button" key={label} disabled={!completed[index]} aria-pressed={choice===label} onClick={()=>setAnswers(old=>old.map((value,i)=>i===index?label:value))}>{label}</button>)}</div>
    <Notice title={!completed[index]?'まず画面を操作しよう':choice===null?'この行為は何だろう？':choice===item.answer?'✓ 正解！':'× もう一度考えよう'}>{!completed[index]?'ログインやリンクを操作すると、行為の名前を選べます。':choice===null?'ID・パスワード・リンク先の変化に注目しよう。':item.reason}</Notice>
    {choice&&<div className="s03-action-panel"><b>自分でできる対策</b><ul>{item.actions.map(action=><li key={action}>✓ {action}</li>)}</ul>{'legal' in item&&item.legal&&<p className="s03-legal">⚠ 他人のID・パスワードを無断で使ってログインすると、不正アクセス禁止法違反に当たるおそれがあります。<a href="https://www.npa.go.jp/bureau/cyber/countermeasures/basic.html" target="_blank" rel="noreferrer">警察庁の説明</a></p>}</div>}
   </div></div>
  {correct===cases.length&&<div className="s03-celebrate" role="status">✦ ✨ ✦ 全問正解！ 場面から危険を見分けられたね ✦ ✨ ✦</div>}
 </Frame>;
}


