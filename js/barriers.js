// ═══════════════════════════════════════════════════════
// BARRIER INTELLIGENCE TOOLS
// Barrier cards, lifecycle, matrix, equity, correlator
// ═══════════════════════════════════════════════════════

// ── Personal barrier tracking: which barriers are active in your work ──
var BARRIERS_STATE_KEY = 'appanalyst.barriers.state.v1';

function barriersStateLoad() {
  try { return JSON.parse(localStorage.getItem(BARRIERS_STATE_KEY) || '{}'); }
  catch (e) { return {}; }
}
function barriersStateSave(s) { localStorage.setItem(BARRIERS_STATE_KEY, JSON.stringify(s)); }

function barrierToggleActive(n, ev) {
  if (ev) ev.stopPropagation();
  var s = barriersStateLoad();
  if (!s[n]) s[n] = {};
  s[n].active = !s[n].active;
  s[n].updated = new Date().toISOString();
  barriersStateSave(s);
  var card = document.querySelector('.b-card[data-barrier="' + n + '"]');
  if (card) {
    card.classList.toggle('b-active', s[n].active);
    var btn = card.querySelector('.b-active-btn');
    if (btn) btn.textContent = s[n].active ? '\u2713 Active concern' : '\u25CB Mark as active';
  }
  barriersUpdateSummary();
}

function barriersUpdateSummary() {
  var s = barriersStateLoad();
  var activeCount = Object.keys(s).filter(function(k) { return s[k].active; }).length;
  var summary = document.getElementById('barriersSummary');
  if (summary) {
    summary.innerHTML = activeCount > 0
      ? '<strong>' + activeCount + '</strong> barrier' + (activeCount === 1 ? '' : 's') + ' marked as active in your work'
      : 'Click <strong>Mark as active</strong> on any barrier below to track which are affecting your work right now.';
  }
}

// Render barrier cards
var bGrid = document.getElementById('bGrid');
var barriersInitState = barriersStateLoad();
barriers.forEach(function(b) {
  var card = document.createElement('div');
  var isActive = !!(barriersInitState[b.n] && barriersInitState[b.n].active);
  card.className = 'b-card b-sev-' + b.sev + (isActive ? ' b-active' : '');
  card.setAttribute('data-barrier', b.n);
  card.innerHTML =
    '<div class="b-head"><div class="b-num">' + b.n + '</div><div class="b-title">' + b.title + '</div>' +
    (b.ticketPct ? '<span style="font-family:var(--mono);font-size:.5rem;padding:.12rem .4rem;border-radius:100px;background:var(--bg-2);border:1px solid var(--border);color:var(--text-2);white-space:nowrap;margin-left:auto">~' + b.ticketPct + '% of tickets</span>' : '') +
    '<span class="b-cat">' + b.cat + '</span><div class="b-sev-dot"></div></div>' +
    '<div class="b-detail"><div class="b-detail-grid">' +
    '<div class="b-d-box"><div class="b-d-label lbl-red">The Barrier</div><div class="b-d-text">' + b.impact + '</div></div>' +
    '<div class="b-d-box"><div class="b-d-label lbl-grey">Who\'s Affected</div><div class="b-d-text">' + b.who + '</div></div>' +
    '<div class="b-d-box" style="background:var(--primary-light);border-color:var(--primary-bd)"><div class="b-d-label lbl-green">Analyst Approach</div><div class="b-d-text">' + b.approach + '</div></div>' +
    '</div>' +
    '<div class="b-actions">' +
      '<button class="b-active-btn" onclick="barrierToggleActive(' + b.n + ', event)">' + (isActive ? '\u2713 Active concern' : '\u25CB Mark as active') + '</button>' +
    '</div>' +
    '</div>';
  card.addEventListener('click', function() { card.classList.toggle('expanded'); });
  bGrid.appendChild(card);
});
barriersUpdateSummary();

// Lifecycle flow
// lcData is a global from js/data/barriers.js
var lcFlow = document.getElementById('lcFlow');
lcData.forEach(function(n) {
  var node = document.createElement('div');
  node.className = 'lc-node ' + n.cls;
  var tags = n.barriers.map(function(b) { return '<span class="lc-b-tag ' + b.c + '">' + b.t + '</span>'; }).join('');
  node.innerHTML = '<div class="lc-step">' + n.step + '</div><div class="lc-name">' + n.name + '</div><div class="lc-sub">' + n.sub + '</div>' + (tags ? '<div class="lc-barriers">' + tags + '</div>' : '');
  lcFlow.appendChild(node);
});

// Campus matrix
// matrixColleges is a global from js/data/barriers.js (renamed from 'colleges' to avoid collision with collegeDB)
var mFilters = document.getElementById('mFilters');
var activeMatrixFilter = 'All';

function renderMatrix(f) {
  var mBody = document.getElementById('mBody');
  mBody.innerHTML = '';
  var filtered = f === 'All' ? matrixColleges : matrixColleges.filter(function(c) { return c.sis === f; });
  filtered.forEach(function(c) {
    var tr = document.createElement('tr');
    var sisC = c.sis.indexOf('PeopleSoft') >= 0 ? 'm-sis-p' : c.sis.indexOf('Colleague') >= 0 ? 'm-sis-c' : c.sis.indexOf('Ethos') >= 0 ? 'm-sis-b' : 'm-sis-b';
    var faDot = c.fa === 'Full' ? 'm-dot-ok' : 'm-dot-pending';
    var ssoDot = c.sso === 'Active' ? 'm-dot-ok' : 'm-dot-partial';
    var issues = c.issues.map(function(i) { return '<span class="m-issue' + (i.indexOf('SAML') >= 0 || i.indexOf('Residency') >= 0 ? ' warn' : '') + '">' + i + '</span>'; }).join('') || '<span style="color:var(--text-3);font-size:.6rem">\u2014</span>';
    tr.innerHTML = '<td style="font-weight:600">' + c.name + '</td><td><span class="m-sis ' + sisC + '">' + c.sis + '</span></td><td><span class="m-dot ' + faDot + '"></span>' + c.fa + '</td><td><span class="m-dot ' + ssoDot + '"></span>' + c.sso + '</td><td>' + issues + '</td>';
    mBody.appendChild(tr);
  });
}

['All', 'Banner Direct', 'Banner Ethos', 'PeopleSoft', 'Colleague', 'Colleague Ethos'].forEach(function(f) {
  var btn = document.createElement('button');
  btn.className = 'm-btn' + (f === 'All' ? ' active' : '');
  btn.textContent = f;
  btn.addEventListener('click', function() {
    mFilters.querySelectorAll('.m-btn').forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    renderMatrix(f);
  });
  mFilters.appendChild(btn);
});
renderMatrix('All');

// Equity scorer
var eqGrid = document.getElementById('eqGrid');
eqData.forEach(function(e, i) {
  var card = document.createElement('div');
  card.className = 'eq-card';
  card.innerHTML = '<div class="eq-score eq-' + e.cls + '">' + e.score + '</div><div class="eq-title">' + e.title + '</div><div class="eq-pop">' + e.pop + '</div><div class="eq-bar-bg"><div class="eq-bar-fill fill-' + e.cls + '" style="width:0%"></div></div><div class="eq-reason">' + e.reason + '</div>';
  eqGrid.appendChild(card);
  setTimeout(function() { card.querySelector('.eq-bar-fill').style.width = e.pct + '%'; }, 200 + i * 100);
});

// Ticket correlator
var corrBody = document.getElementById('corrBody');
var totalT = corrData.reduce(function(a, c) { return a + c.count; }, 0);
var sp = document.createElement('p');
sp.style.cssText = 'font-family:var(--mono);font-size:.68rem;color:var(--text-3);margin-bottom:.75rem';
sp.textContent = totalT + ' total tickets \u00b7 Q1 2026 simulated \u00b7 ' + Math.round((corrData[0].count + corrData[1].count + corrData[2].count) / totalT * 100) + '% driven by top 3 barrier categories';
corrBody.appendChild(sp);
corrData.forEach(function(c, i) {
  var row = document.createElement('div');
  row.className = 'corr-row';
  row.innerHTML = '<span class="corr-label">' + c.label + '</span><div class="corr-bar-bg"><div class="corr-bar ' + c.cls + '" style="width:0%"></div></div><span class="corr-count">' + c.count + '</span><span class="corr-pct">' + c.pct + '%</span>';
  corrBody.appendChild(row);
  setTimeout(function() { row.querySelector('.corr-bar').style.width = (c.count / corrData[0].count * 100) + '%'; }, 300 + i * 80);
});

// Barrier stat counter animation on scroll
var dividerSec = document.querySelector('.divider-sec');
if (dividerSec) {
  var dsObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.ds-num').forEach(function(el) {
          var target = parseInt(el.textContent);
          if (isNaN(target)) return;
          var current = 0;
          var step = Math.max(1, Math.floor(target / 25));
          var iv = setInterval(function() { current += step; if (current >= target) { current = target; clearInterval(iv); } el.textContent = current; }, 40);
        });
        dsObs.unobserve(entry.target);
      }
    });
  }, { threshold: .3 });
  dsObs.observe(dividerSec);
}

// Barrier ticket % count-up
(function() {
  var bSection = document.getElementById('barrierOverview');
  if (!bSection) return;
  var animated = false;
  var bObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting && !animated) {
        animated = true;
        var badges = bSection.querySelectorAll('[style*="border-radius:100px"]');
        badges.forEach(function(badge) {
          var text = badge.textContent;
          var match = text.match(/(\d+)%/);
          if (match) {
            var target = parseInt(match[1]);
            var current = 0;
            var duration = 800 + target * 15;
            var start = performance.now();
            badge.textContent = '~0% of tickets';
            function tick(now) {
              var elapsed = now - start;
              var progress = Math.min(elapsed / duration, 1);
              var eased = 1 - Math.pow(1 - progress, 3);
              current = Math.round(target * eased);
              badge.textContent = '~' + current + '% of tickets';
              if (progress < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
          }
        });
        bObs.disconnect();
      }
    });
  }, { threshold: .2 });
  bObs.observe(bSection);
})();
