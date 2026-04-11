// ═══════════════════════════════════════════════════════
// REAL OUTREACH — Personal outreach calendar. 12 months,
// editable events, status tracking, localStorage-backed.
// ═══════════════════════════════════════════════════════

var RO_KEY = 'appanalyst.outreach.v1';
var RO_VIEW_KEY = 'appanalyst.outreach.view.v1';

var RO_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var RO_STATUSES = ['planned', 'in-progress', 'done', 'skipped'];

function roGetView() { try { return localStorage.getItem(RO_VIEW_KEY) || 'real'; } catch (e) { return 'real'; } }
function roSetView(v) { try { localStorage.setItem(RO_VIEW_KEY, v); } catch (e) {} roApplyView(); }

function roLoad() {
  try {
    var raw = localStorage.getItem(RO_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}

function roSave(list) {
  if (typeof safeStorage !== 'undefined') { safeStorage.set(RO_KEY, list); return; }
  try { localStorage.setItem(RO_KEY, JSON.stringify(list)); } catch (e) {}
}

function roEsc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function roApplyView() {
  var v = roGetView();
  var real = document.getElementById('realOutreachBody');
  var demo = document.getElementById('demoOutreachBody');
  var btnReal = document.getElementById('roBtnReal');
  var btnDemo = document.getElementById('roBtnDemo');
  if (real) real.style.display = v === 'real' ? '' : 'none';
  if (demo) demo.style.display = v === 'demo' ? '' : 'none';
  if (btnReal) btnReal.classList.toggle('rm-active', v === 'real');
  if (btnDemo) btnDemo.classList.toggle('rm-active', v === 'demo');
  if (v === 'real') roRender();
}

function roAdd(monthIdx) {
  var list = roLoad();
  var m = typeof monthIdx === 'number' ? monthIdx : new Date().getMonth();
  var event = {
    id: 'O' + Date.now().toString(36) + Math.random().toString(36).slice(2, 4),
    title: '',
    month: m,
    status: 'planned',
    notes: '',
    created: new Date().toISOString(),
    updated: new Date().toISOString()
  };
  list.push(event);
  roSave(list);
  roRender();
  setTimeout(function() {
    var input = document.querySelector('[data-ro-id="' + event.id + '"] .ro-title-input');
    if (input) input.focus();
  }, 40);
}

function roUpdate(id, field, value) {
  var list = roLoad();
  var e = list.find(function(x) { return x.id === id; });
  if (!e) return;
  e[field] = value;
  e.updated = new Date().toISOString();
  roSave(list);
  if (field === 'status' || field === 'month') roRender();
}

function roDelete(id) {
  var all = roLoad();
  var deleted = all.find(function(e) { return e.id === id; });
  if (!deleted) return;
  var list = all.filter(function(e) { return e.id !== id; });
  roSave(list);
  roRender();
  if (typeof undoPush === 'function') {
    undoPush(function() {
      var cur = roLoad();
      cur.push(deleted);
      roSave(cur);
      roRender();
    }, 'outreach event');
  }
}

function roImportTemplate(title, month, notes) {
  var list = roLoad();
  list.push({
    id: 'O' + Date.now().toString(36) + Math.random().toString(36).slice(2, 4),
    title: title,
    month: month,
    status: 'planned',
    notes: notes || '',
    created: new Date().toISOString(),
    updated: new Date().toISOString()
  });
  roSave(list);
  toast('Added "' + title + '" to ' + RO_MONTHS[month]);
  // Auto-switch to real view if we're not on it
  if (roGetView() !== 'real') roSetView('real');
  else roRender();
}

function roRender() {
  var container = document.getElementById('realOutreachBody');
  if (!container) return;

  var events = roLoad();
  var currentMonth = new Date().getMonth();

  // Group by month
  var byMonth = {};
  for (var i = 0; i < 12; i++) byMonth[i] = [];
  events.forEach(function(e) {
    if (typeof e.month === 'number' && e.month >= 0 && e.month <= 11) byMonth[e.month].push(e);
  });

  // Summary
  var total = events.length;
  var done = events.filter(function(e) { return e.status === 'done'; }).length;
  var inProgress = events.filter(function(e) { return e.status === 'in-progress'; }).length;
  var planned = events.filter(function(e) { return e.status === 'planned'; }).length;

  var summary = '<div class="ro-summary">' +
    '<div class="ro-sum-card"><div class="ro-sum-num">' + total + '</div><div class="ro-sum-label">Events</div></div>' +
    '<div class="ro-sum-card"><div class="ro-sum-num" style="color:var(--text-3)">' + planned + '</div><div class="ro-sum-label">Planned</div></div>' +
    '<div class="ro-sum-card"><div class="ro-sum-num" style="color:var(--blue)">' + inProgress + '</div><div class="ro-sum-label">In progress</div></div>' +
    '<div class="ro-sum-card"><div class="ro-sum-num" style="color:var(--primary)">' + done + '</div><div class="ro-sum-label">Done</div></div>' +
  '</div>';

  if (total === 0) {
    container.innerHTML = summary +
      '<div class="ro-empty">' +
        '<h3>No outreach events planned yet</h3>' +
        '<p>Click <strong>+ Add event</strong> below any month to start planning. Or toggle to <strong>Reference templates</strong> for 17 example triggers you can import.</p>' +
        '<button class="tl-btn tl-btn-new" onclick="roAdd(' + currentMonth + ')">+ Add event to ' + RO_MONTHS[currentMonth] + '</button>' +
      '</div>';
    return;
  }

  // Month grid
  var monthsHtml = '<div class="ro-month-grid">' +
    RO_MONTHS.map(function(name, i) {
      var list = byMonth[i];
      var isCurrent = i === currentMonth;
      var doneCount = list.filter(function(e) { return e.status === 'done'; }).length;
      return '<div class="ro-month' + (isCurrent ? ' ro-month-current' : '') + (list.length > 0 ? ' ro-month-has' : '') + '">' +
        '<div class="ro-month-head">' +
          '<span class="ro-month-name">' + name + '</span>' +
          '<span class="ro-month-count">' + (list.length > 0 ? doneCount + '/' + list.length : '—') + '</span>' +
          '<button class="ro-month-add" onclick="roAdd(' + i + ')" title="Add event to ' + name + '">+</button>' +
        '</div>' +
        (list.length > 0
          ? '<div class="ro-events">' + list.map(function(e) {
              return '<div class="ro-event ro-status-' + e.status + '" data-ro-id="' + e.id + '">' +
                '<select class="ro-status-pill" onchange="roUpdate(\'' + e.id + '\',\'status\',this.value)">' +
                  RO_STATUSES.map(function(s) { return '<option' + (s === e.status ? ' selected' : '') + '>' + s + '</option>'; }).join('') +
                '</select>' +
                '<input class="ro-title-input" type="text" value="' + roEsc(e.title) + '" placeholder="Event title..." oninput="roUpdate(\'' + e.id + '\',\'title\',this.value)">' +
                '<select class="ro-month-select" onchange="roUpdate(\'' + e.id + '\',\'month\',parseInt(this.value))">' +
                  RO_MONTHS.map(function(mn, mi) { return '<option value="' + mi + '"' + (mi === i ? ' selected' : '') + '>' + mn + '</option>'; }).join('') +
                '</select>' +
                '<button class="ro-del" onclick="roDelete(\'' + e.id + '\')" title="Delete">&times;</button>' +
                '<textarea class="ro-notes" rows="2" placeholder="Notes, results, follow-ups..." oninput="roUpdate(\'' + e.id + '\',\'notes\',this.value)">' + roEsc(e.notes) + '</textarea>' +
              '</div>';
            }).join('') + '</div>'
          : '<div class="ro-month-empty">—</div>'
        ) +
      '</div>';
    }).join('') + '</div>';

  container.innerHTML = summary + monthsHtml;
}

roApplyView();
