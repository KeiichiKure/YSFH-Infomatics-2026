import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import thinkingMascot from '@/public/mascots/student-thinking.png';
import understoodMascot from '@/public/mascots/student-understood.png';
import { SamplingLab } from './components/SamplingLab';
import { ImageLab } from './components/ImageLab';
import { MotionLab } from './components/MotionLab';
import { DataSizeLab } from './components/DataSizeLab';

export const metadata: Metadata = {
  title: '02-02 情報のデジタル化｜理数情報ラボ',
  description: '標本化・量子化・符号化、画像、動画、立体表現、データ量を操作しながら学ぶ教材',
  openGraph: { images: [] },
  twitter: { images: [] },
};

const terms = [
  ['1', '波', '音や光が持つ性質'], ['2', '振幅', '波の大きさを表す量'],
  ['3', 'サンプリング', '一定間隔でアナログ量を取り出す標本化'], ['4', '標本点', '標本化で取り出したアナログ量'],
  ['5', '量子化ビット数', '量子化の段階数を決めるビット数'], ['6', '量子化誤差', '標本点と量子化後の段階値のずれ'],
  ['7', '周波数', '1秒間に通過する波の数'], ['8', '周期', '1個の波が伝わる時間'],
  ['9', '標本化定理', '元の最高周波数の2倍を超える周波数で標本化する'],
  ['11', 'ピクセル', 'ラスタ画像を構成する画素'], ['12', '光の三原色', '赤・緑・青の光'],
  ['13', '加法混色', '光を混ぜるほど白へ近づく混色'], ['14', '画素数', '縦横に配置された画素の数'],
  ['15', '解像度', '1インチあたりの画素の密度'], ['16', '階調', '各色の明るさの段階数'],
  ['17', '24ビットフルカラー', 'RGB各8ビット、合計24ビットの色表現'],
  ['18', 'フレーム', '動画を構成する1枚の静止画'], ['19', 'fps', '1秒あたりに再生するフレーム数'],
  ['20', '3DCG', '平面の画面に立体物を表現する技術'], ['21', '視差', '左右の目で見え方が少し異なること'],
];

export default function DigitalizationUnit() {
  return (
    <main>
      <header className="site-header unit-header">
        <Link className="brand" href="/"><span className="brand-mark" aria-hidden="true">01</span><span>理数情報ラボ</span></Link>
        <span className="lesson-progress">02-02 · 情報のデジタル化 · 教科書 pp.57–61</span>
      </header>
      <div className="lesson-shell">
        <nav className="lesson-nav" aria-label="単元内メニュー">
          <Link href="/">← 単元一覧</Link>
          <p>情報のデジタル化<br /><small>教科書 pp.57–61</small></p>
          <ol><li><a href="#sampling">1　波をデータに</a></li><li><a href="#images">2　画像のしくみ</a></li><li><a href="#motion">3　動画と立体</a></li><li><a href="#data-size">4　データ量</a></li><li><a href="#checkpoint-02-02">5　プリント確認</a></li></ol>
          <div className="nav-note"><b>このサイトは</b><span>入力を送信・保存しません。数値を何度変えても記録は残りません。</span></div>
        </nav>
        <article className="lesson-content">
          <section className="lesson-intro digit-intro">
            <p className="eyebrow">UNIT 02-02 · DIGITIZATION</p><span className="textbook-page">教科書 pp.57–61</span>
            <h1>音も画像も、<br />点と数に変えてみよう。</h1>
            <p>標本化・量子化・符号化という共通の流れから、音、画像、動画、立体表現までをつなぎます。</p>
            <div className="mission-box"><span>今日のミッション</span><strong>再現性を高める条件と、データ量が増える理由を説明できる。</strong></div>
            <aside className="mascot-guide"><Image src={thinkingMascot} alt="考えている生徒のマスコット" priority /><p><b>数値を一つずつ動かそう。</b><span>波や画像の変化と、式の中の数を結び付けるのがコツです。</span></p></aside>
            <div className="learning-paths" aria-label="学び方を選ぶ"><a href="#sampling"><span>はじめて</span><b>3段階の流れから</b><small>おすすめ</small></a><a href="#images"><span>見て学ぶ</span><b>画像の実験へ</b><small>プリント連動</small></a><a href="#data-size"><span>深めたい</span><b>データ量を計算</b><small>発展</small></a></div>
          </section>
          <SamplingLab />
          <ImageLab />
          <MotionLab />
          <DataSizeLab />
          <section className="learning-section checkpoint" id="checkpoint-02-02">
            <div className="section-kicker"><span>05</span><p>プリント最終確認</p></div>
            <div className="section-title-row"><div><p className="step-label">言葉にする</p><h2>重要語を体験とつなごう</h2></div><p className="section-question">番号を見て答えを思い出してから、カードを開こう。</p></div>
            <div className="term-grid">{terms.map(([number, term, meaning]) => <details key={number}><summary><span>{number}</span><strong>{term}</strong></summary><p>{meaning}</p></details>)}</div>
            <div className="final-challenge digit-final"><Image src={understoodMascot} alt="理解して手を挙げる生徒のマスコット" /><div><p className="step-label">最後の問い</p><h3>元の情報に近づけると、なぜデータ量が増える？</h3><ol><li>1秒間に取り出す標本点の数</li><li>1つの値を表す量子化ビット数</li><li>画像の画素数や動画のフレーム数</li></ol><p>この3つを使って60秒で説明できたら、今日のミッション達成です。</p></div></div>
          </section>
          <footer className="lesson-footer"><div><b>理数情報ラボ</b><span>高校 情報Ⅰ · 2学期補助教材</span></div><p>プリントと教科書の学習順序に合わせ、図解と操作画面は本教材用に独自作成しています。</p><div><Link href="/third-party-notices.txt">第三者ライセンス</Link><Link href="/">単元一覧へ戻る ↑</Link></div></footer>
        </article>
      </div>
    </main>
  );
}
