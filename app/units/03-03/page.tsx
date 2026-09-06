import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import arithmeticMascot from '@/public/images/03-01-mascot-arithmetic.png';
import { LogicGateLab } from './components/LogicGateLab';
import { CircuitCombinationLab } from './components/CircuitCombinationLab';
import { AdderLab } from './components/AdderLab';
import { BitwiseLab } from './components/BitwiseLab';
import { LogicCheckpoint } from './components/LogicCheckpoint';
import './logic.css';

const title = '03-03 論理回路と論理演算｜理数情報ラボ';
const description = '論理回路、真理値表、半加算回路、論理演算を、スイッチとビット操作で学ぶ高校情報Ⅰの教材。';

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
  openGraph: { title, description, images: [] },
  twitter: { title, description, images: [] },
};

export default function LogicCircuitUnit() {
  return <main className="logic-unit">
    <a className="logic-skip" href="#gates">学習内容へ進む</a>
    <header className="site-header unit-header"><Link className="brand" href="/"><span className="brand-mark" aria-hidden="true">01</span><span>理数情報ラボ</span></Link><span className="lesson-progress">03-03 · 教科書 pp.76–79</span></header>
    <div className="logic-shell">
      <nav className="logic-nav" aria-label="単元内メニュー"><Link href="/">← 単元一覧</Link><p>論理回路と論理演算<br /><small>教科書 pp.76–79</small></p><ol><li><a href="#gates">1　論理回路</a></li><li><a href="#combinations">2　回路の組み合わせ</a></li><li><a href="#adders">3　半加算・全加算</a></li><li><a href="#bitwise">4　論理演算</a></li><li><a href="#checkpoint-03-03">5　プリント確認</a></li></ol><div className="logic-nav-note"><b>記録・ログインなし</b><span>操作・解答は送信も保存もしません。再読み込みすると初めに戻ります。</span></div></nav>
      <article className="logic-content">
        <section className="logic-intro">
          <p className="eyebrow">UNIT 03-03 · LOGIC CIRCUITS</p><span className="textbook-page">教科書 pp.76–79</span>
          <h1>0と1の判断だけで、<br />計算までできる？</h1>
          <p className="logic-lead">スイッチを動かし、信号の道をたどろう。<br />小さな判断を組み合わせると、2進数の加算へつながります。</p>
          <div className="logic-mission"><span>今日のミッション</span><strong>入力・回路・出力の関係を真理値表で説明し、回路の組み合わせが計算につながることを確かめる。</strong></div>
          <aside className="arithmetic-confession">
            <Image src={arithmeticMascot} alt="演算装置くん" priority />
            <div className="speech-balloon"><span>演算装置くんの告白</span><h2>ぼく、計算が得意そうに見えるでしょう？</h2><p>実は、ぼくが直接使っているのは<strong>AND・OR・NOTという3つの判断</strong>。それを何度も組み合わせて、足し算までやっているんだ。</p><p className="naughty-hint">でも本音を言うと、もっと楽をしたい。発展では<strong>NANDひとつを使い回す作戦</strong>も、こっそり見せるよ。</p></div>
          </aside>
          <p className="metaphor-note">※演算装置くんの話は学習用の単純化です。実際のコンピュータは、多数の論理回路を集積した電子回路で処理します。</p>
          <div className="logic-intro-note">目安2時間 · プリント06に対応 · Web上の模擬実験です</div>
          <div className="logic-paths" aria-label="学び方を選ぶ"><a href="#gates"><span>基本から</span><b>スイッチと回路</b><small>1時間目</small></a><a href="#combinations"><span>しくみ重視</span><b>回路を組み合わせる</b><small>NANDの作戦</small></a><a href="#adders"><span>2時間目から</span><b>加算とビット操作</b><small>03-02から続く</small></a></div>
        </section>
        <LogicGateLab />
        <CircuitCombinationLab />
        <AdderLab />
        <BitwiseLab />
        <LogicCheckpoint />
        <footer className="lesson-footer"><div><b>理数情報ラボ</b><span>高校 情報Ⅰ · 2学期補助教材</span></div><p>プリントと教科書の学習順序に合わせ、説明・回路図・操作画面は本教材用に独自作成しています。</p><div><Link href="/third-party-notices.txt">第三者ライセンス</Link><Link href="/">単元一覧へ戻る ↑</Link></div></footer>
      </article>
    </div>
  </main>;
}
