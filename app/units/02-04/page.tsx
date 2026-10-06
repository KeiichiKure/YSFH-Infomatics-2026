import type { Metadata } from 'next';
import { sections } from './components/lessonData';
import { Guide } from './components/LessonParts';
import { TimePlaceLab } from './components/TimePlaceLab';
import { PeopleLab } from './components/PeopleLab';
import { HistoryLab } from './components/HistoryLab';
import { MediaImpactLab } from './components/MediaImpactLab';
import { MailComposeLab } from './components/MailComposeLab';
import { MailVisibilityLab } from './components/MailVisibilityLab';
import { CommunicationCheckpoint } from './components/CommunicationCheckpoint';
import './communication.css';
import './communication-revised.css';

const basePath = process.env.PAGES_BASE_PATH ?? '';
const title = '02-04 コミュニケーションとメディア｜理数情報ラボ';
const description = '時間・場所・人数の特性を活かし、通信の歴史・実データの分析・メールを体験する、プリント10連動教材。';
export const metadata: Metadata = { title, description, robots: { index: false, follow: false }, openGraph: { title, description, images: [] }, twitter: { title, description, images: [] } };

export default function CommunicationUnit() {
  return <main className="communication-unit"><a className="cm-skip" href="#time-place">学習内容へ進む</a><header className="site-header unit-header"><a className="brand" href={`${basePath}/`}><span className="brand-mark" aria-hidden="true">01</span><span>理数情報ラボ</span></a><span className="lesson-progress">02-04 · 教科書 pp.38–41</span></header><div className="cm-shell"><nav className="cm-nav" aria-label="単元内メニュー"><a href={`${basePath}/`}>← 単元一覧</a><p>コミュニケーション<br />とメディア</p><small>教科書 第08節 pp.38–41<br />２学期プリント10</small><ol>{sections.map((s, i) => <li key={s.id}><a href={`#${s.id}`}><span>{i + 1}</span>{s.title}</a></li>)}<li><a href="#checkpoint"><span>✓</span>用語と理由を確認</a></li></ol><aside><b>投票は全クラスで共有</b><p>第1節の選択と理由は、投票先へ保存して匿名で共有します。他の体験は模擬画面です。</p></aside><a className="cm-previous" href={`${basePath}/units/02-03/`}>前の単元：データの圧縮</a></nav><article className="cm-content"><section className="cm-intro"><p className="eyebrow">UNIT 02-04 · COMMUNICATION & MEDIA</p><span className="cm-chip">教科書 pp.38–41 / プリント10</span><h1>同じ知らせでも、<br /><em>誰に、いつ、どう伝える？</em></h1><p className="cm-lead">届いたことと、伝わったことは同じだろうか。<br />相手と目的に合う方法を、動かして考えよう。</p><Guide><b>「既読」なら、集合場所まで伝わった？</b><p>相手の返事から、同じ意味で理解できたか確かめよう。</p></Guide><div className="cm-mission"><small>今日のミッション</small><strong>相手・目的・時間・宛先の見え方を根拠に、伝える手段を選び、相手に伝わるメールを整える。</strong></div><div className="cm-paths" aria-label="学び方を選ぶ"><a href="#time-place"><small>はじめから</small><b>時間・場所・人数</b><span>場面に合う方法を提案する →</span></a><a href="#media-impact"><small>場面で選ぶ</small><b>広がりと確かさ</b><span>情報を見分ける →</span></a><a href="#mail-compose"><small>メールを体験</small><b>様式と宛先</b><span>受信画面を比較する →</span></a></div><p className="cm-small">目安1時間。第1節は共有投票、SNS・メールなどは学習用の模擬画面です。</p></section><TimePlaceLab basePath={basePath} /><PeopleLab basePath={basePath} /><HistoryLab basePath={basePath} /><MediaImpactLab basePath={basePath} /><MailComposeLab /><MailVisibilityLab basePath={basePath} /><CommunicationCheckpoint /><footer className="lesson-footer"><div><b>理数情報ラボ</b><span>高校 情報Ⅰ · 02-04</span></div><p>教科書第08節・プリント10の学習順序に対応。説明・図・操作画面は本教材用に作成しています。</p><div><a href={`${basePath}/third-party-notices.txt`}>第三者ライセンス</a><a href={`${basePath}/`}>単元一覧へ戻る ↑</a></div></footer></article></div></main>;
}
