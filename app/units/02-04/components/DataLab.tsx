'use client';
import { useEffect, useMemo, useState } from 'react';
import { Frame, Note, Feedback } from './LessonParts';
import { analyzeBikeRows, bikeChartMax, bikeTemperatureCelsius, defaultBikeFilters, type BikeDataset, type BikeFilters, type BikeMode } from './bikeDataModels';

const fmt = (n: number) => n.toLocaleString('ja-JP');
const modes: { id: BikeMode; label: string }[] = [{ id: 'temperature', label: '気温で比べる' }, { id: 'weather', label: '天気で比べる' }, { id: 'hour', label: '時間帯で比べる' }];
function HourChart({ values }: { values: (number | null)[] }) {
  const max = bikeChartMax.hour;
  return <svg className="cm-hour-chart" viewBox="0 0 600 240" role="img" aria-label="0時から23時までの1時間当たり平均利用回数。棒を指すと値を確認できます。">
    <text x="10" y="20">平均利用回数（回／時）</text>
    {[0, 200, 400, 600, max].map(tick => <g key={tick}><line x1="45" y1={210 - tick / max * 170} x2="590" y2={210 - tick / max * 170} stroke="#ccd8d0" /><text x="39" y={215 - tick / max * 170} textAnchor="end">{tick}</text></g>)}
    {values.map((v, i) => <g key={i}><rect x={49 + i * 22} y={210 - (v ?? 0) / max * 170} width="17" height={(v ?? 0) / max * 170} rx="3"><title>{i}時：{v === null ? '記録なし' : v.toFixed(1) + '回／時'}</title></rect>{i % 4 === 0 && <text x={57 + i * 22} y="233" textAnchor="middle">{i}時</text>}</g>)}
  </svg>;
}
export function DataLab({ basePath }: { basePath: string }) {
  const [data, setData] = useState<BikeDataset | null>(null), [loading, setLoading] = useState(true), [error, setError] = useState('');
  const [filters, setFilters] = useState<BikeFilters>({ ...defaultBikeFilters }), [mode, setMode] = useState<BikeMode>('temperature');
  const result = useMemo(() => data ? analyzeBikeRows(data.records, filters, mode) : null, [data, filters, mode]);
  const max = bikeChartMax[mode];
  function select(key: keyof BikeFilters, value: string) { setFilters(f => ({ ...f, [key]: value })); }
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(basePath + '/data/02-04/bike-hour.json', { signal: controller.signal });
        if (!response.ok) throw new Error('読み込みに失敗しました。');
        const next = await response.json() as BikeDataset;
        if (next.rowCount !== 17379 || next.records.length !== 17379 || next.rentalTotal !== 3292679) throw new Error('データの確認に失敗しました。');
        if (!controller.signal.aborted) setData(next);
      } catch { if (!controller.signal.aborted) setError('データを読み込めませんでした。ページを再読み込みしてください。'); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [basePath]);
  return <>
    <Frame id="data-lab" title="実データで、自転車の利用を調べる" controls={<>
      <span className="cm-counter">{data ? fmt(data.rowCount) + '時間分を読み込み済み・条件を選ぶと自動で集計' : loading ? '公開実データを読み込み中…' : '公開実データ・2011〜2012年'}</span>
    </>}>
      <p className="cm-task">米国ワシントンD.C.の貸自転車。<b>どんな条件で利用が増える？</b>予想し、平均を比べて配置計画を考えよう。</p>
      <div className="cm-split cm-data-layout">
        <div className="cm-data-settings">
          <fieldset><legend>比べる観点</legend><div className="cm-options cm-stacked">{modes.map(m => <button key={m.id} aria-pressed={mode === m.id} onClick={() => setMode(m.id)}>{m.label}</button>)}</div></fieldset>
          <fieldset><legend>年</legend><div className="cm-options">{[['all', '両年'], ['2011', '2011'], ['2012', '2012']].map(([v, label]) => <button key={v} aria-pressed={filters.year === v} onClick={() => select('year', v)}>{label}</button>)}</div></fieldset>
          <fieldset><legend>勤務日・休日</legend><div className="cm-options">{[['all', 'すべて'], ['1', '勤務日'], ['0', '休日']].map(([v, label]) => <button key={v} aria-pressed={filters.work === v} onClick={() => select('work', v)}>{label}</button>)}</div></fieldset>
          <fieldset><legend>天気</legend><div className="cm-options cm-weather-filters">{[['all', 'すべて'], ['1', '晴れ・薄曇り'], ['2', '霧・曇り'], ['3', '雨・雪']].map(([v, label]) => <button key={v} aria-pressed={filters.weather === v} onClick={() => select('weather', v)}>{label}</button>)}</div></fieldset>
        </div>
        <div className="cm-data-output" aria-busy={loading}>
          <div className="cm-data-stats"><div><small>集計した記録</small><b>{result ? fmt(result.hours) + '時間' : '—'}</b></div><div><small>利用回数の合計</small><b>{result ? fmt(result.rentals) + '回' : '—'}</b></div><div><small>1時間の平均</small><b>{result?.mean != null ? result.mean.toFixed(1) + '回' : '—'}</b></div></div>
          <div className="cm-data-chart" data-scale-min="0" data-scale-max={max}>{result ? <div className="cm-fixed-chart"><p className="cm-chart-scale-note">目盛りは0〜{max}回／時で固定</p>{mode === 'hour' ? <HourChart values={result.groups.map(g => g.mean)} /> : <><div className="cm-bar-scale" aria-label="平均利用回数の目盛り"><span /><div><span>0</span><span>{max / 2}</span><span>{max}</span></div><span>回／時</span></div><div className="cm-real-bars">{result.groups.map(g => <div key={g.label}><b>{g.label}</b><div><span style={{ width: ((g.mean ?? 0) / max * 100) + '%' }} /></div><strong>{g.mean == null ? '記録なし' : g.mean.toFixed(1) + '回／時'}</strong><small>n＝{fmt(g.hours)}時間</small></div>)}</div></>}</div> : <div className="cm-data-wait"><span aria-hidden="true">▥</span><b>{loading ? '実データを読み込んでいます' : '約329万回の利用をまとめた記録'}</b><p>17,379時間分。元の利用ログを研究者が時間別に集計し、気象情報を組み合わせたデータです。</p></div>}</div>
          <Feedback state={error ? 'bad' : result ? 'good' : 'waiting'}>{error ? <p>{error}</p> : result ? <><b>✓ 条件に合う記録を集計しました</b><p>平均＝利用回数の合計÷記録の時間数。条件を変えて、傾向が同じか比べよう。記録数nが少ない群には注意。</p></> : <><b>データは自動で読み込みます</b><p>条件を選ぶと、読み込み後に平均と記録数を表示します。</p></>}</Feedback>
        </div>
      </div>
    </Frame>
    {result && mode === 'hour' && <Note title="時間帯ごとの平均を数値で確認する"><div className="cm-table-wrap"><table><caption>現在の条件で集計した値。平均と記録数を一緒に比べよう。</caption><thead><tr><th>時間帯</th><th>平均利用回数（回／時）</th><th>記録数n（時間）</th></tr></thead><tbody>{result.groups.map(g => <tr key={g.label}><td>{g.label}</td><td>{g.mean == null ? '記録なし' : g.mean.toFixed(1)}</td><td>{fmt(g.hours)}</td></tr>)}</tbody></table></div></Note>}
    <p className="cm-summary"><b>データが多いだけで、理由まで分かるわけではない。</b>気温と季節、勤務日と時間帯など、複数の条件が関係します。「暖かさが原因」と決め付けず、同じ条件でも比べよう。</p>
    <Note title="出典・元データ・集計方法を確認する"><p>Fanaee-T, H. (2013), <a href="https://archive.ics.uci.edu/dataset/275/bike+sharing+dataset" target="_blank" rel="noreferrer">Bike Sharing（UCI Machine Learning Repository）</a>。<a href="https://doi.org/10.24432/C5W894" target="_blank" rel="noreferrer">DOI: 10.24432/C5W894</a>、<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>。Capital Bikeshareの2011〜2012年の利用ログを研究者が時間別に集計し、Freemeteoの気象情報等を追加した公開データです。</p><p>教材はhour.csvの全17,379行を使用しています。1行は個人の利用ではなく観測された1時間の集計、利用回数の合計は3,292,679回。大規模な実利用記録を集計した教材用データを分析する体験です。完全な生ログや現時点の需要を扱うものではありません。</p><p>「気温」は現在のUCI公式ページにある時間別データの定義に従い、℃＝元データのtemp×47−8で換算し、10℃・20℃・30℃を境に4群へ分けています。旧版READMEには異なる換算の記載があるため、現在の公式説明に合わせた換算値として表示しています。グラフは観点ごとに目盛りを固定し、年・勤務日・天気を変えても尺度を変えません。</p><p>天気コード1を晴れ・薄曇り、2を霧・曇り、3・4を雨・雪として表示。「勤務日」は週末・現地の祝日を除く日です。欠けている時間を0回として補うことはしていません。</p><p><a href={basePath + '/data/02-04/hour.csv'} download>元のhour.csvを保存</a> ／ <a href={basePath + '/data/02-04/source-readme.txt'} target="_blank" rel="noreferrer">同梱のREADME</a> ／ <a href={basePath + '/data/02-04/provenance.json'} target="_blank" rel="noreferrer">列の対応・変換記録</a></p>{data && <div className="cm-table-wrap"><table><caption>元データの先頭5行から：気温はUCIの現在の定義で℃へ換算</caption><thead><tr><th>日付</th><th>時</th><th>天気</th><th>気温（℃）</th><th>利用回数</th></tr></thead><tbody>{data.records.slice(0, 5).map(r => <tr key={r[0] + r[1]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[3]}</td><td>{bikeTemperatureCelsius(r[4]).toFixed(1)}</td><td>{r[5]}</td></tr>)}</tbody></table></div>}</Note>
    <Note title="ペアで分析を深めるなら"><p>①雨・雪の日は利用が少ないという予想を調べる。②勤務日と休日の時間帯を比べ、どの時間に自転車を増やすか提案する。③2011年と2012年で同じ傾向か確かめる。④平均だけでなくnも見て、言い切れないことを一つ書く。</p><p>この記録は米国の一つのサービス・過去の2年間です。日本のコンビニ販売や、現在の学校の利用者へ、そのまま当てはめることはできません。</p></Note>
  </>;
}
