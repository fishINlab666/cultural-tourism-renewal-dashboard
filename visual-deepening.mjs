const VISUAL_BUDGET_DEFINITIONS = Object.freeze([
  { id: 'survey', number: 1, label: '勘测与专业评估', sources: [{ category: '勘测与数据采集', share: 1 }, { category: '专业评估与报告', share: 1 }], color: '#8A7764', anchor: [18, 72] },
  {
    id: 'restoration', number: 2, label: '木构与墙面修缮', sources: [{ category: '基础工程与机电', share: 0.45 }], color: '#785C48', anchor: [28, 30],
    materials: ['木构检修、墙面修补、基础加固与防潮处理'],
    principles: ['保留原构件和原材料，优先修补与局部替换'],
  },
  {
    id: 'infrastructure', number: 3, label: '消防与隐蔽机电', sources: [{ category: '基础工程与机电', share: 0.55 }], color: '#536B63', anchor: [76, 55],
    materials: ['消防、弱电、给排水与隐蔽机电更新'],
    principles: ['优先安全与开业必需项，管线尽量隐蔽且保留检修条件'],
  },
  { id: 'courtyard', number: 4, label: '院落铺地与绿化', sources: [{ category: '院落与景观提升', share: 1 }], color: '#356859', anchor: [50, 74] },
  {
    id: 'lighting', number: 5, label: '檐下与庭院照明', sources: [{ category: '数字文旅系统', share: 1 }], color: '#B28242', anchor: [67, 28],
    materials: ['檐下照明、庭院灯、导览互动与夜间运营控制系统'],
    principles: ['采用低照度、可分区控制的设备，避免眩光和过度亮化'],
  },
  { id: 'experience', number: 6, label: '可逆展陈与运营启动', sources: [{ category: '内容与运营启动', share: 1 }], color: '#A9473F', anchor: [48, 46] },
]);

const VISUAL_IMAGE_SETS = Object.freeze({
  day: Object.freeze({
    before: 'assets/visual-deepening/courtyard-day-before.png',
    after: 'assets/visual-deepening/courtyard-day-after.png',
  }),
  night: Object.freeze({
    before: 'assets/visual-deepening/courtyard-night-before.png',
    after: 'assets/visual-deepening/courtyard-night-after.png',
  }),
});

export function clampVisualSplit(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 50;
  return Math.min(100, Math.max(0, number));
}

export function getVisualImageSet(mode) {
  return VISUAL_IMAGE_SETS[mode] ?? VISUAL_IMAGE_SETS.day;
}

export function reduceVisualState(state, action) {
  if (action.type === 'mode' && ['day', 'night', 'material'].includes(action.value)) {
    return { ...state, mode: action.value };
  }
  if (action.type === 'split') {
    return { ...state, split: clampVisualSplit(action.value) };
  }
  if (action.type === 'budget' && typeof action.value === 'string') {
    return { ...state, selectedBudgetId: action.value };
  }
  return { ...state };
}

function allocateDefinition(definition, rowsByCategory) {
  const sourceRows = definition.sources.map((source) => ({
    ...source,
    row: rowsByCategory.get(source.category),
  }));
  const hasAllSources = sourceRows.every(({ row }) => row && Number.isFinite(row.low) && Number.isFinite(row.high));

  if (!hasAllSources) {
    return {
      ...definition,
      status: 'missing',
      low: null,
      high: null,
      percent: 0,
      materials: definition.materials ?? sourceRows.map(({ row }) => row?.material).filter(Boolean),
      principles: definition.principles ?? sourceRows.map(({ row }) => row?.alternative).filter(Boolean),
    };
  }

  return {
    ...definition,
    status: 'ready',
    low: sourceRows.reduce((sum, { row, share }) => sum + row.low * share, 0),
    high: sourceRows.reduce((sum, { row, share }) => sum + row.high * share, 0),
    percent: 0,
    materials: definition.materials ?? [...new Set(sourceRows.map(({ row }) => row.material).filter(Boolean))],
    principles: definition.principles ?? [...new Set(sourceRows.map(({ row }) => row.alternative).filter(Boolean))],
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

function formatWanRange(low, high) {
  if (!Number.isFinite(low) || !Number.isFinite(high)) return '待补充';
  return `${Math.round(low).toLocaleString('zh-CN')}-${Math.round(high).toLocaleString('zh-CN')} 万`;
}

function createElement(document, tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function selectBudgetItem(budget, selectedBudgetId) {
  return budget.items.find((item) => item.id === selectedBudgetId)
    ?? budget.items.find((item) => item.status === 'ready')
    ?? budget.items[0];
}

export function renderVisualBudgetMarkup({ budget, selectedBudgetId, elements }) {
  const selected = selectBudgetItem(budget, selectedBudgetId);
  const document = elements.hotspots.ownerDocument;

  const hotspotButtons = budget.items.map((item) => {
    const button = createElement(document, 'button', `visual-hotspot${item.id === selected.id ? ' is-selected' : ''}${item.status === 'missing' ? ' is-missing' : ''}`);
    button.type = 'button';
    button.dataset.budgetId = item.id;
    button.disabled = item.status === 'missing';
    button.setAttribute('aria-pressed', String(item.id === selected.id));
    button.setAttribute('aria-label', `${item.number} ${item.label}，${formatWanRange(item.low, item.high)}，${item.status === 'ready' ? `占比 ${item.percent}%` : '待补充造价数据'}`);
    button.style.setProperty('--hotspot-x', `${item.anchor[0]}%`);
    button.style.setProperty('--hotspot-y', `${item.anchor[1]}%`);
    button.style.setProperty('--hotspot-color', item.color);
    button.append(
      createElement(document, 'span', 'visual-hotspot-number', String(item.number)),
      createElement(document, 'span', 'visually-hidden', item.label),
    );
    return button;
  });
  elements.hotspots.replaceChildren(...hotspotButtons);

  const detailHeader = createElement(document, 'div', 'visual-budget-detail-heading');
  const detailTitle = createElement(document, 'div');
  detailTitle.append(
    createElement(document, 'p', 'eyebrow', `工程投入 ${selected.number}`),
    createElement(document, 'h3', '', selected.label),
  );
  const detailMetric = createElement(document, 'div', 'visual-budget-detail-metric');
  detailMetric.append(
    createElement(document, 'strong', '', formatWanRange(selected.low, selected.high)),
    createElement(document, 'span', '', selected.status === 'ready' ? `占可视化工程投入 ${selected.percent}%` : '造价数据待补充'),
  );
  detailHeader.append(detailTitle, detailMetric);

  const materials = createElement(document, 'div', 'visual-budget-copy');
  materials.append(
    createElement(document, 'strong', '', '主要材料与工程'),
    createElement(document, 'p', '', selected.materials.join('；') || '等待补充对应造价类目和工程内容。'),
  );
  const principle = createElement(document, 'div', 'visual-budget-copy');
  principle.append(
    createElement(document, 'strong', '', '实施原则'),
    createElement(document, 'p', '', selected.principles.join('；') || '缺失数据补齐后由工程团队复核实施边界。'),
  );
  const basis = createElement(document, 'p', 'visual-budget-basis', `造价依据：${selected.sources.map((source) => source.category).join('、')}。金额来自当前确认方案的工程造价测算，进入深化前需人工复核。`);
  elements.budgetDetail.replaceChildren(detailHeader, materials, principle, basis);

  const allocationSegments = budget.items.map((item) => {
    const button = createElement(document, 'button', `visual-allocation-segment${item.id === selected.id ? ' is-selected' : ''}${item.status === 'missing' ? ' is-missing' : ''}`);
    button.type = 'button';
    button.dataset.budgetId = item.id;
    button.disabled = item.status === 'missing';
    button.setAttribute('aria-pressed', String(item.id === selected.id));
    button.setAttribute('aria-label', `${item.number} ${item.label} ${formatWanRange(item.low, item.high)} ${item.percent}%`);
    button.style.setProperty('--allocation-color', item.color);
    button.style.setProperty('--allocation-share', String(item.status === 'ready' ? item.percent : 0));
    button.append(
      createElement(document, 'strong', '', String(item.number)),
      createElement(document, 'span', '', item.status === 'ready' ? `${item.percent}%` : '待补'),
    );
    return button;
  });
  elements.allocationBar.replaceChildren(...allocationSegments);

  const legendRows = budget.items.map((item) => {
    const button = createElement(document, 'button', `visual-allocation-legend-item${item.id === selected.id ? ' is-selected' : ''}${item.status === 'missing' ? ' is-missing' : ''}`);
    button.type = 'button';
    button.dataset.budgetId = item.id;
    button.disabled = item.status === 'missing';
    button.setAttribute('aria-pressed', String(item.id === selected.id));
    button.style.setProperty('--allocation-color', item.color);
    button.append(
      createElement(document, 'span', 'visual-legend-number', String(item.number)),
      createElement(document, 'span', 'visual-legend-label', item.label),
      createElement(document, 'strong', '', formatWanRange(item.low, item.high)),
      createElement(document, 'small', '', item.status === 'ready' ? `${item.percent}%` : '待补充'),
    );
    return button;
  });
  elements.allocationLegend.replaceChildren(...legendRows);
  return selected;
}

export function createVisualDeepeningView() {
  let isBound = false;

  return {
    render({ plan, costRange, visualState, elements }) {
      if (!plan || !costRange) return;
      const mode = ['day', 'night', 'material'].includes(visualState.mode) ? visualState.mode : 'day';
      const split = clampVisualSplit(visualState.split);
      const imageSet = getVisualImageSet(mode);
      const budget = buildVisualBudget(costRange.rows);
      const activeTab = elements.tabs.find((tab) => tab.dataset.mode === mode) ?? elements.tabs[0];

      elements.selectedPlanTitle.textContent = plan.name;
      elements.selectedPlanSummary.textContent = plan.summary;
      elements.visualCostRange.textContent = formatWanRange(costRange.low, costRange.high);
      elements.tabs.forEach((tab) => {
        const selected = tab === activeTab;
        tab.setAttribute('aria-selected', String(selected));
        tab.setAttribute('tabindex', selected ? '0' : '-1');
        tab.classList.toggle('is-active', selected);
      });
      elements.comparisonPanel.hidden = mode === 'material';
      elements.materialPanel.hidden = mode !== 'material';
      elements.comparisonPanel.setAttribute('aria-labelledby', activeTab.id);
      elements.beforeImage.src = imageSet.before;
      elements.afterImage.src = imageSet.after;
      elements.beforeImage.alt = `${mode === 'night' ? '夜间' : '日间'}院落现状 AI 概念模拟`;
      elements.afterImage.alt = `${mode === 'night' ? '夜间' : '日间'}院落改造后 AI 概念模拟`;
      elements.comparison.style.setProperty('--visual-split', `${split}%`);
      elements.split.value = String(split);
      elements.imageStatus.textContent = '';
      renderVisualBudgetMarkup({ budget, selectedBudgetId: visualState.selectedBudgetId, elements });
    },

    bind({ elements, onStateChange }) {
      if (isBound) return;
      isBound = true;
      elements.modeButtons.addEventListener('click', (event) => {
        const button = event.target.closest('[data-mode]');
        if (button) onStateChange({ type: 'mode', value: button.dataset.mode });
      });
      elements.modeButtons.addEventListener('keydown', (event) => {
        if (['Enter', ' ', 'Space'].includes(event.key)) {
          const button = event.target.closest('[data-mode]');
          if (!button) return;
          event.preventDefault();
          onStateChange({ type: 'mode', value: button.dataset.mode });
          return;
        }
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        const currentIndex = elements.tabs.indexOf(event.target);
        if (currentIndex < 0) return;
        event.preventDefault();
        const lastIndex = elements.tabs.length - 1;
        const nextIndex = event.key === 'Home' ? 0
          : event.key === 'End' ? lastIndex
            : (currentIndex + (event.key === 'ArrowRight' ? 1 : -1) + elements.tabs.length) % elements.tabs.length;
        const nextTab = elements.tabs[nextIndex];
        nextTab.focus();
        onStateChange({ type: 'mode', value: nextTab.dataset.mode });
      });
      elements.split.addEventListener('input', (event) => onStateChange({ type: 'split', value: event.target.value }));
      elements.split.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowDown', 'ArrowRight', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const minimum = Number(event.target.min) || 0;
        const maximum = Number(event.target.max) || 100;
        const step = Number(event.target.step) || 1;
        const current = clampVisualSplit(event.target.value);
        const value = event.key === 'Home' ? minimum
          : event.key === 'End' ? maximum
            : current + (['ArrowRight', 'ArrowUp'].includes(event.key) ? step : -step);
        onStateChange({ type: 'split', value: clampVisualSplit(value) });
      });
      for (const container of [elements.hotspots, elements.allocationBar, elements.allocationLegend]) {
        container.addEventListener('click', (event) => {
          const button = event.target.closest('[data-budget-id]');
          if (button && !button.disabled) onStateChange({ type: 'budget', value: button.dataset.budgetId });
        });
        container.addEventListener('keydown', (event) => {
          if (!['Enter', ' ', 'Space'].includes(event.key)) return;
          const button = event.target.closest('[data-budget-id]');
          if (!button || button.disabled) return;
          event.preventDefault();
          onStateChange({ type: 'budget', value: button.dataset.budgetId });
        });
      }
      const showImageError = () => { elements.imageStatus.textContent = '概念图暂未加载，请刷新页面后重试。'; };
      const clearImageError = () => { elements.imageStatus.textContent = ''; };
      elements.beforeImage.addEventListener('error', showImageError);
      elements.afterImage.addEventListener('error', showImageError);
      elements.beforeImage.addEventListener('load', clearImageError);
      elements.afterImage.addEventListener('load', clearImageError);
    },
  };
}
