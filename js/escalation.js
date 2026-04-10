// ═══════════════════════════════════════════════════════
// ESCALATION HELPER — Pick severity, fill a few fields,
// get a draft escalation message + next-action checklist.
// Can promote the result into the ticket log in one click.
// ═══════════════════════════════════════════════════════

var ESC_STATE = {
  severity: 'P2',
  college: '',
  system: 'Banner Direct',
  symptom: '',
  affected: '',
  rootCause: '',
  action: ''
};

var ESC_SEVERITY_META = {
  P1: {
    label: 'Critical — multiple colleges, active blockage',
    color: 'var(--red)',
    sla: 'Immediate — drop everything',
    who: 'Senior analyst + supervisor simultaneously. Vendor support if Ethos/Ellucian. Campus IT leads at affected colleges.',
    checklist: [
      'Name the scope: which colleges, how many students, when it started',
      'Capture error codes and timestamps from logs before they rotate',
      'Open vendor case (Ellucian / CCCTC) with case number',
      'Notify supervisor by phone or Slack DM — not email',
      'Send student-facing message first (even if just "we know, updates coming")',
      'Send internal all-hands update in Slack',
      'Start a shared running doc / timeline for the incident'
    ]
  },
  P2: {
    label: 'Degraded — one college, sync delays or partial failures',
    color: 'var(--amber)',
    sla: 'Within 2 hours — triage, diagnose, escalate if stuck',
    who: 'Campus IT at the affected college. Senior analyst if root cause unclear after 30 min of investigation.',
    checklist: [
      'Confirm the symptom reproduces (don\u2019t trust one report)',
      'Check which SIS tier the college is on (Directory → SIS badge)',
      'Compare affected records to unaffected ones — what\u2019s different?',
      'Draft a diagnostic-detail email to campus IT',
      'Internal Slack update to the team',
      'Student notice only if enrollment is actually blocked',
      'Log the investigation trail in the ticket log'
    ]
  },
  P3: {
    label: 'Minor / individual — one student or known gap',
    color: 'var(--blue)',
    sla: 'Within 1 business day — standard queue',
    who: 'Handle directly. Escalate to supervisor only if a 48-hour deadline is at risk.',
    checklist: [
      'Confirm student ID (CCCID), home college, teaching college',
      'Check if there\u2019s an existing KB entry for this pattern',
      'Respond to the student directly with a clear next step',
      'Document the resolution for pattern tracking',
      'If you see the same issue a second time, promote it to a KB article'
    ]
  }
};

function escTemplate(kind) {
  var s = ESC_STATE;
  var sev = s.severity;
  var college = s.college || '[COLLEGE]';
  var system = s.system || '[SYSTEM]';
  var symptom = s.symptom || '[SYMPTOM]';
  var affected = s.affected ? (s.affected + ' students') : '[N] students';
  var rootCause = s.rootCause || '[ROOT CAUSE TBD]';
  var action = s.action || '[PLANNED ACTION]';

  if (kind === 'student') {
    return 'Subject: Your enrollment update — ' + college + '\n\n' +
      'We\u2019re aware of an issue affecting your cross-enrollment at ' + college + '. ' +
      (sev === 'P1' ? 'We\u2019re working on it actively and expect to have more information within the hour.' :
       sev === 'P2' ? 'Your enrollment record is safe. The delay is in how the data reaches Canvas — we expect it resolved within a few hours.' :
       'We\u2019re working on your case and will follow up directly.') + '\n\n' +
      'You do not need to take any action right now. We\u2019ll email an update as soon as the issue is resolved.\n\n' +
      'Thanks for your patience.\n— CVC-OEI Support';
  }

  if (kind === 'campusit') {
    return 'Subject: [' + sev + '] ' + system + ' — ' + symptom + ' (' + college + ')\n\n' +
      'Hi team,\n\n' +
      'We\u2019re seeing ' + symptom + ' affecting ' + affected + ' at ' + college + '.\n\n' +
      'Details:\n' +
      '- System: ' + system + '\n' +
      '- Observed: ' + symptom + '\n' +
      '- Likely cause: ' + rootCause + '\n' +
      '- Planned action: ' + action + '\n\n' +
      'Could you confirm whether the enrollment records exist on your side and share any related error logs from the last 2 hours? Happy to hop on a call if that\u2019s faster.\n\n' +
      'Thanks —\nCVC-OEI Support';
  }

  if (kind === 'registrar') {
    return 'Subject: Cross-enrollment sync issue — ' + college + '\n\n' +
      'Quick heads-up: we\u2019re working a ' + sev + ' sync issue affecting ' + affected + ' at ' + college + '. Student enrollment records are confirmed valid — the delay is in how the data reaches Canvas.\n\n' +
      'Symptom: ' + symptom + '\n' +
      'Root cause: ' + rootCause + '\n' +
      'ETA: ' + (sev === 'P1' ? 'under 4 hours' : sev === 'P2' ? 'within the day' : 'by end of business') + '\n\n' +
      'If students contact your office, you can confirm their enrollment is valid and the issue is on our end. Happy to provide a written summary for any escalation.\n\n' +
      '— CVC-OEI Support';
  }

  if (kind === 'internal') {
    return '[' + sev + '] ' + system + ' @ ' + college + '\n\n' +
      'Scope: ' + affected + ' affected\n' +
      'Symptom: ' + symptom + '\n' +
      'Root cause: ' + rootCause + '\n' +
      'Action: ' + action + '\n' +
      'Status: ' + (sev === 'P1' ? 'active incident' : sev === 'P2' ? 'investigating' : 'queued') + '\n\n' +
      'Updates in this thread.';
  }

  if (kind === 'vendor') {
    return 'Subject: [' + sev + '] ' + system + ' issue at ' + college + ' — CVC Exchange integration\n\n' +
      'Opening a support case for an issue affecting the CVC Exchange integration at ' + college + '.\n\n' +
      'Symptom: ' + symptom + '\n' +
      'System: ' + system + '\n' +
      'Students affected: ' + affected + '\n' +
      'Our working hypothesis: ' + rootCause + '\n\n' +
      'Details gathered so far:\n[paste log excerpts, timestamps, error codes here]\n\n' +
      'What we\u2019ve tried:\n[list steps already taken]\n\n' +
      'Please advise on next steps. Happy to schedule a call.\n\n' +
      'Thanks —\n[your name]\nCVC-OEI Application Support Analyst\nFoothill\u2013De Anza CCD';
  }

  return '';
}

function escUpdate(field, value) {
  ESC_STATE[field] = value;
  escRenderOutput();
}

function escSetSeverity(sev) {
  ESC_STATE.severity = sev;
  escRenderAll();
}

function escRenderAll() {
  var form = document.getElementById('escForm');
  if (!form) return;

  var sev = ESC_STATE.severity;
  var meta = ESC_SEVERITY_META[sev];

  form.innerHTML =
    '<div class="esc-sev-picker">' +
      ['P1', 'P2', 'P3'].map(function(s) {
        return '<button class="esc-sev-btn' + (s === sev ? ' esc-sev-active' : '') + ' esc-sev-' + s.toLowerCase() + '" onclick="escSetSeverity(\'' + s + '\')">' +
          '<span class="esc-sev-label">' + s + '</span>' +
          '<span class="esc-sev-text">' + ESC_SEVERITY_META[s].label + '</span>' +
        '</button>';
      }).join('') +
    '</div>' +
    '<div class="esc-meta esc-meta-' + sev.toLowerCase() + '">' +
      '<div class="esc-meta-row"><span class="esc-meta-label">Response</span><span>' + meta.sla + '</span></div>' +
      '<div class="esc-meta-row"><span class="esc-meta-label">Who to contact</span><span>' + meta.who + '</span></div>' +
    '</div>' +
    '<div class="esc-form-grid">' +
      '<div class="esc-field"><label>College</label><input type="text" value="' + escEsc(ESC_STATE.college) + '" placeholder="e.g. Sacramento City College" oninput="escUpdate(\'college\',this.value)" list="escCollegeList"></div>' +
      '<div class="esc-field"><label>System</label><select onchange="escUpdate(\'system\',this.value)">' +
        ['Banner Direct', 'Banner Ethos', 'Colleague Ethos', 'PeopleSoft', 'CCCApply', 'SuperGlue', 'Canvas', 'Ethos API', 'SSO / IdP', 'Other'].map(function(sy) {
          return '<option' + (sy === ESC_STATE.system ? ' selected' : '') + '>' + sy + '</option>';
        }).join('') +
      '</select></div>' +
      '<div class="esc-field"><label>Students affected (number)</label><input type="text" value="' + escEsc(ESC_STATE.affected) + '" placeholder="47" oninput="escUpdate(\'affected\',this.value)"></div>' +
      '<div class="esc-field esc-field-full"><label>Symptom (one line)</label><input type="text" value="' + escEsc(ESC_STATE.symptom) + '" placeholder="Enrollment stuck in AER queue — 401 invalid_grant" oninput="escUpdate(\'symptom\',this.value)"></div>' +
      '<div class="esc-field esc-field-full"><label>Root cause (best guess if unknown)</label><input type="text" value="' + escEsc(ESC_STATE.rootCause) + '" placeholder="Ethos OAuth2 token expired" oninput="escUpdate(\'rootCause\',this.value)"></div>' +
      '<div class="esc-field esc-field-full"><label>Planned action</label><input type="text" value="' + escEsc(ESC_STATE.action) + '" placeholder="Working with campus IT to regenerate credentials" oninput="escUpdate(\'action\',this.value)"></div>' +
    '</div>' +
    '<datalist id="escCollegeList">' +
      (typeof collegeDB !== 'undefined' ? collegeDB.map(function(c) { return '<option value="' + escEsc(c.name) + '">'; }).join('') : '') +
    '</datalist>' +
    '<div class="esc-form-actions">' +
      '<button class="tl-btn tl-btn-new" onclick="escPromoteToTicket()">Save as ticket</button>' +
      '<button class="tl-btn" onclick="escReset()">Reset</button>' +
    '</div>';

  escRenderOutput();
}

function escRenderOutput() {
  var out = document.getElementById('escOutput');
  if (!out) return;
  var sev = ESC_STATE.severity;
  var meta = ESC_SEVERITY_META[sev];

  var kinds = [
    { key: 'student', label: 'Student notice' },
    { key: 'campusit', label: 'Campus IT' },
    { key: 'registrar', label: 'Registrar' },
    { key: 'internal', label: 'Internal Slack' },
    { key: 'vendor', label: 'Vendor ticket (Ellucian / CCCTC)' }
  ];

  out.innerHTML =
    '<div class="esc-output-title">Drafts \u2014 ' + sev + '</div>' +
    '<div class="esc-checklist">' +
      '<div class="esc-checklist-title">Action checklist</div>' +
      '<ul>' + meta.checklist.map(function(c) { return '<li>' + escEsc(c) + '</li>'; }).join('') + '</ul>' +
    '</div>' +
    kinds.map(function(k) {
      var body = escTemplate(k.key);
      return '<div class="esc-draft">' +
        '<div class="esc-draft-head">' +
          '<span class="esc-draft-label">' + k.label + '</span>' +
          '<button class="esc-draft-copy" onclick="escCopyDraft(\'' + k.key + '\')">Copy</button>' +
        '</div>' +
        '<pre class="esc-draft-body">' + escEsc(body) + '</pre>' +
      '</div>';
    }).join('');
}

function escCopyDraft(kind) {
  var body = escTemplate(kind);
  navigator.clipboard.writeText(body).then(function() { toast('Copied — ' + kind); }).catch(function() { toast('Copy failed'); });
}

function escReset() {
  ESC_STATE = { severity: 'P2', college: '', system: 'Banner Direct', symptom: '', affected: '', rootCause: '', action: '' };
  escRenderAll();
}

function escPromoteToTicket() {
  if (typeof tlLoad !== 'function' || typeof tlSave !== 'function') { toast('Ticket log not loaded'); return; }
  if (!ESC_STATE.symptom || !ESC_STATE.college) { toast('Need college + symptom first'); return; }

  var list = tlLoad();
  var ticket = {
    id: 'T' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    college: ESC_STATE.college,
    system: ESC_STATE.system,
    symptom: ESC_STATE.symptom,
    status: 'open',
    vendor: '',
    notes: '[' + ESC_STATE.severity + '] Root cause: ' + (ESC_STATE.rootCause || '(tbd)') + '\nPlanned action: ' + (ESC_STATE.action || '(tbd)') + '\nAffected: ' + (ESC_STATE.affected || '(tbd)') + ' students',
    resolution: ''
  };
  list.unshift(ticket);
  tlSave(list);
  if (typeof tlRender === 'function') tlRender();
  if (typeof todayRender === 'function') todayRender();
  toast('Saved to ticket log');
}

function escEsc(s) {
  return (s || '').toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

escRenderAll();
