# Investment Sandbox V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the V2 investment page with an isolated three-slider sandbox that animates four recalculated KPIs and updates an ECharts revenue donut.

**Architecture:** Put formulas and revenue-mix mapping in a pure `investment-sandbox.mjs` module. Keep sandbox inputs in workflow state without changing normalized project data, and use a small view controller to animate KPI text and reuse one ECharts instance.

**Tech Stack:** Static HTML/CSS, ES modules, ECharts 5.6.0, Node test runner, LocalStorage draft persistence.

---

### Task 1: Formula and state boundary

**Files:**
- Create: `investment-sandbox.mjs`
- Create: `tests/investment-sandbox-v2.test.mjs`
- Modify: `data.mjs`
- Modify: `storage.mjs`

- [ ] Write failing tests for default metrics, input clamping, 100% revenue mix, and state persistence.
- [ ] Run the focused test and confirm it fails because the module and state do not exist.
- [ ] Implement the pure formulas, default sandbox state, and draft persistence.
- [ ] Run the focused test and confirm it passes.
- [ ] Commit the formula boundary.

### Task 2: Page structure and styles

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `tests/workflow-v1.test.mjs`

- [ ] Add failing structure assertions for three ranges, four KPI values, donut container, disclaimer, and mobile layout.
- [ ] Run the workflow test and confirm RED.
- [ ] Replace the current metric/risk layout with the sandbox markup and responsive styling.
- [ ] Run the workflow test and confirm GREEN.
- [ ] Commit the page surface.

### Task 3: Realtime rendering

**Files:**
- Modify: `investment-sandbox.mjs`
- Modify: `app.js`
- Modify: `tests/investment-sandbox-v2.test.mjs`

- [ ] Add failing tests for metric formatting and reduced-motion settings.
- [ ] Implement animated KPI rendering, slider labels, donut reuse, and readable fallback legend.
- [ ] Bind range input events to isolated sandbox state and persist each update.
- [ ] Run focused and full tests.
- [ ] Commit runtime integration.

### Task 4: Browser verification and versioning

**Files:**
- Modify only if browser verification finds a defect.

- [ ] Verify all three sliders update KPI values and the donut in real time.
- [ ] Verify desktop and mobile layouts have no horizontal overflow.
- [ ] Verify project budget and vacancy remain unchanged after slider interaction.
- [ ] Check console errors and run all automated tests.
- [ ] Mark this plan complete and create a readable version tag.
