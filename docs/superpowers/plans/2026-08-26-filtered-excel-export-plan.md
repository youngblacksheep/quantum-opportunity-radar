# GitHub Pages 当前筛选结果 Excel 导出 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dependency-free “导出当前筛选结果” button to the GitHub Pages opportunity list that downloads the visible, effective-stage-filtered opportunities as an Excel-compatible `.xls` file.

**Architecture:** Keep filtering in the existing page state and extract the export-only serialization into a small browser-safe `export.js` module. The page computes its filtered list once through `getFilteredOpportunities()`, renders it, and passes the same list to the exporter. The exporter returns a filename and escaped HTML-table document; the click handler creates a Blob locally and never calls the network.

**Tech Stack:** Plain HTML/CSS/JavaScript, browser Blob/Object URL APIs, Node built-in test runner and VM for pure exporter tests.

---

### Task 1: Export document serializer

**Files:**
- Create: `export.js`
- Create: `test/export.test.mjs`
- Create: `package.json` (add the public mirror test script; the static repository currently has no package manifest)

- [ ] **Step 1: Write failing serializer tests**

  Test `buildExportDocument()` for fixed column order, effective stage override, escaped dangerous text, source hyperlink output, empty strings for missing nullable fields, and deterministic sanitized filenames.

- [ ] **Step 2: Run the focused test and verify it fails for the missing module/API**

  Run `npm test` from the repository root. Expected: the export test fails because `export.js` and `buildExportDocument()` do not exist yet.

- [ ] **Step 3: Implement the minimal browser-safe serializer**

  Add `export.js` as an IIFE exposing `globalThis.QRadarExport.buildExportDocument`. It must:

  - map the 14 columns defined in the approved design;
  - use the supplied `effectiveStage(item)` callback instead of `item.stage` when present;
  - escape `&`, `<`, `>`, `'`, and `"` in all text and URL attributes;
  - render the official source as an escaped hyperlink;
  - prepend a UTF-8 BOM and Excel-compatible HTML MIME metadata;
  - sanitize filter values and date text for the `.xls` filename.

- [ ] **Step 4: Run focused tests and verify they pass**

  Run `npm test`. Expected: all exporter tests pass with no network or browser dependency.

- [ ] **Step 5: Commit the serializer**

  ```bash
  git add export.js test/export.test.mjs package.json
  git commit -m "feat: add dependency-free filtered Excel serializer"
  ```

### Task 2: Page button and filtered-list integration

**Files:**
- Modify: `index.html` (opportunity controls, responsive styles, filtering/rendering script)

- [ ] **Step 1: Add the button and status region**

  Place a button with id `export-opportunities` and an `aria-live` status beside `result-count`, preserving the existing filter controls and mobile wrapping.

- [ ] **Step 2: Extract the existing filter predicate into `getFilteredOpportunities()`**

  Move the current query/stage/level/province/topic filtering logic out of `renderOpportunities()` without changing its sort order or `effectiveStage()` behavior. Make `renderOpportunities()` consume that function so the rendered cards and export share one source list.

- [ ] **Step 3: Connect the download handler**

  Load `export.js` before the page script. On button click, call `getFilteredOpportunities()`, refuse to create a file when it is empty, build a document with the page’s existing `effectiveStage`, `fmtDate`, and `stageMap`, and download it with `Blob`, `URL.createObjectURL`, and a temporary anchor. Restore the button label after success or failure and report the row count through the live status region.

- [ ] **Step 4: Update button state from the rendered result**

  Disable the button while data is loading or when the filtered list is empty; re-enable it whenever at least one current result exists. Do not alter the loaded data or make a fetch request.

- [ ] **Step 5: Add static integration assertions**

  Extend `test/export.test.mjs` or add `test/page-export.test.mjs` to assert the script, button id, shared filter function, effective-stage callback, Blob MIME, and empty-result branch are present in `index.html`.

- [ ] **Step 6: Run the focused and existing tests**

  Run `npm test`. Expected: serializer and page integration tests pass.

- [ ] **Step 7: Commit the page integration**

  ```bash
  git add index.html test/export.test.mjs test/page-export.test.mjs
  git commit -m "feat: export filtered opportunity results from Pages"
  ```

### Task 3: Build and browser acceptance

**Files:**
- Modify: `README.md` only if the public usage note needs to mention the new button.

- [ ] **Step 1: Run repository tests and diff checks**

  Run `npm test` and `git diff --check`. Expected: zero test failures and no whitespace errors.

- [ ] **Step 2: Serve the static site locally**

  Run `python3 -m http.server 8765` from the repository root and open `http://127.0.0.1:8765/index.html#opportunities`.

- [ ] **Step 3: Verify desktop interaction**

  Confirm the button is visible, the result count and button state update after changing a filter, clicking the button downloads a `.xls`, and the downloaded document contains exactly the displayed row count and official links.

- [ ] **Step 4: Verify mobile layout**

  Confirm the button wraps within the result line at a narrow viewport and there is no page-level horizontal overflow.

- [ ] **Step 5: Record the final validation result**

  Report the test count, generated file extension/content, and any browser limitation. Do not claim the public URL is updated until the branch is pushed and the Pages deployment is independently verified.
