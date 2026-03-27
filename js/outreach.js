// ═══════════════════════════════════════════════════════
// OUTREACH PLANNER — Calendar and trigger cards
// ═══════════════════════════════════════════════════════

var activeOutreachTab = 'all';
var activeCalMonth = 0;

function setOutreachTab(tab, el) {
  activeOutreachTab = tab;
  document.querySelectorAll('.outreach-tab').forEach(function(t) { t.classList.remove('active'); });
  if (el) el.classList.add('active');
  renderOutreachDetail();
}

function renderCalTimeline() {
  var el = document.getElementById('calTimeline');
  el.innerHTML = calMonths.map(function(m, i) {
    var dots = m.dots.map(function(d) { return '<div class="cal-dot ' + d + '"></div>'; }).join('');
    return '<div class="cal-month' + (i === activeCalMonth ? ' cal-active' : '') + '" onclick="selectMonth(' + i + ')">' +
      '<div class="cal-name">' + m.name + '</div><div class="cal-label">' + m.label + '</div><div class="cal-dots">' + dots + '</div></div>';
  }).join('');
}

function selectMonth(i) {
  activeCalMonth = i;
  renderCalTimeline();
  renderOutreachDetail();
}

function renderOutreachDetail() {
  var m = calMonths[activeCalMonth];
  var filtered = activeOutreachTab === 'all' ? m.triggers : m.triggers.filter(function(t) { return t.type === activeOutreachTab; });
  var el = document.getElementById('outreachDetail');
  if (!filtered.length) {
    el.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--text-3);font-size:.85rem">No ' + activeOutreachTab + ' triggers for ' + m.name + '. Try a different month or category.</div>';
    return;
  }
  var cards = filtered.map(function(t) {
    var impactTags = t.impact.map(function(tag) { return '<span class="tc-impact-tag">' + tag + '</span>'; }).join('');
    return '<div class="trigger-card tc-' + t.type + '" onclick="this.classList.toggle(\'tc-expanded\')">' +
      '<div class="tc-type">' + t.type + '</div><div class="tc-title">' + t.title + '</div><div class="tc-who">' + t.who + '</div>' +
      '<div class="tc-detail"><div class="tc-situation">' + t.situation + '</div><div class="tc-msg-label">Sample message</div><div class="tc-msg">' + t.msg + '</div><div class="tc-impact">' + impactTags + '</div></div></div>';
  }).join('');
  el.innerHTML = '<div class="od-header"><span class="od-month">' + m.name + '</span><span class="od-phase">' + m.phase + '</span></div><div class="od-body"><div class="trigger-cards">' + cards + '</div></div>';
}

renderCalTimeline();
renderOutreachDetail();

// Auto-set outreach to August on page load (more interesting than June)
setTimeout(function() {
  if (typeof selectMonth === 'function') selectMonth(2);
}, 100);
