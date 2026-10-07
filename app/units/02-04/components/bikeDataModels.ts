// One record is an observed hour aggregated by the dataset's authors, not one person's trip.
export type BikeRow = [date: string, hour: number, workingDay: number, weather: number, temperatureIndex: number, rentals: number, casual: number, registered: number];
export type BikeDataset = { records: BikeRow[]; rowCount: number; rentalTotal: number };
export type BikeFilters = { year: 'all' | '2011' | '2012'; work: 'all' | '1' | '0'; weather: 'all' | '1' | '2' | '3' };
export type BikeMode = 'temperature' | 'weather' | 'hour';
export const defaultBikeFilters: BikeFilters = { year: 'all', work: 'all', weather: 'all' };
// Fixed for every filter combination; averages cannot rescale themselves between comparisons.
export const bikeChartMax: Record<BikeMode, number> = { temperature: 500, weather: 300, hour: 800 };
// Current UCI hourly-data definition: temp = (Celsius - (-8)) / (39 - (-8)).
export function bikeTemperatureCelsius(index: number) { return index * 47 - 8; }
export function selectBikeRows(rows: BikeRow[], filters: BikeFilters) {
  return rows.filter(r => (filters.year === 'all' || r[0].startsWith(filters.year)) &&
    (filters.work === 'all' || r[2] === Number(filters.work)) &&
    (filters.weather === 'all' || (filters.weather === '3' ? r[3] >= 3 : r[3] === Number(filters.weather))));
}
export function analyzeBikeRows(rows: BikeRow[], filters: BikeFilters, mode: BikeMode) {
  const selected = selectBikeRows(rows, filters);
  const labels = mode === 'hour' ? Array.from({ length: 24 }, (_, i) => i + '時') : mode === 'weather' ? ['晴れ・薄曇り', '霧・曇り', '雨・雪'] : ['10℃未満', '10℃以上20℃未満', '20℃以上30℃未満', '30℃以上'];
  const groups = labels.map(label => ({ label, hours: 0, rentals: 0, mean: null as number | null }));
  for (const r of selected) {
    const celsius = bikeTemperatureCelsius(r[4]);
    const i = mode === 'hour' ? r[1] : mode === 'weather' ? Math.min(2, r[3] - 1) : celsius < 10 ? 0 : celsius < 20 ? 1 : celsius < 30 ? 2 : 3;
    groups[i].hours++; groups[i].rentals += r[5];
  }
  for (const g of groups) g.mean = g.hours ? g.rentals / g.hours : null;
  const total = selected.reduce((n, r) => n + r[5], 0);
  return { groups, hours: selected.length, rentals: total, mean: selected.length ? total / selected.length : null };
}
