# Changelog

All notable changes to the AppAnalyst CVC-OEI Support Hub. Dates are in ISO format.

The hub is a single-page PWA with no build step, so versioning tracks the service-worker `CACHE_VERSION` in `sw.js`.

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
