import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import thinkingMascot from '@/public/mascots/student-thinking.png';
import { CompressionBasicsLab } from './components/CompressionBasicsLab';
import { FormatsLab } from './components/FormatsLab';
import { LosslessLab } from './components/LosslessLab';
import { ImageCompressionLab } from './components/ImageCompressionLab';
import { CompressionCheckpoint } from './components/CompressionCheckpoint';

export const metadata: Metadata = {
  title: '02-03 データの圧縮｜理数情報ラボ',
  description: '可逆・非可逆圧縮、圧縮率、圧縮方式と画像形式を操作しながら学ぶ教材',
  robots: { index: false, follow: false },
  openGraph: { images: [] },
  twitter: { images: [] },
};

export default function CompressionUnit() {
  return (
    <main>
      <header className="site-header unit-header">
        <Link className="brand" href="/"><span className="brand-mark" aria-hidden="true">01</span><span>理数情報ラボ</span></Link>
        <span className="lesson-progress">02-03 · データの圧縮 · 教科書 pp.62–65</span>
      </header>
      <div className="lesson-shell">
        <nav className="lesson-nav" aria-label="単元内メニュー">
          <Link href="/">← 単元一覧</Link>
          <p>データの圧縮<br /><small>教科書 pp.62–65</small></p>
          <ol><li><a href="#basics">1　圧縮の基本</a></li><li><a href="#formats">2　形式と利用</a></li><li><a href="#lossless">3　可逆圧縮</a></li><li><a href="#images-compression">4　画像形式</a></li><li><a href="#checkpoint-02-03">5　プリント確認</a></li></ol>
          <div className="nav-note"><b>このサイトは</b><span>入力を送信・保存しません。何度試しても学習記録は残りません。</span></div>
        </nav>
        <article className="lesson-content">
          <section className="lesson-intro compression-intro">
            <p className="eyebrow">UNIT 02-03 · DATA COMPRESSION</p><span className="textbook-page">教科書 pp.62–65</span>
            <h1>小さくしても、<br />大切な情報は残せる？</h1>
            <p>圧縮前後を比べながら、データを小さくする方法と、用途に合う形式の選び方を学びます。</p>
            <div className="mission-box"><span>今日のミッション</span><strong>「何を残し、何をまとめるか」を根拠に、圧縮方法を選べる。</strong></div>
            <aside className="mascot-guide"><Image src={thinkingMascot} alt="考えている生徒のマスコット" priority /><p><b>小ささだけで決めないのがコツ。</b><span>伸張したときに完全に戻す必要があるか、用途から考えてみよう。</span></p></aside>
            <div className="learning-paths" aria-label="学び方を選ぶ"><a href="#basics"><span>はじめて</span><b>可逆と非可逆を比較</b><small>おすすめ</small></a><a href="#lossless"><span>しくみ重視</span><b>4つの圧縮法を体験</b><small>プリント連動</small></a><a href="#images-compression"><span>使い分け</span><b>画像形式を比較</b><small>実践</small></a></div>
          </section>
          <CompressionBasicsLab />
          <FormatsLab />
          <LosslessLab />
          <ImageCompressionLab />
          <CompressionCheckpoint />
          <footer className="lesson-footer"><div><b>理数情報ラボ</b><span>高校 情報Ⅰ · 2学期補助教材</span></div><p>プリントと教科書の学習順序に合わせ、図解と操作画面は本教材用に独自作成しています。</p><div><Link href="/third-party-notices.txt">第三者ライセンス</Link><Link href="/">単元一覧へ戻る ↑</Link></div></footer>
        </article>
      </div>
    </main>
  );
}
