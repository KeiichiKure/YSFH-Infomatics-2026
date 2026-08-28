'use client';

import { useState } from 'react';
import { hardwareSteps } from './lessonData';
import { Note, PrintTerms, SectionHeading, StepControls } from './LessonParts';
import { ConnectionsLab } from './ConnectionsLab';

export function HardwareLab() {
  const [step, setStep] = useState(0);
  const current = hardwareSteps[step];
  const nodeClass = (id: string) => 'hw-device ' + (current.target === id ? 'is-active' : '');
  return <section className="learning-section" id="hardware">
    <SectionHeading number="01" label="ハードウェアと接続 · 教科書 p.68" title="中で動くもの、外とつなぐもの。" question="計算結果が画面に出るまでに、どの装置が働いているだろう？" />
    <div className="hw-panel">
      <div className="hw-panel-heading"><div><p className="step-label">INPUT → PROCESS → OUTPUT</p><h3>「3＋5」が「8」になるまで</h3></div><span className="print-badge"><small>プリント</small><b>1–3</b></span></div>
      <p><strong>ハードウェア</strong>は、本体の装置や周辺機器のこと。まずは「次へ」で役割を追ってみよう。</p>
      <div className="hw-computer" aria-label="コンピュータの装置の役割">
        <div className={nodeClass('input')}><small>INPUT</small><b>入力装置</b><span>キーボード</span><strong>3 ＋ 5</strong></div>
        <div className="hw-data-arrow" aria-hidden="true">→</div>
        <div className="hw-computer-core">
          <div className={nodeClass('memory')}><small>MEMORY</small><b>主記憶装置</b><span>作業中のデータ・プログラム</span></div>
          <span className="hw-between" aria-hidden="true">↕</span>
          <div className="hw-cpu"><div className="hw-cpu-label">CPU <small>中央処理装置</small></div><div><div className={nodeClass('control')}><b>制御装置</b><span>各装置に指示</span></div><div className={nodeClass('arithmetic')}><b>演算装置</b><span>計算・比較</span></div></div></div>
        </div>
        <div className="hw-data-arrow" aria-hidden="true">→</div>
        <div className={nodeClass('output')}><small>OUTPUT</small><b>出力装置</b><span>ディスプレイ</span><strong>{step >= 4 ? '8' : '？'}</strong></div>
        <div className={'hw-storage ' + nodeClass('storage')}><small>STORAGE</small><b>補助記憶装置</b><span>SSDなど · 主記憶装置とデータをやり取り</span><strong>{step === 5 ? '「8」を保存した' : '長く残すための保存先'}</strong></div>
      </div>
      <div className="hw-feedback" role="status"><span className="hw-status-label">{current.label}</span><h4>{current.data}</h4><p>{current.text}</p></div>
      <StepControls step={step} count={hardwareSteps.length} onChange={setStep} label="データの流れを進める" />
      <p className="hw-caption">役割を分けて示した模式図です。制御装置は実際には入力・記憶・出力などの各段階でも働きます。実線矢印はデータの移動、⇢は制御の指示を表します。</p>
      <Note title="主記憶と補助記憶、タッチパネルの役割も確認"><p>主記憶装置は作業に使う場所、補助記憶装置は長く保存する場所です。一般的な主記憶用RAMは電源を切ると内容が消えるため、残すデータは保存が必要です。</p><p>タッチパネルは、タッチを受け取る<strong>入力</strong>と画面を見せる<strong>出力</strong>の両方の役割を持ちます。</p></Note>
      <PrintTerms numbers={[1, 2, 3]} />
    </div>
    <ConnectionsLab />
  </section>;
}
