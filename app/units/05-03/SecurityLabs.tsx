'use client';
import {useState} from 'react';
import {Frame,Guide,Notice,Section,Terms} from './LessonParts';
import {AttackLab,MalwareLab} from './VisualCases';
import {FirewallLab,AccessLab} from './ControlLabs';
import {ParityLab} from './ParityActivity';

const policyLayers=[
 {name:'基本方針',detail:'何を守るか、組織全体の考えを示す。',examples:[{label:'公開例 1｜NTTデータ',text:'預かった情報を含む情報資産を脅威から守り、安全管理を続ける。',url:'https://www.nttdata.com/jp/ja/-/media/nttdatajapan/files/lineup/cafis/download/cafis_informationsecuritypolicy.pdf?rev=d344ea304e334c18ba06097bff7b8e47'},{label:'公開例 2｜ソニーグループ',text:'顧客や社員などから託された情報を守り、管理とセキュリティを継続的に強める。',url:'https://www.sony.com/ja/SonyInfo/csr_report/ethics/'}]},
 {name:'対策基準',detail:'方針を実現するための「守るべき水準」を決める。',examples:[{label:'授業用の例 1',text:'生徒の個人情報が入ったフォルダは、担当教員だけが閲覧できる。'},{label:'授業用の例 2',text:'共有PCでは、利用後に必ずログアウトし、パスワードを保存しない。'}]},
 {name:'実施手順',detail:'担当者がいつ、どの画面で、何をするかを決める。',examples:[{label:'授業用の例 1',text:'毎学期初めに「プロパティ → セキュリティ」で利用者を確認し、不要な権限を外す。'},{label:'授業用の例 2',text:'共有PCの授業終了時にログアウトを確認し、残ったセッションを担当者に報告する。'}]},
] as const;
function PolicyLab(){const [focus,setFocus]=useState(0),[choice,setChoice]=useState<number|null>(null),layer=policyLayers[focus];return <Frame id="policy-lab" title="何をポリシーに含める？"><div className="s03-policy-layers">{policyLayers.map((item,i)=><button type="button" key={item.name} className={focus===i?'is-current':''} onClick={()=>setFocus(i)} aria-pressed={focus===i}><small>{i+1}</small><b>{item.name}</b></button>)}</div><Notice title={layer.name}>{layer.detail}</Notice><div className="s03-policy-examples"><b>具体例を見てみよう</b>{layer.examples.map(example=><div key={example.label}><strong>{example.label}</strong><p>{example.text}</p>{'url' in example&&<a href={example.url} target="_blank" rel="noreferrer">公開資料を確認 ↗</a>}</div>)}</div><p className="in-small">公開例は企業資料を短く言い換えています。対策基準・実施手順は企業の内部文書ではなく授業用の作例です。</p><fieldset className="s03-choice"><legend>この教科書で情報セキュリティポリシーに当たる組は？</legend>{['基本方針＋対策基準','対策基準＋実施手順','3つすべて'].map((label,i)=><button type="button" key={label} aria-pressed={choice===i} onClick={()=>setChoice(i)}>{label}</button>)}<p role="status">{choice===null?'各層を押して、具体例を読んでみよう。':choice===0?'✓ 正解！ この教科書では基本方針と対策基準を合わせます。実施手順は運用のために別に用意します。':'× この教科書では基本方針と対策基準の二つを合わせます。資料によっては実施手順も広い意味で含めます。'}</p></fieldset></Frame>}
export function RisksLesson(){return <Section id="risks" n={3} title="方針を決め、危険を見分ける" blank="⑩〜⑮" page="p.138"><p className="in-lead">情報を守る組織の約束を確かめ、架空の事例がどの行為に当たるか判断しよう。</p><PolicyLab/><AttackLab/><Guide mood="thinking"><b>名前が似た攻撃は、<br/>変えているものに注目しよう。</b><p>一つのIDでパスワードを変えるのか、一つのパスワードでIDを変えるのか。偽サイトへの誘導も別の危険です。</p></Guide><Terms section={3}/></Section>}

export function MalwareLesson(){return <Section id="malware" n={4} title="マルウェアを特徴から見分ける" blank="⑯〜⑱" page="pp.138–139"><p className="in-lead">「増える」「盗み見る」「使えなくする」「偽装する」の違いを手掛かりにしよう。</p><MalwareLab/><Guide mood="understood"><b>名前を覚えるだけでなく、<br/>どんな被害か説明できる？</b><p>ワームは独立して増殖し、ランサムウェアは利用を制限します。トロイの木馬では遠隔操作を受ける場合があります。</p></Guide><Terms section={4}/></Section>}

export function DefensesLesson(){return <Section id="defenses" n={5} title="通してよい通信と利用者を選ぶ" blank="⑲〜㉒" page="pp.139–140"><p className="in-lead">通信の入口を調べるファイアウォールと、利用者の操作を決めるアクセス制御を比べよう。</p><FirewallLab/><AccessLab/><Guide mood="praise"><b>通信が通れても、<br/>どのファイルでも読めるわけではありません。</b><p>ポートや宛先を見る規則と、利用者ごとの権利を見る規則は、判断する対象が違います。</p></Guide><p className="in-small">教科書のサブネットとVPNは、ネットワークを分けたり外部から接続したりするときの補助的な対策です。05-02のサブネットの学習にもつながります。</p><Terms section={5}/></Section>}

export function ParityLesson(){return <Section id="parity" n={6} title="受信したデータの誤りに気づく" blank="㉓㉔" page="p.141"><p className="in-lead">1ビットだけ変わった場合と、2ビット変わった場合を比べ、検出できる範囲を確かめよう。</p><ParityLab/><Guide mood="understood"><b>見つけられる誤りと、<br/>見つけられない誤りがあるね。</b><p>偶数パリティでも奇数パリティでも、1ビット反転は検出できます。2ビット反転では「1」の数の偶数・奇数が変わらず、検出できません。</p></Guide><Terms section={6}/></Section>}
