// ═══════════════════════════════════════════════════════
// COLLEGE QUICK LOOKUP — Search, filter, render
// ═══════════════════════════════════════════════════════

var activeLookupFilter = 'all';

function filterColleges(filter, el) {
  activeLookupFilter = filter;
  window._lookupShowAll = false;
  document.querySelectorAll('.lookup-filter').forEach(function(b) { b.classList.remove('lf-active'); });
  if (el) el.classList.add('lf-active');
  document.getElementById('collegeLookup').value = '';
  renderLookup(getFilteredColleges());
}

function getFilteredColleges() {
  if (activeLookupFilter === 'all') return collegeDB;
  if (activeLookupFilter === 'issues') return collegeDB.filter(function(c) { return c.issues.length > 0; });
  if (activeLookupFilter === 'manual') return collegeDB.filter(function(c) { return c.fa.indexOf('Manual') >= 0 || c.fa === 'Pending'; });
  return collegeDB.filter(function(c) { return c.sis.indexOf(activeLookupFilter) >= 0; });
}

function searchColleges(query) {
  window._lookupShowAll = false;
  var q = query.trim().toLowerCase();
  if (!q) { renderLookup(getFilteredColleges()); return; }
  var base = getFilteredColleges();
  var matches = base.filter(function(c) {
    return c.name.toLowerCase().indexOf(q) >= 0 || c.district.toLowerCase().indexOf(q) >= 0 ||
      c.sis.toLowerCase().indexOf(q) >= 0 || c.region.toLowerCase().indexOf(q) >= 0 ||
      c.fa.toLowerCase().indexOf(q) >= 0 || c.role.toLowerCase().indexOf(q) >= 0 ||
      c.tip.toLowerCase().indexOf(q) >= 0 || c.issues.some(function(issue) { return issue.toLowerCase().indexOf(q) >= 0; });
  });
  renderLookup(matches);
}

// MERGED: original renderLookup + sortFHDAFirst wrapper + markHomeLookups wrapper
function renderLookup(colleges) {
  // Sort FHDA first (from wrapper #2)
  sortFHDAFirst(colleges);

  var results = document.getElementById('lookupResults');
  var counter = document.getElementById('lookupCount');
  var stats = document.getElementById('lookupStats');
  if (!results) return;

  // Compute stats for current set
  var automated = colleges.filter(function(c) { return c.fa === 'Automated'; }).length;
  var manual = colleges.filter(function(c) { return c.fa.indexOf('Manual') >= 0 || c.fa === 'Pending'; }).length;
  var withIssues = colleges.filter(function(c) { return c.issues.length > 0; }).length;
  var clean = colleges.filter(function(c) { return c.issues.length === 0; }).length;

  if (stats) stats.innerHTML =
    '<div class="lookup-stat"><div class="lookup-stat-num" style="color:var(--text)">' + colleges.length + '</div><div class="lookup-stat-label">Colleges</div></div>' +
    '<div class="lookup-stat"><div class="lookup-stat-num" style="color:var(--primary)">' + automated + '</div><div class="lookup-stat-label">Aid Automated</div></div>' +
    '<div class="lookup-stat"><div class="lookup-stat-num" style="color:var(--amber)">' + manual + '</div><div class="lookup-stat-label">Aid Manual</div></div>' +
    '<div class="lookup-stat"><div class="lookup-stat-num" style="color:var(--amber)">' + withIssues + '</div><div class="lookup-stat-label">Known Issues</div></div>' +
    '<div class="lookup-stat"><div class="lookup-stat-num" style="color:var(--teal)">' + clean + '</div><div class="lookup-stat-label">Clean</div></div>';

  if (colleges.length === 0) {
    results.innerHTML = '<div class="lookup-empty">No matches</div>';
    if (counter) counter.textContent = '';
    return;
  }

  var sisClass = function(sis) {
    if (sis.indexOf('PeopleSoft') >= 0) return 'sis-peoplesoft';
    if (sis.indexOf('Colleague') >= 0) return 'sis-colleague';
    if (sis.indexOf('Ethos') >= 0) return 'sis-banner-ethos';
    return 'sis-banner-direct';
  };
  var faClass = function(fa) { return fa === 'Automated' ? 'lf-ok' : fa.indexOf('Manual') >= 0 ? 'lf-warn' : 'lf-err'; };
  var ssoClass = function(sso) { return sso === 'Active' ? 'lf-ok' : 'lf-warn'; };
  var syncClass = function(sync) {
    if (sync === 'Degraded' || sync === 'N/A') return 'lf-err';
    var num = parseInt(sync);
    if (num > 30) return 'lf-warn';
    return 'lf-ok';
  };

  var DISPLAY_LIMIT = 6;
  var showAll = window._lookupShowAll || false;
  var displayList = showAll ? colleges : colleges.slice(0, DISPLAY_LIMIT);
  var hasMore = colleges.length > DISPLAY_LIMIT && !showAll;

  var readinessHtml = function(r) {
    if (r === 'ready') return '<span class="readiness-badge rb-ready"><span class="readiness-dot"></span>Rollout Ready</span>';
    if (r === 'support') return '<span class="readiness-badge rb-support"><span class="readiness-dot"></span>Needs Support</span>';
    if (r === 'at-risk') return '<span class="readiness-badge rb-risk"><span class="readiness-dot"></span>At Risk</span>';
    return '';
  };

  var html = displayList.map(function(c) {
    var issues = c.issues.length > 0 ? c.issues.map(function(i) { return '<span class="lookup-issue-tag">' + i + '</span>'; }).join('') : '<span class="lookup-issue-tag issue-clear">All clear</span>';

    return '<div class="lookup-card" onclick="this.classList.toggle(\'lc-expanded\')">' +
      '<div class="lookup-card-header">' +
      '<span class="lookup-college-name">' + c.name + '</span>' +
      '<span class="lookup-sis-badge ' + sisClass(c.sis) + '">' + c.sis + '</span>' +
      (c.readiness ? readinessHtml(c.readiness) : '') +
      '<span class="lookup-region">' + c.region + '</span>' +
      '</div>' +
      '<div style="font-size:.68rem;color:var(--text-3);margin-bottom:.4rem">' + c.district + ' \u00b7 ' + c.role + ' \u00b7 Volume: ' + c.volume + '</div>' +
      '<div class="lookup-grid">' +
      '<div class="lookup-field"><div class="lookup-field-label">Financial Aid</div><div class="lookup-field-value ' + faClass(c.fa) + '">' + c.fa + '</div></div>' +
      '<div class="lookup-field"><div class="lookup-field-label">Sign-On</div><div class="lookup-field-value ' + ssoClass(c.sso) + '">' + c.sso + '</div></div>' +
      '<div class="lookup-field"><div class="lookup-field-label">Last Sync</div><div class="lookup-field-value ' + syncClass(c.lastSync) + '">' + c.lastSync + '</div></div>' +
      '</div>' +
      '<div class="lookup-issues">' + issues + '</div>' +
      '<div class="lookup-card-click">Click for analyst notes</div>' +
      '<div class="lookup-card-expand">' +
      '<div class="lookup-action"><strong>Analyst note:</strong> ' + c.tip + '</div>' +
      '</div></div>';
  }).join('');

  if (hasMore) {
    html += '<button onclick="window._lookupShowAll=true;renderLookup(getFilteredColleges())" style="width:100%;padding:.65rem;border:1.5px dashed var(--border-2);border-radius:var(--r);background:var(--surface);font-family:var(--mono);font-size:.75rem;font-weight:600;color:var(--primary);cursor:pointer;margin-top:.5rem;transition:all .15s" onmouseover="this.style.borderColor=\'var(--primary)\';this.style.background=\'var(--primary-light)\'" onmouseout="this.style.borderColor=\'var(--border-2)\';this.style.background=\'var(--surface)\'">Show all ' + colleges.length + ' colleges</button>';
  }
  if (showAll && colleges.length > DISPLAY_LIMIT) {
    html += '<button onclick="window._lookupShowAll=false;renderLookup(getFilteredColleges())" style="width:100%;padding:.55rem;border:1px solid var(--border);border-radius:var(--r);background:var(--surface);font-family:var(--mono);font-size:.68rem;color:var(--text-3);cursor:pointer;margin-top:.35rem;transition:all .15s" onmouseover="this.style.color=\'var(--primary)\'" onmouseout="this.style.color=\'var(--text-3)\'">Show fewer</button>';
  }

  results.innerHTML = html;
  if (counter) counter.textContent = colleges.length + ' of ' + collegeDB.length + ' colleges shown';

  // Mark home colleges (from wrapper #1)
  setTimeout(markHomeLookups, 50);
}

// Clear search
function clearSearch() {
  var input = document.getElementById('collegeLookup');
  if (input) {
    input.value = '';
    input.style.borderColor = '';
    searchColleges('');
    input.focus();
  }
}

// Search input color feedback
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

// Initial render
renderLookup(collegeDB);
