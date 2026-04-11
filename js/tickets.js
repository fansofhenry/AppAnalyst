// ═══════════════════════════════════════════════════════
// TICKET LOG — Personal queue, localStorage-backed
// No PII. Free-text notes only. Survives refresh, never leaves this browser.
// ═══════════════════════════════════════════════════════

var TL_KEY = 'appanalyst.tickets.v1';
var TL_TEMPLATES_KEY = 'appanalyst.tickets.templates.v1';
var TL_SYSTEMS = ['Banner Direct', 'Banner Ethos', 'Colleague Ethos', 'PeopleSoft', 'CCCApply', 'SuperGlue', 'Canvas', 'Ethos API', 'SSO / IdP', 'Other'];
var TL_STATUSES = ['open', 'waiting-vendor', 'waiting-college', 'waiting-student', 'resolved'];
var TL_VENDORS = ['', 'Ellucian', 'CCCTC', 'Internal (FHDA ETS)', 'College IT', 'Other'];
var TL_FILTER = 'open-any';
var TL_SEARCH = '';
var TL_SELECTED = {};  // id -> true for bulk-selected tickets
var TL_PRESETS_KEY = 'appanalyst.tickets.filterPresets.v1';

// ── Filter presets ──
function tlPresetsLoad() {
  try { return JSON.parse(localStorage.getItem(TL_PRESETS_KEY) || '[]'); }
  catch (e) { return []; }
}
function tlPresetsSave(list) { localStorage.setItem(TL_PRESETS_KEY, JSON.stringify(list)); }

function tlPresetSaveCurrent() {
  var name = prompt('Save current filter + search as preset. Name:');
  if (!name || !name.trim()) return;
  var presets = tlPresetsLoad();
  presets.push({
    id: 'TFP' + Date.now().toString(36),
    name: name.trim(),
    filter: TL_FILTER,
    search: TL_SEARCH,
    created: new Date().toISOString()
  });
  tlPresetsSave(presets);
  toast('Preset saved: ' + name.trim());
  tlRender();
}

function tlPresetApply(id) {
  var preset = tlPresetsLoad().find(function(p) { return p.id === id; });
  if (!preset) return;
  TL_FILTER = preset.filter || 'open-any';
  TL_SEARCH = preset.search || '';
  // Update filter button UI
  document.querySelectorAll('.tl-filter').forEach(function(b) { b.classList.remove('tl-f-active'); });
  // Try to find matching filter button
  document.querySelectorAll('.tl-filter').forEach(function(b) {
    if (b.getAttribute('onclick') && b.getAttribute('onclick').indexOf("'" + preset.filter + "'") >= 0) {
      b.classList.add('tl-f-active');
    }
  });
  // Update search input
  var input = document.querySelector('#ticketLog .tl-search');
  if (input) input.value = TL_SEARCH;
  tlRender();
  toast('Applied preset: ' + preset.name);
}

function tlPresetDelete(id) {
  var all = tlPresetsLoad();
  var deleted = all.find(function(p) { return p.id === id; });
  if (!deleted) return;
  tlPresetsSave(all.filter(function(p) { return p.id !== id; }));
  tlRender();
  if (typeof undoPush === 'function') {
    undoPush(function() {
      var cur = tlPresetsLoad();
      cur.push(deleted);
      tlPresetsSave(cur);
      tlRender();
    }, 'filter preset');
  }
}

// ── Bulk selection ───────────────────────────────────
function tlSelectToggle(id) {
  if (TL_SELECTED[id]) delete TL_SELECTED[id];
  else TL_SELECTED[id] = true;
  tlRenderBulkBar();
  var row = document.querySelector('.tl-row[data-id="' + id + '"]');
  if (row) row.classList.toggle('tl-selected', !!TL_SELECTED[id]);
}

function tlSelectNone() {
  TL_SELECTED = {};
  document.querySelectorAll('.tl-row.tl-selected').forEach(function(r) { r.classList.remove('tl-selected'); });
  document.querySelectorAll('.tl-select-box').forEach(function(c) { c.checked = false; });
  tlRenderBulkBar();
}

function tlSelectAllVisible() {
  tlFilter(tlLoad()).forEach(function(t) { TL_SELECTED[t.id] = true; });
  tlRender();
}

function tlSelectedIds() {
  return Object.keys(TL_SELECTED);
}

function tlBulkStatus(newStatus) {
  var ids = tlSelectedIds();
  if (ids.length === 0) return;
  var list = tlLoad();
  list.forEach(function(t) {
    if (TL_SELECTED[t.id]) {
      t.status = newStatus;
      t.updated = new Date().toISOString();
    }
  });
  tlSave(list);
  tlRender();
  toast('Updated ' + ids.length + ' tickets \u2192 ' + newStatus);
}

function tlBulkAddTag() {
  var ids = tlSelectedIds();
  if (ids.length === 0) return;
  var tag = prompt('Add a tag to ' + ids.length + ' tickets:');
  if (!tag || !tag.trim()) return;
  tag = tag.trim();
  var list = tlLoad();
  list.forEach(function(t) {
    if (TL_SELECTED[t.id]) {
      var tags = (t.tags || '').split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s; });
      if (tags.indexOf(tag) < 0) tags.push(tag);
      t.tags = tags.join(', ');
      t.updated = new Date().toISOString();
    }
  });
  tlSave(list);
  tlRender();
  toast('Added "' + tag + '" to ' + ids.length + ' tickets');
}

function tlBulkFollowUp() {
  var ids = tlSelectedIds();
  if (ids.length === 0) return;
  var days = prompt('Set follow-up date: enter number of days from today (e.g. 3). Blank to clear.');
  if (days === null) return;
  var iso = '';
  if (days !== '') {
    var n = parseInt(days, 10);
    if (isNaN(n)) { toast('Invalid number'); return; }
    var d = new Date();
    d.setDate(d.getDate() + n);
    iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  var list = tlLoad();
  list.forEach(function(t) {
    if (TL_SELECTED[t.id]) {
      t.followUp = iso;
      t.updated = new Date().toISOString();
    }
  });
  tlSave(list);
  tlRender();
  toast('Updated follow-up on ' + ids.length + ' tickets');
}

function tlBulkDelete() {
  var ids = tlSelectedIds();
  if (ids.length === 0) return;
  if (!confirm('Delete ' + ids.length + ' tickets? Undo will restore all of them.')) return;
  var all = tlLoad();
  var deleted = all.filter(function(t) { return TL_SELECTED[t.id]; });
  var list = all.filter(function(t) { return !TL_SELECTED[t.id]; });
  tlSave(list);
  TL_SELECTED = {};
  tlRender();
  if (typeof undoPush === 'function') {
    undoPush(function() {
      var cur = tlLoad();
      deleted.forEach(function(t) { cur.unshift(t); });
      tlSave(cur);
      tlRender();
    }, ids.length + ' tickets');
  }
}

function tlRenderBulkBar() {
  var bar = document.getElementById('tlBulkBar');
  if (!bar) return;
  var count = tlSelectedIds().length;
  if (count === 0) {
    bar.classList.remove('tl-bulk-show');
    bar.innerHTML = '';
    return;
  }
  bar.classList.add('tl-bulk-show');
  bar.innerHTML =
    '<span class="tl-bulk-count"><strong>' + count + '</strong> selected</span>' +
    '<button class="tl-btn" onclick="tlBulkStatus(\'open\')">Mark open</button>' +
    '<button class="tl-btn" onclick="tlBulkStatus(\'waiting-vendor\')">Waiting vendor</button>' +
    '<button class="tl-btn" onclick="tlBulkStatus(\'resolved\')">Resolve all</button>' +
    '<button class="tl-btn" onclick="tlBulkAddTag()">Add tag</button>' +
    '<button class="tl-btn" onclick="tlBulkFollowUp()">Follow-up</button>' +
    '<button class="tl-btn tl-btn-del" onclick="tlBulkDelete()">Delete</button>' +
    '<button class="tl-btn" onclick="tlSelectNone()">Clear</button>';
}

// ── Ticket templates ──────────────────────────────────
function tlTemplatesLoad() {
  try { return JSON.parse(localStorage.getItem(TL_TEMPLATES_KEY) || '[]'); }
  catch (e) { return []; }
}
function tlTemplatesSave(list) { localStorage.setItem(TL_TEMPLATES_KEY, JSON.stringify(list)); }

function tlSaveAsTemplate(id) {
  var t = tlLoad().find(function(x) { return x.id === id; });
  if (!t) return;
  var name = prompt('Save this ticket as a template. Name:');
  if (!name || !name.trim()) return;
  var templates = tlTemplatesLoad();
  templates.push({
    id: 'TPL' + Date.now().toString(36),
    name: name.trim(),
    system: t.system,
    symptom: t.symptom,
    tags: t.tags || '',
    notes: t.notes || '',
    vendor: t.vendor || '',
    created: new Date().toISOString()
  });
  tlTemplatesSave(templates);
  toast('Template saved: ' + name.trim());
  tlRender();
}

function tlAddFromTemplate(templateId) {
  var tpl = tlTemplatesLoad().find(function(x) { return x.id === templateId; });
  if (!tpl) return;
  var list = tlLoad();
  var ticket = tlNewBlank();
  ticket.system = tpl.system || ticket.system;
  ticket.symptom = tpl.symptom || '';
  ticket.tags = tpl.tags || '';
  ticket.notes = tpl.notes || '';
  ticket.vendor = tpl.vendor || '';
  list.unshift(ticket);
  tlSave(list);
  tlRender();
  setTimeout(function() {
    var first = document.querySelector('.tl-row[data-id="' + ticket.id + '"]');
    if (first) first.classList.add('tl-expanded');
  }, 30);
  toast('Created from template');
}

function tlDeleteTemplate(id) {
  var all = tlTemplatesLoad();
  var deleted = all.find(function(t) { return t.id === id; });
  if (!deleted) return;
  var list = all.filter(function(t) { return t.id !== id; });
  tlTemplatesSave(list);
  tlRender();
  if (typeof undoPush === 'function') {
    undoPush(function() {
      var cur = tlTemplatesLoad();
      cur.push(deleted);
      tlTemplatesSave(cur);
      tlRender();
    }, 'template');
  }
}

function tlToggleTemplatesMenu() {
  var menu = document.getElementById('tlTemplatesMenu');
  if (!menu) return;
  menu.classList.toggle('tl-templates-open');
}

function tlClone(id) {
  var orig = tlLoad().find(function(x) { return x.id === id; });
  if (!orig) return;
  var list = tlLoad();
  var clone = tlNewBlank();
  clone.college = orig.college;
  clone.system = orig.system;
  clone.symptom = orig.symptom;
  clone.tags = orig.tags || '';
  clone.vendor = orig.vendor || '';
  clone.notes = '[Cloned from ' + orig.id + ']\n' + (orig.notes || '');
  list.unshift(clone);
  tlSave(list);
  tlRender();
  setTimeout(function() {
    var row = document.querySelector('.tl-row[data-id="' + clone.id + '"]');
    if (row) { row.classList.add('tl-expanded'); row.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  }, 30);
  toast('Cloned');
}

function tlSetFollowUpDays(id, days) {
  if (days == null) {
    tlUpdate(id, 'followUp', '');
  } else {
    var d = new Date();
    d.setDate(d.getDate() + days);
    var iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    tlUpdate(id, 'followUp', iso);
  }
  tlRender();
}

function tlLoad() {
  try {
    var raw = localStorage.getItem(TL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}

function tlSave(tickets) {
  localStorage.setItem(TL_KEY, JSON.stringify(tickets));
  if (typeof navBadgeUpdate === 'function') navBadgeUpdate();
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
    tags: '',
    followUp: '',
    subtasks: [],
    related: [],
    notes: '',
    resolution: ''
  };
}

// ── Time tracking ──
// Each ticket stores:
//   timeLogged: total accumulated seconds
//   timerStart: ISO timestamp if currently running, null otherwise
// Only one ticket can be actively timing at a time.
var TL_ACTIVE_TIMER_ID = null;

function tlTimerFormat(seconds) {
  if (!seconds || seconds < 0) return '0m';
  var h = Math.floor(seconds / 3600);
  var m = Math.floor((seconds % 3600) / 60);
  var s = seconds % 60;
  if (h > 0) return h + 'h ' + m + 'm';
  if (m > 0) return m + 'm' + (s > 0 && h === 0 ? ' ' + s + 's' : '');
  return s + 's';
}

function tlTimerCurrent(t) {
  var accumulated = t.timeLogged || 0;
  if (t.timerStart) {
    var delta = Math.floor((Date.now() - new Date(t.timerStart).getTime()) / 1000);
    accumulated += Math.max(0, delta);
  }
  return accumulated;
}

function tlTimerStart(ticketId) {
  var list = tlLoad();
  // Stop any other running timer first
  list.forEach(function(x) {
    if (x.timerStart && x.id !== ticketId) {
      var delta = Math.floor((Date.now() - new Date(x.timerStart).getTime()) / 1000);
      x.timeLogged = (x.timeLogged || 0) + Math.max(0, delta);
      x.timerStart = null;
      x.updated = new Date().toISOString();
    }
  });
  var t = list.find(function(x) { return x.id === ticketId; });
  if (!t) return;
  t.timerStart = new Date().toISOString();
  t.updated = new Date().toISOString();
  tlSave(list);
  TL_ACTIVE_TIMER_ID = ticketId;
  tlRender();
  tlTimerTick();
}

function tlTimerStop(ticketId) {
  var list = tlLoad();
  var t = list.find(function(x) { return x.id === ticketId; });
  if (!t || !t.timerStart) return;
  var delta = Math.floor((Date.now() - new Date(t.timerStart).getTime()) / 1000);
  t.timeLogged = (t.timeLogged || 0) + Math.max(0, delta);
  t.timerStart = null;
  t.updated = new Date().toISOString();
  tlSave(list);
  if (TL_ACTIVE_TIMER_ID === ticketId) TL_ACTIVE_TIMER_ID = null;
  tlRender();
}

function tlTimerReset(ticketId) {
  if (!confirm('Reset the logged time on this ticket to zero?')) return;
  var list = tlLoad();
  var t = list.find(function(x) { return x.id === ticketId; });
  if (!t) return;
  t.timeLogged = 0;
  if (t.timerStart) t.timerStart = null;
  t.updated = new Date().toISOString();
  tlSave(list);
  tlRender();
}

// Live tick: while any timer is running, update the display every 10 seconds
function tlTimerTick() {
  var list = tlLoad();
  var running = list.find(function(t) { return t.timerStart; });
  if (!running) return;
  var el = document.querySelector('.tl-row[data-id="' + running.id + '"] .tl-timer-display');
  if (el) el.textContent = tlTimerFormat(tlTimerCurrent(running));
  setTimeout(tlTimerTick, 10000);
}

// Re-bind on page focus (to resume the tick)
window.addEventListener('focus', function() {
  var list = tlLoad();
  var running = list.find(function(t) { return t.timerStart; });
  if (running) tlTimerTick();
});

// On load, kick off the tick if a timer is already running
setTimeout(function() {
  var list = tlLoad();
  var running = list.find(function(t) { return t.timerStart; });
  if (running) tlTimerTick();
}, 1000);

// ── Ticket linking ──
function tlLinkAdd(ticketId) {
  var list = tlLoad();
  var t = list.find(function(x) { return x.id === ticketId; });
  if (!t) return;
  // Build a picker showing candidate tickets (exclude self, already-linked, resolved first filtered out)
  var candidates = list.filter(function(x) {
    if (x.id === ticketId) return false;
    if ((t.related || []).indexOf(x.id) >= 0) return false;
    return true;
  }).slice(0, 30);
  if (candidates.length === 0) { toast('No other tickets to link'); return; }

  var choice = prompt('Link to which ticket? Type a search term (college, symptom, or id):');
  if (!choice || !choice.trim()) return;
  var q = choice.trim().toLowerCase();
  var match = candidates.find(function(x) {
    return (x.id + ' ' + x.college + ' ' + x.symptom + ' ' + x.system).toLowerCase().indexOf(q) >= 0;
  });
  if (!match) { toast('No ticket matched "' + choice + '"'); return; }

  if (!t.related) t.related = [];
  t.related.push(match.id);
  t.updated = new Date().toISOString();

  // Also link back on the other side
  var other = list.find(function(x) { return x.id === match.id; });
  if (other) {
    if (!other.related) other.related = [];
    if (other.related.indexOf(ticketId) < 0) other.related.push(ticketId);
    other.updated = new Date().toISOString();
  }

  tlSave(list);
  tlRender();
  toast('Linked to ' + (match.symptom || match.id));
}

function tlLinkRemove(ticketId, otherId) {
  var list = tlLoad();
  var t = list.find(function(x) { return x.id === ticketId; });
  if (!t || !t.related) return;
  t.related = t.related.filter(function(id) { return id !== otherId; });
  t.updated = new Date().toISOString();

  var other = list.find(function(x) { return x.id === otherId; });
  if (other && other.related) {
    other.related = other.related.filter(function(id) { return id !== ticketId; });
    other.updated = new Date().toISOString();
  }

  tlSave(list);
  tlRender();
}

function tlRenderLinks(t) {
  if (!t.related || t.related.length === 0) return '';
  var list = tlLoad();
  var rows = t.related.map(function(id) {
    var other = list.find(function(x) { return x.id === id; });
    if (!other) return '';
    return '<div class="tl-link-item">' +
      '<a class="tl-link-link" onclick="var r=document.querySelector(\'.tl-row[data-id=&quot;' + other.id + '&quot;]\');if(r){r.classList.add(\'tl-expanded\');r.scrollIntoView({behavior:\'smooth\',block:\'center\'})}">' +
        '<span class="tl-link-status tl-st-' + other.status + '">' + other.status + '</span>' +
        '<span class="tl-link-text">' + tlEsc(other.symptom || '(no symptom)') + '</span>' +
        '<span class="tl-link-meta">' + tlEsc(other.college || '') + ' · ' + tlAgeText(other.created) + ' old</span>' +
      '</a>' +
      '<button class="tl-link-rm" onclick="tlLinkRemove(\'' + t.id + '\',\'' + other.id + '\')" title="Unlink">&times;</button>' +
    '</div>';
  }).filter(function(s) { return s; }).join('');
  if (!rows) return '';
  return '<div class="tl-links"><div class="tl-links-label">Related tickets</div>' + rows + '</div>';
}

// ── Sub-tasks (inline checklist per ticket) ──
function tlSubtaskAdd(ticketId) {
  var list = tlLoad();
  var t = list.find(function(x) { return x.id === ticketId; });
  if (!t) return;
  if (!t.subtasks) t.subtasks = [];
  t.subtasks.push({ id: 'ST' + Date.now().toString(36) + Math.random().toString(36).slice(2, 4), text: '', done: false });
  t.updated = new Date().toISOString();
  tlSave(list);
  tlRender();
  setTimeout(function() {
    var inputs = document.querySelectorAll('.tl-row[data-id="' + ticketId + '"] .tl-subtask-text');
    if (inputs.length > 0) inputs[inputs.length - 1].focus();
  }, 30);
}

function tlSubtaskToggle(ticketId, subId) {
  var list = tlLoad();
  var t = list.find(function(x) { return x.id === ticketId; });
  if (!t || !t.subtasks) return;
  var st = t.subtasks.find(function(s) { return s.id === subId; });
  if (!st) return;
  st.done = !st.done;
  t.updated = new Date().toISOString();
  tlSave(list);
  // Update summary count without full re-render to preserve focus
  var row = document.querySelector('.tl-row[data-id="' + ticketId + '"]');
  if (row) {
    var countEl = row.querySelector('.tl-subtask-count');
    if (countEl) {
      var done = t.subtasks.filter(function(s) { return s.done; }).length;
      countEl.textContent = done + '/' + t.subtasks.length;
    }
  }
}

function tlSubtaskUpdate(ticketId, subId, text) {
  var list = tlLoad();
  var t = list.find(function(x) { return x.id === ticketId; });
  if (!t || !t.subtasks) return;
  var st = t.subtasks.find(function(s) { return s.id === subId; });
  if (!st) return;
  st.text = text;
  t.updated = new Date().toISOString();
  tlSave(list);
}

function tlSubtaskDelete(ticketId, subId) {
  var list = tlLoad();
  var t = list.find(function(x) { return x.id === ticketId; });
  if (!t || !t.subtasks) return;
  t.subtasks = t.subtasks.filter(function(s) { return s.id !== subId; });
  t.updated = new Date().toISOString();
  tlSave(list);
  tlRender();
}

// Classify a follow-up date against today
function tlFollowUpClass(t) {
  if (!t.followUp || t.status === 'resolved') return '';
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var due = new Date(t.followUp + 'T00:00:00'); due.setHours(0, 0, 0, 0);
  if (isNaN(due.getTime())) return '';
  var diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'due-today';
  if (diffDays <= 2) return 'due-soon';
  return 'scheduled';
}

// All distinct tags currently in the ticket log
function tlAllTags() {
  var set = {};
  tlLoad().forEach(function(t) {
    if (!t.tags) return;
    t.tags.split(',').forEach(function(tag) {
      var clean = tag.trim();
      if (clean) set[clean] = (set[clean] || 0) + 1;
    });
  });
  return Object.keys(set).sort().map(function(tag) {
    return { tag: tag, count: set[tag] };
  });
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
  var all = tlLoad();
  var deleted = all.find(function(t) { return t.id === id; });
  if (!deleted) return;
  var list = all.filter(function(t) { return t.id !== id; });
  tlSave(list);
  tlRender();
  if (typeof undoPush === 'function') {
    undoPush(function() {
      var cur = tlLoad();
      cur.unshift(deleted);
      tlSave(cur);
      tlRender();
    }, 'ticket');
  } else {
    toast('Ticket deleted');
  }
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
    else if (f === 'due') {
      var cls = tlFollowUpClass(t);
      if (!(cls === 'overdue' || cls === 'due-today' || cls === 'due-soon')) return false;
    }
    else if (f.indexOf('tag:') === 0) {
      var wantedTag = f.slice(4);
      var tags = (t.tags || '').split(',').map(function(s) { return s.trim(); });
      if (tags.indexOf(wantedTag) < 0) return false;
    }
    else if (t.status !== f) return false;

    if (q) {
      var hay = [t.college, t.system, t.symptom, t.notes, t.resolution, t.vendor, t.tags].join(' ').toLowerCase();
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

  // Populate tag autocomplete datalist
  var tlDatalist = document.getElementById('tlTagList');
  if (tlDatalist) {
    tlDatalist.innerHTML = tlAllTags().map(function(t) {
      return '<option value="' + tlEsc(t.tag) + '">';
    }).join('');
  }

  // Filter presets chips
  var presetsBar = document.getElementById('tlPresetsBar');
  if (presetsBar) {
    var presets = tlPresetsLoad();
    var html = '<button class="tl-preset-save" onclick="tlPresetSaveCurrent()" title="Save current filter + search as a preset">+ Save current</button>';
    if (presets.length > 0) {
      html += presets.map(function(p) {
        return '<span class="tl-preset-chip">' +
          '<button class="tl-preset-apply" onclick="tlPresetApply(\'' + p.id + '\')">' + tlEsc(p.name) + '</button>' +
          '<button class="tl-preset-del" onclick="tlPresetDelete(\'' + p.id + '\')" title="Delete preset">&times;</button>' +
        '</span>';
      }).join('');
    }
    presetsBar.innerHTML = html;
  }

  // Render tag chips above the list
  var tagChipRow = '';
  var allTags = tlAllTags();
  if (allTags.length > 0) {
    tagChipRow = '<div class="tl-tag-chips"><span class="tl-tag-chips-label">Tags:</span>' +
      allTags.map(function(t) {
        var active = TL_FILTER === 'tag:' + t.tag;
        return '<button class="tl-tag-chip' + (active ? ' tl-tag-chip-active' : '') + '" onclick="tlSetFilter(\'' + (active ? 'open-any' : 'tag:' + t.tag) + '\',null)">' +
          tlEsc(t.tag) + ' <span class="tl-tag-chip-count">' + t.count + '</span>' +
        '</button>';
      }).join('') + '</div>';
  }

  // Populate templates dropdown menu
  var tmenu = document.getElementById('tlTemplatesMenu');
  if (tmenu) {
    var templates = tlTemplatesLoad();
    if (templates.length === 0) {
      tmenu.innerHTML = '<div class="tl-tpl-empty">No templates yet. Open a ticket and click <strong>Save as template</strong> to create one.</div>';
    } else {
      tmenu.innerHTML = templates.map(function(tpl) {
        return '<div class="tl-tpl-item">' +
          '<button class="tl-tpl-use" onclick="tlAddFromTemplate(\'' + tpl.id + '\');tlToggleTemplatesMenu()">' +
            '<span class="tl-tpl-name">' + tlEsc(tpl.name) + '</span>' +
            '<span class="tl-tpl-meta">' + tlEsc(tpl.system) + (tpl.symptom ? ' · ' + tlEsc(tpl.symptom.slice(0, 40)) : '') + '</span>' +
          '</button>' +
          '<button class="tl-tpl-del" onclick="tlDeleteTemplate(\'' + tpl.id + '\');tlRender()" title="Delete template">&times;</button>' +
        '</div>';
      }).join('');
    }
  }

  container.innerHTML = tagChipRow + filtered.map(function(t) {
    var ageCls = tlAgeClass(t);
    var symptomShort = t.symptom || '<em style="color:var(--text-3)">no symptom yet</em>';
    var collegeShort = t.college || '<em style="color:var(--text-3)">college?</em>';
    var fuCls = tlFollowUpClass(t);
    var fuBadge = '';
    var subtaskBadge = '';
    if (t.subtasks && t.subtasks.length > 0) {
      var doneCount = t.subtasks.filter(function(s) { return s.done; }).length;
      subtaskBadge = '<span class="tl-subtask-count" title="' + doneCount + ' of ' + t.subtasks.length + ' sub-tasks done">' + doneCount + '/' + t.subtasks.length + '</span>';
    }
    var timerBadge = '';
    if (t.timerStart) {
      timerBadge = '<span class="tl-timer-badge tl-timer-running" title="Timer running">\u25CF ' + tlTimerFormat(tlTimerCurrent(t)) + '</span>';
    } else if (t.timeLogged && t.timeLogged > 0) {
      timerBadge = '<span class="tl-timer-badge" title="Total time logged">' + tlTimerFormat(t.timeLogged) + '</span>';
    }
    if (fuCls) {
      var fuLabel = fuCls === 'overdue' ? 'Overdue' : fuCls === 'due-today' ? 'Due today' : fuCls === 'due-soon' ? 'Soon' : t.followUp;
      fuBadge = '<span class="tl-fu-badge tl-fu-' + fuCls + '">' + fuLabel + '</span>';
    }
    var tagBadges = '';
    if (t.tags) {
      var tagList = t.tags.split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s; });
      if (tagList.length > 0) {
        tagBadges = '<span class="tl-row-tags">' + tagList.slice(0, 3).map(function(tag) {
          return '<span class="tl-row-tag">' + tlEsc(tag) + '</span>';
        }).join('') + (tagList.length > 3 ? '<span class="tl-row-tag-more">+' + (tagList.length - 3) + '</span>' : '') + '</span>';
      }
    }
    return '<div class="tl-row' + (TL_SELECTED[t.id] ? ' tl-selected' : '') + '" data-id="' + t.id + '">' +
      '<div class="tl-summary">' +
        '<input type="checkbox" class="tl-select-box"' + (TL_SELECTED[t.id] ? ' checked' : '') + ' onclick="event.stopPropagation();tlSelectToggle(\'' + t.id + '\')" onchange="event.stopPropagation()" title="Select for bulk action">' +
        '<span class="tl-age ' + ageCls + '" onclick="tlEdit(\'' + t.id + '\')">' + tlAgeText(t.created) + '</span>' +
        '<span class="tl-college" onclick="tlEdit(\'' + t.id + '\')">' + collegeShort + fuBadge + subtaskBadge + timerBadge + tagBadges + '</span>' +
        '<span class="tl-sys" onclick="tlEdit(\'' + t.id + '\')">' + t.system + '</span>' +
        '<span class="tl-symptom" onclick="tlEdit(\'' + t.id + '\')">' + symptomShort + '</span>' +
        '<span class="tl-status tl-st-' + t.status + '" onclick="tlEdit(\'' + t.id + '\')">' + t.status + '</span>' +
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
        '<div class="tl-field-row tl-field-row-2col">' +
          '<div class="tl-field"><label>Follow up date</label>' +
            '<input type="date" value="' + tlEsc(t.followUp || '') + '" oninput="tlUpdate(\'' + t.id + '\', \'followUp\', this.value);tlRender()">' +
          '</div>' +
          '<div class="tl-field"><label>Quick set</label>' +
            '<div class="tl-followup-quick">' +
              '<button class="tl-fu-btn" onclick="tlSetFollowUpDays(\'' + t.id + '\', 1)">Tomorrow</button>' +
              '<button class="tl-fu-btn" onclick="tlSetFollowUpDays(\'' + t.id + '\', 3)">+3d</button>' +
              '<button class="tl-fu-btn" onclick="tlSetFollowUpDays(\'' + t.id + '\', 7)">+1w</button>' +
              '<button class="tl-fu-btn" onclick="tlSetFollowUpDays(\'' + t.id + '\', null)">Clear</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="tl-field tl-field-full"><label>Symptom (one line — what the user reported)</label>' +
          '<input type="text" value="' + tlEsc(t.symptom) + '" placeholder="Student cannot see MATH 1A in Canvas" oninput="tlUpdate(\'' + t.id + '\', \'symptom\', this.value);tlRenderSummary(\'' + t.id + '\')">' +
        '</div>' +
        '<div class="tl-field tl-field-full"><label>Tags (comma-separated, autocomplete)</label>' +
          '<input type="text" list="tlTagList" value="' + tlEsc(t.tags || '') + '" placeholder="e.g. ethos, fa-delay, needs-kb" oninput="tlUpdate(\'' + t.id + '\', \'tags\', this.value)">' +
        '</div>' +
        '<div class="tl-field tl-field-full"><label>Time tracking</label>' +
          '<div class="tl-timer-row">' +
            '<span class="tl-timer-display">' + tlTimerFormat(tlTimerCurrent(t)) + '</span>' +
            (t.timerStart
              ? '<button class="tl-timer-btn tl-timer-stop" onclick="tlTimerStop(\'' + t.id + '\')">\u25A0 Pause</button>'
              : '<button class="tl-timer-btn tl-timer-start" onclick="tlTimerStart(\'' + t.id + '\')">\u25B6 Start</button>'
            ) +
            (t.timeLogged > 0 || t.timerStart ? '<button class="tl-timer-btn tl-timer-reset" onclick="tlTimerReset(\'' + t.id + '\')">Reset</button>' : '') +
          '</div>' +
        '</div>' +
        '<div class="tl-field tl-field-full"><label>Sub-tasks</label>' +
          '<div class="tl-subtasks">' +
            (t.subtasks && t.subtasks.length > 0
              ? t.subtasks.map(function(st) {
                  return '<div class="tl-subtask' + (st.done ? ' tl-st-done' : '') + '">' +
                    '<input type="checkbox"' + (st.done ? ' checked' : '') + ' onchange="tlSubtaskToggle(\'' + t.id + '\',\'' + st.id + '\')">' +
                    '<input type="text" class="tl-subtask-text" value="' + tlEsc(st.text) + '" placeholder="Step description..." oninput="tlSubtaskUpdate(\'' + t.id + '\',\'' + st.id + '\',this.value)">' +
                    '<button class="tl-subtask-del" onclick="tlSubtaskDelete(\'' + t.id + '\',\'' + st.id + '\')" title="Delete sub-task">&times;</button>' +
                  '</div>';
                }).join('')
              : '') +
            '<button class="tl-subtask-add" onclick="tlSubtaskAdd(\'' + t.id + '\')">+ Add sub-task</button>' +
          '</div>' +
        '</div>' +
        '<div class="tl-field tl-field-full"><label>Notes (working log — no PII)</label>' +
          '<textarea rows="3" placeholder="What you tried, who you talked to, error codes…" oninput="tlUpdate(\'' + t.id + '\', \'notes\', this.value)">' + tlEsc(t.notes) + '</textarea>' +
        '</div>' +
        '<div class="tl-field tl-field-full"><label>Resolution (fill when closing)</label>' +
          '<textarea rows="2" placeholder="What fixed it. Consider promoting to a KB entry." oninput="tlUpdate(\'' + t.id + '\', \'resolution\', this.value)">' + tlEsc(t.resolution) + '</textarea>' +
        '</div>' +
        tlRenderLinks(t) +
        tlDupeWarning(t) +
        tlKbSuggestions(t) +
        '<div class="tl-row-footer">' +
          '<span class="tl-meta">Created ' + new Date(t.created).toLocaleString() + ' · id ' + t.id + '</span>' +
          '<div class="tl-row-footer-actions">' +
            '<button class="tl-btn" onclick="tlClone(\'' + t.id + '\')">Clone</button>' +
            '<button class="tl-btn" onclick="tlLinkAdd(\'' + t.id + '\')">Link ticket</button>' +
            '<button class="tl-btn" onclick="tlSaveAsTemplate(\'' + t.id + '\')">Save as template</button>' +
            (t.resolution ? '<button class="tl-btn" onclick="tlPromoteToKb(\'' + t.id + '\')">Save resolution to KB</button>' : '') +
            '<button class="tl-btn tl-btn-del" onclick="tlDelete(\'' + t.id + '\')">Delete</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
  tlRenderBulkBar();
}

// ── Duplicate detection: find other tickets with similar symptom / same college ──
function tlDuplicates(t) {
  var symptom = (t.symptom || '').trim().toLowerCase();
  if (symptom.length < 6) return [];
  var list = tlLoad();
  var tokens = symptom.split(/\s+/).filter(function(w) { return w.length >= 4; });
  if (tokens.length === 0) return [];

  var scored = list.map(function(other) {
    if (other.id === t.id) return null;
    var score = 0;
    // Same college is a strong signal
    if (t.college && other.college && t.college.toLowerCase() === other.college.toLowerCase()) score += 3;
    // Same system
    if (t.system && other.system && t.system === other.system) score += 1;
    // Keyword overlap in symptom
    var otherSym = (other.symptom || '').toLowerCase();
    var overlap = 0;
    tokens.forEach(function(tok) { if (otherSym.indexOf(tok) >= 0) overlap++; });
    if (overlap === 0 && tokens.length > 0) return null;
    score += overlap * 2;
    // Newer open tickets rank higher
    if (other.status !== 'resolved') score += 2;
    return { ticket: other, score: score };
  }).filter(function(s) { return s !== null && s.score >= 4; });

  scored.sort(function(a, b) { return b.score - a.score; });
  return scored.slice(0, 3).map(function(s) { return s.ticket; });
}

function tlDupeWarning(t) {
  var dupes = tlDuplicates(t);
  if (dupes.length === 0) return '';
  return '<div class="tl-dupe-warn">' +
    '<div class="tl-dupe-label">&#9888; Possible duplicates</div>' +
    dupes.map(function(d) {
      return '<a class="tl-dupe-item" onclick="event.stopPropagation();var r=document.querySelector(\'.tl-row[data-id=&quot;' + d.id + '&quot;]\');if(r){r.classList.add(\'tl-expanded\');r.scrollIntoView({behavior:\'smooth\',block:\'center\'})}return false">' +
        '<span class="tl-dupe-symptom">' + tlEsc(d.symptom || '(no symptom)') + '</span>' +
        '<span class="tl-dupe-meta">' + tlEsc(d.college || '') + ' &middot; ' + tlEsc(d.status) + ' &middot; ' + tlAgeText(d.created) + ' old</span>' +
      '</a>';
    }).join('') +
  '</div>';
}

// ── KB suggestions: find existing entries that match current symptom ──
function tlKbSuggestions(t) {
  var symptom = (t.symptom || '').trim().toLowerCase();
  if (symptom.length < 4) return '';
  var kb = [];
  try { kb = JSON.parse(localStorage.getItem('appanalyst.kb.v1') || '[]'); } catch (e) { return ''; }
  if (kb.length === 0) return '';

  // Tokenize symptom into words, score each KB entry by match count
  var tokens = symptom.split(/\s+/).filter(function(w) { return w.length >= 3; });
  if (tokens.length === 0) return '';

  var scored = kb.map(function(entry) {
    var hay = (entry.title + ' ' + entry.body + ' ' + entry.system + ' ' + entry.audience).toLowerCase();
    var score = 0;
    tokens.forEach(function(tok) { if (hay.indexOf(tok) >= 0) score++; });
    // Bonus: same system match
    if (t.system && entry.system === t.system) score += 2;
    return { entry: entry, score: score };
  }).filter(function(s) { return s.score > 0; }).sort(function(a, b) { return b.score - a.score; }).slice(0, 3);

  if (scored.length === 0) return '';

  return '<div class="tl-kb-suggest">' +
    '<div class="tl-kb-suggest-label">&#9768; Related KB entries</div>' +
    scored.map(function(s) {
      var e = s.entry;
      return '<a class="tl-kb-suggest-item" onclick="event.stopPropagation();document.getElementById(\'kb\').scrollIntoView({behavior:\'smooth\'});setTimeout(function(){if(typeof kbSelect===\'function\')kbSelect(\'' + e.id + '\')},400);return false">' +
        '<span class="tl-kb-sug-title">' + tlEsc(e.title) + '</span>' +
        '<span class="tl-kb-sug-meta">' + tlEsc(e.system) + ' &middot; ' + tlEsc(e.audience) + '</span>' +
      '</a>';
    }).join('') +
  '</div>';
}

// ── Promote ticket resolution to a KB entry ──
function tlPromoteToKb(id) {
  if (typeof kbLoad !== 'function' || typeof kbSave !== 'function') { toast('KB not loaded'); return; }
  var t = tlLoad().find(function(x) { return x.id === id; });
  if (!t) return;
  if (!t.resolution || !t.resolution.trim()) { toast('Fill in the resolution first'); return; }

  // Guess audience from system
  var audience = 'General';
  var systemToAudience = {
    'Banner Direct': 'A&R',
    'Banner Ethos': 'A&R',
    'Colleague Ethos': 'A&R',
    'PeopleSoft': 'A&R',
    'CCCApply': 'A&R',
    'Canvas': 'General',
    'SSO / IdP': 'General'
  };
  if (systemToAudience[t.system]) audience = systemToAudience[t.system];

  var body = '## Symptom\n\n' + (t.symptom || '') + '\n\n' +
    '## Context\n\n' + (t.notes || '(no notes)') + '\n\n' +
    '## Resolution\n\n' + t.resolution;

  var list = kbLoad();
  var entry = {
    id: 'K' + Date.now().toString(36) + Math.random().toString(36).slice(2, 4),
    title: t.symptom || 'Resolved ticket',
    system: t.system || 'General',
    audience: audience,
    severity: 'P3',
    body: body,
    updated: new Date().toISOString()
  };
  list.unshift(entry);
  kbSave(list);
  if (typeof kbRender === 'function') kbRender();
  if (typeof todayRender === 'function') todayRender();
  toast('Saved to KB — scroll to runbook to edit');
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

function tlExportCalendar() {
  var tickets = tlLoad().filter(function(t) {
    return t.followUp && t.status !== 'resolved';
  });
  if (tickets.length === 0) { toast('No open tickets with follow-up dates'); return; }

  // Build an .ics file (VCALENDAR)
  var esc = function(s) {
    return (s || '').toString()
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };

  var lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AppAnalyst Hub//Follow-ups//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:AppAnalyst follow-ups',
    'X-WR-TIMEZONE:America/Los_Angeles'
  ];

  tickets.forEach(function(t) {
    var date = t.followUp.replace(/-/g, '');
    var uid = t.id + '@appanalyst-hub.local';
    var summary = '[' + (t.system || '?') + '] ' + (t.symptom || '(no symptom)');
    var desc = [];
    if (t.college) desc.push('College: ' + t.college);
    if (t.system) desc.push('System: ' + t.system);
    if (t.status) desc.push('Status: ' + t.status);
    if (t.vendor) desc.push('Vendor: ' + t.vendor);
    if (t.tags) desc.push('Tags: ' + t.tags);
    if (t.notes) desc.push('Notes: ' + t.notes.slice(0, 300));
    lines.push('BEGIN:VEVENT');
    lines.push('UID:' + uid);
    lines.push('DTSTAMP:' + new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z');
    lines.push('DTSTART;VALUE=DATE:' + date);
    lines.push('DTEND;VALUE=DATE:' + date);
    lines.push('SUMMARY:' + esc(summary));
    lines.push('DESCRIPTION:' + esc(desc.join('\n')));
    lines.push('CATEGORIES:AppAnalyst,Follow-up');
    lines.push('STATUS:CONFIRMED');
    lines.push('BEGIN:VALARM');
    lines.push('ACTION:DISPLAY');
    lines.push('DESCRIPTION:Follow up: ' + esc(summary));
    lines.push('TRIGGER:-PT9H'); // 9 hours before start = morning of
    lines.push('END:VALARM');
    lines.push('END:VEVENT');
  });
  lines.push('END:VCALENDAR');

  var ics = lines.join('\r\n');
  var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'appanalyst-followups-' + new Date().toISOString().slice(0, 10) + '.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('Exported ' + tickets.length + ' follow-ups');
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
