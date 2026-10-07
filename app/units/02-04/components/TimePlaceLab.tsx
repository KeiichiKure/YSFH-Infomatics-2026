'use client';
import { useEffect, useRef, useState } from 'react';
import { Section, Note } from './LessonParts';

export function TimePlaceLab({ basePath }: { basePath: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [connection, setConnection] = useState<{ local: string; google: string; channel: string } | null>(null);
  const [localMode] = useState(() => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('poll') === 'local');
  const [height, setHeight] = useState(450);
  useEffect(() => {
    const channel = crypto.randomUUID();
    const local = `${basePath}/02-04-poll/index.html?channel=${channel}&parentOrigin=${encodeURIComponent(location.origin)}`;
    let active = true;
    fetch(`${basePath}/02-04-poll/config.json`).then(r => r.json()).then(config => {
      let google = '';
      if (config && typeof config === 'object' && 'webAppUrl' in config && typeof config.webAppUrl === 'string' && /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(config.webAppUrl)) {
        google = `${config.webAppUrl}?channel=${channel}&parentOrigin=${encodeURIComponent(location.origin)}`;
      }
      if (active) setConnection({ local, google, channel });
    }).catch(() => { if (active) setConnection({ local, google: '', channel }); });
    return () => { active = false; };
  }, [basePath]);
  useEffect(() => {
    if (!connection) return;
    const receive = (event: MessageEvent) => {
      const local = event.origin === location.origin && event.source === frame.current?.contentWindow;
      const google = event.origin === 'https://script.google.com' || event.origin === 'https://script.googleusercontent.com' || /^https:\/\/[a-z0-9-]+(?:\.|-)script\.googleusercontent\.com$/.test(event.origin);
      if ((!local && !google) || event.data?.channel !== connection.channel) return;
      if (event.data?.type === 'cm-poll-align') { frame.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }); return; }
      if (event.data?.type !== 'cm-poll-height') return;
      if (Number.isFinite(event.data.height) && event.data.height >= 200 && event.data.height <= 30000) setHeight(Math.ceil(event.data.height));
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [connection]);
  const source = connection && (!localMode && connection.google ? connection.google : connection.local);
  return <Section number={1} question="こんな場面では、あなたはどうしますか？ 自分の方法と理由を投票して、これまでの全クラスの意見を比べよう。">
    <div id="time-place-lab" className="cm-poll-embed">
      {source ? <iframe key={source} ref={frame} src={source} title="伝え方の投票・理由共有" style={{ width: '100%', height, border: 0, display: 'block' }} /> : <p role="status">投票画面を準備しています…</p>}
    </div>
    <p className="cm-summary"><b>課題1〜4は自由に選べます。</b>投票したら「もう一度投票する」で考え直そう。人数の多さで正解は決まりません。選んだ方法の良さと課題を、ペアで話そう。</p>
    <Note title="参加・共有について"><p>全体投票はコード不要です。テーマを選んで方法と任意の理由を送信すると、これまでの全クラスの票と匿名の理由を表示します。自分のクラスの結果を比べるときは、先生の指定した4桁コードを入力します。Google版はGoogleスプレッドシートに保存し、終了した授業の票も全体に蓄積します。名前や実際の個人の事情は書かないでください。同じブラウザからの修正は票を増やしません。別の端末・ブラウザでは別の参加者として扱われます。</p><p>直接・非同期も選べますが、対面での会話自体は同期です。組合せの提案は理由に書き、投票後の整理で確かめよう。</p>{connection?.google && <p><a href={connection.google} target="_blank" rel="noreferrer">投票画面を別のタブで開く</a></p>}<p>どちらの参加方法でも、課題1〜4と考え直しは自分で選べます。集計は表示中に数秒ごとに自動更新します。先生による課題の切替・投票の締切操作は不要です。</p></Note>
  </Section>;
}
