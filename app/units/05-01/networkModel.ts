export const servers = [
  {name:'ファイルサーバ', request:'班の共有ファイルを開きたい', action:'共有フォルダから指定されたファイルを読み出す。', response:'共有ファイル', detail:'ネットワーク内でファイルを共有する。', blank:'③'},
  {name:'プリントサーバ', request:'教室のプリンタで印刷したい', action:'印刷ジョブを受け付け、順番にプリンタへ渡す。', response:'印刷ジョブ受付の通知', detail:'プリンタを共有し、印刷の依頼を管理する。', blank:'表'},
  {name:'プロキシサーバ', request:'代理の窓口を通じてWebページを見たい', action:'クライアントの代理でWebサーバへ要求し、応答を受け取る。', response:'代理で取得したWebページ', detail:'クライアントの代わりにWebサーバへ接続する。', blank:'④'},
  {name:'NTPサーバ', request:'端末の時計を合わせたい', action:'時刻合わせに必要な情報を返す。端末が時刻を調整する。', response:'時刻情報', detail:'端末の年月日・時刻を同期するための情報を提供する。', blank:'表'},
  {name:'Webサーバ', request:'学校のWebページを見たい', action:'要求されたWebページのデータを用意する。', response:'Webページのデータ', detail:'閲覧要求に応じてWebページを提供する。', blank:'⑤'},
  {name:'メールサーバ', request:'友達にメールを送りたい', action:'メールを受け付け、宛先側のメールサーバへ転送する。', response:'メール受付の通知', detail:'メールの送受信・転送を担う。', blank:'表'},
  {name:'ストリーミングサーバ', request:'配信中の動画を見たい', action:'再生に必要な動画データを順次送り出す。', response:'再生用の動画データ', detail:'動画や音楽を配信する。', blank:'⑥'},
  {name:'認証サーバ', request:'正規の利用者か確認してほしい', action:'提示された認証情報を確認し、認証結果を返す。', response:'認証結果', detail:'正規の利用者かどうかを判別する。', blank:'⑦'},
];
export const layers = [
  {n:4,name:'アプリケーション層',job:'何のサービスを利用する？',detail:'Webの閲覧やメールなど、サービスごとの通信を扱う。',examples:'HTTP・HTTPS・SMTP・POP・IMAP・RTP',osi:'7 アプリケーション / 6 プレゼンテーション / 5 セッション'},
  {n:3,name:'トランスポート層',job:'どのようにデータを届ける？',detail:'アプリケーション間のデータの伝送を扱う。TCPは再送・順序の制御、UDPは簡潔な伝送を担う。',examples:'TCP・UDP',osi:'4 トランスポート'},
  {n:2,name:'インターネット層',job:'どの相手へ届ける？',detail:'IPアドレスを使い、異なるネットワークをまたいでデータを届ける。',examples:'IP',osi:'3 ネットワーク'},
  {n:1,name:'ネットワークインタフェース層',job:'隣の機器へどう送る？',detail:'ケーブルや電波で、同じリンク上の機器との通信を行う。',examples:'イーサネット・IEEE 802.11',osi:'2 データリンク / 1 物理'},
];
export function networkResult(local:boolean, uplink:boolean,target:'local'|'web') {
  if (!local) return {ok:false, message:'LANへの接続で停止。ケーブルやアクセスポイントとの接続を確認しよう。',hop:0};
  if (target==='local') return {ok:true,message:'校内のファイルサーバに届いた！ 校外への回線が切れていても、校内LANの通信はできる。',hop:2};
  if (!uplink) return {ok:false,message:'校内LANまでは接続できた。校外への回線が切れているので、外部のWebサーバへは届かない。',hop:2};
  return {ok:true,message:'ルータからISPを通り、外部のWebサーバへ届いた！ Wi-Fiは、この経路の最初の一部分。',hop:5};
}
export function transferState(step:number) {
  const s=Math.max(0,Math.min(8,step));
  const depth=[0,1,2,3,4,3,2,1,0][s];
  return {depth, side:s<4?'送信側':s===4?'リンク上':'受信側', layer:[4,4,3,2,1,1,2,3,4][s], delivered:s===8};
}
export const transferNotes = [
  ['送信する内容を用意','Webサーバが、閲覧要求に応じたWebページのデータを用意する。'],
  ['4層：HTTPの情報を付ける','アプリケーション層で、HTTPの応答に必要な情報を付ける。'],
  ['3層：TCPの情報を付ける','順序の制御などに必要なTCPヘッダを付ける。ここでは1つのデータ片に注目する。'],
  ['2層：IPの情報を付ける','IPヘッダに送信元・送信先のIPアドレスを入れる。'],
  ['1層：フレームにして送る','MACアドレスを含むヘッダと、誤り検出用のトレーラを付け、信号として送る。'],
  ['1層：フレームを受け取る','受信側はフレームを確認し、MACヘッダとトレーラを外して上の層へ渡す。'],
  ['2層：IPの情報を確認','宛先などを確認し、IPヘッダを外してトランスポート層へ渡す。'],
  ['3層：TCPの情報を確認','順序などを制御し、TCPヘッダを外してアプリケーション層へ渡す。'],
  ['4層：Webページを受け取る','HTTPの情報を読み取り、ブラウザが受け取った内容を表示する。'],
];
export type Term = {section:number;name:string;detail:string;blank?:string};
export const terms:Term[] = [
  {section:1,name:'LAN',detail:'学校や家庭など、比較的狭い範囲のネットワーク。',blank:'①'},
  {section:1,name:'ISP',detail:'インターネットへの接続を提供する事業者。',blank:'②'},
  ...servers.filter(s=>s.blank!=='表').map(s=>({section:2,name:s.name,detail:s.detail,blank:s.blank})),
  {section:1,name:'スイッチングハブ',detail:'同じLAN内の複数の機器を有線で接続する。',blank:'⑧'},
  {section:1,name:'アクセスポイント',detail:'無線で端末をLANに接続する。',blank:'⑨'},
  {section:1,name:'ルータ',detail:'異なるネットワークどうしを接続し、データを中継する。',blank:'⑩'},
  {section:3,name:'通信プロトコル',detail:'通信の手順やデータ形式などの取り決め。',blank:'⑪'},
  {section:3,name:'OSI参照モデル',detail:'通信機能を7階層に整理した参照モデル。',blank:'⑫'},
  {section:3,name:'TCP/IP',detail:'インターネットで使われるプロトコル群。ここでは4階層で整理する。',blank:'⑬'},
  {section:3,name:'TCP',detail:'再送や順序の制御により、信頼性のあるデータ伝送を行う。',blank:'⑭'},
  {section:3,name:'UDP',detail:'到達確認や再送をプロトコル自身では行わず、簡潔にデータを送る。',blank:'⑮'},
  {section:3,name:'IP',detail:'IPアドレスを使い、ネットワークをまたいでデータを届ける。',blank:'⑯'},
  {section:3,name:'イーサネット',detail:'有線LANで使われる通信規格。',blank:'⑰'},
  {section:3,name:'ヘッダ情報',detail:'宛先や順序など、各層の処理に必要な制御情報。',blank:'⑱'},
  {section:3,name:'IPアドレス',detail:'ネットワーク上の通信相手を識別するアドレス。',blank:'⑲'},
  {section:3,name:'MACアドレス',detail:'リンク上で通信するネットワークインタフェースを識別するアドレス。',blank:'⑳'},
  {section:3,name:'トレーラ',detail:'フレームの末尾に付く情報。ここでは誤りの検出に使う。',blank:'㉑'},
];
export const questions = [
  ...terms.map((t,i)=>{
    const pool=terms.filter(x=>x.section===t.section&&x.name!==t.name);
    const others=[pool[i%pool.length],pool[(i+1)%pool.length]];
    const choices=[others[0],t,others[1]];
    const shift=i%3;
    const rotated=[...choices.slice(shift),...choices.slice(0,shift)];
    return {section:t.section,blank:t.blank,text:`${t.detail} この用語は？`,choices:rotated.map(x=>x.name),answer:rotated.findIndex(x=>x.name===t.name),reason:t.detail,feedback:rotated.map(x=>`${x.name}は、${x.detail}`)};
  }),
  {section:3,blank:undefined,text:'有線LANを無線LANに変えても、同じWeb閲覧のしくみを使える。階層化のどんな利点？',choices:['すべての層を作り直せる','変更の影響を関連する層に抑えられる','ヘッダが不要になる'],answer:1,reason:'各層の役割と受け渡し方が決まっているので、他の層への影響を抑えられる。',feedback:['すべてを作り直す必要を減らせることが利点です。','正解です。','階層化しても、各層の通信に必要なヘッダは使います。']},
  {section:1,blank:undefined,text:'校内ファイルは開けるが、外部サイトはどれも開けない。次に確認する場所として適切なのは？',choices:['校外へつながる回線やルータ','開けた校内ファイルの文字色','端末の画面の明るさ'],answer:0,reason:'校内通信ができるという証拠から、次は外部への経路を調べる。原因がルータだと断定はしない。',feedback:['正解です。','文字色は外部へ通信できるかどうかに関係しません。','画面の明るさは通信経路の確認にはなりません。']},
  {section:3,blank:undefined,text:'受信したデータからヘッダを確認しながら取り除く順序は？',choices:['HTTP → TCP → IP → MAC','MAC → IP → TCP → HTTP','どの順序でもよい'],answer:1,reason:'受信側では1層から4層へ、送信側と逆の順序で処理する。',feedback:['これは送信側で情報を付ける順序です。','正解です。','層の順序に沿って、外側の情報から処理します。']},
];
