export const nodeNames=['端末','Ethernet（有線ポート）','IEEE 802.11（無線アクセスポイント）','スイッチングハブ','プロキシサーバ','ファイルサーバ','学校ルータ','ISP','ルータA','ルータB','ルータC','ルータD','ルータE','ルータF','Webサーバ','NTPサーバ','メールサーバ','ストリーミングサーバ','プリントサーバ','認証サーバ'];
export const links:number[][]=[[3,18],[3,19],[0,1],[0,2],[1,3],[2,3],[3,4],[3,5],[3,6],[6,7],[7,8],[7,9],[8,10],[8,11],[9,10],[9,11],[10,12],[10,13],[11,12],[11,13],[8,9],[10,11],[12,13],[12,14],[13,14],[12,15],[13,15],[12,16],[13,16],[12,17],[13,17]];
export function findRoute(start:number,end:number,broken:number[],reverse=false):number[]{if(broken.includes(start)||broken.includes(end))return [];const queue=[[start]],seen=new Set([start]);while(queue.length){const p=queue.shift()!,at=p.at(-1)!;if(at===end)return p;const neighbors=links.flatMap(([a,b])=>a===at?[b]:b===at?[a]:[]).sort((a,b)=>reverse?b-a:a-b);for(const n of neighbors){if(broken.includes(n)||seen.has(n))continue;seen.add(n);queue.push([...p,n]);}}return []}
export const requestTexts=['班の資料をください','文書を印刷してください','文化祭ページを代理取得して','今の時刻を教えて','文化祭ページをください','メールを届けてください','動画を送ってください','利用者を確認してください'];
export function targetNode(target:number){return target===1?18:target===7?19:target===2||target===4?14:target===3?15:target===5?16:target===6?17:5}
export function nodeIp(node:number){return node===0?'192.0.2.10':node===4?'192.0.2.30':node===5?'192.0.2.20':node===18?'192.0.2.21':node===19?'192.0.2.27':node===6?'192.0.2.1':node>=14?`198.51.100.${[80,123,25,90][node-14]}`:`203.0.113.${node}`}
export function mac(node:number,neighbor:number){if(node===0)return '02:00:00:00:00:10';if(node===4)return '02:00:00:00:00:30';if(node===5)return '02:00:00:00:00:20';if(node===18)return '02:00:00:00:00:21';if(node===19)return '02:00:00:00:00:27';if(node===6)return neighbor<=5||neighbor>=18?'02:00:00:00:00:01':'02:00:00:00:00:02';return `02:00:00:00:${(node+1).toString(16).padStart(2,'0')}:${(node<=5?1:neighbor+1).toString(16).padStart(2,'0')}`}
export type JourneyStep={at:number;previous:number;from:number;to:number;path:number[];leg:number;reply:boolean;note:string;blocked?:boolean};
export function makeJourney(target:number,broken:number[]):JourneyStep[]{
 const dest=targetNode(target),proxy=target===2;broken=broken.includes(1)?broken:[...broken,2];
 const legs=proxy?[[0,4],[4,14],[14,4],[4,0]]:[[0,dest],[dest,0]];
 const all:JourneyStep[]=[];
 for(let leg=0;leg<legs.length;leg++){
 const [from,to]=legs[leg],reply=proxy?leg>=2:leg===1;
 const path=findRoute(from,to,broken,reply);
 if(!path.length){all.push({at:from,previous:from,from,to,path:[from],leg,reply,blocked:true,note:'行ける経路が見つからないよ。×の機器を直して、もう一度送ろう。'});break;}
 path.forEach((at,i)=>{const note=at===from?(proxy&&leg===1?'僕はプロキシ。ここからは僕のIPでWebサーバへ新しく依頼するよ。':proxy&&leg===3?'Webの返事を受け取ったよ。今度は僕から端末へ返すね。':reply?'返事を送り返すよ。帰り道は別の経路を選んだよ。':'依頼と宛先を組み立てたよ。この道で届けよう。'):at===to?(proxy&&to===4?reply?'プロキシにWebの返事が届いた！端末へ渡す準備をしよう。':'プロキシが依頼を受け取った！次は僕が代理で取りに行くよ。':to===0?'端末に返事が届いた！画面に表示しよう。':'依頼が届いたよ。必要な情報を用意して返すね。'):at===1?'ケーブルから受け取って、スイッチングハブへ渡すよ。':at===2?'電波で受け取ったよ。校内LANへ橋渡しするね。':at===3?'宛先MACを見て、渡す機器を選ぶよ。':at===6?'別のネットワークへ。宛先IPを見て次へ渡すよ。':at===7?'学校からインターネットへ接続する入口だよ。':'使える次の経路へ中継するよ。故障した機器は通らない。';all.push({at,previous:path[Math.max(0,i-1)],from,to,path,leg,reply,note});});
 }
 return all;
}
export function framePair(s:JourneyStep):[number,number]{
 const atIndex=s.path.indexOf(s.at);let a=Math.max(0,atIndex-1),b=atIndex;
 const bridges=[1,2,3];while(a>0&&bridges.includes(s.path[a]))a--;while(b<s.path.length-1&&bridges.includes(s.path[b]))b++;
 if(a===b&&b<s.path.length-1){b++;while(b<s.path.length-1&&bridges.includes(s.path[b]))b++;}
 return [s.path[a],s.path[b]];
}
