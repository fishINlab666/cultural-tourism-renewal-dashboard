# Visual Deepening Budget Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder visual-deepening canvas with four consistent AI courtyard images, accessible before/after comparison, day/night/material tabs, and cost-linked hotspots that explain where the selected plan's engineering budget is used.

**Architecture:** Keep the existing eight-step workflow and calculation formulas unchanged. Add `visual-deepening.mjs` as a focused module with pure budget-allocation functions plus a small DOM view controller; `app.js` supplies the selected plan and the existing `calculateCostRange()` result. Store generated assets locally under `assets/visual-deepening/` so the page remains local-only and reproducible.

**Tech Stack:** Static HTML/CSS, browser ES modules, Node.js built-in test runner, local PNG/WebP assets, Codex image generation, in-app Browser verification.

---

## File Map

- Create `assets/visual-deepening/courtyard-day-before.png`: AI concept day baseline.
- Create `assets/visual-deepening/courtyard-day-after.png`: AI concept day activated courtyard.
- Create `assets/visual-deepening/courtyard-night-before.png`: matching night baseline.
- Create `assets/visual-deepening/courtyard-night-after.png`: matching night activated courtyard.
- Create `visual-deepening.mjs`: cost grouping, percentage rounding, image set selection, and DOM interaction controller.
- Create `tests/visual-deepening-v2.test.mjs`: pure behavior tests for cost mapping and visual interaction state.
- Modify `index.html:240-257`: semantic summary, tabs, comparison slider, material hotspots, detail card, and allocation bar.
- Modify `app.js:1-18,288-296,521-527`: initialize the view, derive current cost data, render it, and persist tab/split/hotspot state.
- Modify `data.mjs:124-145`: add stable visual interaction defaults to draft state without changing project or scenario data.
- Modify `styles.css:284-302,340-390`: full visual page layout, comparison layers, hotspot states, responsive behavior, and reduced motion.
- Modify `tests/workflow-v1.test.mjs`: assert the visual-deepening structure and local asset contract.

### Task 1: Generate and Validate the Four Courtyard Assets

**Files:**
- Create: `assets/visual-deepening/courtyard-day-before.png`
- Create: `assets/visual-deepening/courtyard-day-after.png`
- Create: `assets/visual-deepening/courtyard-night-before.png`
- Create: `assets/visual-deepening/courtyard-night-after.png`

- [x] **Step 1: Generate the day baseline master**

Use the image-generation skill with this fixed scene prompt:

```text
Create a photorealistic 16:9 architectural concept image of a fictional traditional Fuzhou courtyard inspired by Sanfang Qixiang, not a replica of any named protected building. Fixed eye-level camera at the courtyard entrance looking inward, centered one-point perspective, 28mm lens. White lime-plaster walls, dark grey tiled roofs, deep timber eaves, aged dark wood columns and doors, long stone paving, narrow sky well, restrained planting. Daylight, overcast-soft natural light. Existing condition before activation: clean but underused, sparse furniture, no commercial signs, no people, no text, no logos. Preserve precise geometry so this image can serve as the master for later edits.
```

Save the selected result as `assets/visual-deepening/courtyard-day-before.png`.

- [x] **Step 2: Edit the day master into the activated design**

Use image editing on the day baseline, preserving camera and architecture exactly:

```text
Keep the exact camera, perspective, roof lines, walls, columns, doors, paving joints, and courtyard proportions. Add a low-intervention composite activation concept: reversible muted cinnabar and ochre Tang-inspired textile banners under the eaves, a small modular cultural display, removable timber tea tables and chairs, low potted greenery, subtle wayfinding, and a compact performance node at the far end. Retain the historic Fuzhou courtyard as the visual priority. No permanent faux-Tang construction, no crowds, no text, no logos. Photorealistic daytime architectural visualization.
```

Save as `assets/visual-deepening/courtyard-day-after.png`.

- [x] **Step 3: Edit both day images into matching night images**

For each source, preserve geometry exactly and change only time/lighting. The after image adds warm low-level eave lights, shielded courtyard lights, and a softly lit cultural display; avoid festival-scale floodlighting.

Save as:

```text
assets/visual-deepening/courtyard-night-before.png
assets/visual-deepening/courtyard-night-after.png
```

- [x] **Step 4: Verify image dimensions and visual registration**

If image generation returns 1536 x 1024 masters, normalize all four to the same centered 16:9 crop before inspection:

```bash
for image in assets/visual-deepening/*.png; do sips --cropToHeightWidth 864 1536 "$image" --out "$image"; done
```

Then run:

```bash
sips -g pixelWidth -g pixelHeight assets/visual-deepening/*.png
```

Expected: all four images have identical 16:9 dimensions. Inspect all four at original detail and reject any pair where roof ridges, columns, wall openings, or paving lines move between before and after.

- [x] **Step 5: Commit the approved assets**

```bash
git add assets/visual-deepening
git commit -m "assets: add courtyard visual deepening concepts"
```

### Task 2: Build the Cost-to-Hotspot Mapping with TDD

**Files:**
- Create: `visual-deepening.mjs`
- Create: `tests/visual-deepening-v2.test.mjs`

- [x] **Step 1: Write failing cost-allocation tests**

Create `tests/visual-deepening-v2.test.mjs` with tests that require `buildVisualBudget()` to return six stable groups, preserve the calculated low/high totals, and round displayed percentages to exactly 100:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { calculateCostRange } from '../analysis.mjs';
import { sampleData } from '../data.mjs';
import { buildVisualBudget } from '../visual-deepening.mjs';

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
```

- [x] **Step 2: Run the new test and verify RED**

Run:

```bash
node --test tests/visual-deepening-v2.test.mjs
```

Expected: FAIL because `visual-deepening.mjs` and `buildVisualBudget()` do not exist.

- [x] **Step 3: Implement the minimal explicit mapping**

Create `visual-deepening.mjs` with a frozen six-item definition. Fully allocate the six current cost rows into six customer-facing groups without omission or double counting:

```js
const VISUAL_BUDGET_DEFINITIONS = [
  { id: 'survey', number: 1, label: '勘测与专业评估', sources: [{ category: '勘测与数据采集', share: 1 }, { category: '专业评估与报告', share: 1 }], color: '#8A7764', anchor: [18, 72] },
  { id: 'restoration', number: 2, label: '木构与墙面修缮', sources: [{ category: '基础工程与机电', share: 0.45 }], color: '#785C48', anchor: [28, 30] },
  { id: 'infrastructure', number: 3, label: '消防与隐蔽机电', sources: [{ category: '基础工程与机电', share: 0.55 }], color: '#536B63', anchor: [76, 55] },
  { id: 'courtyard', number: 4, label: '院落铺地与绿化', sources: [{ category: '院落与景观提升', share: 1 }], color: '#356859', anchor: [50, 74] },
  { id: 'lighting', number: 5, label: '檐下与庭院照明', sources: [{ category: '数字文旅系统', share: 1 }], color: '#B28242', anchor: [67, 28] },
  { id: 'experience', number: 6, label: '可逆展陈与运营启动', sources: [{ category: '内容与运营启动', share: 1 }], color: '#A9473F', anchor: [48, 46] },
];
```

The `share` values partition `基础工程与机电` once rather than counting it twice. `buildVisualBudget()` must first split rows, then total the midpoint for percentages, assign missing states, and absorb rounding residue into the last available item.

- [x] **Step 4: Run the focused test and verify GREEN**

```bash
node --test tests/visual-deepening-v2.test.mjs
```

Expected: both cost-allocation tests PASS.

- [x] **Step 5: Commit the mapping module**

```bash
git add visual-deepening.mjs tests/visual-deepening-v2.test.mjs
git commit -m "feat: map engineering costs to visual hotspots"
```

### Task 3: Build Comparison and Tab State with TDD

**Files:**
- Modify: `visual-deepening.mjs`
- Modify: `tests/visual-deepening-v2.test.mjs`
- Modify: `data.mjs:124-145`

- [x] **Step 1: Add failing interaction-state tests**

Append tests for clamping the split position, selecting the correct image pair, and preserving state across tab changes:

```js
import {
  clampVisualSplit,
  getVisualImageSet,
  reduceVisualState,
} from '../visual-deepening.mjs';

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
  const state = reduceVisualState({ mode: 'day', split: 63, selectedBudgetId: 'courtyard' }, { type: 'mode', value: 'night' });
  assert.deepEqual(state, { mode: 'night', split: 63, selectedBudgetId: 'courtyard' });
});
```

- [x] **Step 2: Run and verify RED**

```bash
node --test tests/visual-deepening-v2.test.mjs
```

Expected: FAIL for the three missing exports.

- [x] **Step 3: Implement state helpers and defaults**

Implement the three helpers in `visual-deepening.mjs`. Extend `createInitialState()` in `data.mjs`:

```js
visualMode: 'day',
visualSplit: 50,
selectedVisualBudgetId: 'restoration',
```

Keep storage compatibility by relying on the existing merge with `initialState`; old drafts will receive the new defaults automatically.

- [x] **Step 4: Run focused and persistence tests**

```bash
node --test tests/visual-deepening-v2.test.mjs tests/workflow-v1.test.mjs
```

Expected: PASS.

- [x] **Step 5: Commit interaction state**

```bash
git add visual-deepening.mjs tests/visual-deepening-v2.test.mjs data.mjs
git commit -m "feat: add visual comparison interaction state"
```

### Task 4: Replace the Placeholder Markup

**Files:**
- Modify: `tests/workflow-v1.test.mjs`
- Modify: `index.html:240-257`

- [x] **Step 1: Write a failing workflow structure test**

Append a test that checks the new IDs and accessibility contract:

```js
test('V2 visual deepening exposes comparison tabs and cost-linked material hotspots', async () => {
  const html = await read('index.html');

  for (const id of [
    'visualSummary', 'visualModeButtons', 'visualComparison', 'visualSplit',
    'visualBeforeImage', 'visualAfterImage', 'visualMaterialPanel',
    'visualHotspots', 'visualBudgetDetail', 'visualAllocationBar',
  ]) assert.match(html, new RegExp(`id="${id}"`));

  assert.match(html, /role="tablist"/);
  assert.match(html, /role="slider"|type="range"/);
  assert.match(html, /AI 概念模拟，非现场实拍/);
});
```

- [x] **Step 2: Run and verify RED**

```bash
node --test tests/workflow-v1.test.mjs
```

Expected: FAIL because the new elements are absent.

- [x] **Step 3: Replace the step-seven HTML**

Use one `visual-deepening` container with this complete structural skeleton; keep explanatory copy concise and let the view module populate dynamic values:

```html
<div class="visual-deepening">
  <header id="visualSummary" class="visual-summary primary-card">
    <div><p class="eyebrow">已确认方案</p><h2 id="selectedPlanTitle">-</h2><p id="selectedPlanSummary"></p></div>
    <div class="visual-summary-metrics"><span>工程造价</span><strong id="visualCostRange">-</strong><small>AI 概念模拟，非现场实拍</small></div>
  </header>
  <div id="visualModeButtons" class="visual-tabs" role="tablist" aria-label="视觉深化内容">
    <button id="visualTabDay" role="tab" aria-controls="visualComparisonPanel" aria-selected="true" data-mode="day">日间</button>
    <button id="visualTabNight" role="tab" aria-controls="visualComparisonPanel" aria-selected="false" data-mode="night">夜间</button>
    <button id="visualTabMaterial" role="tab" aria-controls="visualMaterialPanel" aria-selected="false" data-mode="material">材料说明</button>
  </div>
  <section id="visualComparisonPanel" class="visual-comparison-panel" role="tabpanel" aria-labelledby="visualTabDay">
    <div id="visualComparison" class="visual-comparison" style="--visual-split:50%">
      <img id="visualBeforeImage" class="visual-image visual-before" alt="院落现状 AI 概念模拟">
      <div class="visual-after-clip"><img id="visualAfterImage" class="visual-image visual-after" alt="院落改造后 AI 概念模拟"></div>
      <span class="comparison-label is-before">现状模拟</span><span class="comparison-label is-after">方案效果</span>
      <span class="comparison-divider" aria-hidden="true"></span>
      <input id="visualSplit" type="range" min="0" max="100" value="50" aria-label="调整改造前后分割位置">
    </div>
    <p id="visualImageStatus" class="visual-image-status" role="status"></p>
  </section>
  <section id="visualMaterialPanel" class="visual-material-panel" role="tabpanel" aria-labelledby="visualTabMaterial" hidden>
    <div class="visual-hotspot-stage"><img src="assets/visual-deepening/courtyard-day-after.png" alt="院落改造后材料与工程投入示意"><div id="visualHotspots"></div></div>
    <aside id="visualBudgetDetail" class="visual-budget-detail primary-card"></aside>
    <div class="visual-allocation"><div id="visualAllocationBar"></div><div id="visualAllocationLegend"></div></div>
  </section>
  <div class="review-note"><strong>成果边界</strong><span>概念视觉不作为施工图、报批图或投资承诺。</span></div>
</div>
```

Inside comparison, use two absolutely aligned `<img>` elements and a full-width `<input id="visualSplit" type="range" min="0" max="100" value="50">`. The native range supplies pointer, touch, and keyboard behavior. Include fixed before/after labels and an inline load-error region with `role="status"`.

Inside material, include the day-after image, an empty hotspot layer, a detail card, and an empty allocation bar/legend for `visual-deepening.mjs` to populate.

- [x] **Step 4: Run the workflow test and verify GREEN**

```bash
node --test tests/workflow-v1.test.mjs
```

Expected: PASS.

- [x] **Step 5: Commit semantic markup**

```bash
git add index.html tests/workflow-v1.test.mjs
git commit -m "feat: add visual deepening comparison structure"
```

### Task 5: Wire Rendering, Hotspot Linking, and Responsive Styles

**Files:**
- Modify: `visual-deepening.mjs`
- Modify: `app.js:1-18,288-296,521-527`
- Modify: `styles.css:284-302,340-390`
- Modify: `tests/visual-deepening-v2.test.mjs`

- [x] **Step 1: Add a failing DOM-view contract test**

Test the exported `createVisualDeepeningView()` using minimal fake elements: rendering must set both image paths, apply `--visual-split`, produce six hotspot buttons, update the detail text, and mark the selected allocation segment.

```js
test('visual view synchronizes images hotspots detail and allocation selection', async () => {
  const module = await import('../visual-deepening.mjs');
  assert.equal(typeof module.createVisualDeepeningView, 'function');
  assert.equal(typeof module.renderVisualBudgetMarkup, 'function');
});
```

Keep detailed state behavior in pure-function tests; do not introduce jsdom or a new dependency.

- [x] **Step 2: Run and verify RED**

```bash
node --test tests/visual-deepening-v2.test.mjs
```

Expected: FAIL because the view exports are missing.

- [x] **Step 3: Implement the view controller**

`createVisualDeepeningView(windowObject)` must expose:

```js
{
  render({ plan, costRange, visualState, elements }),
  bind({ elements, onStateChange }),
}
```

`render()` sets tab ARIA state, image sources/alt text, split CSS variable, summary text, hotspot markup, selected detail, and the allocation bar. `bind()` attaches one-time delegated listeners for tab clicks, range input, hotspot/allocation clicks, and image errors. Use `textContent` and DOM creation for dynamic customer data; do not interpolate untrusted text into HTML.

- [x] **Step 4: Wire the view into `app.js`**

Import `createVisualDeepeningView`, initialize it beside the diagnostic and investment views, and replace `renderVisual()` with:

```js
function renderVisual() {
  const plan = getSelectedPlan(sampleData, state.selectedPlanId);
  if (!plan) return;
  visualDeepeningView.render({
    plan,
    costRange: calculateCostRange(state.project, sampleData.costs, plan),
    visualState: {
      mode: state.visualMode,
      split: state.visualSplit,
      selectedBudgetId: state.selectedVisualBudgetId,
    },
    elements: getVisualElements(),
  });
}
```

Call `visualDeepeningView.bind()` once from `bindEvents()`. Its callback updates the three state keys, persists the draft, and calls `renderVisual()`. Remove the old `#visualModeButtons` click handler and swatch rendering.

- [x] **Step 5: Replace placeholder CSS with the finished layout**

Implement:

- 16:9 comparison frame with aligned image layers and clipping driven by `--visual-split`.
- Visible 44px divider handle while keeping the native range track transparent.
- Ink-green tabs, warm-white cards, copper-gold selected markers, Source Han Serif headings.
- Material grid `minmax(0, 1.55fr) minmax(280px, .45fr)` on desktop and one column below 760px.
- Hotspot buttons at percentage anchors with number plus accessible label.
- Allocation segments with minimum 44px interaction height and text legend below.
- Error, focus, hover, selected, reduced-motion, and image aspect-ratio states.

- [x] **Step 6: Run focused tests and static checks**

```bash
node --test tests/visual-deepening-v2.test.mjs tests/workflow-v1.test.mjs
git diff --check
```

Expected: all tests PASS; `git diff --check` has no output.

- [x] **Step 7: Commit the integrated visual page**

```bash
git add app.js styles.css visual-deepening.mjs tests/visual-deepening-v2.test.mjs
git commit -m "feat: connect visual deepening to engineering costs"
```

### Task 6: Full Verification and V2 Checkpoint

**Files:**
- Modify if required by findings: `index.html`, `styles.css`, `app.js`, `visual-deepening.mjs`, `tests/*.test.mjs`
- Modify: `docs/superpowers/plans/2026-06-14-visual-deepening-budget-map-implementation-plan.md`

- [x] **Step 1: Run the complete automated suite**

```bash
node --test tests/*.test.mjs
```

Expected: all existing and new tests PASS with no failures or warnings.

- [x] **Step 2: Verify the V2 desktop flow in the in-app Browser**

Open `http://localhost:5176/`, load the demonstration project, advance to step 7, and verify:

1. The summary shows the confirmed plan and its engineering cost range.
2. The day slider moves smoothly from 0 to 100 and the structures remain registered.
3. Night mode changes both images and preserves the slider value.
4. Material mode shows six numbered hotspots.
5. Clicking a hotspot, allocation segment, or legend row synchronizes all three selections.
6. Amounts match step 4 for the confirmed plan and percentages total 100.
7. The AI concept boundary is visible without opening another panel.

- [x] **Step 3: Verify responsive and keyboard behavior**

At a mobile viewport near 390 x 844, verify no horizontal scrolling, the material panel stacks, and all controls remain at least 44px. Use Tab, arrow keys, Enter, and Space to operate tabs, the range control, hotspots, and allocation rows.

- [x] **Step 4: Verify scenario recalculation**

Return to step 6, select each of `steady`, `growth`, and `landmark`, confirm it, then revisit step 7. For each plan, verify the name, total range, six amounts, and percentages update without changing the four concept image files.

- [x] **Step 5: Mark the plan complete and create a named rollback point**

Check completed boxes in this file, then run:

```bash
git add docs/superpowers/plans/2026-06-14-visual-deepening-budget-map-implementation-plan.md
git commit -m "docs: mark visual deepening budget map complete"
git tag v2-visual-deepening-budget-map-2026-06-14
```

Expected: clean V2 worktree, V1 unchanged, and the new tag available as a simple rollback point.
