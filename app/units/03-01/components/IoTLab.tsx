'use client';

import { useState } from 'react';
import { SectionHeading } from './LessonParts';

type Snapshot = { brightness: number; roomTemp: number; light: boolean; ac: boolean; inventory: string[] };
const initialInventory = ['牛乳', '卵', '野菜'];

export function IoTLab() {
  const [brightness, setBrightness] = useState(62);
  const [roomTemp, setRoomTemp] = useState(26);
  const [online, setOnline] = useState(true);
  const [manualLight, setManualLight] = useState(false);
  const [manualAc, setManualAc] = useState(false);
  const [autoLight, setAutoLight] = useState(false);
  const [autoAc, setAutoAc] = useState(false);
  const [stockAlert, setStockAlert] = useState(false);
  const [fridgeOpen, setFridgeOpen] = useState(false);
  const [inventory, setInventory] = useState<string[]>(initialInventory);
  const [message, setMessage] = useState('家のスイッチとスマホの両方から操作できます。自動化すると、センサの値を見て家が判断します。');
  const lightActive = autoLight ? brightness < 35 : manualLight;
  const acActive = autoAc ? roomTemp >= 28 : manualAc;
  const [reported, setReported] = useState<Snapshot>({ brightness: 62, roomTemp: 26, light: false, ac: false, inventory: initialInventory });

  const control = (device: 'light' | 'ac', on: boolean, source: '家のスイッチ' | 'スマホ') => {
    if (source === 'スマホ' && !online) { setMessage('× スマホはオフラインです。家へ操作を届けられません。'); return; }
    if (device === 'light') setManualLight(on); else setManualAc(on);
    const automated = device === 'light' ? autoLight : autoAc;
    const name = device === 'light' ? '照明' : 'エアコン';
    if (online) setReported({ brightness, roomTemp, light: device === 'light' ? (autoLight ? brightness < 35 : on) : lightActive, ac: device === 'ac' ? (autoAc ? roomTemp >= 28 : on) : acActive, inventory });
    setMessage(automated ? `${source}で${name}を操作しましたが、現在は自動化プログラムがセンサの値からON/OFFを決めます。` : `${source}から「${name}を${on ? 'ON' : 'OFF'}」という指示が届きました。`);
  };
  const changeBrightness = (value: number) => {
    setBrightness(value);
    if (online) setReported({ brightness: value, roomTemp, light: autoLight ? value < 35 : manualLight, ac: acActive, inventory });
    setMessage(autoLight ? `明るさが${value}になったので、照明を${value < 35 ? 'ON' : 'OFF'}にしました。` : `明るさを${value}に変えました。自動化はOFFなので照明はそのままです。`);
  };
  const changeTemp = (value: number) => {
    setRoomTemp(value);
    if (online) setReported({ brightness, roomTemp: value, light: lightActive, ac: autoAc ? value >= 28 : manualAc, inventory });
    setMessage(autoAc ? `室温が${value}℃になったので、エアコンを${value >= 28 ? 'ON' : 'OFF'}にしました。` : `室温を${value}℃に変えました。自動化はOFFなのでエアコンはそのままです。`);
  };
  const toggleItem = (item: string) => {
    const exists = inventory.includes(item);
    const next = exists ? inventory.filter(value => value !== item) : [...inventory, item];
    setInventory(next);
    if (online) setReported({ brightness, roomTemp, light: lightActive, ac: acActive, inventory: next });
    setMessage(exists ? `冷蔵庫カメラが「${item}がなくなった」ことを確認しました。${stockAlert ? 'スマホの買い物リストへ通知します。' : ''}` : `${item}を冷蔵庫へ補充しました。カメラの表示も更新されます。`);
  };
  const reset = () => {
    setBrightness(62); setRoomTemp(26); setOnline(true); setManualLight(false); setManualAc(false);
    setAutoLight(false); setAutoAc(false); setStockAlert(false); setFridgeOpen(false); setInventory(initialInventory);
    setReported({ brightness: 62, roomTemp: 26, light: false, ac: false, inventory: initialInventory });
    setMessage('家のスイッチとスマホの両方から操作できます。自動化すると、センサの値を見て家が判断します。');
  };

  return <section className="learning-section" id="iot">
    <SectionHeading number="04" label="IoT · 教科書 p.71" title="家のモノを、スマホとプログラムで動かそう。" question="家のスイッチ、遠くのスマホ、自動化プログラムでは、操作の届き方がどう変わる？" />
    <div className="hw-panel iot-home-panel">
      <div className="hw-panel-heading"><div><p className="step-label">SMART HOME LAB</p><h3>IoTスマートホーム実験</h3></div><span className="hw-model-badge">実機を使わない模擬実験</span></div>
      <p><strong>IoT</strong>は、家電やセンサなどの「モノ」をネットワークにつなぎ、情報を見たり操作したりする仕組みです。家のスイッチとスマホ、自動化を比べよう。</p>

      <div className="iot-environment-controls">
        <div><p className="step-label">環境を変えてみよう（実験用）</p><h4>家の外から条件を動かす「神の視点」</h4></div>
        <label><span>外が暗く／明るくなる <output>明るさ {brightness}</output></span><input type="range" min="0" max="100" value={brightness} onInput={event => changeBrightness(Number(event.currentTarget.value))} /></label>
        <label><span>部屋が寒く／暑くなる <output>室温 {roomTemp}℃</output></span><input type="range" min="18" max="36" value={roomTemp} onInput={event => changeTemp(Number(event.currentTarget.value))} /></label>
        <div className="fridge-experiment"><b>家族が冷蔵庫の中身を使う／補充する</b>{initialInventory.map(item => <button type="button" key={item} className={inventory.includes(item) ? 'is-stocked' : 'is-empty'} onClick={() => toggleItem(item)}>{inventory.includes(item) ? `${item}を使う` : `${item}を補充`}</button>)}</div>
      </div>

      <div className="iot-lab-layout">
        <div className="iot-house">
          <div className="iot-house-title"><b>🏠 家の中</b><span>{online ? 'ネット接続中' : '家のスイッチだけ使用可能'}</span></div>
          <div className="smart-house-scene" style={{ background: `linear-gradient(#${brightness < 35 ? '14243d' : brightness < 70 ? '6aa9d2' : 'a9dfff'} 0 66%, #8fbd69 66%)` }}>
            <span className={`house-sun ${brightness < 35 ? 'is-moon' : ''}`} aria-hidden="true">{brightness < 35 ? '☾' : '☀'}</span>
            <div className={`house-building ${lightActive ? 'light-on' : ''}`}><span className="house-roof" /><div className="house-room"><span className="house-lamp" role="img" aria-label={lightActive ? '照明が明るく点灯中' : '照明は消灯中'}><i /></span><div className={`house-ac ${acActive ? 'is-on' : ''}`}><b>AC</b>{acActive && <span className="ac-wind" aria-label="エアコンから太い風が出ている">≋ ≋ ≋</span>}</div><button type="button" className={`house-fridge ${fridgeOpen ? 'is-open' : ''}`} aria-expanded={fridgeOpen} onClick={() => { const next = !fridgeOpen; setFridgeOpen(next); setMessage(next ? '冷蔵庫を開きました。家にいる人は中身を直接確認できます。' : '冷蔵庫を閉じました。'); }}><span className="fridge-door">冷蔵庫<small>押して開く</small></span><span className="fridge-inside">{inventory.length ? inventory.map(item => <i key={item}>{item === '牛乳' ? '🥛' : item === '卵' ? '🥚' : '🥬'}</i>) : <b>空</b>}</span></button><span className="house-sofa" aria-hidden="true">▰</span></div></div>
            <strong className="outside-level">外の明るさ {brightness}</strong>
          </div>
          <div className="house-switch-strip"><div className={lightActive ? 'is-on' : ''}><b>💡 照明 {lightActive ? 'ON' : 'OFF'}</b><span><button type="button" onClick={() => control('light', true, '家のスイッチ')}>ON</button><button type="button" onClick={() => control('light', false, '家のスイッチ')}>OFF</button></span></div><div className={acActive ? 'is-on' : ''}><b>❄️ エアコン {acActive ? 'ON' : 'OFF'}</b><span><button type="button" onClick={() => control('ac', true, '家のスイッチ')}>ON</button><button type="button" onClick={() => control('ac', false, '家のスイッチ')}>OFF</button></span></div></div>
        </div>

        <div className={`iot-network-link ${online ? '' : 'is-offline'}`}><span aria-hidden="true">{online ? '⌁⌁⌁' : '×'}</span><b>インターネット</b><small>状態 →<br />← 操作・設定</small><label><input type="checkbox" checked={online} onChange={event => { const next = event.target.checked; setOnline(next); if (next) setReported({ brightness, roomTemp, light: lightActive, ac: acActive, inventory }); setMessage(next ? '通信が戻り、家の最新状態をスマホへ同期しました。' : '通信を切りました。スマホ表示は止まりますが、家のスイッチと家に保存した自動化は動きます。'); }} />通信する</label></div>

        <div className="iot-phone" aria-label="遠隔操作アプリを表示したスマートフォン">
          <div className="iot-phone-speaker" /><div className="iot-phone-screen">
            <header><b>わが家アプリ</b><span>{online ? '● 接続中' : '○ オフライン'}</span></header>
            <div className={`phone-house-preview ${reported.light ? 'light-on' : ''}`}><span className="phone-house-roof" /><div><b>わが家のようす</b><i>{reported.light ? '💡 明るい' : '🌙 消灯'}</i><i>{reported.ac ? '〰 AC運転中' : 'AC停止'}</i><i>冷蔵庫 {reported.inventory.length}品</i></div></div>
            {stockAlert && !reported.inventory.includes('牛乳') && <div className="iot-phone-alert is-visible">🛒 牛乳がありません。買い物リストへ追加</div>}
            <div className="iot-phone-readings"><span>明るさ<b>{reported.brightness}</b></span><span>室温<b>{reported.roomTemp}℃</b></span></div>
            {!online && <p className="iot-stale">切断前の状態・更新停止</p>}
            <div className="iot-phone-status"><div><span>💡 照明</span><b className={reported.light ? 'is-on' : ''}>{reported.light ? 'ON' : 'OFF'}</b></div><div><span>❄️ エアコン</span><b className={reported.ac ? 'is-on' : ''}>{reported.ac ? 'ON' : 'OFF'}</b></div></div>
            <div className="iot-phone-controls"><div><b>💡 照明を操作</b><button type="button" onClick={() => control('light', true, 'スマホ')}>ON</button><button type="button" onClick={() => control('light', false, 'スマホ')}>OFF</button></div><div><b>❄️ エアコンを操作</b><button type="button" onClick={() => control('ac', true, 'スマホ')}>ON</button><button type="button" onClick={() => control('ac', false, 'スマホ')}>OFF</button></div></div>
            <div className="fridge-camera-app"><b>📷 冷蔵庫カメラ</b><div>{reported.inventory.length ? reported.inventory.map(item => <span key={item}>{item === '牛乳' ? '🥛' : item === '卵' ? '🥚' : '🥬'}<small>{item}</small></span>) : <p>中身がありません</p>}</div><small>外出先でも買い忘れ・二重買いを防げる</small></div>
          </div><div className="iot-phone-home" />
        </div>
      </div>

      <div className="iot-automation">
        <div><p className="step-label">AUTOMATION PROGRAM</p><h4>「もし〜なら」を家へ設定する</h4><p>スイッチをONにしたら、上の明るさ・室温・冷蔵庫の中身を変えて、家とスマホを見比べよう。</p></div>
        <label className={autoLight ? 'is-on' : ''}><input type="checkbox" checked={autoLight} onChange={event => { const next = event.target.checked; setAutoLight(next); if (online) setReported({ brightness, roomTemp, light: next ? brightness < 35 : manualLight, ac: acActive, inventory }); setMessage(next ? `照明の自動化を開始。明るさが${brightness}なので照明を${brightness < 35 ? 'ON' : 'OFF'}にしました。` : '照明の自動化を停止しました。'); }} /><span>明るさが <b>35未満ならON</b><br />35以上ならOFF</span><strong>照明を自動化</strong></label>
        <label className={autoAc ? 'is-on' : ''}><input type="checkbox" checked={autoAc} onChange={event => { const next = event.target.checked; setAutoAc(next); if (online) setReported({ brightness, roomTemp, light: lightActive, ac: next ? roomTemp >= 28 : manualAc, inventory }); setMessage(next ? `エアコンの自動化を開始。室温が${roomTemp}℃なのでエアコンを${roomTemp >= 28 ? 'ON' : 'OFF'}にしました。` : 'エアコンの自動化を停止しました。'); }} /><span>室温が <b>28℃以上ならON</b><br />28℃未満ならOFF</span><strong>エアコンを自動化</strong></label>
        <label className={stockAlert ? 'is-on' : ''}><input type="checkbox" checked={stockAlert} onChange={event => { setStockAlert(event.target.checked); setMessage(event.target.checked ? '冷蔵庫カメラと買い物リストを連携しました。牛乳がなくなるとスマホへ知らせます。' : '冷蔵庫の買い物通知を停止しました。'); }} /><span>カメラで <b>牛乳がない</b> と確認したら</span><strong>買い物リストへ通知</strong></label>
      </div>
      <div className={`iot-app-message ${!online ? 'is-offline' : ''}`} role="status"><span aria-hidden="true">💬</span><div><b>わが家アプリからのお知らせ</b><p>{message}</p></div></div>
      <div className="hw-controls"><button type="button" onClick={reset}>最初の状態に戻す</button></div>
      <aside className="hw-writeback"><b>プリント「IoT」へ</b><p>「何を測り、どこへ伝え、何を自動化する？」家や学校の例を1つ考え、モノ・ネットワーク・アプリ・条件を対応させて説明しよう。</p></aside>
    </div>
  </section>;
}
