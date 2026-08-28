import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import thinkingMascot from '@/public/mascots/student-thinking.png';
import { HardwareLab } from './components/HardwareLab';
import { SoftwareLab } from './components/SoftwareLab';
import { OsPurposeLab } from './components/OsPurposeLab';
import { IoTLab } from './components/IoTLab';
import { HardwareCheckpoint } from './components/HardwareCheckpoint';
import './hardware.css';

const title = '03-01 ハードウェアとソフトウェア｜理数情報ラボ';
const description = '機器・OS・アプリの協力を、接続、印刷、ファイル、IoTの模擬実験で学ぶ高校情報Ⅰの教材。';

export const metadata: Metadata = {
  title, description,
  robots: { index: false, follow: false },
  openGraph: { title, description, images: [] },
  twitter: { title, description, images: [] },
};

export default function HardwareSoftwareUnit() {
  return (
    <main className="hw-unit">
      <a className="hw-skip" href="#hardware">学習内容へ進む</a>
      <header className="site-header unit-header">
        <Link className="brand" href="/"><span className="brand-mark" aria-hidden="true">01</span><span>理数情報ラボ</span></Link>
        <span className="lesson-progress">03-01 · 教科書 pp.68–71</span>
      </header>
      <div className="lesson-shell">
        <nav className="lesson-nav" aria-label="単元内メニュー">
          <Link href="/">← 単元一覧</Link>
          <p>ハードウェアと<br />ソフトウェア<br /><small>教科書 pp.68–71</small></p>
          <ol>
            <li><a href="#hardware">1　ハードウェアと接続</a></li>
            <li><a href="#software">2　ソフトウェアとOS</a></li>
            <li><a href="#os-purpose">3　OSの目的とファイル</a></li>
            <li><a href="#iot">4　IoT</a></li>
            <li><a href="#checkpoint-03-01">5　プリント確認</a></li>
          </ol>
          <div className="nav-note"><b>記録・ログインなし</b><span>操作・解答は送信も保存もしません。再読み込みすると初めに戻ります。</span></div>
        </nav>
        <article className="lesson-content">
          <section className="lesson-intro">
            <p className="eyebrow">UNIT 03-01 · HARDWARE & SOFTWARE</p>
            <span className="textbook-page">教科書 pp.68–71</span>
            <h1>タップの先で、<br />何が動いている？</h1>
            <p className="hw-lead">画面の操作から、機器が動くまで。<br />ハードウェア・OS・アプリの「協力」を、動かして確かめよう。</p>
            <div className="mission-box"><span>今日のミッション</span><strong>機器・OS・アプリがどう協力するかを、身近な操作を例に説明できる。</strong></div>
            <aside className="mascot-guide"><Image src={thinkingMascot} alt="考えている生徒のマスコット" priority /><p><b>「誰と誰をつなぐ？」が手がかり。</b><span>予想して、試して、プリントへ。わからなくなったら、何度でも戻って大丈夫。</span></p></aside>
            <div className="hw-intro-note">目安50分 · プリント04に対応 · Web上の模擬実験です</div>
            <div className="learning-paths" aria-label="学び方を選ぶ"><a href="#hardware"><span>はじめて</span><b>装置と接続から</b><small>おすすめ</small></a><a href="#software"><span>しくみ重視</span><b>OSの仲介を体験</b><small>プリント連動</small></a><a href="#checkpoint-03-01"><span>復習したい</span><b>重要語と場面問題</b><small>理解を確認</small></a></div>
          </section>
          <HardwareLab />
          <SoftwareLab />
          <OsPurposeLab />
          <IoTLab />
          <HardwareCheckpoint />
          <footer className="lesson-footer"><div><b>理数情報ラボ</b><span>高校 情報Ⅰ · 2学期補助教材</span></div><p>プリントと教科書の学習順序に合わせ、説明・図解・操作画面は本教材用に独自作成しています。</p><div><Link href="/third-party-notices.txt">第三者ライセンス</Link><Link href="/">単元一覧へ戻る ↑</Link></div></footer>
        </article>
      </div>
    </main>
  );
}
