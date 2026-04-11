// ═══════════════════════════════════════════════════════
// FIRST 30 DAYS — Onboarding checklist for a new App
// Support Analyst on the CVC-OEI team at FHDA.
// localStorage-backed. Seeded with concrete first-month items.
// ═══════════════════════════════════════════════════════

var OB_KEY = 'appanalyst.onboarding.v1';
var OB_COLLAPSED_KEY = 'appanalyst.onboarding.collapsed.v1';

var OB_SEEDS = [
  // Week 1 — orientation & access
  { week: 1, cat: 'Access', text: 'Get Banner / Banner Admin credentials from ETS' },
  { week: 1, cat: 'Access', text: 'Get SSO / Active Directory account and VPN set up' },
  { week: 1, cat: 'Access', text: 'Get access to FHDA\u2019s internal ticketing system' },
  { week: 1, cat: 'Access', text: 'Join CSSO listserv and any CVC-OEI Slack/Teams channels' },
  { week: 1, cat: 'People', text: 'Meet 1:1 with manager \u2014 ask about their expectations for the first 90 days' },
  { week: 1, cat: 'People', text: 'Meet the ETS Banner admin(s) \u2014 they\u2019ll be your most frequent partner' },
  { week: 1, cat: 'People', text: 'Identify the senior analyst on the CVC-OEI team and ask to shadow' },
  { week: 1, cat: 'Learn', text: 'Read the current CVC Exchange architecture overview on cvc.edu' },
  { week: 1, cat: 'Learn', text: 'Read the April 2025 Exchange release notes (SIS integration status)' },
  { week: 1, cat: 'Learn', text: 'Click through the Exchange Admin Dashboard in a test/demo account' },

  // Week 2 — systems & tools
  { week: 2, cat: 'Learn', text: 'Understand how AER (Automated Enrollment Reporting) flows from Banner to Exchange' },
  { week: 2, cat: 'Learn', text: 'Read the 4 Ellucian integration types: Banner Direct, Banner Ethos, Colleague Direct, Colleague Ethos' },
  { week: 2, cat: 'Learn', text: 'Know which FHDA Financial Aid Dashboard features are Exchange-aware' },
  { week: 2, cat: 'Tool', text: 'Shadow a ticket from intake to resolution \u2014 document the workflow in the KB' },
  { week: 2, cat: 'Tool', text: 'Run a test cross-enrollment (student at Foothill \u2192 De Anza) to see the full flow' },
  { week: 2, cat: 'People', text: 'Meet someone from A&R, FA, Counseling, and DSPS at Foothill or De Anza' },

  // Week 3 — start producing
  { week: 3, cat: 'Produce', text: 'Resolve your first independent ticket end-to-end (even a small one)' },
  { week: 3, cat: 'Produce', text: 'Write your first KB entry based on a real resolution' },
  { week: 3, cat: 'Produce', text: 'Log every college you touch in the directory (notes, contacts, SIS corrections)' },
  { week: 3, cat: 'Learn', text: 'Identify the 5 CCC colleges that generate the most FHDA-facing tickets' },
  { week: 3, cat: 'Learn', text: 'Read 3 past incident post-mortems (ask manager for them)' },

  // Week 4 — pattern and plan
  { week: 4, cat: 'Produce', text: 'Export your first month\u2019s tickets as CSV \u2014 review patterns with manager' },
  { week: 4, cat: 'Produce', text: 'Pick one recurring friction point to propose a fix/improvement for' },
  { week: 4, cat: 'People', text: 'Request feedback from manager on the first 30 days \u2014 what to double down on, what to stop' },
  { week: 4, cat: 'Learn', text: 'Understand the escalation path: when does something go to Ellucian support? To CCCTC? To vendor?' },
  { week: 4, cat: 'Plan', text: 'Draft 60/90 day personal goals and share with manager' },

  // Always-on
  { week: 0, cat: 'Habit', text: 'Open the Today dashboard first thing each morning' },
  { week: 0, cat: 'Habit', text: 'Write a one-line note in each college card as you learn' },
  { week: 0, cat: 'Habit', text: 'Back up localStorage (JSON export) every Friday' }
];

function obLoad() {
  try {
    var raw = localStorage.getItem(OB_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  // Seed on first load
  var seeded = OB_SEEDS.map(function(s, i) {
    return {
      id: 'O' + i + '-' + Date.now().toString(36),
      week: s.week,
      cat: s.cat,
      text: s.text,
      done: false,
      created: new Date().toISOString()
    };
  });
  obSave(seeded);
  return seeded;
}

function obSave(items) {
  localStorage.setItem(OB_KEY, JSON.stringify(items));
}

function obToggle(id) {
  var items = obLoad();
  var item = items.find(function(i) { return i.id === id; });
  if (!item) return;
  item.done = !item.done;
  if (item.done) item.doneAt = new Date().toISOString(); else delete item.doneAt;
  obSave(items);
  obRender();
}

function obAdd(week) {
  var items = obLoad();
  var newItem = {
    id: 'O' + Date.now().toString(36) + Math.random().toString(36).slice(2, 4),
    week: week || 0,
    cat: 'Custom',
    text: '',
    done: false,
    created: new Date().toISOString()
  };
  items.push(newItem);
  obSave(items);
  obRender();
  setTimeout(function() {
    var input = document.querySelector('[data-ob-id="' + newItem.id + '"] .ob-text-input');
    if (input) input.focus();
  }, 40);
}

function obUpdate(id, field, value) {
  var items = obLoad();
  var item = items.find(function(i) { return i.id === id; });
  if (!item) return;
  item[field] = value;
  obSave(items);
}

function obDelete(id) {
  var all = obLoad();
  var deleted = all.find(function(i) { return i.id === id; });
  if (!deleted) return;
  var items = all.filter(function(i) { return i.id !== id; });
  obSave(items);
  obRender();
  if (typeof undoPush === 'function') {
    undoPush(function() {
      var cur = obLoad();
      cur.push(deleted);
      obSave(cur);
      obRender();
    }, 'onboarding item');
  }
}

function obReset() {
  if (!confirm('Reset the checklist to the default seeded items? This will delete any custom items and clear progress.')) return;
  localStorage.removeItem(OB_KEY);
  obRender();
}

function obToggleCollapsed() {
  var collapsed = localStorage.getItem(OB_COLLAPSED_KEY) === '1';
  localStorage.setItem(OB_COLLAPSED_KEY, collapsed ? '0' : '1');
  obRender();
}

function obEsc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function obRender() {
  var container = document.getElementById('obBody');
  var head = document.getElementById('obHead');
  if (!container || !head) return;

  var items = obLoad();
  var done = items.filter(function(i) { return i.done; }).length;
  var total = items.length;
  var pct = total > 0 ? Math.round((done / total) * 100) : 0;
  var collapsed = localStorage.getItem(OB_COLLAPSED_KEY) === '1';

  head.innerHTML =
    '<div class="ob-progress-wrap">' +
      '<div class="ob-progress-label"><strong>' + done + '</strong> of ' + total + ' complete <span class="ob-pct">' + pct + '%</span></div>' +
      '<div class="ob-progress-bar"><div class="ob-progress-fill" style="width:' + pct + '%"></div></div>' +
    '</div>' +
    '<div class="ob-head-actions">' +
      '<button class="tl-btn" onclick="obAdd(0)">+ Add item</button>' +
      '<button class="tl-btn" onclick="obReset()">Reset</button>' +
      '<button class="tl-btn" onclick="obToggleCollapsed()">' + (collapsed ? 'Expand' : 'Collapse') + '</button>' +
    '</div>';

  if (collapsed) {
    container.innerHTML = '';
    container.style.display = 'none';
    return;
  }
  container.style.display = '';

  // Group by week
  var groups = {};
  items.forEach(function(i) {
    var k = i.week;
    if (!groups[k]) groups[k] = [];
    groups[k].push(i);
  });

  var weekOrder = [1, 2, 3, 4, 0]; // Week 0 (always-on) last
  var weekTitles = {
    0: 'Ongoing habits',
    1: 'Week 1 — orientation & access',
    2: 'Week 2 — systems & tools',
    3: 'Week 3 — start producing',
    4: 'Week 4 — pattern & plan'
  };

  container.innerHTML = weekOrder.map(function(w) {
    if (!groups[w] || groups[w].length === 0) return '';
    var weekDone = groups[w].filter(function(i) { return i.done; }).length;
    return '<div class="ob-group">' +
      '<div class="ob-group-head">' +
        '<span class="ob-group-title">' + weekTitles[w] + '</span>' +
        '<span class="ob-group-count">' + weekDone + '/' + groups[w].length + '</span>' +
        '<button class="ob-group-add" onclick="obAdd(' + w + ')" title="Add item to this week">+</button>' +
      '</div>' +
      '<div class="ob-items">' +
        groups[w].map(function(i) {
          return '<div class="ob-item' + (i.done ? ' ob-done' : '') + '" data-ob-id="' + i.id + '">' +
            '<label class="ob-check"><input type="checkbox"' + (i.done ? ' checked' : '') + ' onchange="obToggle(\'' + i.id + '\')"><span class="ob-checkmark"></span></label>' +
            '<span class="ob-cat ob-cat-' + i.cat.toLowerCase() + '">' + obEsc(i.cat) + '</span>' +
            '<input class="ob-text-input" type="text" value="' + obEsc(i.text) + '" placeholder="Type a task..." oninput="obUpdate(\'' + i.id + '\', \'text\', this.value)">' +
            '<button class="ob-del" onclick="obDelete(\'' + i.id + '\')" title="Delete">&times;</button>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</div>';
  }).join('');
}

obRender();
