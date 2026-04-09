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
});
