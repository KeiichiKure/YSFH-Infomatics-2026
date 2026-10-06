// One record is an observed hour aggregated by the dataset's authors, not one person's trip.
export type BikeRow = [date: string, hour: number, workingDay: number, weather: number, temperatureIndex: number, rentals: number, casual: number, registered: number];
export type BikeDataset = { records: BikeRow[]; rowCount: number; rentalTotal: number };
export type BikeFilters = { year: 'all' | '2011' | '2012'; work: 'all' | '1' | '0'; weather: 'all' | '1' | '2' | '3' };
export type BikeMode = 'temperature' | 'weather' | 'hour';
export const defaultBikeFilters: BikeFilters = { year: 'all', work: 'all', weather: 'all' };
export function selectBikeRows(rows: BikeRow[], filters: BikeFilters) {
  return rows.filter(r => (filters.year === 'all' || r[0].startsWith(filters.year)) &&
    (filters.work === 'all' || r[2] === Number(filters.work)) &&
    (filters.weather === 'all' || (filters.weather === '3' ? r[3] >= 3 : r[3] === Number(filters.weather))));
}
export function analyzeBikeRows(rows: BikeRow[], filters: BikeFilters, mode: BikeMode) {
  const selected = selectBikeRows(rows, filters);
  const labels = mode === 'hour' ? Array.from({ length: 24 }, (_, i) => i + '時') : mode === 'weather' ? ['晴れ・薄曇り', '霧・曇り', '雨・雪'] : ['低い（0〜0.3未満）', '中（0.3〜0.5未満）', '高い（0.5〜0.7未満）', 'とても高い（0.7〜1）'];
  const groups = labels.map(label => ({ label, hours: 0, rentals: 0, mean: null as number | null }));
  for (const r of selected) {
    const i = mode === 'hour' ? r[1] : mode === 'weather' ? Math.min(2, r[3] - 1) : r[4] < .3 ? 0 : r[4] < .5 ? 1 : r[4] < .7 ? 2 : 3;
    groups[i].hours++; groups[i].rentals += r[5];
  }
  for (const g of groups) g.mean = g.hours ? g.rentals / g.hours : null;
  const total = selected.reduce((n, r) => n + r[5], 0);
  return { groups, hours: selected.length, rentals: total, mean: selected.length ? total / selected.length : null };
}
