# Urban Renewal Product Deck Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an 8-slide Swiss-style HTML product deck for 城更智算舱 with lemon-green theming, semi-faithful product screenshots, and a continuous 01-08 product interaction narrative.

**Architecture:** Copy the registered Swiss template into `ppt/index.html`, replace its sample slides with seven approved Sxx layouts across eight slides, and add isolated deck-specific CSS/JS for the global workflow rail and product-action animations. Capture the existing local product in the in-app browser, then use Sharp to place the screenshots on fixed 21:9 Swiss grid canvases without modifying the product application.

**Tech Stack:** HTML/CSS/JavaScript, Motion One, Canvas, Node.js test runner, Sharp, Codex in-app Browser.

---

## File Map

- Create `tests/ppt-deck.test.mjs`: structural and contract checks for the generated deck.
- Create `ppt/index.html`: complete 8-slide horizontal web deck.
- Create `ppt/images/05-cost-investment-21x9.png`: engineering and investment semi-faithful UI evidence.
- Create `ppt/images/07-visual-modes-21x9.png`: visual-deepening semi-faithful UI evidence.
- Create `ppt/assets/motion.min.js`: local Motion One fallback copied from the skill.
- Create `ppt/scripts/compose-screenshots.mjs`: reproducible Sharp composition for the two 21:9 assets.

### Task 1: Add the deck contract test

**Files:**
- Create: `tests/ppt-deck.test.mjs`

- [ ] **Step 1: Write the failing structural test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const deckPath = new URL('../ppt/index.html', import.meta.url);

test('product deck implements the approved eight-slide Swiss contract', async () => {
  const html = await readFile(deckPath, 'utf8');
  const slides = [...html.matchAll(/<section\b[^>]*class="[^"]*\bslide\b[^"]*"[^>]*>/g)];
  const layouts = slides.map(({ 0: tag }) => tag.match(/data-layout="([^"]+)"/)?.[1]);

  assert.equal(slides.length, 8);
  assert.deepEqual(layouts, ['S01', 'S08', 'S11', 'S17', 'S22', 'S13', 'S22', 'S10']);
  assert.equal(new Set(layouts).size, 7);
  assert.match(html, /--accent:#C5E803/);
  assert.doesNotMatch(html, /\[必填\]|TBD|TODO/);
  assert.equal((html.match(/class="workflow-rail"/g) ?? []).length, 8);
  assert.match(html, /data-image-slot="s22-hero-21x9"/);
  assert.match(html, /images\/05-cost-investment-21x9\.png/);
  assert.match(html, /images\/07-visual-modes-21x9\.png/);
  assert.match(html, /data-product-action="diagnosis"/);
  assert.match(html, /data-product-action="calculation"/);
  assert.match(html, /data-product-action="plan-selection"/);
  assert.match(html, /data-product-action="visual-switch"/);
  assert.match(html, /guizang-ppt-low-power/);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
'/Users/wujingyu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' --test tests/ppt-deck.test.mjs
```

Expected: FAIL with `ENOENT` for `ppt/index.html`.

- [ ] **Step 3: Commit the test**

```bash
git add tests/ppt-deck.test.mjs
git commit -m "test: define product deck contract"
```

### Task 2: Capture and compose the product screenshots

**Files:**
- Create: `ppt/scripts/compose-screenshots.mjs`
- Create: `ppt/images/05-cost-investment-21x9.png`
- Create: `ppt/images/07-visual-modes-21x9.png`

- [ ] **Step 1: Capture the live product states**

Run the existing product if port 5173 is unavailable:

```bash
python3 -m http.server 5173 --bind 127.0.0.1
```

Use the in-app Browser at `http://127.0.0.1:5173/`, reset the draft, load the sample project, and navigate to:

- Step 5 after analysis has completed; save a 1280x720 viewport screenshot as `/tmp/chenggeng-step-05.png`.
- Step 7 with `复合活化型` confirmed and night mode selected; save a 1280x720 viewport screenshot as `/tmp/chenggeng-step-07.png`.

- [ ] **Step 2: Write the Sharp composition script**

The script must create a 2100x900 off-white canvas, draw a subtle lemon-green grid, place the product screenshot in a 1480x760 square-corner viewport at `(70,70)`, and reserve a right-side annotation column. It produces:

- Slide 05 labels: `ENGINEERING`, `163-367 万`, `TOTAL INVESTMENT`, `720 万`, `PAYBACK`, `3.2 年`.
- Slide 07 labels: `VISUAL DEEPENING`, `日间场景`, `夜间运营`, `材料策略`, with `夜间运营` highlighted.

Use the bundled Sharp package by setting `NODE_PATH` to the workspace dependency directory.

- [ ] **Step 3: Generate both final assets**

Run:

```bash
NODE_PATH='/Users/wujingyu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules' \
  '/Users/wujingyu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  ppt/scripts/compose-screenshots.mjs \
  /tmp/chenggeng-step-05.png \
  /tmp/chenggeng-step-07.png
```

Expected: two 2100x900 PNG files under `ppt/images/`.

- [ ] **Step 4: Verify image dimensions**

Run:

```bash
sips -g pixelWidth -g pixelHeight ppt/images/*.png
```

Expected: `pixelWidth: 2100`, `pixelHeight: 900` for both files.

- [ ] **Step 5: Commit the image pipeline and assets**

```bash
git add ppt/scripts/compose-screenshots.mjs ppt/images
git commit -m "feat: add product evidence images"
```

### Task 3: Build the Swiss deck shell and first four slides

**Files:**
- Create: `ppt/index.html`
- Create: `ppt/assets/motion.min.js`

- [ ] **Step 1: Copy the registered template and local motion fallback**

Run:

```bash
mkdir -p ppt/assets
cp '/Users/wujingyu/.codex/skills/guizang-ppt-skill/assets/template-swiss.html' ppt/index.html
cp '/Users/wujingyu/.codex/skills/guizang-ppt-skill/assets/motion.min.js' ppt/assets/motion.min.js
```

- [ ] **Step 2: Replace the theme and sample slides**

Apply the lemon-green preset:

```css
--paper:#fafaf8;
--paper-rgb:250,250,248;
--ink:#0a0a0a;
--ink-rgb:10,10,10;
--grey-1:#f0f0ee;
--grey-2:#d4d4d2;
--grey-3:#737373;
--accent:#C5E803;
--accent-rgb:197,232,3;
--accent-on:#0a0a0a;
```

Set `<title>` to `城更智算舱 · 文旅存量空间投前决策` and remove both sample sections.

- [ ] **Step 3: Add isolated deck-specific CSS**

Add classes for:

- `.workflow-rail`, `.workflow-step`, `.is-done`, `.is-current`, `.is-next`.
- `.product-window`, `.product-toolbar`, `.product-status`, `.selection-ring`.
- `.calculation-number`, `.diagnosis-score`, `.mode-tab`, `.report-module`.

The workflow rail is a 1px top hairline with eight square nodes. Completed nodes use `var(--ink)`, the current node uses `var(--accent)`, and future nodes use `var(--grey-2)`. No border radius, box shadow, gradient, or second accent color is allowed.

- [ ] **Step 4: Implement slides 01-04**

Use these exact contracts:

| Slide | Layout | Theme | Product action |
|---|---|---|---|
| 01 | S01 | accent | workflow 00 to 01 activation |
| 02 | S08 | light | traditional flow fades while evidence flow activates |
| 03 | S11 | dark | eight workflow nodes walk from 01 to 08 |
| 04 | S17 | light | three system layers reveal, then scores 91 and 76 settle |

Each section must include its `data-layout`, `data-animate`, `data-product-action` where applicable, page chrome, and one `.workflow-rail` configured with `data-current="N"`.

- [ ] **Step 5: Run the contract test**

Run the deck test. Expected: still FAIL because slides 05-08 are not implemented, proving the test remains sensitive.

### Task 4: Add slides 05-08 and the continuous product interactions

**Files:**
- Modify: `ppt/index.html`

- [ ] **Step 1: Implement slide 05 as S22**

Use `images/05-cost-investment-21x9.png` with `data-image-slot="s22-hero-21x9"`. The calculation action reveals and counts to the three real values in this order: `163-367 万`, `720 万`, `3.2 年`. Labels must distinguish engineering cost from total investment.

- [ ] **Step 2: Implement slide 06 as S13**

Render three equal plan cards with real figures:

- 稳健保育型: 380 万 / 190 万年收入 / 3.9 年.
- 复合活化型: 720 万 / 430 万年收入 / 3.2 年.
- 城市地标型: 1280 万 / 890 万年收入 / 3.7 年.

The animation reveals all three equally, then simulates a click on `复合活化型`; only after that action may the card become accent-filled and display `客户已确认`.

- [ ] **Step 3: Implement slide 07 as S22**

Use `images/07-visual-modes-21x9.png` with `data-image-slot="s22-hero-21x9"`. Simulate tabs in the order `日间场景 → 夜间运营 → 材料策略 → 夜间运营`, then stop with `夜间运营` active. Include the boundary note that concept visuals are not construction or approval drawings.

- [ ] **Step 4: Implement slide 08 as S10**

Use the registered split closing: left lemon-green ASCII field and statement `把判断，变成决策资产`; right side contains exactly three takeaways: `可解释`, `可选择`, `可交付`. The final workflow rail shows all steps complete.

- [ ] **Step 5: Extend the animation engine without changing template navigation**

Add deck-specific recipes after the existing `RECIPES` declaration:

- `workflow-activate`: sequentially activate rail nodes.
- `evidence-decision`: mirror reveal with right-side activation.
- `diagnosis-build`: reveal data/rule/delivery layers, then pop scores.
- `calculation-run`: reveal screenshot, progress line, then KPI values.
- `plan-select`: reveal cards equally, then apply `.is-selected` to the second card.
- `visual-switch`: cycle mode tabs and stop on night.
- `report-assemble`: gather four modules into the final report state.

Every recipe must immediately reveal the final state in low-power mode and must clear timers when another slide starts.

- [ ] **Step 6: Run the contract test and verify GREEN**

Expected: one passing deck contract test.

- [ ] **Step 7: Commit the complete deck**

```bash
git add ppt/index.html ppt/assets/motion.min.js
git commit -m "feat: build interactive product deck"
```

### Task 5: Run static, regression, and browser verification

**Files:**
- Modify only if verification finds a defect: `ppt/index.html`, image composition script, or deck test.

- [ ] **Step 1: Run the Swiss validator**

```bash
'/Users/wujingyu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' \
  '/Users/wujingyu/.codex/skills/guizang-ppt-skill/scripts/validate-swiss-deck.mjs' \
  ppt/index.html
```

Expected: `Swiss deck validation passed: 8 slide(s).`

- [ ] **Step 2: Run placeholder and style checks**

```bash
rg -n '\[必填\]|TBD|TODO' ppt/index.html
rg -n 'font-size:(10px|11px|12px|13px)|max\((9|10|11|12|13)px' ppt/index.html
rg 'class="slide' ppt/index.html
'/Users/wujingyu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' -e "const h=require('fs').readFileSync('ppt/index.html','utf8').replace(/<!--[^]*?-->/g,''); const slides=[...h.matchAll(/<section\\b[^>]*class=\\\"[^\\\"]*\\bslide\\b[^\\\"]*\\\"[^>]*>[^]*?<\\/section>/g)].map(x=>x[0]); if(slides.some(s=>/border-radius|box-shadow|linear-gradient/.test(s))) process.exit(1);"
```

Expected: no placeholders, no deck-specific rounded corners/shadows/gradients inside slide markup, no undersized text, and eight slides with the approved theme rhythm.

- [ ] **Step 3: Run all Node tests**

```bash
'/Users/wujingyu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' --test tests/*.test.mjs
```

Expected: all existing product tests and the deck contract test pass.

- [ ] **Step 4: Open and inspect the deck in the in-app Browser**

Open `file:///Users/wujingyu/Desktop/WORK/可持续/创新赛/dev/ppt/index.html`, wait for each slide animation to settle, and verify:

- Slide count and arrow navigation.
- ESC index visibility.
- `B` low-power mode and final-state visibility.
- Workflow rail continuity from 01 through 08.
- Slide 05 and 07 screenshot readability and nav safe zones.
- Slide 06 selected state occurs only after all three choices appear.
- No title overflow at 1280x720 and 1920x1080.
- Browser console contains no errors or warnings.

- [ ] **Step 5: Commit verification fixes if any**

```bash
git add ppt tests/ppt-deck.test.mjs
git commit -m "fix: polish product deck presentation"
```

- [ ] **Step 6: Confirm a clean worktree**

```bash
git status --short
```

Expected: no uncommitted files.
