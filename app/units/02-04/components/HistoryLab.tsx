'use client';
import { useState } from 'react';
import { historyItems, circled, terms } from './lessonData';
import { historySources } from './historySources';
import { Section, Frame } from './LessonParts';
import { SceneImage } from './SceneImage';
import '../history-selection.css';

const importantWords = terms.filter(t => t.sectionNumber === 3 && t.worksheetBlanks.length > 0).map(t => t.term).concat(['アナログ', 'デジタル']).sort((a, b) => b.length - a.length);
const importantPattern = new RegExp(`(${importantWords.join('|')})`, 'g');
function HistoryText({ text }: { text: string }) {
  return <>{text.split(importantPattern).map((part, i) => importantWords.includes(part) ? <strong className="cm-history-important" key={i}>{part}</strong> : part)}</>;
}

export function HistoryLab({ basePath }: { basePath: string }) {
  const [index, setIndex] = useState(0), h = historyItems[index];
  const sources = historySources[h.year];
  return <Section number={3} question="年号を選ぶと、その頃の暮らしと通信が一緒に見られます。離れた相手へ、何を、どのように伝えられたでしょう。">
    <Frame id="history-lab" title="節目を選んで、暮らしと通信を比べる">
      <div className="cm-history-selection">
        <nav className="cm-history-years" aria-label="通信の節目を年号から選ぶ">
          <b>年号を選ぶ</b>
          <ol>{historyItems.map((item, i) => <li key={item.year}><button type="button" aria-pressed={i === index} aria-controls="cm-history-selected" onClick={() => setIndex(i)}><b>{item.year}</b><span>{item.icon}</span></button></li>)}</ol>
        </nav>
        <article className="cm-history-selected" id="cm-history-selected">
          <h4 aria-live="polite"><span>{h.year}</span> <HistoryText text={h.name} /></h4>
          <div className="cm-history-selected-grid">
            <div className="cm-history-life">
              <figure><SceneImage name={h.image} alt={h.alt} basePath={basePath} /><figcaption><b>{h.era}</b><span>{h.clothes}</span><small>暮らしを考える生成イラスト</small></figcaption></figure>
              {sources.length > 0 && <div className="cm-history-experience"><b>実物・記録に触れる</b>{sources.map(source => <div key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a><p>{source.prompt}</p></div>)}</div>}
            </div>
            <div className="cm-history-facts">
              <div className="cm-history-milestone"><div><b>何が始まった？</b>{h.blank.length > 0 && <span className="cm-blank">プリント {h.blank.map(circled).join('・')}</span>}</div><p><HistoryText text={h.description} /></p></div>
              <div className="cm-history-japan"><b>この頃の日本</b><p>{h.context}</p></div>
              <div className="cm-history-fact"><b>通信の仕組み</b><p><HistoryText text={h.mechanism} /></p></div>
              <div className="cm-history-fact is-benefit"><b>できること <span><HistoryText text={h.property} /></span></b><p><HistoryText text={h.effect} /></p></div>
              <div className="cm-history-fact is-limit"><b>残る制約</b><p><HistoryText text={h.limit} /></p></div>
            </div>
          </div>
        </article>
      </div>
    </Frame>
    <p className="cm-summary"><b>遠くへ、多くへ、互いに、使いやすく。</b>伝播性・双方向性・利便性の変化を、具体的な道具と結び付けよう。新しい手段が登場しても、古い手段がなくなるわけではありません。</p>
  </Section>;
}
