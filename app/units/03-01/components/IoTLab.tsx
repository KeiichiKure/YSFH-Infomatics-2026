'use client';

import { useReducer } from 'react';
import { initialIoTState, iotReducer } from './systemModels';
import { Note, SectionHeading } from './LessonParts';

export function IoTLab() {
  const [state, dispatch] = useReducer(iotReducer, initialIoTState);
  return <section className="learning-section" id="iot">
    <SectionHeading number="04" label="IoT · 教科書 p.71" title="離れていても、見える・動かせる。" question="教室にいなくても、明るさを知って照明を操作するには、何が必要？" />
    <div className="hw-panel">
      <div className="hw-panel-heading"><div><p className="step-label">INTERNET OF THINGS</p><h3>教室の照明を、離れた場所から</h3></div><span className="hw-model-badge">実機を使わない模擬実験</span></div>
      <p><strong>IoT</strong>はモノがネットワークにつながる仕組み。<strong>センサを備えたモノ・ネットワーク・アプリケーション</strong>の3つの関係に注目しよう。</p>
      <div className="hw-iot-layout">
        <div className="hw-iot-local"><span className="hw-status-label">① 現地 · 教室</span><div className={'hw-classroom ' + (state.lightOn ? 'light-on' : '')}><div className="hw-classroom-window" style={{ opacity: .2 + state.brightness / 125 }} /><div className="hw-lamp" aria-hidden="true" /><div className="hw-desk" aria-hidden="true" /><strong>照明：{state.lightOn ? '点灯' : '消灯'}</strong></div><label className="hw-range" htmlFor="hw-brightness"><span>窓から入る明るさ（相対値）<output>{state.brightness}</output></span><input id="hw-brightness" type="range" min="0" max="100" value={state.brightness} onChange={event => dispatch({ type: 'brightness', value: Number(event.target.value) })} /></label><div className="hw-sensor-value">センサの現在値 <b>{state.brightness}</b><small>現地では計測を続ける</small></div></div>
        <div className={'hw-network ' + (!state.online ? 'is-offline' : '')}><b>② ネットワーク</b><span aria-hidden="true">{state.online ? '⇄' : '×'}</span><label><input type="checkbox" checked={state.online} onChange={event => dispatch({ type: 'connection', online: event.target.checked })} />通信をつなぐ</label><strong>{state.online ? '接続中' : '切断中'}</strong><small>値を送る →<br />← 指示を送る</small></div>
        <div className="hw-iot-remote"><span className="hw-status-label">③ 遠隔 · アプリ</span><h4>教室のようす</h4><p>受け取った明るさ</p><output className="hw-remote-value">{state.reportedBrightness}</output><span className={'hw-freshness ' + (!state.online ? 'is-stale' : '')}>{state.online ? '現在の値' : '切断前に受信した値・更新停止'}</span><div className="hw-remote-controls"><button type="button" className="hw-button" onClick={() => dispatch({ type: 'light', on: true })}>照明をつける</button><button type="button" className="hw-button" onClick={() => dispatch({ type: 'light', on: false })}>照明を消す</button></div><p className="hw-caption">通信を切った状態でも、操作を試して結果を確かめられます。</p></div>
      </div>
      <div className={'hw-feedback ' + (!state.online ? 'hw-warning' : '')} role="status"><h4>{state.online ? 'モノとアプリがつながっている' : '現地と遠隔の表示を比べよう'}</h4><p>{state.message}</p></div>
      <div className="hw-controls"><button type="button" onClick={() => dispatch({ type: 'reset' })}>最初の状態に戻す</button></div>
      <p className="hw-caption">明るさは単位のない練習用の値です。ここでは外からの明るさだけを変え、照明による測定値の変化や通信遅延は省略しています。実際の機器には接続しません。</p>
      <Note title="試す順番と、考えてみたいこと"><ol><li>明るさを変え、現地とアプリの数値を比べる。</li><li>通信を切ってから明るさを変える。どちらの値が止まった？</li><li>通信を切ったまま照明を操作する。なぜ届かない？</li><li>通信を戻す。値が更新されたら、照明の操作をやり直す。</li></ol><p>通信できないとき、現地で何を続けるかは設計によって変わります。このモデルではセンサの計測と照明の状態を維持し、失敗した遠隔操作は自動再送しません。</p></Note>
      <aside className="hw-writeback"><b>プリント「IoT」へ</b><p>「何を測り、どこへ伝え、何に役立てる？」<br />教室以外の例を1つ考え、モノ・ネットワーク・アプリを対応させて説明しよう。</p></aside>
    </div>
  </section>;
}
