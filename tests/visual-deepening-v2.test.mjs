import { test } from 'node:test';
import assert from 'node:assert/strict';

import { calculateCostRange } from '../analysis.mjs';
import { sampleData } from '../data.mjs';
import {
  buildVisualBudget,
  clampVisualSplit,
  getVisualImageSet,
  reduceVisualState,
} from '../visual-deepening.mjs';

test('visual budget maps every existing cost row into six customer-facing hotspots', () => {
  const plan = sampleData.plans.find((item) => item.id === 'growth');
  const cost = calculateCostRange(sampleData.project, sampleData.costs, plan);
  const budget = buildVisualBudget(cost.rows);

  assert.deepEqual(budget.items.map((item) => item.id), [
    'survey', 'restoration', 'infrastructure', 'courtyard', 'lighting', 'experience',
  ]);
  assert.equal(Math.round(budget.low), Math.round(cost.low));
  assert.equal(Math.round(budget.high), Math.round(cost.high));
  assert.equal(budget.items.reduce((sum, item) => sum + item.percent, 0), 100);
});

test('visual budget never invents an amount for a missing cost category', () => {
  const budget = buildVisualBudget([{ category: '院落与景观提升', low: 12, high: 20 }]);
  const survey = budget.items.find((item) => item.id === 'survey');

  assert.equal(survey.status, 'missing');
  assert.equal(survey.low, null);
  assert.equal(survey.high, null);
});

test('comparison split is clamped to the full image bounds', () => {
  assert.equal(clampVisualSplit(-8), 0);
  assert.equal(clampVisualSplit(64), 64);
  assert.equal(clampVisualSplit(140), 100);
});

test('day and night modes resolve to matching local asset pairs', () => {
  assert.deepEqual(getVisualImageSet('night'), {
    before: 'assets/visual-deepening/courtyard-night-before.png',
    after: 'assets/visual-deepening/courtyard-night-after.png',
  });
});

test('tab changes preserve the split and selected budget item', () => {
  const state = reduceVisualState(
    { mode: 'day', split: 63, selectedBudgetId: 'courtyard' },
    { type: 'mode', value: 'night' },
  );

  assert.deepEqual(state, { mode: 'night', split: 63, selectedBudgetId: 'courtyard' });
});
