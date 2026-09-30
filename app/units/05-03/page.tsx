import type {Metadata} from 'next';
import Link from 'next/link';
import {sections} from './model';
import {Guide} from './LessonParts';
import {WebLesson,MailLesson} from './JourneyLabs';
import {RisksLesson,MalwareLesson,DefensesLesson,ParityLesson} from './SecurityLabs';
import Checkpoint from './Checkpoint';
import '../05-02/internet.css';
import './security.css';

const title='05-03 Webページとネットワークセキュリティ｜理数情報ラボ';
const description='Web閲覧・メール送受信の流れと、ネットワークセキュリティ、誤り検出をプリント09と連動して学ぶ教材。';
export const metadata:Metadata={title,description,robots:{index:false,follow:false},openGraph:{title,description,images:[]},twitter:{title,description,images:[]}};

export default function NetworkSecurityUnit(){
  return <main className="internet-unit security-unit"><a className="in-skip" href="#web">学習内容へ進む</a><header className="site-header unit-header"><Link className="brand" href="/"><span className="brand-mark">01</span><span>理数情報ラボ</span></Link><span className="lesson-progress">05-03 · 教科書 pp.136–141</span></header><div className="in-shell"><nav className="in-nav" aria-label="単元内メニュー"><Link href="/">← 単元一覧</Link><p>Webページと<br/>ネットワークセキュリティ</p><small>教科書 pp.136–141<br/>２学期プリント09</small><ol>{sections.map(([id,label],i)=><li key={id}><a href={`#${id}`}><span>{i+1}</span>{label}</a></li>)}<li><a href="#checkpoint"><span>✓</span>用語を確認</a></li></ol><aside><b>記録・ログインなし</b><p>このページの操作と解答は外部へ送らず、再読み込みで初めに戻ります。</p></aside><Link className="in-previous" href="/units/05-02/">前の単元：<br/>インターネットの仕組み</Link></nav><article className="in-content"><section className="in-intro"><p className="eyebrow">UNIT 05-03 · WEB, MAIL & SECURITY</p><span className="in-chip">教科書 pp.136–141 / プリント09</span><h1>届くしくみを知り、<br/><em>安全を考える。</em></h1><p className="in-lead">Webページもメールも、相手の場所を調べて道を進む。<br/>その通信と情報を、どう守ればよいだろう？</p><Guide><b>05-02で育てた経路表は、<br/>何を届けるときにも使える？</b><p>Webの要求とメールを同じ道の図で追い、届いた後の違いを見てみよう。</p></Guide><div className="in-mission"><small>今日のミッション</small><strong>Webとメールの流れを説明し、脅威に応じた対策と誤り検出の限界を選べるようになる。</strong></div><div className="in-paths"><a href="#web"><small>1時間目</small><b>届くしくみ</b><span>Webとメール →</span></a><a href="#risks"><small>2時間目</small><b>脅威を見分ける</b><span>方針・不正アクセス・マルウェア →</span></a><a href="#defenses"><small>3時間目</small><b>守る・確かめる</b><span>制御と誤り検出 →</span></a></div><p className="in-small">目安：3時間。図と通信は学習用の模型です。まず<Link className="in-text-link" href="/units/05-02/#routing-lab">05-02「経路表を育てる」</Link>を振り返ることもできます。</p></section><WebLesson/><MailLesson/><RisksLesson/><MalwareLesson/><DefensesLesson/><ParityLesson/><Checkpoint/><footer className="lesson-footer"><div><b>理数情報ラボ</b><span>高校 情報Ⅰ · 05-03</span></div><p>教科書 pp.136–141・プリント09に対応。図・操作画面は教材用に作成しています。</p><div><Link href="/third-party-notices.txt">第三者ライセンス</Link><Link href="/">単元一覧へ戻る ↑</Link></div></footer></article></div></main>;
}
