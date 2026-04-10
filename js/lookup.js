// ═══════════════════════════════════════════════════════
// COLLEGE DIRECTORY — Search, filter, render, personal overlay
// Static roster from collegeDB (js/data/colleges.js).
// User overlay (notes, SIS corrections, contacts) in localStorage.
// ═══════════════════════════════════════════════════════

var CL_OVERLAY_KEY = 'appanalyst.colleges.overlay.v1';
var activeLookupFilter = 'all';
var clSearch = '';
var clExpanded = null;

// ── Overlay store ─────────────────────────────────────
function clOverlayLoad() {
  try { return JSON.parse(localStorage.getItem(CL_OVERLAY_KEY) || '{}'); }
  catch (e) { return {}; }
}
function clOverlaySave(o) {
  localStorage.setItem(CL_OVERLAY_KEY, JSON.stringify(o));
}
function clOverlayGet(name) {
  var o = clOverlayLoad();
  return o[name] || {};
}
function clOverlayUpdate(name, field, value) {
  var o = clOverlayLoad();
  if (!o[name]) o[name] = {};
  o[name][field] = value;
  o[name].updated = new Date().toISOString();
  clOverlaySave(o);
}

// ── Merge static + overlay ─────────────────────────────
function clMerged() {
  var overlay = clOverlayLoad();
  return collegeDB.map(function(c) {
    var o = overlay[c.name] || {};
    return {
      name: c.name,
      district: c.district,
      city: c.city,
      county: c.county,
      region: c.region,
      website: c.website,
      sis: o.sis || c.sis,
      sisSource: o.sis ? 'user override' : c.sisSource,
      verified: o.verified != null ? o.verified : c.verified,
      isFHDA: c.isFHDA,
      tip: c.tip,
      readiness: c.readiness,
      notes: o.notes || '',
      contacts: o.contacts || {}
    };
  });
}

// ── Filters ─────────────────────────────────────────────
function filterColleges(filter, el) {
  activeLookupFilter = filter;
  window._lookupShowAll = false;
  document.querySelectorAll('.lookup-filter').forEach(function(b) { b.classList.remove('lf-active'); });
  if (el) el.classList.add('lf-active');
  var input = document.getElementById('collegeLookup');
  if (input) input.value = '';
  clSearch = '';
  renderLookup(getFilteredColleges());
}

function getFilteredColleges() {
  var all = clMerged();
  var f = activeLookupFilter;
  if (f === 'all') return all;
  if (f === 'unverified') return all.filter(function(c) { return !c.verified; });
  if (f === 'unknown') return all.filter(function(c) { return c.sis === 'unknown'; });
  if (f === 'fhda') return all.filter(function(c) { return c.isFHDA; });
  if (f === 'ethos-risk') return all.filter(function(c) { return c.sis.indexOf('Banner') >= 0 || c.sis.indexOf('Colleague') >= 0; });
  return all.filter(function(c) { return c.sis.toLowerCase().indexOf(f.toLowerCase()) >= 0; });
}

function searchColleges(query) {
  window._lookupShowAll = false;
  clSearch = query;
  var q = (query || '').trim().toLowerCase();
  if (!q) { renderLookup(getFilteredColleges()); return; }
  var base = getFilteredColleges();
  var matches = base.filter(function(c) {
    return (c.name + ' ' + c.district + ' ' + c.sis + ' ' + c.region + ' ' + c.city + ' ' + c.county + ' ' + c.tip + ' ' + (c.notes || '')).toLowerCase().indexOf(q) >= 0;
  });
  renderLookup(matches);
}

function clearSearch() {
  var input = document.getElementById('collegeLookup');
  if (input) {
    input.value = '';
    input.style.borderColor = '';
    searchColleges('');
    input.focus();
  }
}

// ── Render ─────────────────────────────────────────────
function sisClass(sis) {
  if (sis === 'unknown') return 'sis-unknown';
  if (sis.indexOf('PeopleSoft') >= 0) return 'sis-peoplesoft';
  if (sis.indexOf('Colleague') >= 0) return 'sis-colleague';
  if (sis.indexOf('Ethos') >= 0) return 'sis-banner-ethos';
  return 'sis-banner-direct';
}

function clEsc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderLookup(colleges) {
  // FHDA first, then alphabetical
  colleges.sort(function(a, b) {
    if (a.isFHDA && !b.isFHDA) return -1;
    if (!a.isFHDA && b.isFHDA) return 1;
    return a.name.localeCompare(b.name);
  });

  var results = document.getElementById('lookupResults');
  var counter = document.getElementById('lookupCount');
  var stats = document.getElementById('lookupStats');
  if (!results) return;

  var total = colleges.length;
  var unverified = colleges.filter(function(c) { return !c.verified; }).length;
  var ethosRisk = colleges.filter(function(c) { return c.sis.indexOf('Banner') >= 0 || c.sis.indexOf('Colleague') >= 0; }).length;
  var psCount = colleges.filter(function(c) { return c.sis.indexOf('PeopleSoft') >= 0; }).length;
  var withNotes = colleges.filter(function(c) { return c.notes && c.notes.length > 0; }).length;

  if (stats) stats.innerHTML =
    '<div class="lookup-stat"><div class="lookup-stat-num" style="color:var(--text)">' + total + '</div><div class="lookup-stat-label">Colleges</div></div>' +
    '<div class="lookup-stat"><div class="lookup-stat-num" style="color:var(--primary)">' + psCount + '</div><div class="lookup-stat-label">PeopleSoft</div></div>' +
    '<div class="lookup-stat"><div class="lookup-stat-num" style="color:var(--amber)">' + ethosRisk + '</div><div class="lookup-stat-label">Banner / Colleague</div></div>' +
    '<div class="lookup-stat"><div class="lookup-stat-num" style="color:var(--red)">' + unverified + '</div><div class="lookup-stat-label">Unverified</div></div>' +
    '<div class="lookup-stat"><div class="lookup-stat-num" style="color:var(--blue)">' + withNotes + '</div><div class="lookup-stat-label">With Notes</div></div>';

  if (colleges.length === 0) {
    results.innerHTML = '<div class="lookup-empty">No matches</div>';
    if (counter) counter.textContent = '';
    return;
  }

  var DISPLAY_LIMIT = 8;
  var showAll = window._lookupShowAll || false;
  var displayList = showAll ? colleges : colleges.slice(0, DISPLAY_LIMIT);
  var hasMore = colleges.length > DISPLAY_LIMIT && !showAll;

  var html = displayList.map(function(c) {
    var verifiedBadge = c.verified
      ? '<span class="cl-verified" title="SIS confirmed from public portal evidence">&#10003; verified</span>'
      : '<span class="cl-unverified" title="SIS inferred — please confirm with district IT">? unverified</span>';
    var fhdaBadge = c.isFHDA ? '<span class="cl-fhda">FHDA</span>' : '';
    var ethosWarn = (c.sis.indexOf('Banner') >= 0 || c.sis.indexOf('Colleague') >= 0)
      ? '<div class="cl-warn">Banner/Colleague tiers: verify Direct vs Ethos with district IT. Ethos variants still require manual unit reconciliation per April 2025 CVC release notes.</div>'
      : '';
    var notesPreview = c.notes ? '<div class="cl-notes-preview">' + clEsc(c.notes.slice(0, 120)) + (c.notes.length > 120 ? '…' : '') + '</div>' : '';
    var contactsPreview = '';
    if (c.contacts && Object.keys(c.contacts).length > 0) {
      var pairs = [];
      ['ar','fa','counseling','dsps','general'].forEach(function(k) {
        if (c.contacts[k]) pairs.push('<span class="cl-contact-tag">' + k.toUpperCase() + ': ' + clEsc(c.contacts[k]) + '</span>');
      });
      if (pairs.length) contactsPreview = '<div class="cl-contacts-preview">' + pairs.join('') + '</div>';
    }

    return '<div class="lookup-card' + (clExpanded === c.name ? ' lc-expanded' : '') + '" data-college="' + clEsc(c.name) + '">' +
      '<div class="lookup-card-header" onclick="clToggle(\'' + c.name.replace(/\'/g, '\\\'') + '\')">' +
        '<span class="lookup-college-name">' + clEsc(c.name) + '</span>' +
        fhdaBadge +
        '<span class="lookup-sis-badge ' + sisClass(c.sis) + '">' + clEsc(c.sis) + '</span>' +
        verifiedBadge +
        '<span class="lookup-region">' + clEsc(c.region) + '</span>' +
      '</div>' +
      '<div style="font-size:.68rem;color:var(--text-3);margin-bottom:.4rem">' + clEsc(c.district) + ' &middot; ' + clEsc(c.city || '') + ', ' + clEsc(c.county || '') + ' County</div>' +
      ethosWarn +
      notesPreview +
      contactsPreview +
      '<div class="lookup-card-click">Click to edit notes, contacts, correct SIS</div>' +
      clEditPanel(c) +
    '</div>';
  }).join('');

  if (hasMore) {
    html += '<button onclick="window._lookupShowAll=true;renderLookup(getFilteredColleges())" class="cl-showmore">Show all ' + colleges.length + ' colleges</button>';
  }
  if (showAll && colleges.length > DISPLAY_LIMIT) {
    html += '<button onclick="window._lookupShowAll=false;renderLookup(getFilteredColleges())" class="cl-showless">Show fewer</button>';
  }

  results.innerHTML = html;
  if (counter) counter.textContent = colleges.length + ' of ' + collegeDB.length + ' colleges shown';
}

function clToggle(name) {
  clExpanded = (clExpanded === name) ? null : name;
  renderLookup(getFilteredColleges());
  setTimeout(function() {
    var el = document.querySelector('.lookup-card[data-college="' + name.replace(/"/g, '\\"') + '"]');
    if (el && clExpanded === name) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 30);
}

function clEditPanel(c) {
  var sisOptions = ['unknown','PeopleSoft','Banner Direct','Banner Ethos','Colleague Direct','Colleague Ethos'];
  var ctc = c.contacts || {};
  var nameAttr = c.name.replace(/'/g, "\\'");
  return '<div class="lookup-card-expand">' +
    '<div class="cl-edit-row">' +
      '<div class="cl-edit-field"><label>SIS tier (override)</label>' +
        '<select onchange="clOverlayUpdate(\'' + nameAttr + '\',\'sis\',this.value);clOverlayUpdate(\'' + nameAttr + '\',\'verified\',true);renderLookup(getFilteredColleges())">' +
          sisOptions.map(function(s) { return '<option' + (s === c.sis ? ' selected' : '') + '>' + s + '</option>'; }).join('') +
        '</select>' +
      '</div>' +
      '<div class="cl-edit-field"><label>Source: ' + clEsc(c.sisSource || '—') + '</label></div>' +
    '</div>' +
    '<div class="cl-edit-field cl-edit-full"><label>Personal notes (localStorage — no PII)</label>' +
      '<textarea rows="3" placeholder="Contacts, integration quirks, past tickets, IT liaison…" oninput="clOverlayUpdate(\'' + nameAttr + '\',\'notes\',this.value)">' + clEsc(c.notes) + '</textarea>' +
    '</div>' +
    '<div class="cl-contacts-grid">' +
      ['ar','fa','counseling','dsps','general'].map(function(role) {
        var label = { ar: 'A&R', fa: 'Financial Aid', counseling: 'Counseling', dsps: 'DSPS', general: 'General' }[role];
        return '<div class="cl-edit-field"><label>' + label + '</label>' +
          '<input type="text" value="' + clEsc(ctc[role] || '') + '" placeholder="name or email" oninput="clOverlayContact(\'' + nameAttr + '\',\'' + role + '\',this.value)">' +
        '</div>';
      }).join('') +
    '</div>' +
    (c.website ? '<div class="cl-website"><a href="' + clEsc(c.website) + '" target="_blank" rel="noopener">' + clEsc(c.website) + ' &rarr;</a></div>' : '') +
  '</div>';
}

function clOverlayContact(name, role, value) {
  var o = clOverlayLoad();
  if (!o[name]) o[name] = {};
  if (!o[name].contacts) o[name].contacts = {};
  o[name].contacts[role] = value;
  o[name].updated = new Date().toISOString();
  clOverlaySave(o);
}

// Backwards-compat wrappers for functions called elsewhere
function sortFHDAFirst(list) { /* handled in renderLookup */ }
function markHomeLookups() { /* handled via CSS class */ }

// Search input color feedback (preserved from v1)
(function() {
  var input = document.getElementById('collegeLookup');
  if (!input) return;
  var obs = new MutationObserver(function() {
    var counter = document.getElementById('lookupCount');
    if (!counter) return;
    var text = counter.textContent || '';
    var match = text.match(/(\d+) of/);
    if (match) {
      var count = parseInt(match[1]);
      if (input.value.length > 0) {
        input.style.borderColor = count > 0 ? 'var(--primary)' : 'var(--amber)';
      } else {
        input.style.borderColor = '';
      }
    }
  });
  var counter = document.getElementById('lookupCount');
  if (counter) obs.observe(counter, { childList: true, characterData: true, subtree: true });
  input.addEventListener('input', function() {
    if (this.value.length === 0) this.style.borderColor = '';
  });
})();

renderLookup(getFilteredColleges());
