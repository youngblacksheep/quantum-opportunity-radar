(function attachQuantumRadarExport(global) {
  const DEFAULT_LEVEL_LABELS = Object.freeze({
    national: "国家级",
    provincial: "省级",
    municipal: "市级",
  });
  const DEFAULT_STAGE_LABELS = Object.freeze({
    consultation: "征求意见",
    suggestion: "建议征集",
    upcoming: "待发布",
    open: "正在申报",
    closed: "已截止",
    awarded: "已获批",
  });

  const escapeHtml = (value) => String(value ?? "")
    .replace(/[&<>'"]/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    })[character]);

  function safeText(value) {
    if (Array.isArray(value)) return value.filter(Boolean).join("、");
    return value == null ? "" : String(value);
  }

  function formatDatePart(value, timeZone) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map(({ type, value: part }) => [type, part]));
    return `${values.year}-${values.month}-${values.day}`;
  }

  function sanitizeFilenamePart(value) {
    return safeText(value)
      .trim()
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/[\u0000-\u001f\u007f]+/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);
  }

  function displayValue(value, formatDate) {
    const text = safeText(value);
    if (!text) return "";
    return formatDate && typeof formatDate === "function" ? safeText(formatDate(text)) : text;
  }

  function buildRegion(item) {
    return [item.province, item.city].filter(Boolean).join(" · ") || "全国";
  }

  function buildFilename(filters, now, stageLabels, levelLabels) {
    const parts = [];
    const filterValues = [
      filters.q,
      stageLabels[filters.stage] || filters.stage,
      levelLabels[filters.level] || filters.level,
      filters.province,
      filters.topic,
    ];
    for (const value of filterValues) {
      const clean = sanitizeFilenamePart(value);
      if (clean) parts.push(clean);
    }
    const suffix = parts.length ? `_${parts.join("-")}-` : "_";
    return `量子信息与安全课题_当前筛选${suffix}${formatDatePart(now, "Asia/Shanghai")}.xls`;
  }

  function buildRows(items, options) {
    const stageLabels = { ...DEFAULT_STAGE_LABELS, ...(options.stageMap || {}) };
    const levelLabels = { ...DEFAULT_LEVEL_LABELS, ...(options.levelMap || {}) };
    const formatDate = options.formatDate;
    return items.map((item) => {
      const currentStage = typeof options.effectiveStage === "function"
        ? options.effectiveStage(item)
        : item.stage;
      return [
        safeText(item.projectName),
        levelLabels[item.level] || safeText(item.level),
        buildRegion(item),
        safeText(item.authority),
        displayValue(item.publishedAt, formatDate),
        displayValue(item.applicationStartAt, formatDate),
        displayValue(item.deadlineAt, formatDate),
        stageLabels[currentStage] || safeText(currentStage),
        safeText(item.topicTags),
        safeText(item.applicantRequirements),
        safeText(item.regionalRequirements),
        safeText(item.fundingAmount),
        safeText(item.sourceUrl),
        displayValue(item.lastVerifiedAt, formatDate),
      ];
    });
  }

  function buildExcelHtml(rows) {
    const headers = [
      "课题名称",
      "层级",
      "地区",
      "主管单位",
      "发布时间",
      "申报开始时间",
      "截止时间",
      "阶段",
      "主题标签",
      "申请要求",
      "区域要求",
      "资金信息",
      "官方来源",
      "数据核验时间",
    ];
    const headerHtml = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("");
    const rowHtml = rows.map((row) => {
      const cells = row.map((value, index) => {
        if (index === 12 && value) {
          const href = escapeHtml(value);
          return `<td><a href="${href}">${href}</a></td>`;
        }
        return `<td>${escapeHtml(value)}</td>`;
      }).join("");
      return `<tr>${cells}</tr>`;
    });
    return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><style>
      table{border-collapse:collapse;font-family:"Microsoft YaHei",Arial,sans-serif;font-size:11pt}
      th,td{border:1px solid #b7c6d8;padding:6px 9px;vertical-align:top;mso-number-format:"@"}
      th{background:#0b57d0;color:#fff;font-weight:700;white-space:nowrap}
      td{mso-number-format:"@"}
      a{color:#0563c1;text-decoration:underline}
    </style></head><body><table><thead><tr>${headerHtml}</tr></thead><tbody>${rowHtml.join("")}</tbody></table></body></html>`;
  }

  function buildExportDocument({
    items,
    filters = {},
    now = new Date(),
    effectiveStage,
    formatDate,
    stageMap,
    levelMap,
  }) {
    if (!Array.isArray(items)) throw new TypeError("items must be an array");
    const options = { effectiveStage, formatDate, stageMap, levelMap };
    const rows = buildRows(items, options);
    return {
      filename: buildFilename(
        filters,
        now,
        { ...DEFAULT_STAGE_LABELS, ...(stageMap || {}) },
        { ...DEFAULT_LEVEL_LABELS, ...(levelMap || {}) },
      ),
      content: `\uFEFF${buildExcelHtml(rows)}`,
      rowCount: rows.length,
    };
  }

  global.QRadarExport = Object.freeze({ buildExportDocument });
}(globalThis));
