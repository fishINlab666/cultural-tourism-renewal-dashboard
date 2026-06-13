import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  LocalAnalysisProvider,
  calculateCostRange,
  calculateScenarioEnvelope,
  canEnterStep,
  invalidateProjectDependentState,
  validateProject,
} from '../analysis.mjs';
import { createInitialState, sampleData } from '../data.mjs';

test('existing growth-plan cost formula keeps its baseline result', () => {
  const growth = sampleData.plans.find((plan) => plan.id === 'growth');
  const result = calculateCostRange(sampleData.project, sampleData.costs, growth);

  assert.equal(Math.round(result.low), 163);
  assert.equal(Math.round(result.high), 367);
});

test('scenario envelope summarizes all plans before selection', () => {
  const envelope = calculateScenarioEnvelope(sampleData.project, sampleData.costs, sampleData.plans);

  assert.equal(envelope.investment.low, 380);
  assert.equal(envelope.investment.high, 1280);
  assert.equal(envelope.payback.low, 3.2);
  assert.equal(envelope.payback.high, 3.9);
  assert.ok(envelope.cost.low < envelope.cost.high);
});

test('project validation identifies missing and invalid workbook values', () => {
  const issues = validateProject({
    name: '',
    type: '古建院落活化',
    location: '',
    area: -1,
    vacancy: 130,
    heritage: '历史建筑',
    budget: 0,
    paybackTarget: 3,
    audience: '文旅主管部门',
    stylePreference: '',
  });

  assert.deepEqual(issues.map((issue) => issue.field), [
    'name',
    'location',
    'area',
    'vacancy',
    'budget',
    'stylePreference',
  ]);
});

test('workflow blocks analysis before confirmation and blocks visuals before plan selection', () => {
  const state = createInitialState();
  assert.equal(state.project.name, '');
  assert.equal(canEnterStep(2, state), false);
  assert.equal(canEnterStep(3, state), false);

  state.importStatus = 'parsed';
  state.completedSteps = [1];
  assert.equal(canEnterStep(2, state), true);
  state.intakeConfirmed = true;
  state.completedSteps = [1, 2, 3, 4, 5];
  assert.equal(canEnterStep(3, state), true);
  assert.equal(canEnterStep(7, state), false);

  state.selectedPlanId = 'growth';
  state.completedSteps.push(6);
  assert.equal(canEnterStep(7, state), true);
});

test('validation rejects blank numbers and non-template enum values', () => {
  const issues = validateProject({
    ...sampleData.project,
    type: '任意自定义类型',
    vacancy: '',
    heritage: '未知等级',
    audience: '未知客群',
  });

  assert.deepEqual(issues.map((issue) => issue.field), ['type', 'vacancy', 'heritage', 'audience']);
});

test('editing confirmed intake invalidates all dependent analysis and decisions', () => {
  const invalidated = invalidateProjectDependentState({
    ...createInitialState(),
    intakeConfirmed: true,
    completedSteps: [1, 2, 3, 4, 5, 6, 7],
    selectedPlanId: 'growth',
    analysisRun: { status: 'completed' },
    analysisResult: { diagnostics: [] },
  });

  assert.equal(invalidated.intakeConfirmed, false);
  assert.deepEqual(invalidated.completedSteps, [1]);
  assert.equal(invalidated.selectedPlanId, null);
  assert.equal(invalidated.analysisRun, null);
  assert.equal(invalidated.analysisResult, null);
});

test('local provider returns versioned evidence-backed diagnostics', async () => {
  const provider = new LocalAnalysisProvider(sampleData);
  const result = await provider.analyze(sampleData.project);

  assert.equal(result.run.status, 'completed');
  assert.match(result.run.knowledgeVersion, /^KB-/);
  assert.match(result.run.ruleVersion, /^RULE-/);
  assert.match(result.run.modelVersion, /^LOCAL-/);
  assert.ok(result.diagnostics.length > 0);
  assert.ok(result.diagnostics.every((item) => item.evidence.length > 0));
  assert.ok(result.diagnostics.every((item) => item.reviewNote));
});
