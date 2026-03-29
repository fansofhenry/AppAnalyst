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

// Toast notification (queued)
var _toastQueue = [];
var _toastBusy = false;
function toast(msg, html) {
  _toastQueue.push({ msg: msg, html: !!html });
  if (!_toastBusy) _drainToast();
}
function _drainToast() {
  if (!_toastQueue.length) { _toastBusy = false; return; }
  _toastBusy = true;
  var item = _toastQueue.shift();
  var t = document.getElementById('toast');
  if (item.html) { t.innerHTML = item.msg; } else { t.textContent = item.msg; }
  t.classList.add('show');
  setTimeout(function() {
    t.classList.remove('show');
    setTimeout(_drainToast, 300);
  }, 2200);
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
  setTimeout(function() {
    g.classList.remove('gt-show');
    g.classList.add('gt-hide');
    setTimeout(function() { g.remove(); }, 500);
  }, 3200);
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
    'barriers': 'Barriers',
    'originStory': 'Origin Story'
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

// ═══ EXPLORATION PROGRESS TRACKER ═══
(function() {
  var sectionIds = ['lookup','cvcData','flow','monitor','tracer','patterns','comms','outreach','aiVision','barriers','originStory'];
  var visited = {};
  var total = sectionIds.length;
  var tracker = document.getElementById('exploreTracker');
  var fill = document.getElementById('etFill');
  var label = document.getElementById('etLabel');
  if (!tracker || !fill || !label) return;

  var milestoneMessages = {
    3: 'Nice \u2014 3 sections explored!',
    6: 'Halfway there \u2014 6 of 11!',
    8: 'Deep dive \u2014 8 of 11 sections!',
    11: 'Full exploration complete!'
  };

  function update() {
    var count = Object.keys(visited).length;
    var pct = (count / total) * 100;
    fill.setAttribute('stroke-dasharray', pct + ' ' + (100 - pct));
    label.textContent = count + '/' + total;
    if (count >= total) {
      tracker.classList.add('et-complete');
      if (typeof confettiBurstCenter === 'function') confettiBurstCenter(40);
    }
    if (milestoneMessages[count]) {
      toast(milestoneMessages[count]);
    }
  }

  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting && !visited[entry.target.id]) {
        visited[entry.target.id] = true;
        // Show tracker after first section visit
        tracker.classList.add('et-visible');
        update();
      }
    });
  }, { threshold: 0.25 });

  sectionIds.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) obs.observe(el);
  });
})();

// ═══ INTERACTION MILESTONE CELEBRATIONS ═══
(function() {
  var el = document.getElementById('interactionCount');
  var wrap = document.getElementById('interactionCounter');
  if (!el || !wrap) return;
  var celebrated = {};
  var milestones = {
    10: 'Explorer \u2014 10 interactions!',
    25: 'Power user \u2014 25 interactions!',
    50: 'Deep diver \u2014 50 interactions!',
    100: 'Completionist \u2014 100 interactions!'
  };
  var obs = new MutationObserver(function() {
    var count = parseInt(el.textContent || '0');
    if (milestones[count] && !celebrated[count]) {
      celebrated[count] = true;
      toast(milestones[count]);
      wrap.classList.add('fc-pop');
      setTimeout(function() { wrap.classList.remove('fc-pop'); }, 600);
      if (count === 100 && typeof confettiBurstCenter === 'function') confettiBurstCenter(40);
    }
  });
  obs.observe(el, { childList: true, characterData: true, subtree: true });
})();
