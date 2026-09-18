import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import thinking from '@/public/mascots/student-thinking.png';
import { NetworkLab, ServerLab, ProtocolLab, Checkpoint } from './NetworkActivities';
import './network.css';

const title = '05-01 ネットワークとプロトコル｜理数情報ラボ';
const description = 'LAN・サーバ・TCP/IP・ヘッダの働きを、接続とデータ転送の体験で学ぶ高校情報Ⅰの教材。';
export const metadata: Metadata = { title, description, robots: { index: false, follow: false }, openGraph: { title, description, images: [] }, twitter: { title, description, images: [] } };

export default function NetworkUnit() {
  return <main className="net-unit">
    <a className="net-skip" href="#network">学習内容へ進む</a>
    <header className="site-header unit-header"><Link className="brand" href="/"><span className="brand-mark">01</span><span>理数情報ラボ</span></Link><span className="lesson-progress">05-01 · 教科書 pp.124–129</span></header>
    <div className="net-shell"><nav className="net-nav" aria-label="単元内メニュー"><Link href="/">← 単元一覧</Link><p>ネットワークと<br />プロトコル</p><small>教科書 pp.124–129<br />２学期プリント07</small><ol>{[['network','ネットワークをつなぐ'],['servers','サーバに依頼する'],['protocol','通信のルール'],['checkpoint','プリント確認']].map(([id,label],i)=><li key={id}><a href={`#${id}`}><span>{i+1}</span>{label}</a></li>)}</ol><aside><b>記録・ログインなし</b><p>操作・解答は外部へ送信せず、保存もしません。再読み込みで初めに戻ります。</p></aside></nav>
    <article className="net-content"><section className="net-intro"><p className="eyebrow">UNIT 05-01 · NETWORK & PROTOCOL</p><span className="textbook-page">教科書 pp.124–129 / プリント07</span><h1>つながる、その先で。<br /><em>データはどう届く？</em></h1><p className="net-lead">機器をつなぎ、サーバに依頼し、データの旅をたどろう。<br />見えない通信を、ひとつずつ見えるしくみに。</p><div className="net-guide"><Image src={thinking} alt="疑問を持つ生徒のマスコット" priority /><div><b>Wi-Fiにつながっているのに、<br />Webページが開かないのはなぜ？</b><p>つながっている場所と、止まっている場所を分けて考えてみよう。</p></div></div><div className="net-mission"><small>今日のミッション</small><strong>機器・サーバ・通信のルールが協力して、データを届けるしくみを説明する。</strong></div><div className="net-paths"><a href="#network"><small>基本から</small><b>まずは、つなごう</b><span>機器とサーバの役割 →</span></a><a href="#protocol"><small>しくみを詳しく</small><b>ルールを見つけよう</b><span>4層とデータの旅 →</span></a><a href="#checkpoint"><small>学び直しに</small><b>プリントを確認</b><span>重要語と理由を確かめる →</span></a></div><p className="net-small">目安：50分＋必要に応じた復習 · すべてWeb上の模擬実験です</p></section>
    <NetworkLab /><ServerLab /><ProtocolLab /><Checkpoint />
    <footer className="lesson-footer"><div><b>理数情報ラボ</b><span>高校 情報Ⅰ · 05-01</span></div><p>教科書 pp.124–129・プリント07の学習順序に合わせ、説明・図・操作画面を独自に作成しています。</p><div><Link href="/third-party-notices.txt">第三者ライセンス</Link><Link href="/">単元一覧へ戻る ↑</Link></div></footer></article></div>
  </main>;
}
