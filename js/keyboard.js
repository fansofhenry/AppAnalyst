// ═══════════════════════════════════════════════════════
// KEYBOARD — Shortcuts for navigation and modes
// ═══════════════════════════════════════════════════════

// Number keys 1-9 map to sections, 0 = barriers
var toolAnchors = ['monitor', 'lookup', 'flow', 'tracer', 'patterns', 'kb', 'comms', 'outreach', 'aiVision', 'barrierOverview'];

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

  // Number keys 1-9 map to tools 0-8, 0 maps to tool 9
  var idx = -1;
  if (e.key >= '1' && e.key <= '9') idx = parseInt(e.key) - 1;
  if (e.key === '0') idx = 9;

  if (idx >= 0 && idx < toolAnchors.length) {
    e.preventDefault();
    var el = document.getElementById(toolAnchors[idx]);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Arrow keys in theater mode
  if (document.body.classList.contains('theater-on') &&
      (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowLeft')) {
    e.preventDefault();
    var dir = (e.key === 'ArrowDown' || e.key === 'ArrowRight') ? 1 : -1;
    if (window._theaterNext) window._theaterNext(dir);
    return;
  }

  // Z = zoom mode
  if (e.key === 'z' || e.key === 'Z') {
    e.preventDefault();
    if (window._toggleZoom) window._toggleZoom();
    return;
  }

  // A = accessibility mode
  if (e.key === 'a' || e.key === 'A') {
    e.preventDefault();
    toggleA11y();
    return;
  }

  // L = ticket log
  if (e.key === 'l' || e.key === 'L') {
    e.preventDefault();
    var tl = document.getElementById('ticketLog');
    if (tl) tl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  // N = new ticket (quick-add from anywhere)
  if (e.key === 'n' || e.key === 'N') {
    e.preventDefault();
    if (typeof tlAdd === 'function') {
      var tl2 = document.getElementById('ticketLog');
      if (tl2) tl2.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(tlAdd, 400);
    }
    return;
  }

  // Arrow keys / j / k inside ticket log: navigate rows
  var tlSection = document.getElementById('ticketLog');
  if (tlSection) {
    var rect = tlSection.getBoundingClientRect();
    var inView = rect.top < window.innerHeight * 0.5 && rect.bottom > 100;
    if (inView) {
      var rows = Array.from(tlSection.querySelectorAll('.tl-row'));
      if (rows.length === 0) return;
      var focused = rows.findIndex(function(r) { return r.classList.contains('tl-focused'); });
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        var next = focused < 0 ? 0 : Math.min(rows.length - 1, focused + 1);
        rows.forEach(function(r) { r.classList.remove('tl-focused'); });
        rows[next].classList.add('tl-focused');
        rows[next].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        return;
      }
      if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        var prev = focused <= 0 ? 0 : focused - 1;
        rows.forEach(function(r) { r.classList.remove('tl-focused'); });
        rows[prev].classList.add('tl-focused');
        rows[prev].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        return;
      }
      if (e.key === 'Enter' && focused >= 0) {
        e.preventDefault();
        rows[focused].classList.toggle('tl-expanded');
        return;
      }
      if (e.key === 'Escape' && focused >= 0) {
        rows[focused].classList.remove('tl-expanded');
        return;
      }
    }
  }
});
