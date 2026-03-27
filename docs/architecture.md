# Architecture

## System Overview

AppAnalyst is a single-page application with 13 interactive tools loaded via classic `<script>` tags. No build step, no bundler, no server required.

```
Browser (file://)
  │
  ├── index.html          HTML shell + section structure
  ├── css/*.css            8 stylesheets (tokens → responsive)
  └── js/
      ├── data/*.js        9 data files (pure arrays/objects)
      ├── app.js           Entry point + observers
      ├── [tool].js        Tool-specific modules
      └── [ui].js          Navigation, modes, keyboard, animations
```

## Load Order

Scripts load synchronously in this order. Dependencies flow downward.

```
1. Data files        (no dependencies)
2. app.js            (globals: toast, IntersectionObserver, interaction counter)
3. journey.js        (defines showTip/hideTip used by other modules)
4. fhda.js           (defines markHomeRows, sortFHDAFirst — called by monitor/lookup)
5. Tool modules      (monitor, tracer, flow, patterns, kb, barriers, outreach, lookup, ai-vision, comms)
6. UI modules        (nav, animations, modes)
7. keyboard.js       (references all toggle functions from modes, nav)
```

## Component Map

| Component | Data File | Module | HTML Section |
|-----------|-----------|--------|-------------|
| College Lookup | `colleges.js` | `lookup.js` | `#lookup` |
| Exchange Data | — | — (static HTML) | `#cvcData` |
| Architecture | `flow.js` | `flow.js` | `#flow` |
| Monitor | `colleges.js` | `monitor.js` | `#monitor` |
| Tracer | `tracer.js` | `tracer.js` | `#tracer` |
| Patterns | `patterns.js` | `patterns.js` | `#patterns` |
| KB Builder | `kb.js` | `kb.js` | `#kb` |
| Communications | — | `comms.js` | `#comms` |
| Escalation | — | — (static HTML) | `#escalation` |
| Outreach | `outreach.js` | `outreach.js` | `#outreach` |
| Counselor Toolkit | — | — (static HTML) | `#counselorToolkit` |
| AI Vision | `ai-vision.js` | `ai-vision.js` | `#aiVision` |
| Barriers | `barriers.js` | `barriers.js` | `#barrierOverview`, `#lifecycle`, `#matrix`, `#equity`, `#correlator` |
| Student Journey | `journey.js` | `journey.js` | `#journey` |

## Data Flow

```
collegeDB (31 colleges)
  ├── lookup.js: renderLookup() → searchable card grid
  │   └── fhda.js: sortFHDAFirst() + markHomeLookups()
  └── (static reference data)

allColleges (11 monitor colleges)
  └── monitor.js: renderMonitor() → health dashboard
      └── fhda.js: markHomeRows() + addFHDAHealth()

stages (5 tracer stages)
  └── tracer.js: setStage() → diagnostic walkthrough
      └── tracer.js: deployFix() → live resolution workflow

flowData (4 architecture nodes)
  └── flow.js: showFlowInfo() → clickable diagram

chartData + insights
  └── patterns.js: renderChart() + renderInsights()

barriers + lcData + matrixColleges + eqData + corrData
  └── barriers.js: barrier cards, lifecycle, matrix, equity, correlator

calMonths (7 months)
  └── outreach.js: calendar timeline + trigger details

journeySteps (6 steps)
  └── journey.js: side-by-side comparison

aiData (4 categories)
  └── ai-vision.js: tabbed card display

kbTemplates (4 templates)
  └── kb.js: editable template builder
```

## Presentation Modes

| Mode | Key | CSS Class | Purpose |
|------|-----|-----------|---------|
| Zoom | `Z` | `.zoom-mode` | Screen-share readability (larger fonts, thicker borders) |
| Theater | `F` | `.theater-on` | Focus mode (dims non-hovered sections) |
| Accessibility | `A` | `.a11y-mode` | WCAG AAA (high contrast, no animations, thick focus rings) |

All modes toggle a class on `<body>`. CSS handles the rest via body-class specificity.

## Extending

### Add a new tool section

1. **Data**: Create `js/data/newtool.js` with a `var` declaration
2. **Module**: Create `js/newtool.js` with render/interaction functions
3. **HTML**: Add a `<section>` in `index.html` following the existing pattern
4. **CSS**: Add section-specific styles to `css/sections.css`
5. **Script tags**: Add both `<script src>` tags to `index.html` (data before module)
6. **Nav**: Add a nav link in the `.nav-links` div and a TOC entry

### Add a new data source

Add a `var` declaration in the appropriate `js/data/*.js` file. All data is global scope — no imports needed. Reference it directly in your module.

### Add a keyboard shortcut

Add a case to the `keydown` handler in `js/keyboard.js`. Follow the existing pattern:
```js
case 'KeyX': scrollToSection('newSection'); toast('New Section'); break;
```

### Utilities available to all modules

- `toast(message)` — Show a brief notification (defined in `app.js`)
- `trackInteraction(name)` — Increment interaction counter (defined in `app.js`)
- `showTip(event, html)` / `hideTip()` — Hover tooltips (defined in `journey.js`)
- `sortFHDAFirst(array)` — Sort Foothill/De Anza to top (defined in `fhda.js`)
- `markHomeRows()` / `markHomeLookups()` — Add FHDA badges (defined in `fhda.js`)

### Modify FHDA awareness

`js/fhda.js` controls all FHDA-specific behavior: home badges, sorting, health display. The helper functions are called by `renderMonitor()` and `renderLookup()` at the end of each render cycle. Colleges with `.fhda = true` in the data arrays are treated as home colleges.

### CSS naming conventions

- `.sec` — Section container
- `.tool-frame` > `.tool-bar` > `.tool-body` — Standard tool wrapper
- `.tool-label.tl-{color}` — Colored label in tool bar
- `.eyebrow` — Section type label above h2
- `.sec-num.sec-num-{color}` — Numbered badge in eyebrow
- `.[section]-*` — Section-specific classes (e.g., `.lookup-*`, `.tracer-*`)
