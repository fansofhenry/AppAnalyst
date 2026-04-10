// ═══════════════════════════════════════════════════════
// GLOBAL SEARCH — Cmd/Ctrl+K overlay, searches across
// tickets, KB, colleges, and tool sections.
// ═══════════════════════════════════════════════════════

var SEARCH_SELECTED = 0;
var SEARCH_RESULTS = [];

// Static navigation targets — section id → {label, desc}
var SEARCH_SECTIONS = [
  { id: 'today', label: 'Today', desc: 'Personal dashboard', kind: 'nav' },
  { id: 'ticketLog', label: 'Ticket Log', desc: 'Personal queue', kind: 'nav' },
  { id: 'kb', label: 'Runbook / KB', desc: 'Markdown entries', kind: 'nav' },
  { id: 'lookup', label: 'College Directory', desc: '115 CCCs', kind: 'nav' },
  { id: 'reconcile', label: 'Reconciliation Helper', desc: 'CSV diff tool', kind: 'nav' },
  { id: 'monitor', label: 'System Status', desc: 'Reference dashboard', kind: 'nav' },
  { id: 'flow', label: 'Architecture', desc: 'Reference diagram', kind: 'nav' },
  { id: 'tracer', label: 'Incident Diagnostics', desc: 'Reference walkthrough', kind: 'nav' },
  { id: 'patterns', label: 'Ticket Intelligence', desc: 'Reference patterns', kind: 'nav' },
  { id: 'comms', label: 'Communications', desc: 'Templates', kind: 'nav' },
  { id: 'escalation', label: 'Escalation Matrix', desc: 'P1/P2/P3', kind: 'nav' },
  { id: 'outreach', label: 'Outreach Planner', desc: 'Calendar', kind: 'nav' },
  { id: 'aiVision', label: 'AI Vision', desc: 'Roadmap', kind: 'nav' },
  { id: 'barrierOverview', label: 'Barrier Intelligence', desc: '10 friction points', kind: 'nav' }
];

function searchEsc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function searchOpen() {
  var overlay = document.getElementById('searchOverlay');
  if (!overlay) return;
  overlay.classList.add('search-show');
  document.body.style.overflow = 'hidden';
  setTimeout(function() {
    var input = document.getElementById('searchInput');
    if (input) { input.value = ''; input.focus(); }
    searchRender('');
  }, 10);
}

function searchClose() {
  var overlay = document.getElementById('searchOverlay');
  if (!overlay) return;
  overlay.classList.remove('search-show');
  document.body.style.overflow = '';
  SEARCH_SELECTED = 0;
}

function searchQuery(q) {
  q = (q || '').trim().toLowerCase();
  var results = [];

  // Sections always first when query is short
  SEARCH_SECTIONS.forEach(function(s) {
    var hay = (s.label + ' ' + s.desc).toLowerCase();
    if (!q || hay.indexOf(q) >= 0) {
      results.push({
        kind: 'section',
        id: s.id,
        label: s.label,
        desc: s.desc,
        score: q && s.label.toLowerCase().indexOf(q) === 0 ? 100 : (q ? 50 : 20)
      });
    }
  });

  // Tickets
  try {
    var tickets = JSON.parse(localStorage.getItem('appanalyst.tickets.v1') || '[]');
    tickets.forEach(function(t) {
      var hay = (t.symptom + ' ' + t.college + ' ' + t.system + ' ' + t.notes + ' ' + t.resolution + ' ' + t.status).toLowerCase();
      if (!q || hay.indexOf(q) >= 0) {
        results.push({
          kind: 'ticket',
          id: t.id,
          label: t.symptom || '(no symptom)',
          desc: (t.college || 'no college') + ' · ' + t.system + ' · ' + t.status,
          score: q ? 80 : 10
        });
      }
    });
  } catch (e) {}

  // KB entries
  try {
    var kb = JSON.parse(localStorage.getItem('appanalyst.kb.v1') || '[]');
    kb.forEach(function(e) {
      var hay = (e.title + ' ' + e.body + ' ' + e.system + ' ' + e.audience).toLowerCase();
      if (!q || hay.indexOf(q) >= 0) {
        results.push({
          kind: 'kb',
          id: e.id,
          label: e.title || 'Untitled',
          desc: e.system + ' · ' + e.audience,
          score: q ? 70 : 10
        });
      }
    });
  } catch (e) {}

  // Colleges
  if (typeof collegeDB !== 'undefined') {
    var overlay = {};
    try { overlay = JSON.parse(localStorage.getItem('appanalyst.colleges.overlay.v1') || '{}'); } catch (e) {}
    collegeDB.forEach(function(c) {
      var o = overlay[c.name] || {};
      var hay = (c.name + ' ' + c.district + ' ' + c.city + ' ' + c.sis + ' ' + (o.notes || '')).toLowerCase();
      if (q && hay.indexOf(q) >= 0) {
        results.push({
          kind: 'college',
          id: c.name,
          label: c.name,
          desc: c.district + ' · ' + (o.sis || c.sis),
          score: c.name.toLowerCase().indexOf(q) === 0 ? 90 : 60
        });
      }
    });
  }

  // Sort by score desc, then cap
  results.sort(function(a, b) { return b.score - a.score; });
  return results.slice(0, 20);
}

function searchRender(q) {
  var body = document.getElementById('searchResults');
  if (!body) return;
  SEARCH_RESULTS = searchQuery(q);
  SEARCH_SELECTED = 0;

  if (SEARCH_RESULTS.length === 0) {
    body.innerHTML = '<div class="search-empty">No matches for “' + searchEsc(q) + '”.</div>';
    return;
  }

  body.innerHTML = SEARCH_RESULTS.map(function(r, i) {
    var iconMap = { section: '§', ticket: '⌘', kb: '◆', college: '●' };
    var kindLabel = { section: 'Section', ticket: 'Ticket', kb: 'KB', college: 'College' };
    return '<div class="search-result' + (i === 0 ? ' search-selected' : '') + '" data-i="' + i + '" onclick="searchPick(' + i + ')" onmouseover="searchHover(' + i + ')">' +
      '<span class="search-icon search-icon-' + r.kind + '">' + iconMap[r.kind] + '</span>' +
      '<div class="search-main">' +
        '<div class="search-label">' + searchEsc(r.label) + '</div>' +
        '<div class="search-desc">' + searchEsc(r.desc) + '</div>' +
      '</div>' +
      '<span class="search-kind">' + kindLabel[r.kind] + '</span>' +
    '</div>';
  }).join('');
}

function searchHover(i) {
  SEARCH_SELECTED = i;
  document.querySelectorAll('.search-result').forEach(function(el, idx) {
    el.classList.toggle('search-selected', idx === i);
  });
}

function searchPick(i) {
  var r = SEARCH_RESULTS[i];
  if (!r) return;
  searchClose();
  setTimeout(function() {
    if (r.kind === 'section') {
      var el = document.getElementById(r.id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (r.kind === 'ticket') {
      var tl = document.getElementById('ticketLog');
      if (tl) tl.scrollIntoView({ behavior: 'smooth' });
      setTimeout(function() {
        var row = document.querySelector('.tl-row[data-id="' + r.id + '"]');
        if (row) row.classList.add('tl-expanded');
      }, 500);
    } else if (r.kind === 'kb') {
      var kbEl = document.getElementById('kb');
      if (kbEl) kbEl.scrollIntoView({ behavior: 'smooth' });
      setTimeout(function() { if (typeof kbSelect === 'function') kbSelect(r.id); }, 400);
    } else if (r.kind === 'college') {
      var lk = document.getElementById('lookup');
      if (lk) lk.scrollIntoView({ behavior: 'smooth' });
      setTimeout(function() { if (typeof clToggle === 'function') clToggle(r.id); }, 400);
    }
  }, 150);
}

// Keyboard handling inside overlay
document.addEventListener('keydown', function(e) {
  var overlay = document.getElementById('searchOverlay');
  var isOpen = overlay && overlay.classList.contains('search-show');

  // ⌘K or Ctrl+K opens from anywhere
  if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
    e.preventDefault();
    if (isOpen) searchClose(); else searchOpen();
    return;
  }

  if (!isOpen) return;

  if (e.key === 'Escape') {
    e.preventDefault();
    searchClose();
    return;
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    SEARCH_SELECTED = Math.min(SEARCH_SELECTED + 1, SEARCH_RESULTS.length - 1);
    searchHover(SEARCH_SELECTED);
    var sel = document.querySelectorAll('.search-result')[SEARCH_SELECTED];
    if (sel) sel.scrollIntoView({ block: 'nearest' });
    return;
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault();
    SEARCH_SELECTED = Math.max(SEARCH_SELECTED - 1, 0);
    searchHover(SEARCH_SELECTED);
    var selU = document.querySelectorAll('.search-result')[SEARCH_SELECTED];
    if (selU) selU.scrollIntoView({ block: 'nearest' });
    return;
  }

  if (e.key === 'Enter') {
    e.preventDefault();
    searchPick(SEARCH_SELECTED);
    return;
  }
});
