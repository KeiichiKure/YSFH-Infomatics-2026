import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import thinkingMascot from '@/public/mascots/student-thinking.png';
import { ArithmeticLab } from './components/ArithmeticLab';
import { ComplementLab } from './components/ComplementLab';
import { RealNumbersLab } from './components/RealNumbersLab';
import { ErrorLab } from './components/ErrorLab';
import { BinaryCheckpoint } from './components/BinaryCheckpoint';
import './binary.css';

const title = '03-02 2進数の計算｜理数情報ラボ';
const description = '2進数の加減算、補数、実数表現、演算誤差を、1桁ずつの操作で学ぶ高校情報Ⅰの教材。';

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
  openGraph: { title, description, images: [] },
  twitter: { title, description, images: [] },
};

export default function BinaryArithmeticUnit() {
  return <main className="binary-unit">
    <a className="binary-skip" href="#arithmetic">学習内容へ進む</a>
    <header className="site-header unit-header"><Link className="brand" href="/"><span className="brand-mark" aria-hidden="true">01</span><span>理数情報ラボ</span></Link><span className="lesson-progress">03-02 · 教科書 pp.72–75</span></header>
    <div className="lesson-shell">
      <nav className="lesson-nav" aria-label="単元内メニュー">
        <Link href="/">← 単元一覧</Link>
        <p>2進数の計算<br /><small>教科書 pp.72–75</small></p>
        <ol><li><a href="#arithmetic">1　加算と減算</a></li><li><a href="#complement">2　補数</a></li><li><a href="#real-numbers">3　実数の表現</a></li><li><a href="#errors">4　演算誤差</a></li><li><a href="#checkpoint-03-02">5　プリント確認</a></li></ol>
        <div className="nav-note"><b>記録・ログインなし</b><span>操作・解答は送信も保存もしません。再読み込みすると初めに戻ります。</span></div>
      </nav>
      <article className="lesson-content">
        <section className="lesson-intro">
          <p className="eyebrow">UNIT 03-02 · BINARY ARITHMETIC</p><span className="textbook-page">教科書 pp.72–75</span>
          <h1>0と1だけで、<br />どこまで計算できる？</h1>
          <p className="binary-lead">桁上がり、補数、小数、誤差。<br />ビットを1桁ずつ動かして、計算のしくみを確かめよう。</p>
          <div className="mission-box"><span>今日のミッション</span><strong>2進数の計算方法と、有限のビット数で誤差が生じる理由を説明できる。</strong></div>
          <aside className="mascot-guide"><Image src={thinkingMascot} alt="考えている生徒のマスコット" priority /><p><b>右端の桁から、ゆっくり進めよう。</b><span>予想して、1桁動かして、理由を確認。1時間目は補数まで、2時間目は小数と誤差へ進めます。</span></p></aside>
          <div className="binary-intro-note">目安2時間 · プリント05に対応 · Web上の模擬実験です</div>
          <div className="learning-paths" aria-label="学び方を選ぶ"><a href="#arithmetic"><span>基本から</span><b>加減算を1桁ずつ</b><small>1時間目</small></a><a href="#complement"><span>しくみ重視</span><b>補数で引き算</b><small>プリント連動</small></a><a href="#real-numbers"><span>2時間目から</span><b>実数と誤差</b><small>発展へ</small></a></div>
        </section>
        <ArithmeticLab />
        <ComplementLab />
        <RealNumbersLab />
        <ErrorLab />
        <BinaryCheckpoint />
        <footer className="lesson-footer"><div><b>理数情報ラボ</b><span>高校 情報Ⅰ · 2学期補助教材</span></div><p>プリントと教科書の学習順序に合わせ、説明・図解・操作画面は本教材用に独自作成しています。</p><div><Link href="/third-party-notices.txt">第三者ライセンス</Link><Link href="/">単元一覧へ戻る ↑</Link></div></footer>
      </article>
    </div>
  </main>;
}
