import {KeyText} from './LessonParts';
import type {Question} from './SequenceQuiz';
const reports=[
 {title:'資源ごみの分別に関する調査',body:'分別への意識を調べるため、20人に質問した。ペットボトルを分別する人は12人、紙を分別する人は9人で、両方を分別する人は5人だった。どちらも分別しない人は4人だった。2種類の回答の重なりを整理し、次の呼びかけを考察する。',name:'ベン図',after:'図1に示すように、両方を分別する人は5人、どちらも分別しない人は4人であった。重なりを分けて数え、改善の対象を考察した。'},
 {title:'学校の自習室予約システムの提案',body:'放課後の自習室を予約する仕組みを提案する。部屋は空きの状態から予約操作で予約済みになり、利用開始で利用中になる。利用が終わると空きに戻る。予約済みでも取消操作をすれば空きに戻る。この仕組みを誤操作なく説明したい。',name:'状態遷移図',after:'図1は部屋の状態と操作の関係を示す。予約の取消は予約済みのときに行い、利用終了とは区別する。'},
 {title:'アンケートの集計方法',body:'満足度アンケートを集計する前に、各回答に未記入欄があるか確認する。未記入がある回答はその項目の平均計算から除き、欠測件数を記録する。未記入がなければ平均計算に含める。分析結果の再現性を高めるため、この判断と処理の順序を報告する。',name:'フローチャート',after:'集計前の処理は図1の通りである。欠測を記録してから平均計算に進み、集計対象を明確にした。'},
 {title:'昼食選択の調査結果',body:'昼食の選択肢を検討するため、クラス40人のある日の昼食を調べた。弁当が20人、購買が12人、食堂が8人だった。どの選択肢が全体のどれくらいを占めたかを報告し、食堂の利用促進について考察する。',name:'円グラフ',after:'図1に示すように、弁当50%、購買30%、食堂20%であった。全体の人数を示した上で、割合を比較した。'},
 {title:'植物の生長実験の結果',body:'光を当てた苗の高さを、毎日同じ時刻に測定した。1日目2cm、2日目3cm、3日目5cm、4日目6cm、5日目8cmだった。生長が時間とともにどのように変化したかを報告し、次の実験で調べる条件を考える。',name:'折れ線グラフ',after:'図1は日数と苗の高さの関係を示す。5日間で2cmから8cmへ伸びた。この記録だけでは光の効果を断定せず、対照条件と比較する。'}
];
export function ReportDiagram({type}:{type:number}){return <svg className="id-diagram id-report-diagram" viewBox="0 0 520 270" role="img" aria-label={reports[type].title+'の'+reports[type].name}>{type===0?<><rect x="10" y="20" width="500" height="230" fill="#fffdf5" stroke="#b8cbcc"/><ellipse cx="187" cy="139" rx="119" ry="84" fill="#cde5df" fillOpacity=".8" stroke="#2f7c7a"/><ellipse cx="331" cy="139" rx="119" ry="84" fill="#efd2bf" fillOpacity=".8" stroke="#bb5035"/><text x="131" y="48" textAnchor="middle">ペットボトル</text><text x="385" y="48" textAnchor="middle">紙</text><text x="140" y="145" textAnchor="middle">7人</text><text x="260" y="145" textAnchor="middle">5人</text><text x="382" y="145" textAnchor="middle">4人</text><text x="25" y="239">どちらもなし：4人</text></>:type===1?<><defs><marker id="room-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5 0 10Z" fill="#2f7c7a"/></marker></defs>{['空き','予約済み','利用中'].map((l,i)=><g key={l}><rect x={15+i*176} y="100" width="130" height="60" rx="12" fill="#eaf4ed" stroke="#2f7c7a"/><text x={80+i*176} y="137" textAnchor="middle">{l}</text></g>)}{[{d:'M145 130H191',x:167,y:85,t:'予約'},{d:'M321 130H367',x:344,y:85,t:'開始'},{d:'M430 163V210H80V163',x:260,y:242,t:'利用終了'},{d:'M256 98V35H80V98',x:170,y:25,t:'予約取消'}].map(e=><g key={e.t}><path d={e.d} fill="none" stroke="#2f7c7a" strokeWidth="2" markerEnd="url(#room-arrow)"/><text x={e.x} y={e.y} textAnchor="middle">{e.t}</text></g>)}</>:type===2?<><rect x="152" y="8" width="216" height="35" fill="#eaf4ed" stroke="#2f7c7a"/><text x="260" y="33" textAnchor="middle">回答を確認</text><path d="M260 43V65M260 65L437 107 260 149 83 107Z" fill="#fff4dc" stroke="#2f7c7a"/><text x="260" y="114" textAnchor="middle">未記入がある？</text><path d="M83 107H48V185M437 107H473V185" fill="none" stroke="#2f7c7a"/><text x="58" y="165">Yes ↓</text><text x="412" y="165">No ↓</text><rect x="8" y="186" width="218" height="62" fill="white" stroke="#2f7c7a"/><text x="117" y="212" textAnchor="middle">平均から除外</text><text x="117" y="238" textAnchor="middle">欠測件数を記録</text><rect x="294" y="186" width="218" height="62" fill="white" stroke="#2f7c7a"/><text x="403" y="224" textAnchor="middle">平均計算に含める</text></>:type===3?<>{[.5,.3,.2].map((v,i,a)=>{const start=a.slice(0,i).reduce((x,y)=>x+y,0)*Math.PI*2-Math.PI/2,end=start+v*Math.PI*2;return <path key={i} d={`M145 137L${145+105*Math.cos(start)} ${137+105*Math.sin(start)}A105 105 0 0 1 ${145+105*Math.cos(end)} ${137+105*Math.sin(end)}Z`} fill={['#2f7c7a','#bb5035','#315ca5'][i]} stroke="white"/>;})}{['弁当：50%','購買：30%','食堂：20%'].map((l,i)=><text key={l} x="290" y={85+i*50}>{l}</text>)}<text x="145" y="267" textAnchor="middle">全40人＝100%</text></>:<>{[0,2,4,6,8].map(v=><g key={v}><text x="48" y={225-v*21} textAnchor="end">{v}</text><line x1="62" x2="482" y1={220-v*21} y2={220-v*21} stroke="#d1dcdd"/></g>)}<text x="64" y="25">高さ［cm］</text><polyline points={[2,3,5,6,8].map((v,i)=>`${72+i*96},${220-v*21}`).join(' ')} fill="none" stroke="#2f7c7a" strokeWidth="3"/>{[2,3,5,6,8].map((v,i)=><g key={i}><circle cx={72+i*96} cy={220-v*21} r="5" fill="#2f7c7a"/><text x={72+i*96} y="255" textAnchor="middle">{i+1}日</text></g>)}</>}</svg>;}
function Report({type,answer=false}:{type:number;answer?:boolean}){const r=reports[type];return <div className="id-report"><small>研究レポートの一節（教材用の架空の記録）</small><h4>{r.title}</h4>{answer?<><div className="id-report-before"><b>文字だけだと</b><p>{r.body}</p></div><h4><KeyText>{`提案例：${r.name}`}</KeyText></h4><ReportDiagram type={type}/><p className="id-report-after"><b>図を参照して書く</b><br/>{r.after}</p></>:<p className="id-source-text">{r.body}</p>}</div>;}
const choices=[['ベン図','状態遷移図','折れ線グラフ'],['円グラフ','状態遷移図','箱ひげ図'],['レーダーチャート','散布図','フローチャート'],['状態遷移図','円グラフ','コンセプトマップ'],['折れ線グラフ','ベン図','円グラフ']];
const methods:Record<string,string>={
 'ベン図':'集合の重なり・包含関係を示す図です。',
 '状態遷移図':'操作や出来事によって、状態がどう移るかを示す図です。',
 '折れ線グラフ':'時間などの順序に沿った数値の変化を線で示します。',
 '円グラフ':'重ならない内訳が、全体のどれくらいを占めるか示します。',
 '箱ひげ図':'数値データの中央値や分布・ちらばりを示します。',
 'レーダーチャート':'複数の項目を放射状の軸に置き、全体のバランスを示します。',
 '散布図':'対応する2つの数値を点にして、関係や傾向を示します。',
 'フローチャート':'判断の分岐や処理の順序を示す図です。',
 'コンセプトマップ':'概念同士を、関係の言葉で結んで意味を示す図です。'
};
const mismatches=[
 '今回は状態の移り変わりや時間順の数値ではなく、2種類の回答の重なりを伝えたい文章です。',
 '今回は人数の内訳や数値のちらばりではなく、操作によって変わる部屋の状態を説明しています。',
 '今回は複数の得点のバランスや2つの数値の関係ではなく、未記入の有無で処理が分かれる手順です。',
 '今回は状態の変化や概念の関係ではなく、40人を重ならない3種類に分けた内訳です。',
 '今回は集合の重なりや全体の内訳ではなく、毎日の高さの変化を追う記録です。'
];
export const reportQuestions:Question[]=reports.map((r,i)=>({prompt:['分別の2種類の回答の「重なり」を図にするなら？','予約・開始・終了と「状態」の関係を図にするなら？','未記入があるかで分かれる「処理」を図にするなら？','昼食の全体に対する「割合」を図にするなら？','日数による苗の高さの「変化」を図にするなら？'][i],options:choices[i],correct:[0,1,2,1,0][i],model:true,visual:<Report type={i}/>,answerVisual:<Report type={i} answer/>,why:choices[i].map(o=>o===r.name?`${r.name}：${methods[o]} 左に提案例を示しました。図番号と、図から読み取れることを文章に添えます。`:`${o}は、${methods[o]} ${mismatches[i]} もう一度考えてみよう。`)}));
