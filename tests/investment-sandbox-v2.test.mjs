import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createInitialState } from '../data.mjs';
import { loadDraft, saveDraft } from '../storage.mjs';

test('default sandbox inputs produce stable demonstration KPIs', async () => {
  const sandbox = await import('../investment-sandbox.mjs').catch(() => ({}));

  assert.equal(typeof sandbox.calculateInvestmentSandbox, 'function');
  assert.deepEqual(sandbox.calculateInvestmentSandbox({ budget: 860, ticketPrice: 80, vacancy: 40 }), {
    inputs: { budget: 860, ticketPrice: 80, vacancy: 40 },
    totalInvestment: 774,
    annualNetCashFlow: 321,
    paybackYears: 2.4,
    roi5: 107,
  });
});

test('sandbox clamps input ranges and always returns finite positive metrics', async () => {
  const sandbox = await import('../investment-sandbox.mjs').catch(() => ({}));
  const result = sandbox.calculateInvestmentSandbox({ budget: 10, ticketPrice: 999, vacancy: 90 });

  assert.deepEqual(result.inputs, { budget: 300, ticketPrice: 120, vacancy: 60 });
  for (const value of [result.totalInvestment, result.annualNetCashFlow, result.paybackYears, result.roi5]) {
    assert.equal(Number.isFinite(value), true);
  }
  assert.ok(result.totalInvestment > 0);
  assert.ok(result.annualNetCashFlow > 0);
});

test('revenue mix responds to sandbox inputs and always totals 100 percent', async () => {
  const sandbox = await import('../investment-sandbox.mjs').catch(() => ({}));
  const mix = sandbox.buildSandboxRevenueMix({ budget: 860, ticketPrice: 80, vacancy: 40 });

  assert.deepEqual(mix, [
    { name: '门票体验', value: 36 },
    { name: '空间经营', value: 35 },
    { name: '活动研学', value: 18 },
    { name: '文创商业', value: 11 },
  ]);
  assert.equal(mix.reduce((sum, item) => sum + item.value, 0), 100);
});

test('draft persistence keeps sandbox values separate from confirmed project data', () => {
  const memory = new Map();
  const storage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value),
    removeItem: (key) => memory.delete(key),
  };
  const state = createInitialState();
  state.project.budget = 860;
  state.project.vacancy = 62;
  state.investmentSandbox = { budget: 600, ticketPrice: 95, vacancy: 25 };

  saveDraft(state, storage);
  const restored = loadDraft(storage);

  assert.deepEqual(restored.investmentSandbox, { budget: 600, ticketPrice: 95, vacancy: 25 });
  assert.equal(restored.project.budget, 860);
  assert.equal(restored.project.vacancy, 62);
});
