// ═══════════════════════════════════════════════════════
// REAL COMMS — Fill-in templates for routine (non-incident)
// communications. The Escalation Helper handles incidents.
// This is for weekly pulse, ticket acks, closing notes, etc.
// ═══════════════════════════════════════════════════════

var RC_VIEW_KEY = 'appanalyst.comms.view.v1';
var RC_STATE_KEY = 'appanalyst.comms.state.v1';

var RC_TEMPLATES = [
  {
    id: 'ack',
    label: 'Ticket acknowledgment',
    icon: '\u2709',
    fields: [
      { key: 'recipient', label: 'Recipient name', placeholder: 'Student, counselor, or campus staff' },
      { key: 'ticketId', label: 'Ticket ID (optional)', placeholder: 'INC-1234' },
      { key: 'symptom', label: 'Issue summary', placeholder: 'MATH 1A not appearing in Canvas' },
      { key: 'eta', label: 'Expected response', placeholder: 'within 2 business days' }
    ],
    build: function(s) {
      return 'Subject: We got your request' + (s.ticketId ? ' — ' + s.ticketId : '') + '\n\n' +
        'Hi ' + (s.recipient || '[name]') + ',\n\n' +
        'Thanks for reaching out. We\u2019ve received your report about ' + (s.symptom || '[issue]') + '.\n\n' +
        'You can expect an update from us ' + (s.eta || 'within 1\u20132 business days') + '. No action needed on your end — we\u2019ll follow up here.\n\n' +
        'If something changes on your side in the meantime (it starts working, or the problem gets worse), just reply to this message.\n\n' +
        'Thanks —\nCVC-OEI Support';
    }
  },
  {
    id: 'closing',
    label: 'Ticket closing / resolution',
    icon: '\u2713',
    fields: [
      { key: 'recipient', label: 'Recipient name', placeholder: 'Student or staff name' },
      { key: 'ticketId', label: 'Ticket ID (optional)', placeholder: 'INC-1234' },
      { key: 'symptom', label: 'Original issue', placeholder: 'Enrollment missing from Canvas' },
      { key: 'resolution', label: 'What fixed it', placeholder: 'Campus IT regenerated the credential; records flowed through' },
      { key: 'prevention', label: 'Prevention note (optional)', placeholder: 'We added monitoring so this alerts before it fails again' }
    ],
    build: function(s) {
      return 'Subject: Resolved' + (s.ticketId ? ' — ' + s.ticketId : '') + '\n\n' +
        'Hi ' + (s.recipient || '[name]') + ',\n\n' +
        'Quick update — the issue you reported (' + (s.symptom || '[issue]') + ') is resolved.\n\n' +
        'What happened: ' + (s.resolution || '[root cause + fix]') + '.\n\n' +
        (s.prevention ? 'Going forward: ' + s.prevention + '\n\n' : '') +
        'Please let us know if you run into anything else. Closing this ticket.\n\n' +
        'Thanks —\nCVC-OEI Support';
    }
  },
  {
    id: 'known',
    label: 'Known issue notice',
    icon: '!',
    fields: [
      { key: 'recipient', label: 'Recipient / audience', placeholder: 'Campus IT at [college]' },
      { key: 'symptom', label: 'Symptom users will see', placeholder: 'Course roster doesn\u2019t show until 24h after census' },
      { key: 'cause', label: 'Known cause', placeholder: 'Ethos integration pending Ellucian prioritization' },
      { key: 'workaround', label: 'Workaround', placeholder: 'Manual AER posting for affected students' },
      { key: 'eta', label: 'Expected fix ETA', placeholder: 'Q3 2026' }
    ],
    build: function(s) {
      return 'Subject: Known issue — ' + (s.symptom || '[symptom]') + '\n\n' +
        'Hi ' + (s.recipient || '[audience]') + ',\n\n' +
        'Sharing context on a known issue you or your students may hit:\n\n' +
        'Symptom: ' + (s.symptom || '[symptom]') + '\n' +
        'Cause: ' + (s.cause || '[cause]') + '\n' +
        'Workaround: ' + (s.workaround || '[workaround]') + '\n' +
        'Expected fix: ' + (s.eta || '[eta]') + '\n\n' +
        'This isn\u2019t unique to your campus — we\u2019re tracking it across the system and working with the vendor. I\u2019ll update you when there\u2019s meaningful movement.\n\n' +
        'Happy to answer questions.\n\n' +
        '— CVC-OEI Support';
    }
  },
  {
    id: 'pulse',
    label: 'Weekly pulse summary',
    icon: '\u2261',
    fields: [
      { key: 'weekOf', label: 'Week of', placeholder: 'Apr 6, 2026' },
      { key: 'ticketCount', label: 'Tickets worked', placeholder: '12' },
      { key: 'resolvedCount', label: 'Resolved', placeholder: '10' },
      { key: 'topColleges', label: 'Top 3 colleges by volume', placeholder: 'Sacramento City, CCSF, Riverside' },
      { key: 'topSystem', label: 'Most-touched system', placeholder: 'Banner Ethos' },
      { key: 'highlight', label: 'Notable incident or win', placeholder: 'Closed a Colleague Ethos sync issue that had been open 2 weeks' }
    ],
    build: function(s) {
      return 'Subject: CVC-OEI support — week of ' + (s.weekOf || '[date]') + '\n\n' +
        'Quick pulse for the week:\n\n' +
        '- Tickets worked: ' + (s.ticketCount || '[n]') + '\n' +
        '- Resolved: ' + (s.resolvedCount || '[n]') + '\n' +
        '- Most-touched system: ' + (s.topSystem || '[system]') + '\n' +
        '- Top colleges by volume: ' + (s.topColleges || '[list]') + '\n\n' +
        'Notable: ' + (s.highlight || '[highlight or win]') + '\n\n' +
        'Full ticket log on request. Trends and pattern notes feed into the Intelligence section for later review.\n\n' +
        '— CVC-OEI Support';
    }
  },
  {
    id: 'onboarding',
    label: 'College onboarding welcome',
    icon: '\u2605',
    fields: [
      { key: 'college', label: 'College name', placeholder: 'Porterville College' },
      { key: 'contact', label: 'Primary contact name', placeholder: 'Jane Doe' },
      { key: 'sis', label: 'SIS platform', placeholder: 'Banner Direct' },
      { key: 'kickoff', label: 'Kickoff date', placeholder: 'week of May 12' }
    ],
    build: function(s) {
      return 'Subject: Welcome to the CVC Exchange — ' + (s.college || '[college]') + '\n\n' +
        'Hi ' + (s.contact || '[name]') + ',\n\n' +
        'Welcome to the CVC Exchange community. I\u2019ll be your main point of contact for support on the integration side.\n\n' +
        'Based on what we have on file, ' + (s.college || '[college]') + ' is on ' + (s.sis || '[SIS]') + '. That determines which integration package we\u2019ll work through together.\n\n' +
        'Proposed kickoff: ' + (s.kickoff || '[date]') + '. On that call we\u2019ll cover:\n' +
        '- SSO / identity configuration\n' +
        '- AER (enrollment reporting) setup\n' +
        '- Exchange Admin Dashboard access for your A&R, FA, Counseling, and DSPS leads\n' +
        '- KB articles and support channel\n\n' +
        'Please reply with any scheduling constraints or questions ahead of time.\n\n' +
        'Looking forward to it.\n\n' +
        '— CVC-OEI Support';
    }
  }
];

function rcCommsGetView() { try { return localStorage.getItem(RC_VIEW_KEY) || 'real'; } catch (e) { return 'real'; } }
function rcCommsSetView(v) { try { localStorage.setItem(RC_VIEW_KEY, v); } catch (e) {} rcCommsApplyView(); }

function rcCommsLoadState() {
  try {
    var raw = localStorage.getItem(RC_STATE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { active: 'ack', values: {} };
}
function rcCommsSaveState(s) {
  if (typeof safeStorage !== 'undefined') { safeStorage.set(RC_STATE_KEY, s); return; }
  try { localStorage.setItem(RC_STATE_KEY, JSON.stringify(s)); } catch (e) {}
}

function rcCommsApplyView() {
  var v = rcCommsGetView();
  var real = document.getElementById('realCommsBody');
  var demo = document.getElementById('demoCommsBody');
  var btnReal = document.getElementById('rcCommsBtnReal');
  var btnDemo = document.getElementById('rcCommsBtnDemo');
  if (real) real.style.display = v === 'real' ? '' : 'none';
  if (demo) demo.style.display = v === 'demo' ? '' : 'none';
  if (btnReal) btnReal.classList.toggle('rm-active', v === 'real');
  if (btnDemo) btnDemo.classList.toggle('rm-active', v === 'demo');
  if (v === 'real') rcCommsRender();
}

function rcCommsEsc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function rcCommsPick(id) {
  var state = rcCommsLoadState();
  state.active = id;
  rcCommsSaveState(state);
  rcCommsRender();
}

function rcCommsUpdate(templateId, fieldKey, value) {
  var state = rcCommsLoadState();
  if (!state.values[templateId]) state.values[templateId] = {};
  state.values[templateId][fieldKey] = value;
  rcCommsSaveState(state);
  var pre = document.getElementById('rcCommsPreview');
  if (pre) {
    var template = RC_TEMPLATES.find(function(t) { return t.id === state.active; });
    if (template) pre.textContent = template.build(state.values[state.active] || {});
  }
}

function rcCommsCopy() {
  var state = rcCommsLoadState();
  var template = RC_TEMPLATES.find(function(t) { return t.id === state.active; });
  if (!template) return;
  var body = template.build(state.values[state.active] || {});
  navigator.clipboard.writeText(body).then(function() { toast('Copied'); }).catch(function() { toast('Copy failed'); });
}

function rcCommsClearTemplate() {
  var state = rcCommsLoadState();
  state.values[state.active] = {};
  rcCommsSaveState(state);
  rcCommsRender();
}

function rcCommsRender() {
  var container = document.getElementById('realCommsBody');
  if (!container) return;
  var state = rcCommsLoadState();
  var active = state.active || 'ack';
  var template = RC_TEMPLATES.find(function(t) { return t.id === active; }) || RC_TEMPLATES[0];
  var values = (state.values && state.values[active]) || {};

  var sidebar = '<div class="rcc-sidebar">' +
    '<div class="rcc-sidebar-label">Templates</div>' +
    RC_TEMPLATES.map(function(t) {
      return '<button class="rcc-tab' + (t.id === active ? ' rcc-tab-active' : '') + '" onclick="rcCommsPick(\'' + t.id + '\')">' +
        '<span class="rcc-tab-icon">' + t.icon + '</span>' +
        '<span class="rcc-tab-label">' + t.label + '</span>' +
      '</button>';
    }).join('') +
  '</div>';

  var form = '<div class="rcc-form">' +
    '<div class="rcc-form-head"><span class="rcc-form-title">' + template.label + '</span></div>' +
    template.fields.map(function(f) {
      return '<div class="rcc-field">' +
        '<label>' + f.label + '</label>' +
        '<input type="text" value="' + rcCommsEsc(values[f.key] || '') + '" placeholder="' + rcCommsEsc(f.placeholder || '') + '" oninput="rcCommsUpdate(\'' + active + '\',\'' + f.key + '\',this.value)">' +
      '</div>';
    }).join('') +
    '<div class="rcc-form-actions">' +
      '<button class="tl-btn tl-btn-new" onclick="rcCommsCopy()">Copy draft</button>' +
      '<button class="tl-btn" onclick="rcCommsClearTemplate()">Clear</button>' +
    '</div>' +
  '</div>';

  var preview = '<div class="rcc-preview">' +
    '<div class="rcc-preview-label">Preview</div>' +
    '<pre id="rcCommsPreview" class="rcc-preview-body">' + rcCommsEsc(template.build(values)) + '</pre>' +
  '</div>';

  container.innerHTML = '<div class="rcc-layout">' + sidebar + '<div class="rcc-right">' + form + preview + '</div></div>';
}

rcCommsApplyView();
