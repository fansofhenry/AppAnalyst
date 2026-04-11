// ═══════════════════════════════════════════════════════
// KEYBOARD — Shortcuts for navigation and modes
// ═══════════════════════════════════════════════════════

// Number keys 1-9 map to sections, 0 = barriers
var toolAnchors = ['monitor', 'lookup', 'flow', 'tracer', 'patterns', 'kb', 'comms', 'outreach', 'aiVision', 'barrierOverview'];

document.addEventListener('keydown', function(e) {
  // Esc closes any open modal (works even while focused in inputs)
  if (e.key === 'Escape') {
    var search = document.getElementById('searchOverlay');
    if (search && search.classList.contains('search-show')) {
      if (typeof searchClose === 'function') { searchClose(); return; }
    }
    var backup = document.getElementById('backupModal');
    if (backup && backup.classList.contains('backup-show')) {
      if (typeof backupClose === 'function') { backupClose(); return; }
    }
    var packet = document.getElementById('packetOverlay');
    if (packet && packet.classList.contains('packet-show')) {
      if (typeof packetClose === 'function') { packetClose(); return; }
    }
    var welcome = document.getElementById('welcomeOverlay');
    if (welcome && welcome.classList.contains('welcome-show')) {
      if (typeof welcomeDismiss === 'function') { welcomeDismiss(true); return; }
    }
    var roleMenu = document.getElementById('roleMenu');
    if (roleMenu && roleMenu.classList.contains('role-menu-open')) {
      if (typeof roleCloseMenu === 'function') { roleCloseMenu(); return; }
    }
  }

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

  // Generic list keyboard nav — works on whichever "row list" is in view
  var listConfigs = [
    { sectionId: 'ticketLog', rowSel: '.tl-row', focusCls: 'tl-focused', openToggle: 'tl-expanded' },
    { sectionId: 'kb', rowSel: '.kb-list-item', focusCls: 'kb-focused', openToggle: null,
      onEnter: function(row) { var id = row.dataset.id; if (id && typeof kbSelect === 'function') kbSelect(id); } },
    { sectionId: 'activity', rowSel: '.act-item', focusCls: 'act-focused', openToggle: null,
      onEnter: function(row) { row.click(); } },
    { sectionId: 'onboarding', rowSel: '.ob-item', focusCls: 'ob-focused', openToggle: null,
      onEnter: function(row) {
        var cb = row.querySelector('input[type="checkbox"]');
        if (cb) { cb.checked = !cb.checked; cb.dispatchEvent(new Event('change', { bubbles: true })); }
      } }
  ];

  for (var i = 0; i < listConfigs.length; i++) {
    var cfg = listConfigs[i];
    var section = document.getElementById(cfg.sectionId);
    if (!section) continue;
    var rect = section.getBoundingClientRect();
    var inView = rect.top < window.innerHeight * 0.6 && rect.bottom > 100;
    if (!inView) continue;

    var rows = Array.from(section.querySelectorAll(cfg.rowSel));
    if (rows.length === 0) continue;
    var focusedIdx = rows.findIndex(function(r) { return r.classList.contains(cfg.focusCls); });

    if (e.key === 'ArrowDown' || e.key === 'j') {
      e.preventDefault();
      var next = focusedIdx < 0 ? 0 : Math.min(rows.length - 1, focusedIdx + 1);
      rows.forEach(function(r) { r.classList.remove(cfg.focusCls); });
      rows[next].classList.add(cfg.focusCls);
      rows[next].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      return;
    }
    if (e.key === 'ArrowUp' || e.key === 'k') {
      e.preventDefault();
      var prev = focusedIdx <= 0 ? 0 : focusedIdx - 1;
      rows.forEach(function(r) { r.classList.remove(cfg.focusCls); });
      rows[prev].classList.add(cfg.focusCls);
      rows[prev].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      return;
    }
    if (e.key === 'Enter' && focusedIdx >= 0) {
      e.preventDefault();
      var row = rows[focusedIdx];
      if (cfg.openToggle) row.classList.toggle(cfg.openToggle);
      else if (cfg.onEnter) cfg.onEnter(row);
      return;
    }
    if (e.key === 'Escape' && focusedIdx >= 0) {
      if (cfg.openToggle) rows[focusedIdx].classList.remove(cfg.openToggle);
      else rows.forEach(function(r) { r.classList.remove(cfg.focusCls); });
      return;
    }
    break; // Only handle the topmost in-view list
  }
});
