export function median(values: number[]): number {
  if (!values.length || values.some(v => !Number.isFinite(v))) throw new Error('有限の数値を1つ以上指定してください');
  const sorted = [...values].sort((a, b) => a - b), half = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[half] : (sorted[half - 1] + sorted[half]) / 2;
}
export function fiveNumbers(values: number[]): number[] {
  if (values.length < 2) throw new Error('2つ以上の値が必要です');
  const s = [...values].sort((a, b) => a - b), h = Math.floor(s.length / 2);
  // 奇数個では中央の値を除き、前半・後半の中央値を四分位数とする。
  return [s[0], median(s.slice(0, h)), median(s), median(s.slice(Math.ceil(s.length / 2))), s[s.length - 1]];
}
export function shares(values: number[]): number[] {
  if (values.some(v => !Number.isFinite(v) || v < 0)) throw new Error('票数は0以上');
  const total = values.reduce((a, b) => a + b, 0);
  return values.map(v => total ? v / total * 100 : 0);
}
export function rankProjects<T extends { reading: string; floor: number; time: string; category: string; wait: number }>(items: readonly T[], mode: number): T[] {
  return [...items].sort((a, b) => mode === 0 ? a.floor - b.floor : mode === 1 ? a.reading.localeCompare(b.reading, 'ja') : mode === 2 ? a.time.localeCompare(b.time) : mode === 3 ? a.category.localeCompare(b.category, 'ja') : a.wait - b.wait);
}
