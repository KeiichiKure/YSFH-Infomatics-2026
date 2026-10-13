'use client';
import {useState} from 'react';
import Image from 'next/image';
import signifier from '@/public/images/02-05/cue-signifier-v3.png';
import body from '@/public/images/02-05/cup-body-pair-v2.png';
import handles from '@/public/images/02-05/cup-handles-pair-v2.png';
import straw from '@/public/images/02-05/cup-straw-pair-v2.png';
import spout from '@/public/images/02-05/cup-spout-pair-v2.png';
import {Frame,KeyText,Tabs} from './LessonParts';

const cups=[
 {name:'大きな胴体',image:body,shape:'持ち手のない、太い胴体',action:'小さな手では握りにくい',why:'この子の手では胴体を十分につかみにくく、持ち上げにくい。使える動作は、道具の形と手の大きさの関係で変わります。',alt:'左は斜め上から見た、開いた飲み口と内側が見える持ち手のない太いクリーム色のコップ。右は同じコップを小さな手でつかもうとする子ども。'},
 {name:'両側の持ち手',image:handles,shape:'左右に指を掛ける空間',action:'両手で持ち上げられる',why:'胴体全体を握れなくても、左右の持ち手に指を掛けられます。持ち上げるという行動が可能になります。',alt:'左は斜め上から見た、両側の持ち手と開いた飲み口の内側が見える青いコップ。右は両方の持ち手に手を掛けて持ち上げる子ども。'},
 {name:'ストロー',image:straw,shape:'口にくわえられる細い管',action:'立てたまま吸って飲める',why:'コップを大きく傾けずに、ストローを口にくわえて吸えます。手の持ち方だけでなく、口と飲み口の関係にも工夫があります。',alt:'左は斜め上から見た、ストローの先とふたの上面、両側の持ち手が見えるコップ。右は同じコップを立てたままストローで飲む子ども。'},
 {name:'ふたの飲み口',image:spout,shape:'口を当てる短い飲み口と穴',action:'傾けて飲める',why:'ふたの飲み口に口を当て、コップを傾けて飲めます。同じ「飲む」でも、ストローのときとは異なる動作になります。',alt:'左は斜め上から見た、短く幅のある飲み口の穴と両側の持ち手が見える緑のふたのコップ。右は同じコップを傾けて飲む子ども。ストローはない。'},
];
function CupExamples(){return <div className="id-cup-learning"><p className="id-prompt"><KeyText>アフォーダンスは、道具と使う人の関係によって可能になる行動。コップの形を見てから、この子がどんな動作で使えるかを見比べよう。</KeyText></p><div className="id-cup-grid">{cups.map((cup,i)=><article className="id-cup-card" key={cup.name}><h4>{'ABCD'[i]}．{cup.name}</h4><figure><Image src={cup.image} alt={cup.alt}/><figcaption><span><b>コップの形</b>{cup.shape}</span><span><b>使うと、こんな動作</b>{cup.action}</span></figcaption></figure><p>{cup.why}</p></article>)}</div><div className="id-cup-takeaway"><p><KeyText>形そのものが「使いやすい」と決まるのではありません。手の大きさや、つかむ・吸う・傾けるといった動作との関係が大切です。使う人にとって、どんな行動が可能になるかを考えてデザインします。</KeyText></p></div><p className="id-source-link">実際の設計例：<a href="https://www.richell.co.jp/lifeplus/special/baby/tlimugr/" target="_blank" rel="noreferrer">リッチェル：持ち手・ストロー・コップ飲み ↗</a> / <a href="https://products.pigeon.co.jp/category/index.php?category_id=26" target="_blank" rel="noreferrer">ピジョン：飲み口の異なるマグ ↗</a></p><p className="id-compact">画像は形と動作の関係を示す教材用の生成図です。メーカーの製品写真ではありません。</p></div>;}
export function ActionCuesLab(){const [mode,setMode]=useState(0);return <Frame id="action-cues-quiz" title="身近な道具：形と使う人の関係から、可能な行動を考える"><Tabs labels={['子どもの手・飲み方','操作の目印のある・なし']} value={mode} onChange={setMode} label="身近な道具の比較"/>{mode===0?<CupExamples/>:<div className="id-columns"><div className="id-scene"><Image className="id-real-image" src={signifier} alt="ボタンに気づかず閉じたドアの前で待つ女性と、ここを押すの表示を見て一つのボタンを押し開いた入口を進める女性"/><div className="id-image-captions"><span>表示なし：立っても開かない</span><span>表示あり：開ける場所が分かる</span></div><p className="id-compact">身近な物を基にした教材用の生成図です。</p></div><div><h4>シグニファイア</h4><p><KeyText>シグニファイアは、行動を知らせる目印・手がかり。「開けるにはここを押す」と矢印が、一つの操作ボタンの存在と使い方を知らせます。</KeyText></p><h4>工夫がなくなると？</h4><p>ボタンに気づかず、自動で開くと思って立っていても開きません。表示を付けると、機構を変えずに意図した操作を伝えられます。</p><p className="id-compact"><KeyText>同じ形が両方の役割を持つこともあります。「可能な行動」と「知らせる手がかり」を分けて説明しよう。</KeyText></p></div></div>}</Frame>;}
