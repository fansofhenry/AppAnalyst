// ═══════════════════════════════════════════════════════
// MANAGER / LEAD DASHBOARD — Rollup view for Team Leads.
// Framed as aggregated analytics, but operates on the
// single-user localStorage data. Surfaces: week-over-week
// deltas, resolution time trends, hotspot colleges, top
// systems, stale KB entries, onboarding progress.
// ═══════════════════════════════════════════════════════

function mgrHumanTime(hours) {
  if (!hours || hours < 0) return '\u2014';
  if (hours < 1) return Math.round(hours * 60) + 'm';
  if (hours < 24) return hours.toFixed(1).replace(/\.0$/, '') + 'h';
  return (hours / 24).toFixed(1).replace(/\.0$/, '') + 'd';
}

function mgrMedian(nums) {
  if (!nums.length) return 0;
  var s = nums.slice().sort(function(a, b) { return a - b; });
  var m = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[m - 1] + s[m]) / 2 : s[m];
}

function mgrEsc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function mgrRender() {
  var container = document.getElementById('managerBody');
  if (!container) return;

  var tickets = [];
  var kb = [];
  var overlay = {};
  var onboarding = [];
  try { tickets = JSON.parse(localStorage.getItem('appanalyst.tickets.v1') || '[]'); } catch (e) {}
  try { kb = JSON.parse(localStorage.getItem('appanalyst.kb.v1') || '[]'); } catch (e) {}
  try { overlay = JSON.parse(localStorage.getItem('appanalyst.colleges.overlay.v1') || '{}'); } catch (e) {}
  try { onboarding = JSON.parse(localStorage.getItem('appanalyst.onboarding.v1') || '[]'); } catch (e) {}

  var now = Date.now();
  var weekAgo = now - 7 * 86400000;
  var twoWeeksAgo = now - 14 * 86400000;
  var monthAgo = now - 30 * 86400000;

  // ── Week-over-week deltas ───────────────────────
  function inRange(iso, from, to) {
    var t = new Date(iso).getTime();
    return t >= from && t < to;
  }

  var opened7 = tickets.filter(function(t) { return inRange(t.created, weekAgo, now); }).length;
  var opened7prev = tickets.filter(function(t) { return inRange(t.created, twoWeeksAgo, weekAgo); }).length;
  var resolved7 = tickets.filter(function(t) { return t.status === 'resolved' && inRange(t.updated || t.created, weekAgo, now); }).length;
  var resolved7prev = tickets.filter(function(t) { return t.status === 'resolved' && inRange(t.updated || t.created, twoWeeksAgo, weekAgo); }).length;

  function delta(a, b) {
    if (b === 0) return a > 0 ? { label: '\u2191 new', cls: 'mgr-delta-up' } : { label: '\u2014', cls: 'mgr-delta-flat' };
    var pct = Math.round(((a - b) / b) * 100);
    if (pct === 0) return { label: 'flat', cls: 'mgr-delta-flat' };
    var arrow = pct > 0 ? '\u2191' : '\u2193';
    var sign = pct > 0 ? '+' : '';
    return { label: arrow + ' ' + sign + pct + '%', cls: pct > 0 ? 'mgr-delta-up' : 'mgr-delta-down' };
  }

  var openedDelta = delta(opened7, opened7prev);
  var resolvedDelta = delta(resolved7, resolved7prev);

  // Open count + aging stats
  var open = tickets.filter(function(t) { return t.status !== 'resolved'; });
  var aging = open.filter(function(t) { return (now - new Date(t.created).getTime()) >= 3 * 86400000; }).length;
  var urgent = open.filter(function(t) { return (now - new Date(t.created).getTime()) >= 7 * 86400000; }).length;

  // Resolution time (last 30 days)
  var recent = tickets.filter(function(t) { return t.status === 'resolved' && new Date(t.updated || t.created).getTime() >= monthAgo; });
  var recentHours = recent.map(function(t) {
    return Math.max(0, (new Date(t.updated || t.created).getTime() - new Date(t.created).getTime()) / 3600000);
  });
  var medianHours = mgrMedian(recentHours);

  // Previous 30-day window for delta
  var prevRecent = tickets.filter(function(t) {
    if (t.status !== 'resolved') return false;
    var ts = new Date(t.updated || t.created).getTime();
    return ts >= monthAgo - 30 * 86400000 && ts < monthAgo;
  });
  var prevHours = prevRecent.map(function(t) {
    return Math.max(0, (new Date(t.updated || t.created).getTime() - new Date(t.created).getTime()) / 3600000);
  });
  var prevMedian = mgrMedian(prevHours);
  var resolutionDelta = prevMedian === 0 ? { label: '\u2014', cls: 'mgr-delta-flat' }
    : (function() {
        var diff = medianHours - prevMedian;
        if (Math.abs(diff) < 0.01) return { label: 'flat', cls: 'mgr-delta-flat' };
        // For resolution time, down is good
        return diff < 0
          ? { label: '\u2193 faster', cls: 'mgr-delta-up' }
          : { label: '\u2191 slower', cls: 'mgr-delta-down' };
      })();

  // Hotspot colleges (open ticket count)
  var byCollege = {};
  open.forEach(function(t) {
    var k = t.college || '(unassigned)';
    byCollege[k] = (byCollege[k] || 0) + 1;
  });
  var hotspots = Object.keys(byCollege).map(function(name) {
    return { name: name, count: byCollege[name] };
  }).sort(function(a, b) { return b.count - a.count; }).slice(0, 5);

  // Top systems (by volume)
  var bySystem = {};
  tickets.forEach(function(t) {
    if (!t.system) return;
    bySystem[t.system] = (bySystem[t.system] || 0) + 1;
  });
  var topSystems = Object.keys(bySystem).map(function(name) {
    return { name: name, count: bySystem[name] };
  }).sort(function(a, b) { return b.count - a.count; }).slice(0, 5);

  // Stale KB entries (not updated in 90+ days)
  var staleKb = kb.filter(function(e) {
    var ts = new Date(e.updated || 0).getTime();
    return now - ts > 90 * 86400000;
  }).length;

  // Onboarding progress
  var obDone = onboarding.filter(function(i) { return i.done; }).length;
  var obTotal = onboarding.length;
  var obPct = obTotal > 0 ? Math.round((obDone / obTotal) * 100) : 0;

  var hasData = tickets.length > 0 || kb.length > 0 || Object.keys(overlay).length > 0;

  if (!hasData) {
    container.innerHTML =
      '<div class="mgr-empty">' +
        '<h3>No data yet</h3>' +
        '<p>The Manager view aggregates the data in this workbench. Once your analysts start logging tickets, updating the KB, and touching colleges, this dashboard will surface rollups, resolution trends, hotspots, and 1:1-ready metrics.</p>' +
      '</div>';
    return;
  }

  // ── Render ──────────────────────────────────────
  var html = '';

  // KPI strip
  html += '<div class="mgr-kpi-strip">' +
    mgrKpi('Opened this week', opened7, openedDelta, 'var(--blue)') +
    mgrKpi('Resolved this week', resolved7, resolvedDelta, 'var(--primary)') +
    mgrKpi('Median resolution (30d)', mgrHumanTime(medianHours), resolutionDelta, 'var(--purple)') +
    mgrKpi('Total open', open.length, null, 'var(--text)') +
    mgrKpi('Aging 3d+', aging, null, aging > 0 ? 'var(--amber)' : 'var(--text-3)') +
    mgrKpi('Urgent 7d+', urgent, null, urgent > 0 ? 'var(--red)' : 'var(--text-3)') +
  '</div>';

  // Two-column detail
  html += '<div class="mgr-grid">';

  // Hotspot colleges
  html += '<div class="mgr-card">' +
    '<div class="mgr-card-head">Top open colleges</div>' +
    (hotspots.length === 0
      ? '<div class="mgr-card-empty">No open tickets assigned to colleges yet.</div>'
      : '<div class="mgr-bars">' +
          hotspots.map(function(h) {
            var max = hotspots[0].count;
            var pct = max > 0 ? (h.count / max) * 100 : 0;
            return '<div class="mgr-bar-row">' +
              '<div class="mgr-bar-label">' + mgrEsc(h.name) + '</div>' +
              '<div class="mgr-bar-track"><div class="mgr-bar-fill" style="width:' + pct + '%;background:var(--amber)"></div></div>' +
              '<div class="mgr-bar-count">' + h.count + '</div>' +
            '</div>';
          }).join('') +
        '</div>'
    ) +
  '</div>';

  // Top systems
  html += '<div class="mgr-card">' +
    '<div class="mgr-card-head">Top systems (all-time volume)</div>' +
    (topSystems.length === 0
      ? '<div class="mgr-card-empty">No system-tagged tickets yet.</div>'
      : '<div class="mgr-bars">' +
          topSystems.map(function(h) {
            var max = topSystems[0].count;
            var pct = max > 0 ? (h.count / max) * 100 : 0;
            return '<div class="mgr-bar-row">' +
              '<div class="mgr-bar-label">' + mgrEsc(h.name) + '</div>' +
              '<div class="mgr-bar-track"><div class="mgr-bar-fill" style="width:' + pct + '%;background:var(--blue)"></div></div>' +
              '<div class="mgr-bar-count">' + h.count + '</div>' +
            '</div>';
          }).join('') +
        '</div>'
    ) +
  '</div>';

  // Onboarding + KB health
  html += '<div class="mgr-card">' +
    '<div class="mgr-card-head">Team onboarding progress</div>' +
    '<div class="mgr-progress-num"><strong>' + obDone + '</strong> / ' + obTotal + ' items complete</div>' +
    '<div class="mgr-progress-bar"><div class="mgr-progress-fill" style="width:' + obPct + '%"></div></div>' +
    '<div class="mgr-progress-pct">' + obPct + '%</div>' +
  '</div>';

  html += '<div class="mgr-card">' +
    '<div class="mgr-card-head">Knowledge base health</div>' +
    '<div class="mgr-kb-stats">' +
      '<div class="mgr-kb-stat"><div class="mgr-kb-num">' + kb.length + '</div><div class="mgr-kb-lbl">Total entries</div></div>' +
      '<div class="mgr-kb-stat"><div class="mgr-kb-num" style="color:' + (staleKb > 0 ? 'var(--amber)' : 'var(--primary)') + '">' + staleKb + '</div><div class="mgr-kb-lbl">Stale (90d+)</div></div>' +
      '<div class="mgr-kb-stat"><div class="mgr-kb-num">' + Object.keys(overlay).length + '</div><div class="mgr-kb-lbl">Colleges noted</div></div>' +
    '</div>' +
    (staleKb > 0 ? '<div class="mgr-kb-warn">Consider reviewing stale KB entries for accuracy \u2014 especially integration guidance that changes with each Exchange release.</div>' : '') +
  '</div>';

  html += '</div>';  // .mgr-grid

  // Talking points for 1:1
  html += '<div class="mgr-talking">' +
    '<div class="mgr-talking-head">Talking points for 1:1 / weekly report</div>' +
    '<ul class="mgr-talking-list">' +
      '<li><strong>Volume:</strong> ' + opened7 + ' opened this week (' + openedDelta.label + ' vs prior week), ' + resolved7 + ' resolved (' + resolvedDelta.label + ').</li>' +
      '<li><strong>Resolution time:</strong> median is now ' + mgrHumanTime(medianHours) + ' (' + resolutionDelta.label + ' vs prior 30d).</li>' +
      (hotspots.length > 0 ? '<li><strong>Top hotspots:</strong> ' + hotspots.slice(0, 3).map(function(h) { return h.name + ' (' + h.count + ')'; }).join(', ') + '</li>' : '') +
      (topSystems.length > 0 ? '<li><strong>Most-touched systems:</strong> ' + topSystems.slice(0, 3).map(function(s) { return s.name + ' (' + s.count + ')'; }).join(', ') + '</li>' : '') +
      (urgent > 0 ? '<li><strong>Attention:</strong> ' + urgent + ' urgent ticket(s) 7+ days old \u2014 risk of escalation.</li>' : '') +
      (staleKb > 0 ? '<li><strong>KB debt:</strong> ' + staleKb + ' entries not updated in 90+ days.</li>' : '') +
      '<li><strong>Onboarding:</strong> ' + obPct + '% complete (' + obDone + '/' + obTotal + ').</li>' +
    '</ul>' +
  '</div>';

  container.innerHTML = html;
}

function mgrKpi(label, value, delta, color) {
  return '<div class="mgr-kpi">' +
    '<div class="mgr-kpi-label">' + label + '</div>' +
    '<div class="mgr-kpi-num" style="color:' + color + '">' + value + '</div>' +
    (delta ? '<div class="mgr-kpi-delta ' + delta.cls + '">' + delta.label + '</div>' : '<div class="mgr-kpi-delta">&nbsp;</div>') +
  '</div>';
}

window.addEventListener('appanalyst:role-change', mgrRender);
window.addEventListener('focus', function() {
  if (typeof roleGet === 'function' && roleGet() === 'manager') mgrRender();
});

mgrRender();
