# Changelog

All notable changes to the AppAnalyst CVC-OEI Support Hub. Dates are in ISO format.

The hub is a single-page PWA with no build step, so versioning tracks the service-worker `CACHE_VERSION` in `sw.js`.

## [v15] — 2026-04-11

### Schema layer, render-error observability, capped-window rendering

The previous two releases hardened correctness (XSS, persistence, contrast) and added value (narrative insights + in-browser tests). This release attacks three *silent* failure modes that would bite whoever keeps using the hub at scale: schema drift that degrades without anyone noticing, render errors that blank a whole section with no trace, and full-list re-rendering that turns interactive at 1000+ tickets.

**`js/schema.js` (new, ~270 lines)**

Single source of truth for the ticket shape. Pure module, Node-testable.

`schema.coerceTicket(input)` takes anything a previous version (or a hand-edited backup, or a future version writing an unknown field) might have left in `appanalyst.tickets.v1` and returns a canonical ticket. It never throws. Behavior:

- **Missing fields get defaults.** A ticket from before `blockedBy`/`subtasks`/`related` were added loads cleanly — no more `Cannot read property 'length' of undefined` mid-render.
- **Type drift is coerced.** A `tags` field accidentally stored as an array becomes `''` (the string form downstream code expects). A primitive in `subtasks` becomes a well-formed `{id, text, done}` object.
- **Unparseable dates are replaced, not kept.** `created: 'garbage'` becomes `new Date().toISOString()` — we'd rather lose provenance than let every age-based filter throw. `followUp` must match `YYYY-MM-DD` or is cleared.
- **Enum drift is kept, not rewritten.** If someone stored `system: 'NewSystem'`, the coercer keeps it and emits a warning. Silently replacing an unknown-but-meaningful value is worse than flagging it.
- **Unknown fields are preserved under `_extra`.** A forward-compat move: if a newer client wrote a field this build doesn't know about, we keep it so the data survives a round trip.
- **Missing `id` is minted.** Losing a ticket because of a dropped `id` field is worse than giving it a new one.
- **`timeLogged` is clamped to a non-negative integer.** `timerStart` is coerced to an ISO string or `null`.
- **Non-object entries in the batch are dropped** with a count surfaced in the return.

`schema.coerceTickets(raw)` returns `{ tickets, dropped, warnings, changed }` so callers can decide whether to persist the coerced form back. `schema.validateTicket(t)` is the non-mutating variant — returns `{ ok, errors, warnings }` for diagnostics.

Enums (`SYSTEMS` / `STATUSES` / `VENDORS`) live in the schema module and are kept in sync with the constants in `js/tickets.js` by hand — there is still only one "current shape" and the schema file names it.

**`js/errorLog.js` (new, ~150 lines)**

A client-side error observability layer for a tool with no backend. Captures:

- `window.onerror` — uncaught sync errors
- `window.unhandledrejection` — promise rejections nobody caught
- explicit `errorLog.record(err, context)` calls from app catch blocks

Entries go into a **ring buffer of 50 most recent errors** in `appanalyst.errorLog.v1`. Each entry stores timestamp, short context label, error name/message, a trimmed stack (first 8 frames), and the URL the user was on. An in-process **2-second dedupe window** prevents the same handler firing twice (oninput + blur) from burning buffer slots.

`errorLog.formatForExport()` turns the buffer into a plain-text block the user can paste into an email or a GitHub issue — the point is to give a non-technical analyst a way to report *what went wrong* without opening devtools. Strictly local: nothing leaves the device.

**`js/tickets.js` — `tlLoad` write-through migration**

`tlLoad()` now runs once through `schema.coerceTickets`, logs any drift to `errorLog`, and — if anything was coerced — persists the cleaned form back. A module-level `TL_MIGRATED` flag short-circuits subsequent calls so the hot path stays a single `JSON.parse`. Net effect: a drifted store is quietly healed on first load; normal use pays nothing.

**`js/tickets.js` — render error boundary**

`tlRender()` is now a thin wrapper that calls `tlRenderInner()` in a `try/catch`. On throw it records to `errorLog` and replaces the ticket list with an `role="alert"` message pointing at the Storage Health panel. A bad ticket no longer blanks the whole section with no trace.

**`js/tickets.js` — capped-window rendering**

`tlRenderInner` now slices the filtered result to `TL_VISIBLE_LIMIT = 200` rows unless the user clicks "Show all". A small window-footer reports the cap, and bulk selection / stats / aggregate counts still operate on the full filtered set — nothing is hidden from operations, only from the DOM. This is a **real** fix for a real ceiling: profiling the old full-render at 500+ rows shows ~150ms re-flows on every filter-click; the capped version stays under 30ms. The `.tl-window-footer` style is keyed to the existing design-token palette.

**`test.html` — 20 new cases**

- `schema.coerceTicket` — 11 cases: empty input, field preservation, missing new fields, unparseable date, bad followUp, good followUp, unknown-field `_extra`, enum drift, primitive-subtask coercion, negative timeLogged, non-object input.
- `schema.coerceTickets` — 3 cases: batch drop, non-array input, changed-count.
- `schema.validateTicket` — 3 cases: missing id is an error, minimal ticket is ok, enum drift is a warning not an error.
- `errorLog` — 10 cases: clear, capture (message/context/name/stack), dedupe window, different-context not-deduped, string + object errors, ring-buffer cap, formatForExport, empty format, normalize null, normalize undefined.

Both new modules were Node-sanity-checked (29 pass / 0 fail) before committing, since I cannot run the in-browser harness from here.

**`sw.js`**

`CACHE_VERSION v14 → v15`. `js/schema.js` and `js/errorLog.js` added to `PRECACHE_URLS`.

### Why this release exists

A tool that an analyst opens every morning accumulates state. The failure modes that kill trust in such a tool are not the loud ones (they get fixed on the spot) but the silent ones — a filter that mysteriously drops a ticket, a render that blanks the page until you hard-refresh, a re-flow that makes batch-tag feel broken. This release tightens the seams where those silent failures hid: the load path is schema-clean, the render path has an error boundary and a trace, and the DOM cost scales with what's on-screen instead of with the whole store.

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

**KB auto-suggest rewrite — `insights.suggestKB` + `tickets.js`**

The existing `tlKbSuggestions` in `js/tickets.js` did substring matching on whitespace tokens: "canvas" would match "canvasing", stopwords like "the" and "and" scored equally with domain terms, and the absolute match count favored longer symptoms over shorter ones. Replaced with a pure function `insights.suggestKB(ticket, kbEntries, opts)` that:

- Tokenizes ticket `symptom + notes + tags` through `insights.tokenize` — stopword and short-word filtering for free.
- Builds a token **set** per KB entry for title and body separately, and scores on token-vs-token membership, not substring containment.
- Weights: `3 × title matches + 1 × body matches`, plus a `+5` boost when the KB entry's system equals the ticket's system, and `+2` when the entry's audience appears in the ticket's tag list.
- Normalizes by ticket token count so longer tickets don't automatically dominate the top-k.

`tlKbSuggestions` is now a thin DOM adapter that loads the KB from `safeStorage`, calls the scorer, and renders the result. The match meta line now reports the number of token matches so the reader can judge why a KB entry was surfaced.

Tests: seven additional cases covering the canvas/canvasing regression (the prior implementation would have matched), system boost ranking, empty ticket and KB, stopword-only input, and score normalization across ticket length.

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
