// ═══════════════════════════════════════════════════════
// ANNUAL REVIEW — Year-in-review reflection tool. Pick a
// year, get a printable summary of your work that year.
// Useful for performance reviews, self-reflection, or
// handing off a year of context to a successor.
// ═══════════════════════════════════════════════════════

function arvEsc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function arvFmtTime(hours) {
  if (!hours || hours < 0) return '\u2014';
  if (hours < 1) return Math.round(hours * 60) + 'm';
  if (hours < 24) return hours.toFixed(1).replace(/\.0$/, '') + 'h';
  return (hours / 24).toFixed(1).replace(/\.0$/, '') + 'd';
}

function arvMedian(nums) {
  if (!nums.length) return 0;
  var s = nums.slice().sort(function(a, b) { return a - b; });
  var m = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[m - 1] + s[m]) / 2 : s[m];
}

function arvInYear(iso, year) {
  try {
    return new Date(iso).getFullYear() === year;
  } catch (e) { return false; }
}

function arvGenerate(year) {
  if (!year) {
    year = parseInt(prompt('Generate annual review for which year?', String(new Date().getFullYear())), 10);
    if (isNaN(year)) return;
  }

  var tickets = [];
  var kb = [];
  var overlay = {};
  var onboarding = [];
  var outreach = [];
  try { tickets = JSON.parse(localStorage.getItem('appanalyst.tickets.v1') || '[]'); } catch (e) {}
  try { kb = JSON.parse(localStorage.getItem('appanalyst.kb.v1') || '[]'); } catch (e) {}
  try { overlay = JSON.parse(localStorage.getItem('appanalyst.colleges.overlay.v1') || '{}'); } catch (e) {}
  try { onboarding = JSON.parse(localStorage.getItem('appanalyst.onboarding.v1') || '[]'); } catch (e) {}
  try { outreach = JSON.parse(localStorage.getItem('appanalyst.outreach.v1') || '[]'); } catch (e) {}

  // ── Scope by year ─────────────────────────────
  var yearTickets = tickets.filter(function(t) { return arvInYear(t.created, year); });
  var yearResolved = tickets.filter(function(t) {
    return t.status === 'resolved' && arvInYear(t.updated || t.created, year);
  });
  var yearKb = kb.filter(function(e) { return arvInYear(e.updated || 0, year); });
  var yearOnboarding = onboarding.filter(function(i) { return i.done && i.doneAt && arvInYear(i.doneAt, year); });
  var yearOutreachDone = outreach.filter(function(e) {
    return e.status === 'done' && arvInYear(e.updated, year);
  });

  // Resolution time
  var resolutionHours = yearResolved.map(function(t) {
    return Math.max(0, (new Date(t.updated || t.created).getTime() - new Date(t.created).getTime()) / 3600000);
  });
  var medianHours = arvMedian(resolutionHours);

  // By system
  var bySystem = {};
  yearTickets.forEach(function(t) {
    if (!t.system) return;
    bySystem[t.system] = (bySystem[t.system] || 0) + 1;
  });
  var topSystems = Object.keys(bySystem).map(function(k) {
    return { name: k, count: bySystem[k] };
  }).sort(function(a, b) { return b.count - a.count; }).slice(0, 5);

  // By college
  var byCollege = {};
  yearTickets.forEach(function(t) {
    var k = t.college || '(unassigned)';
    byCollege[k] = (byCollege[k] || 0) + 1;
  });
  var topColleges = Object.keys(byCollege).map(function(k) {
    return { name: k, count: byCollege[k] };
  }).sort(function(a, b) { return b.count - a.count; }).slice(0, 5);

  // Colleges touched (noted overlay)
  var collegesTouchedThisYear = Object.keys(overlay).filter(function(name) {
    return overlay[name].updated && arvInYear(overlay[name].updated, year);
  }).length;

  // Tickets per month
  var byMonth = Array(12).fill(0);
  yearTickets.forEach(function(t) {
    try {
      var m = new Date(t.created).getMonth();
      byMonth[m]++;
    } catch (e) {}
  });

  // Busiest week (approximate: week with most tickets opened)
  var byWeek = {};
  yearTickets.forEach(function(t) {
    try {
      var d = new Date(t.created);
      var onejan = new Date(d.getFullYear(), 0, 1);
      var week = Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
      var key = d.getFullYear() + '-W' + String(week).padStart(2, '0');
      byWeek[key] = (byWeek[key] || 0) + 1;
    } catch (e) {}
  });
  var busiest = Object.keys(byWeek).map(function(k) { return { week: k, count: byWeek[k] }; })
    .sort(function(a, b) { return b.count - a.count; })[0];

  // ── Build HTML ────────────────────────────────
  var monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var maxMonth = Math.max.apply(null, byMonth);

  var barsHtml = byMonth.map(function(count, i) {
    var pct = maxMonth > 0 ? (count / maxMonth) * 100 : 0;
    return '<div class="arv-bar-wrap">' +
      '<div class="arv-bar" style="height:' + pct + '%"></div>' +
      '<div class="arv-bar-count">' + count + '</div>' +
      '<div class="arv-bar-label">' + monthNames[i] + '</div>' +
    '</div>';
  }).join('');

  var systemBars = topSystems.length > 0 ? topSystems.map(function(s) {
    var pct = topSystems[0].count > 0 ? (s.count / topSystems[0].count) * 100 : 0;
    return '<div class="arv-row"><div class="arv-row-label">' + arvEsc(s.name) + '</div><div class="arv-row-track"><div class="arv-row-fill" style="width:' + pct + '%"></div></div><div class="arv-row-count">' + s.count + '</div></div>';
  }).join('') : '<p>No system data recorded.</p>';

  var collegeBars = topColleges.length > 0 ? topColleges.map(function(c) {
    var pct = topColleges[0].count > 0 ? (c.count / topColleges[0].count) * 100 : 0;
    return '<div class="arv-row"><div class="arv-row-label">' + arvEsc(c.name) + '</div><div class="arv-row-track"><div class="arv-row-fill arv-fill-amber" style="width:' + pct + '%"></div></div><div class="arv-row-count">' + c.count + '</div></div>';
  }).join('') : '<p>No college data recorded.</p>';

  var hasData = yearTickets.length + yearKb.length + yearOnboarding.length + yearOutreachDone.length > 0;

  var w = window.open('', 'arv-' + year, 'width=900,height=1200');
  if (!w) { toast('Popup blocked'); return; }

  var styles = '<style>' +
    '@media print { @page { size: letter; margin: .5in; } }' +
    'body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 740px; margin: 0 auto; padding: 2rem 1.5rem; color: #1a1815; line-height: 1.55; }' +
    '.arv-head { text-align: center; padding-bottom: 1rem; border-bottom: 3px double #0F766E; margin-bottom: 1.25rem; }' +
    '.arv-brand { font-size: .7rem; text-transform: uppercase; letter-spacing: .12em; color: #0F766E; font-weight: 700; }' +
    'h1 { font-family: serif; font-size: 2.25rem; margin: .35rem 0 .15rem; font-weight: 700; }' +
    '.arv-subtitle { font-size: .85rem; color: #666; font-style: italic; }' +
    '.arv-section { margin-bottom: 1.75rem; break-inside: avoid; }' +
    '.arv-section h2 { font-size: 1.1rem; margin: 0 0 .7rem; padding-bottom: .35rem; border-bottom: 1px solid #ddd; font-weight: 700; color: #0F766E; }' +
    '.arv-headline-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: .8rem; margin: 1.1rem 0 1.5rem; }' +
    '.arv-headline-stats > div { padding: .95rem .6rem; background: #f5f4f1; border-radius: 6px; text-align: center; }' +
    '.arv-headline-stats strong { display: block; font-size: 1.8rem; font-weight: 700; color: #0F766E; }' +
    '.arv-headline-stats .arv-stat-label { font-size: .6rem; text-transform: uppercase; letter-spacing: .05em; color: #666; margin-top: .25rem; }' +
    '.arv-months { display: grid; grid-template-columns: repeat(12, 1fr); gap: .35rem; height: 120px; align-items: end; margin-top: .8rem; }' +
    '.arv-bar-wrap { display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }' +
    '.arv-bar { width: 100%; background: #0F766E; border-radius: 2px 2px 0 0; min-height: 1px; }' +
    '.arv-bar-count { font-size: .58rem; color: #666; margin-top: .15rem; }' +
    '.arv-bar-label { font-size: .56rem; color: #888; font-family: monospace; margin-top: .1rem; }' +
    '.arv-row { display: grid; grid-template-columns: 160px 1fr 36px; gap: .6rem; align-items: center; padding: .3rem 0; font-size: .78rem; }' +
    '.arv-row-label { text-align: right; color: #333; }' +
    '.arv-row-track { height: 14px; background: #f5f4f1; border-radius: 3px; overflow: hidden; }' +
    '.arv-row-fill { height: 100%; background: #1D4ED8; }' +
    '.arv-fill-amber { background: #A16207; }' +
    '.arv-row-count { text-align: right; font-weight: 700; font-family: monospace; font-size: .72rem; }' +
    '.arv-reflection { padding: 1rem 1.25rem; background: #EFF6FF; border-left: 3px solid #1D4ED8; border-radius: 4px; margin: 1rem 0 0; font-size: .82rem; line-height: 1.6; }' +
    '.arv-reflection h3 { margin: 0 0 .5rem; font-size: .9rem; color: #1D4ED8; }' +
    '.arv-empty { padding: 2rem; text-align: center; color: #666; background: #f5f4f1; border-radius: 6px; font-style: italic; }' +
    '.arv-foot { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #ddd; font-size: .65rem; color: #666; text-align: center; }' +
    '</style>';

  var body;
  if (!hasData) {
    body =
      '<div class="arv-head">' +
        '<span class="arv-brand">CVC-OEI Annual Review</span>' +
        '<h1>' + year + '</h1>' +
        '<div class="arv-subtitle">No data recorded for this year.</div>' +
      '</div>' +
      '<div class="arv-empty">Looks like ' + year + ' is a blank page in your workbench. When you\u2019re ready to do a year-in-review, come back once you have tickets, KB entries, and college notes from the period.</div>';
  } else {
    body =
      '<div class="arv-head">' +
        '<span class="arv-brand">CVC-OEI Annual Review</span>' +
        '<h1>' + year + ' in review</h1>' +
        '<div class="arv-subtitle">A year of application support at CVC-OEI</div>' +
      '</div>' +

      '<section class="arv-section">' +
        '<div class="arv-headline-stats">' +
          '<div><strong>' + yearTickets.length + '</strong><div class="arv-stat-label">Tickets worked</div></div>' +
          '<div><strong>' + yearResolved.length + '</strong><div class="arv-stat-label">Resolved</div></div>' +
          '<div><strong>' + arvFmtTime(medianHours) + '</strong><div class="arv-stat-label">Median resolution</div></div>' +
          '<div><strong>' + yearKb.length + '</strong><div class="arv-stat-label">KB entries written</div></div>' +
          '<div><strong>' + collegesTouchedThisYear + '</strong><div class="arv-stat-label">Colleges noted</div></div>' +
          '<div><strong>' + yearOnboarding.length + '</strong><div class="arv-stat-label">Onboarding items done</div></div>' +
          '<div><strong>' + yearOutreachDone.length + '</strong><div class="arv-stat-label">Outreach events completed</div></div>' +
          '<div><strong>' + (busiest ? busiest.count : 0) + '</strong><div class="arv-stat-label">Busiest week (tickets)</div></div>' +
        '</div>' +
      '</section>' +

      '<section class="arv-section">' +
        '<h2>Tickets by month</h2>' +
        '<div class="arv-months">' + barsHtml + '</div>' +
      '</section>' +

      '<section class="arv-section">' +
        '<h2>Top systems touched</h2>' +
        systemBars +
      '</section>' +

      '<section class="arv-section">' +
        '<h2>Top colleges worked</h2>' +
        collegeBars +
      '</section>' +

      '<section class="arv-section">' +
        '<h2>Reflection prompts</h2>' +
        '<div class="arv-reflection">' +
          '<h3>For your manager / self-review</h3>' +
          '<ul>' +
            '<li>What patterns do you see in the month-to-month volume? When were the busy seasons and why?</li>' +
            '<li>Are your top-5 systems the ones you expected? If not, what does that say about where your time actually went?</li>' +
            '<li>Which of the top colleges do you have strong contacts at, and which are still cold?</li>' +
            '<li>Your median resolution time is ' + arvFmtTime(medianHours) + ' \u2014 is that improving, steady, or slipping?</li>' +
            '<li>Of the ' + yearKb.length + ' KB entries you wrote, which ones have you referenced the most since?</li>' +
            '<li>What\u2019s one process or pattern you\u2019d change for next year?</li>' +
          '</ul>' +
        '</div>' +
      '</section>';
  }

  body += '<div class="arv-foot">Generated from the CVC-OEI AppAnalyst Hub. Personal working data, not an official record.</div>';

  w.document.write(
    '<!DOCTYPE html><html><head><title>' + year + ' Annual Review</title>' + styles + '</head><body>' + body + '</body></html>'
  );
  w.document.close();
  setTimeout(function() { w.print(); }, 300);
}
