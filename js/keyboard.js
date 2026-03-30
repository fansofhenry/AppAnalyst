// ═══════════════════════════════════════════════════════
// KEYBOARD — Shortcuts for navigation and modes
// ═══════════════════════════════════════════════════════

// Main keyboard shortcut handler (1-9, 0, ?, G, /, T)
var toolAnchors = ['lookup', 'cvcData', 'flow', 'monitor', 'tracer', 'patterns', 'comms', 'outreach', 'aiVision', 'barrierOverview'];

document.addEventListener('keydown', function(e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  var overlay = document.getElementById('kbOverlay');

  // ? = toggle keyboard shortcuts overlay
  if (e.key === '?' || (e.shiftKey && e.key === '/')) {
    e.preventDefault();
    if (overlay) overlay.classList.toggle('kb-show');
    return;
  }

  // Close help on any key
  if (overlay && overlay.classList.contains('kb-show')) {
    overlay.classList.remove('kb-show');
    return;
  }

  // G = open sections panel
  if (e.key === 'g' || e.key === 'G') {
    e.preventDefault();
    toggleToc();
    return;
  }

  // / = focus college search
  if (e.key === '/') {
    e.preventDefault();
    var searchInput = document.getElementById('collegeLookup');
    if (searchInput) {
      document.getElementById('lookup').scrollIntoView({ behavior: 'smooth' });
      setTimeout(function() { searchInput.focus(); }, 400);
    }
    return;
  }

  // T = back to top
  if (e.key === 't' || e.key === 'T') {
    e.preventDefault();
    (document.scrollingElement || document.documentElement).scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  // - = origin story
  if (e.key === '-') {
    e.preventDefault();
    var origin = document.getElementById('originStory');
    if (origin) origin.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  // Number keys 1-9 map to tools 0-8, 0 maps to tool 9
  var idx = -1;
  if (e.key >= '1' && e.key <= '9') idx = parseInt(e.key) - 1;
  if (e.key === '0') idx = 9;

  if (idx >= 0 && idx < toolAnchors.length) {
    e.preventDefault();
    var el = document.getElementById(toolAnchors[idx]);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Escape = close visual reference panel if open
  if (e.key === 'Escape') {
    var ivOv = document.getElementById('ivOverlay');
    if (ivOv && ivOv.classList.contains('iv-show')) {
      ivOv.classList.remove('iv-show');
      return;
    }
  }

  // V = toggle visual reference panel
  if (e.key === 'v' || e.key === 'V') {
    e.preventDefault();
    var ivOverlay = document.getElementById('ivOverlay');
    if (ivOverlay) ivOverlay.classList.toggle('iv-show');
    return;
  }

  // F = theater mode
  if (e.key === 'f' || e.key === 'F') {
    e.preventDefault();
    window._toggleTheater();
    return;
  }

  // Arrow keys in theater mode
  if (document.body.classList.contains('theater-on') &&
      (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowLeft')) {
    e.preventDefault();
    var dir = (e.key === 'ArrowDown' || e.key === 'ArrowRight') ? 1 : -1;
    window._theaterNext(dir);
    return;
  }

  // Z = zoom mode
  if (e.key === 'z' || e.key === 'Z') {
    e.preventDefault();
    window._toggleZoom();
    return;
  }

  // A = accessibility mode
  if (e.key === 'a' || e.key === 'A') {
    e.preventDefault();
    toggleA11y();
    return;
  }
});

// ═══ EASTER EGG — type "fhda" anywhere ═══
(function() {
  var buffer = '';
  var trigger = 'fhda';
  var fired = false;
  document.addEventListener('keydown', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    buffer += e.key.toLowerCase();
    if (buffer.length > 10) buffer = buffer.slice(-10);
    if (!fired && buffer.indexOf(trigger) >= 0) {
      fired = true;
      buffer = '';
      // Brief celebration
      toast('Go Owls! \ud83e\udd89 Foothill\u2013De Anza forever');
      document.body.classList.add('ee-fhda');
      if (typeof confettiBurstCenter === 'function') confettiBurstCenter(35);
      setTimeout(function() { document.body.classList.remove('ee-fhda'); }, 2000);
    }
  });
})();

// ═══ CONTEXTUAL KEYBOARD HINTS ═══
(function() {
  var hints = [
    { section: 'monitor', msg: 'Press F for Theater Mode \u2014 spotlight one section at a time' },
    { section: 'tracer', msg: 'Press V to see 12 visual interview scenarios' },
    { section: 'patterns', msg: 'Press G to open the sections navigator' },
    { section: 'comms', msg: 'Press / to quick-search any college' },
    { section: 'aiVision', msg: 'Press Z for Zoom Mode \u2014 optimized for screenshare' }
  ];
  var hintShown = {};
  var idleTimer = null;
  var lastActivity = Date.now();

  function resetIdle() { lastActivity = Date.now(); }
  document.addEventListener('scroll', resetIdle, { passive: true });
  document.addEventListener('click', resetIdle);
  document.addEventListener('keydown', resetIdle);

  function checkIdleHint() {
    if (Date.now() - lastActivity < 12000) return;

    for (var i = 0; i < hints.length; i++) {
      var h = hints[i];
      if (hintShown[h.section]) continue;
      var el = document.getElementById(h.section);
      if (!el) continue;
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.6 && rect.bottom > window.innerHeight * 0.3) {
        hintShown[h.section] = true;
        toast(h.msg);
        lastActivity = Date.now();
        return;
      }
    }
  }

  setInterval(checkIdleHint, 3000);
})();
