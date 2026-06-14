import { test } from 'node:test';
import assert from 'node:assert/strict';

import { calculateCostRange } from '../analysis.mjs';
import { sampleData } from '../data.mjs';
import {
  buildVisualBudget,
  clampVisualSplit,
  createVisualDeepeningView,
  getVisualImageSet,
  reduceVisualState,
  renderVisualBudgetMarkup,
} from '../visual-deepening.mjs';

class FakeElement {
  constructor(ownerDocument, tagName = 'div') {
    this.ownerDocument = ownerDocument;
    this.tagName = tagName;
    this.attributes = new Map();
    this.children = [];
    this.className = '';
    this.dataset = {};
    this.hidden = false;
    this.listeners = new Map();
    this.src = '';
    this._textContent = '';
    this.value = '';
    this.style = {
      values: new Map(),
      setProperty: (name, value) => this.style.values.set(name, value),
    };
    this.classList = {
      toggle: (name, force) => {
        const classes = new Set(this.className.split(' ').filter(Boolean));
        if (force) classes.add(name);
        else classes.delete(name);
        this.className = [...classes].join(' ');
      },
    };
  }

  append(...children) { this.children.push(...children); }
  addEventListener(type, listener) {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
  }
  dispatch(type, event) {
    for (const listener of this.listeners.get(type) ?? []) listener(event);
  }
  closest(selector) {
    if (selector === '[data-mode]' && this.dataset.mode) return this;
    if (selector === '[data-budget-id]' && this.dataset.budgetId) return this;
    return null;
  }
  focus() { this.focused = true; }
  replaceChildren(...children) { this.children = children; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name); }
  set textContent(value) {
    this._textContent = String(value);
    if (value) this.children = [];
  }
  get textContent() {
    return this._textContent || this.children.map((child) => child.textContent ?? '').join('');
  }
}

function createFakeDocument() {
  const document = { createElement: (tagName) => new FakeElement(document, tagName) };
  return document;
}

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

test('split budget groups explain the scoped work shown by each hotspot', () => {
  const plan = sampleData.plans.find((item) => item.id === 'growth');
  const cost = calculateCostRange(sampleData.project, sampleData.costs, plan);
  const budget = buildVisualBudget(cost.rows);
  const restoration = budget.items.find((item) => item.id === 'restoration');
  const infrastructure = budget.items.find((item) => item.id === 'infrastructure');
  const lighting = budget.items.find((item) => item.id === 'lighting');

  assert.match(restoration.materials.join('；'), /木构|墙面/);
  assert.doesNotMatch(restoration.materials.join('；'), /消防/);
  assert.match(infrastructure.materials.join('；'), /消防.*隐蔽机电/);
  assert.match(lighting.materials.join('；'), /照明/);
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

test('visual view synchronizes images hotspots detail and allocation selection', () => {
  assert.equal(typeof createVisualDeepeningView, 'function');
  assert.equal(typeof renderVisualBudgetMarkup, 'function');

  const document = createFakeDocument();
  const element = (tagName) => new FakeElement(document, tagName);
  const tabs = ['day', 'night', 'material'].map((mode) => {
    const tab = element('button');
    tab.dataset.mode = mode;
    tab.id = `visualTab${mode}`;
    return tab;
  });
  const elements = {
    selectedPlanTitle: element('h2'),
    selectedPlanSummary: element('p'),
    visualCostRange: element('strong'),
    tabs,
    comparisonPanel: element('section'),
    materialPanel: element('section'),
    comparison: element('div'),
    split: element('input'),
    beforeImage: element('img'),
    afterImage: element('img'),
    imageStatus: element('p'),
    hotspots: element('div'),
    budgetDetail: element('aside'),
    allocationBar: element('div'),
    allocationLegend: element('div'),
  };
  const plan = sampleData.plans.find((item) => item.id === 'growth');
  const costRange = calculateCostRange(sampleData.project, sampleData.costs, plan);
  const view = createVisualDeepeningView({});

  view.render({
    plan,
    costRange,
    visualState: { mode: 'night', split: 63, selectedBudgetId: 'courtyard' },
    elements,
  });

  assert.equal(elements.beforeImage.src, 'assets/visual-deepening/courtyard-night-before.png');
  assert.equal(elements.afterImage.src, 'assets/visual-deepening/courtyard-night-after.png');
  assert.equal(elements.comparison.style.values.get('--visual-split'), '63%');
  assert.equal(elements.hotspots.children.length, 6);
  assert.match(elements.budgetDetail.textContent, /院落铺地与绿化/);
  assert.equal(elements.allocationBar.children.length, 6);
  assert.equal(elements.allocationBar.children[3].getAttribute('aria-pressed'), 'true');
});

test('visual view emits explicit keyboard actions for tabs split and budget controls', () => {
  const document = createFakeDocument();
  const element = (tagName) => new FakeElement(document, tagName);
  const tabs = ['day', 'night', 'material'].map((mode) => {
    const tab = element('button');
    tab.dataset.mode = mode;
    return tab;
  });
  const elements = {
    modeButtons: element('div'),
    tabs,
    split: element('input'),
    hotspots: element('div'),
    allocationBar: element('div'),
    allocationLegend: element('div'),
    beforeImage: element('img'),
    afterImage: element('img'),
    imageStatus: element('p'),
  };
  const actions = [];
  const preventDefault = () => {};
  const view = createVisualDeepeningView({});
  view.bind({ elements, onStateChange: (action) => actions.push(action) });

  elements.modeButtons.dispatch('keydown', { key: 'Enter', target: tabs[2], preventDefault });
  elements.split.value = '63';
  elements.split.dispatch('keydown', { key: 'ArrowRight', target: elements.split, preventDefault });
  const budgetButton = element('button');
  budgetButton.dataset.budgetId = 'courtyard';
  elements.hotspots.dispatch('keydown', { key: 'Enter', target: budgetButton, preventDefault });

  assert.deepEqual(actions, [
    { type: 'mode', value: 'material' },
    { type: 'split', value: 64 },
    { type: 'budget', value: 'courtyard' },
  ]);
});
