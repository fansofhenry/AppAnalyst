# AppAnalyst — CVC-OEI Support Hub

A personal working instrument built and maintained by **Henry Fan**, Application Support Analyst on the **CVC-OEI team at Foothill–De Anza CCD**, with mentorship from **Jeff Anderson**.

Live: **https://fansofhenry.github.io/AppAnalyst/**

This is an operational tool first and a public portfolio second. The Ticket Log, College Directory, and Runbook are the same ones used day-to-day during incident triage. Everything runs in the browser — no backend, no accounts, no network calls for the working tools.

## What this is

A single-page web app that bundles three categories of content:

1. **Working tools** — backed by `localStorage`, these are the things actually used on the job:
   - **Ticket Log** — personal working queue (college, system, symptom, status, vendor escalation, tags, time tracking, sub-tasks, links, follow-up dates). Age highlighting, filter presets, CSV export, JSON backup/restore, undo.
   - **College Directory** — all 115 California community colleges, FHDA pinned, SIS tier tagged from public portal evidence where determinable. Click any college to add notes, Exchange role contacts (A&R, FA, Counseling, DSPS, General), and correct the SIS tier.
   - **Runbook / KB** — markdown entries tagged by system and audience, with copy-to-clipboard for ticket replies. Seeds from templates on first load; fully editable.
   - **Today dashboard, global search, escalation helper, onboarding checklist, handoff packet generator, activity log, storage health.**
2. **Reference sections** — architecture diagram, incident diagnostics, student journey, ticket intelligence, communications templates, outreach planner, Exchange metrics, AI vision, barrier intelligence. These use illustrative data seeded from public CVC documentation.
3. **Role modes** — switch between Analyst / A&R / FA / Counselor / DSPS / Student views. The site foregrounds content relevant to each audience without hiding the rest.

## What this is not

Not a replacement for district-managed ticketing (Jira, ServiceNow, Salesforce). Not connected to any real CVC Exchange API. Not a multi-user system — there is no server and no sync. **Not a research paper or a principal-investigator project** — it's a working analyst's daily tool that also happens to be a useful interview / graduate-school artifact.

## Data boundary

**Public hosting.** GitHub Pages serves the site world-readable. Never commit real contact names, student IDs, ticket numbers, or internal URLs to this repo.

**Personal data.** All working tools persist in browser `localStorage` under the `appanalyst.*` namespace:

| Key | Contents |
|-----|----------|
| `appanalyst.tickets.v1` | Personal ticket queue |
| `appanalyst.kb.v1` | Runbook entries (markdown) |
| `appanalyst.colleges.overlay.v1` | Personal notes, contacts, SIS overrides |
| `appanalyst.onboarding.v1` | Checklist progress |
| `appanalyst.incidents.v1` | Incident diagnostic state |
| `appanalyst.theme.v1` / `appanalyst.role.v1` | UI preferences |

Everything in that namespace:
- Is private to this browser on this machine. Clearing browser data erases it.
- Does not sync across devices. Export JSON backups regularly (`Backup` action in the footer).
- Is safe to use for working notes, but still avoid pasting PII — exported CSVs and JSON files are only as private as where they end up.

All writes flow through `js/storage.js`, which catches `QuotaExceededError` and surfaces a visible toast instead of silently dropping data. If you see "Storage full", export a backup and archive old tickets.

## SIS tagging — verify before relying

The 115-college SIS tier list (Banner Direct, Banner Ethos, Colleague Direct, Colleague Ethos, PeopleSoft) was seeded from public portal evidence (WebSMART, PASSPORT, eServices, MyCoast, etc.). Tags are marked **verified** only where a portal name or district IT page publicly documents the platform. Everything else is **unverified** or **unknown** and flagged visually in the directory.

**Critical caveat:** public portal names don't distinguish **Banner Direct vs Banner Ethos** (or Colleague Direct vs Colleague Ethos). This is the key CVC integration distinction per the April 2025 CVC Exchange release notes — Ethos variants still require manual unit reconciliation. Confirm with district IT before using the tag for escalation decisions. Every entry is editable in-browser to capture corrections as you learn.

## Running locally

Open `index.html` in any modern browser. No server required — works via `file://` protocol as well as GitHub Pages.

```
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows
```

The service worker (`sw.js`) is only active over HTTPS or `localhost`; `file://` falls back to direct script loading.

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `1`–`9`, `0` | Jump to section |
| `L` | Jump to Ticket Log |
| `N` | New ticket (quick-add from anywhere) |
| `?` | Show all shortcuts |
| `G` | Open section panel |
| `/` | Focus college search |
| `T` | Back to top |
| `Z` | Zoom presentation mode |
| `A` | Accessibility (WCAG AAA) mode |
| `Shift+D` | Toggle dark theme |

## Project structure

```
appanalyst/
├── index.html              # HTML shell + hub styles
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker (cache-first)
├── css/
│   ├── tokens.css          # Design tokens (colors, typography, spacing)
│   ├── base.css            # Reset, body, layout, focus-visible rings
│   ├── components.css      # Tool frames, cards, badges, grids
│   ├── sections.css        # Section-specific styles
│   ├── nav.css             # Navigation, TOC, progress dots, skip link
│   ├── animations.css      # @keyframes, honors prefers-reduced-motion
│   ├── modes.css           # Zoom, theater, accessibility, live resolution
│   ├── responsive.css      # Media queries
│   └── print.css           # Loaded via media="print" (non-blocking)
├── js/
│   ├── storage.js          # Safe localStorage wrapper (quota + corrupt JSON guards)
│   ├── app.js              # Entry point, scroll observers, toast queue
│   ├── data/               # Pure data arrays (colleges, KB seeds, etc.)
│   ├── tickets.js          # Ticket Log (largest module)
│   ├── lookup.js           # College Directory
│   ├── kb.js               # Knowledge base builder + markdown renderer
│   ├── backup.js           # Export/restore/clear across all stores
│   ├── real*.js            # Real-data versions of the reference tools
│   └── ...                 # Per-feature modules, one file each
└── docs/
    └── architecture.md     # Component documentation and extension guide
```

## Architecture decisions

- **Classic `<script>` tags** (not ES modules) — `file://` CORS blocks ES modules, and this codebase needs to run offline without a build step.
- **Data as JS globals** — `fetch()` fails on `file://`; data loaded via script tags.
- **Safe localStorage wrapper** (`js/storage.js`) — every write goes through `safeStorage.set`, which catches `QuotaExceededError`, Safari partitioned-storage failures, and corrupt JSON. Failures surface as a toast, not silent data loss.
- **CSS organized by concern** — 9 files mapping to architectural responsibilities. Tokens are the single source of truth; last-defined value wins.
- **PWA** — service worker precaches all static assets for offline use. Cache version bumps on every asset change.

See [docs/architecture.md](docs/architecture.md) for detailed component documentation, data flow, and extension guide.

## FHDA district awareness

Foothill and De Anza colleges are highlighted throughout: pinned to the top of lookup results, marked with home badges in the monitor, and health status prominently displayed. This reflects the role's focus on the FHDA district.

## Equity framing

The Exchange is equity infrastructure — when it breaks, students at smaller colleges lose access to courses that larger colleges offer directly. The barrier intelligence section scores each friction point by estimated impact on first-generation, CCPG-eligible, and DSPS students. These scores are rough signals for prioritization, not measured outcomes; they're meant to make the equity dimension visible during triage rather than to claim causal evidence.

## Data sources (illustrative sections)

- [CVC Exchange course search](https://search.cvc.edu) (public)
- Wheelhouse Center enrollment research (Oct 2025)
- CVC documentation and Spring 2025 FA Dashboard rollout
- April 2025 CVC Exchange release notes (Ethos reconciliation)
- CISOA 2026 themes for the AI vision section

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a full change history, keyed to the service-worker `CACHE_VERSION` in `sw.js`.

## License

Source is MIT-licensed. Seeded reference content (SIS tier tags, KB templates, college metadata) is drawn from public sources; contributions welcome to correct or extend tags via the in-browser editor or a pull request.
