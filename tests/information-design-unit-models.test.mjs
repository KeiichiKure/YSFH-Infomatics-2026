import test from 'node:test';
import assert from 'node:assert/strict';
import { median, fiveNumbers, shares, rankProjects } from '../app/units/02-05/components/designModels.ts';
import {iceMonths,weatherMax,internetUse} from '../app/units/02-05/components/realData.ts';
import { terms, sections, projects } from '../app/units/02-05/components/lessonData.ts';
test('same median, different distributions and non-mutating sort', () => {
  const a=[6,2,5,3,4], before=[...a];
  assert.deepEqual(fiveNumbers(a),[2,2.5,4,5.5,6]);
  assert.deepEqual(fiveNumbers([1,2,4,8,10]),[1,1.5,4,9,10]);
  assert.deepEqual(a,before);
  assert.equal(median([4,1,2,3]),2.5);
  assert.deepEqual(fiveNumbers([2,6]),[2,2,4,6,6]);
  assert.throws(()=>median([])); assert.throws(()=>fiveNumbers([1,NaN]));
});
test('votes yield 100% and zero counts do not yield NaN',()=>{
  assert.deepEqual(shares([24,18,12,6]),[40,30,20,10]);
  assert.deepEqual(shares([0,0]),[0,0]);
  assert.throws(()=>shares([-1,3])); assert.throws(()=>shares([Infinity]));
});
test('LATCH sorts without losing cards or mutating the source',()=>{
  const original=JSON.stringify(projects);
  for(let mode=0;mode<5;mode++) assert.deepEqual(rankProjects(projects,mode).map(p=>p.name).sort(), projects.map(p=>p.name).sort());
  assert.equal(rankProjects(projects,4)[0].name,'プログラム展');
  assert.equal(rankProjects(projects,2).at(-1).time,'15:30');
  assert.equal(JSON.stringify(projects),original);
});
test('all 32 blanks occur exactly once in canonical term data',()=>{
  const blanks=terms.flatMap(t=>t.worksheetBlanks);
  assert.equal(blanks.length,32); assert.equal(new Set(blanks).size,32);
  for(let i=0;i<32;i++)assert(blanks.includes(String.fromCodePoint(i<20?0x2460+i:0x3251+i-20)));
  assert.equal(new Set(terms.map(t=>t.term)).size,terms.length);
});
test('review links use actual sections and definitions contain no worksheet answer instructions',()=>{
  for(const t of terms){
    assert.equal(t.sectionId,sections[t.sectionNumber-1].id);
    assert(!/[①-⑳㉑-㉜]/u.test(t.term+t.definition+t.example));
    assert(!/プリントの空欄|空欄の答え/u.test(t.definition));
  }
});

test('120 published monthly records are correctly transcribed and fit labelled axes',()=>{
 assert.equal(iceMonths.length,120);assert.equal(new Set(iceMonths.map(x=>x.month)).size,120);
 assert.deepEqual(iceMonths[0],{month:'2014-01',temperature:10.6,expense:404});
 assert.deepEqual(iceMonths.at(-1),{month:'2023-12',temperature:14.3,expense:715});
 assert(iceMonths.every(x=>x.temperature>=0&&x.temperature<=40&&x.expense>=0&&x.expense<=2000));
 const mx=iceMonths.reduce((s,p)=>s+p.temperature,0)/120,my=iceMonths.reduce((s,p)=>s+p.expense,0)/120;
 const cov=iceMonths.reduce((s,p)=>s+(p.temperature-mx)*(p.expense-my),0);
 const vx=iceMonths.reduce((s,p)=>s+(p.temperature-mx)**2,0),vy=iceMonths.reduce((s,p)=>s+(p.expense-my)**2,0);
 assert(cov/Math.sqrt(vx*vy)>0.8);
});
test('daily observations and survey values match the displayed claims',()=>{
 assert.equal(weatherMax.tokyo.length,31);assert.equal(weatherMax.naha.length,31);
 assert.equal(weatherMax.tokyo.filter(v=>v>=35).length,7);assert.equal(weatherMax.naha.filter(v=>v>=35).length,0);
 assert(Math.abs(internetUse.high[1]-internetUse.middle[1]-11.9)<1e-9);
 assert(internetUse.middle[3]>internetUse.high[3]);
 for(const row of [internetUse.middle,internetUse.high])assert(row.every(v=>v>=0&&v<=100));
});
test('section hierarchy follows the three information-design techniques',()=>{
 assert.equal(sections.length,5);assert.equal(terms.find(t=>t.term==='可視化').sectionNumber,2);assert.equal(terms.find(t=>t.term==='構造化').sectionNumber,3);assert.equal(terms.find(t=>t.term==='抽象化').sectionNumber,4);
});
