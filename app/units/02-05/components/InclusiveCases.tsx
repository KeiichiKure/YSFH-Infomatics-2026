'use client';
import Image from 'next/image';
import entranceA from '@/public/images/02-05/entrance-a.png';
import entranceB from '@/public/images/02-05/entrance-b.png';
import entranceC from '@/public/images/02-05/entrance-c.png';
import barrier from '@/public/images/02-05/case-barrier-free-v2.png';
import universal from '@/public/images/02-05/case-universal-design-v2.png';
import usability from '@/public/images/02-05/case-usability.png';
import accessibility from '@/public/images/02-05/case-accessibility.png';
import affordance from '@/public/images/02-05/case-affordance.png';
import signifier from '@/public/images/02-05/case-signifier-v2.png';
import {Frame,KeyText} from './LessonParts';
import {explainChoice} from './meaningFeedback';
import {SequenceQuiz,type Question} from './SequenceQuiz';
const names=['バリアフリー','ユニバーサルデザイン','ユーザビリティ','アクセシビリティ','アフォーダンス','シグニファイア'];
const cases=[
 ['既存の階段に専用昇降機を追加','階段しかなかった入口に、車いす用の昇降機を後から追加した。既存の障壁を除く改修の考え方は？','バリアフリー：階段という既存の障壁を、専用昇降機の追加で取り除きました。歩行者の階段と昇降機の経路は別です。',barrier,'階段を上れず待つ車いす利用者と、階段の隣に追加した専用昇降機で上る利用者','既存の階段の障壁を、後から専用設備で取り除く改修に注目します。'],
 ['初めから多くの人が使える共通の蛇口','回す力が弱い人や子どもも使えるレバー式を、初めから共通の設備として採用した。設計の考え方は？','ユニバーサルデザイン：初めから多くの人が使える共通の設計。左は回せず水が出ない、右はレバーを押せて水が出ます。',universal,'けがした手では丸い蛇口を回せず水が出ない状態と、レバー式で水が出る状態','初めから幅広い人を想定し、共通の設備を設計する点に注目します。'],
 ['券売機の操作を見直す','目的の切符を、少ない迷い・手順で購入できるよう画面を整理した。目的達成の使いやすさを表す言葉は？','ユーザビリティ：利用者が目的の購入を、効率よく間違えにくく完了できる使いやすさです。',usability,'多数の小さいボタンで迷う券売機と、選択と確認を分かりやすく整理した券売機','問いは、目的の購入を迷わず効率よく完了できる度合いです。'],
 ['博物館の情報を利用できる人を増やす','小さな印刷説明に音声と触れる模型を加えた。視覚に障害がある人も情報にアクセスし利用できる度合いは？','アクセシビリティ：情報や機能にアクセスし利用できる度合い。音声・模型も用意して、その度合いを高めました。',accessibility,'小さい印刷説明だけの展示と、音声や触れる模型で内容を利用できる展示','問いは設計の考え方よりも、情報にアクセスし利用できる度合いです。'],
 ['引き出しと手の関係','持ち手に指を掛けられるので、手前に引いて開けられる。物と利用者の関係で可能になる行動を何という？','アフォーダンス：持ち手と手の関係が、引いて開ける行動を可能にしています。',affordance,'指を掛けられる持ち手を使い、引き出しを手前に引いて開ける手','表示で知らせることよりも、手と形の関係で可能になる行動に注目します。'],
 ['横に滑らせる扉の目印','開け方が分からず引いても開かない扉に「右へスライド」と矢印を加えた。行動を知らせる手がかりは？','シグニファイア：文字と矢印が、右へ滑らせる行動を知らせます。扉の機構は同じでも、開け方を判断しやすくなりました。',signifier,'閉じた引き戸を手前に引いて迷う人と、右へスライドの表示で横に滑らせて開く人','扉を動かせる機構そのものよりも、意図した操作を知らせる目印に注目します。']
] as const;
const partials=[[1],[0],[1],[0,1],[5],[4]];
const quiz:Question[]=cases.map(([title,prompt,why,img,alt,focus],i)=>({prompt,correct:i,partial:partials[i],options:names,visual:<><h4>{title}</h4><Image className="id-case-image" src={img} alt={alt}/>{i!==4&&<div className="id-image-captions"><span>工夫する前</span><span>工夫した後</span></div>}<p className="id-compact">身近な場面を基にした教材用の生成図。何を改善したかを見よう。</p></>,why:names.map((name,j)=>j===i?why:partials[i].includes(j)?explainChoice(name,`確かにこの工夫と関係します。${focus}`):explainChoice(name,focus))}));
export function EntranceExamples(){return <Frame id="entrance-examples" title="入口の3つの状態：障壁、バリアフリー、共通の設計"><div className="id-entrance-cards">{[
 {label:'A：階段だけの入口',image:entranceA,alt:'階段の下で車いす利用者とベビーカー利用者が進めず待つ入口',text:'車いすやベビーカーでは進めない。誰のどの行動が妨げられているかを見る。'},
 {label:'B：後から障壁を除く改修',image:entranceB,alt:'階段の隣に遠回りのスロープを追加した入口',text:'バリアフリー：後からスロープを追加し、段差を避けられるようにした。遠回りや急な勾配で使いにくさが残る場合もあるが、まず既存の段差を越えて入口を利用できるようにする。'},
 {label:'C：初めから共通の設計',image:entranceC,alt:'多くの人が同じ緩やかな通路を進める入口',text:'ユニバーサルデザイン：初めから共通の緩やかな通路を設け、車いす・歩行者・ベビーカーなど多くの人が使えるようにした。'}
].map(({label,image,alt,text})=><article key={label}><h4>{label}</h4><Image src={image} alt={alt}/><p><KeyText>{text}</KeyText></p></article>)}</div><p className="id-compact">考え方は重なります。形だけで分類せず、目的と設計の経緯から説明します。画像は教材用の生成図です。</p></Frame>;}
export function InclusiveSummary(){return <SequenceQuiz id="inclusive-quiz" title="6つの新しい実例：何を意識した工夫？" questions={quiz}/>;}
export function UsabilityDefinitions(){return <div className="id-definition-pair"><article><h3>ユーザビリティ</h3><p><KeyText>ユーザビリティは、目的を達成する際の使いやすさ。券売機で迷わず切符を買えるか、操作を間違えにくいかを考える。</KeyText></p><h4>実際の改善：マイナポータル</h4><p>情報過多で使いづらかった画面を見直し、最初に必要な情報から段階的に確認する構成へ。リンク先の図2で新旧画面を比べられます。</p><a className="id-source-link" href="https://www.digital.go.jp/resources/user-centered-approach-guidebook/case-study/mynaportal" target="_blank" rel="noreferrer">使いづらさの原因と改善を見る（デジタル庁） ↗</a></article><article><h3>アクセシビリティ</h3><p><KeyText>アクセシビリティは、情報や機能にアクセスし利用できる度合い。見え方や身体の状況が違っても、必要な情報・操作へ届くかを考える。</KeyText></p><h4>実際の改善：デジタル庁のウェブサイト</h4><p>画像の代替テキストを付け、PDFの情報は可能な限りHTMLでも提供。画面を読み上げる利用者も内容へ届くよう、運用のチェック項目にしました。</p><a className="id-source-link" href="https://www.digital.go.jp/resources/user-centered-approach-guidebook/case-study/digital-agency-website" target="_blank" rel="noreferrer">情報を利用できるようにした改善を見る ↗</a></article></div>;}
