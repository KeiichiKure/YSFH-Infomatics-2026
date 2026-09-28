export function normalize(value: string) { return value.normalize('NFKC').replace(/\s/g, '').toLowerCase(); }
export function ipv4Number(value: string): number | null {
  const parts = normalize(value).split('.');
  if (parts.length !== 4 || parts.some(p => !/^\d{1,3}$/.test(p) || Number(p) > 255)) return null;
  return parts.reduce((n, p) => n * 256 + Number(p), 0);
}
export function ipText(n: number) { return [24, 16, 8, 0].map(shift => (n >>> shift) & 255).join('.'); }
export function bits(n: number, length = 8) { return n.toString(2).padStart(length, '0'); }
export function subnet(ip: string, prefix: number) {
  const value = ipv4Number(ip);
  if (value === null || !Number.isInteger(prefix) || prefix < 8 || prefix > 30) return null;
  const size = 2 ** (32 - prefix), network = Math.floor(value / size) * size;
  return { ip: ipText(value), prefix, hostBits: 32 - prefix, size, hosts: size - 2,
    mask: ipText(2 ** 32 - size), network: ipText(network), broadcast: ipText(network + size - 1),
    first: ipText(network + 1), last: ipText(network + size - 2),
    networkValue: network, broadcastValue: network + size - 1,
    assignable: value !== network && value !== network + size - 1 };
}
export function maskPrefix(mask:string):number|null {
  const n=ipv4Number(mask);
  if(n===null)return null;
  const binary=bits(n,32);
  if(!/^1+0+$/.test(binary))return null;
  const prefix=binary.indexOf('0');
  return prefix>=8&&prefix<=30?prefix:null;
}
export const sections = [
  ['addresses','IPアドレス'], ['lan','家の住所'], ['subnet','範囲と台数'],
  ['names','ドメイン名'], ['dns','名前解決'], ['routes','回線を分け合う'],
] as const;
export const terms = [
  ['①','IPv4','32ビットのIPアドレスを使う規格。8ビットずつ4組に分けて表す。',1],
  ['③','グローバルIPアドレス','インターネット上で重複しないよう割り当てられるアドレス。',1],
  ['⑤','IPv6','16ビットずつ8組、合計128ビットのIPアドレスを使う規格。通常は16進数で表す。',1],
  ['⑥','インターネットレジストリ','IPアドレスの割り当て・管理を担う組織。世界・地域・国などの段階で連携する。',1],
  ['⑦','プライベートIPアドレス','LAN内で使うために定められた範囲のアドレス。同じLAN内では重複させない。',2],
  ['⑧','サブネットマスク','IPアドレスのどこまでがネットワーク部で、どこからがホスト部かを示す数値。2進数では左から1が連続し、残りは0になる。',3],
  ['⑨','デフォルトゲートウェイ','宛先が家のLANの外にあるとき、端末がまず通信を渡すルータの内側のアドレス。この模型では192.168.1.1。',2],
  ['⑩','DHCP','IPアドレスやマスク、ゲートウェイなどの設定を自動的に配る仕組み。',2],
  ['⑪','NAPT','IPアドレスとポート番号を変換し、複数端末で外側のIPアドレスを共有する技術。',2],
  ['⑫','ポート番号','TCP・UDPで通信の入口を区別する番号。NAPTの返信先の識別にも使う。',2],
  ['⑬','ホスト','ネットワークに接続されたコンピュータなど。アドレスのホスト部で区別する。',3],
  ['⑯','プレフィックス表記','IPアドレスの後ろに / とネットワーク部のビット数を添える。例：192.168.1.120/24。',3],
  ['⑰','ネットワークアドレス','IP AND マスクで求める。ホスト部がすべて0の、ネットワーク全体を表す住所。',3],
  ['⑱','ブロードキャストアドレス','ネットワーク部はそのまま、ホスト部をすべて1にした住所。同じLANの全員へ一斉送信するときに使う。',3],
  ['㉑','ドメイン名','ドットで区切った階層的な名前。URLやメールアドレスで使う。',4],
  ['㉒','FQDN','完全修飾ドメイン名。例：www.kantei.go.jp。https:// は含まない。',4],
  ['㉓','名前解決','名前に対応するIPアドレスなどを調べること。',5],
  ['㉔','DNS（ドメインネームシステム）','ドメイン名の情報を階層的・分散的に管理し、名前解決の問い合わせに答える仕組み。',5],
] as const;

export const dhcpSteps = [
  ['接続したばかり','端末はまだIPアドレスを借りていません。どのサーバに頼めばよいかも分かりません。','端末','接続準備'],
  ['① 探す · Discover','同じLANへ「設定を配れるサーバはいますか？」と呼びかけます。','端末 → LAN全体','設定を配れるサーバは？'],
  ['② 提案 · Offer','DHCPサーバが、使えるアドレスと設定を提案します。まだ端末の利用は確定していません。','DHCPサーバ → 端末','192.168.1.120を提案'],
  ['③ 要求 · Request','端末が提案を選び、「その設定を使いたい」と伝えます。','端末 → DHCPサーバ','この設定を借りたい'],
  ['④ 確定 · ACK','サーバが貸し出しを確定。端末にIP・マスク・ゲートウェイ・DNSの設定が入りました。','DHCPサーバ → 端末','貸し出しを確定'],
] as const;

export const naptEntries = [
  { name:'A', ip:'192.168.1.120', inside:51000, outside:50000 },
  { name:'B', ip:'192.168.1.121', inside:51000, outside:60000 },
] as const;
export function naptState(step:number) {
  const s = Math.max(0, Math.min(8, step));
  const active = s >= 3 && s <= 6 ? naptEntries[1] : naptEntries[0];
  const returning = s >= 5;
  const translated = [2,4,6,8].includes(s);
  const internal = `${active.ip}:${active.inside}`, external = `203.0.113.1:${active.outside}`;
  return { step:s, active:active.name, returning, translated,
    entries:naptEntries.filter((_,i)=>s >= (i===0 ? 2 : 4)),
    source:s===0?'—': returning?'198.51.100.80:443': translated?external:internal,
    destination:s===0?'—': returning?(translated?internal:external):'198.51.100.80:443',
    receivedA:s>=8, receivedB:s>=6,
    position:s===0?'準備':s===1||s===3?'LAN側・変換前':s===2||s===4?'WAN側・変換後':s===5||s===7?'WAN側・返信到着':'LAN側・返信を転送',
  };
}
export const naptNotes = [
  ['同じポートでも大丈夫？','AもBも内側のポート51000を使います。外から戻る返事を区別する手掛かりを探そう。'],
  ['Aから送る','AのIPとポートが送信元。宛先443はWebサーバのHTTPS用の入口です。'],
  ['Aの対応を記録して変換','ルータがAの内側IP・ポートを、外側IP・ポート50000に対応づけました。'],
  ['Bからも送る','Bも内側は51000。しかしIPが違うので、Aとは別の通信です。'],
  ['Bは別の外側ポートへ','同じ外側IPでも、Bには60000を割り当てます。対応表が2行になりました。'],
  ['Bへの返事が先に到着','返事の宛先は203.0.113.1:60000。対応表のどの行と一致するでしょう？'],
  ['表を引いてBへ戻す','60000の行から、宛先を192.168.1.121:51000へ戻します。Bだけが返事を受け取りました。'],
  ['次にAへの返事が到着','今度の宛先ポートは50000。同じ外側IPでも、別の行を参照できます。'],
  ['Aにも届いた','50000の行からAのIP・ポートへ戻しました。返事の順番が変わっても、混ざりません。'],
] as const;

export type DnsMode = 'cold'|'warm'|'missing';
export type DnsStep = { title:string; from:string; to:string; message:string; reason:string; kind:'ready'|'search'|'query'|'referral'|'answer'|'web'|'error'; known?:string };
export function dnsSteps(mode:DnsMode,host=mode==='missing'?'www.festivl.example.jp':'www.festival.example.jp',answerIp='198.51.100.80',knownDelegation:'none'|'jp'|'example'='none'):DnsStep[] {
  const start:DnsStep[]=[
    {title:'名前しか分からない',from:'端末',to:'DNS',message:`${host} のIPアドレスは？`,reason:'端末には問い合わせ先DNSのIPが設定されています。WebサーバのIPはまだ分かりません。',kind:'ready'},
    {title:'端末がDNSに名前解決を依頼',from:'端末',to:'DNS',message:`${host} のIPアドレスは？`,reason:'問い合わせ先DNSが、必要な情報を調べて端末へ返します。',kind:'query'},
    {title:'いつものDNSが記憶を検索',from:'DNS',to:'DNS',message:mode==='warm'?'キャッシュにアドレスあり':'この名前のアドレスは記憶になし',reason:mode==='warm'?'以前調べた答えが、まだ記憶に残っています。':knownDelegation==='example'?'この名前の答えはありませんが、example.jp の担当DNSは記憶しています。':knownDelegation==='jp'?'この名前の答えはありませんが、.jp の担当DNSは記憶しています。':'名前の答えも担当DNSも記憶にないので、設定済みのルートDNSから調べます。',kind:'search'},
  ];
  if(mode==='warm') start.push({title:'キャッシュに有効な回答がある',from:'DNS',to:'端末',message:answerIp,reason:'いつものDNSが記憶していた答えを返します。ルートや権威DNSへの問い合わせを省けます。',kind:'answer',known:answerIp});
  else {
   if(knownDelegation==='none')start.push(
    {title:'名前解決のためルートDNSへ問い合わせ',from:'DNS',to:'ルート',message:`${host} のIPアドレスは？`,reason:'ルートDNSの住所は設定済みです。.jpを担当するDNSを尋ねます。',kind:'query'},
    {title:'ルートが.jpの問い合わせ先を紹介',from:'ルート',to:'DNS',message:'.jp だから、192.0.2.53 の日本のDNSに聞いて',reason:'いつものDNSは紹介された.jpの担当DNSを期限つきで記憶します。',kind:'referral'},
   );
   if(knownDelegation!=='example')start.push(
    {title:'.jp のDNSへ問い合わせ',from:'DNS',to:'.jp',message:`${host} のIPv4アドレスは？`,reason:'記憶した.jpの担当DNSへ問い合わせます。',kind:'query'},
    {title:'example.jpの担当を紹介',from:'.jp',to:'DNS',message:'example.jp だから、192.0.2.54 のDNSに聞いて',reason:'いつものDNSはexample.jpの担当DNSも期限つきで記憶します。',kind:'referral'},
   );
   start.push(
    {title:'example.jpのDNSへ問い合わせ',from:'DNS',to:'example.jp',message:`${host} のIPv4アドレスは？`,reason:'記憶したexample.jpの担当DNSへ直接問い合わせます。',kind:'query'},
    {title:mode==='missing'?'その名前は存在しない':'権威DNSがIPを回答',from:'example.jp',to:'DNS',message:mode==='missing'?'NXDOMAIN（名前が存在しない）':`${host} は ${answerIp}`,reason:mode==='missing'?'この名前には対応するIPがありません。':'example.jp のDNSはホスト名に対応するIPを答えます。いつものDNSが有効期限つきで記憶します。',kind:mode==='missing'?'error':'answer'},
    {title:mode==='missing'?'端末へ失敗を知らせる':'端末がIPを受け取る',from:'DNS',to:'端末',message:mode==='missing'?'DNS_PROBE_FINISHED_NXDOMAIN':answerIp,reason:mode==='missing'?'ブラウザには「このサイトにアクセスできません」などと表示されます。':'名前解決は完了。まだWebページ本体は届いていません。',kind:mode==='missing'?'error':'answer',known:mode==='missing'?undefined:answerIp},
   );
  }
  if(mode!=='missing') start.push(
    {title:'調べたIPへWebの要求',from:'端末',to:'Web',message:`${answerIp} へ GET /`,reason:'ここからはDNSとは別のWeb通信。URLにファイルを指定しなければ、Webサーバが設定に従ってトップページ（例：index.html）を選びます。',kind:'web',known:answerIp},
    {title:'Webページが届く',from:'Web',to:'端末',message:'index.html のページ本体',reason:'Webサーバが選んだトップページが届きました。DNSはファイル名を調べません。',kind:'web',known:answerIp},
  );
  return start;
}
export const circuitSlots = ['A1','A2','A3','B1','B2','B3','C1','C2','C3'];
export const packetSlots = ['A1','B1','C1','A2','B2','C2','A3','B3','C3'];
export const routeTable = [
  { network:'192.168.1.0', prefix:24, next:'LANへ直接', label:'同じLAN' },
  { network:'198.51.100.0', prefix:24, next:'ルータB', label:'Webサーバ側' },
  { network:'203.0.113.0', prefix:24, next:'ルータC', label:'別のネットワーク' },
  { network:'0.0.0.0', prefix:0, next:'ルータD', label:'デフォルト経路' },
] as const;
export function routeFor(ip:string) {
  const n=ipv4Number(ip); if(n===null)return null;
  return routeTable.find(r=>Math.floor(n/2**(32-r.prefix))===Math.floor(ipv4Number(r.network)!/2**(32-r.prefix)))!;
}
