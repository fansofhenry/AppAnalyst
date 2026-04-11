// ═══════════════════════════════════════════════════════
// FIRST 30 DAYS — Onboarding checklist for a new App
// Support Analyst on the CVC-OEI team at FHDA.
// localStorage-backed. Seeded with concrete first-month items.
// ═══════════════════════════════════════════════════════

var OB_KEY = 'appanalyst.onboarding.v1';
var OB_COLLAPSED_KEY = 'appanalyst.onboarding.collapsed.v1';
var OB_ROLE_KEY = 'appanalyst.onboarding.activeRole.v1';

// ── Role-specific starter checklists ─────────────────────
var OB_ROLE_SEEDS = {
  analyst: [
    { week: 1, cat: 'Access', text: 'Get Banner / Banner Admin credentials from ETS' },
    { week: 1, cat: 'Access', text: 'Get SSO / Active Directory account and VPN set up' },
    { week: 1, cat: 'Access', text: 'Get access to FHDA\u2019s internal ticketing system' },
    { week: 1, cat: 'Access', text: 'Join CSSO listserv and any CVC-OEI Slack/Teams channels' },
    { week: 1, cat: 'People', text: 'Meet 1:1 with manager \u2014 ask about expectations for the first 90 days' },
    { week: 1, cat: 'People', text: 'Meet the ETS Banner admin(s) \u2014 your most frequent partner' },
    { week: 1, cat: 'People', text: 'Identify the senior analyst on the CVC-OEI team and ask to shadow' },
    { week: 1, cat: 'Learn', text: 'Read the current CVC Exchange architecture overview on cvc.edu' },
    { week: 1, cat: 'Learn', text: 'Read the April 2025 Exchange release notes (SIS integration status)' },
    { week: 1, cat: 'Learn', text: 'Click through the Exchange Admin Dashboard in a test/demo account' },
    { week: 2, cat: 'Learn', text: 'Understand how AER flows from Banner to Exchange' },
    { week: 2, cat: 'Learn', text: 'Read the 4 Ellucian integration types: Banner Direct/Ethos, Colleague Direct/Ethos' },
    { week: 2, cat: 'Tool', text: 'Shadow a ticket from intake to resolution' },
    { week: 2, cat: 'Tool', text: 'Run a test cross-enrollment Foothill \u2192 De Anza to see the full flow' },
    { week: 3, cat: 'Produce', text: 'Resolve your first independent ticket end-to-end' },
    { week: 3, cat: 'Produce', text: 'Write your first KB entry based on a real resolution' },
    { week: 3, cat: 'Learn', text: 'Identify the 5 CCC colleges that generate the most FHDA-facing tickets' },
    { week: 4, cat: 'Produce', text: 'Export your first month\u2019s tickets \u2014 review with manager' },
    { week: 4, cat: 'Plan', text: 'Draft 60/90 day personal goals and share with manager' },
    { week: 0, cat: 'Habit', text: 'Open the Today dashboard first thing each morning' },
    { week: 0, cat: 'Habit', text: 'Back up localStorage (JSON export) every Friday' }
  ],
  ar: [
    { week: 1, cat: 'Access', text: 'Get access to your college\u2019s SIS (Banner/PeopleSoft/Colleague)' },
    { week: 1, cat: 'Access', text: 'Get access to Exchange Admin Dashboard at cvc.edu' },
    { week: 1, cat: 'People', text: 'Meet your A&R Director and team leads' },
    { week: 1, cat: 'People', text: 'Meet your IT liaison for Banner/SIS issues' },
    { week: 1, cat: 'Learn', text: 'Understand where Exchange records land in your SIS (batch posting, real-time, or manual)' },
    { week: 1, cat: 'Learn', text: 'Know your college\u2019s current SIS platform and integration tier' },
    { week: 2, cat: 'Learn', text: 'Review the Exchange enrollment lifecycle: apply \u2192 sync \u2192 post \u2192 Canvas' },
    { week: 2, cat: 'Learn', text: 'Learn how to query Exchange enrollment records by CCCID in your SIS' },
    { week: 2, cat: 'Tool', text: 'Run a reconciliation: compare Exchange roster to your SIS roster for a current term' },
    { week: 3, cat: 'Produce', text: 'Document your college\u2019s Exchange-specific posting workflow' },
    { week: 3, cat: 'People', text: 'Meet counterparts at your 3 highest-volume Exchange partner colleges' },
    { week: 4, cat: 'Plan', text: 'Identify recurring reconciliation issues and propose a fix' },
    { week: 0, cat: 'Habit', text: 'Check Exchange Admin Dashboard at the start of each business day' }
  ],
  fa: [
    { week: 1, cat: 'Access', text: 'Get access to your college\u2019s FA management system' },
    { week: 1, cat: 'Access', text: 'Get access to Exchange Admin Dashboard (FA role)' },
    { week: 1, cat: 'People', text: 'Meet your FA Director and Consortium Agreement owner' },
    { week: 1, cat: 'Learn', text: 'Read CVC\u2019s Financial Aid Dashboard documentation' },
    { week: 1, cat: 'Learn', text: 'Understand CCPG (California College Promise Grant) transfer rules for Exchange students' },
    { week: 2, cat: 'Learn', text: 'Walk through a Consortium Agreement from student request to disbursement' },
    { week: 2, cat: 'Learn', text: 'Know the 2 CCC FA systems and how they interact with Exchange (R2T4, Pell, CCPG)' },
    { week: 2, cat: 'Tool', text: 'Shadow a financial aid disbursement cycle with an Exchange student' },
    { week: 3, cat: 'Produce', text: 'Draft a student-facing FAQ on FA for Exchange courses' },
    { week: 3, cat: 'People', text: 'Meet FA counterparts at 3 top partner colleges' },
    { week: 4, cat: 'Plan', text: 'Review FA-related Exchange tickets from the past 90 days, identify patterns' },
    { week: 0, cat: 'Habit', text: 'Review pending Consortium Agreement requests each Monday morning' }
  ],
  counselor: [
    { week: 1, cat: 'Access', text: 'Log in to cvc.edu and search.cvc.edu; bookmark both' },
    { week: 1, cat: 'Access', text: 'Get counselor access to Exchange Admin Dashboard if available' },
    { week: 1, cat: 'Learn', text: 'Read the "For Counselors" section of this hub (below)' },
    { week: 1, cat: 'Learn', text: 'Understand the home college vs teaching college distinction' },
    { week: 1, cat: 'Learn', text: 'Know the 5 staff roles at each college: A&R, FA, Counseling, DSPS, General' },
    { week: 1, cat: 'People', text: 'Meet your college\u2019s A&R and FA contacts for Exchange escalations' },
    { week: 2, cat: 'Tool', text: 'Walk a student through a live Exchange search and enrollment' },
    { week: 2, cat: 'Tool', text: 'Use ASSIST to verify a course\u2019s transfer equivalency at the destination' },
    { week: 2, cat: 'Learn', text: 'Memorize the 6 triage scenarios in the "For Counselors" section' },
    { week: 3, cat: 'Produce', text: 'Write your own talking points for the top 3 Exchange questions you\u2019ve received' },
    { week: 4, cat: 'People', text: 'Connect with counselor counterparts at 2 partner colleges via CSSO' },
    { week: 0, cat: 'Habit', text: 'Check search.cvc.edu when students ask about a full/cancelled course' }
  ],
  dsps: [
    { week: 1, cat: 'Access', text: 'Access your college\u2019s DSPS management system' },
    { week: 1, cat: 'People', text: 'Meet your DSPS Coordinator and counterparts at 3 partner colleges' },
    { week: 1, cat: 'Learn', text: 'Understand how accommodations work for Exchange students: no auto-transfer' },
    { week: 1, cat: 'Learn', text: 'Read CVC-OEI DSPS best-practice guidance (on cvc.edu or CCCCO)' },
    { week: 2, cat: 'Learn', text: 'Review the Exchange drop/withdraw process to understand impact on accommodations' },
    { week: 2, cat: 'Tool', text: 'Draft a standard "accommodation letter share" email to partner DSPS offices' },
    { week: 3, cat: 'Produce', text: 'Build a contact list of DSPS coordinators at your 10 most-active partner colleges' },
    { week: 3, cat: 'Produce', text: 'Write a 1-pager explaining Exchange accommodation logistics for students' },
    { week: 4, cat: 'Plan', text: 'Propose improvements to DSPS-Exchange coordination based on first-month observations' },
    { week: 0, cat: 'Habit', text: 'At start of each term, check for new Exchange students in your DSPS caseload' }
  ],
  student: [
    { week: 1, cat: 'Learn', text: 'Confirm you have an active student ID at your home college' },
    { week: 1, cat: 'Learn', text: 'Know what the CVC Exchange is and when to use it' },
    { week: 1, cat: 'Tool', text: 'Visit search.cvc.edu and browse courses for your upcoming term' },
    { week: 1, cat: 'Tool', text: 'Bookmark cvc.edu in your browser' },
    { week: 2, cat: 'Learn', text: 'Verify your home college\u2019s financial aid process for Exchange courses (Consortium Agreement)' },
    { week: 2, cat: 'Learn', text: 'If you use DSPS: know you\u2019ll need to contact the teaching college separately' },
    { week: 2, cat: 'Tool', text: 'Practice enrolling (can cancel immediately) so you know the flow' },
    { week: 3, cat: 'Plan', text: 'Identify 1-2 courses you might take through the Exchange this year' },
    { week: 0, cat: 'Habit', text: 'When a class is full, check search.cvc.edu before giving up' }
  ]
};

var OB_SEEDS = OB_ROLE_SEEDS.analyst;

function obGetActiveRole() {
  try {
    var r = localStorage.getItem(OB_ROLE_KEY);
    if (r && OB_ROLE_SEEDS[r]) return r;
    // Default to the user's global role if set
    var gr = localStorage.getItem('appanalyst.role.v1');
    if (gr && OB_ROLE_SEEDS[gr]) return gr;
  } catch (e) {}
  return 'analyst';
}

function obSwitchRole(role) {
  if (!OB_ROLE_SEEDS[role]) return;
  if (!confirm('Switch to the ' + role + ' checklist? This replaces your current seed items. Custom items you added will be kept.')) return;

  var existing = obLoad();
  // Preserve custom items (category 'Custom' or items not matching any seed text for the old role)
  var customItems = existing.filter(function(i) { return i.cat === 'Custom'; });

  var seeds = OB_ROLE_SEEDS[role];
  var seeded = seeds.map(function(s, idx) {
    return {
      id: 'O' + idx + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 4),
      week: s.week,
      cat: s.cat,
      text: s.text,
      done: false,
      created: new Date().toISOString()
    };
  });

  try { localStorage.setItem(OB_ROLE_KEY, role); } catch (e) {}
  obSave(seeded.concat(customItems));
  obRender();
  toast('Switched to ' + role + ' checklist');
}

function obLoad() {
  try {
    var raw = localStorage.getItem(OB_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  // Seed on first load based on current role
  var activeRole = obGetActiveRole();
  var seeds = OB_ROLE_SEEDS[activeRole] || OB_ROLE_SEEDS.analyst;
  var seeded = seeds.map(function(s, i) {
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
  try { localStorage.setItem(OB_ROLE_KEY, activeRole); } catch (e) {}
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

  var activeRole = obGetActiveRole();
  var roleLabels = {
    analyst: 'Analyst',
    ar: 'A&R',
    fa: 'Financial Aid',
    counselor: 'Counselor',
    dsps: 'DSPS',
    student: 'Student'
  };
  var roleSwitcher = '<select class="ob-role-switch" onchange="obSwitchRole(this.value)" title="Switch to a different role\u0027s checklist">' +
    Object.keys(roleLabels).map(function(r) {
      return '<option value="' + r + '"' + (r === activeRole ? ' selected' : '') + '>' + roleLabels[r] + ' checklist</option>';
    }).join('') +
  '</select>';

  head.innerHTML =
    '<div class="ob-progress-wrap">' +
      '<div class="ob-progress-label"><strong>' + done + '</strong> of ' + total + ' complete <span class="ob-pct">' + pct + '%</span></div>' +
      '<div class="ob-progress-bar"><div class="ob-progress-fill" style="width:' + pct + '%"></div></div>' +
    '</div>' +
    '<div class="ob-head-actions">' +
      roleSwitcher +
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
