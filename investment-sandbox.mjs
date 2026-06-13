export const DEFAULT_INVESTMENT_SANDBOX = Object.freeze({
  budget: 860,
  ticketPrice: 80,
  vacancy: 40,
});

const INPUT_LIMITS = {
  budget: [300, 1000],
  ticketPrice: [40, 120],
  vacancy: [10, 60],
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || min));
const roundOne = (value) => Math.round(value * 10) / 10;

export function normalizeSandboxInputs(inputs = {}) {
  return Object.fromEntries(Object.entries(INPUT_LIMITS).map(([key, [min, max]]) => [
    key,
    clamp(inputs[key] ?? DEFAULT_INVESTMENT_SANDBOX[key], min, max),
  ]));
}

export function calculateInvestmentSandbox(inputs = {}) {
  const normalized = normalizeSandboxInputs(inputs);
  const operatingRate = 1 - normalized.vacancy / 100;
  const totalInvestmentRaw = normalized.budget * (0.84 + normalized.vacancy * 0.0015);
  const annualRevenue = normalized.ticketPrice * 105000 * operatingRate / 10000 + normalized.budget * 0.05;
  const annualOperatingCost = totalInvestmentRaw * 0.22 + normalized.vacancy * 1.4;
  const annualNetCashFlowRaw = Math.max(1, annualRevenue - annualOperatingCost);
  const paybackYearsRaw = totalInvestmentRaw / annualNetCashFlowRaw;
  const roi5Raw = (annualNetCashFlowRaw * 5 - totalInvestmentRaw) / totalInvestmentRaw * 100;

  return {
    inputs: normalized,
    totalInvestment: Math.round(totalInvestmentRaw),
    annualNetCashFlow: Math.round(annualNetCashFlowRaw),
    paybackYears: roundOne(paybackYearsRaw),
    roi5: Math.round(roi5Raw),
  };
}

export function buildSandboxRevenueMix(inputs = {}) {
  const normalized = normalizeSandboxInputs(inputs);
  const ticket = Math.round(28 + (normalized.ticketPrice - 40) * 0.2);
  const space = Math.round(32 + (60 - normalized.vacancy) * 0.15);
  const activity = 18;
  const retail = 100 - ticket - space - activity;

  return [
    { name: '门票体验', value: ticket },
    { name: '空间经营', value: space },
    { name: '活动研学', value: activity },
    { name: '文创商业', value: retail },
  ];
}

export function formatSandboxMetric(key, value) {
  if (key === 'paybackYears') return `${(Math.round(Number(value) * 10) / 10).toFixed(1)} 年`;
  if (key === 'roi5') return `${Math.round(Number(value))}%`;
  return `${Math.round(Number(value)).toLocaleString('zh-CN')} 万`;
}

export function getSandboxMotionSettings(reducedMotion) {
  return { duration: reducedMotion ? 0 : 420 };
}

const REVENUE_COLORS = ['#1f6048', '#6d9d82', '#d3a54a', '#b76858'];

function revenueOption(mix, reducedMotion) {
  return {
    animationDurationUpdate: reducedMotion ? 0 : 360,
    tooltip: { trigger: 'item', formatter: '{b}<br>{c}%（{d}%）' },
    color: REVENUE_COLORS,
    series: [{
      name: '收入结构',
      type: 'pie',
      radius: ['53%', '76%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderColor: '#ffffff', borderWidth: 3, borderRadius: 5 },
      label: { show: false },
      emphasis: { scaleSize: 6 },
      data: mix,
    }],
    graphic: [{
      type: 'text',
      left: 'center',
      top: '44%',
      style: {
        text: '收入结构\n100%',
        textAlign: 'center',
        fill: '#174936',
        fontSize: 17,
        fontWeight: 700,
        lineHeight: 24,
      },
    }],
  };
}

export function createInvestmentSandboxView(windowObject = window) {
  const reducedMotion = windowObject.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motion = getSandboxMotionSettings(reducedMotion);
  const displayedValues = new Map();
  const animationFrames = new Map();
  let revenueChart = null;

  function writeMetric(element, key, value) {
    displayedValues.set(key, value);
    element.textContent = formatSandboxMetric(key, value);
    element.setAttribute('aria-label', `${element.closest('article')?.querySelector('span')?.textContent ?? key} ${formatSandboxMetric(key, value)}`);
  }

  function animateMetric(element, key, target) {
    if (!element) return;
    const previousFrame = animationFrames.get(key);
    if (previousFrame) windowObject.cancelAnimationFrame(previousFrame);
    const startValue = displayedValues.get(key) ?? 0;
    if (motion.duration === 0 || startValue === target) {
      writeMetric(element, key, target);
      return;
    }
    const startedAt = windowObject.performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - startedAt) / motion.duration);
      const eased = 1 - ((1 - progress) ** 3);
      writeMetric(element, key, startValue + (target - startValue) * eased);
      if (progress < 1) animationFrames.set(key, windowObject.requestAnimationFrame(tick));
      else animationFrames.delete(key);
    };
    animationFrames.set(key, windowObject.requestAnimationFrame(tick));
  }

  function renderLegend(container, mix) {
    if (!container) return;
    container.replaceChildren(...mix.map((item, index) => {
      const row = container.ownerDocument.createElement('article');
      row.className = 'revenue-legend-item';
      row.style.setProperty('--legend-color', REVENUE_COLORS[index]);
      const dot = container.ownerDocument.createElement('i');
      dot.setAttribute('aria-hidden', 'true');
      const label = container.ownerDocument.createElement('span');
      label.textContent = item.name;
      const value = container.ownerDocument.createElement('strong');
      value.textContent = `${item.value}%`;
      row.append(dot, label, value);
      return row;
    }));
  }

  function renderChart(container, mix) {
    const echartsLibrary = windowObject.echarts;
    if (!container || !echartsLibrary?.init) return;
    try {
      if (!revenueChart) revenueChart = echartsLibrary.init(container, null, { renderer: 'canvas' });
      revenueChart.setOption(revenueOption(mix, reducedMotion), true);
      revenueChart.resize();
      container.setAttribute('aria-label', mix.map((item) => `${item.name} ${item.value}%`).join('，'));
    } catch {
      revenueChart = null;
    }
  }

  return {
    render({ metrics, mix, elements }) {
      animateMetric(elements.totalInvestment, 'totalInvestment', metrics.totalInvestment);
      animateMetric(elements.annualNetCashFlow, 'annualNetCashFlow', metrics.annualNetCashFlow);
      animateMetric(elements.paybackYears, 'paybackYears', metrics.paybackYears);
      animateMetric(elements.roi5, 'roi5', metrics.roi5);
      renderLegend(elements.revenueLegend, mix);
      renderChart(elements.revenueMix, mix);
    },
    resize() {
      revenueChart?.resize();
    },
  };
}
