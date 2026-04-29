// ═══════════════════════════════════════════════════════
// TRIAGE COMPANION — Logic + render
// Pattern matching, workflow stage parsing, special-handling
// surfacing, reply drafting. All client-side, no backend.
// ═══════════════════════════════════════════════════════

(function() {
  'use strict';

  var STORAGE_KEY = 'appanalyst.triage.history.v1';
  var MAX_HISTORY = 10;

  // ── State ──
  var lastReplyText = '';
  var lastDiagnosis = null;

  // ── Helpers ──
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
    });
  }

  function el(id) { return document.getElementById(id); }

  function tcAliases(tc) {
    if (!tc) return [];
    if (triageCOLLEGE_ALIASES[tc]) return triageCOLLEGE_ALIASES[tc];
    var words = tc.split(/[\s.\-]+/);
    var skip = {college: 1, community: 1, ccd: 1, the: 1, of: 1, joint: 1};
    var out = [];
    for (var i = 0; i < words.length; i++) {
      var w = words[i].toLowerCase();
      if (w.length >= 4 && !skip[w]) out.push(w);
    }
    return out.slice(0, 2);
  }

  // ── Pattern matching ──
  function matchPatterns(errorText, status, timeline) {
    var blob = ((errorText || '') + ' ' + (status || '') + ' ' + (timeline || '')).toLowerCase();
    if (!blob.trim()) return [];
    var scored = [];
    for (var i = 0; i < triagePATTERNS.length; i++) {
      var p = triagePATTERNS[i];
      var score = 0;
      for (var j = 0; j < p.signals.length; j++) {
        if (blob.indexOf(p.signals[j].toLowerCase()) !== -1) score++;
      }
      if (score > 0) scored.push({score: score, pattern: p});
    }
    scored.sort(function(a, b) { return b.score - a.score; });
    return scored.slice(0, 3).map(function(s) { return s.pattern; });
  }

  // ── Workflow stage parsing ──
  function parseWorkflowStages(timeline) {
    if (!timeline) {
      return {stages: [], latestReached: 0, latestName: null, regression: false, failure: null, isTerminalSuccess: false};
    }
    var lower = timeline.toLowerCase();
    var reached = [];
    for (var i = 0; i < triageWORKFLOW_STAGES.length; i++) {
      var stage = triageWORKFLOW_STAGES[i];
      if (lower.indexOf(stage.toLowerCase()) !== -1) {
        reached.push({name: stage, index: i + 1});
      }
    }
    var failure = null;
    for (var f = 0; f < triageTERMINAL_FAILURES.length; f++) {
      if (lower.indexOf(triageTERMINAL_FAILURES[f].toLowerCase()) !== -1) {
        failure = triageTERMINAL_FAILURES[f];
        break;
      }
    }
    var regression = false;
    if (lower.indexOf('enrolled') !== -1) {
      var enrolledPos = lower.indexOf('enrolled');
      var prereqPos = lower.indexOf('prerequisite pending review');
      if (prereqPos > 0 && enrolledPos > 0 && prereqPos > enrolledPos) {
        regression = true;
      }
    }
    var latest = 0;
    for (var k = 0; k < reached.length; k++) {
      if (reached[k].index > latest) latest = reached[k].index;
    }
    return {
      stages: reached,
      latestReached: latest,
      latestName: latest > 0 ? triageWORKFLOW_STAGES[latest - 1] : null,
      regression: regression,
      failure: failure,
      isTerminalSuccess: latest === 8
    };
  }

  // ── Special handling lookup ──
  function getSpecialHandling(district) {
    if (!district) return [];
    // Try exact match first
    if (triageSPECIAL_HANDLING[district]) return triageSPECIAL_HANDLING[district];
    // Try fuzzy: match by first significant word
    var dl = district.toLowerCase();
    for (var key in triageSPECIAL_HANDLING) {
      if (triageSPECIAL_HANDLING.hasOwnProperty(key)) {
        var keyLower = key.toLowerCase();
        // Match if first 3 words of district appear in the key (or vice versa)
        var dWords = dl.split(/\s+/).slice(0, 3).join(' ');
        var kWords = keyLower.split(/\s+/).slice(0, 3).join(' ');
        if (dWords && (keyLower.indexOf(dWords) === 0 || dl.indexOf(kWords) === 0)) {
          return triageSPECIAL_HANDLING[key];
        }
      }
    }
    return [];
  }

  // ── Find district for a college name (uses collegeDB from js/data/colleges.js) ──
  function getDistrictForCollege(collegeName) {
    if (!collegeName || typeof collegeDB === 'undefined') return '';
    for (var i = 0; i < collegeDB.length; i++) {
      if (collegeDB[i].name === collegeName) return collegeDB[i].district || '';
    }
    return '';
  }

  function getSisForCollege(collegeName) {
    if (!collegeName || typeof collegeDB === 'undefined') return '';
    for (var i = 0; i < collegeDB.length; i++) {
      if (collegeDB[i].name === collegeName) return collegeDB[i].sis || '';
    }
    return '';
  }

  // ── BEAM env + term codes lookup (district-level) ──
  function getBeamForDistrict(district) {
    if (!district || typeof triageBEAM_BY_DISTRICT === 'undefined') return null;
    if (triageBEAM_BY_DISTRICT[district]) return triageBEAM_BY_DISTRICT[district];
    // Fuzzy match — district names sometimes drift (e.g., "CCD" vs "Community College District")
    var dl = district.toLowerCase();
    for (var key in triageBEAM_BY_DISTRICT) {
      if (triageBEAM_BY_DISTRICT.hasOwnProperty(key)) {
        var kl = key.toLowerCase();
        // Match if both share their first 2 significant words
        var dKey = dl.replace(/community college district|ccd|joint/g, '').trim();
        var kKey = kl.replace(/community college district|ccd|joint/g, '').trim();
        if (dKey && kKey && (dKey.indexOf(kKey.split(' ')[0]) === 0 || kKey.indexOf(dKey.split(' ')[0]) === 0)) {
          return triageBEAM_BY_DISTRICT[key];
        }
      }
    }
    return null;
  }

  // ── CCCID validation: 7 chars, 3 letters + 4 digits ──
  function validateCCCID(s) {
    if (!s) return {valid: null, msg: ''};
    var clean = s.trim().toUpperCase();
    if (/^[A-Z]{3}\d{4}$/.test(clean)) return {valid: true, normalized: clean, msg: 'OK'};
    return {valid: false, msg: 'CCCID is 3 letters + 4 digits (e.g., CRB4106). Got: ' + clean};
  }

  // ── Main diagnose ──
  function diagnose(payload) {
    var patterns = matchPatterns(payload.errorText || '', payload.status || '', payload.timeline || '');
    var primary = patterns.length ? patterns[0] : null;
    var workflow = parseWorkflowStages(payload.timeline || '');
    var district = getDistrictForCollege(payload.tc);
    var sis = getSisForCollege(payload.tc);
    var special = getSpecialHandling(district);

    var stageWarn = null;
    if ((payload.status || '').toLowerCase().indexOf('enrolled') !== -1 &&
        (payload.timeline || '').toLowerCase().indexOf('validated & registered') === -1) {
      stageWarn = "Status shows 'Enrolled' but 'Validated & Registered' is NOT in the timeline. " +
                  "'Enrolled' is stage 5 of 8 — registration was sent to TC's SIS but not confirmed. " +
                  "If timeline regressed to 'Prerequisite Pending Review' after 'Enrolled', this is the " +
                  "Owen / PICE-795 family — TC's Banner likely rejected the seat.";
    }

    var nextSteps = [];
    if (stageWarn) {
      nextSteps.push("Confirm in Admin Panel whether timeline reached 'Validated & Registered'. If not, the registration is stuck mid-flight, not complete.");
    }
    if (primary) {
      nextSteps.push('Pattern hypothesis: **' + primary.letter + ' — ' + primary.name + '**. ' + primary.summary);
    }
    if (sis && sis.toLowerCase().indexOf('banner direct') !== -1) {
      nextSteps.push('SIS is **Banner Direct** — known to produce stuck-Enrolled patterns. Run the local PICE lookup (`triage_lookup.sh "' + (tcAliases(payload.tc)[0] || '') + '" "<verbatim error>"`) before drafting a hypothesis.');
    }
    if (!nextSteps.length) {
      nextSteps.push('No clear pattern match. Run /triage Step 0d (PICE board lookup) manually, then Step 1 (Admin Panel timeline) before drafting reply.');
    }

    return {
      patterns: patterns,
      primary: primary,
      workflow: workflow,
      district: district,
      sis: sis,
      specialHandling: special,
      stageWarning: stageWarn,
      nextSteps: nextSteps,
      input: payload
    };
  }

  // ── Render diagnosis ──
  function renderDiagnosis(d) {
    var html = '';
    if (d.sis) {
      var badgeClass = 'tri-sis';
      if (d.sis.toLowerCase().indexOf('banner direct') !== -1) badgeClass += ' tri-sis-warn';
      html += '<div class="tri-meta-row"><span class="' + badgeClass + '">' + escapeHtml(d.sis) + '</span>';
      if (d.district) html += '<span class="tri-district">' + escapeHtml(d.district) + '</span>';
      html += '</div>';
    }
    if (d.workflow && d.workflow.stages.length) {
      html += '<h4>Workflow stage</h4>';
      html += renderWorkflowVisualizer(d.workflow);
    }
    if (d.stageWarning) {
      html += '<div class="tri-step tri-danger"><strong>Workflow alert.</strong> ' + escapeHtml(d.stageWarning) + '</div>';
    }
    if (d.specialHandling.length) {
      html += '<h4>Special handling — ' + escapeHtml(d.district) + '</h4>';
      for (var i = 0; i < d.specialHandling.length; i++) {
        html += '<div class="tri-step tri-warn">' + formatMd(d.specialHandling[i]) + '</div>';
      }
    }
    html += '<h4>Next steps</h4>';
    for (var s = 0; s < d.nextSteps.length; s++) {
      html += '<div class="tri-step">' + formatMd(d.nextSteps[s]) + '</div>';
    }
    if (d.primary) {
      html += '<h4>Pattern hypothesis</h4>';
      html += '<div class="tri-pattern-card">';
      html += '<span class="tri-letter">' + escapeHtml(d.primary.letter) + '</span> ';
      html += '<strong>' + escapeHtml(d.primary.name) + '</strong>';
      html += '<p>' + escapeHtml(d.primary.summary) + '</p>';
      if (triageREPLY_TEMPLATES[d.primary.letter]) {
        html += '<button type="button" class="tri-btn-secondary" onclick="triageGoToReply(\'' + escapeHtml(d.primary.letter) + '\')">Use this template in Reply Drafter →</button>';
      }
      html += '</div>';
      if (d.patterns.length > 1) {
        html += '<details style="margin-top:.6rem;"><summary>Other plausible patterns</summary><div style="margin-top:.4rem;">';
        for (var p = 1; p < d.patterns.length; p++) {
          html += '<div class="tri-pattern-card tri-pattern-alt"><span class="tri-letter">' + escapeHtml(d.patterns[p].letter) + '</span> <strong>' + escapeHtml(d.patterns[p].name) + '</strong><p>' + escapeHtml(d.patterns[p].summary) + '</p></div>';
        }
        html += '</div></details>';
      }
    } else {
      html += '<p class="tri-meta">No pattern matched the input. Check verbatim error spelling or review v7.2 Pattern Quick-Match manually.</p>';
    }
    return html;
  }

  function renderWorkflowVisualizer(w) {
    var allStages = triageWORKFLOW_STAGES;
    var reachedNames = {};
    for (var i = 0; i < w.stages.length; i++) reachedNames[w.stages[i].name] = true;
    var html = '<div class="tri-workflow">';
    for (var s = 0; s < allStages.length; s++) {
      var idx = s + 1;
      var name = allStages[s];
      var reached = reachedNames[name];
      var isLatest = w.latestReached === idx;
      var isTerminal = idx === 8;
      var cls = 'tri-wf-step';
      if (reached) cls += ' tri-wf-reached';
      if (isLatest) cls += ' tri-wf-current';
      if (isTerminal && reached) cls += ' tri-wf-success';
      if (idx === 5 && reached && !reachedNames['Validated & Registered']) cls += ' tri-wf-stuck';
      html += '<div class="' + cls + '"><span class="tri-wf-num">' + idx + '</span><span class="tri-wf-name">' + escapeHtml(name) + '</span></div>';
    }
    html += '</div>';
    if (w.failure) {
      html += '<div class="tri-step tri-danger" style="margin-top:.4rem;">Terminal failure detected: <strong>' + escapeHtml(w.failure) + '</strong></div>';
    } else if (w.isTerminalSuccess) {
      html += '<div class="tri-step tri-success" style="margin-top:.4rem;">Workflow reached <strong>Validated &amp; Registered</strong> — terminal success state.</div>';
    } else if (w.regression) {
      html += '<div class="tri-step tri-danger" style="margin-top:.4rem;"><strong>Workflow regression detected.</strong> "Prerequisite Pending Review" appears AFTER "Enrolled" in the timeline. This is the Banner-Direct rejected-seat pattern (Owen / PICE-795 family).</div>';
    }
    return html;
  }

  function formatMd(s) {
    var h = escapeHtml(s);
    h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    h = h.replace(/`([^`]+)`/g, '<code>$1</code>');
    return h;
  }

  // ── Reply rendering ──
  function renderReply(letter, slots) {
    var tpl = triageREPLY_TEMPLATES[letter];
    if (!tpl) return null;
    var name = (slots.name || '[Name]').trim() || '[Name]';
    var tc = (slots.tc || '[TC]').trim() || '[TC]';
    var hc = (slots.hc || '[HC]').trim() || '[HC]';
    var course = (slots.course || '[course]').trim() || '[course]';
    return tpl.replace(/\{NAME\}/g, name).replace(/\{TC\}/g, tc).replace(/\{HC\}/g, hc).replace(/\{COURSE\}/g, course);
  }

  // ── History (localStorage) ──
  function loadHistory() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch (e) { return []; }
  }
  function saveHistoryEntry(entry) {
    var h = loadHistory();
    h.unshift(entry);
    if (h.length > MAX_HISTORY) h = h.slice(0, MAX_HISTORY);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(h)); } catch (e) {}
  }
  function renderHistory() {
    var h = loadHistory();
    var box = el('triHistory');
    if (!box) return;
    if (!h.length) {
      box.innerHTML = '<p class="tri-meta">No recent triages yet. Run a diagnosis above and it\'ll show here.</p>';
      return;
    }
    var html = '<ul class="tri-history-list">';
    for (var i = 0; i < h.length; i++) {
      var e = h[i];
      var when = new Date(e.when).toLocaleString();
      var pat = e.primary ? e.primary.letter + ' — ' + e.primary.name : '(no match)';
      html += '<li><button type="button" class="tri-history-item" data-idx="' + i + '"><span class="tri-history-when">' + escapeHtml(when) + '</span><span class="tri-history-pat">' + escapeHtml(pat) + '</span><span class="tri-history-tc">' + escapeHtml(e.input.tc || '—') + '</span></button></li>';
    }
    html += '</ul>';
    box.innerHTML = html;
    box.querySelectorAll('.tri-history-item').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var idx = parseInt(btn.getAttribute('data-idx'), 10);
        var entry = loadHistory()[idx];
        if (entry) restoreFromHistory(entry);
      });
    });
  }
  function restoreFromHistory(entry) {
    el('triErr').value = entry.input.errorText || '';
    el('triStatus').value = entry.input.status || '';
    el('triTimeline').value = entry.input.timeline || '';
    el('triTC').value = entry.input.tc || '';
    el('triHC').value = entry.input.hc || '';
    document.querySelector('#triResult').innerHTML = renderDiagnosis(entry);
    document.querySelector('#triResult').scrollIntoView({behavior: 'smooth', block: 'start'});
    lastDiagnosis = entry;
  }

  // ── Tab switching ──
  function activateTab(name) {
    var tabs = document.querySelectorAll('.tri-tab-btn');
    var panels = document.querySelectorAll('.tri-tab-panel');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.toggle('tri-active', tabs[i].getAttribute('data-tab') === name);
    }
    for (var p = 0; p < panels.length; p++) {
      panels[p].style.display = (panels[p].getAttribute('data-tab') === name) ? 'block' : 'none';
    }
  }

  // ── Public: jump to reply with pattern preselected ──
  window.triageGoToReply = function(letter) {
    activateTab('reply');
    var sel = el('triRLetter');
    if (sel) sel.value = letter;
    // Try to carry over student context if available
    if (lastDiagnosis && lastDiagnosis.input) {
      if (lastDiagnosis.input.tc) el('triRTC').value = lastDiagnosis.input.tc;
      if (lastDiagnosis.input.hc) el('triRHC').value = lastDiagnosis.input.hc;
    }
    var nameField = el('triRName');
    if (nameField) nameField.focus();
  };

  // ── Render the section UI ──
  function renderSection() {
    var section = el('triage');
    if (!section) return;

    // Build college options from collegeDB (sorted)
    var collegeOpts = '<option value="">— pick or type —</option>';
    if (typeof collegeDB !== 'undefined') {
      var sorted = collegeDB.slice().sort(function(a, b) { return a.name.localeCompare(b.name); });
      for (var i = 0; i < sorted.length; i++) {
        var c = sorted[i];
        collegeOpts += '<option value="' + escapeHtml(c.name) + '">' + escapeHtml(c.name) + ' (' + escapeHtml(c.sis || '?') + ')</option>';
      }
    }

    // Reply pattern options
    var replyOpts = '<option value="">— pick a pattern —</option>';
    var letters = Object.keys(triageREPLY_TEMPLATES).sort();
    for (var l = 0; l < letters.length; l++) {
      replyOpts += '<option value="' + escapeHtml(letters[l]) + '">' + escapeHtml(letters[l]) + '</option>';
    }

    var html = '<div class="wrap">';
    html += '<header class="sec-head">';
    html += '<div class="sec-eyebrow">Triage Companion</div>';
    html += '<h2 class="sec-title">Diagnose, draft, dispatch.</h2>';
    html += '<p class="sec-dek">Mirror the v7.2 capture sentence, get a pattern hypothesis with workflow-stage analysis, special-handling notes for the TC\'s district, and a paste-ready reply with all your sign-off rules baked in. Runs entirely in your browser — saves history to localStorage.</p>';
    html += '</header>';

    // Tabs
    html += '<div class="tri-tabs" role="tablist">';
    html += '<button type="button" class="tri-tab-btn tri-active" data-tab="diagnose" role="tab">Diagnose</button>';
    html += '<button type="button" class="tri-tab-btn" data-tab="reply" role="tab">Reply Drafter</button>';
    html += '<button type="button" class="tri-tab-btn" data-tab="note" role="tab">Internal Note</button>';
    html += '<button type="button" class="tri-tab-btn" data-tab="history" role="tab">History</button>';
    html += '<button type="button" class="tri-tab-btn" data-tab="principles" role="tab">Principles</button>';
    html += '</div>';

    // ── Diagnose panel ──
    html += '<div class="tri-tab-panel" data-tab="diagnose" style="display:block;">';
    html += '<form id="triForm" class="tri-form">';
    html += '<div class="tri-grid">';
    html += '<div><label for="triCCCID">CCCID <span class="tri-hint">(optional)</span></label><input type="text" id="triCCCID" placeholder="e.g. CRB4106" maxlength="7"><span id="triCCCIDFeedback" class="tri-feedback"></span></div>';
    html += '<div><label for="triName">Student first name <span class="tri-hint">(optional)</span></label><input type="text" id="triName" placeholder="e.g. Owen"></div>';
    html += '<div><label for="triTC">Teaching College</label><select id="triTC">' + collegeOpts + '</select></div>';
    html += '<div><label for="triHC">Home College</label><select id="triHC">' + collegeOpts + '</select></div>';
    html += '<div class="tri-full" id="triTCContext" style="display:none;"></div>';
    html += '<div class="tri-full"><label for="triErr">Verbatim error string</label><input type="text" id="triErr" placeholder=\'e.g. "Closed To waitlist this class..." or "Canvas account not found"\'></div>';
    html += '<div class="tri-full"><label for="triStatus">Admin Panel — current Status (top-line)</label><input type="text" id="triStatus" placeholder=\'e.g. "Enrolled" or "Pending Person Match" or "Drop Failed"\'></div>';
    html += '<div class="tri-full"><label>Workflow stages reached <span class="tri-hint">(check what Admin Panel timeline shows)</span></label>';
    html += '<div class="tri-stage-checks">';
    for (var ws = 0; ws < triageWORKFLOW_STAGES.length; ws++) {
      html += '<label class="tri-stage-cb"><input type="checkbox" class="tri-stage-input" data-stage="' + escapeHtml(triageWORKFLOW_STAGES[ws]) + '"> <span>' + (ws + 1) + '. ' + escapeHtml(triageWORKFLOW_STAGES[ws]) + '</span></label>';
    }
    html += '</div>';
    html += '<details style="margin-top:.5rem;"><summary class="tri-meta">Or paste the verbatim timeline (overrides checkboxes)</summary>';
    html += '<textarea id="triTimeline" rows="3" placeholder="Created — 4/11&#10;Eligible and Approved — 4/11&#10;Enrolled — 4/11&#10;Prerequisite Pending Review — 4/16" style="margin-top:.4rem;"></textarea>';
    html += '</details></div>';
    html += '</div>';
    html += '<div class="tri-actions"><button type="submit" class="tri-btn-primary">Run diagnosis <span class="tri-kbd">⌘⏎</span></button><button type="reset" class="tri-btn-secondary">Clear</button></div>';
    html += '</form>';
    html += '<div id="triResult" class="tri-result"></div>';
    html += '</div>';

    // ── Reply panel ──
    html += '<div class="tri-tab-panel" data-tab="reply" style="display:none;">';
    html += '<form id="triReplyForm" class="tri-form">';
    html += '<div class="tri-grid">';
    html += '<div><label for="triRLetter">Pattern letter</label><select id="triRLetter">' + replyOpts + '</select></div>';
    html += '<div><label for="triRName">Student first name</label><input type="text" id="triRName" placeholder="e.g. Owen"></div>';
    html += '<div><label for="triRTC">Teaching College</label><select id="triRTC">' + collegeOpts + '</select></div>';
    html += '<div><label for="triRHC">Home College</label><select id="triRHC">' + collegeOpts + '</select></div>';
    html += '<div class="tri-full"><label for="triRCourse">Course identifier</label><input type="text" id="triRCourse" placeholder="e.g. STAT C1000 or MAT12"></div>';
    html += '</div>';
    html += '<div class="tri-actions"><button type="submit" class="tri-btn-primary">Generate reply</button><button type="button" id="triRCopy" class="tri-btn-secondary" disabled>Copy to clipboard</button><button type="reset" class="tri-btn-secondary">Clear</button></div>';
    html += '</form>';
    html += '<div id="triReplyResult" class="tri-result"></div>';
    html += '<div id="triChecklist" class="tri-checklist" style="display:none;"></div>';
    html += '</div>';

    // ── Internal Note panel ──
    html += '<div class="tri-tab-panel" data-tab="note" style="display:none;">';
    html += '<p class="tri-meta">Generates the 4-beat Freshservice internal note from your last diagnosis. Format mirrors v7\'s worked-case template (Situation / Action / Student-facing / Escalation).</p>';
    html += '<form id="triNoteForm" class="tri-form">';
    html += '<div class="tri-grid">';
    html += '<div class="tri-full"><label for="triNoteAction">What I just did <span class="tri-hint">(this triage step)</span></label><input type="text" id="triNoteAction" placeholder="e.g. Pulled Admin Panel record + ran diagnose; matched OWEN pattern → PICE-795."></div>';
    html += '<div class="tri-full"><label for="triNoteStudent">What I told the student <span class="tri-hint">(or "drafted reply, awaiting send")</span></label><input type="text" id="triNoteStudent" placeholder=\'e.g. "Section was full at registration. Directed to Course Finder for alternate."\'></div>';
    html += '<div class="tri-full"><label for="triNoteEsc">Escalation status</label><input type="text" id="triNoteEsc" placeholder=\'e.g. "Deferred to PICE-795 (Donna already has N2N ticket open). No new escalation."\'></div>';
    html += '</div>';
    html += '<div class="tri-actions"><button type="submit" class="tri-btn-primary">Generate note</button><button type="button" id="triNoteCopy" class="tri-btn-secondary" disabled>Copy to clipboard</button></div>';
    html += '</form>';
    html += '<div id="triNoteResult" class="tri-result"></div>';
    html += '</div>';

    // ── History panel ──
    html += '<div class="tri-tab-panel" data-tab="history" style="display:none;">';
    html += '<p class="tri-meta">Last ' + MAX_HISTORY + ' triages saved in your browser. Click any to restore.</p>';
    html += '<div id="triHistory"></div>';
    html += '</div>';

    // ── Principles panel ──
    html += '<div class="tri-tab-panel" data-tab="principles" style="display:none;">';
    html += '<div class="tri-principles-grid">';
    html += '<div class="tri-principles-card"><h3>Henry\'s 5 (load-bearing on every ticket)</h3><ol>';
    html += '<li>Treat student-stated reasons as hypotheses, not facts. Ask for the verbatim error before committing to a root cause.</li>';
    html += '<li>Verify against cvc.edu/students/student-eligibility/ before stating eligibility rules.</li>';
    html += "<li>Three-tool loop: Postman → Illuminate → Admin Panel (NOT Postman alone).</li>";
    html += '<li>Designed guardrails are features, not bugs. Before filing PICE, ask: is this protecting the student or system from a bad outcome?</li>';
    html += '<li>"Let me look that up for you" beats guessing. Promise a 1-business-day follow-up; come back with the answer.</li>';
    html += '</ol></div>';
    html += '<div class="tri-principles-card"><h3>Donna\'s 4 (apply on first-contact replies)</h3><ol>';
    html += '<li>Always acknowledge before explaining.</li>';
    html += "<li>Never make students feel like they did something wrong.</li>";
    html += '<li>Be specific (the exact form / page / email — not generic).</li>';
    html += '<li>"Let me look that up for you" beats guessing.</li>';
    html += '</ol></div>';
    html += '<div class="tri-principles-card"><h3>Pre-send checklist (5 questions every reply gets read against)</h3><ol>';
    for (var pc = 0; pc < triagePRESEND_CHECKLIST.length; pc++) {
      html += '<li>' + escapeHtml(triagePRESEND_CHECKLIST[pc]) + '</li>';
    }
    html += '</ol></div>';
    html += '<div class="tri-principles-card"><h3>Workflow stages — only stage 8 is terminal</h3><ol>';
    for (var ws = 0; ws < triageWORKFLOW_STAGES.length; ws++) {
      var marker = (ws === 4) ? ' <strong>(MISLEADING — not terminal)</strong>' : (ws === 7 ? ' <strong>(✓ terminal success)</strong>' : '');
      html += '<li>' + escapeHtml(triageWORKFLOW_STAGES[ws]) + marker + '</li>';
    }
    html += '</ol></div>';
    html += '</div>';
    html += '</div>';

    html += '</div>'; // wrap
    section.innerHTML = html;

    // ── Wire events ──
    document.querySelectorAll('.tri-tab-btn').forEach(function(btn) {
      btn.addEventListener('click', function() { activateTab(btn.getAttribute('data-tab')); if (btn.getAttribute('data-tab') === 'history') renderHistory(); });
    });

    // Build a synthetic timeline string from the stage checkboxes if no
    // textarea content is provided — gives the diagnostic engine the same
    // signal without requiring Henry to type.
    function buildTimelineFromCheckboxes() {
      var checked = document.querySelectorAll('.tri-stage-input:checked');
      if (!checked.length) return '';
      var lines = [];
      checked.forEach(function(cb) { lines.push(cb.getAttribute('data-stage')); });
      return lines.join('\n');
    }

    // Render the TC quick-context card on TC selection — district, SIS,
    // BEAM env, term codes, special-handling notes. No submit needed.
    function renderTCContext(tcName) {
      var box = el('triTCContext');
      if (!tcName) { box.style.display = 'none'; box.innerHTML = ''; return; }
      var district = getDistrictForCollege(tcName);
      var sis = getSisForCollege(tcName);
      var beam = getBeamForDistrict(district);
      var special = getSpecialHandling(district);
      var html = '<div class="tri-tc-context">';
      html += '<div class="tri-tc-context-row">';
      html += '<span class="tri-tc-context-label">SIS</span><span class="tri-sis' + (sis && sis.toLowerCase().indexOf('banner direct') !== -1 ? ' tri-sis-warn' : '') + '">' + escapeHtml(sis || '—') + '</span>';
      html += '<span class="tri-tc-context-label">District</span><span class="tri-district">' + escapeHtml(district || '—') + '</span>';
      html += '</div>';
      if (beam) {
        html += '<div class="tri-tc-context-row">';
        html += '<span class="tri-tc-context-label">BEAM env</span><code class="tri-code">' + escapeHtml(beam.env) + '</code>';
        if (beam.company) html += '<span class="tri-tc-context-label">Company</span><code class="tri-code">' + escapeHtml(beam.company) + '</code>';
        html += '</div>';
        if (beam.noTermCodes) {
          html += '<div class="tri-tc-context-row tri-meta"><em>BEAM term codes not in discovery scan — verify before relying on them.</em></div>';
        } else {
          html += '<div class="tri-tc-context-row">';
          if (beam.sp26) html += '<span class="tri-tc-context-label">Spring 2026</span><code class="tri-code">' + escapeHtml(beam.sp26) + '</code>';
          if (beam.su26) html += '<span class="tri-tc-context-label">Summer 2026</span><code class="tri-code">' + escapeHtml(beam.su26) + '</code>';
          if (beam.fa27) html += '<span class="tri-tc-context-label">Fall 2027</span><code class="tri-code">' + escapeHtml(beam.fa27) + '</code>';
          html += '</div>';
        }
      } else if (district) {
        html += '<div class="tri-tc-context-row tri-meta"><em>No BEAM env for this district. Likely not integrated, homegrown, or not in discovery scan.</em></div>';
      }
      if (special.length) {
        html += '<div class="tri-tc-context-special"><strong>Special handling:</strong><ul>';
        for (var i = 0; i < special.length; i++) html += '<li>' + escapeHtml(special[i]) + '</li>';
        html += '</ul></div>';
      }
      html += '</div>';
      box.innerHTML = html;
      box.style.display = 'block';
    }

    el('triTC').addEventListener('change', function() { renderTCContext(this.value); });

    // CCCID validation (live)
    el('triCCCID').addEventListener('input', function() {
      var fb = el('triCCCIDFeedback');
      var v = this.value;
      if (!v) { fb.textContent = ''; fb.className = 'tri-feedback'; return; }
      var r = validateCCCID(v);
      if (r.valid) {
        fb.textContent = '✓ ' + r.normalized;
        fb.className = 'tri-feedback tri-feedback-ok';
      } else if (r.valid === false) {
        fb.textContent = r.msg;
        fb.className = 'tri-feedback tri-feedback-warn';
      }
    });

    el('triForm').addEventListener('submit', function(e) {
      e.preventDefault();
      var timelineText = el('triTimeline').value || buildTimelineFromCheckboxes();
      var payload = {
        cccid: el('triCCCID').value,
        name: el('triName').value,
        tc: el('triTC').value,
        hc: el('triHC').value,
        errorText: el('triErr').value,
        status: el('triStatus').value,
        timeline: timelineText
      };
      var d = diagnose(payload);
      lastDiagnosis = d;
      el('triResult').innerHTML = renderDiagnosis(d);
      el('triResult').scrollIntoView({behavior: 'smooth', block: 'start'});
      // Save to history (only if there's some signal)
      if (payload.tc || payload.errorText || payload.status || payload.timeline || payload.cccid) {
        saveHistoryEntry({
          when: Date.now(),
          input: payload,
          primary: d.primary,
          patterns: d.patterns,
          workflow: d.workflow,
          district: d.district,
          sis: d.sis,
          specialHandling: d.specialHandling,
          stageWarning: d.stageWarning,
          nextSteps: d.nextSteps
        });
      }
    });

    // Keyboard shortcuts: Cmd/Ctrl+Enter submits diagnose form
    section.addEventListener('keydown', function(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        var activePanel = document.querySelector('.tri-tab-panel[style*="block"]');
        if (!activePanel) return;
        var form = activePanel.querySelector('form');
        if (form) {
          e.preventDefault();
          form.dispatchEvent(new Event('submit', {cancelable: true}));
        }
      }
    });

    el('triReplyForm').addEventListener('submit', function(e) {
      e.preventDefault();
      var letter = el('triRLetter').value;
      var slots = {
        name: el('triRName').value,
        tc: el('triRTC').value,
        hc: el('triRHC').value,
        course: el('triRCourse').value
      };
      var out = el('triReplyResult');
      var checklistBox = el('triChecklist');
      if (!letter) {
        out.innerHTML = '<p class="tri-meta">Pick a pattern first.</p>';
        checklistBox.style.display = 'none';
        return;
      }
      var text = renderReply(letter, slots);
      if (!text) {
        out.innerHTML = '<p class="tri-meta">No template for pattern ' + escapeHtml(letter) + '.</p>';
        checklistBox.style.display = 'none';
        return;
      }
      lastReplyText = text;
      out.innerHTML = '<pre class="tri-reply-out">' + escapeHtml(text) + '</pre><p class="tri-meta">' + text.length + ' characters.</p>';
      el('triRCopy').disabled = false;
      // Surface the pre-send checklist
      var clHtml = '<h4>Pre-send checklist — read every line before pasting</h4><ol class="tri-checklist-list">';
      for (var i = 0; i < triagePRESEND_CHECKLIST.length; i++) {
        clHtml += '<li><label><input type="checkbox" class="tri-cl-cb"> ' + escapeHtml(triagePRESEND_CHECKLIST[i]) + '</label></li>';
      }
      clHtml += '</ol>';
      checklistBox.innerHTML = clHtml;
      checklistBox.style.display = 'block';
    });

    el('triRCopy').addEventListener('click', function() {
      if (!lastReplyText) return;
      navigator.clipboard.writeText(lastReplyText).then(function() {
        var btn = el('triRCopy');
        var orig = btn.textContent;
        btn.textContent = '✓ Copied';
        setTimeout(function() { btn.textContent = orig; }, 2000);
      }).catch(function() { alert('Copy failed — select text manually.'); });
    });

    // ── Internal Note generator ──
    var lastNoteText = '';
    el('triNoteForm').addEventListener('submit', function(e) {
      e.preventDefault();
      var out = el('triNoteResult');
      if (!lastDiagnosis) {
        out.innerHTML = '<p class="tri-meta">Run a diagnosis first — the note pulls context from your latest one.</p>';
        return;
      }
      var d = lastDiagnosis;
      var input = d.input || {};
      var action = el('triNoteAction').value.trim() || '(fill in what you did)';
      var student = el('triNoteStudent').value.trim() || '(fill in what you told the student, or "drafted reply, not yet sent")';
      var esc = el('triNoteEsc').value.trim() || '(none)';
      var primaryLabel = d.primary ? (d.primary.letter + ' — ' + d.primary.name) : '(no clear pattern match)';
      var workflowSummary = '';
      if (d.workflow && d.workflow.latestName) {
        workflowSummary = 'Workflow at "' + d.workflow.latestName + '" (stage ' + d.workflow.latestReached + ' of 8)';
        if (d.workflow.regression) workflowSummary += ' — REGRESSION detected.';
        else if (d.workflow.isTerminalSuccess) workflowSummary += ' — terminal success.';
        else if (d.workflow.latestReached === 5) workflowSummary += ' — NOT terminal (Validated & Registered missing).';
      }
      var lines = [];
      lines.push('SITUATION');
      var situationParts = [];
      if (input.cccid) situationParts.push('CCCID: ' + input.cccid.toUpperCase());
      if (input.tc) situationParts.push('TC: ' + input.tc);
      if (input.hc) situationParts.push('HC: ' + input.hc);
      if (input.status) situationParts.push('Status: ' + input.status);
      if (input.errorText) situationParts.push('Error: ' + input.errorText);
      if (situationParts.length) lines.push('  ' + situationParts.join(' · '));
      if (workflowSummary) lines.push('  ' + workflowSummary);
      if (d.sis) lines.push('  SIS: ' + d.sis + (d.district ? ' (' + d.district + ')' : ''));
      lines.push('');
      lines.push('PATTERN');
      lines.push('  ' + primaryLabel);
      if (d.specialHandling && d.specialHandling.length) {
        lines.push('  Special handling notes for district:');
        for (var sh = 0; sh < d.specialHandling.length; sh++) lines.push('    · ' + d.specialHandling[sh]);
      }
      lines.push('');
      lines.push('ACTION');
      lines.push('  ' + action);
      lines.push('');
      lines.push('STUDENT-FACING');
      lines.push('  ' + student);
      lines.push('');
      lines.push('ESCALATION');
      lines.push('  ' + esc);
      var note = lines.join('\n');
      lastNoteText = note;
      out.innerHTML = '<pre class="tri-reply-out">' + escapeHtml(note) + '</pre><p class="tri-meta">' + note.length + ' characters · paste as a Freshservice internal note.</p>';
      el('triNoteCopy').disabled = false;
    });

    el('triNoteCopy').addEventListener('click', function() {
      if (!lastNoteText) return;
      navigator.clipboard.writeText(lastNoteText).then(function() {
        var btn = el('triNoteCopy');
        var orig = btn.textContent;
        btn.textContent = '✓ Copied';
        setTimeout(function() { btn.textContent = orig; }, 2000);
      }).catch(function() { alert('Copy failed — select text manually.'); });
    });
  }

  // ── Init on DOM ready ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderSection);
  } else {
    renderSection();
  }
})();
