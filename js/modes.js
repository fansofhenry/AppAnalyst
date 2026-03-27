// ═══════════════════════════════════════════════════════
// MODES — Zoom, Theater, Accessibility
// ═══════════════════════════════════════════════════════

// ═══ ZOOM PRESENTATION MODE ═══
(function() {
  var active = false;
  window._toggleZoom = function() {
    active = !active;
    document.body.classList.toggle('zoom-mode', active);
    toast(active ? 'Zoom mode ON \u2014 optimized for screenshare' : 'Zoom mode OFF');
  };
})();

// ═══ THEATER / FOCUS MODE ═══
(function() {
  var active = false;
  var currentSpot = null;

  function getSections() {
    return document.querySelectorAll(
      '.sec, .sec-alt, .story-sec, .divider-sec, .closing-sec, .quote-section, #why, header.header'
    );
  }

  function findSection(el) {
    while (el && el !== document.body) {
      if (el.classList &&
        (el.classList.contains('sec') || el.classList.contains('sec-alt') ||
         el.classList.contains('story-sec') || el.classList.contains('divider-sec') ||
         el.classList.contains('closing-sec') || el.classList.contains('quote-section') ||
         el.id === 'why' || (el.tagName === 'HEADER' && el.classList.contains('header')))) {
        return el;
      }
      el = el.parentElement;
    }
    return null;
  }

  function onMove(e) {
    if (!active) return;
    var sec = findSection(e.target);
    if (sec !== currentSpot) {
      if (currentSpot) currentSpot.classList.remove('theater-spot');
      currentSpot = sec;
      if (sec) sec.classList.add('theater-spot');
    }
  }

  function activate() {
    active = true;
    document.body.classList.add('theater-on');
    document.addEventListener('mousemove', onMove, { passive: true });
    toast('Theater mode ON \u2014 hover to spotlight');
  }

  function deactivate() {
    active = false;
    document.body.classList.remove('theater-on');
    document.removeEventListener('mousemove', onMove);
    if (currentSpot) { currentSpot.classList.remove('theater-spot'); currentSpot = null; }
    toast('Theater mode OFF');
  }

  window._toggleTheater = function() {
    if (active) deactivate(); else activate();
  };

  // Click on a spotlighted section scrolls it to center
  document.addEventListener('click', function(e) {
    if (!active) return;
    var sec = findSection(e.target);
    if (sec) {
      sec.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
})();

// ═══ ACCESSIBILITY MODE — WCAG AAA High-Contrast ═══
var _a11yActive = false;

function toggleA11y() {
  _a11yActive = !_a11yActive;
  document.body.classList.toggle('a11y-mode', _a11yActive);

  var toggle = document.getElementById('a11yToggle');
  if (toggle) {
    toggle.classList.toggle('a11y-on', _a11yActive);
    toggle.setAttribute('aria-checked', _a11yActive ? 'true' : 'false');
  }

  if (_a11yActive) {
    injectA11yAttributes();
    toast('Accessibility mode ON \u2014 WCAG AAA');
  } else {
    removeA11yAttributes();
    toast('Accessibility mode OFF');
  }
}

function injectA11yAttributes() {
  var interactiveSelectors = '.b-card,.ai-card,.counsel-card,.esc-card,.status-row,.lookup-card,.msg-preview,.toc-item,.insight-card,.trigger-card';
  document.querySelectorAll(interactiveSelectors).forEach(function(el) {
    if (!el.getAttribute('tabindex')) el.setAttribute('tabindex', '0');
    if (!el._a11yKey) {
      el._a11yKey = true;
      el.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          el.click();
        }
      });
    }
  });

  document.querySelectorAll('.s-indicator').forEach(function(dot) {
    var row = dot.closest('.status-row');
    var name = row ? (row.querySelector('.s-name') || {}).textContent || '' : '';
    var status = dot.classList.contains('s-ok') ? 'healthy' :
                 dot.classList.contains('s-warn') ? 'degraded' :
                 dot.classList.contains('s-err') ? 'failing' : 'unknown';
    dot.setAttribute('aria-label', name + ' status: ' + status);
    dot.setAttribute('role', 'img');
  });

  document.querySelectorAll('.b-sev-dot').forEach(function(dot) {
    var card = dot.closest('.b-card');
    var title = card ? (card.querySelector('.b-title') || {}).textContent || '' : '';
    var sev = card && card.classList.contains('b-sev-high') ? 'high severity' :
              card && card.classList.contains('b-sev-med') ? 'medium severity' : 'low severity';
    dot.setAttribute('aria-label', title + ': ' + sev);
    dot.setAttribute('role', 'img');
  });

  document.querySelectorAll('.ms-cell').forEach(function(cell) {
    var num = (cell.querySelector('.ms-num') || {}).textContent || '';
    var label = (cell.querySelector('.ms-label') || {}).textContent || '';
    cell.setAttribute('aria-label', num + ' ' + label);
  });

  document.querySelectorAll('.filter-tab,.ai-tab,.jt-btn,.outreach-tab,.lookup-filter').forEach(function(tab) {
    var isActive = tab.classList.contains('active') || tab.classList.contains('lf-active');
    tab.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    tab.setAttribute('role', 'button');
  });

  document.querySelectorAll('.kb-step-btn').forEach(function(btn) {
    if (btn.classList.contains('del')) {
      btn.setAttribute('aria-label', 'Delete step');
    } else if (btn.textContent.indexOf('\u2191') >= 0) {
      btn.setAttribute('aria-label', 'Move step up');
    } else if (btn.textContent.indexOf('\u2193') >= 0) {
      btn.setAttribute('aria-label', 'Move step down');
    }
  });

  document.querySelectorAll('.nav-num').forEach(function(num) {
    num.setAttribute('aria-hidden', 'true');
  });

  document.querySelectorAll('.tool-dots').forEach(function(dots) {
    dots.setAttribute('aria-hidden', 'true');
  });

  document.querySelectorAll('.msg-copy').forEach(function(btn) {
    var preview = btn.closest('.msg-preview');
    var to = preview ? (preview.querySelector('.msg-to') || {}).textContent || '' : '';
    btn.setAttribute('aria-label', 'Copy message to ' + to);
  });

  document.querySelectorAll('.progress-dot').forEach(function(dot) {
    dot.setAttribute('role', 'button');
    if (!dot.getAttribute('aria-label')) {
      dot.setAttribute('aria-label', dot.getAttribute('title') || 'Navigate to section');
    }
  });

  var backBtn = document.getElementById('backToTop');
  if (backBtn && !backBtn.getAttribute('aria-label')) {
    backBtn.setAttribute('aria-label', 'Back to top');
  }
}

function removeA11yAttributes() {
  document.querySelectorAll('.b-card,.ai-card,.counsel-card,.esc-card,.status-row,.lookup-card,.msg-preview,.toc-item,.insight-card,.trigger-card').forEach(function(el) {
    el.removeAttribute('tabindex');
  });
}

// Handle A key + Enter on toggle
var a11yToggle = document.getElementById('a11yToggle');
if (a11yToggle) {
  a11yToggle.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleA11y(); }
  });
}
