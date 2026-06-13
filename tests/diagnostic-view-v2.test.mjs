import { test } from 'node:test';
import assert from 'node:assert/strict';

import { LocalAnalysisProvider } from '../analysis.mjs';
import { sampleData } from '../data.mjs';

test('local analysis exposes the Sanfang Qixiang diagnostic overview', async () => {
  const result = await new LocalAnalysisProvider(sampleData).analyze(sampleData.project);

  assert.equal(result.overview.score, 82);
  assert.deepEqual(result.overview.map.center, [119.2965, 26.0875]);
  assert.equal(result.overview.map.label, '当前项目中心点');
  assert.deepEqual(result.overview.conclusions.map((item) => item.level), ['positive', 'review', 'caution']);
});

test('radar mapping keeps the required axis order and reverses implementation difficulty', async () => {
  const diagnosticView = await import('../diagnostic-view.mjs').catch(() => ({}));

  assert.equal(typeof diagnosticView.buildRadarData, 'function');
  assert.deepEqual(diagnosticView.buildRadarData(sampleData.diagnostics), [
    { name: '区位潜力', value: 88 },
    { name: '文化适配', value: 91 },
    { name: '改造难度', value: 24 },
    { name: '商业承载', value: 82 },
    { name: '夜间潜力', value: 73 },
    { name: '投资谨慎', value: 43 },
  ]);
});

test('Mapbox activation requires both a runtime token and the library', async () => {
  const diagnosticView = await import('../diagnostic-view.mjs').catch(() => ({}));

  assert.equal(typeof diagnosticView.canUseMapbox, 'function');
  assert.equal(diagnosticView.canUseMapbox({}, {}), false);
  assert.equal(diagnosticView.canUseMapbox({ mapboxAccessToken: 'public-token' }, {}), false);
  assert.equal(diagnosticView.canUseMapbox({}, { Map: class {} }), false);
  assert.equal(diagnosticView.canUseMapbox({ mapboxAccessToken: 'public-token' }, { Map: class {} }), true);
});
