# Dashboard V0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static single-page Web dashboard V0 for cultural tourism building renewal pre-investment simulation.

**Architecture:** Use one HTML entry, one CSS file, and one JavaScript file with local sample data. The page runs through a static file server, keeps all calculations in-browser, and does not call real AI, map, analytics, or external APIs.

**Tech Stack:** HTML, CSS, vanilla JavaScript, Node.js built-in test runner.

---

## File Structure

- Create: `tests/dashboard-v0.test.mjs` validates required modules and no external calls.
- Create: `index.html` defines the single-page dashboard shell and eight product modules.
- Create: `styles.css` implements the warm operations-dashboard visual system and responsive layout.
- Create: `app.js` contains sample data, rendering, local calculations, plan switching, and export helpers.

### Task 1: Structure Test

**Files:**
- Create: `tests/dashboard-v0.test.mjs`

- [ ] **Step 1: Write the failing test**

```bash
node --test tests/dashboard-v0.test.mjs
```

Expected: FAIL because `index.html`, `styles.css`, and `app.js` do not exist yet.

- [ ] **Step 2: Implement the page files**

Create `index.html`, `styles.css`, and `app.js` with the modules listed in the design稿: project input, data completion, spatial diagnosis, three-plan comparison, engineering cost, investment model, visual plan, and report output.

- [ ] **Step 3: Verify the test passes**

```bash
node --test tests/dashboard-v0.test.mjs
```

Expected: PASS.

### Task 2: Local Browser Check

**Files:**
- Use: `index.html`
- Use: `styles.css`
- Use: `app.js`

- [ ] **Step 1: Start the static server**

```bash
python3 -m http.server 5173
```

Expected: `Serving HTTP on :: port 5173`.

- [ ] **Step 2: Open in browser**

Open `http://127.0.0.1:5173/` and check desktop and mobile layout.

- [ ] **Step 3: Fix visual issues found in browser**

Run the test again after any fix:

```bash
node --test tests/dashboard-v0.test.mjs
```

Expected: PASS.
