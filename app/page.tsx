import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <Link className="brand" href="/" aria-label="理数情報ホーム">
          <span className="brand-mark" aria-hidden="true">01</span>
          <span>理数情報ラボ</span>
        </Link>
        <span className="privacy-pill">記録・ログインなし</span>
      </header>

      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="eyebrow">RISU JOHO · INTERACTIVE LEARNING</p>
          <h1>触って、比べて、<br />しくみを見つけよう。</h1>
          <p className="hero-lead">
            答えを覚える前に、まず動かしてみる。理数情報の学びを、自分のペースで深めるウェブ教材です。
          </p>
          <div className="hero-actions">
            <Link className="primary-button" href="/units/02-02/">
              02-02の学習をはじめる <span aria-hidden="true">→</span>
            </Link>
            <span className="hero-note">目安 40分 · スマホ／PC対応</span>
          </div>
        </div>
        <div className="hero-visual" aria-label="連続的な波が0と1のデジタルデータへ変わるイメージ">
          <div className="signal-card signal-card-analog">
            <span>ANALOG</span>
            <div className="signal-wave" aria-hidden="true" />
            <b>連続する量</b>
          </div>
          <div className="signal-arrow" aria-hidden="true">→</div>
          <div className="signal-card signal-card-digital">
            <span>DIGITAL</span>
            <div className="bit-preview" aria-hidden="true"><i>1</i><i>0</i><i>1</i><i>1</i></div>
            <b>区切った値</b>
          </div>
        </div>
      </section>

      <section className="unit-list" aria-labelledby="units-title">
        <div className="section-heading">
          <p className="eyebrow">2学期 · UNIT 02</p>
          <h2 id="units-title">学習する単元</h2>
        </div>
        <Link className="unit-card unit-card-active" href="/units/02-01/">
          <span className="unit-number">02-01</span>
          <div>
            <h3>アナログとデジタル</h3>
            <span className="textbook-page">教科書 pp.54–56</span>
            <p>波形、ビット、進数、文字コードを体験でつなぐ</p>
          </div>
          <span className="unit-status">学習する →</span>
        </Link>
        <Link className="unit-card unit-card-active" href="/units/02-02/">
          <span className="unit-number">02-02</span>
          <div>
            <h3>情報のデジタル化</h3>
            <span className="textbook-page">教科書 pp.57–61</span>
            <p>標本化、画像、動画、立体表現を操作でつなぐ</p>
          </div>
          <span className="unit-status">学習する →</span>
        </Link>
      </section>
    </main>
  );
}

