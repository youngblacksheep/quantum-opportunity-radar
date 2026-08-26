import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";

async function loadExportApi() {
  const source = await readFile(new URL("../export.js", import.meta.url), "utf8");
  const context = { globalThis: {} };
  vm.runInNewContext(source, context, { filename: "export.js" });
  return context.globalThis.QRadarExport;
}

const sampleOpportunity = {
  projectName: "量子 <项目>",
  level: "municipal",
  province: "广东",
  city: "深圳",
  authority: "单位 & 研究院",
  publishedAt: "2026-08-26",
  applicationStartAt: null,
  deadlineAt: null,
  stage: "open",
  topicTags: ["量子通信", "PQC"],
  applicantRequirements: "企业、高校",
  regionalRequirements: "广东省",
  fundingAmount: null,
  sourceUrl: "https://example.com/notice?a=1&b=2",
  lastVerifiedAt: "2026-08-26T01:00:00.000Z",
};

test("buildExportDocument maps the filtered opportunity to fixed Excel columns", async () => {
  const api = await loadExportApi();
  const result = api.buildExportDocument({
    items: [sampleOpportunity],
    filters: { q: "量子/深圳", stage: "open" },
    now: new Date("2026-08-26T08:00:00+08:00"),
    effectiveStage: () => "closed",
    formatDate: (value) => value ? `日期:${value}` : "未注明",
    stageMap: { closed: "已截止" },
  });

  assert.equal(result.rowCount, 1);
  assert.equal(result.filename, "量子信息与安全课题_当前筛选_量子-深圳-正在申报-2026-08-26.xls");
  assert.match(result.content, /^\uFEFF<!DOCTYPE html>/);
  assert.match(result.content, /<th>课题名称<\/th>.*<th>官方来源<\/th>/s);
  assert.match(result.content, /<tbody><tr>/);
  assert.match(result.content, /量子 &lt;项目&gt;/);
  assert.match(result.content, /单位 &amp; 研究院/);
  assert.match(result.content, /已截止/);
  assert.match(result.content, /href="https:\/\/example\.com\/notice\?a=1&amp;b=2"/);
  assert.match(result.content, /日期:2026-08-26/);
  assert.doesNotMatch(result.content, /undefined|null/);
});

test("buildExportDocument sanitizes filter text and creates a readable date filename", async () => {
  const api = await loadExportApi();
  const result = api.buildExportDocument({
    items: [],
    filters: { q: "a/b:c*?\"", stage: "" },
    now: new Date("2026-08-26T00:00:00Z"),
    effectiveStage: (item) => item.stage,
    formatDate: () => "未注明",
    stageMap: {},
  });

  assert.equal(result.rowCount, 0);
  assert.equal(result.filename, "量子信息与安全课题_当前筛选_a-b-c-2026-08-26.xls");
  assert.match(result.content, /<tbody><\/tbody>/);
});
