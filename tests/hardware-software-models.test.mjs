import test from 'node:test';
import assert from 'node:assert/strict';
import { worksheetTerms, connections, connectionQuestions } from '../app/units/03-01/components/lessonData.ts';
import { buildResourceSchedule, canAdvancePrint, fileTypes, finalQuestions, initialIoTState, inspectRename, iotReducer, isMissionComplete } from '../app/units/03-01/components/systemModels.ts';

test('revised worksheet numbers are 1–21: interface is 3 and PDF is 21', () => {
  assert.deepEqual(worksheetTerms.map(({ number, term }) => [number, term]), [
    [1, 'ハードウェア'], [2, 'CPU'], [3, 'インタフェース'], [4, 'Type-A'], [5, 'Type-C'],
    [6, 'HDMI'], [7, 'DisplayPort'], [8, 'Bluetooth'], [9, 'NFC'], [10, 'IEEE 802.11'],
    [11, 'デバイスドライバ'], [12, 'API'], [13, 'タスク管理'], [14, '入出力管理'],
    [15, 'ファイル管理'], [16, '資源管理'], [17, 'ユーザ管理'], [18, '.jpg'], [19, '.zip'], [20, '.txt'], [21, '.pdf'],
  ]);
  assert.ok(worksheetTerms.every(term => term.section >= 1 && term.section <= 4));
  for (const item of connections.filter(item => item.number !== null)) {
    const term = worksheetTerms.find(term => term.number === item.number);
    assert.ok(item.name.includes(term.term));
  }
  for (const question of connectionQuestions) assert.equal(connections.filter(item => item.id === question.answer).length, 1);
});

test('printing pauses at driver when missing and resumes after it becomes available', () => {
  let step = 0;
  while (canAdvancePrint(step, false)) step++;
  assert.equal(step, 3);
  assert.equal(canAdvancePrint(step, true), true);
  step++;
  assert.equal(step, 4);
  assert.equal(canAdvancePrint(step, true), false);
  assert.equal(canAdvancePrint(-1, true), false);
  assert.equal(canAdvancePrint(5, true), false);
});

test('renaming all ten file types changes association, never stored content', () => {
  for (const original of fileTypes) for (const named of fileTypes) {
    const result = inspectRename(original.extension, named.extension);
    assert.equal(result.actual.format, original.format);
    assert.equal(result.associated.app, named.app);
    assert.equal(result.mismatch, original.extension !== named.extension);
  }
  assert.throws(() => inspectRename('.exe', '.pdf'), /Unknown/);
  assert.throws(() => inspectRename('.jpg', ''), /Unknown/);
});

test('resource scheduling preserves required CPU/I/O order and workload', () => {
  const expected = { A: ['cpu', 'cpu', 'cpu', 'io', 'io', 'io', 'cpu'], B: ['cpu', 'cpu', 'io', 'io', 'cpu'] };
  for (const mode of ['sequential', 'shared']) {
    const ticks = buildResourceSchedule(mode);
    for (const [job, key] of [['A', 'a'], ['B', 'b']]) {
      assert.deepEqual(ticks.map(tick => tick[key]).filter(status => status === 'cpu' || status === 'io'), expected[job]);
      for (const tick of ticks) {
        if (tick[key] === 'cpu') assert.equal(tick.cpu, job);
        if (tick[key] === 'io') assert.equal(tick.io, job);
        assert.ok(!(tick.cpu === job && tick.io === job), 'a job cannot use both resources in one tick');
      }
    }
    assert.equal(ticks.filter(tick => tick.cpu).length, 7);
    assert.equal(ticks.filter(tick => tick.io).length, 5);
  }
});

test('sharing reduces idle CPU time in this model without changing task demands', () => {
  const sequential = buildResourceSchedule('sequential');
  const shared = buildResourceSchedule('shared');
  assert.equal(sequential.length, 12);
  assert.equal(shared.length, 9);
  assert.equal(sequential.filter(tick => !tick.cpu).length, 5);
  assert.equal(shared.filter(tick => !tick.cpu).length, 2);
  assert.ok(sequential.slice(0, 7).every(tick => tick.b === 'wait'));
  assert.ok(shared.some(tick => tick.cpu === 'B' && tick.io === 'A'));
  assert.deepEqual(buildResourceSchedule('shared'), shared);
});

test('IoT sensor continues offline, remote display is stale, control fails without queuing', () => {
  const start = { ...initialIoTState };
  let state = iotReducer(start, { type: 'light', on: true });
  state = iotReducer(state, { type: 'connection', online: false });
  state = iotReducer(state, { type: 'brightness', value: 10 });
  assert.equal(state.brightness, 10);
  assert.equal(state.reportedBrightness, 60);
  assert.equal(state.lightOn, true);
  state = iotReducer(state, { type: 'light', on: false });
  assert.equal(state.lightOn, true);
  assert.match(state.message, /指示を送れません/);
  state = iotReducer(state, { type: 'connection', online: true });
  assert.equal(state.reportedBrightness, 10);
  assert.equal(state.lightOn, true, 'failed command is not silently retried');
  state = iotReducer(state, { type: 'light', on: false });
  assert.equal(state.lightOn, false);
  assert.deepEqual(start, initialIoTState, 'reducer does not mutate its input');
  assert.deepEqual(iotReducer(state, { type: 'reset' }), initialIoTState);
});

test('IoT limits and repeated connection changes keep remote readings consistent', () => {
  let state = { ...initialIoTState };
  for (const value of [-20, 0, 50, 100, 120, NaN]) {
    state = iotReducer(state, { type: 'brightness', value });
    assert.ok(state.brightness >= 0 && state.brightness <= 100);
    assert.equal(state.reportedBrightness, state.brightness);
  }
  for (let cycle = 0; cycle < 5; cycle++) {
    state = iotReducer(state, { type: 'connection', online: false });
    const lastReported = state.reportedBrightness;
    state = iotReducer(state, { type: 'brightness', value: cycle * 20 });
    assert.equal(state.reportedBrightness, lastReported);
    state = iotReducer(state, { type: 'connection', online: true });
    assert.equal(state.reportedBrightness, cycle * 20);
  }
});

test('final celebration requires all four correct answers, and disappears on correction/reset', () => {
  const correct = finalQuestions.map(question => question.answer);
  assert.equal(isMissionComplete(correct), true);
  assert.equal(isMissionComplete([]), false);
  assert.equal(isMissionComplete([null, null, null, null]), false);
  assert.equal(isMissionComplete(correct.slice(0, 3)), false);
  assert.equal(isMissionComplete([...correct, 0]), false);
  for (let index = 0; index < 4; index++) {
    const changed = [...correct];
    changed[index] = (changed[index] + 1) % finalQuestions[index].choices.length;
    assert.equal(isMissionComplete(changed), false);
    changed[index] = null;
    assert.equal(isMissionComplete(changed), false);
  }
});
