import test from 'node:test';
import assert from 'node:assert/strict';
import {subnet,ipv4Number,ipText,normalize,maskPrefix,naptState,naptEntries,dnsSteps,routeFor,circuitSlots,packetSlots,terms} from '../app/units/05-02/model.ts';

test('プリントと教科書の既知例、利用可能範囲',()=>{
 for(const [ip,prefix,network,broadcast,hosts] of [
  ['192.168.1.120',24,'192.168.1.0','192.168.1.255',254],
  ['192.168.0.130',25,'192.168.0.128','192.168.0.255',126],
  ['192.168.1.100',26,'192.168.1.64','192.168.1.127',62],
 ]){const s=subnet(ip,prefix);assert.equal(s.network,network);assert.equal(s.broadcast,broadcast);assert.equal(s.hosts,hosts);assert.equal(s.assignable,true)}
});
test('全プレフィックスの境界と入力の正規化',()=>{
 for(let prefix=24;prefix<=30;prefix++){
  const size=2**(32-prefix);
  for(let last=0;last<256;last++){
   const s=subnet(`192.168.1.${last}`,prefix);
   assert.equal(s.network,`192.168.1.${Math.floor(last/size)*size}`);
   assert.equal(s.assignable,last%size!==0&&last%size!==size-1);
   assert.equal(ipv4Number(s.broadcast)-ipv4Number(s.network),size-1);
  }
 }
 assert.equal(subnet('１９２．１６８．１．１２０',24).ip,'192.168.1.120');
 assert.equal(normalize(' ６２ '),'62');
 for(const bad of ['256.1.1.1','1.2.3','1.2.3.-1','a.2.3.4','1..3.4'])assert.equal(subnet(bad,24),null);
 assert.equal(subnet('192.168.1.1',31),null);
 assert.equal(ipText(ipv4Number('255.255.255.255')),'255.255.255.255');
 assert.equal(maskPrefix('255.255.240.0'),20);
 assert.equal(maskPrefix('２５５．２５５．２５５．１２８'),25);
 assert.equal(maskPrefix('255.0.255.0'),null);
 const wide=subnet('10.12.35.7',20);
 assert.equal(wide.network,'10.12.32.0');assert.equal(wide.broadcast,'10.12.47.255');
});
test('NAPT: 登録するまで表は空、返事のポートとIPが正しく対応する',()=>{
 assert.equal(naptState(0).entries.length,0);assert.equal(naptState(1).entries.length,0);
 assert.equal(naptState(2).entries.length,1);assert.equal(naptState(4).entries.length,2);
 assert.equal(naptEntries[0].inside,naptEntries[1].inside);
 assert.notEqual(naptEntries[0].outside,naptEntries[1].outside);
 assert.equal(naptState(2).source,'203.0.113.1:50000');
 assert.equal(naptState(4).source,'203.0.113.1:60000');
 assert.equal(naptState(5).destination,'203.0.113.1:60000');
 assert.equal(naptState(6).destination,'192.168.1.121:51000');
 assert.equal(naptState(6).receivedA,false);assert.equal(naptState(6).receivedB,true);
 assert.equal(naptState(7).destination,'203.0.113.1:50000');
 assert.equal(naptState(8).destination,'192.168.1.120:51000');
 assert.equal(naptState(8).receivedA,true);
 assert.equal(naptState(5).receivedB,false,'戻れば未受信の状態に戻る');
});
test('DNS: 紹介はDNSに返り、回答前にWeb通信しない',()=>{
 for(const mode of ['cold','warm']){
  const s=dnsSteps(mode),answer=s.findIndex(x=>x.known),web=s.findIndex(x=>x.kind==='web');
  assert(answer>0&&web>answer);
  assert.equal(s.at(-1).from,'Web');assert.equal(s.at(-1).to,'端末');
 }
 assert(dnsSteps('cold').filter(x=>x.kind==='referral').every(x=>x.to==='DNS'));
 assert(dnsSteps('cold').some(x=>x.to==='.jp'));
 assert(dnsSteps('cold').some(x=>x.message.includes('192.0.2.53')));
 assert(!dnsSteps('warm').some(x=>x.to==='ルート'||x.to==='.jp'||x.to==='example.jp'));
 assert(!dnsSteps('cold','www.other.example.jp','198.51.100.81','example').some(x=>x.to==='ルート'||x.to==='.jp'));
 assert(dnsSteps('cold','www.other.example.jp','198.51.100.81','example').some(x=>x.to==='example.jp'));
 assert(!dnsSteps('cold','www.other.example.jp','198.51.100.81','jp').some(x=>x.to==='ルート'));
 assert(!dnsSteps('missing').some(x=>x.known||x.kind==='web'));
 assert.equal(dnsSteps('missing').at(-1).kind,'error');
});
test('経路は具体的一致を優先、2方式は同じ9個を異なる順番で送る',()=>{
 assert.equal(routeFor('198.51.100.80').next,'ルータB');
 assert.equal(routeFor('192.168.1.120').next,'LANへ直接');
 assert.equal(routeFor('203.0.113.25').next,'ルータC');
 assert.equal(routeFor('192.0.2.80').next,'ルータD');
 for(const slots of [circuitSlots,packetSlots]){
  assert.deepEqual([...slots].sort(),['A1','A2','A3','B1','B2','B3','C1','C2','C3']);
 }
 assert.equal(circuitSlots.indexOf('A3'),2);
 assert.equal(packetSlots.indexOf('A3'),6);
 assert.equal(circuitSlots.indexOf('C1'),6);
 assert.equal(packetSlots.indexOf('C1'),2);
});
test('用語は重複せず対応する節に置き、数値の答えは用語一覧に並べない',()=>{assert.equal(new Set(terms.map(t=>t[0])).size,terms.length);assert(terms.every(t=>t[3]>=1&&t[3]<=5));assert.equal(terms.find(t=>t[0]==='⑧')?.[3],3);assert(!terms.some(t=>t[1]==='32'||t[1]==='128'));});
