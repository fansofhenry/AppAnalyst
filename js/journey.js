// ═══════════════════════════════════════════════════════
// JOURNEY — Student journey comparison view
// ═══════════════════════════════════════════════════════

var journeyMode = 'broken';

function setJourney(mode, el) {
  journeyMode = mode;
  document.querySelectorAll('.jt-btn').forEach(function(b) { b.classList.remove('active'); });
  if (el) {
    el.classList.add('active');
  } else {
    document.querySelectorAll('.jt-btn').forEach(function(b) {
      if (b.textContent.toLowerCase().indexOf(mode) >= 0 ||
          (mode === 'compare' && b.textContent.indexOf('Compare') >= 0)) {
        b.classList.add('active');
      }
    });
  }
  // Crossfade transition
  var jb = document.getElementById('journeyBody');
  if (jb) {
    jb.classList.add('j-fading');
    setTimeout(function() { renderJourney(); jb.classList.remove('j-fading'); }, 200);
  } else {
    renderJourney();
  }
}

function renderJourney() {
  var body = document.getElementById('journeyBody');

  if (journeyMode === 'compare') {
    var leftSteps = journeySteps.map(function(s) {
      return '<div class="journey-step ' + s.ok.cls + '"><div class="j-icon">' + s.ok.icon + '</div><div class="j-content"><div class="j-label">' + s.label + '</div><div class="j-text">' + s.ok.text + '</div><div class="j-student">' + s.ok.student + '</div></div></div>';
    }).join('');
    var rightSteps = journeySteps.map(function(s) {
      var analystNote = (s.broken.analyst) ? '<div style="margin-top:.35rem;padding:.3rem .5rem;background:var(--primary-light);border-radius:4px;border-left:2px solid var(--primary);font-size:.68rem;color:var(--primary);line-height:1.5;font-style:normal"><strong style="font-size:.52rem;letter-spacing:.06em;text-transform:uppercase;display:block;margin-bottom:.1rem;opacity:.7">Support response</strong>' + s.broken.analyst + '</div>' : '';
      return '<div class="journey-step ' + s.broken.cls + '"><div class="j-icon">' + s.broken.icon + '</div><div class="j-content"><div class="j-label">' + s.label + '</div><div class="j-text">' + s.broken.text + '</div><div class="j-student">' + s.broken.student + '</div>' + analystNote + ((s.broken.prevent) ? '<div style="margin-top:.25rem;padding:.3rem .5rem;background:var(--teal-light);border-radius:4px;border-left:2px solid var(--teal);font-size:.65rem;color:var(--teal);line-height:1.5;font-style:normal"><strong style="font-size:.5rem;letter-spacing:.06em;text-transform:uppercase;display:block;margin-bottom:.1rem;opacity:.7">Prevention</strong>' + s.broken.prevent + '</div>' : '') + '</div></div>';
    }).join('');
    body.innerHTML = '<div class="journey-cols"><div class="journey-col"><div class="journey-col-header jch-ok">\u2713 Successful Enrollment</div><div style="display:flex;gap:.75rem;justify-content:center;padding:.4rem .75rem;background:rgba(34,197,94,.06);border-bottom:1px solid var(--border);font-family:var(--mono);font-size:.55rem"><span style="color:var(--primary)">0 support interactions</span><span style="color:var(--text-3)">\u00b7</span><span style="color:var(--primary)">On-time transfer</span><span style="color:var(--text-3)">\u00b7</span><span style="color:var(--primary)">Course complete</span></div>' + leftSteps + '</div><div class="journey-col"><div class="journey-col-header jch-broken">\u2717 Broken Enrollment (Ethos token expired)</div><div style="display:flex;gap:.75rem;justify-content:center;padding:.4rem .75rem;background:rgba(220,38,38,.06);border-bottom:1px solid var(--border);font-family:var(--mono);font-size:.55rem"><span style="color:var(--red)">47 students affected</span><span style="color:var(--text-3)">\u00b7</span><span style="color:var(--amber)">36hr resolution</span><span style="color:var(--text-3)">\u00b7</span><span style="color:var(--text-2)">1 missed assignment deadline</span></div>' + rightSteps + '</div></div>';
  } else {
    var steps = journeySteps.map(function(s) {
      var data = journeyMode === 'ok' ? s.ok : s.broken;
      return '<div class="journey-step ' + data.cls + '" style="max-width:600px;margin:0 auto"><div class="j-icon">' + data.icon + '</div><div class="j-content"><div class="j-label">' + s.label + '</div><div class="j-text">' + data.text + '</div><div class="j-student">' + data.student + '</div></div></div>';
    }).join('');
    var headerCls = journeyMode === 'ok' ? 'jch-ok' : 'jch-broken';
    var headerText = journeyMode === 'ok' ? '\u2713 Successful Enrollment' : '\u2717 Broken Enrollment (Ethos token expired)</div><div style="display:flex;gap:.75rem;justify-content:center;padding:.4rem .75rem;background:rgba(220,38,38,.06);border-bottom:1px solid var(--border);font-family:var(--mono);font-size:.55rem"><span style="color:var(--red)">47 students affected</span><span style="color:var(--text-3)">\u00b7</span><span style="color:var(--amber)">36hr resolution</span><span style="color:var(--text-3)">\u00b7</span><span style="color:var(--text-2)">1 missed assignment deadline</span>';
    body.innerHTML = '<div style="border:1px solid var(--border);border-radius:var(--r-xl);overflow:hidden;max-width:600px;margin:0 auto"><div class="journey-col-header ' + headerCls + '">' + headerText + '</div>' + steps + '</div>';
  }
}

renderJourney();

// Journey cross-column highlight
(function() {
  var steps = document.querySelectorAll('.journey-step');
  steps.forEach(function(step, i) {
    step.addEventListener('mouseenter', function() {
      var allSteps = Array.from(document.querySelectorAll('.journey-step'));
      var myIdx = allSteps.indexOf(step);
      var totalPerCol = allSteps.length / 2;
      var pairIdx = myIdx < totalPerCol ? myIdx + totalPerCol : myIdx - totalPerCol;
      if (allSteps[pairIdx]) allSteps[pairIdx].classList.add('j-highlight');
    });
    step.addEventListener('mouseleave', function() {
      document.querySelectorAll('.journey-step').forEach(function(s) { s.classList.remove('j-highlight'); });
    });
  });
})();

// Tooltip system
var tipEl = document.createElement('div');
tipEl.className = 'tip';
document.body.appendChild(tipEl);

function showTip(e, html) {
  tipEl.innerHTML = html;
  tipEl.classList.add('show');
  var r = e.target.getBoundingClientRect();
  tipEl.style.left = (r.left + r.width / 2 - tipEl.offsetWidth / 2) + 'px';
  tipEl.style.top = (r.top - tipEl.offsetHeight - 8) + 'px';
}

function hideTip() {
  tipEl.classList.remove('show');
}

// Status indicator tooltips
document.querySelectorAll('.s-indicator').forEach(function(el) {
  var row = el.closest('.status-row');
  if (!row) return;
  var name = row.querySelector('.sr-name');
  var status = el.classList.contains('s-ok') ? 'Healthy' : el.classList.contains('s-warn') ? 'Degraded' : 'Failing';
  el.addEventListener('mouseenter', function(e) { showTip(e, '<strong>' + (name ? name.textContent : '') + '</strong> \u2014 ' + status); });
  el.addEventListener('mouseleave', hideTip);
});

// Closing question hover
document.querySelectorAll('div[style*="flex-direction:column"] > div[style*="padding:.55rem"]').forEach(function(card) {
  card.classList.add('q1-card');
});
