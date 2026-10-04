# Radar Reliability Implementation Plan

**Goal:** Improve trustworthy status, independent snapshot loading, and mirror publishing.
**Architecture:** Keep the existing static page; use one effective stage function for cards, counts and export. Optional feeds fail independently and expose an explicit status.
**Tech Stack:** HTML, browser JavaScript, Node built-in test runner, GitHub Actions.

- [x] Add `test/reliability.test.mjs`: execute actual page script in a VM with DOM adapters and feed responses; reproduce stale counts and optional-feed failure. Run `node --test test/*.test.mjs` and confirm failures.
- [x] Update `index.html`: independent bounded snapshot fetches; validate feed envelopes; preserve available panels; explicit failure/retry and stale/seed labels; shared stage statistics; date-only cutoff at China end-of-day; sort and URL filters.
- [x] Update `sources.js`: retain coverage panel and navigation; label directory entries as configured, health unknown.
- [x] Update `.github/workflows/update-pages.yml`: trigger root JS, tests and package changes; run Node tests before snapshot build.
- [x] Run full tests and `git diff --check`; use a local server and browser with actual Pages snapshots for UI, filters, failure/retry and export verification.
- [x] Review the complete diff, commit on `codex/radar-reliability`, preserve a durable checkout and prepare a reviewable remote branch/PR if authentication permits. Record missing backend source separately.

## Verification evidence

2026-10-04: Node tests 16 passed, no failures; JS syntax and git diff whitespace checks passed. Chrome checked the real Pages snapshot (47 opportunities, 6 effectively open, 26 source failure records), URL restoration, deadline sorting, Excel download, optional-feed HTTP 503 and retry, primary-feed HTTP 503 and filtering/retry, and 390px mobile button bounds. The console only reported the deliberately simulated HTTP failures and missing preview favicon; no JavaScript page errors. Cloudflare direct API connection timed out from this environment. Backend source is not present in the repository.

Independent review found a date-only formatting mismatch (08:00 shown for unknown times); fixed shared formatter and added a regression test. No other important review findings.
