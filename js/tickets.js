// ═══════════════════════════════════════════════════════
// TICKET LOG — Personal queue, localStorage-backed
// No PII. Free-text notes only. Survives refresh, never leaves this browser.
// ═══════════════════════════════════════════════════════

var TL_KEY = 'appanalyst.tickets.v1';
var TL_SYSTEMS = ['Banner Direct', 'Banner Ethos', 'Colleague Ethos', 'PeopleSoft', 'CCCApply', 'SuperGlue', 'Canvas', 'Ethos API', 'SSO / IdP', 'Other'];
var TL_STATUSES = ['open', 'waiting-vendor', 'waiting-college', 'waiting-student', 'resolved'];
var TL_VENDORS = ['', 'Ellucian', 'CCCTC', 'Internal (FHDA ETS)', 'College IT', 'Other'];
var TL_FILTER = 'open-any';
var TL_SEARCH = '';

function tlLoad() {
  try {
    var raw = localStorage.getItem(TL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}

function tlSave(tickets) {
  localStorage.setItem(TL_KEY, JSON.stringify(tickets));
}

function tlId() {
  return 'T' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

function tlNewBlank() {
  return {
    id: tlId(),
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    college: '',
    system: 'Banner Direct',
    symptom: '',
    status: 'open',
    vendor: '',
    notes: '',
    resolution: ''
  };
}

function tlAdd() {
  var list = tlLoad();
  list.unshift(tlNewBlank());
  tlSave(list);
  tlRender();
  setTimeout(function() {
    var first = document.querySelector('.tl-row');
    if (first) tlEdit(first.dataset.id);
  }, 30);
}

function tlDelete(id) {
  if (!confirm('Delete this ticket? This cannot be undone.')) return;
  var list = tlLoad().filter(function(t) { return t.id !== id; });
  tlSave(list);
  tlRender();
  toast('Ticket deleted');
}

function tlUpdate(id, field, value) {
  var list = tlLoad();
  var t = list.find(function(x) { return x.id === id; });
  if (!t) return;
  t[field] = value;
  t.updated = new Date().toISOString();
  tlSave(list);
  var ageEl = document.querySelector('.tl-row[data-id="' + id + '"] .tl-age');
  if (ageEl) ageEl.textContent = tlAgeText(t.created);
}

function tlEdit(id) {
  var row = document.querySelector('.tl-row[data-id="' + id + '"]');
  if (!row) return;
  row.classList.toggle('tl-expanded');
}

function tlAgeDays(iso) {
  var ms = Date.now() - new Date(iso).getTime();
  return Math.floor(ms / 86400000);
}

function tlAgeText(iso) {
  var ms = Date.now() - new Date(iso).getTime();
  var mins = Math.floor(ms / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm';
  var hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h';
  var days = Math.floor(hrs / 24);
  return days + 'd';
}

function tlAgeClass(t) {
  if (t.status === 'resolved') return 'tl-age-resolved';
  var days = tlAgeDays(t.created);
  if (days >= 7) return 'tl-age-red';
  if (days >= 3) return 'tl-age-amber';
  return 'tl-age-ok';
}

function tlFilter(tickets) {
  var f = TL_FILTER;
  var q = TL_SEARCH.trim().toLowerCase();
  var out = tickets.filter(function(t) {
    if (f === 'all') { /* no-op */ }
    else if (f === 'open-any') { if (t.status === 'resolved') return false; }
    else if (f === 'resolved') { if (t.status !== 'resolved') return false; }
    else if (f === 'aging') { if (t.status === 'resolved' || tlAgeDays(t.created) < 3) return false; }
    else if (t.status !== f) return false;

    if (q) {
      var hay = [t.college, t.system, t.symptom, t.notes, t.resolution, t.vendor].join(' ').toLowerCase();
      if (hay.indexOf(q) < 0) return false;
    }
    return true;
  });
  return out;
}

function tlRender() {
  var container = document.getElementById('tlBody');
  if (!container) return;
  var tickets = tlLoad();
  var filtered = tlFilter(tickets);

  var stats = {
    total: tickets.length,
    open: tickets.filter(function(t) { return t.status !== 'resolved'; }).length,
    aging: tickets.filter(function(t) { return t.status !== 'resolved' && tlAgeDays(t.created) >= 3; }).length,
    resolved: tickets.filter(function(t) { return t.status === 'resolved'; }).length
  };

  var statsEl = document.getElementById('tlStats');
  if (statsEl) {
    statsEl.innerHTML =
      '<div class="tl-stat"><div class="tl-stat-num">' + stats.total + '</div><div class="tl-stat-label">Total</div></div>' +
      '<div class="tl-stat"><div class="tl-stat-num" style="color:var(--blue)">' + stats.open + '</div><div class="tl-stat-label">Open</div></div>' +
      '<div class="tl-stat"><div class="tl-stat-num" style="color:var(--amber)">' + stats.aging + '</div><div class="tl-stat-label">Aging (3d+)</div></div>' +
      '<div class="tl-stat"><div class="tl-stat-num" style="color:var(--primary)">' + stats.resolved + '</div><div class="tl-stat-label">Resolved</div></div>';
  }

  if (filtered.length === 0) {
    var msg = tickets.length === 0
      ? 'No tickets yet. Click <strong>+ New ticket</strong> to log your first one.'
      : 'No tickets match this filter.';
    container.innerHTML = '<div class="tl-empty">' + msg + '</div>';
    return;
  }

  container.innerHTML = filtered.map(function(t) {
    var ageCls = tlAgeClass(t);
    var symptomShort = t.symptom || '<em style="color:var(--text-3)">no symptom yet</em>';
    var collegeShort = t.college || '<em style="color:var(--text-3)">college?</em>';
    return '<div class="tl-row" data-id="' + t.id + '">' +
      '<div class="tl-summary" onclick="tlEdit(\'' + t.id + '\')">' +
        '<span class="tl-age ' + ageCls + '">' + tlAgeText(t.created) + '</span>' +
        '<span class="tl-college">' + collegeShort + '</span>' +
        '<span class="tl-sys">' + t.system + '</span>' +
        '<span class="tl-symptom">' + symptomShort + '</span>' +
        '<span class="tl-status tl-st-' + t.status + '">' + t.status + '</span>' +
      '</div>' +
      '<div class="tl-detail">' +
        '<div class="tl-field-row">' +
          '<div class="tl-field"><label>College</label>' +
            '<input type="text" value="' + tlEsc(t.college) + '" placeholder="e.g. Sacramento City College" oninput="tlUpdate(\'' + t.id + '\', \'college\', this.value)">' +
          '</div>' +
          '<div class="tl-field"><label>System</label>' +
            '<select onchange="tlUpdate(\'' + t.id + '\', \'system\', this.value)">' +
              TL_SYSTEMS.map(function(s) { return '<option' + (s === t.system ? ' selected' : '') + '>' + s + '</option>'; }).join('') +
            '</select>' +
          '</div>' +
          '<div class="tl-field"><label>Status</label>' +
            '<select onchange="tlUpdate(\'' + t.id + '\', \'status\', this.value);tlRender()">' +
              TL_STATUSES.map(function(s) { return '<option' + (s === t.status ? ' selected' : '') + '>' + s + '</option>'; }).join('') +
            '</select>' +
          '</div>' +
          '<div class="tl-field"><label>Vendor escalation</label>' +
            '<select onchange="tlUpdate(\'' + t.id + '\', \'vendor\', this.value)">' +
              TL_VENDORS.map(function(v) { return '<option value="' + v + '"' + (v === t.vendor ? ' selected' : '') + '>' + (v || '—') + '</option>'; }).join('') +
            '</select>' +
          '</div>' +
        '</div>' +
        '<div class="tl-field tl-field-full"><label>Symptom (one line — what the user reported)</label>' +
          '<input type="text" value="' + tlEsc(t.symptom) + '" placeholder="Student cannot see MATH 1A in Canvas" oninput="tlUpdate(\'' + t.id + '\', \'symptom\', this.value);tlRenderSummary(\'' + t.id + '\')">' +
        '</div>' +
        '<div class="tl-field tl-field-full"><label>Notes (working log — no PII)</label>' +
          '<textarea rows="3" placeholder="What you tried, who you talked to, error codes…" oninput="tlUpdate(\'' + t.id + '\', \'notes\', this.value)">' + tlEsc(t.notes) + '</textarea>' +
        '</div>' +
        '<div class="tl-field tl-field-full"><label>Resolution (fill when closing)</label>' +
          '<textarea rows="2" placeholder="What fixed it. Consider promoting to a KB entry." oninput="tlUpdate(\'' + t.id + '\', \'resolution\', this.value)">' + tlEsc(t.resolution) + '</textarea>' +
        '</div>' +
        '<div class="tl-row-footer">' +
          '<span class="tl-meta">Created ' + new Date(t.created).toLocaleString() + ' · id ' + t.id + '</span>' +
          '<button class="tl-btn tl-btn-del" onclick="tlDelete(\'' + t.id + '\')">Delete</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function tlRenderSummary(id) {
  var list = tlLoad();
  var t = list.find(function(x) { return x.id === id; });
  if (!t) return;
  var row = document.querySelector('.tl-row[data-id="' + id + '"] .tl-symptom');
  if (row) row.textContent = t.symptom || 'no symptom yet';
}

function tlEsc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function tlSetFilter(f, el) {
  TL_FILTER = f;
  document.querySelectorAll('.tl-filter').forEach(function(b) { b.classList.remove('tl-f-active'); });
  if (el) el.classList.add('tl-f-active');
  tlRender();
}

function tlSetSearch(v) {
  TL_SEARCH = v;
  tlRender();
}

function tlExportCSV() {
  var tickets = tlLoad();
  if (tickets.length === 0) { toast('No tickets to export'); return; }
  var cols = ['id', 'created', 'updated', 'college', 'system', 'status', 'vendor', 'symptom', 'notes', 'resolution'];
  var esc = function(v) {
    var s = String(v == null ? '' : v);
    if (s.indexOf(',') >= 0 || s.indexOf('"') >= 0 || s.indexOf('\n') >= 0) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  var lines = [cols.join(',')];
  tickets.forEach(function(t) { lines.push(cols.map(function(c) { return esc(t[c]); }).join(',')); });
  var csv = lines.join('\n');
  var blob = new Blob([csv], { type: 'text/csv' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'tickets-' + new Date().toISOString().slice(0, 10) + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('Exported ' + tickets.length + ' tickets');
}

function tlImportJSON(file) {
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var parsed = JSON.parse(e.target.result);
      if (!Array.isArray(parsed)) throw new Error('Expected array');
      tlSave(parsed);
      tlRender();
      toast('Imported ' + parsed.length + ' tickets');
    } catch (err) {
      toast('Import failed: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function tlExportJSON() {
  var tickets = tlLoad();
  var blob = new Blob([JSON.stringify(tickets, null, 2)], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'tickets-backup-' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('Backup saved');
}

tlRender();
