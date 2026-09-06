import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import thinkingMascot from '@/public/mascots/student-thinking.png';
import teacherMascot from '@/public/mascots/teacher-praise.png';
import { ProblemFramingLab } from './components/ProblemFramingLab';
import { PersonaLab } from './components/PersonaLab';
import { AbstractionLab } from './components/AbstractionLab';
import { PosterHierarchyLab } from './components/PosterHierarchyLab';
import { PosterChecklist } from './components/PosterChecklist';
import './design.css';

const title = 'SP-01 情報デザイン実習｜理数情報ラボ';
const description = '忘れ物防止ポスターの制作を通して、問題の構造化、ペルソナ、抽象化、シグニファイア、ジャンプ率を学ぶ高校情報Ⅰの教材。';

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
  openGraph: { title, description, images: [] },
  twitter: { title, description, images: [] },
};

export default function InformationDesignPractice() {
  return <main className="design-unit">
    <a className="design-skip" href="#problem">学習内容へ進む</a>
    <header className="site-header unit-header"><Link className="brand" href="/"><span className="brand-mark" aria-hidden="true">01</span><span>理数情報ラボ</span></Link><span className="lesson-progress">SP-01 · 教科書 pp.42–47</span></header>
    <div className="design-shell">
      <nav className="design-nav" aria-label="単元内メニュー">
        <Link href="/">← 単元一覧</Link><p>情報デザイン実習<br /><small>忘れ物防止ポスター</small></p>
        <ol><li><a href="#problem">1　問題を構造化</a></li><li><a href="#persona">2　ペルソナ</a></li><li><a href="#abstract">3　抽象化と手がかり</a></li><li><a href="#hierarchy">4　視覚階層</a></li><li><a href="#production-check">5　制作前チェック</a></li></ol>
        <div className="design-nav-note"><b>記録・ログインなし</b><span>操作・解答は送信も保存もしません。再読み込みすると初めに戻ります。</span></div>
      </nav>
      <article className="design-content">
        <section className="design-intro">
          <p className="eyebrow">SPECIAL PRACTICE · INFORMATION DESIGN</p><span className="textbook-page">教科書 pp.42–47</span>
          <h1>「見せる」から、<br /><em>行動を変える</em><span className="design-title-tail">デザインへ。</span></h1>
          <p className="design-lead">忘れ物が起こる場面を観察し、誰に・何を・どんな順番で伝えるかを設計します。</p>
          <div className="design-mission"><span>6時間のミッション</span><strong>忘れ物を「気をつける」で終わらせず、退出前の確認行動へ変えるポスターをつくる。</strong></div>
          <div className="design-cast">
            <div className="design-speaker"><Image src={thinkingMascot} alt="ポスターの伝え方を考える生徒のマスコット" priority /><div className="design-balloon"><span>生徒の設計メモ</span><b>きれいにする前に、誰のどんな行動を変えるか決めるんだね。</b></div></div>
            <div className="design-speaker teacher"><Image src={teacherMascot} alt="制作条件を案内する先生のマスコット" priority /><div className="design-balloon"><span>先生の確認</span><b>その通り。理由を説明できるデザインにしていきましょう。</b></div></div>
          </div>
          <div className="assignment-rules"><b>今回の制作条件</b><span>A4縦・片面・フルカラー</span><span>端から約5mmは安全領域外</span><span>写真・写真風画像・画像生成は禁止</span><span>無料素材または自作イラストのみ</span></div>
          <p className="design-mascot-note">※このページのマスコットは学習案内役です。課題ポスターへ使用できる素材ではありません。</p>
          <div className="design-paths" aria-label="授業時間ごとの入口"><a href="#problem"><span>1時間目</span><b>問題を見つける</b><small>As-Is／To-Be</small></a><a href="#persona"><span>2時間目</span><b>受け手を決める</b><small>ペルソナ</small></a><a href="#abstract"><span>3時間目</span><b>伝わる形にする</b><small>抽象化・視覚階層</small></a></div>
        </section>
        <ProblemFramingLab />
        <PersonaLab />
        <AbstractionLab />
        <PosterHierarchyLab />
        <PosterChecklist />
        <footer className="lesson-footer"><div><b>理数情報ラボ</b><span>高校 情報Ⅰ · 情報デザイン実習</span></div><p>ワークシートと教科書の学習順序に合わせ、説明・ポスター例・操作画面は本教材用に独自作成しています。</p><div><Link href="/third-party-notices.txt">第三者ライセンス</Link><Link href="/">単元一覧へ戻る ↑</Link></div></footer>
      </article>
    </div>
  </main>;
}
