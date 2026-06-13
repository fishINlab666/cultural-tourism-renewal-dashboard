import { test } from 'node:test';
import assert from 'node:assert/strict';

import { mapWorkbookRows, parseWorkbookBuffer } from '../workbook.mjs';
import { clearDraft, loadDraft, saveDraft } from '../storage.mjs';

test('Excel rows map Chinese template labels to normalized project fields', () => {
  const project = mapWorkbookRows([
    ['字段', '填写内容'],
    ['项目名称', '闽都古厝更新'],
    ['项目类型', '古建院落活化'],
    ['项目位置', '福州市鼓楼区'],
    ['建筑/项目面积（㎡）', '3200'],
    ['当前空置率（%）', '45'],
    ['保护与现状等级', '历史建筑'],
    ['预算上限（万元）', '980'],
    ['目标回本周期（年）', '4.5'],
    ['主要服务客群', '文旅主管部门'],
    ['初步风格方向', '低干预修缮'],
  ]);

  assert.equal(project.name, '闽都古厝更新');
  assert.equal(project.area, 3200);
  assert.equal(project.vacancy, 45);
  assert.equal(project.budget, 980);
  assert.equal(project.paybackTarget, 4.5);
});

test('generated workbook parses back into the normalized project model', async () => {
  const file = new URL('../assets/项目基础数据模板.xlsx', import.meta.url);
  const buffer = await (await import('node:fs/promises')).readFile(file);
  const project = await parseWorkbookBuffer(buffer);

  assert.equal(project.name, '榕城古厝活化示范项目');
  assert.equal(project.type, '历史街区活化');
  assert.equal(project.area, 4200);
});

test('draft storage persists normalized state but excludes raw workbook content', () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  const state = {
    schemaVersion: 1,
    currentStep: 3,
    project: { name: '测试项目' },
    workbookFileName: '资料.xlsx',
    rawWorkbook: 'must-not-persist',
  };

  saveDraft(state, storage);
  const restored = loadDraft(storage);
  assert.equal(restored.currentStep, 3);
  assert.equal(restored.project.name, '测试项目');
  assert.equal('rawWorkbook' in restored, false);

  clearDraft(storage);
  assert.equal(loadDraft(storage), null);
});
