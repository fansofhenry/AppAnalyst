// ═══════════════════════════════════════════════════════
// TODAY — Personal dashboard. Reads from localStorage.
// First thing visible after the hub header.
// ═══════════════════════════════════════════════════════

function todayFmtDate() {
  var d = new Date();
  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return days[d.getDay()] + ' · ' + months[d.getMonth()] + ' ' + d.getDate();
}

function todayAgeText(iso) {
  var ms = Date.now() - new Date(iso).getTime();
  var mins = Math.floor(ms / 60000);
  if (mins < 60) return mins + 'm';
  var hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h';
  return Math.floor(hrs / 24) + 'd';
}

function todayEsc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function todayRender() {
  var container = document.getElementById('todayBody');
  if (!container) return;

  // Load from localStorage — all stores
  var tickets = [];
  var kb = [];
  var overlay = {};
  var outreach = [];
  try { tickets = JSON.parse(localStorage.getItem('appanalyst.tickets.v1') || '[]'); } catch (e) {}
  try { kb = JSON.parse(localStorage.getItem('appanalyst.kb.v1') || '[]'); } catch (e) {}
  try { overlay = JSON.parse(localStorage.getItem('appanalyst.colleges.overlay.v1') || '{}'); } catch (e) {}
  try { outreach = JSON.parse(localStorage.getItem('appanalyst.outreach.v1') || '[]'); } catch (e) {}

  // Compute
  var openTickets = tickets.filter(function(t) { return t.status !== 'resolved'; });
  var agingTickets = openTickets.filter(function(t) {
    return (Date.now() - new Date(t.created).getTime()) >= 3 * 86400000;
  });
  var urgentTickets = openTickets.filter(function(t) {
    return (Date.now() - new Date(t.created).getTime()) >= 7 * 86400000;
  });

  // Top 3 oldest open tickets
  var topTickets = openTickets.slice().sort(function(a, b) {
    return new Date(a.created).getTime() - new Date(b.created).getTime();
  }).slice(0, 3);

  // Follow-ups: overdue or due today/tomorrow
  var dueTickets = openTickets.filter(function(t) {
    if (!t.followUp) return false;
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var due = new Date(t.followUp + 'T00:00:00'); due.setHours(0, 0, 0, 0);
    if (isNaN(due.getTime())) return false;
    var diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);
    return diffDays <= 2;
  }).sort(function(a, b) {
    return new Date(a.followUp).getTime() - new Date(b.followUp).getTime();
  });

  // Top 3 recent KB entries
  var recentKB = kb.slice().sort(function(a, b) {
    return new Date(b.updated || 0).getTime() - new Date(a.updated || 0).getTime();
  }).slice(0, 3);

  // Recent college edits (overlay entries with most recent updated field)
  var overlayEntries = Object.keys(overlay).map(function(name) {
    return { name: name, updated: overlay[name].updated || '1970-01-01' };
  }).sort(function(a, b) {
    return new Date(b.updated).getTime() - new Date(a.updated).getTime();
  }).slice(0, 3);

  var total = tickets.length;
  var resolved = tickets.filter(function(t) { return t.status === 'resolved'; }).length;
  var kbCount = kb.length;
  var collegeEditCount = Object.keys(overlay).length;

  // Weekly rollup — things updated or created in the last 7 days
  var weekAgo = Date.now() - 7 * 86400000;
  var resolvedThisWeek = tickets.filter(function(t) {
    if (t.status !== 'resolved') return false;
    return new Date(t.updated || t.created).getTime() >= weekAgo;
  }).length;
  var kbNewThisWeek = kb.filter(function(e) {
    return new Date(e.updated || 0).getTime() >= weekAgo;
  }).length;
  var collegesTouchedThisWeek = Object.keys(overlay).filter(function(name) {
    var u = overlay[name].updated;
    return u && new Date(u).getTime() >= weekAgo;
  }).length;
  var ticketsCreatedThisWeek = tickets.filter(function(t) {
    return new Date(t.created).getTime() >= weekAgo;
  }).length;

  // Current month outreach
  var curMonth = new Date().getMonth();
  var monthEvents = outreach.filter(function(e) { return e.month === curMonth; });
  var monthDone = monthEvents.filter(function(e) { return e.status === 'done'; }).length;
  var monthPlanned = monthEvents.filter(function(e) { return e.status === 'planned'; }).length;
  var monthInProgress = monthEvents.filter(function(e) { return e.status === 'in-progress'; }).length;

  // ── Top-line stat strip ─────────────────────
  var statStrip =
    '<div class="today-strip">' +
      '<div class="today-stat"><div class="today-stat-num">' + openTickets.length + '</div><div class="today-stat-label">Open tickets</div></div>' +
      '<div class="today-stat' + (agingTickets.length ? ' today-alert' : '') + '"><div class="today-stat-num" style="color:' + (agingTickets.length ? 'var(--amber)' : 'var(--text-3)') + '">' + agingTickets.length + '</div><div class="today-stat-label">Aging 3d+</div></div>' +
      '<div class="today-stat' + (urgentTickets.length ? ' today-urgent' : '') + '"><div class="today-stat-num" style="color:' + (urgentTickets.length ? 'var(--red)' : 'var(--text-3)') + '">' + urgentTickets.length + '</div><div class="today-stat-label">Urgent 7d+</div></div>' +
      '<div class="today-stat"><div class="today-stat-num">' + kbCount + '</div><div class="today-stat-label">KB entries</div></div>' +
      '<div class="today-stat"><div class="today-stat-num">' + collegeEditCount + '</div><div class="today-stat-label">Colleges noted</div></div>' +
      '<div class="today-stat"><div class="today-stat-num" style="color:var(--primary)">' + resolved + '</div><div class="today-stat-label">Resolved all-time</div></div>' +
    '</div>';

  // ── Follow-up card (only shown if there are due/overdue tickets) ──
  var followUpCard = '';
  if (dueTickets.length > 0) {
    followUpCard =
      '<div class="today-card today-card-followup">' +
        '<div class="today-card-head">' +
          '<div class="today-card-title">Follow up now</div>' +
          '<span class="today-followup-count">' + dueTickets.length + '</span>' +
        '</div>' +
        '<div class="today-list">' + dueTickets.slice(0, 4).map(function(t) {
          var today = new Date(); today.setHours(0, 0, 0, 0);
          var due = new Date(t.followUp + 'T00:00:00'); due.setHours(0, 0, 0, 0);
          var diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);
          var label = diffDays < 0 ? (Math.abs(diffDays) + 'd late') :
                      diffDays === 0 ? 'Today' :
                      diffDays === 1 ? 'Tomorrow' : '+' + diffDays + 'd';
          var cls = diffDays < 0 ? 'today-fu-over' : diffDays === 0 ? 'today-fu-now' : 'today-fu-soon';
          return '<a class="today-item" onclick="document.getElementById(\'ticketLog\').scrollIntoView({behavior:\'smooth\'});setTimeout(function(){var r=document.querySelector(\'.tl-row[data-id=&quot;' + t.id + '&quot;]\');if(r){r.classList.add(\'tl-expanded\');r.scrollIntoView({behavior:\'smooth\',block:\'center\'})}},400)">' +
            '<span class="today-fu-marker ' + cls + '">' + label + '</span>' +
            '<span class="today-item-main">' +
              '<span class="today-item-title">' + todayEsc(t.symptom || '(no symptom)') + '</span>' +
              '<span class="today-item-sub">' + todayEsc(t.college || 'no college') + '</span>' +
            '</span>' +
          '</a>';
        }).join('') + '</div>' +
      '</div>';
  }

  // ── Three cards: tickets, KB, colleges ──────
  var ticketsCard =
    '<div class="today-card today-card-tickets">' +
      '<div class="today-card-head">' +
        '<div class="today-card-title">Oldest open tickets</div>' +
        '<button class="today-card-action" onclick="if(typeof tlAdd===\'function\')tlAdd()">+ New</button>' +
      '</div>' +
      (topTickets.length === 0
        ? '<div class="today-empty">Nothing open. Press <kbd>N</kbd> to log a new ticket.</div>'
        : '<div class="today-list">' + topTickets.map(function(t) {
            var age = todayAgeText(t.created);
            var ageCls = '';
            var days = (Date.now() - new Date(t.created).getTime()) / 86400000;
            if (days >= 7) ageCls = 'today-age-red';
            else if (days >= 3) ageCls = 'today-age-amber';
            else ageCls = 'today-age-ok';
            return '<a class="today-item" onclick="document.getElementById(\'ticketLog\').scrollIntoView({behavior:\'smooth\'});setTimeout(function(){var r=document.querySelector(\'.tl-row[data-id=&quot;' + t.id + '&quot;]\');if(r)r.classList.add(\'tl-expanded\');},500)">' +
              '<span class="today-age ' + ageCls + '">' + age + '</span>' +
              '<span class="today-item-main">' +
                '<span class="today-item-title">' + todayEsc(t.symptom || '(no symptom yet)') + '</span>' +
                '<span class="today-item-sub">' + todayEsc(t.college || 'no college') + ' · ' + todayEsc(t.system) + ' · ' + t.status + '</span>' +
              '</span>' +
            '</a>';
          }).join('') + '</div>'
      ) +
    '</div>';

  var kbCard =
    '<div class="today-card today-card-kb">' +
      '<div class="today-card-head">' +
        '<div class="today-card-title">Recent KB entries</div>' +
        '<button class="today-card-action" onclick="document.getElementById(\'kb\').scrollIntoView({behavior:\'smooth\'});setTimeout(function(){if(typeof kbAdd===\'function\')kbAdd();},400)">+ New</button>' +
      '</div>' +
      (recentKB.length === 0
        ? '<div class="today-empty">No entries yet. Write one as you solve.</div>'
        : '<div class="today-list">' + recentKB.map(function(e) {
            return '<a class="today-item" onclick="document.getElementById(\'kb\').scrollIntoView({behavior:\'smooth\'});setTimeout(function(){if(typeof kbSelect===\'function\')kbSelect(\'' + e.id + '\');},300)">' +
              '<span class="today-kb-tag">' + todayEsc(e.system) + '</span>' +
              '<span class="today-item-main">' +
                '<span class="today-item-title">' + todayEsc(e.title || 'Untitled') + '</span>' +
                '<span class="today-item-sub">' + todayEsc(e.audience) + ' · updated ' + todayAgeText(e.updated) + ' ago</span>' +
              '</span>' +
            '</a>';
          }).join('') + '</div>'
      ) +
    '</div>';

  var collegesCard =
    '<div class="today-card today-card-colleges">' +
      '<div class="today-card-head">' +
        '<div class="today-card-title">Recently touched colleges</div>' +
        '<button class="today-card-action" onclick="document.getElementById(\'lookup\').scrollIntoView({behavior:\'smooth\'})">Directory</button>' +
      '</div>' +
      (overlayEntries.length === 0
        ? '<div class="today-empty">Click any college in the Directory to add notes or contacts.</div>'
        : '<div class="today-list">' + overlayEntries.map(function(c) {
            var o = overlay[c.name] || {};
            var preview = o.notes ? o.notes.slice(0, 60) : (o.sis ? 'SIS set to ' + o.sis : (o.contacts ? 'contacts added' : 'edited'));
            return '<a class="today-item" onclick="document.getElementById(\'lookup\').scrollIntoView({behavior:\'smooth\'});setTimeout(function(){if(typeof clToggle===\'function\')clToggle(\'' + c.name.replace(/\'/g, "\\\\'") + '\');},400)">' +
              '<span class="today-college-mark">●</span>' +
              '<span class="today-item-main">' +
                '<span class="today-item-title">' + todayEsc(c.name) + '</span>' +
                '<span class="today-item-sub">' + todayEsc(preview) + (preview.length >= 60 ? '…' : '') + '</span>' +
              '</span>' +
            '</a>';
          }).join('') + '</div>'
      ) +
    '</div>';

  // Weekly rollup bar — minimal, horizontal
  var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var rollup =
    '<div class="today-rollup">' +
      '<div class="today-rollup-label">This week</div>' +
      '<div class="today-rollup-items">' +
        '<span class="today-rollup-item"><strong>' + ticketsCreatedThisWeek + '</strong> tickets opened</span>' +
        '<span class="today-rollup-item"><strong>' + resolvedThisWeek + '</strong> resolved</span>' +
        '<span class="today-rollup-item"><strong>' + kbNewThisWeek + '</strong> KB entries updated</span>' +
        '<span class="today-rollup-item"><strong>' + collegesTouchedThisWeek + '</strong> colleges touched</span>' +
      '</div>' +
    '</div>';

  // Outreach card — this month
  var outreachCard =
    '<div class="today-card today-card-outreach">' +
      '<div class="today-card-head">' +
        '<div class="today-card-title">' + monthNames[curMonth] + ' outreach</div>' +
        '<button class="today-card-action" onclick="document.getElementById(\'outreach\').scrollIntoView({behavior:\'smooth\'});setTimeout(function(){if(typeof roAdd===\'function\')roAdd(' + curMonth + ')},400)">+ New</button>' +
      '</div>' +
      (monthEvents.length === 0
        ? '<div class="today-empty">No outreach planned for this month. Click + to add one.</div>'
        : '<div class="today-outreach-stats">' +
            '<span class="today-or-stat"><strong>' + monthPlanned + '</strong> planned</span>' +
            '<span class="today-or-stat"><strong>' + monthInProgress + '</strong> active</span>' +
            '<span class="today-or-stat"><strong>' + monthDone + '</strong> done</span>' +
          '</div>' +
          '<div class="today-list">' + monthEvents.slice(0, 3).map(function(e) {
            return '<a class="today-item" onclick="document.getElementById(\'outreach\').scrollIntoView({behavior:\'smooth\'})">' +
              '<span class="today-or-mark today-or-' + e.status + '"></span>' +
              '<span class="today-item-main">' +
                '<span class="today-item-title">' + todayEsc(e.title || '(untitled)') + '</span>' +
                '<span class="today-item-sub">' + todayEsc(e.status) + (e.notes ? ' · ' + todayEsc(e.notes.slice(0, 30)) : '') + '</span>' +
              '</span>' +
            '</a>';
          }).join('') + '</div>'
      ) +
    '</div>';

  container.innerHTML =
    statStrip +
    rollup +
    '<div class="today-grid">' + followUpCard + ticketsCard + kbCard + collegesCard + outreachCard + '</div>';

  var dateEl = document.getElementById('todayDate');
  if (dateEl) dateEl.textContent = todayFmtDate();
}

// Re-render on load and whenever focus returns (fresh data)
todayRender();
window.addEventListener('focus', todayRender);
