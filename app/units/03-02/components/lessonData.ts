export const worksheetLinks = [
  { number: '1〜4', kind: '練習', section: 1, label: '4ビットの加算・減算' },
  { number: '5', kind: '空欄', section: 2, label: '減算' },
  { number: '6', kind: '空欄', section: 2, label: '加算' },
  { number: '7', kind: '空欄', section: 2, label: '符号ビット' },
  { number: '8〜10', kind: '練習', section: 2, label: '補数を求める' },
  { number: '11〜16', kind: '練習', section: 2, label: '4ビット計算' },
  { number: '17', kind: '空欄', section: 3, label: '固定' },
  { number: '18', kind: '空欄', section: 3, label: '移動' },
  { number: '19', kind: '空欄', section: 3, label: '符号部' },
  { number: '20', kind: '空欄', section: 3, label: '指数部' },
  { number: '21', kind: '空欄', section: 3, label: '仮数部' },
  { number: '22', kind: '空欄', section: 4, label: '丸め誤差' },
] as const;

export const reviewTerms = [
  { section: 1, term: '加算・減算', meaning: 'コンピュータ内部では、引く数を負の数へ変え、減算も加算として処理できる。' },
  { section: 2, term: '2の補数', meaning: '減算を加算として処理するために使う負の数の表し方。各桁を反転し、1を加えて求める。' },
  { section: 2, term: '符号ビット', meaning: '符号付き2進数の左端1ビット。0が正、1が負を表す。' },
  { section: 3, term: '固定小数点数', meaning: '小数点の位置を固定して表す。範囲と細かさが固定される。' },
  { section: 3, term: '浮動小数点数', meaning: '小数点の位置を指数で移動させ、広い範囲の実数を表す。' },
  { section: 3, term: '符号部・指数部・仮数部', meaning: '正負、小数点の移動量、有効な数字の並びを分担して表す。' },
  { section: 4, term: '丸め誤差', meaning: '有限の桁数へ丸めた近似値と、元の値との差。' },
  { section: 4, term: 'オーバーフロー', meaning: '決められたビット数で表せる最大値を超えて生じる誤差。' },
] as const;
