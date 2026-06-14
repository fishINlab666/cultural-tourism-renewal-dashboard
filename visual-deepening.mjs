const VISUAL_BUDGET_DEFINITIONS = Object.freeze([
  { id: 'survey', number: 1, label: '勘测与专业评估', sources: [{ category: '勘测与数据采集', share: 1 }, { category: '专业评估与报告', share: 1 }], color: '#8A7764', anchor: [18, 72] },
  { id: 'restoration', number: 2, label: '木构与墙面修缮', sources: [{ category: '基础工程与机电', share: 0.45 }], color: '#785C48', anchor: [28, 30] },
  { id: 'infrastructure', number: 3, label: '消防与隐蔽机电', sources: [{ category: '基础工程与机电', share: 0.55 }], color: '#536B63', anchor: [76, 55] },
  { id: 'courtyard', number: 4, label: '院落铺地与绿化', sources: [{ category: '院落与景观提升', share: 1 }], color: '#356859', anchor: [50, 74] },
  { id: 'lighting', number: 5, label: '檐下与庭院照明', sources: [{ category: '数字文旅系统', share: 1 }], color: '#B28242', anchor: [67, 28] },
  { id: 'experience', number: 6, label: '可逆展陈与运营启动', sources: [{ category: '内容与运营启动', share: 1 }], color: '#A9473F', anchor: [48, 46] },
]);

function allocateDefinition(definition, rowsByCategory) {
  const sourceRows = definition.sources.map((source) => ({
    ...source,
    row: rowsByCategory.get(source.category),
  }));
  const hasAllSources = sourceRows.every(({ row }) => row && Number.isFinite(row.low) && Number.isFinite(row.high));

  if (!hasAllSources) {
    return { ...definition, status: 'missing', low: null, high: null, percent: 0 };
  }

  return {
    ...definition,
    status: 'ready',
    low: sourceRows.reduce((sum, { row, share }) => sum + row.low * share, 0),
    high: sourceRows.reduce((sum, { row, share }) => sum + row.high * share, 0),
    percent: 0,
  };
}

export function buildVisualBudget(rows = []) {
  const rowsByCategory = new Map(rows.map((row) => [row.category, row]));
  const items = VISUAL_BUDGET_DEFINITIONS.map((definition) => allocateDefinition(definition, rowsByCategory));
  const availableItems = items.filter((item) => item.status === 'ready');
  const low = availableItems.reduce((sum, item) => sum + item.low, 0);
  const high = availableItems.reduce((sum, item) => sum + item.high, 0);
  const midpointTotal = availableItems.reduce((sum, item) => sum + (item.low + item.high) / 2, 0);

  if (midpointTotal > 0) {
    for (const item of availableItems) {
      item.percent = Math.round((((item.low + item.high) / 2) / midpointTotal) * 100);
    }
    const residue = 100 - availableItems.reduce((sum, item) => sum + item.percent, 0);
    availableItems.at(-1).percent += residue;
  }

  return { low, high, items };
}
