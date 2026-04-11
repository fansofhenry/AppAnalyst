// ═══════════════════════════════════════════════════════
// REAL MONITOR — "Active Colleges" view reading from the
// ticket log. Replaces the demo status dashboard by default.
// ═══════════════════════════════════════════════════════

var RM_VIEW_KEY = 'appanalyst.monitor.view.v1';

function rmGetView() {
  try { return localStorage.getItem(RM_VIEW_KEY) || 'real'; }
  catch (e) { return 'real'; }
}

function rmSetView(v) {
  try { localStorage.setItem(RM_VIEW_KEY, v); } catch (e) {}
  rmApplyView();
}

function rmApplyView() {
  var v = rmGetView();
  var real = document.getElementById('realMonitorBody');
  var demo = document.getElementById('demoMonitorBody');
  var btnReal = document.getElementById('rmBtnReal');
  var btnDemo = document.getElementById('rmBtnDemo');
  if (real) real.style.display = v === 'real' ? '' : 'none';
  if (demo) demo.style.display = v === 'demo' ? '' : 'none';
  if (btnReal) btnReal.classList.toggle('rm-active', v === 'real');
  if (btnDemo) btnDemo.classList.toggle('rm-active', v === 'demo');
  if (v === 'real') rmRender();
}

function rmEsc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function rmDays(iso) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

function rmRender() {
  var container = document.getElementById('realMonitorBody');
  if (!container) return;

  var tickets = [];
  var overlay = {};
  try { tickets = JSON.parse(localStorage.getItem('appanalyst.tickets.v1') || '[]'); } catch (e) {}
  try { overlay = JSON.parse(localStorage.getItem('appanalyst.colleges.overlay.v1') || '{}'); } catch (e) {}

  // Group tickets by college
  var byCollege = {};
  tickets.forEach(function(t) {
    var key = t.college || '(unassigned)';
    if (!byCollege[key]) byCollege[key] = { college: key, open: 0, aging: 0, urgent: 0, resolved: 0, all: [], systems: {} };
    byCollege[key].all.push(t);
    if (t.status === 'resolved') { byCollege[key].resolved++; return; }
    byCollege[key].open++;
    var d = rmDays(t.created);
    if (d >= 7) byCollege[key].urgent++;
    else if (d >= 3) byCollege[key].aging++;
    if (t.system) {
      byCollege[key].systems[t.system] = (byCollege[key].systems[t.system] || 0) + 1;
    }
  });

  var list = Object.keys(byCollege).map(function(k) { return byCollege[k]; });
  // Sort: urgent desc, aging desc, open desc, name asc
  list.sort(function(a, b) {
    if (b.urgent !== a.urgent) return b.urgent - a.urgent;
    if (b.aging !== a.aging) return b.aging - a.aging;
    if (b.open !== a.open) return b.open - a.open;
    return a.college.localeCompare(b.college);
  });

  // Pulse numbers (real)
  var totalTickets = tickets.length;
  var openTickets = tickets.filter(function(t) { return t.status !== 'resolved'; });
  var agingTickets = openTickets.filter(function(t) { return rmDays(t.created) >= 3; });
  var urgentTickets = openTickets.filter(function(t) { return rmDays(t.created) >= 7; });
  var uniqueColleges = Object.keys(byCollege).filter(function(k) { return k !== '(unassigned)'; }).length;
  var withOpen = list.filter(function(c) { return c.open > 0 && c.college !== '(unassigned)'; }).length;

  var pulseHtml =
    '<div class="rm-pulse">' +
      '<div class="rm-pulse-card"><div class="rm-pulse-num">' + totalTickets + '</div><div class="rm-pulse-label">Total tickets</div></div>' +
      '<div class="rm-pulse-card"><div class="rm-pulse-num" style="color:var(--blue)">' + openTickets.length + '</div><div class="rm-pulse-label">Open</div></div>' +
      '<div class="rm-pulse-card"><div class="rm-pulse-num" style="color:var(--amber)">' + agingTickets.length + '</div><div class="rm-pulse-label">Aging 3d+</div></div>' +
      '<div class="rm-pulse-card"><div class="rm-pulse-num" style="color:var(--red)">' + urgentTickets.length + '</div><div class="rm-pulse-label">Urgent 7d+</div></div>' +
      '<div class="rm-pulse-card"><div class="rm-pulse-num">' + uniqueColleges + '</div><div class="rm-pulse-label">Colleges touched</div></div>' +
      '<div class="rm-pulse-card"><div class="rm-pulse-num" style="color:var(--primary)">' + withOpen + '</div><div class="rm-pulse-label">Active colleges</div></div>' +
    '</div>';

  if (list.length === 0) {
    container.innerHTML = pulseHtml +
      '<div class="rm-empty">' +
        '<h3>No tickets yet</h3>' +
        '<p>Once you log your first ticket, this view fills with the colleges you\u2019re actively working. Colleges with urgent or aging tickets float to the top.</p>' +
        '<button class="tl-btn tl-btn-new" onclick="if(typeof tlAdd===\'function\')tlAdd()">+ Log first ticket</button>' +
      '</div>';
    return;
  }

  // Group by SIS tier pulled from collegeDB if available
  var getSis = function(name) {
    if (overlay[name] && overlay[name].sis) return overlay[name].sis;
    if (typeof collegeDB === 'undefined') return 'unknown';
    var c = collegeDB.find(function(x) { return x.name === name; });
    return c ? c.sis : 'unknown';
  };

  var rowHtml = list.map(function(c) {
    var sis = getSis(c.college);
    var sisCls = sis === 'unknown' ? 'sis-unknown' :
                 sis.indexOf('PeopleSoft') >= 0 ? 'sis-peoplesoft' :
                 sis.indexOf('Colleague') >= 0 ? 'sis-colleague' :
                 sis.indexOf('Ethos') >= 0 ? 'sis-banner-ethos' : 'sis-banner-direct';
    var indicator = c.urgent > 0 ? 's-err' : c.aging > 0 ? 's-warn' : c.open > 0 ? 's-ok' : 's-ok';
    var badgeText = c.urgent > 0 ? c.urgent + ' urgent' : c.aging > 0 ? c.aging + ' aging' : c.open + ' open';
    var badgeCls = c.urgent > 0 ? 'sb-err' : c.aging > 0 ? 'sb-warn' : 'sb-ok';
    var topSystems = Object.keys(c.systems).sort(function(a, b) { return c.systems[b] - c.systems[a]; }).slice(0, 3);
    return '<div class="rm-row" data-rm-college="' + rmEsc(c.college) + '" tabindex="0" role="button">' +
      '<span class="s-indicator ' + indicator + '"></span>' +
      '<div class="rm-info">' +
        '<div class="rm-name">' + rmEsc(c.college) + '</div>' +
        '<div class="rm-sub"><span class="lookup-sis-badge ' + sisCls + '">' + rmEsc(sis) + '</span>' +
        ' · ' + c.all.length + ' total · ' + c.resolved + ' resolved' +
        (topSystems.length ? ' · systems: ' + topSystems.map(rmEsc).join(', ') : '') +
        '</div>' +
      '</div>' +
      '<span class="s-badge ' + badgeCls + '">' + badgeText + '</span>' +
    '</div>';
  }).join('');

  container.innerHTML = pulseHtml +
    '<div class="rm-list-header">' +
      '<span class="rm-list-title">Active colleges</span>' +
      '<span class="rm-list-hint">Sorted by urgency. Click any row to jump to the ticket log filtered by that college.</span>' +
    '</div>' +
    '<div class="rm-list">' + rowHtml + '</div>';

  // Delegated click — avoids interpolating user-typed college names into onclick handlers (XSS safe)
  var listEl = container.querySelector('.rm-list');
  if (listEl && !listEl._rmBound) {
    listEl._rmBound = true;
    listEl.addEventListener('click', function(ev) {
      var row = ev.target.closest('.rm-row');
      if (row && row.dataset.rmCollege) rmJumpToCollege(row.dataset.rmCollege);
    });
    listEl.addEventListener('keydown', function(ev) {
      if (ev.key !== 'Enter' && ev.key !== ' ') return;
      var row = ev.target.closest('.rm-row');
      if (row && row.dataset.rmCollege) { ev.preventDefault(); rmJumpToCollege(row.dataset.rmCollege); }
    });
  }
}

function rmJumpToCollege(name) {
  var tl = document.getElementById('ticketLog');
  if (tl) tl.scrollIntoView({ behavior: 'smooth' });
  setTimeout(function() {
    var input = document.querySelector('#ticketLog .tl-search');
    if (input) {
      input.value = name;
      if (typeof tlSetSearch === 'function') tlSetSearch(name);
    }
  }, 500);
}

// Re-render when focus returns (likely came back from working a ticket)
window.addEventListener('focus', function() { if (rmGetView() === 'real') rmRender(); });

rmApplyView();
