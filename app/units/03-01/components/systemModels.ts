export const printSteps = [
  { title: '応用ソフトウェア', action: '「印刷する」を選ぶ', detail: '文書作成アプリが、印刷したい内容を準備する。' },
  { title: 'OSのAPI', action: '共通の窓口へ印刷を依頼', detail: 'アプリは決められた取り決めを使って、OSの印刷機能を呼び出す。APIは機能を利用するための窓口。' },
  { title: 'OS', action: '印刷要求を管理', detail: 'OSが印刷の順番や機器の利用を管理する。複数のアプリからの依頼も整理する。' },
  { title: 'デバイスドライバ', action: '機器に応じた制御へ', detail: 'ドライバがOSとプリンタを橋渡しする。機器に応じたデータや指示を扱う。' },
  { title: 'ハードウェア', action: 'プリンタが出力', detail: '機器が指示に従って、文書を紙に印刷する。' },
] as const;

export function canAdvancePrint(step: number, driverAvailable: boolean) {
  return step >= 0 && step < printSteps.length - 1 && (step !== 3 || driverAvailable);
}

export const managementFunctions = [
  { name: 'タスク管理', number: 13, example: '複数のアプリに、CPUを使う時間を順に割り当てる。', meaning: '実行順序やCPUへの割り当てを管理する。' },
  { name: '記憶管理', number: null, example: 'アプリAとBが使うメモリの領域を割り当てる。', meaning: '各ソフトウェアが使うメモリの割り当てを管理する。' },
  { name: '入出力管理', number: 14, example: 'マウスからの入力やプリンタへのデータ出力を管理する。', meaning: '周辺機器との入出力を管理する。' },
  { name: 'ファイル管理', number: 15, example: 'レポートをフォルダに保存し、後で読み出す。', meaning: 'ファイルやフォルダ、ファイルの読み書きを管理する。' },
  { name: '資源管理', number: 16, example: 'CPU・メモリ・周辺機器などを、利用状況に合わせて全体として管理する。', meaning: 'コンピュータ資源を利用できるように管理する。' },
  { name: 'ユーザ管理', number: 17, example: '新しい利用者のアカウントを登録する。', meaning: '利用者のアカウントの登録・削除などを管理する。' },
] as const;

export const fileTypes = [
  { extension: '.jpg', name: '写真', format: 'JPEG画像', app: '画像ビューア', sample: '校外学習', kind: 'image' },
  { extension: '.png', name: '図・イラスト', format: 'PNG画像', app: '画像ビューア', sample: '案内図', kind: 'image' },
  { extension: '.gif', name: '画像', format: 'GIF画像', app: '画像ビューア', sample: 'アイコン', kind: 'image' },
  { extension: '.mp3', name: '音楽・音声', format: 'MP3音声', app: '音楽プレーヤー', sample: '発表練習', kind: 'audio' },
  { extension: '.zip', name: 'まとめたファイル', format: 'ZIPアーカイブ', app: '展開ツール', sample: '提出資料', kind: 'archive' },
  { extension: '.txt', name: '文字', format: 'テキスト', app: 'テキストエディタ', sample: 'メモ', kind: 'text' },
  { extension: '.pdf', name: 'レイアウトを保つ文書', format: 'PDF文書', app: 'PDFビューア', sample: 'レポート', kind: 'document' },
  { extension: '.docx', name: '文書作成', format: 'Word文書', app: '文書作成アプリ', sample: '報告書', kind: 'document' },
  { extension: '.xlsx', name: '表計算', format: 'Excelブック', app: '表計算アプリ', sample: '観測データ', kind: 'sheet' },
  { extension: '.pptx', name: '発表スライド', format: 'PowerPointプレゼンテーション', app: 'プレゼンテーションアプリ', sample: '研究発表', kind: 'slides' },
] as const;

export function inspectRename(originalExtension: string, namedExtension: string) {
  const actual = fileTypes.find(file => file.extension === originalExtension);
  const associated = fileTypes.find(file => file.extension === namedExtension);
  if (!actual || !associated) throw new Error('Unknown file extension');
  return { actual, associated, mismatch: originalExtension !== namedExtension };
}

type Resource = 'cpu' | 'io';
type Job = 'A' | 'B';
export type ResourceTick = { cpu: Job | null; io: Job | null; a: Resource | 'wait' | 'done'; b: Resource | 'wait' | 'done' };
// A and B alternate CPU / I/O / CPU. Each resource has one slot.
const durations = { A: [3, 3, 1], B: [2, 2, 1] } as const;

export function buildResourceSchedule(mode: 'sequential' | 'shared'): ResourceTick[] {
  const state = { A: { phase: 0, remaining: 3 }, B: { phase: 0, remaining: 2 } };
  const ticks: ResourceTick[] = [];
  const owner: Record<Resource, Job | null> = { cpu: null, io: null };
  const jobs: Job[] = ['A', 'B'];
  const resource = (job: Job): Resource => state[job].phase % 2 === 0 ? 'cpu' : 'io';
  while (jobs.some(job => state[job].phase < 3)) {
    for (const job of jobs) {
      if (state[job].phase >= 3 || (mode === 'sequential' && job === 'B' && state.A.phase < 3)) continue;
      const wanted = resource(job);
      if (owner[wanted] === null) owner[wanted] = job;
    }
    const jobStatus = (job: Job): Resource | 'wait' | 'done' => state[job].phase >= 3 ? 'done' : owner[resource(job)] === job ? resource(job) : 'wait';
    ticks.push({ cpu: owner.cpu, io: owner.io, a: jobStatus('A'), b: jobStatus('B') });
    for (const key of ['cpu', 'io'] as const) {
      const job = owner[key];
      if (job === null) continue;
      state[job].remaining--;
      if (state[job].remaining === 0) {
        state[job].phase++;
        state[job].remaining = durations[job][state[job].phase] ?? 0;
        owner[key] = null;
      }
    }
  }
  return ticks;
}

export type IoTState = { brightness: number; online: boolean; reportedBrightness: number; lightOn: boolean; message: string };
export type IoTAction = { type: 'brightness'; value: number } | { type: 'connection'; online: boolean } | { type: 'light'; on: boolean } | { type: 'reset' };
export const initialIoTState: IoTState = { brightness: 60, online: true, reportedBrightness: 60, lightOn: false, message: 'センサの値を、離れた場所のアプリで確認できます。' };

export function iotReducer(state: IoTState, action: IoTAction): IoTState {
  switch (action.type) {
    case 'brightness': {
      const brightness = Math.min(100, Math.max(0, Number.isFinite(action.value) ? action.value : state.brightness));
      return { ...state, brightness, reportedBrightness: state.online ? brightness : state.reportedBrightness, message: state.online ? 'センサの新しい値が、ネットワークを通ってアプリへ届きました。' : '現地のセンサは計測中。通信がないため、アプリの値は更新されません。' };
    }
    case 'connection': return { ...state, online: action.online, reportedBrightness: action.online ? state.brightness : state.reportedBrightness, message: action.online ? '通信が復旧し、アプリの表示を現在の値に更新しました。' : '通信を切りました。遠隔の表示更新と操作はできません。照明は現在の状態を保ちます。' };
    case 'light': return state.online ? { ...state, lightOn: action.on, message: `アプリからの指示が届き、照明を${action.on ? '点灯' : '消灯'}しました。` } : { ...state, message: '指示を送れません。通信を戻してから、もう一度操作してください。' };
    case 'reset': return { ...initialIoTState };
  }
}

export const finalQuestions = [
  { section: 1, href: '#hardware', text: '制御装置と演算装置を合わせたものは？', choices: ['補助記憶装置', 'CPU', 'API'], answer: 1, reason: 'CPUは中央処理装置。制御と演算を担います。主記憶装置とは区別します。' },
  { section: 2, href: '#software', text: '応用ソフトウェアが、OSの機能を利用するときの窓口は？', choices: ['HDMI', '拡張子', 'API'], answer: 2, reason: 'APIはソフトウェア同士の窓口。デバイスドライバはOSと機器を橋渡しするプログラムです。' },
  { section: 3, href: '#os-purpose', text: '画像の名前を「写真.jpg」から「写真.pdf」へ変えただけでは？', choices: ['中身はJPEGのまま', 'PDFに変換される', '画像が圧縮される'], answer: 0, reason: '拡張子の変更は形式の変換ではありません。PDFにするには対応アプリで変換・書き出しを行います。' },
  { section: 4, href: '#iot', text: 'この実験で通信を切って明るさを変えると、どうなる？', choices: ['センサも計測を止める', '遠隔の表示も更新される', '現地では計測、遠隔の値は更新されない'], answer: 2, reason: 'センサは現地で計測を続けます。通信がない間は、離れたアプリへの更新や指示の送信ができません。' },
] as const;

export function isMissionComplete(answers: readonly (number | null)[]) {
  return answers.length === finalQuestions.length && finalQuestions.every((question, index) => answers[index] === question.answer);
}
