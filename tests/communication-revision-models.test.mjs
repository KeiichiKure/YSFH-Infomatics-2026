import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { analyzeBikeRows, selectBikeRows, defaultBikeFilters } from '../app/units/02-04/components/bikeDataModels.ts';
import { planningCases, proposeCommunication } from '../app/units/02-04/components/planningModels.ts';
import { recipientThought, sendMail, initialAssignment } from '../app/units/02-04/components/communicationModels.ts';

const data = JSON.parse(readFileSync(new URL('../public/data/02-04/bike-hour.json', import.meta.url)));
const csv = readFileSync(new URL('../public/data/02-04/hour.csv', import.meta.url));
test('real hourly dataset is complete and exactly matches the preserved source columns', () => {
  assert.equal(createHash('sha256').update(csv).digest('hex'), 'e03de4ee4ef4dc376ac6e04bf829673c6269e8eba5c60fa121640fa2f829504f');
  const [header, ...rows] = csv.toString('utf8').trim().split(/\r?\n/).map(s => s.split(','));
  const indices = ['dteday', 'hr', 'workingday', 'weathersit', 'temp', 'cnt', 'casual', 'registered'].map(c => header.indexOf(c));
  const expected = rows.map(row => indices.map((index, i) => i === 0 ? row[index] : Number(row[index])));
  assert.deepEqual(data.records, expected);
  assert.equal(data.rowCount, 17379); assert.equal(data.rentalTotal, 3292679);
  assert.equal(data.records.reduce((n, r) => n + r[5], 0), 3292679);
  assert.ok(data.records.every(r => r[5] === r[6] + r[7]));
});
test('filters use observed hours and weather codes 3/4 both belong to rain/snow', () => {
  const rain = selectBikeRows(data.records, { ...defaultBikeFilters, weather: '3' });
  assert.equal(rain.length, 1422); assert.equal(rain.reduce((s, r) => s + r[5], 0), 158554);
  const firstYear = selectBikeRows(data.records, { ...defaultBikeFilters, year: '2011' });
  assert.equal(firstYear.length, 8645); assert.equal(firstYear.reduce((s, r) => s + r[5], 0), 1243103);
  const holidays = selectBikeRows(data.records, { ...defaultBikeFilters, work: '0' });
  assert.equal(holidays.length, 5514);
});
test('means divide by observed hours and grouped totals conserve every observation', () => {
  for (const mode of ['hour', 'weather', 'temperature']) {
    const result = analyzeBikeRows(data.records, defaultBikeFilters, mode);
    assert.equal(result.groups.reduce((n, g) => n + g.hours, 0), 17379);
    assert.equal(result.groups.reduce((n, g) => n + g.rentals, 0), 3292679);
    assert.equal(result.mean, 3292679 / 17379);
  }
  const weather = analyzeBikeRows(data.records, defaultBikeFilters, 'weather');
  assert.deepEqual(weather.groups.map(g => g.hours), [11413, 4544, 1422]);
  assert.ok(weather.groups[0].mean > weather.groups[2].mean);
  const empty = analyzeBikeRows([], defaultBikeFilters, 'hour');
  assert.equal(empty.mean, null); assert.ok(empty.groups.every(g => g.mean === null));
});
test('planning gives benefits, constraints and examples without inventing direct asynchronous conversation', () => {
  for (let i = 0; i < planningCases.length; i++) for (const place of ['直接', '間接']) for (const time of ['同期', '非同期']) {
    const proposal = proposeCommunication(i, place, time);
    for (const field of ['method', 'merit', 'caution', 'example']) assert.ok(proposal[field].length > 8);
    if (place === '直接' && time === '非同期') assert.match(proposal.caution, /対面の会話そのものは同期/);
  }
});
test('recipient interpretation follows delivered roles and the actual reply request', () => {
  const sent = sendMail(initialAssignment);
  assert.match(recipientThought(sent, 'A'), /自分宛て/);
  assert.match(recipientThought(sent, 'B'), /返信しよう/);
  assert.match(recipientThought(sent, 'C'), /この本文なら返信は求められていない/);
  assert.match(recipientThought(sent, 'F'), /他の受信者には表示されない/);
  const edited = sendMail({ ...initialAssignment, B: 'NONE', C: 'TO' });
  assert.match(recipientThought(edited, 'B'), /受け取っていません/);
  assert.match(recipientThought(edited, 'C'), /返信依頼はBさん宛て/);
  for (const role of ['TO', 'CC', 'BCC']) {
    assert.match(recipientThought(sendMail({ ...initialAssignment, B: role }), 'B'), /返信しよう/);
  }
});
