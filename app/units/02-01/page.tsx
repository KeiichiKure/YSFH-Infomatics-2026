import Link from 'next/link';
import Image from 'next/image';
import thinkingMascot from '@/public/mascots/student-thinking.png';
import { BaseLab } from './components/BaseLab';
import { BinaryLab } from './components/BinaryLab';
import { CharacterLab } from './components/CharacterLab';
import { MediaLab, SignalLab } from './components/SignalLab';

const terms = [
  ['01', '連続的', '切れ目なく変化する'], ['01', '離散的', '飛び飛びの値として表す'],
  ['02', '2進法', '0と1で数を表す方法'], ['02', '2進数', '2進法で表した数値'],
  ['03', 'ビット', '情報量の最小単位'], ['03', '8ビット', '8個のビットをまとめる'],
  ['03', '1バイト', '8ビットのまとまり'], ['03', '1024', '2の10乗'],
  ['04', '10進法', '0～9を使う表現方法'], ['04', '10進数', '10進法で表した数値'],
  ['04', '16進法', '0～9とA～Fを使う方法'], ['04', '16進数', '16進法で表した数値'],
  ['05', '1バイト', '英数字・記号などの基本'], ['05', '2バイト', 'JIS系での漢字などの表現'],
  ['05', '文字化け', '文字コードの不一致で別表示'], ['05', '機種依存文字', '旧来の環境差に注意'],
  ['05', '可変長', '文字ごとに使う長さが変わる'],
];

export default function AnalogDigitalUnit() {
  return (
    <main>
      <header className="site-header unit-header">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">01</span>
          <span>理数情報ラボ</span>
        </Link>
        <span className="lesson-progress">02-01 · アナログとデジタル · 教科書 pp.54–56</span>
      </header>

      <div className="lesson-shell">
        <nav className="lesson-nav" aria-label="単元内メニュー">
          <Link href="/">← 単元一覧</Link>
          <p>アナログとデジタル<br /><small>教科書 pp.54–56</small></p>
          <ol>
            <li><a href="#signal">1　波を区切る</a></li>
            <li><a href="#media">2　0と1の世界</a></li>
            <li><a href="#bits">3　ビットとバイト</a></li>
            <li><a href="#bases">4　進数変換</a></li>
            <li><a href="#characters">5　文字コード</a></li>
            <li><a href="#checkpoint">6　プリント確認</a></li>
          </ol>
          <div className="nav-note"><b>このサイトは</b><span>入力を送信・保存しません。自分のペースで何度でも試せます。</span></div>
        </nav>

        <article className="lesson-content">
          <section className="lesson-intro">
            <p className="eyebrow">UNIT 02-01 · ANALOG &amp; DIGITAL</p>
            <span className="textbook-page">教科書 pp.54–56</span>
            <h1>見えない情報を、<br />0と1に変えてみよう。</h1>
            <p>波形、スイッチ、数、文字。ばらばらに見える内容を「0と1で表す」という一本の線でつなぎます。</p>
            <div className="mission-box"><span>今日のミッション</span><strong>デジタル表現の仕組みを、操作と途中式を使って説明できる。</strong></div>
            <aside className="mascot-guide">
              <Image src={thinkingMascot} alt="考えている生徒のマスコット" priority />
              <p><b>迷ったら、まず動かしてみよう。</b><span>予想と違ったところが、いちばん大切な発見です。</span></p>
            </aside>
            <div className="learning-paths" aria-label="学び方を選ぶ">
              <a href="#signal"><span>はじめて</span><b>上から順番に試す</b><small>おすすめ</small></a>
              <a href="#bases"><span>練習したい</span><b>進数変換へ進む</b><small>プリント連動</small></a>
              <a href="#characters"><span>深めたい</span><b>文字コードへ進む</b><small>発展あり</small></a>
            </div>
          </section>

          <SignalLab />
          <MediaLab />
          <BinaryLab />
          <BaseLab />
          <CharacterLab />

          <section className="learning-section checkpoint" id="checkpoint">
            <div className="section-kicker"><span>06</span><p>プリント最終確認</p></div>
            <div className="section-title-row"><div><p className="step-label">言葉にする</p><h2>体験と重要語をつなごう</h2></div><p className="section-question">緑の単元番号を目印に学んだ場所を振り返り、語句をクリックして自分の説明と比べよう。</p></div>
            <div className="term-grid">
              {terms.map(([sectionNumber, term, meaning]) => <details key={`${sectionNumber}-${term}`}><summary><span>{sectionNumber}</span><strong>{term}</strong></summary><p>{meaning}</p></details>)}
            </div>
            <div className="final-challenge">
              <p className="step-label">最後の問い</p>
              <h3>「デジタルは0と1で表す」とは、具体的にどういうこと？</h3>
              <ol><li>連続量をどのように区切るか</li><li>0と1を現実の媒体でどう表すか</li><li>数や文字をどう0と1へ対応させるか</li></ol>
              <p>この3点を、隣の人に60秒で説明できたら今日のミッション達成です。</p>
            </div>
          </section>

          <footer className="lesson-footer">
            <div><b>理数情報ラボ</b><span>高校 情報Ⅰ · 2学期補助教材</span></div>
            <p>図解と操作画面は本教材用に独自作成しています。規格に関する補足はUnicode Standard、JIS・SIの一般的な規格情報に基づきます。</p>
            <div><Link href="/third-party-notices.txt">第三者ライセンス</Link><Link href="/">単元一覧へ戻る ↑</Link></div>
          </footer>
        </article>
      </div>
    </main>
  );
}

