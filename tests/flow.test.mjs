import test from 'node:test';
import assert from 'node:assert/strict';
import { startSession, submitAnswer, stopSession, formatReport } from '../src/lib/flow.ts';

const issue = 'My Windows 11 laptop loses Wi-Fi after waking from sleep.';
const choose = (session, ...values) => values.reduce((current, value) => submitAnswer(current, value), session);

test('laptop-specific branch requires wake confirmation to report working', () => {
  const beforeWake = choose(startSession(issue), 'otherWorks', 'disconnected', 'visible', 'works');
  assert.equal(beforeWake.step, 'repeatWake');
  assert.equal(beforeWake.outcome, null);
  const finished = submitAnswer(beforeWake, 'works');
  assert.equal(finished.outcome, 'working');
  assert.match(formatReport(finished), /Working in this test/);
  assert.match(formatReport(finished), /cause remains unknown/);
});

test('shared outage is routed to network follow-up', () => {
  const finished = choose(startSession(issue), 'neither', 'yes', 'happening');
  assert.equal(finished.outcome, 'escalate');
  assert.match(formatReport(finished), /network owner/);
});

test('unable to compare stays inconclusive when status is unavailable', () => {
  const finished = choose(startSession(issue), 'unknown', 'unknown', 'unknown');
  assert.equal(finished.outcome, 'inconclusive');
  assert.match(formatReport(finished), /Could not test \/ not sure/);
});

test('cross-network result remains visible but cannot be treated as proof; retry is bounded', () => {
  const first = choose(startSession(issue), 'neither', 'no');
  assert.equal(first.step, 'comparison');
  assert.equal(first.evidence[0].validity, 'invalid');
  const finished = choose(first, 'neither', 'no');
  assert.equal(finished.outcome, 'inconclusive');
  assert.equal(finished.evidence.filter(item => item.step === 'comparison' && item.validity === 'invalid').length, 2);
  assert.match(formatReport(finished), /invalid comparison/);
});

test('wrong laptop network invalidates comparison and permits manual correction', () => {
  const beforeCorrection = choose(startSession(issue), 'otherWorks', 'noInternet', 'no');
  assert.equal(beforeCorrection.step, 'switchNetwork');
  assert.equal(beforeCorrection.evidence[0].validity, 'invalid');
  const finished = choose(beforeCorrection, 'switched', 'bothFail');
  assert.equal(finished.outcome, 'escalate');
});

test('early stop creates an honest partial report', () => {
  const stopped = stopSession(startSession(issue));
  assert.equal(stopped.outcome, 'stopped');
  assert.match(formatReport(stopped), /No checks completed/);
});

test('unexpected choices are refused without changing state', () => {
  const original = startSession(issue);
  assert.throws(() => submitAnswer(original, 'pretendFixed'), /valid result/);
  assert.equal(original.evidence.length, 0);
});
