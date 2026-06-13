const RADAR_AXES = [
  { name: '区位潜力', source: '区位与导流潜力' },
  { name: '文化适配', source: '文化适配度' },
  { name: '改造难度', source: '工程可实施性', transform: (value) => 100 - value },
  { name: '商业承载', source: '商业承载力' },
  { name: '夜间潜力', source: '夜间运营潜力' },
  { name: '投资谨慎', source: '投资谨慎指数' },
];

const clampScore = (value) => Math.max(0, Math.min(100, Number(value) || 0));

export function buildRadarData(diagnostics = []) {
  const valuesByLabel = new Map(diagnostics.map((item) => [item.label, clampScore(item.value)]));
  return RADAR_AXES.map((axis) => {
    const value = valuesByLabel.get(axis.source) ?? 0;
    return { name: axis.name, value: clampScore(axis.transform ? axis.transform(value) : value) };
  });
}

export function canUseMapbox(config = {}, mapboxLibrary = {}) {
  return Boolean(String(config.mapboxAccessToken ?? '').trim() && typeof mapboxLibrary.Map === 'function');
}
