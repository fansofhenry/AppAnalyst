# Changelog

All notable changes to the AppAnalyst CVC-OEI Support Hub. Dates are in ISO format.

The hub is a single-page PWA with no build step, so versioning tracks the service-worker `CACHE_VERSION` in `sw.js`.

## [v14] — 2026-04-11

### Narrative insights layer + pure-function test harness

The "Real Patterns" panel already charted ticket volume by system / college / week. It showed what the data *was*, not what the data *meant*. This release adds a narrative analytics layer on top of those charts and backs it with an in-browser test harness — the first tests this repo has ever had.

**`js/insights.js` (new, 420 lines)**

A pure-compute module that turns the ticket log into seven orthogonal insight types:

1. **Time sinks** — per-system sum of resolution hours as a share of total. Answers "where is my time actually going", which is different from "where are my tickets" — a system with a few long tickets can outweigh a system with many short ones. Fires with ≥ 5 resolved tickets.
2. **Statistically stale open tickets** — for each system with ≥ 5 resolved tickets, computes the p80 of prior resolution hours and flags open tickets whose current age exceeds that threshold. A learned per-system threshold, not a hardcoded 3d/7d. "This one is taking longer than 80% of past comparable tickets" is load-bearing information.
3. **Velocity trend** — this week's resolutions vs the median of the trailing 4 weeks. Reports up/down/flat with a percentage and the raw weekly counts, so the reader can sanity-check the claim.
4. **Recurring symptom phrases** — bigram document-frequency across all tickets, filtered by a stopword list. Surfaces "we keep seeing this same language" — usually a KB candidate. Fires with ≥ 6 tickets and at least one bigram appearing in ≥ 3 distinct tickets.
5. **Hot colleges** — MAD-based outlier detection on per-college open-ticket load. Uses median + 2·MAD, not mean + 2σ, because a small sample with one giant ticket will trash a mean-based detector. Short-circuits when MAD = 0 (flat distribution = no signal).
6. **Escalation candidates** — waiting-vendor tickets untouched for ≥ 5 days. Vendor queues go quiet unless you pull the thread.
7. **System resolution distributions** — p50 / p90 per system, with ≥ 5 resolved required per row. Transparent reference, not a finding per se. p50 is the honest median, p90 is the tail.

Design principles:

- **Pure compute, separate render.** The whole compute layer takes `(tickets, now)` and returns plain data. `now` is injectable so tests can pin time without mocking `Date`.
- **Graceful degradation.** Each insight has its own minimum-data threshold and returns `null` below it instead of firing on noise. Better silence than a false signal.
- **Robust statistics.** Percentiles with linear interpolation, MAD instead of standard deviation, median instead of mean for anything the user will read.
- **Every headline is checkable.** Detail lines always include the raw numbers so a skeptical reader can verify the claim without clicking through.

**`test.html` (new)**

A plain-HTML in-browser test harness. No framework. Runs from `file://`, from GitHub Pages, and from a local server with no build step. Loads `js/storage.js` and `js/insights.js` and exercises:

- `insights.median` — empty, single, odd, even, unsorted, mutation.
- `insights.percentile` — p0, p1, p50 (odd + even), p80, p90, empty.
- `insights.mad` — flat, simple sequence, outlier-resistance.
- `insights.tokenize` + `bigrams` — stopword + short-word filtering, empty input.
- `insights.fmtHours` — sub-hour, single-digit, ≥ 10, multi-day, negative, null.
- Each insight computer — fires on golden input, returns null on below-threshold input.
- `insights.computeAll` — empty + populated end-to-end.
- `safeStorage` — round-trip an object, fallback on missing key, fallback on corrupt JSON, usageBytes increases after set.
- `insights.renderInto` — smoke test that empty data produces the help card, and that a ticket with `<script>` / `onerror` in its user-typed fields does not surface raw script in the output HTML.

The runner surfaces pass/fail counts in the document title (`✓ 40/40 — AppAnalyst tests`) so it's readable from a tab bar without switching focus.

**`js/realPatterns.js` + `css/components.css`**

`rpRender()` now mounts the insights layer at the top of the panel via `insights.renderInto`. New card styles keyed to `.ins-*` classes, responsive grid, and severity-colored left accents tied to the existing design-token palette.

**`sw.js`**

`CACHE_VERSION` bumped `v13 → v14`; `js/insights.js` added to `PRECACHE_URLS`.

### Why this release exists

The previous iterations fixed correctness problems (XSS, silent persistence failures, contrast). This one adds *value* — the hub can now tell an analyst something they couldn't see by staring at a bar chart. The test harness exists because going deep on an analytics module without tests is how you ship silent numeric bugs.

## [v12] — 2026-04-11

### Hardening pass — persistence, XSS, accessibility, contrast

This release focuses on silent-failure modes that a working analyst would never notice until their ticket log vanished, plus a handful of real stored-XSS vectors found by auditing `innerHTML` sites that interpolated user-typed fields.

**Persistence — `js/storage.js` (new)**

Introduced `safeStorage`, a wrapper that catches three failure modes the original code silently dropped:

1. Safari private-browsing / partitioned storage, where `localStorage` throws on access, not on `setItem`.
2. `QuotaExceededError` on mobile, where the 5 MB cap is often shared across a site's stores.
3. Corrupt JSON from a partial or interrupted write.

Failures now surface as a toast instead of a silent drop. Wired into every hot-path store: tickets, archive, templates, presets, KB, college overlay, onboarding, reconcile presets, barrier state, outreach, comms, tracer. Small UI-preference keys (theme, role, view toggles) still use raw `localStorage` — losing them is cosmetic.

**XSS — stored, via paste-and-persist**

Found and fixed real vectors where user-typed fields (ticket symptom/college/system/status, preset names, college names) were interpolated raw into `innerHTML`:

- `js/tickets.js` — ticket row cells now escape `symptom`, `college`, `system`, `status` via `tlEsc` before interpolation. Primary vector: pasting a malicious symptom into a ticket would execute on re-render.
- `js/realMonitor.js` — active-college rows no longer interpolate the college name into an inline `onclick` handler. Switched to `data-*` attribute + delegated listener, which removes the whole class of attribute-context injection.
- `js/reconcile.js` — same treatment for preset-name chips.
- `js/backup.js` — backup import now routes restore through `safeStorage.set` per store and surfaces a "Partial restore" toast when some stores fail, so a malformed import can't silently corrupt state.

**Contrast — `css/tokens.css`**

Raised dark-theme `--text-3` from `#8A867F` (~3.2:1) to `#B3AFA6` (~6.5:1) so body prose in dark mode clears WCAG AA.

**Accessibility — `index.html`**

- `<main id="main-content" role="main" tabindex="-1">` — skip-link already existed but had no valid target.
- ARIA-live toast region kept; skip-link unchanged.
- Font loading: preconnect to `fonts.googleapis.com` + `fonts.gstatic.com`, and `print.css` deferred with `media="print"`.

**Service worker — `sw.js`**

`CACHE_VERSION` bumped `v11 → v12`. PRECACHE_URLS extended with 8 scripts that were already loaded by `index.html` but missing from the precache list (`storage.js`, `pwa.js`, `manager.js`, `handoff.js`, `notifications.js`, `annualReview.js`, `storageHealth.js`, `quickCapture.js`, `focusMode.js`).

**Documentation**

- `README.md` rewritten to lead with "personal working instrument built and maintained by Henry Fan, with mentorship from Jeff Anderson" — factual operational framing over portfolio framing. Added data-boundary table listing every `appanalyst.*` key.
- `docs/architecture.md` gained a Persistence & Safety section covering the `safeStorage` wrapper, the XSS threat model (paste-and-persist + malicious backup import), and the escape-on-render pattern.
- Footer in `index.html` now carries the same mission framing plus a machine-readable data-boundary panel.

### Why this release exists

Iteration 1 focused on the fragile seams that a live operational tool cannot afford: dropping a ticket on a quota error, or rendering attacker-controlled text from a pasted KB note. Iteration 2 (this release) hardened the last two `onclick`-in-attribute vectors that the first pass missed, and documents the whole posture so the next change set starts from a clear baseline.

## Earlier

Prior history tracked in commit log. Run `git log --oneline` in the repo for commit-level detail.
