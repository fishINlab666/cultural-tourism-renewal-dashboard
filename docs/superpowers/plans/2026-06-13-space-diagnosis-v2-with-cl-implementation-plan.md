# Space Diagnosis V2 with cl Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an isolated V2 space-diagnosis page with a 60/40 map dashboard, animated score 82, ECharts radar, and three semantic conclusions while preserving the V1 workflow and calculations.

**Architecture:** Keep workflow ownership in `app.js`, add pure diagnostic data mapping plus chart/map lifecycle logic in `diagnostic-view.mjs`, and store presentation-ready overview data in `data.mjs`. Load fixed local browser builds of ECharts and Mapbox GL; Mapbox activates only when `window.APP_CONFIG.mapboxAccessToken` is injected, otherwise the same-size local fallback map remains visible.

**Tech Stack:** Static HTML/CSS, ES modules, Node test runner, ECharts 5.6, Mapbox GL JS 3.x, browser verification through the in-app browser.

---

### Task 1: Lock the diagnostic result model

**Files:**
- Create: `tests/diagnostic-view-v2.test.mjs`
- Create: `diagnostic-view.mjs`
- Modify: `data.mjs`
- Modify: `analysis.mjs`

- [ ] **Step 1: Write failing tests for overview data and radar mapping**

Test that the local provider returns score `82`, the Sanfang Qixiang project center, three severity conclusions, and radar values in the required order. Assert that “改造难度” equals `100 - 工程可实施性`.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
/Users/wujingyu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/diagnostic-view-v2.test.mjs
```

Expected: FAIL because `diagnostic-view.mjs` and `overview` do not exist.

- [ ] **Step 3: Add the minimal overview model and pure helpers**

Add `overview` to the local analysis result with score, map center, label, and conclusions. Export pure helpers that resolve diagnostic labels to the six fixed radar values and determine whether Mapbox can be enabled from runtime configuration.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run the same command and expect all focused tests to pass.

- [ ] **Step 5: Commit the model boundary**

```bash
git add tests/diagnostic-view-v2.test.mjs diagnostic-view.mjs data.mjs analysis.mjs
git commit -m "feat: add diagnostic overview model"
```

### Task 2: Build the result-first page structure

**Files:**
- Modify: `tests/workflow-v1.test.mjs`
- Modify: `index.html`
- Modify: `styles.css`

- [ ] **Step 1: Write failing structure and responsive-style assertions**

Assert that step 3 contains `diagnosticWorkbench`, `projectMap`, `overallScore`, `diagnosticRadar`, `diagnosticConclusions`, and compact evidence/version regions. Assert that CSS declares the 60/40 grid, serif heading stack, map fallback, semantic conclusion variants, and the mobile single-column breakpoint.

- [ ] **Step 2: Run the workflow test and verify RED**

```bash
/Users/wujingyu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/workflow-v1.test.mjs
```

Expected: FAIL on missing V2 containers and styles.

- [ ] **Step 3: Replace the six-card result surface with semantic V2 markup**

Keep the existing progress element for the running state. Add the map card with local fallback artwork and status chip, the score and radar containers, accessible radar values, three conclusion rows, and a collapsible evidence section.

- [ ] **Step 4: Add desktop, tablet, mobile, reduced-motion, and print styles**

Use `3fr 2fr` on desktop, a minimum-height map surface, vertical mobile layout below 760px, non-color-only conclusion labels, and the Source Han Serif-first stack for headings.

- [ ] **Step 5: Run the workflow test and verify GREEN**

Run the focused workflow test and expect all assertions to pass.

- [ ] **Step 6: Commit the result surface**

```bash
git add tests/workflow-v1.test.mjs index.html styles.css
git commit -m "feat: redesign space diagnosis layout"
```

### Task 3: Add local chart and map dependencies

**Files:**
- Create: `vendor/echarts.min.js`
- Create: `vendor/mapbox-gl.js`
- Create: `vendor/mapbox-gl.css`
- Create: `vendor/LICENSE.echarts.txt`
- Create: `vendor/LICENSE.mapbox-gl.txt`
- Modify: `index.html`
- Modify: `README.md`

- [ ] **Step 1: Add a failing test for local dependency paths and token safety**

Extend the workflow test to require local `vendor/` references, `window.APP_CONFIG`, and the absence of any hardcoded token-shaped value.

- [ ] **Step 2: Run the workflow test and verify RED**

Expected: FAIL because the dependency files and local references are missing.

- [ ] **Step 3: Download fixed official package builds into `vendor/`**

Use the bundled npm client to fetch fixed ECharts and Mapbox GL packages, copy only browser distribution and license files, then delete temporary package archives/directories.

- [ ] **Step 4: Load dependencies locally and document runtime token injection**

Load local CSS/scripts before `app.js`. Initialize `window.APP_CONFIG` to an empty object without a token value. Document that deployment may inject `mapboxAccessToken`; the default prototype intentionally uses the fallback map.

- [ ] **Step 5: Run the workflow test and verify GREEN**

- [ ] **Step 6: Commit vendored dependencies**

```bash
git add vendor index.html README.md tests/workflow-v1.test.mjs
git commit -m "build: vendor diagnostic map and chart libraries"
```

### Task 4: Integrate score, radar, map fallback, and Mapbox lifecycle

**Files:**
- Modify: `diagnostic-view.mjs`
- Modify: `app.js`
- Modify: `tests/diagnostic-view-v2.test.mjs`

- [ ] **Step 1: Write failing lifecycle tests**

Test that Mapbox activation requires both a token and library, reduced-motion disables animation settings, and repeated initialization reuses the existing view state.

- [ ] **Step 2: Run the focused test and verify RED**

Expected: FAIL on missing lifecycle functions.

- [ ] **Step 3: Implement the diagnostic renderer**

Render score and conclusions, animate score once, initialize/reuse ECharts with the fixed six-axis option, expose readable fallback values, initialize Mapbox once when allowed, fly from Fuzhou city scale to the project center, and preserve the local fallback on missing token or map errors.

- [ ] **Step 4: Integrate the renderer with workflow visibility**

While analysis is running, show the existing four-stage progress and hide final results. Once complete and step 3 is visible, hide the large progress card, render evidence/version details, and call the diagnostic renderer after layout is measurable.

- [ ] **Step 5: Run focused tests and verify GREEN**

```bash
/Users/wujingyu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/diagnostic-view-v2.test.mjs tests/analysis-v1.test.mjs tests/workflow-v1.test.mjs
```

- [ ] **Step 6: Commit runtime integration**

```bash
git add diagnostic-view.mjs app.js tests/diagnostic-view-v2.test.mjs
git commit -m "feat: render interactive space diagnosis dashboard"
```

### Task 5: Regression and browser verification

**Files:**
- Modify if required: files from Tasks 1-4 only

- [ ] **Step 1: Run the full test suite**

```bash
/Users/wujingyu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/*.test.mjs
```

Expected: all tests pass, including unchanged cost and investment baselines.

- [ ] **Step 2: Start V1 and V2 on separate local ports**

Run V1 on port 5175 and V2 on port 5176 using `python3 -m http.server --bind 127.0.0.1` from their respective directories.

- [ ] **Step 3: Verify V2 desktop behavior in the in-app browser**

Load the Sanfang Qixiang sample project, complete intake, enter step 3, and verify the 60/40 layout, score 82, ECharts radar, local fallback map, three semantic conclusions, compact evidence, and no console errors.

- [ ] **Step 4: Verify responsive behavior**

Check desktop and mobile viewport widths. Confirm the mobile page stacks map above results and has no horizontal overflow.

- [ ] **Step 5: Verify V1 remains separately viewable**

Open the V1 port and confirm its third step retains the pre-V2 six-card layout.

- [ ] **Step 6: Review the branch diff and commit any verification-only fixes**

Run `git diff --check`, `git status --short`, and `git log --oneline --decorate -5`. Commit only if browser verification required code changes.
