'use client';

import { useState } from 'react';

type FormatId = 'ZIP' | 'GIF' | 'PNG' | 'JPEG' | 'AAC' | 'MPEG-4（H.264）';

const formatGuide: Record<FormatId, { fullName: string; suitedFor: string }> = {
  ZIP: { fullName: 'ZIP archive format（ZIPは略語ではなく形式名）', suitedFor: '文書・プログラム・複数ファイルを、完全に戻せる形でまとめるとき' },
  GIF: { fullName: 'Graphics Interchange Format', suitedFor: '色数の少ないアイコンや図、短いアニメーションを保存するとき' },
  PNG: { fullName: 'Portable Network Graphics', suitedFor: '透明部分のある画像や、輪郭・色を劣化させず保存したいとき' },
  JPEG: { fullName: 'Joint Photographic Experts Group', suitedFor: '色数の多い写真を、多少の変化を許容して小さくしたいとき' },
  AAC: { fullName: 'Advanced Audio Coding', suitedFor: '音楽や音声を、人に聞こえにくい情報を省いて配信するとき' },
  'MPEG-4（H.264）': { fullName: 'Moving Picture Experts Group 4 / H.264 Advanced Video Coding', suitedFor: '映像のフレーム間の差分を利用して動画を配信するとき' },
};

const scenarios: { id: string; label: string; kind: string; answers: FormatId[]; best: FormatId; reason: string; notes?: Partial<Record<FormatId, string>> }[] = [
  { id: 'document', label: 'レポートをまとめて送る', kind: '文書・フォルダ', answers: ['ZIP'], best: 'ZIP', reason: '1文字も変えず、複数ファイルをまとめて元どおりに戻せるため' },
  { id: 'photo', label: '旅行の写真を小さく保存', kind: '色数の多い写真', answers: ['JPEG', 'PNG'], best: 'JPEG', reason: '小ささを優先するなら、写真の細部を人が気付きにくい範囲で省けるJPEGが最適です。', notes: { PNG: 'PNGも正解です。画質を完全に保てますが、一般に写真ではJPEGよりファイルが大きくなります。' } },
  { id: 'illustration', label: '色数の少ないアイコン', kind: '境界が明確なイラスト', answers: ['GIF', 'PNG'], best: 'PNG', reason: 'GIFとPNGはいずれも可逆圧縮です。PNGはフルカラーや透明にも対応し、GIFは256色以下の図に向きます。' },
  { id: 'audio', label: '音楽を配信する', kind: '音声', answers: ['AAC'], best: 'AAC', reason: '聞こえ方への影響が小さい情報を省いて、音声を効率よく小さくできるため' },
  { id: 'video', label: '動画を配信する', kind: '動画', answers: ['MPEG-4（H.264）'], best: 'MPEG-4（H.264）', reason: 'フレーム間の差分などを利用して、動画を効率よく圧縮できるため' },
];

const choices = Object.keys(formatGuide) as FormatId[];

export function FormatsLab() {
  const [direction, setDirection] = useState<'encode' | 'decode'>('encode');
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [choice, setChoice] = useState<FormatId | ''>('');
  const scenario = scenarios[scenarioIndex];
  const correct = choice !== '' && scenario.answers.includes(choice);

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
          <div><span>{direction === 'encode' ? '元のデータ' : '圧縮されたデータ'}</span><b>{direction === 'encode' ? 'REPORT + PHOTO' : 'ARCHIVE.ZIP'}</b><small>{direction === 'encode' ? '人が扱う内容' : 'ZIP形式の記録'}</small></div>
          <i aria-hidden="true">→</i>
          <div className="codec-machine"><span>{direction === 'encode' ? 'エンコーダ' : 'デコーダ'}</span><b>{direction === 'encode' ? 'ZIPへ圧縮' : 'ZIPから伸張'}</b></div>
          <i aria-hidden="true">→</i>
          <div><span>{direction === 'encode' ? '圧縮されたデータ' : '元に戻ったデータ'}</span><b>{direction === 'encode' ? 'ARCHIVE.ZIP' : 'REPORT + PHOTO'}</b><small>{direction === 'encode' ? '保存・転送しやすい' : '元と同じ内容を利用できる'}</small></div>
        </div>
        <p className="teacher-note"><b>{direction === 'encode' ? 'エンコード：元データ → ZIP' : 'デコード：ZIP → 元データ'}</b>。圧縮・伸張はエンコード・デコードの一例です。</p>
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
        {choice && <div key={`${scenario.id}-${choice}`} className={'format-feedback ' + (correct ? 'correct celebration' : 'wrong')} role="status">
          {correct && <div className="format-fireworks" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <i key={index} />)}</div>}
          <b>{correct ? `正解：${choice}` : `${choice}は、この目的には最適ではありません。`}</b>
          <span><strong>{formatGuide[choice].fullName}</strong></span>
          <span>{correct ? (scenario.notes?.[choice] ?? scenario.reason) : `この形式が向くのは、${formatGuide[choice].suitedFor}です。`}</span>
          {correct && choice !== scenario.best && <span>小ささを最優先する場合の第一候補は <b>{scenario.best}</b> です。</span>}
        </div>}

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
