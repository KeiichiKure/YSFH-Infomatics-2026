export type ScenarioId = 'water-bottle' | 'gym-clothes' | 'teacher-usb';

export type Scenario = {
  id: ScenarioId;
  label: string;
  who: string;
  when: string;
  where: string;
  item: string;
  cause: string;
  observable: string;
  target: string;
  posterCanChange: string;
  posterCannotChange: string;
};

export const scenarios: Scenario[] = [
  {
    id: 'water-bottle',
    label: '放課後の水筒',
    who: '部活動へ急ぐ生徒',
    when: '放課後、友人と教室を出る直前',
    where: '机の横・床',
    item: '水筒',
    cause: '会話と移動に注意が向き、低い位置を見ない',
    observable: '放課後、部活動へ急ぐ生徒が、机の横の水筒を見落として退出している。',
    target: '退出前に、机・ロッカー・床の3か所を確認してから教室を出る。',
    posterCanChange: '確認する場所と順番を、出口で短く思い出させる',
    posterCannotChange: '部活動の開始時刻や、学校全体の時間割そのもの',
  },
  {
    id: 'gym-clothes',
    label: '更衣後の体操服',
    who: '移動教室へ向かう生徒',
    when: '体育後、次の授業へ移動するとき',
    where: '更衣場所・ロッカー',
    item: '体操服・タオル',
    cause: '持ち物が複数に分かれ、回収済みか判断しにくい',
    observable: '体育後、次の授業へ移動する生徒が、ロッカー内の体操服やタオルを残している。',
    target: '移動前に、体操服・タオル・袋の3点を指差し確認する。',
    posterCanChange: '確認対象を3点に絞り、回収済みかを見分けやすくする',
    posterCannotChange: '更衣場所の収納数や授業間の移動時間そのもの',
  },
  {
    id: 'teacher-usb',
    label: '授業後のUSB',
    who: '次の教室へ移動する教員',
    when: '授業終了後、PCを片付けるとき',
    where: '教卓・端末の横',
    item: 'USBメモリ・接続機器',
    cause: '生徒対応と機器の片付けを同時に行っている',
    observable: '授業終了後、次の教室へ移動する教員が、端末に接続したUSBメモリを残している。',
    target: 'PCを閉じる前に、接続端子と教卓上を確認する。',
    posterCanChange: '片付け動作の直前に、確認箇所を具体的に示す',
    posterCannotChange: '授業後の質問件数や、校内の機器構成そのもの',
  },
];

export function getScenario(id: ScenarioId) {
  return scenarios.find((scenario) => scenario.id === id) ?? scenarios[0];
}

export type PersonaId = 'rushing' | 'distracted' | 'teacher';

export type Persona = {
  id: PersonaId;
  label: string;
  name: string;
  situation: string;
  attention: string;
  item: string;
  viewingPlace: string;
  headline: string;
  action: string;
  weakMessage: string;
  rationale: string;
};

export const personas: Persona[] = [
  {
    id: 'rushing',
    label: '急いでいる生徒',
    name: '放課後のユウ（仮名）',
    situation: 'チャイム後、友人と部活動へ急いでいる',
    attention: '文章を読む余裕は少なく、出口へ注意が向いている',
    item: '机の横の水筒',
    viewingPlace: '教室の出口',
    headline: '帰る前に、3秒チェック',
    action: '机・ロッカー・床を順に見る',
    weakMessage: '忘れ物に気をつけよう',
    rationale: '短い時間でも、見る場所と行動が具体的に分かるため。',
  },
  {
    id: 'distracted',
    label: '物が分散する生徒',
    name: '体育後のアオ（仮名）',
    situation: '着替えを終え、次の授業の教室へ移動する',
    attention: '複数の持ち物を一度に扱い、回収済みか迷いやすい',
    item: '体操服・タオル・袋',
    viewingPlace: 'ロッカーの扉付近',
    headline: '3点そろった？',
    action: '服・タオル・袋を指差し確認する',
    weakMessage: '持ち物を大切に',
    rationale: '対象を3点に絞り、回収できたかをその場で照合できるため。',
  },
  {
    id: 'teacher',
    label: '片付け中の教員',
    name: '移動前の先生（仮名）',
    situation: '授業後、生徒対応をしながらPCを片付ける',
    attention: '会話と機器操作を同時に行い、接続物を見落としやすい',
    item: 'USBメモリ・変換アダプタ',
    viewingPlace: '教卓上・PCの近く',
    headline: '閉じる前に、端子確認',
    action: 'PCの左右と教卓上を見る',
    weakMessage: '機器の忘れ物ゼロへ',
    rationale: 'PCを閉じる直前の動作と、見る場所が結び付いているため。',
  },
];

export function getPersona(id: PersonaId) {
  return personas.find((persona) => persona.id === id) ?? personas[0];
}

export function calculateJumpRate(large: number, base: number) {
  if (!Number.isFinite(large) || !Number.isFinite(base) || large <= 0 || base <= 0) {
    throw new Error('文字サイズは0より大きい数で指定してください。');
  }
  return Math.round((large / base) * 10) / 10;
}

export function jumpRateLabel(rate: number) {
  if (rate < 2.5) return '低め：落ち着くが、遠くからは差が弱い';
  if (rate < 3.6) return '中程度：見出しと本文の差が分かりやすい';
  return '高め：強く目立つ。要素を増やしすぎない';
}

export function hexToRgb(hex: string) {
  const value = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(value)) throw new Error('6桁のカラーコードを指定してください。');
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function relativeLuminance(hex: string) {
  const rgb = hexToRgb(hex);
  const values = [rgb.r, rgb.g, rgb.b].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
}

export function contrastRatio(first: string, second: string) {
  const a = relativeLuminance(first);
  const b = relativeLuminance(second);
  return Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100;
}

export const worksheetLinks = [
  { number: '1-1', section: 1, label: '現状（As-Is）と目標（To-Be）' },
  { number: '1-2', section: 1, label: '中核課題' },
  { number: '2-1', section: 2, label: 'ペルソナ設定' },
  { number: '3-1', section: 3, label: 'ピクトグラム' },
  { number: '3-2', section: 3, label: 'シグニファイア' },
  { number: '3-3', section: 4, label: '色彩・ジャンプ率・強調要素' },
] as const;
