// ═══════════════════════════════════════════════════════
// APP.JS — Entry point: globals, init, misc utilities
// ═══════════════════════════════════════════════════════

// ═══ GLOBALS ═══
var nav = document.getElementById('nav');
window.addEventListener('scroll', function() {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

// IntersectionObserver for .fu fade-up elements
var fuObs = new IntersectionObserver(function(entries) {
  entries.forEach(function(el) {
    if (el.isIntersecting) {
      el.target.classList.add('vis');
      fuObs.unobserve(el.target);
    }
  });
}, { threshold: .06, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.fu').forEach(function(el) { fuObs.observe(el); });

// Toast notification
function toast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function() { t.classList.remove('show'); }, 2200);
}

// Interaction counter system
(function() {
  var count = 0;
  var el = document.getElementById('interactionCount');
  var wrap = document.getElementById('interactionCounter');
  if (!el || !wrap) return;
  function bump() {
    count++;
    el.textContent = count;
    wrap.style.opacity = '1';
    clearTimeout(wrap._t);
    wrap._t = setTimeout(function() { wrap.style.opacity = '.5'; }, 2000);
  }
  document.addEventListener('click', function(e) {
    var t = e.target;
    if (t.closest && (t.closest('.b-card') || t.closest('.ai-card') || t.closest('.counsel-card') ||
       t.closest('.lookup-card') || t.closest('.status-row') || t.closest('.esc-card') ||
       t.closest('.jt-btn') || t.closest('.ai-tab') || t.closest('.outreach-tab') ||
       t.closest('.cal-month') || t.closest('.trigger-card') || t.closest('.kb-nav-item') ||
       t.closest('.qa-card') || t.closest('.lookup-filter') || t.closest('.insight-card') ||
       t.closest('.toc-item') || t.closest('.progress-dot') ||
       t.closest('[onclick]') || t.closest('button'))) {
      bump();
    }
  });
  var searchInput = document.getElementById('collegeLookup');
  if (searchInput) {
    var lastQ = '';
    searchInput.addEventListener('input', function() {
      if (this.value.length > 2 && this.value !== lastQ) {
        lastQ = this.value;
        bump();
      }
    });
  }
})();

// Interaction counter milestones
(function() {
  var wrap = document.getElementById('interactionCounter');
  var el = document.getElementById('interactionCount');
  if (!wrap || !el) return;
  var milestones = [5, 15, 30, 50];
  var obs = new MutationObserver(function() {
    var count = parseInt(el.textContent || '0');
    if (milestones.indexOf(count) >= 0) {
      wrap.classList.add('ic-milestone');
      setTimeout(function() { wrap.classList.remove('ic-milestone'); }, 700);
    }
  });
  obs.observe(el, { childList: true, characterData: true, subtree: true });
})();

// Scroll hint
(function() {
  var hint = document.getElementById('scrollHint');
  if (!hint) return;
  var dismissed = false;
  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    hint.classList.add('hint-gone');
    setTimeout(function() { hint.remove(); }, 600);
  }
  window.addEventListener('scroll', function() {
    if (window.scrollY > 100) dismiss();
  }, { passive: true });
  setTimeout(dismiss, 6000);
})();

// Keyboard shortcut hint on first visit
(function() {
  var shown = false;
  setTimeout(function() {
    if (shown) return;
    shown = true;
    toast('Press ? for keyboard shortcuts');
  }, 6000);
  document.addEventListener('keydown', function() { shown = true; }, { once: true });
})();

// Greeting toast on first visit
(function() {
  var g = document.getElementById('greetingToast');
  if (!g) return;
  setTimeout(function() { g.classList.add('gt-show'); }, 800);
  setTimeout(function() { g.classList.remove('gt-show'); }, 3200);
})();

// Dynamic page title — shows current section in tab
(function() {
  var base = 'Henry Fan \u00b7 CVC-OEI';
  var sectionNames = {
    'lookup': 'College Lookup',
    'cvcData': 'Exchange Data',
    'journey': 'Student Journey',
    'flow': 'Architecture',
    'monitor': 'Monitor',
    'tracer': 'Diagnostics',
    'patterns': 'Intelligence',
    'kb': 'Documentation',
    'comms': 'Response',
    'escalation': 'Escalation',
    'outreach': 'Outreach',
    'counselorToolkit': 'Student & Counselor Toolkit',
    'aiVision': 'AI Vision',
    'barrierOverview': 'Barriers',
    'barriers': 'Barriers'
  };
  var current = '';
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var name = sectionNames[entry.target.id];
        if (name && name !== current) {
          current = name;
          document.title = name + ' \u2014 ' + base;
        }
      }
    });
  }, { threshold: 0.2, rootMargin: '-56px 0px -50% 0px' });
  Object.keys(sectionNames).forEach(function(id) {
    var el = document.getElementById(id);
    if (el) obs.observe(el);
  });
  window.addEventListener('scroll', function() {
    if (window.scrollY < 200 && current !== '') {
      current = '';
      document.title = base + ' \u00b7 FHDA';
    }
  }, { passive: true });
})();
