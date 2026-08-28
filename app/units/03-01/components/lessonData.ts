export const worksheetTerms = [
  { number: 1, section: 1, term: 'ハードウェア', meaning: 'コンピュータを構成する本体の装置や周辺機器。' },
  { number: 2, section: 1, term: 'CPU', meaning: '中央処理装置。制御装置と演算装置を合わせたもの。' },
  { number: 3, section: 1, term: 'インタフェース', meaning: '機器・ソフトウェア・人の間で、情報をやり取りするための規格や機能。' },
  { number: 4, section: 1, term: 'Type-A', meaning: 'USB端子の形状の一つ。長方形で、差し込む向きが決まっている。' },
  { number: 5, section: 1, term: 'Type-C', meaning: 'USB端子の形状の一つ。上下を区別せず差し込める。形状だけで速度や映像対応はわからない。' },
  { number: 6, section: 1, term: 'HDMI', meaning: '映像と音声をディスプレイなどへ送るデジタル接続規格。' },
  { number: 7, section: 1, term: 'DisplayPort', meaning: '映像と音声をディスプレイなどへ送るデジタル接続規格。' },
  { number: 8, section: 1, term: 'Bluetooth', meaning: 'イヤホンやマウスなどの接続に使われる無線通信技術。通信距離は機器と環境で変わる。' },
  { number: 9, section: 1, term: 'NFC', meaning: '機器を近づけて使う近距離無線通信。非接触の決済などで利用される。' },
  { number: 10, section: 1, term: 'IEEE 802.11', meaning: '無線LANの標準規格の系列。周波数帯や速度などの違いがある。' },
  { number: 11, section: 2, term: 'デバイスドライバ', meaning: 'OSと機器の橋渡しをし、機器を制御するプログラム。' },
  { number: 12, section: 2, term: 'API', meaning: 'ソフトウェアの機能を別のソフトウェアから利用するための窓口や取り決め。' },
  { number: 13, section: 2, term: 'タスク管理', meaning: 'ソフトウェアの実行順序や、CPUを使う時間の割り当てなどを管理する。' },
  { number: 14, section: 2, term: '入出力管理', meaning: '周辺機器とのデータの入出力を管理する。' },
  { number: 15, section: 2, term: 'ファイル管理', meaning: 'ファイルの保存・読み出しや、フォルダによる整理などを管理する。' },
  { number: 16, section: 2, term: '資源管理', meaning: 'CPU・メモリ・周辺機器などのコンピュータ資源を管理する。' },
  { number: 17, section: 2, term: 'ユーザ管理', meaning: '利用者のアカウントの登録・削除などを管理する。' },
  { number: 18, section: 3, term: '.jpg', meaning: 'JPEG形式の画像ファイルに使う拡張子。.jpegも使われる。' },
  { number: 19, section: 3, term: '.zip', meaning: '複数のファイルなどをまとめられるZIP形式の拡張子。' },
  { number: 20, section: 3, term: '.txt', meaning: '文字を中心に記録したテキストファイルの拡張子。' },
  { number: 21, section: 3, term: '.pdf', meaning: '文書のレイアウトを保って共有するPDF形式の拡張子。' },
] as const;

export const hardwareSteps = [
  { target: 'input', label: '入力', text: 'キーボードから「3＋5」を入力する。', data: '入力装置 → 主記憶装置' },
  { target: 'memory', label: '記憶', text: '計算に必要なデータとプログラムを、主記憶装置で保持する。', data: '主記憶装置 ↔ CPU' },
  { target: 'control', label: '制御', text: '制御装置がプログラムの命令に従って、各装置の働きを調整する。', data: '制御装置 ⇢ 各装置への指示（制御）' },
  { target: 'arithmetic', label: '演算', text: '演算装置が3＋5を計算し、結果の8を主記憶装置へ戻す。', data: '演算装置 → 主記憶装置' },
  { target: 'output', label: '出力', text: '計算結果の「8」をディスプレイに表示する。', data: '主記憶装置 → 出力装置' },
  { target: 'storage', label: '保存', text: '保存を指示すると、結果をSSDなどの補助記憶装置へ書き込む。', data: '主記憶装置 → 補助記憶装置' },
] as const;

export const connections = [
  { id: 'type-a', name: 'USB Type-A', number: 4, group: '有線', detail: 'キーボード、マウス、USBメモリなど。端子の形状の名前であり、通信速度の名前ではない。', shape: '長方形・向きあり' },
  { id: 'type-c', name: 'USB Type-C', number: 5, group: '有線', detail: 'USBメモリなどの接続や充電。対応機器では映像も送れるが、端子・ケーブルの機能確認が必要。', shape: '小さな長円形・上下対称' },
  { id: 'hdmi', name: 'HDMI', number: 6, group: '有線', detail: 'ディスプレイやプロジェクタへ、デジタルの映像と音声を送る。', shape: '台形に近い形' },
  { id: 'displayport', name: 'DisplayPort', number: 7, group: '有線', detail: 'ディスプレイなどへ、デジタルの映像と音声を送る。', shape: '片側の角を落とした形' },
  { id: 'vga', name: 'VGA', number: null, group: '有線', detail: 'ディスプレイやプロジェクタへアナログの映像を送る。音声は別の接続が必要。', shape: '3段のピン・固定ねじ' },
  { id: 'bluetooth', name: 'Bluetooth', number: 8, group: '無線', detail: 'イヤホンやマウスなどに使う。プリントの距離は目安であり、機器や障害物などで通信できる範囲は変わる。', shape: '周辺機器を無線でつなぐ' },
  { id: 'nfc', name: 'NFC', number: 9, group: '無線', detail: '機器を近づけて通信する。非接触の決済などで利用される。', shape: '近づけてタッチ' },
  { id: 'wifi', name: 'IEEE 802.11', number: 10, group: '無線', detail: '無線LANの標準規格の系列。対応するアクセスポイントを通して、端末をネットワークへ接続できる。', shape: '無線LANの規格' },
] as const;

export const connectionQuestions = [
  { text: 'PCとプロジェクタの両方にHDMI端子があります。変換器を使わず、映像と音声を1本で送るには？', answer: 'hdmi', reason: '両方の機器が対応するHDMIなら、映像と音声を一緒に送れます。VGAでは音声は送れません。' },
  { text: 'USB Type-C端子だけの端末に、Type-C端子を備えたUSBメモリを変換器なしで直接つなぐには？', answer: 'type-c', reason: '端末とUSBメモリの端子形状が一致します。ただし、形が同じでも通信速度などは製品ごとに確認します。' },
  { text: '対応するイヤホンを、ケーブルなしでスマートフォンと接続したい。ここでは周辺機器用の無線通信を選ぼう。', answer: 'bluetooth', reason: 'イヤホンなどの周辺機器の接続にはBluetoothがよく使われます。両方の機器が対応している必要があります。' },
  { text: '対応する決済端末にスマートフォンを近づけて支払う。使う近距離無線通信は？', answer: 'nfc', reason: 'NFCは機器を近づけて行う通信で、非接触の決済などに利用されます。' },
  { text: '教室の無線LANアクセスポイントへ接続する。無線LANの標準規格は？', answer: 'wifi', reason: 'IEEE 802.11は無線LANの標準規格です。機器や規格によって使う周波数帯や速度が違います。' },
] as const;
