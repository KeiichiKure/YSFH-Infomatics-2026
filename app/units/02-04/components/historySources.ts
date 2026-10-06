import type { historyItems } from './lessonData';

type HistoryYear = (typeof historyItems)[number]['year'];
type HistorySource = { label: string; publisher: string; url: string; prompt: string };

// 実物資料は権利者の公開ページにリンクする。画像・音声を転載しない。
export const historySources: Record<HistoryYear, HistorySource[]> = {
  '1870': [
    { label: '昔の電報台紙を見る', publisher: 'NTT東日本', url: 'https://www.ntt-east.co.jp/dmail/pickup/denpo150th/', prompt: '後の時代の台紙も含みます。短い文と、紙で届ける形に注目。' },
    { label: 'ブレゲ指字電信機を見る', publisher: '郵政博物館', url: 'https://www.postalmuseum.jp/column/collection/breguet.html', prompt: '文字盤と指針で文字を伝えた、最初期の道具です。' },
  ],
  '1871': [{ label: '最初の切手と郵便の姿を見る', publisher: '日本郵政', url: 'https://www.japanpost.jp/group/about/milestone/150th/stamp/', prompt: '1871年の切手や、郵便を運ぶ様子を見てみよう。' }],
  '1890': [{ label: '電話がない人に届いた紙を見る', publisher: '郵政博物館', url: 'https://www.postalmuseum.jp/column/collection/denwabin.html', prompt: '大正時代の「電話便」と電報。電話があっても紙で届ける工夫が残った。' }],
  '1925': [
    { label: '放送開始の第一声を読む', publisher: 'NHK広報局', url: 'https://note.com/nhk_pr/n/n720cd8ebdf5a', prompt: '1925年の開始時の言葉を、NHKの記事で確認します。' },
    { label: '後の時代の録音盤・音声資料', publisher: '宮内庁', url: 'https://www.kunaicho.go.jp/kunaicho/koho/taisenkankei/syusen/syusen.html', prompt: '1945年の記録で、第一声とは別です。音声再生は環境により異なります。' },
  ],
  '1953': [{ label: '1953年の白黒テレビを見る', publisher: 'シャープ', url: 'https://corporate.jp.sharp/corporate/info/history/only_one/item/t05.html', prompt: '画面の大きさ・本体の形を、今のテレビと比べよう。' }],
  '1987': [{ label: '1987年の携帯電話を見る', publisher: '国立科学博物館', url: 'https://sts.kahaku.go.jp/sts/detail.php?no=900890141050', prompt: '約900gのTZ-802型。大きさと重さを、手元の端末と比べよう。' }],
  '1992': [{ label: '1982年のPC-9801を見る', publisher: '情報処理学会', url: 'https://museum.ipsj.or.jp/computer/personal/0011.html', prompt: '接続サービス登場より前のPC。画面・本体・外付けドライブに注目。' }],
  '1995頃〜': [{ label: '1994年の家庭向けPCを見る', publisher: '情報処理学会', url: 'https://museum.ipsj.or.jp/computer/personal/0057.html', prompt: 'FMV DESKPOWERの実物写真。スピーカーやCD-ROMもセットになった。' }],
  '2000頃': [{ label: '2000年のPCカタログを見る', publisher: '富士通', url: 'https://www.fmworld.net/product/catalog/ctlg_deskpower_200010-3a.pdf', prompt: '当時の画面・本体・周辺機器を、今のPCと比べよう（PDF）。' }],
  '2000以降': [],
};
