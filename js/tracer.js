// ═══════════════════════════════════════════════════════
// TRACER — Diagnostic trace through 5 layers
// ═══════════════════════════════════════════════════════

var currentStage = -1;
var autoRunning = false;
var _resolved = false;
var tracerElapsed = 0;
var tracerTimer = null;

function buildTracerFlow() {
  document.getElementById('tracerFlow').innerHTML = stages.map(function(_, i) {
    return '<div class="tf-node" onclick="setStage(' + i + ')">' +
      '<div class="tf-check">\u2713</div>' +
      '<div class="tf-num">Layer 0' + (i + 1) + '</div>' +
      '<div class="tf-name">' + ['User Report', 'SIS Query', 'API / Ethos', 'Exchange', 'Verify + Close'][i] + '</div>' +
      '<div class="tf-sub">' + ['Ticket intake', 'Banner record', 'Root cause found', 'Scope + escalate', 'Confirm resolution'][i] + '</div>' +
      '</div>';
  }).join('');
}
buildTracerFlow();

// MERGED: original setStage + analyst action badges wrapper + deploy button wrapper
function setStage(n) {
  currentStage = n;
  document.querySelectorAll('.tf-node').forEach(function(nd, i) {
    nd.classList.remove('active', 'error-node', 'passed');
    if (i < n) nd.classList.add('passed');
    else if (i === n) nd.classList.add(i === 2 ? 'error-node' : 'active');
  });

  var s = stages[n];
  var logHtml = s.lines.map(function(l, i) {
    return '<span class="log-line" style="animation-delay:' + i * 80 + 'ms">' +
      (l.ts ? '<span class="log-ts">[' + l.ts + ']</span> ' : '') +
      (l.cls ? '<span class="' + l.cls + '">' + l.text + '</span>' : l.text) +
      '</span>';
  }).join('');

  var actHtml = s.actions.map(function(a, i) {
    var isPrimary = i === s.actions.length - 1;
    var oc = isPrimary && n < 4 ? ' onclick="setStage(' + (n + 1) + ')"' :
             n === 4 && isPrimary ? ' onclick="toast(\'Ticket closed\')"' :
             ' onclick="toast(\'Logged\')"';
    return '<button class="td-btn' + (isPrimary ? ' td-btn-primary' : '') + '"' + oc + '>' + a + '</button>';
  }).join('');

  document.getElementById('tracerDetail').innerHTML =
    '<div class="td-header"><div class="td-icon ' + s.cls + '">' + s.icon + '</div><div class="td-title">' + s.title + '</div></div>' +
    '<div class="td-body"><div class="td-log">' + logHtml + '</div><div class="td-actions">' + actHtml + '</div></div>';

  document.getElementById('tracerStatus').textContent = 'Layer ' + (n + 1) + ' of 5';

  // Analyst action badge (from wrapper #1)
  var stage = stages[n];
  if (stage && stage.analyst) {
    var stageEls = document.querySelectorAll('.td-stage');
    if (stageEls[n]) {
      var existing = stageEls[n].querySelector('.tracer-action');
      if (!existing) {
        var badge = document.createElement('div');
        badge.className = 'tracer-action ' + (stage.analystCls || '');
        badge.innerHTML = '<strong>What I do:</strong> ' + stage.analyst;
        stageEls[n].appendChild(badge);
      }
    }
  }

  // Deploy button on final stage (from wrapper #2)
  if (n === 4 && !_resolved) {
    var actions = document.querySelector('#tracerDetail .td-actions');
    if (actions && !document.getElementById('deployFixBtn')) {
      var btn = document.createElement('button');
      btn.id = 'deployFixBtn';
      btn.className = 'deploy-fix-btn';
      btn.innerHTML = '\ud83d\udccb Escalate & Coordinate Resolution';
      btn.onclick = function() { deployFix(btn); };
      actions.parentElement.appendChild(btn);
    }
  }
}

// MERGED: original autoRunTrace + live indicators/phase labels wrapper
async function autoRunTrace() {
  if (autoRunning) return;
  autoRunning = true;

  // Add live indicator bar
  var tracerSection = document.getElementById('tracer');
  var existingLive = tracerSection.querySelector('.tracer-live');
  if (!existingLive) {
    var liveBar = document.createElement('div');
    liveBar.className = 'tracer-live';
    liveBar.id = 'tracerLive';
    liveBar.innerHTML = '<div class="tl-item tl-elapsed"><div class="tl-dot"></div> Elapsed: <span id="traceTime">0s</span></div><div class="tl-item tl-students"><div class="tl-dot"></div> Students waiting: <span id="traceStudents">47</span></div><div class="tl-status" id="tracePhase">Initializing...</div>';
    var toolBody = tracerSection.querySelector('.tool-body');
    if (toolBody) toolBody.insertBefore(liveBar, toolBody.firstChild);
  }

  // Start elapsed timer
  tracerElapsed = 0;
  if (tracerTimer) clearInterval(tracerTimer);
  tracerTimer = setInterval(function() {
    tracerElapsed++;
    var el = document.getElementById('traceTime');
    if (el) el.textContent = tracerElapsed + 's';
  }, 1000);

  // Phase labels for each stage
  var phases = ['Querying home SIS...', 'Checking Ethos API...', 'Scanning Exchange queue...', 'Verifying Canvas roster...', 'Compiling results...'];

  currentStage = -1;
  var btn = document.getElementById('autoRunBtn');
  btn.disabled = true;
  btn.textContent = '\u23f3 Running...';
  btn.classList.add('running');
  document.getElementById('tracerStatus').textContent = 'Running...';

  for (var i = 0; i < 5; i++) {
    var phaseEl = document.getElementById('tracePhase');
    if (phaseEl) phaseEl.textContent = phases[i] || 'Processing...';
    setStage(i);
    await new Promise(function(r) { setTimeout(r, 1200); });
  }

  btn.disabled = false;
  btn.textContent = '\u25b6 Auto-Run Trace';
  btn.classList.remove('running');
  autoRunning = false;
  document.getElementById('tracerStatus').textContent = 'Diagnosis complete \u2014 6.2s';
  if (tracerTimer) clearInterval(tracerTimer);
  var phaseEl2 = document.getElementById('tracePhase');
  if (phaseEl2) phaseEl2.innerHTML = '<span class="trace-found" style="color:var(--primary)">\u2713 Root cause: Ethos token expiration \u2014 Layer 3</span>';
}

function resetTrace() {
  currentStage = -1;
  document.querySelectorAll('.tf-node').forEach(function(n) { n.classList.remove('active', 'error-node', 'passed'); });
  document.getElementById('tracerDetail').innerHTML = '<div style="padding:1.25rem"><div style="display:flex;gap:.75rem;align-items:flex-start"><div style="width:28px;height:28px;border-radius:50%;background:var(--amber-light);border:1.5px solid var(--amber-bd);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:.75rem">\ud83d\udccb</div><div><div style="font-weight:600;font-size:.85rem;color:var(--text);margin-bottom:.2rem">Scenario: Student at Chabot can\u2019t see MATH 1A in Canvas</div><div style="font-size:.78rem;color:var(--text-2);line-height:1.6">Cross-enrolled via the CVC Exchange into a section at De Anza. Home SIS shows enrollment. Canvas dashboard does not. The tracer walks through each layer to isolate where the data flow broke.</div><div style="margin-top:.5rem;font-family:var(--mono);font-size:.6rem;color:var(--text-3)">Click any layer above, or press <strong>Auto-Run Trace</strong> to step through all 5.</div></div></div></div>';
  document.getElementById('tracerStatus').textContent = 'Ready';
}
resetTrace();

// Tracer scenario headline
(function() {
  var tracerToolBody = document.querySelector('#tracer .tool-body');
  if (tracerToolBody) {
    var headline = document.createElement('div');
    headline.className = 'tracer-scenario';
    headline.innerHTML = '<div class="tracer-scenario-title">Student cross-enrolled in MATH 1A but missing from Canvas</div><div class="tracer-scenario-meta">Sacramento City (Banner Ethos) \u2192 De Anza (Banner Direct) \u00b7 47 students affected \u00b7 Reported 8:32 AM</div>';
    tracerToolBody.insertBefore(headline, tracerToolBody.firstChild);
  }
})();

// Auto-complete observer — inject deploy button when auto-run reaches end
(function() {
  var obs = new MutationObserver(function() {
    var status = document.getElementById('tracerStatus');
    if (status && status.textContent === 'Layer 5 of 5' && !_resolved && !document.getElementById('deployFixBtn')) {
      var actions = document.querySelector('#tracerDetail .td-actions');
      if (actions) {
        var btn = document.createElement('button');
        btn.id = 'deployFixBtn';
        btn.className = 'deploy-fix-btn';
        btn.innerHTML = '\ud83d\udccb Escalate & Coordinate Resolution';
        btn.onclick = function() { deployFix(btn); };
        actions.parentElement.appendChild(btn);
      }
    }
  });
  var statusEl = document.getElementById('tracerStatus');
  if (statusEl) obs.observe(statusEl, { childList: true, characterData: true, subtree: true });
})();

// ═══ LIVE RESOLUTION — Escalate & Coordinate ═══
function deployFix(btn) {
  if (_resolved) return;
  _resolved = true;

  // Phase 1: Escalation sent
  btn.classList.add('deploying');
  btn.innerHTML = '\u23f3 Escalating to Sacramento City IT + Ellucian...';
  btn.style.pointerEvents = 'none';

  setTimeout(function() {
    // Phase 2: Waiting for campus IT
    btn.innerHTML = '\u23f3 Waiting for campus IT confirmation...';
    toast('Escalation sent \u2014 P2 ServiceNow case opened');
  }, 1200);

  setTimeout(function() {
    // Phase 3: Campus IT confirms fix
    btn.innerHTML = '\u23f3 Campus IT confirmed \u2014 verifying queue drain...';
    toast('Sacramento City IT: Token regenerated');
  }, 2800);

  setTimeout(function() {
    // Phase 4: Resolution confirmed
    btn.classList.remove('deploying');
    btn.classList.add('deployed');
    btn.innerHTML = '\u2713 Resolved \u2014 Verified in Canvas \u00b7 KB article drafted';

    // Update Sacramento City in allColleges data
    for (var i = 0; i < allColleges.length; i++) {
      if (allColleges[i].name === 'Sacramento City College') {
        allColleges[i].status = 'ok';
        allColleges[i].badge = 'Healthy';
        allColleges[i].detail = 'Token regenerated by campus IT \u00b7 Queue drained \u00b7 Verified';
        allColleges[i].uptime = '99.2%';
        allColleges[i].lastErr = 'Resolved (just now)';
        allColleges[i].history = [
          '09:42 \u2014 Ticket CVC-4821 closed',
          '09:38 \u2014 Student canvas access CONFIRMED',
          '09:35 \u2014 47/47 AER records transmitted',
          '09:32 \u2014 Sacramento City IT: Token regenerated',
          '09:25 \u2014 P2 escalation sent to campus IT + Ellucian'
        ];
        break;
      }
    }

    // Re-render monitor
    renderMonitor();

    // Flash summary cells
    setTimeout(function() {
      document.querySelectorAll('.ms-cell').forEach(function(cell) {
        cell.classList.add('cell-updated');
        setTimeout(function() { cell.classList.remove('cell-updated'); }, 1200);
      });
    }, 100);

    // Show resolution banner
    setTimeout(function() {
      var banner = document.getElementById('resolutionBanner');
      if (banner) banner.classList.add('rb-show');
    }, 400);

    // Switch journey to "Successful Only"
    setTimeout(function() {
      var okBtn = null;
      document.querySelectorAll('.jt-btn').forEach(function(b) {
        if (b.textContent.indexOf('Successful') >= 0) okBtn = b;
      });
      if (okBtn) {
        setJourney('ok', okBtn);
        setTimeout(function() {
          var jHeader = document.querySelector('.jch-ok');
          if (jHeader && !jHeader.querySelector('.j-resolved-tag')) {
            var tag = document.createElement('span');
            tag.className = 'j-resolved-tag';
            tag.textContent = '\u2713 RESOLVED';
            jHeader.appendChild(tag);
          }
        }, 350);
      }
    }, 800);

    // Dismiss live alert
    var alertEl = document.getElementById('liveAlert');
    if (alertEl && alertEl.classList.contains('show')) {
      var alertBody = alertEl.querySelector('.live-alert-body');
      if (alertBody && alertBody.innerHTML.indexOf('Sacramento') >= 0) {
        alertEl.classList.remove('show');
      }
    }

    // Update P2 ACTIVE to RESOLVED
    document.querySelectorAll('.sec').forEach(function(sec) {
      var spans = sec.querySelectorAll('span');
      spans.forEach(function(sp) {
        if (sp.textContent === 'P2 ACTIVE') {
          sp.textContent = 'RESOLVED';
          sp.style.color = 'var(--primary)';
          if (sp.previousElementSibling) sp.previousElementSibling.style.background = 'var(--primary)';
        }
      });
    });

    toast('Ticket CVC-4821 closed \u2014 47 students confirmed in Canvas');

    // Mark tracer nodes
    document.querySelectorAll('.tf-node').forEach(function(nd) {
      nd.classList.remove('active', 'error-node');
      nd.classList.add('passed');
    });

  }, 4200);
}
