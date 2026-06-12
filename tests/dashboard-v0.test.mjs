import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const requiredFiles = ['index.html', 'styles.css', 'app.js'];
const requiredModules = [
  '项目输入',
  '数据补全',
  '空间诊断',
  '三案比选',
  '工程造价',
  '投资测算',
  '视觉方案',
  '报告输出',
];

async function readRequiredFile(fileName) {
  try {
    return await readFile(new URL(`../${fileName}`, import.meta.url), 'utf8');
  } catch (error) {
    assert.fail(`${fileName} should exist for the static dashboard V0`);
  }
}

test('dashboard V0 exposes the required single-page modules', async () => {
  const html = await readRequiredFile('index.html');

  for (const moduleName of requiredModules) {
    assert.match(html, new RegExp(moduleName), `${moduleName} module should be visible`);
  }

  assert.match(html, /styles\.css/, 'index.html should load the local stylesheet');
  assert.match(html, /app\.js/, 'index.html should load the local script');
});

test('dashboard V0 stays local and uses sample data only', async () => {
  const fileContents = await Promise.all(requiredFiles.map(readRequiredFile));
  const combined = fileContents.join('\n');

  assert.doesNotMatch(combined, /\bfetch\s*\(/, 'V0 should not call network APIs');
  assert.doesNotMatch(combined, /XMLHttpRequest/, 'V0 should not call network APIs');
  assert.doesNotMatch(combined, /https?:\/\//, 'V0 should not load external URLs');
  assert.match(combined, /sampleData/, 'app.js should expose local sample data');
});

test('dashboard V0 presents an interactive Google-style workspace instead of image-led BI', async () => {
  const fileContents = await Promise.all(requiredFiles.map(readRequiredFile));
  const combined = fileContents.join('\n');

  assert.doesNotMatch(combined, /初步demo/, 'visual module should not reuse the local BI screenshots');
  assert.doesNotMatch(combined, /<img\b/, 'visual module should be interface-led, not image-led');
  assert.match(combined, /workspace-rail/, 'page should include an interactive workflow rail');
  assert.match(combined, /visual-canvas/, 'page should include a generated-style visual canvas');
  assert.match(combined, /visualModeButtons/, 'page should expose visual mode controls');
  assert.match(combined, /Google-style|Google/);
});

test('dashboard V0 is tailored for sustainable innovation judging and investment review', async () => {
  const fileContents = await Promise.all(requiredFiles.map(readRequiredFile));
  const combined = fileContents.join('\n');

  assert.match(combined, /创新赛/, 'page should present the innovation competition context');
  assert.match(combined, /可持续|环保|碳/, 'page should foreground sustainability signals');
  assert.match(combined, /评委/, 'page should address judges as a target audience');
  assert.match(combined, /投资方/, 'page should address investors as a target audience');
  assert.match(combined, /Material You|MD3|Google 生态/, 'page should declare the Google Material design direction');
});
