// ═══════════════════════════════════════════════════════
// MONITOR — Status grid, filters, row expand/collapse
// ═══════════════════════════════════════════════════════

var monFilter = 'all';
var monQuery = '';
var expandedRow = null;

function setFilter(f, el) {
  monFilter = f;
  document.querySelectorAll('.filter-tab').forEach(function(t) { t.classList.remove('active'); });
  el.classList.add('active');
  renderMonitor();
}

function filterMonitor() {
  monQuery = document.getElementById('monSearch').value.toLowerCase();
  renderMonitor();
}

// MERGED: original renderMonitor + FHDA wrapper
// Calls markHomeRows() and addFHDAHealth() at end
function renderMonitor() {
  var filtered = allColleges.filter(function(c) {
    if (monFilter !== 'all' && c.status !== monFilter) return false;
    if (monQuery && c.name.toLowerCase().indexOf(monQuery) < 0 && c.sis.toLowerCase().indexOf(monQuery) < 0) return false;
    return true;
  });

  var groups = { 'Banner Direct': [], 'Banner Ethos': [], 'PeopleSoft': [], 'Colleague Ethos': [], 'Colleague': [] };
  filtered.forEach(function(c) { if (groups[c.sis]) groups[c.sis].push(c); });

  var ok = filtered.filter(function(c) { return c.status === 'ok'; }).length;
  var warn = filtered.filter(function(c) { return c.status === 'warn'; }).length;
  var err = filtered.filter(function(c) { return c.status === 'err'; }).length;
  var atRisk = warn * 420 + err * 1850;

  var spkOk = '<svg width="48" height="14" style="margin-top:4px;opacity:.4"><path d="M0,12 L8,10 L16,11 L24,8 L32,6 L40,4 L48,2" fill="none" stroke="#22C55E" stroke-width="1.5" stroke-linecap="round"/></svg>';
  var spkW = '<svg width="48" height="14" style="margin-top:4px;opacity:.4"><path d="M0,8 L8,10 L16,6 L24,12 L32,8 L40,10 L48,14" fill="none" stroke="#F59E0B" stroke-width="1.5" stroke-linecap="round"/></svg>';
  var spkE = '<svg width="48" height="14" style="margin-top:4px;opacity:.4"><path d="M0,14 L8,10 L16,12 L24,6 L32,4 L40,6 L48,2" fill="none" stroke="#EF4444" stroke-width="1.5" stroke-linecap="round"/></svg>';

  document.getElementById('monSummary').innerHTML =
    '<div class="ms-cell"><div class="ms-num ms-num-g">' + ok + '</div><div class="ms-label">Healthy</div>' + spkOk + '</div>' +
    '<div class="ms-cell"><div class="ms-num ms-num-a">' + warn + '</div><div class="ms-label">Degraded</div>' + spkW + '</div>' +
    '<div class="ms-cell"><div class="ms-num ms-num-r">' + err + '</div><div class="ms-label">Failing</div>' + spkE + '</div>' +
    '<div class="ms-cell"><div class="ms-num" style="color:var(--teal)">' + (atRisk > 0 ? '~' + atRisk.toLocaleString() : '0') + '</div><div class="ms-label">Students at Risk</div></div>';

  var html = '';
  var keys = Object.keys(groups);
  for (var g = 0; g < keys.length; g++) {
    var sis = keys[g];
    var items = groups[sis];
    if (!items.length) continue;
    html += '<div class="status-panel"><div class="sp-header"><div class="sp-title">' + sis + '</div><div class="sp-count">' + items.length + ' colleges</div></div><div class="sp-body">';
    for (var j = 0; j < items.length; j++) {
      var c = items[j];
      var uid = sis + '-' + j;
      html += '<div class="status-row" id="sr-' + uid + '" onclick="toggleRow(\'' + uid + '\',this)">' +
        '<div class="s-indicator s-' + c.status + '"></div>' +
        '<div class="s-info"><div class="s-name">' + c.name + '</div><div class="s-detail">' + c.detail + '</div></div>' +
        '<span class="s-badge sb-' + c.status + '">' + c.badge + '</span>' +
        '<span class="s-expand-icon">\u25be</span>' +
        '</div>' +
        '<div class="row-detail" id="rd-' + uid + '">' +
        '<div class="rd-grid">' +
        '<div class="rd-item"><div class="rd-label">Uptime</div><div class="rd-value">' + c.uptime + '</div></div>' +
        '<div class="rd-item"><div class="rd-label">Last Error</div><div class="rd-value">' + c.lastErr + '</div></div>' +
        '</div>' +
        '<div class="rd-history"><strong style="font-size:.55rem;letter-spacing:.08em;text-transform:uppercase;display:block;margin-bottom:.25rem;color:var(--text-2)">Recent</strong>' +
        c.history.map(function(h) { return '<span>' + h + '</span>'; }).join('') +
        '</div></div>';
    }
    html += '</div></div>';
  }
  document.getElementById('monitorGrid').innerHTML = html;

  // FHDA awareness: re-apply home badges after each render
  var old = document.getElementById('fhdaHealth');
  if (old) old.remove();
  setTimeout(function() {
    markHomeRows();
    addFHDAHealth();
  }, 50);
}

// MERGED: original toggleRow + expanded class wrapper
function toggleRow(uid, el) {
  var rd = document.getElementById('rd-' + uid);
  if (expandedRow && expandedRow !== uid) {
    var oldRd = document.getElementById('rd-' + expandedRow);
    var oldSr = document.getElementById('sr-' + expandedRow);
    if (oldRd) oldRd.classList.remove('show');
    if (oldSr) oldSr.classList.remove('expanded');
  }
  var isOpen = rd.classList.contains('show');
  rd.classList.toggle('show');
  if (el) el.classList.toggle('expanded');

  // Also toggle expanded class on the row element
  var row = document.getElementById('sr-' + uid);
  if (row) {
    var isExpanded = rd && rd.classList.contains('show');
    row.classList.toggle('expanded', isExpanded);
  }

  expandedRow = isOpen ? null : uid;
}

// Initial render
renderMonitor();

// Auto-refresh timer
var refreshCount = 30;
setInterval(function() {
  refreshCount--;
  if (refreshCount <= 0) { refreshCount = 30; }
  document.getElementById('refreshTimer').textContent = 'Auto-refresh: ' + refreshCount + 's';
}, 1000);

// Live clock
function updateMonClock() {
  var now = new Date();
  var h = now.getHours();
  var m = now.getMinutes();
  var s = now.getSeconds();
  var ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  var ts = h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s + ' ' + ap;
  var el = document.getElementById('refreshTimer');
  if (el) el.textContent = 'Last check: ' + ts;
}
setInterval(updateMonClock, 1000);
updateMonClock();

// Live alerts
var alertMsgs = [
  { title: '\u26d4 Enrollment Anomaly', body: '<strong>Flagged:</strong> 6 new CCCIDs from same IP cross-enrolled into high-unit courses at 2:47 AM. FA Consortium Agreements pending.', time: 'Just now' },
  { title: '\u26a1 Integration Alert', body: '<strong>Sacramento City College</strong> \u2014 Ethos API OAuth2 token expired. 47 AER records queued.', time: '3 min ago' },
  { title: '\u26a0 IdP Proxy Alert', body: '<strong>Riverside City College</strong> \u2014 CCCID not asserted by college IdP. Students redirected to OpenCCC recovery.', time: '5 min ago' },
  { title: '\u23f1 Sync Warning', body: '<strong>City College of San Francisco</strong> \u2014 Seat count sync delayed 8 min. 3 courses showing outdated availability.', time: '8 min ago' },
  { title: '\u2705 Resolved', body: '<strong>Feather River College</strong> \u2014 Colleague Ethos timeout resolved. 23 records transmitted.', time: '12 min ago' }
];
var alertIdx = 0;
var alertEl = document.getElementById('liveAlert');

function showNextAlert() {
  if (!alertEl) return;
  var msg = alertMsgs[alertIdx % alertMsgs.length];
  alertEl.querySelector('.live-alert-title').textContent = msg.title;
  alertEl.querySelector('.live-alert-body').innerHTML = msg.body;
  alertEl.querySelector('.live-alert-time').textContent = msg.time;
  alertEl.classList.add('show');
  alertIdx++;
}

function dismissAlert() {
  if (alertEl) {
    alertEl.classList.remove('show');
    setTimeout(showNextAlert, 3000);
  }
}

// Show first alert when Monitor section enters viewport
var monitorAlertShown = false;
var monitorAlertObs = new IntersectionObserver(function(entries) {
  if (entries[0].isIntersecting && !monitorAlertShown) {
    monitorAlertShown = true;
    setTimeout(showNextAlert, 400);
    monitorAlertObs.disconnect();
  }
}, { threshold: 0.1 });
var monitorSection = document.getElementById('monitor');
if (monitorSection) monitorAlertObs.observe(monitorSection);
// Fallback: show after 8s even if Monitor never scrolled to
setTimeout(function() { if (!monitorAlertShown) { monitorAlertShown = true; showNextAlert(); } }, 8000);
if (alertEl) { alertEl.style.cursor = 'pointer'; alertEl.addEventListener('click', dismissAlert); }
