// ═══════════════════════════════════════════════════════
// REAL TRACER — Interactive diagnostic checklist. Five
// layers of the CVC Exchange data path. Save state per
// active incident so you can come back mid-triage.
// ═══════════════════════════════════════════════════════

var RT_VIEW_KEY = 'appanalyst.tracer.view.v1';
var RT_STATE_KEY = 'appanalyst.tracer.state.v1';

var RT_STAGES = [
  {
    id: 'symptom',
    label: 'Symptom',
    icon: '1',
    prompt: 'What did the user report? Capture their exact words if possible.',
    questions: [
      'Who reported it? (student, counselor, campus IT, registrar?)',
      'What exactly did they try to do?',
      'What did they expect to happen?',
      'What happened instead?',
      'Is it one student or many? Which college(s)?',
      'When did it start? (Are they the first to mention it?)'
    ]
  },
  {
    id: 'home',
    label: 'Home college SIS',
    icon: '2',
    prompt: 'Does the enrollment exist in the home college\'s student system?',
    questions: [
      'Confirm student identity: CCCID + name match?',
      'Does the student have an active application at the home college?',
      'Is the cross-enrollment record visible in Banner / PeopleSoft / Colleague?',
      'Check: is the home college on Banner Direct, Banner Ethos, PeopleSoft, or Colleague? (SIS tier affects next steps)',
      'If Ethos variant: manual AER reconciliation may be in play — check that first',
      'Any recent holds, balances, or registration blocks on the student?'
    ]
  },
  {
    id: 'exchange',
    label: 'CVC Exchange layer',
    icon: '3',
    prompt: 'Did Exchange receive and validate the enrollment?',
    questions: [
      'Is the student visible in the Exchange Admin Dashboard?',
      'What status does the Exchange show? (Pending, Enrolled, Rejected, Unknown)',
      'Any error on the residency validation step?',
      'Was the CCPG / financial aid flag passed correctly?',
      'Any API error logs from the last 2 hours? (token, 401, timeout)',
      'Is the teaching college set up correctly in the consortium agreement?'
    ]
  },
  {
    id: 'teaching',
    label: 'Teaching college roster',
    icon: '4',
    prompt: 'Did the enrollment land on the teaching college side?',
    questions: [
      'Does the teaching college roster show the student?',
      'Are units and term recorded correctly on their side?',
      'Is the student visible in the instructor\'s class roster?',
      'If not: ask teaching-college IT to confirm whether the AER message arrived',
      'Check for data drift: Exchange says X, teaching SIS says Y — which is right?'
    ]
  },
  {
    id: 'canvas',
    label: 'Canvas / LMS',
    icon: '5',
    prompt: 'Can the student see and access the course in Canvas?',
    questions: [
      'Does the course appear on their Canvas dashboard?',
      'When they click in, do they get course content or an error?',
      'Is the SSO handoff working? (home college IdP → Canvas login)',
      'Is there a delay between teaching-college roster and Canvas sync?',
      'If Canvas has them but features are locked: CCCID mapping / eduPersonPrincipalName issue'
    ]
  }
];

function rtGetView() { try { return localStorage.getItem(RT_VIEW_KEY) || 'real'; } catch (e) { return 'real'; } }
function rtSetView(v) { try { localStorage.setItem(RT_VIEW_KEY, v); } catch (e) {} rtApplyView(); }

function rtLoadState() {
  try {
    var raw = localStorage.getItem(RT_STATE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    college: '',
    symptom: '',
    severity: 'P2',
    stages: {},
    notes: {},
    activeStage: 'symptom',
    updated: new Date().toISOString()
  };
}

function rtSaveState(s) {
  s.updated = new Date().toISOString();
  localStorage.setItem(RT_STATE_KEY, JSON.stringify(s));
}

function rtApplyView() {
  var v = rtGetView();
  var real = document.getElementById('realTracerBody');
  var demo = document.getElementById('demoTracerBody');
  var btnReal = document.getElementById('rtBtnReal');
  var btnDemo = document.getElementById('rtBtnDemo');
  if (real) real.style.display = v === 'real' ? '' : 'none';
  if (demo) demo.style.display = v === 'demo' ? '' : 'none';
  if (btnReal) btnReal.classList.toggle('rm-active', v === 'real');
  if (btnDemo) btnDemo.classList.toggle('rm-active', v === 'demo');
  if (v === 'real') rtRender();
}

function rtEsc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function rtToggleQuestion(stageId, qIdx) {
  var state = rtLoadState();
  if (!state.stages[stageId]) state.stages[stageId] = {};
  state.stages[stageId][qIdx] = !state.stages[stageId][qIdx];
  rtSaveState(state);
  rtRender();
}

function rtSetActiveStage(id) {
  var state = rtLoadState();
  state.activeStage = id;
  rtSaveState(state);
  rtRender();
}

function rtUpdateField(field, value) {
  var state = rtLoadState();
  state[field] = value;
  rtSaveState(state);
  var bar = document.getElementById('rtProgressBar');
  if (bar) rtRenderProgress(state);
}

function rtUpdateNote(stageId, value) {
  var state = rtLoadState();
  if (!state.notes) state.notes = {};
  state.notes[stageId] = value;
  rtSaveState(state);
}

function rtReset() {
  if (!confirm('Clear the current diagnostic and start fresh?')) return;
  localStorage.removeItem(RT_STATE_KEY);
  rtRender();
}

function rtPromoteToTicket() {
  if (typeof tlLoad !== 'function' || typeof tlSave !== 'function') { toast('Ticket log not loaded'); return; }
  var state = rtLoadState();
  if (!state.college || !state.symptom) { toast('Need college and symptom first'); return; }

  // Compose a notes blob from the completed stages
  var lines = ['[' + state.severity + '] Diagnostic trace:'];
  RT_STAGES.forEach(function(stage) {
    var done = state.stages[stage.id] || {};
    var doneCount = Object.values(done).filter(function(v) { return v; }).length;
    if (doneCount > 0 || (state.notes && state.notes[stage.id])) {
      lines.push('');
      lines.push('— ' + stage.label + ' (' + doneCount + '/' + stage.questions.length + ' checked)');
      stage.questions.forEach(function(q, i) {
        if (done[i]) lines.push('  [x] ' + q);
      });
      if (state.notes && state.notes[stage.id]) {
        lines.push('  note: ' + state.notes[stage.id]);
      }
    }
  });

  var list = tlLoad();
  var ticket = {
    id: 'T' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    college: state.college,
    system: 'Other',
    symptom: state.symptom,
    status: 'open',
    vendor: '',
    notes: lines.join('\n'),
    resolution: ''
  };
  list.unshift(ticket);
  tlSave(list);
  if (typeof tlRender === 'function') tlRender();
  if (typeof todayRender === 'function') todayRender();
  toast('Diagnostic saved to ticket log');
}

function rtRenderProgress(state) {
  var total = 0;
  var done = 0;
  RT_STAGES.forEach(function(stage) {
    total += stage.questions.length;
    var s = state.stages[stage.id] || {};
    Object.keys(s).forEach(function(k) { if (s[k]) done++; });
  });
  var pct = total > 0 ? Math.round((done / total) * 100) : 0;
  var bar = document.getElementById('rtProgressBar');
  if (bar) {
    bar.innerHTML =
      '<div class="rt-prog-label"><strong>' + done + '</strong> of ' + total + ' checks complete <span class="rt-prog-pct">' + pct + '%</span></div>' +
      '<div class="rt-prog-track"><div class="rt-prog-fill" style="width:' + pct + '%"></div></div>';
  }
}

function rtRender() {
  var container = document.getElementById('realTracerBody');
  if (!container) return;
  var state = rtLoadState();

  var headerHtml =
    '<div class="rt-header">' +
      '<div class="rt-form-row">' +
        '<div class="rt-field"><label>College</label><input type="text" value="' + rtEsc(state.college) + '" placeholder="e.g. Sacramento City College" oninput="rtUpdateField(\'college\',this.value)" list="escCollegeList"></div>' +
        '<div class="rt-field"><label>Symptom</label><input type="text" value="' + rtEsc(state.symptom) + '" placeholder="Student cannot see MATH 1A in Canvas" oninput="rtUpdateField(\'symptom\',this.value)"></div>' +
        '<div class="rt-field"><label>Severity</label><select onchange="rtUpdateField(\'severity\',this.value)">' +
          ['P1', 'P2', 'P3'].map(function(s) { return '<option' + (s === state.severity ? ' selected' : '') + '>' + s + '</option>'; }).join('') +
        '</select></div>' +
      '</div>' +
      '<div id="rtProgressBar" class="rt-prog-wrap"></div>' +
      '<div class="rt-header-actions">' +
        '<button class="tl-btn tl-btn-new" onclick="rtPromoteToTicket()">Save to ticket log</button>' +
        '<button class="tl-btn" onclick="rtReset()">Reset trace</button>' +
      '</div>' +
    '</div>';

  var stagesHtml = '<div class="rt-stages">' + RT_STAGES.map(function(stage) {
    var done = state.stages[stage.id] || {};
    var doneCount = stage.questions.filter(function(_, i) { return done[i]; }).length;
    var total = stage.questions.length;
    var pct = total > 0 ? (doneCount / total) * 100 : 0;
    var isActive = state.activeStage === stage.id;
    var isComplete = doneCount === total;
    return '<button class="rt-stage' + (isActive ? ' rt-stage-active' : '') + (isComplete ? ' rt-stage-complete' : '') + '" onclick="rtSetActiveStage(\'' + stage.id + '\')">' +
      '<div class="rt-stage-icon">' + (isComplete ? '\u2713' : stage.icon) + '</div>' +
      '<div class="rt-stage-info">' +
        '<div class="rt-stage-label">' + stage.label + '</div>' +
        '<div class="rt-stage-progress"><div class="rt-stage-progress-bar" style="width:' + pct + '%"></div></div>' +
        '<div class="rt-stage-count">' + doneCount + '/' + total + '</div>' +
      '</div>' +
    '</button>';
  }).join('') + '</div>';

  var activeStage = RT_STAGES.find(function(s) { return s.id === state.activeStage; }) || RT_STAGES[0];
  var stageDone = state.stages[activeStage.id] || {};
  var activeNote = (state.notes && state.notes[activeStage.id]) || '';

  var detailHtml =
    '<div class="rt-detail">' +
      '<div class="rt-detail-head">' +
        '<div class="rt-detail-label">Stage ' + activeStage.icon + ' — ' + activeStage.label + '</div>' +
        '<div class="rt-detail-prompt">' + rtEsc(activeStage.prompt) + '</div>' +
      '</div>' +
      '<div class="rt-questions">' +
        activeStage.questions.map(function(q, i) {
          var checked = stageDone[i];
          return '<label class="rt-question' + (checked ? ' rt-q-done' : '') + '">' +
            '<input type="checkbox"' + (checked ? ' checked' : '') + ' onchange="rtToggleQuestion(\'' + activeStage.id + '\',' + i + ')">' +
            '<span class="rt-q-check"></span>' +
            '<span class="rt-q-text">' + rtEsc(q) + '</span>' +
          '</label>';
        }).join('') +
      '</div>' +
      '<div class="rt-note-wrap">' +
        '<label>Notes for this stage</label>' +
        '<textarea rows="3" placeholder="What you found at this layer..." oninput="rtUpdateNote(\'' + activeStage.id + '\',this.value)">' + rtEsc(activeNote) + '</textarea>' +
      '</div>' +
    '</div>';

  container.innerHTML = headerHtml + stagesHtml + detailHtml;
  rtRenderProgress(state);
}

rtApplyView();
