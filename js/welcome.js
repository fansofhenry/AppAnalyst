// ═══════════════════════════════════════════════════════
// WELCOME TOUR — One-time modal for first-time visitors.
// Explains what's real vs reference, the main tools, and
// data safety. localStorage flag prevents reappearance.
// ═══════════════════════════════════════════════════════

var WELCOME_KEY = 'appanalyst.welcome.seen.v2';
var WELCOME_STEP = 0;

var WELCOME_STEPS = [
  {
    title: 'Welcome to your workbench',
    body: 'This site started as an interview portfolio. It\u2019s been rebuilt into a real working tool you\u2019ll use on the job. Nothing here is hypothetical — every tool reads from or writes to your browser\u2019s local storage. Nothing leaves this machine.',
    footer: 'A 60-second tour of what\u2019s real and where things live.'
  },
  {
    title: 'The four tools you\u2019ll actually use',
    body: '<strong>Today</strong> — the dashboard at the top. What\u2019s on your plate.<br><br>' +
          '<strong>Ticket Log</strong> — personal working queue. Every ticket you touch, briefly. Aging highlights after 3 days.<br><br>' +
          '<strong>Runbook / KB</strong> — your personal markdown knowledge base. Tag by system and audience. Copy drafts into ticket replies.<br><br>' +
          '<strong>College Directory</strong> — all 115 California community colleges, SIS-tagged, with editable notes and contacts per college.',
    footer: 'Press <kbd>N</kbd> anywhere to start a new ticket. Press <kbd>&#8984;K</kbd> to search everything.'
  },
  {
    title: 'What\u2019s real, what\u2019s reference',
    body: 'Sections with a <strong>real / demo toggle</strong> default to real data pulled from your ticket log:<br><br>' +
          '&middot; <strong>Status</strong> — active colleges sorted by urgency<br>' +
          '&middot; <strong>Ticket Intelligence</strong> — real chart of your tickets by system/college/week<br>' +
          '&middot; <strong>Diagnostics</strong> — interactive 5-stage checklist you run through during an incident<br>' +
          '&middot; <strong>Communications</strong> — 5 fill-in templates for routine comms<br><br>' +
          'Each has a "Demo" view that keeps the original interview-era content for reference.',
    footer: 'The old Sacramento City walkthrough and fake dashboards still exist — just behind toggles.'
  },
  {
    title: 'Data safety — important',
    body: '<strong>Everything you type lives in this browser only.</strong> No backend, no sync, no telemetry. Clearing browser data erases everything.<br><br>' +
          'Safeguards:<br>' +
          '&middot; Export a JSON backup weekly (<strong>Backup</strong> button in the Today header)<br>' +
          '&middot; No PII in anything you commit to this site (it\u2019s public on GitHub Pages)<br>' +
          '&middot; Student names, IDs, and ticket numbers should stay off any text you paste<br><br>' +
          'There\u2019s a <strong>First 30 Days</strong> checklist below Today with 29 seeded onboarding tasks — check them off as you learn the job.',
    footer: 'Close this tour and press <kbd>?</kbd> to see all keyboard shortcuts.'
  }
];

function welcomeShouldShow() {
  try {
    return localStorage.getItem(WELCOME_KEY) !== '1';
  } catch (e) { return false; }
}

function welcomeDismiss(permanent) {
  var overlay = document.getElementById('welcomeOverlay');
  if (overlay) overlay.classList.remove('welcome-show');
  document.body.style.overflow = '';
  if (permanent) {
    try { localStorage.setItem(WELCOME_KEY, '1'); } catch (e) {}
  }
}

function welcomeOpen() {
  var overlay = document.getElementById('welcomeOverlay');
  if (!overlay) return;
  WELCOME_STEP = 0;
  welcomeRender();
  overlay.classList.add('welcome-show');
  document.body.style.overflow = 'hidden';
}

function welcomeNext() {
  if (WELCOME_STEP < WELCOME_STEPS.length - 1) {
    WELCOME_STEP++;
    welcomeRender();
  } else {
    welcomeDismiss(true);
  }
}

function welcomePrev() {
  if (WELCOME_STEP > 0) {
    WELCOME_STEP--;
    welcomeRender();
  }
}

function welcomeRender() {
  var step = WELCOME_STEPS[WELCOME_STEP];
  var wrap = document.getElementById('welcomeBody');
  if (!wrap) return;
  var total = WELCOME_STEPS.length;
  var isLast = WELCOME_STEP === total - 1;

  wrap.innerHTML =
    '<div class="welcome-progress">' +
      WELCOME_STEPS.map(function(_, i) {
        return '<span class="welcome-dot' + (i === WELCOME_STEP ? ' welcome-dot-active' : '') + (i < WELCOME_STEP ? ' welcome-dot-done' : '') + '"></span>';
      }).join('') +
    '</div>' +
    '<div class="welcome-title">' + step.title + '</div>' +
    '<div class="welcome-content">' + step.body + '</div>' +
    '<div class="welcome-foot-note">' + step.footer + '</div>' +
    '<div class="welcome-actions">' +
      (WELCOME_STEP > 0 ? '<button class="tl-btn" onclick="welcomePrev()">Back</button>' : '<button class="tl-btn" onclick="welcomeDismiss(true)">Skip tour</button>') +
      '<div style="flex:1"></div>' +
      '<span class="welcome-step-count">' + (WELCOME_STEP + 1) + ' of ' + total + '</span>' +
      '<button class="tl-btn tl-btn-new" onclick="welcomeNext()">' + (isLast ? 'Get started' : 'Next') + '</button>' +
    '</div>';
}

// Auto-show on first visit, with a small delay to let the page settle
if (welcomeShouldShow()) {
  setTimeout(welcomeOpen, 600);
}
