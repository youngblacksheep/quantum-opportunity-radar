import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";

const page = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("opportunity page includes the filtered export control", () => {
  assert.match(page, /<script src="export\.js"><\/script>/);
  assert.match(page, /id="export-opportunities"/);
  assert.match(page, /aria-live="polite"/);
});

test("rendering and exporting share one effective-stage filtered list", () => {
  assert.match(page, /function getFilteredOpportunities\(\)/);
  assert.match(page, /const filtered=getFilteredOpportunities\(\);/);
  assert.match(page, /effectiveStage/);
  assert.match(page, /application\/vnd\.ms-excel/);
  assert.match(page, /当前筛选没有可导出的课题/);
});
