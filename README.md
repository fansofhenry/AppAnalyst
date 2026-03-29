# AppAnalyst — CVC-OEI Application Support Portfolio

Interactive portfolio demonstrating support operations for the **CVC Exchange** at **Foothill–De Anza CCD**. Built for the Application Support Analyst I role on the CVC-OEI team.

## What This Is

A single-page application with 10 numbered tool sections (plus supporting tools and a personal origin story) covering the full support lifecycle for California's cross-enrollment system (115+ community colleges, 33,000+ annual cross-enrollments across 4 SIS platforms).

**Tools (numbered 1–9, plus Barriers section 0):**
1. **College Lookup** — Search 31 colleges by name, district, SIS type, issue status
2. **Exchange Data** — 2,100% growth, Cal-GETC enrollment distribution
3. **Architecture Diagram** — Four-layer data flow with clickable failure points
4. **Morning Monitor** — Real-time college health dashboard with live alerts and weekly pulse
5. **Incident Tracer** — Layer-by-layer diagnosis with auto-run and live resolution
6. **Pattern Analyzer** — Ticket trends mapped to the CVC academic calendar
7. **Incident Response** — Same failure written for 5 audiences (student, IT, registrar, team, Board); P1/P2/P3 escalation matrix
8. **Outreach Planner** — 17 triggers across 7 months for proactive student engagement
9. **AI Vision** — Predictive monitoring, fraud deterrence, equity-first AI (grounded in CISOA 2026)
0. **Barrier Intelligence** — 10 systemic friction points with lifecycle map, equity scorer, campus matrix, and ticket correlator

**Additional tools:**
- **Student Journey** — Side-by-side comparison: working enrollment vs broken
- **KB Builder** — 4 editable fix templates (integration, auth, sync, onboarding)
- **Counselor Toolkit** — Verification workflows, registration checklists, counselor scripts

**Origin Story** — Personal "why" section between the tools and footer. Narrative arc with family photos, curated quotes, and a first-gen story anchoring the portfolio in purpose.

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
| `?` | Show all shortcuts |
| `G` | Open section panel |
| `/` | Focus college search |
| `T` | Back to top |
| `F` | Theater/focus mode |
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
