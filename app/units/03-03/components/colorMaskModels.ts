export type ColorOperation = 'AND' | 'OR' | 'XOR';
export type RGB4 = readonly [number, number, number];

export function maskColor(source: RGB4, mask: RGB4, operation: ColorOperation): RGB4 {
  return source.map((channel, i) => (operation === 'AND' ? channel & mask[i] : operation === 'OR' ? channel | mask[i] : channel ^ mask[i]) & 15) as unknown as RGB4;
}
export function colorCSS(color: RGB4) { return `rgb(${color.map(channel => channel * 17).join(',')})`; }
export function colorBits(channel: number) { return channel.toString(2).padStart(4, '0'); }
export function quantizeRGB(red: number, green: number, blue: number): RGB4 {
  return [Math.round(red / 17), Math.round(green / 17), Math.round(blue / 17)];
}
export function colorMissionMet(mission: number, source: RGB4, result: RGB4) {
  if (mission === 0) return result.every(channel => channel === 0);
  if (mission === 1) return result.every(channel => channel === 15);
  if (mission === 2) return result[0] === 15 && result[1] === source[1] && result[2] === source[2];
  return result.every((channel, i) => channel === 15 - source[i]);
}
