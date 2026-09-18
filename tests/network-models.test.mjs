import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { networkResult, transferState, terms, questions } from '../app/units/05-01/networkModel.ts';
test('校内の通信は校外回線に依存せず、LAN切断はすべて止める',()=>{
 for(const local of [false,true]) for(const uplink of [false,true]) {
  assert.equal(networkResult(local,uplink,'local').ok,local);
  assert.equal(networkResult(local,uplink,'web').ok,local&&uplink);
 }
});
test('送受信でカプセル化が逆順になり、全情報を取り除いた後に表示される',()=>{
 assert.deepEqual(Array.from({length:9},(_,i)=>transferState(i).depth),[0,1,2,3,4,3,2,1,0]);
 for(let i=0;i<8;i++) assert.equal(transferState(i).delivered,false);
 assert.equal(transferState(8).delivered,true);
});
test('プリント21空欄を重複なく扱い、各問の選択肢と解説が対応する',()=>{
 assert.equal(terms.length,21); assert.equal(new Set(terms.map(t=>t.blank)).size,21); assert.equal(questions.length,24);
 for(const q of questions){assert.equal(new Set(q.choices).size,3);assert.equal(q.feedback.length,3);assert.ok(q.answer>=0&&q.answer<3);}
 for(let i=0;i<21;i++) assert.equal(questions[i].choices[questions[i].answer],terms[i].name);
});
