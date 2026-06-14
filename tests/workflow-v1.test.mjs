import { readFile, access } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const requiredFiles = [
  'index.html',
  'styles.css',
  'app.js',
  'analysis.mjs',
  'data.mjs',
  'workbook.mjs',
  'storage.mjs',
];

const orderedSteps = [
  '项目录入',
  '数据补全',
  '空间诊断',
  '工程造价',
  '投资测算',
  '三案选择',
  '视觉深化',
  '报告交付',
];

async function read(fileName) {
  return readFile(new URL(fileName, root), 'utf8');
}

test('V1 exposes the eight-step client workflow in business order', async () => {
  const html = await read('index.html');
  let cursor = -1;

  for (const step of orderedSteps) {
    const next = html.indexOf(step);
    assert.ok(next > cursor, `${step} should appear after the previous step`);
    cursor = next;
  }

  assert.match(html, /data-step-panel="1"/);
  assert.match(html, /data-step-panel="8"/);
  assert.match(html, /id="previousStepButton"/);
  assert.match(html, /id="nextStepButton"/);
});

test('V1 provides a real Excel intake and a correction surface', async () => {
  const html = await read('index.html');
  await access(new URL('assets/项目基础数据模板.xlsx', root));

  assert.match(html, /href="assets\/项目基础数据模板\.xlsx"/);
  assert.match(html, /accept="\.xlsx,application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet"/);
  assert.match(html, /id="workbookIssues"/);
  assert.match(html, /id="projectCorrectionForm"/);
  assert.match(html, /不会自动进入集团案例库/);
  assert.match(html, /不会用于模型训练/);
});

test('V1 keeps scenarios behind analysis and does not preselect a recommendation', async () => {
  const html = await read('index.html');
  const source = await read('app.js');
  const data = await read('data.mjs');

  assert.ok(html.indexOf('工程造价') < html.indexOf('三案选择'));
  assert.ok(html.indexOf('投资测算') < html.indexOf('三案选择'));
  assert.doesNotMatch(html, /推荐方案[\s\S]{0,80}校园扩展型/);
  assert.match(data, /selectedPlanId:\s*null/);
  assert.match(source, /canEnterStep/);
});

test('V1 includes evidence, versioning and provider boundaries', async () => {
  const files = await Promise.all(requiredFiles.map(read));
  const combined = files.join('\n');

  for (const name of ['LocalAnalysisProvider', 'RemoteAnalysisProvider', 'AnalysisRun', 'EvidenceReference']) {
    assert.match(combined, new RegExp(name), `${name} should be represented`);
  }

  assert.match(combined, /集团知识库/);
  assert.match(combined, /规则版本/);
  assert.match(combined, /模型版本/);
  assert.match(combined, /人工复核/);
});

test('V1 remains local-only and contains no client-side secrets or database connections', async () => {
  const files = await Promise.all(requiredFiles.map(read));
  const combined = files.join('\n');

  assert.doesNotMatch(combined, /\bfetch\s*\(/);
  assert.doesNotMatch(combined, /XMLHttpRequest/);
  assert.doesNotMatch(combined, /https?:\/\//);
  assert.doesNotMatch(combined, /(?:api[_-]?key|password|secret)\s*[:=]\s*['"][^'"]+/i);
  assert.doesNotMatch(combined, /(?:postgres|mysql|mongodb):\/\//i);
});

test('V1 includes print-first PDF delivery and responsive workflow styles', async () => {
  const html = await read('index.html');
  const css = await read('styles.css');

  assert.match(html, /id="printReportButton"/);
  assert.match(css, /@media print/);
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.match(css, /\.step-panel\[hidden\]/);
});

test('V2 space diagnosis uses a result-first map workbench', async () => {
  const html = await read('index.html');
  const css = await read('styles.css');

  for (const id of [
    'diagnosticWorkbench',
    'projectMap',
    'overallScore',
    'diagnosticRadar',
    'diagnosticConclusions',
    'diagnosticEvidence',
    'analysisVersion',
  ]) {
    assert.match(html, new RegExp(`id="${id}"`), `${id} should exist in the diagnosis step`);
  }

  assert.match(css, /\.diagnostic-workbench\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*3fr\)\s+minmax\(320px,\s*2fr\)/s);
  assert.match(css, /Source Han Serif SC/);
  assert.match(css, /\.project-map\.is-fallback/);
  assert.match(css, /\.conclusion-item\.is-positive/);
  assert.match(css, /\.conclusion-item\.is-review/);
  assert.match(css, /\.conclusion-item\.is-caution/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.diagnostic-workbench\s*\{[^}]*grid-template-columns:\s*1fr/);
  assert.match(css, /(?:^|\n)\[hidden\]\s*\{\s*display:\s*none\s*!important;\s*\}/);
});

test('V2 loads local chart and map libraries without embedding a Mapbox token', async () => {
  const html = await read('index.html');

  await Promise.all([
    access(new URL('vendor/echarts.min.js', root)),
    access(new URL('vendor/mapbox-gl.js', root)),
    access(new URL('vendor/mapbox-gl.css', root)),
    access(new URL('vendor/LICENSE.echarts.txt', root)),
    access(new URL('vendor/LICENSE.mapbox-gl.txt', root)),
  ]);

  assert.match(html, /href="vendor\/mapbox-gl\.css"/);
  assert.match(html, /src="vendor\/mapbox-gl\.js"/);
  assert.match(html, /src="vendor\/echarts\.min\.js"/);
  assert.match(html, /window\.APP_CONFIG/);
  assert.doesNotMatch(html, /pk\.[A-Za-z0-9._-]{20,}/);
});

test('V2 investment step exposes the three-slider sandbox and KPI donut layout', async () => {
  const html = await read('index.html');
  const css = await read('styles.css');

  assert.match(html, /id="investmentSandbox"/);
  assert.match(html, /id="sandboxBudget"[^>]*type="range"[^>]*min="300"[^>]*max="1000"[^>]*step="10"/);
  assert.match(html, /id="sandboxTicketPrice"[^>]*type="range"[^>]*min="40"[^>]*max="120"[^>]*step="5"/);
  assert.match(html, /id="sandboxVacancy"[^>]*type="range"[^>]*min="10"[^>]*max="60"[^>]*step="1"/);

  for (const id of ['totalInvestmentKpi', 'annualNetCashFlowKpi', 'paybackKpi', 'roi5Kpi', 'revenueMix', 'revenueLegend']) {
    assert.match(html, new RegExp(`id="${id}"`), `${id} should exist on the investment step`);
  }

  assert.match(html, /演示试算，不构成投资承诺/);
  assert.match(css, /\.investment-sandbox-layout\s*\{[^}]*grid-template-columns:\s*minmax\(280px,\s*\.72fr\)\s+minmax\(0,\s*1\.28fr\)/s);
  assert.match(css, /\.investment-kpi-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.investment-sandbox-layout\s*\{[^}]*grid-template-columns:\s*1fr/);
});

test('V2 visual deepening exposes comparison tabs and cost-linked material hotspots', async () => {
  const html = await read('index.html');

  await Promise.all([
    'courtyard-day-before.png',
    'courtyard-day-after.png',
    'courtyard-night-before.png',
    'courtyard-night-after.png',
  ].map((fileName) => access(new URL(`assets/visual-deepening/${fileName}`, root))));

  for (const id of [
    'visualSummary', 'visualModeButtons', 'visualComparison', 'visualSplit',
    'visualBeforeImage', 'visualAfterImage', 'visualMaterialPanel',
    'visualHotspots', 'visualBudgetDetail', 'visualAllocationBar',
  ]) assert.match(html, new RegExp(`id="${id}"`));

  assert.match(html, /role="tablist"/);
  assert.match(html, /role="slider"|type="range"/);
  assert.match(html, /AI 概念模拟，非现场实拍/);
});
