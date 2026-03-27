// ═══════════════════════════════════════════════════════
// KB BUILDER — Knowledge base template rendering
// ═══════════════════════════════════════════════════════

var currentKB = 0;
var kbStatus = 'draft';
var kbEdits = {};

function loadKB(idx, el) {
  currentKB = idx;
  kbStatus = 'draft';
  kbEdits = {};
  document.querySelectorAll('.kb-nav-item').forEach(function(n) { n.classList.remove('active'); });
  if (el) el.classList.add('active');
  renderKB();
}

function renderKB() {
  var t = kbTemplates[currentKB];
  var title = kbEdits.title || t.title;
  var desc = kbEdits.desc || t.desc;
  var steps = kbEdits.steps || [].concat(t.steps);
  var esc = kbEdits.escalation || t.escalation;

  document.getElementById('kbMain').innerHTML =
    '<div class="kb-header-row">' +
    '<div class="kb-status ' + (kbStatus === 'published' ? 'kb-status-published' : 'kb-status-draft') + '">' + (kbStatus === 'published' ? '\u25cf Published' : '\u25d0 Draft') + '</div>' +
    '<div class="kb-doc-meta"><span>\ud83d\udcc1 ' + t.cat + '</span><span>\ud83d\udd34 ' + t.severity + '</span></div>' +
    '</div>' +
    '<input class="kb-doc-title-input" value="' + title + '" oninput="kbEdits.title=this.value">' +
    '<div class="kb-field" style="margin-top:1rem"><label class="kb-label">Description</label><textarea class="kb-textarea" oninput="kbEdits.desc=this.value">' + desc + '</textarea></div>' +
    '<div class="kb-field"><label class="kb-label">Resolution Steps</label><div class="kb-steps">' +
    steps.map(function(s, i) {
      return '<div class="kb-step"><div class="kb-step-num">' + (i + 1) + '</div><textarea class="kb-step-input" rows="1" oninput="getSteps()[' + i + ']=this.value">' + s + '</textarea><div class="kb-step-actions"><button class="kb-step-btn del" onclick="removeStep(' + i + ')">\u2715</button></div></div>';
    }).join('') +
    '</div><div class="kb-add-step" onclick="addStep()">+ Add Step</div></div>' +
    '<div class="kb-field"><label class="kb-label">Escalation</label><div class="kb-escalation"><div class="kb-esc-label">When to Escalate</div><textarea class="kb-esc-input" oninput="kbEdits.escalation=this.value">' + esc + '</textarea></div></div>' +
    '<div class="kb-footer">' +
    '<button class="kb-btn kb-btn-save" onclick="kbStatus=\'draft\';renderKB();toast(\'Draft saved\')">\ud83d\udcbe Save</button>' +
    '<button class="kb-btn kb-btn-publish" onclick="kbStatus=\'published\';renderKB();toast(\'Published\')">\ud83d\ude80 Publish</button>' +
    '<button class="kb-btn kb-btn-copy" onclick="copyKB()">\ud83d\udccb Copy Docs</button>' +
    '</div>';
}

function getSteps() {
  if (!kbEdits.steps) kbEdits.steps = [].concat(kbTemplates[currentKB].steps);
  return kbEdits.steps;
}

function addStep() {
  getSteps().push('');
  renderKB();
}

function removeStep(i) {
  var s = getSteps();
  if (s.length > 1) { s.splice(i, 1); renderKB(); }
}

function copyKB() {
  var t = kbTemplates[currentKB];
  var md = '# ' + (kbEdits.title || t.title) + '\n\n' + (kbEdits.desc || t.desc) + '\n\n## Steps\n\n';
  (kbEdits.steps || t.steps).forEach(function(s, i) { md += (i + 1) + '. ' + s + '\n'; });
  md += '\n## Escalation\n\n' + (kbEdits.escalation || t.escalation);
  navigator.clipboard.writeText(md).then(function() { toast('Copied to clipboard'); }).catch(function() { toast('Copy failed'); });
}

loadKB(0, null);
