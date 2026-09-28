import type {Metadata} from 'next';
import Link from 'next/link';
import {sections} from './model';
import {Guide} from './Parts';
import {AddressLab} from './AddressLabs';
import {SubnetExperience} from './SubnetExperience';
import {LanLab} from './CommunicationLabs';
import {NameQuiz} from './NameQuiz';
import {DnsJourney} from './DnsJourney';
import {FlowRoutes} from './FlowRoutes';
import {Observation} from './Observation';
import Checkpoint from './Checkpoint';
import './internet.css';
import './internet-revision.css';
import './internet-round3.css';
import './internet-round4.css';
import './internet-round5.css';

const title='05-02 インターネットの仕組み｜理数情報ラボ';
const description='IPアドレス・DHCP・NAPT・サブネット・DNS・回線共有を、プリント08と連動した体験で学ぶ高校情報Ⅰの教材。';
export const metadata:Metadata={title,description,robots:{index:false,follow:false},openGraph:{title,description,images:[]},twitter:{title,description,images:[]}};
export default function InternetUnit(){return <main className="internet-unit"><a className="in-skip" href="#addresses">学習内容へ進む</a><header className="site-header unit-header"><Link className="brand" href="/"><span className="brand-mark">01</span><span>理数情報ラボ</span></Link><span className="lesson-progress">05-02 · 教科書 pp.130–135</span></header><div className="in-shell"><nav className="in-nav" aria-label="単元内メニュー"><Link href="/">← 単元一覧</Link><p>インターネットの<br/>仕組み</p><small>教科書 pp.130–135<br/>２学期プリント08</small><ol>{sections.map(([id,label],i)=><li key={id}><a href={`#${id}`}><span>{i+1}</span>{label}</a></li>)}<li><a href="#checkpoint"><span>✓</span>用語を確認</a></li></ol><aside><b>記録・ログインなし</b><p>操作・解答は外部へ送信せず、保存もしません。再読み込みで初めに戻ります。</p></aside><Link className="in-previous" href="/units/05-01/">前の単元：<br/>ネットワークとプロトコル</Link></nav><article className="in-content"><section className="in-intro"><p className="eyebrow">UNIT 05-02 · HOW THE INTERNET WORKS</p><span className="in-chip">教科書 pp.130–135 / プリント08</span><h1>名前をたどり、<br/><em>あなたに届く。</em></h1><p className="in-lead">同じWebページを、みんなで開けるのはなぜ？<br/>住所と名前から、インターネットの仕組みを解き明かそう。</p><Guide><b>家族と同時につないでも、<br/>返事が混ざらないのはなぜ？</b><p>見えない「対応表」と「問い合わせ」を、自分で動かして確かめよう。</p></Guide><div className="in-mission"><small>今日のミッション</small><strong>名前から宛先を調べ、LANの外へ送り、返事を自分の端末へ戻せる理由を説明する。</strong></div><div className="in-paths"><a href="#addresses"><small>基本から</small><b>住所の仕組みを知る</b><span>IPとLANの設定 →</span></a><a href="#subnet"><small>手を動かす</small><b>範囲を計算する</b><span>マスクと接続台数 →</span></a><a href="#checkpoint"><small>学び直しに</small><b>用語を確かめる</b><span>重要語と3問チェック →</span></a></div><p className="in-small">目安：2時間 · 1時間目は学習1〜3、2時間目は4〜6と確認 · 図解はWeb上の模型です。pingは実機で行います。</p></section><AddressLab/><LanLab/><SubnetExperience/><NameQuiz/><DnsJourney/><FlowRoutes/><Observation/><Checkpoint/><footer className="lesson-footer"><div><b>理数情報ラボ</b><span>高校 情報Ⅰ · 05-02</span></div><p>教科書 pp.130–135・プリント08の学習順序に合わせ、説明・図・操作画面を独自に作成しています。</p><div><Link href="/third-party-notices.txt">第三者ライセンス</Link><Link href="/">単元一覧へ戻る ↑</Link></div></footer></article></div></main>}
