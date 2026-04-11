// ═══════════════════════════════════════════════════════
// ACTIVITY LOG — Chronological stream of recent changes
// across all localStorage stores. Derived from existing
// timestamps — no new instrumentation required.
// ═══════════════════════════════════════════════════════

var ACT_FILTER = 'all';

function actEsc(s) {
  return (s || '').toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function actAgoText(iso) {
  var ms = Date.now() - new Date(iso).getTime();
  var mins = Math.floor(ms / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  var hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  var days = Math.floor(hrs / 24);
  if (days < 14) return days + 'd ago';
  var weeks = Math.floor(days / 7);
  return weeks + 'w ago';
}

function actCollect() {
  var events = [];

  // Tickets
  try {
    var tickets = JSON.parse(localStorage.getItem('appanalyst.tickets.v1') || '[]');
    tickets.forEach(function(t) {
      var ts = t.updated || t.created;
      if (!ts) return;
      events.push({
        ts: ts,
        kind: 'ticket',
        icon: '\u2318',
        title: t.symptom || '(no symptom)',
        sub: (t.college || 'no college') + ' \u00b7 ' + t.system + ' \u00b7 ' + t.status,
        jump: function() {
          document.getElementById('ticketLog').scrollIntoView({ behavior: 'smooth' });
          setTimeout(function() {
            var r = document.querySelector('.tl-row[data-id="' + t.id + '"]');
            if (r) { r.classList.add('tl-expanded'); r.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
          }, 400);
        },
        _id: t.id
      });
    });
  } catch (e) {}

  // KB entries
  try {
    var kb = JSON.parse(localStorage.getItem('appanalyst.kb.v1') || '[]');
    kb.forEach(function(e) {
      if (!e.updated) return;
      events.push({
        ts: e.updated,
        kind: 'kb',
        icon: '\u25C6',
        title: e.title || 'Untitled',
        sub: e.system + ' \u00b7 ' + e.audience,
        jump: function() {
          document.getElementById('kb').scrollIntoView({ behavior: 'smooth' });
          setTimeout(function() { if (typeof kbSelect === 'function') kbSelect(e.id); }, 400);
        },
        _id: e.id
      });
    });
  } catch (e) {}

  // College overlay edits
  try {
    var overlay = JSON.parse(localStorage.getItem('appanalyst.colleges.overlay.v1') || '{}');
    Object.keys(overlay).forEach(function(name) {
      var o = overlay[name];
      if (!o.updated) return;
      var parts = [];
      if (o.notes) parts.push('notes');
      if (o.sis) parts.push('SIS override');
      if (o.contacts && Object.keys(o.contacts).length) parts.push(Object.keys(o.contacts).length + ' contact' + (Object.keys(o.contacts).length === 1 ? '' : 's'));
      events.push({
        ts: o.updated,
        kind: 'college',
        icon: '\u25CF',
        title: name,
        sub: parts.length ? parts.join(' \u00b7 ') : 'edited',
        jump: function() {
          document.getElementById('lookup').scrollIntoView({ behavior: 'smooth' });
          setTimeout(function() { if (typeof clToggle === 'function') clToggle(name); }, 400);
        }
      });
    });
  } catch (e) {}

  // Onboarding items
  try {
    var ob = JSON.parse(localStorage.getItem('appanalyst.onboarding.v1') || '[]');
    ob.forEach(function(item) {
      if (!item.doneAt) return;
      events.push({
        ts: item.doneAt,
        kind: 'onboarding',
        icon: '\u2713',
        title: item.text || '(blank)',
        sub: 'Week ' + item.week + ' \u00b7 ' + (item.cat || '') + ' \u00b7 completed',
        jump: function() {
          document.getElementById('onboarding').scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  } catch (e) {}

  // Outreach events
  try {
    var outreach = JSON.parse(localStorage.getItem('appanalyst.outreach.v1') || '[]');
    outreach.forEach(function(e) {
      if (!e.updated) return;
      var monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][e.month] || '?';
      events.push({
        ts: e.updated,
        kind: 'outreach',
        icon: '\u2605',
        title: e.title || '(untitled)',
        sub: monthName + ' \u00b7 ' + e.status,
        jump: function() {
          document.getElementById('outreach').scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  } catch (e) {}

  // Barriers marked active
  try {
    var barriers = JSON.parse(localStorage.getItem('appanalyst.barriers.state.v1') || '{}');
    Object.keys(barriers).forEach(function(n) {
      var b = barriers[n];
      if (!b.updated) return;
      events.push({
        ts: b.updated,
        kind: 'barrier',
        icon: '!',
        title: 'Barrier ' + n + ' ' + (b.active ? 'marked active' : 'cleared'),
        sub: b.active ? 'active concern' : 'cleared',
        jump: function() {
          document.getElementById('barrierOverview').scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  } catch (e) {}

  // Sort descending by timestamp
  events.sort(function(a, b) { return new Date(b.ts).getTime() - new Date(a.ts).getTime(); });
  return events;
}

function actRender() {
  var container = document.getElementById('activityBody');
  if (!container) return;

  var events = actCollect();
  if (ACT_FILTER !== 'all') {
    events = events.filter(function(e) { return e.kind === ACT_FILTER; });
  }

  // Summary counts
  var all = actCollect();
  var counts = { ticket: 0, kb: 0, college: 0, onboarding: 0, outreach: 0, barrier: 0 };
  all.forEach(function(e) { counts[e.kind] = (counts[e.kind] || 0) + 1; });

  var filters =
    '<div class="act-filters">' +
      '<button class="act-filter' + (ACT_FILTER === 'all' ? ' act-f-active' : '') + '" onclick="actSetFilter(\'all\')">All <span class="act-f-count">' + all.length + '</span></button>' +
      ['ticket', 'kb', 'college', 'outreach', 'onboarding', 'barrier'].map(function(k) {
        if (!counts[k]) return '';
        return '<button class="act-filter' + (ACT_FILTER === k ? ' act-f-active' : '') + '" onclick="actSetFilter(\'' + k + '\')">' + k + ' <span class="act-f-count">' + counts[k] + '</span></button>';
      }).join('') +
    '</div>';

  if (events.length === 0) {
    container.innerHTML = filters +
      '<div class="act-empty">' +
        '<p>No activity yet. Edits across tickets, KB, colleges, onboarding, and outreach will appear here sorted by time.</p>' +
      '</div>';
    return;
  }

  // Group by day
  var byDay = {};
  events.slice(0, 80).forEach(function(e) {
    var d = new Date(e.ts);
    var key = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    if (!byDay[key]) byDay[key] = { label: dayLabel(d), events: [] };
    byDay[key].events.push(e);
  });

  function dayLabel(d) {
    var today = new Date();
    var sameDay = function(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); };
    if (sameDay(d, today)) return 'Today';
    var yest = new Date(today); yest.setDate(today.getDate() - 1);
    if (sameDay(d, yest)) return 'Yesterday';
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[d.getMonth()] + ' ' + d.getDate();
  }

  var html = filters + '<div class="act-stream">';
  Object.keys(byDay).forEach(function(key) {
    var day = byDay[key];
    html += '<div class="act-day-label">' + day.label + '</div>';
    day.events.forEach(function(e, idx) {
      html += '<div class="act-item act-kind-' + e.kind + '" data-act-idx="' + idx + '" data-act-id="' + actEsc(e._id || '') + '">' +
        '<span class="act-icon">' + e.icon + '</span>' +
        '<div class="act-main">' +
          '<div class="act-title">' + actEsc(e.title) + '</div>' +
          '<div class="act-sub">' + actEsc(e.sub) + '</div>' +
        '</div>' +
        '<span class="act-time">' + actAgoText(e.ts) + '</span>' +
      '</div>';
    });
  });
  html += '</div>';

  if (actCollect().length > 80) {
    html += '<div class="act-truncated">Showing most recent 80 events.</div>';
  }

  container.innerHTML = html;

  // Bind click handlers (so we can keep closures with the jump function)
  var items = container.querySelectorAll('.act-item');
  for (var i = 0; i < items.length; i++) {
    (function(idx) {
      items[idx].addEventListener('click', function() {
        if (events[idx] && events[idx].jump) events[idx].jump();
      });
    })(i);
  }
}

function actSetFilter(f) {
  ACT_FILTER = f;
  actRender();
}

// Re-render on storage events for cross-tab sync
window.addEventListener('focus', actRender);

actRender();
