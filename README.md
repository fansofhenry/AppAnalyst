# AppAnalyst — CVC-OEI Support Hub

Personal working toolbench for an **Application Support Analyst** on the **CVC-OEI team at Foothill–De Anza CCD**. Originally built as an interview portfolio; Pass 1 of the post-hire rewrite turns the simulated demos into real day-to-day tools backed by localStorage. Everything stays in your browser — no backend, no PII, no sync.

## What This Is

A single-page web app with working tools (localStorage-backed) alongside the existing reference sections. Runs on GitHub Pages and `file://`.

**Pass 1 real tools (this release):**
- **College Directory** — All 115 California community colleges, FHDA pinned, SIS tagged from public portal evidence where determinable. Click any college to add personal notes, contacts per Exchange staff role (A&R, FA, Counseling, DSPS, General), and correct/confirm the SIS tier.
- **Ticket Log** — Personal working queue: college, system, symptom, status, vendor escalation, notes, resolution. Age highlighting (yellow 3d+, red 7d+). Filter, search, CSV export, JSON backup/restore.
- **Runbook / KB** — Markdown entries tagged by system (Banner, PeopleSoft, Exchange, Ethos, SuperGlue, CCCApply, Canvas, SSO) and by the 5 Exchange staff audiences. Copy-to-clipboard for ticket replies. JSON backup/restore.

**Reference / interview-era sections (unchanged):** System Status, Architecture, Incident Diagnostics, Student Journey, Ticket Intelligence, Communications & Escalation, Outreach Planner, Exchange Data, AI Vision, Barrier Intelligence. These still use simulated data — Pass 2 will rewire them against real ticket-log data.

## Data boundary

**Public hosting.** GitHub Pages serves the static site world-readable. Never commit real contact names, student IDs, ticket numbers, or internal URLs to this repo.

**Personal data.** The Directory overlay, Ticket Log, and KB Runbook all persist in `localStorage` keys (`appanalyst.colleges.overlay.v1`, `appanalyst.tickets.v1`, `appanalyst.kb.v1`). That means:
- Private to this browser on this machine. Clearing browser data erases it.
- No sync across devices. Export JSON backups regularly.
- Safe to use for working notes, but still avoid pasting PII — exported CSVs are only as private as where they end up.

## SIS tagging — verify before relying

The 115-college SIS tier list (Banner, PeopleSoft, Colleague) was seeded from public portal evidence (WebSMART, PASSPORT, eServices, MyCoast, etc.). Tags are marked **verified** only where a portal name or district IT page publicly documents the platform. Everything else is **unverified** or **unknown** and flagged visually.

**Critical caveat:** public portal names don't distinguish **Banner Direct vs Banner Ethos** (or Colleague Direct vs Colleague Ethos). This is the key CVC integration distinction per the April 2025 CVC Exchange release notes — Ethos variants still require manual unit reconciliation. Confirm with district IT before using the tag for escalation decisions. Every entry is editable in-browser to capture corrections as you learn.

## Running Locally

Open `index.html` in any modern browser. No server required — works via `file://` protocol.

```
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows
```

## Keyboard Shortcuts

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

## Project Structure

```
appanalyst/
├── index.html              # HTML shell (~1,500 lines)
├── css/
│   ├── tokens.css          # Design tokens (colors, typography, spacing)
│   ├── base.css            # Reset, body, layout primitives
│   ├── components.css      # Tool frames, cards, badges, grids
│   ├── sections.css        # Section-specific styles (incl. origin story)
│   ├── nav.css             # Navigation, TOC, progress dots
│   ├── animations.css      # @keyframes, transitions, entrance effects
│   ├── modes.css           # Zoom, theater, accessibility, live resolution
│   └── responsive.css      # Media queries by breakpoint
├── js/
│   ├── data/               # Pure data arrays (no logic)
│   │   ├── colleges.js     # allColleges, collegeDB (31 colleges)
│   │   ├── flow.js         # flowData (4 architecture nodes)
│   │   ├── tracer.js       # stages (5 diagnostic stages)
│   │   ├── patterns.js     # chartData, categories, insights
│   │   ├── kb.js           # kbTemplates (4 templates)
│   │   ├── barriers.js     # barriers, lifecycle, matrix, equity, correlation
│   │   ├── outreach.js     # calMonths (7 months, 17 triggers)
│   │   ├── journey.js      # journeySteps (6 comparison steps)
│   │   └── ai-vision.js    # aiData (4 categories, 16 cards)
│   ├── app.js              # Entry point, observers, interaction tracking
│   ├── monitor.js          # College health dashboard
│   ├── tracer.js           # Incident diagnosis + live resolution
│   ├── flow.js             # Architecture diagram
│   ├── patterns.js         # Ticket pattern analyzer
│   ├── kb.js               # Knowledge base builder
│   ├── barriers.js         # Barrier cards, lifecycle, equity, correlator
│   ├── outreach.js         # Outreach planner calendar
│   ├── journey.js          # Student journey comparison
│   ├── lookup.js           # College quick lookup
│   ├── ai-vision.js        # AI vision tool
│   ├── comms.js            # Message copy, escalation interaction
│   ├── nav.js              # TOC, progress dots, scroll tracking
│   ├── keyboard.js         # All keyboard shortcuts
│   ├── modes.js            # Zoom, theater, accessibility toggles
│   ├── animations.js       # Counters, ripple, bar animations
│   ├── delight.js          # Joy layer — confetti, micro-interactions, discovery
│   └── fhda.js             # FHDA district awareness (home badges, sorting)
├── img/                    # Family photos for origin story (placeholder-ready)
└── docs/
    └── architecture.md     # System architecture and extension guide
```

## Architecture

See [docs/architecture.md](docs/architecture.md) for detailed component documentation, data flow, and extension guide.

**Key decisions:**
- **Classic `<script>` tags** (not ES modules) — `file://` CORS blocks ES modules
- **Data as JS globals** — `fetch()` fails on `file://`; data loaded via script tags
- **Inline `onclick` handlers** — pragmatic at this scale
- **CSS organized by concern** — 8 files mapping to architectural responsibilities

## FHDA District Awareness

Foothill and De Anza colleges are highlighted throughout: pinned to the top of lookup results, marked with home badges in the monitor, and health status prominently displayed. This reflects the role's focus on the FHDA district.

## Equity Framing

The Exchange is equity infrastructure — when it breaks, students at smaller colleges lose access to courses that larger colleges offer directly. The barrier intelligence section scores each friction point by impact on first-generation, CCPG-eligible, and DSPS students.

## Data Sources

All data is simulated — no real student records. Built with:
- [CVC Exchange course search](https://search.cvc.edu) (public)
- Wheelhouse Center enrollment research (Oct 2025)
- CVC documentation and Spring 2025 FA Dashboard rollout
- CISOA 2026 themes for AI vision section
