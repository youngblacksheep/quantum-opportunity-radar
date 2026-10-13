# Usability implementation plan
Goal: improve accurate deadline display and finding opportunities on mobile.
Architecture: shared pure quality functions used by browser and Worker API; existing cards grouped without dropping notices; exports keep full filtered records.
Tech stack: plain JavaScript, Node tests, Cloudflare Worker, Playwright.
- [ ] Add regression cases for clear/ambiguous/invalid deadlines, boilerplate removal and year/batch-safe grouping.
- [ ] Implement quality.js; apply normalization before filtering in browser and API, preserve original fields.
- [ ] Update index.html: grouped related notices, 12-group pagination, mobile advanced filters, reset, accessible labels and compact hero.
- [ ] Update build-update.py to package quality helpers, correct methodology and timestamp.
- [ ] Run both test suites; inspect desktop/mobile, pagination, reset, grouping and export behavior in browser.
- [ ] Deploy content-only Worker update after matching preflight, push mirror, verify live pages and API.
