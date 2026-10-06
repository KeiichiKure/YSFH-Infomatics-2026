'use client';
import { useState } from 'react';
import { Frame, Feedback, Note } from './LessonParts';
import '../information-evidence.css';

const posts = [
  { name: '青空高校 文化祭実行委員会', handle: '@aozora_fes2026', avatar: '青', date: '2026/10/17 8:00', body: '本日の文化祭は開催します。雨のため受付開始を9:30へ変更します。受付は体育館入口です。昨日までの案内から変更しました。', likes: '48', shares: '12', sender: '主催者の実行委員会を名乗っています。公式かどうかは、学校Webサイトのリンクも確認します。', timing: '出発直前に更新された、開催当日の告知です。', evidence: '開催すること、変更した受付時刻、場所が具体的に書かれています。' },
  { name: '青空高校 文化祭実行委員会', handle: '@aozora_fes2026', avatar: '青', date: '2026/10/10 16:00', body: '10月17日（土）の文化祭は9:00受付開始を予定しています！ 皆さんのお越しをお待ちしています。', likes: '320', shares: '140', sender: '同じ実行委員会名義の投稿です。発信元の手がかりがあっても、古い案内には注意します。', timing: '1週間前の予定です。当日の変更が反映されていません。', evidence: '雨の場合の変更には触れていません。同じ主催者の最新投稿も確認しよう。' },
  { name: 'みずたま☁', handle: '@mizu_8q7', avatar: '☁', date: '2026/10/17 7:58', body: '今日の文化祭、中止って聞いた…？ 友達が言ってた。こんな雨だし行くのやめようかな。公式はまだ見てない。', likes: '97', shares: '56', sender: '主催者との関係が分からない個人アカウント。表示名だけで真偽を決めず、発信者の立場を調べます。', timing: '新しい投稿ですが、新しいだけでは確かな情報とは言えません。', evidence: '伝聞で、公式発表を確認していません。主催者の発表へたどろう。' },
  { name: '週末おでかけメモ', handle: '@weekend_clip', avatar: '週', date: '2026/10/17 7:55', body: '今日のおすすめ！ 青空高校の文化祭は9時から。保存した案内をシェアします！', quote: '青空高校 @aozora_fes2026 · 2026/10/10「10月17日は9:00受付開始を予定」', likes: '1.2万', shares: '1万', sender: '案内を紹介するアカウント。主催者の発信そのものではありません。', timing: '投稿自体は当日でも、引用した元の案内は1週間前です。', evidence: '共有数は多くても、受付時刻の変更は確認していません。元の最新告知と照合しよう。' },
];
const evidenceChecks = [
  [true, true, true],
  [true, false, false],
  [false, true, false],
  [false, false, false],
];
export function InformationChoiceLab() {
  const [selected, setSelected] = useState<number | null>(null);
  const p = selected === null ? null : posts[selected];
  return <>
    <Frame id="information-lab" title="雨の日、文化祭へ出発してよい？">
      <p className="cm-task"><b>10月17日8:10、文化祭へ出発する直前。</b>雨が降っている。開催する？ 受付は何時？ 根拠にする投稿を選ぼう。</p>
      <div className="cm-split cm-social-layout">
        <div className="cm-social-feed"><div className="cm-social-heading"><b>学習用SNS</b><span>すべて架空の投稿</span></div><div className="cm-post-grid">{posts.map((s, i) => <button className="cm-post" key={i} aria-pressed={selected === i} onClick={() => setSelected(i)}>
          <span className="cm-post-account"><span className="cm-avatar" aria-hidden="true">{s.avatar}</span><span><b>{s.name}</b><span>{s.handle}</span></span></span>
          <time>{s.date}</time><p>{s.body}</p>{s.quote && <span className="cm-post-quote">{s.quote}</span>}
          <span className="cm-post-counts"><span>↩ 返信</span><span>↻ {s.shares}</span><span>♡ {s.likes}</span></span>
        </button>)}</div></div>
        <div className="cm-social-review">{p ? <>
          <Feedback state={selected === 0 ? 'good' : 'bad'}><b>{selected === 0 ? '✓ 開催と9:30開始を確認できる告知' : '× この投稿だけでは、出発の根拠が足りない'}</b></Feedback>
          <ol className="cm-check-evidence">{[['発信元の立場', p.sender], ['日時・元情報の新しさ', p.timing], ['内容の根拠', p.evidence]].map(([label, explanation], i) => {
            const good = evidenceChecks[selected!][i];
            return <li key={label} className={good ? 'is-good' : 'is-bad'}><b><span aria-label={good ? '手がかりあり' : '確認が不足'}>{good ? '✓' : '×'}</span> {label}</b><p>{explanation}</p></li>;
          })}</ol>
          <div className="cm-official-reminder"><b>主催者を、もう一段確かめよう</b><p>表示名は誰でも作れます。<strong>学校の公式ホームページから、このアカウントへリンクされているか</strong>確認しよう。良い告知を選べたときも忘れずに。</p></div>
        </> : <div className="cm-social-wait"><b>どの投稿を根拠にする？</b><p>アカウント名・日時・本文を読んで一つ選ぼう。選ぶと、根拠の解説が表示されます。</p><p>選んだ理由をペアに説明しよう。</p></div>}</div>
      </div>
    </Frame>
    <Note title="このSNS画面と、主催者の確認"><p>Xの投稿画面を参考にした学習用の模擬画面です。アカウント・文化祭・日時・投稿・反応数は架空で、実際のSNSへ投稿や送信はしません。チェック印は投稿の手がかりを比較する表示で、実在するアカウントの公式認証ではありません。</p><p>実際はアカウント名や認証表示だけで判断せず、学校の公式Webサイトなど別の確かな経路から主催者の最新情報を確かめます。</p></Note>
  </>;
}
