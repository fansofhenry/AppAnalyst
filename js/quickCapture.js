// ═══════════════════════════════════════════════════════
// QUICK CAPTURE — Minimal popover for fast ticket logging.
// Press N anywhere to open; fill 3 fields; Enter to save.
// ═══════════════════════════════════════════════════════

var QC_OPEN = false;

function qcOpen() {
  if (QC_OPEN) return;
  var modal = document.getElementById('quickCaptureModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'quickCaptureModal';
    modal.className = 'qc-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-label', 'Quick capture ticket');
    modal.addEventListener('click', function(e) { if (e.target === modal) qcClose(); });
    document.body.appendChild(modal);
  }

  var systems = typeof TL_SYSTEMS !== 'undefined'
    ? TL_SYSTEMS
    : ['Banner Direct', 'Banner Ethos', 'Colleague Ethos', 'PeopleSoft', 'CCCApply', 'Canvas', 'SSO / IdP', 'Other'];

  modal.innerHTML =
    '<div class="qc-modal" role="document">' +
      '<div class="qc-head">' +
        '<span class="qc-title">Quick capture</span>' +
        '<button class="qc-close" onclick="qcClose()" aria-label="Close">&times;</button>' +
      '</div>' +
      '<div class="qc-form">' +
        '<div class="qc-field">' +
          '<label for="qcCollege">College</label>' +
          '<input type="text" id="qcCollege" placeholder="e.g. De Anza College" list="qcCollegeList">' +
          '<datalist id="qcCollegeList">' +
            (typeof collegeDB !== 'undefined' ? collegeDB.map(function(c) { return '<option value="' + c.name.replace(/"/g, '&quot;') + '">'; }).join('') : '') +
          '</datalist>' +
        '</div>' +
        '<div class="qc-field">' +
          '<label for="qcSystem">System</label>' +
          '<select id="qcSystem">' +
            systems.map(function(s) { return '<option>' + s + '</option>'; }).join('') +
          '</select>' +
        '</div>' +
        '<div class="qc-field qc-field-full">' +
          '<label for="qcSymptom">Symptom</label>' +
          '<input type="text" id="qcSymptom" placeholder="What the user reported">' +
        '</div>' +
      '</div>' +
      '<div class="qc-actions">' +
        '<span class="qc-hint">Press <kbd>\u23CE</kbd> to save and close</span>' +
        '<button class="tl-btn" onclick="qcClose()">Cancel</button>' +
        '<button class="tl-btn tl-btn-new" onclick="qcSave()">Save</button>' +
      '</div>' +
    '</div>';

  modal.classList.add('qc-show');
  QC_OPEN = true;
  setTimeout(function() {
    var input = document.getElementById('qcCollege');
    if (input) input.focus();
  }, 20);

  // Enter to save (except in a select)
  modal.addEventListener('keydown', qcKeyHandler);
}

function qcKeyHandler(e) {
  if (e.key === 'Enter' && e.target.tagName !== 'SELECT' && e.target.tagName !== 'BUTTON') {
    e.preventDefault();
    qcSave();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    qcClose();
  }
}

function qcSave() {
  if (typeof tlLoad !== 'function' || typeof tlSave !== 'function' || typeof tlNewBlank !== 'function') {
    toast('Ticket log not loaded');
    qcClose();
    return;
  }
  var college = (document.getElementById('qcCollege') || {}).value || '';
  var system = (document.getElementById('qcSystem') || {}).value || 'Other';
  var symptom = (document.getElementById('qcSymptom') || {}).value || '';

  if (!symptom.trim()) {
    var input = document.getElementById('qcSymptom');
    if (input) input.focus();
    toast('Symptom is required');
    return;
  }

  var list = tlLoad();
  var ticket = tlNewBlank();
  ticket.college = college.trim();
  ticket.system = system;
  ticket.symptom = symptom.trim();
  list.unshift(ticket);
  tlSave(list);
  if (typeof tlRender === 'function') tlRender();
  if (typeof todayRender === 'function') todayRender();
  qcClose();
  toast('Logged: ' + symptom.trim().slice(0, 50));
}

function qcClose() {
  var modal = document.getElementById('quickCaptureModal');
  if (modal) {
    modal.classList.remove('qc-show');
    modal.removeEventListener('keydown', qcKeyHandler);
  }
  QC_OPEN = false;
}

// Hook into the N shortcut — override the existing behavior
// when not inside an input/textarea/select
document.addEventListener('keydown', function(e) {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key !== 'n' && e.key !== 'N') return;
  var tag = e.target && e.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  // If a modal is already open, bail
  if (document.querySelector('.welcome-overlay.welcome-show, .search-overlay.search-show, .backup-overlay.backup-show, .packet-overlay.packet-show')) return;
  e.preventDefault();
  e.stopPropagation();
  qcOpen();
}, true);  // Capture phase so we beat the other N handler
