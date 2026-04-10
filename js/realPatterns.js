// ═══════════════════════════════════════════════════════
// REAL PATTERNS — Chart actual tickets from the log.
// Three views: by system, by college, by week.
// ═══════════════════════════════════════════════════════

var RP_VIEW_KEY = 'appanalyst.patterns.view.v1';
var RP_GROUP_KEY = 'appanalyst.patterns.group.v1';

function rpGetView() { try { return localStorage.getItem(RP_VIEW_KEY) || 'real'; } catch (e) { return 'real'; } }
function rpSetView(v) { try { localStorage.setItem(RP_VIEW_KEY, v); } catch (e) {} rpApplyView(); }
function rpGetGroup() { try { return localStorage.getItem(RP_GROUP_KEY) || 'system'; } catch (e) { return 'system'; } }
function rpSetGroup(g) { try { localStorage.setItem(RP_GROUP_KEY, g); } catch (e) {} rpRender(); }

function rpApplyView() {
  var v = rpGetView();
  var real = document.getElementById('realPatternsBody');
  var demo = document.getElementById('demoPatternsBody');
  var btnReal = document.getElementById('rpBtnReal');
  var btnDemo = document.getElementById('rpBtnDemo');
  if (real) real.style.display = v === 'real' ? '' : 'none';
  if (demo) demo.style.display = v === 'demo' ? '' : 'none';
  if (btnReal) btnReal.classList.toggle('rm-active', v === 'real');
  if (btnDemo) btnDemo.classList.toggle('rm-active', v === 'demo');
  if (v === 'real') rpRender();
}

function rpEsc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function rpWeekKey(iso) {
  var d = new Date(iso);
  // ISO week start (Monday-based is fine for display)
  var day = d.getDay();
  var diff = d.getDate() - day + (day === 0 ? -6 : 1);
  var monday = new Date(d);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  var m = monday.getMonth() + 1;
  var da = monday.getDate();
  return monday.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (da < 10 ? '0' : '') + da;
}

function rpWeekLabel(key) {
  var parts = key.split('-');
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[parseInt(parts[1]) - 1] + ' ' + parseInt(parts[2]);
}

function rpRender() {
  var container = document.getElementById('realPatternsBody');
  if (!container) return;

  var tickets = [];
  try { tickets = JSON.parse(localStorage.getItem('appanalyst.tickets.v1') || '[]'); } catch (e) {}

  var total = tickets.length;
  var open = tickets.filter(function(t) { return t.status !== 'resolved'; }).length;
  var resolved = total - open;

  if (total === 0) {
    container.innerHTML =
      '<div class="rp-empty">' +
        '<h3>No tickets to analyze yet</h3>' +
        '<p>Log a few tickets and this chart will show you which systems, colleges, and weeks generate the most work. Patterns emerge fast.</p>' +
        '<button class="tl-btn tl-btn-new" onclick="if(typeof tlAdd===\'function\')tlAdd()">+ Log first ticket</button>' +
      '</div>';
    return;
  }

  var group = rpGetGroup();
  var buckets = {};
  var bucketStatus = {}; // for stacking open vs resolved

  tickets.forEach(function(t) {
    var key;
    if (group === 'system') key = t.system || 'Unknown';
    else if (group === 'college') key = t.college || '(unassigned)';
    else if (group === 'status') key = t.status || 'open';
    else if (group === 'week') key = rpWeekKey(t.created);
    else if (group === 'vendor') key = t.vendor || '(none)';
    buckets[key] = (buckets[key] || 0) + 1;
    if (!bucketStatus[key]) bucketStatus[key] = { open: 0, resolved: 0 };
    if (t.status === 'resolved') bucketStatus[key].resolved++;
    else bucketStatus[key].open++;
  });

  // Convert to sorted array. By week → chronological. Others → by count desc.
  var entries = Object.keys(buckets).map(function(k) { return { key: k, count: buckets[k] }; });
  if (group === 'week') {
    entries.sort(function(a, b) { return a.key < b.key ? -1 : 1; });
  } else {
    entries.sort(function(a, b) { return b.count - a.count; });
  }

  var max = entries.reduce(function(m, e) { return Math.max(m, e.count); }, 0);
  var displayLabel = function(k) {
    if (group === 'week') return rpWeekLabel(k);
    if (k.length > 28) return k.slice(0, 26) + '…';
    return k;
  };

  // Summary strip
  var strip =
    '<div class="rp-summary">' +
      '<div class="rp-sum-card"><div class="rp-sum-num">' + total + '</div><div class="rp-sum-label">Total</div></div>' +
      '<div class="rp-sum-card"><div class="rp-sum-num" style="color:var(--blue)">' + open + '</div><div class="rp-sum-label">Open</div></div>' +
      '<div class="rp-sum-card"><div class="rp-sum-num" style="color:var(--primary)">' + resolved + '</div><div class="rp-sum-label">Resolved</div></div>' +
      '<div class="rp-sum-card"><div class="rp-sum-num">' + entries.length + '</div><div class="rp-sum-label">Distinct ' + group + 's</div></div>' +
    '</div>';

  var groupBtns = ['system', 'college', 'status', 'vendor', 'week'].map(function(g) {
    return '<button class="rp-group-btn' + (g === group ? ' rp-active' : '') + '" onclick="rpSetGroup(\'' + g + '\')">' + g + '</button>';
  }).join('');

  // Bars
  var bars = entries.map(function(e) {
    var pct = max > 0 ? (e.count / max) * 100 : 0;
    var openCount = bucketStatus[e.key].open;
    var resolvedCount = bucketStatus[e.key].resolved;
    var openPct = e.count > 0 ? (openCount / e.count) * 100 : 0;
    return '<div class="rp-bar-row">' +
      '<div class="rp-bar-label" title="' + rpEsc(e.key) + '">' + rpEsc(displayLabel(e.key)) + '</div>' +
      '<div class="rp-bar-track" style="width:' + pct.toFixed(1) + '%">' +
        '<div class="rp-bar-open" style="width:' + openPct.toFixed(1) + '%"></div>' +
      '</div>' +
      '<div class="rp-bar-count">' +
        '<span>' + e.count + '</span>' +
        (openCount > 0 ? ' <span class="rp-bar-open-badge">' + openCount + ' open</span>' : '') +
      '</div>' +
    '</div>';
  }).join('');

  container.innerHTML = strip +
    '<div class="rp-group-picker">' +
      '<span class="rp-group-label">Group by:</span>' + groupBtns +
    '</div>' +
    '<div class="rp-chart">' + bars + '</div>' +
    '<div class="rp-legend">' +
      '<span class="rp-legend-item"><span class="rp-legend-swatch rp-swatch-open"></span>Open</span>' +
      '<span class="rp-legend-item"><span class="rp-legend-swatch rp-swatch-all"></span>Total (includes resolved)</span>' +
    '</div>';
}

window.addEventListener('focus', function() { if (rpGetView() === 'real') rpRender(); });

rpApplyView();
