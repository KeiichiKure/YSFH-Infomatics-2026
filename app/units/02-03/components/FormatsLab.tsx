'use client';

import { useState } from 'react';

const scenarios = [
  { id: 'document', label: 'レポートをまとめて送る', kind: '文書・フォルダ', answer: 'ZIP', reason: '1文字も変えず、複数ファイルをまとめて戻せるため' },
  { id: 'photo', label: '旅行の写真を小さく保存', kind: '色数の多い写真', answer: 'JPEG', reason: '人が気付きにくい細部を省き、高い圧縮率にできるため' },
  { id: 'illustration', label: '色数の少ないアイコン', kind: '境界が明確なイラスト', answer: 'GIF / PNG', reason: '色の境界を保ったまま可逆圧縮できるため' },
  { id: 'audio', label: '音楽を配信する', kind: '音声', answer: 'AAC', reason: '聞こえ方への影響が小さい情報を省いて小さくできるため' },
  { id: 'video', label: '動画を配信する', kind: '動画', answer: 'MPEG-4（H.264）', reason: 'フレーム間の差分などを利用して動画を効率よく圧縮できるため' },
];

const choices = ['ZIP', 'GIF / PNG', 'JPEG', 'AAC', 'MPEG-4（H.264）'];

export function FormatsLab() {
  const [direction, setDirection] = useState<'encode' | 'decode'>('encode');
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [choice, setChoice] = useState('');
  const scenario = scenarios[scenarioIndex];
  const correct = choice === scenario.answer;

  const chooseScenario = (index: number) => {
    setScenarioIndex(index);
    setChoice('');
  };

  return (
    <section className="learning-section" id="formats">
      <div className="section-kicker"><span>02</span><p>圧縮の形式と利用 · 教科書 p.63</p></div>
      <div className="section-title-row">
        <div><p className="step-label">目的から形式を選ぶ</p><h2>同じ圧縮形式で、全部を小さくできる？</h2></div>
        <p className="section-question">元へ完全に戻す必要と、データの特徴から形式を選ぼう。</p>
      </div>

      <div className="codec-lab">
        <div className="lab-heading"><div><p className="step-label">ENCODE / DECODE</p><h3>変換の向きを切り替える</h3></div><span className="print-badge"><small>プリント</small><b>5・6</b></span></div>
        <div className="codec-toggle" aria-label="変換の向き">
          <button type="button" className={direction === 'encode' ? 'is-active' : ''} aria-pressed={direction === 'encode'} onClick={() => setDirection('encode')}>エンコード</button>
          <button type="button" className={direction === 'decode' ? 'is-active' : ''} aria-pressed={direction === 'decode'} onClick={() => setDirection('decode')}>デコード</button>
        </div>
        <div className={'codec-flow ' + direction}>
          <div><span>{direction === 'encode' ? '元のデータ' : '圧縮されたデータ'}</span><b>{direction === 'encode' ? 'REPORT + PHOTO' : 'ARCHIVE.ZIP'}</b><small>{direction === 'encode' ? '人が扱う内容' : '決められた形式の記録'}</small></div>
          <i aria-hidden="true">→</i>
          <div className="codec-machine"><span>{direction === 'encode' ? 'エンコーダ' : 'デコーダ'}</span><b>{direction === 'encode' ? '小さく変換' : '使える形へ伸張'}</b></div>
          <i aria-hidden="true">→</i>
          <div><span>{direction === 'encode' ? '圧縮されたデータ' : '伸張したデータ'}</span><b>{direction === 'encode' ? 'ARCHIVE.ZIP' : 'REPORT + PHOTO'}</b><small>{direction === 'encode' ? '保存・転送しやすい' : 'アプリで利用できる'}</small></div>
        </div>
        <p className="teacher-note">圧縮・伸張はエンコード・デコードの一例です。最近のOSやアプリは処理を自動で行うため、意識せず利用することもあります。</p>
      </div>

      <div className="format-choice-lab">
        <div className="lab-heading"><div><p className="step-label">FORMAT SELECTOR</p><h3>用途に合う形式を選ぶ</h3></div><span className="print-badge"><small>プリント</small><b>7・8</b></span></div>
        <div className="scenario-tabs" aria-label="保存したいデータ">
          {scenarios.map((item, index) => <button type="button" key={item.id} className={scenarioIndex === index ? 'is-active' : ''} onClick={() => chooseScenario(index)}>{item.label}</button>)}
        </div>
        <div className="format-question">
          <div><span>保存したいもの</span><strong>{scenario.label}</strong><small>{scenario.kind}</small></div>
          <fieldset>
            <legend>適した形式は？</legend>
            <div>{choices.map((item) => <label className={choice === item ? 'selected' : ''} key={item}><input type="radio" name="format-choice" value={item} checked={choice === item} onChange={() => setChoice(item)} /><span>{item}</span></label>)}</div>
          </fieldset>
        </div>
        {choice && <div className={'format-feedback ' + (correct ? 'correct' : 'wrong')} role="status"><b>{correct ? '正解：' + scenario.answer : 'もう一度、戻す必要とデータの特徴を確認しよう。'}</b><span>{correct ? scenario.reason : '選んだ形式：' + choice}</span></div>}

        <div className="audio-band">
          <div><p className="step-label">AUDIO BAND</p><h4>音声圧縮では、聞こえ方も利用する</h4><p>必要な周波数帯に絞るとデータ量を減らせます。電話では会話に必要な帯域を中心に扱います。</p></div>
          <div className="frequency-line" aria-label="人の可聴域20ヘルツから20000ヘルツと電話の音声300ヘルツから3400ヘルツ">
            <span className="full-band">人の可聴域 20〜20,000 Hz</span><i className="phone-band">電話 300〜3,400 Hz</i><small className="low">低い音</small><small className="high">高い音</small>
          </div>
        </div>
      </div>
    </section>
  );
}
