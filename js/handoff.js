// ═══════════════════════════════════════════════════════
// HANDOFF PACKET — One-click summary of everything in the
// workbench, formatted for sharing with a backup, new hire,
// or manager. Printable via a popup window with print CSS.
// ═══════════════════════════════════════════════════════

function handoffEsc(s) {
  return (s || '').toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function handoffFmt(iso) {
  if (!iso) return '';
  try {
    var d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) { return iso; }
}

function handoffAgeDays(iso) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

function handoffGenerate() {
  var tickets = [];
  var kb = [];
  var overlay = {};
  var outreach = [];
  var onboarding = [];
  var barriers = {};
  try { tickets = JSON.parse(localStorage.getItem('appanalyst.tickets.v1') || '[]'); } catch (e) {}
  try { kb = JSON.parse(localStorage.getItem('appanalyst.kb.v1') || '[]'); } catch (e) {}
  try { overlay = JSON.parse(localStorage.getItem('appanalyst.colleges.overlay.v1') || '{}'); } catch (e) {}
  try { outreach = JSON.parse(localStorage.getItem('appanalyst.outreach.v1') || '[]'); } catch (e) {}
  try { onboarding = JSON.parse(localStorage.getItem('appanalyst.onboarding.v1') || '[]'); } catch (e) {}
  try { barriers = JSON.parse(localStorage.getItem('appanalyst.barriers.state.v1') || '{}'); } catch (e) {}

  var now = Date.now();

  // ── Ticket sections ────────────────────────────
  var open = tickets.filter(function(t) { return t.status !== 'resolved'; });
  var urgent = open.filter(function(t) { return handoffAgeDays(t.created) >= 7; });
  var aging = open.filter(function(t) {
    var d = handoffAgeDays(t.created);
    return d >= 3 && d < 7;
  });
  var fresh = open.filter(function(t) { return handoffAgeDays(t.created) < 3; });

  // Sort all by oldest first
  var sortByAge = function(a, b) { return new Date(a.created).getTime() - new Date(b.created).getTime(); };
  urgent.sort(sortByAge); aging.sort(sortByAge); fresh.sort(sortByAge);

  // ── Follow-ups coming up in next 7 days ────────
  var dueSoon = open.filter(function(t) {
    if (!t.followUp) return false;
    var d = new Date(t.followUp + 'T00:00:00').getTime();
    return d >= now - 86400000 && d <= now + 7 * 86400000;
  }).sort(function(a, b) {
    return new Date(a.followUp).getTime() - new Date(b.followUp).getTime();
  });

  // ── Notes-bearing colleges ─────────────────────
  var notedColleges = Object.keys(overlay).map(function(name) {
    var o = overlay[name];
    return { name: name, notes: o.notes || '', contacts: o.contacts || {}, sis: o.sis || '' };
  }).filter(function(c) { return c.notes || Object.keys(c.contacts).length > 0 || c.sis; });
  notedColleges.sort(function(a, b) { return a.name.localeCompare(b.name); });

  // ── Active barriers ────────────────────────────
  var activeBarriers = Object.keys(barriers).filter(function(n) { return barriers[n].active; });

  // ── Upcoming outreach (this + next month) ──────
  var curMonth = new Date().getMonth();
  var nextMonth = (curMonth + 1) % 12;
  var upcomingOutreach = outreach.filter(function(e) {
    return (e.month === curMonth || e.month === nextMonth) && e.status !== 'skipped' && e.status !== 'done';
  });

  // ── Onboarding progress ────────────────────────
  var obDone = onboarding.filter(function(i) { return i.done; }).length;
  var obTotal = onboarding.length;

  // ── Stale KB (90d+) ────────────────────────────
  var staleKb = kb.filter(function(e) {
    return now - new Date(e.updated || 0).getTime() > 90 * 86400000;
  });

  // ── Build HTML ─────────────────────────────────
  var dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  var ticketCard = function(t) {
    var fu = t.followUp ? ' · follow-up ' + handoffFmt(t.followUp) : '';
    var age = handoffAgeDays(t.created) + 'd old';
    var notes = t.notes ? '<div class="h-notes">' + handoffEsc(t.notes.slice(0, 300)) + (t.notes.length > 300 ? '\u2026' : '') + '</div>' : '';
    return '<div class="h-ticket">' +
      '<div class="h-t-symptom">' + handoffEsc(t.symptom || '(no symptom)') + '</div>' +
      '<div class="h-t-meta">' +
        handoffEsc(t.college || 'no college') + ' \u00b7 ' +
        handoffEsc(t.system || 'no system') + ' \u00b7 ' +
        handoffEsc(t.status) + ' \u00b7 ' +
        age + fu +
        (t.vendor ? ' \u00b7 vendor: ' + handoffEsc(t.vendor) : '') +
        (t.tags ? ' \u00b7 tags: ' + handoffEsc(t.tags) : '') +
      '</div>' +
      notes +
    '</div>';
  };

  var html = '';

  // Summary card
  html += '<section class="h-section h-summary">' +
    '<h2>Summary</h2>' +
    '<div class="h-stats">' +
      '<div><strong>' + urgent.length + '</strong> urgent (7d+)</div>' +
      '<div><strong>' + aging.length + '</strong> aging (3-7d)</div>' +
      '<div><strong>' + fresh.length + '</strong> fresh (under 3d)</div>' +
      '<div><strong>' + dueSoon.length + '</strong> follow-ups in next 7d</div>' +
      '<div><strong>' + notedColleges.length + '</strong> colleges with notes</div>' +
      '<div><strong>' + activeBarriers.length + '</strong> active barriers</div>' +
      '<div><strong>' + staleKb.length + '</strong> stale KB entries</div>' +
      '<div><strong>' + (obTotal > 0 ? Math.round((obDone / obTotal) * 100) : 0) + '%</strong> onboarded</div>' +
    '</div>' +
  '</section>';

  // Urgent
  if (urgent.length > 0) {
    html += '<section class="h-section h-urgent"><h2>Urgent (7+ days open)</h2>' +
      urgent.map(ticketCard).join('') +
    '</section>';
  }

  // Aging
  if (aging.length > 0) {
    html += '<section class="h-section h-aging"><h2>Aging (3&ndash;7 days)</h2>' +
      aging.map(ticketCard).join('') +
    '</section>';
  }

  // Fresh
  if (fresh.length > 0) {
    html += '<section class="h-section"><h2>Fresh open tickets</h2>' +
      fresh.map(ticketCard).join('') +
    '</section>';
  }

  // Follow-ups in next week
  if (dueSoon.length > 0) {
    html += '<section class="h-section"><h2>Follow-ups in the next 7 days</h2>' +
      dueSoon.map(function(t) {
        return '<div class="h-followup">' +
          '<strong>' + handoffFmt(t.followUp) + '</strong> \u2014 ' +
          handoffEsc(t.symptom || '(no symptom)') + ' @ ' + handoffEsc(t.college || 'unassigned') +
        '</div>';
      }).join('') +
    '</section>';
  }

  // Noted colleges
  if (notedColleges.length > 0) {
    html += '<section class="h-section"><h2>Colleges with personal notes</h2>';
    notedColleges.forEach(function(c) {
      html += '<div class="h-college">' +
        '<h3>' + handoffEsc(c.name) + '</h3>';
      if (c.sis) html += '<div class="h-c-sis">SIS override: ' + handoffEsc(c.sis) + '</div>';
      if (c.notes) html += '<div class="h-notes">' + handoffEsc(c.notes) + '</div>';
      var contactKeys = ['ar','fa','counseling','dsps','general'];
      var contactRows = [];
      contactKeys.forEach(function(k) {
        if (c.contacts[k]) contactRows.push('<span>' + k.toUpperCase() + ': ' + handoffEsc(c.contacts[k]) + '</span>');
      });
      if (contactRows.length > 0) {
        html += '<div class="h-contacts">' + contactRows.join(' \u00b7 ') + '</div>';
      }
      html += '</div>';
    });
    html += '</section>';
  }

  // Active barriers
  if (activeBarriers.length > 0) {
    html += '<section class="h-section"><h2>Active barriers (system-wide concerns)</h2>' +
      '<p>Barriers currently marked as active in your workbench: ' + activeBarriers.join(', ') + '. Reference: Section 0 of the AppAnalyst Hub.</p>' +
    '</section>';
  }

  // Outreach plan
  if (upcomingOutreach.length > 0) {
    var monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    html += '<section class="h-section"><h2>Upcoming outreach (this month and next)</h2>';
    upcomingOutreach.forEach(function(e) {
      html += '<div class="h-outreach">' +
        '<strong>' + monthNames[e.month] + '</strong> \u00b7 ' +
        handoffEsc(e.status) + ' \u2014 ' +
        handoffEsc(e.title || '(untitled)') +
        (e.notes ? '<div class="h-notes">' + handoffEsc(e.notes) + '</div>' : '') +
      '</div>';
    });
    html += '</section>';
  }

  // Stale KB
  if (staleKb.length > 0) {
    html += '<section class="h-section"><h2>Stale knowledge base entries (90d+)</h2>' +
      '<p>These entries haven\u2019t been updated in 90+ days and may need review:</p><ul>' +
      staleKb.slice(0, 20).map(function(e) {
        return '<li>' + handoffEsc(e.title) + ' (' + handoffEsc(e.system) + ' \u00b7 updated ' + handoffFmt(e.updated) + ')</li>';
      }).join('') +
    '</ul></section>';
  }

  // Open popup with the packet
  var w = window.open('', 'handoff', 'width=900,height=1100');
  if (!w) { toast('Popup blocked \u2014 enable popups for this site'); return; }

  var styles = '<style>' +
    '@media print { @page { size: letter; margin: .6in; } }' +
    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 720px; margin: 0 auto; padding: 2rem 1.5rem; color: #1a1815; line-height: 1.55; }' +
    '.h-head { display: flex; justify-content: space-between; align-items: baseline; padding-bottom: .5rem; border-bottom: 2px solid #0F766E; margin-bottom: 1.25rem; }' +
    '.h-brand { font-size: .7rem; text-transform: uppercase; letter-spacing: .1em; color: #0F766E; font-weight: 700; }' +
    '.h-date { font-size: .72rem; color: #666; }' +
    'h1 { font-size: 1.6rem; margin: 0 0 .5rem; font-weight: 700; }' +
    '.h-subtitle { font-size: .9rem; color: #666; margin-bottom: 1.25rem; }' +
    '.h-section { margin-bottom: 1.5rem; break-inside: avoid; }' +
    '.h-section h2 { font-size: 1rem; margin: 0 0 .65rem; padding-bottom: .3rem; border-bottom: 1px solid #ddd; font-weight: 700; }' +
    '.h-section.h-urgent h2 { color: #B91C1C; border-bottom-color: #FECACA; }' +
    '.h-section.h-aging h2 { color: #A16207; border-bottom-color: #FDE68A; }' +
    '.h-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: .6rem; font-size: .76rem; }' +
    '.h-stats > div { padding: .6rem .7rem; background: #f5f4f1; border-radius: 4px; text-align: center; }' +
    '.h-stats strong { display: block; font-size: 1.2rem; font-weight: 700; margin-bottom: .15rem; color: #1a1815; }' +
    '.h-ticket { padding: .6rem .75rem; border-left: 3px solid #ddd; margin-bottom: .55rem; break-inside: avoid; }' +
    '.h-section.h-urgent .h-ticket { border-left-color: #B91C1C; background: #FEF2F2; }' +
    '.h-section.h-aging .h-ticket { border-left-color: #A16207; background: #FEFCE8; }' +
    '.h-t-symptom { font-size: .86rem; font-weight: 600; margin-bottom: .2rem; }' +
    '.h-t-meta { font-family: "SFMono-Regular", Consolas, monospace; font-size: .66rem; color: #666; }' +
    '.h-notes { margin-top: .35rem; font-size: .74rem; color: #555; line-height: 1.5; white-space: pre-wrap; background: #fafaf8; padding: .4rem .55rem; border-radius: 3px; }' +
    '.h-followup { padding: .3rem 0; font-size: .8rem; border-bottom: 1px dashed #eee; }' +
    '.h-college { margin-bottom: .85rem; padding: .6rem .75rem; background: #fafaf8; border-radius: 4px; }' +
    '.h-college h3 { margin: 0 0 .25rem; font-size: .88rem; font-weight: 700; }' +
    '.h-c-sis { font-family: monospace; font-size: .68rem; color: #666; margin-bottom: .2rem; }' +
    '.h-contacts { font-family: monospace; font-size: .68rem; color: #555; margin-top: .3rem; }' +
    '.h-outreach { padding: .35rem 0; font-size: .8rem; border-bottom: 1px dashed #eee; }' +
    '.h-footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #ddd; font-size: .65rem; color: #666; line-height: 1.55; }' +
    '</style>';

  var body =
    '<div class="h-head">' +
      '<span class="h-brand">CVC-OEI Handoff Packet</span>' +
      '<span class="h-date">' + dateStr + '</span>' +
    '</div>' +
    '<h1>Current state of the workbench</h1>' +
    '<div class="h-subtitle">A complete snapshot of open tickets, active concerns, upcoming commitments, and notes. Use this to brief a colleague covering for PTO, hand off during a role transition, or capture a point-in-time for archiving.</div>' +
    html +
    '<div class="h-footer">' +
      'Generated from the CVC-OEI AppAnalyst Hub (fansofhenry.github.io/AppAnalyst). ' +
      'Personal working notes, not an official CVC-OEI document. ' +
      'All data was assembled from one analyst\u2019s local browser state at the time shown above. ' +
      'Review for accuracy before sharing broadly. Strip any PII before distribution.' +
    '</div>';

  w.document.write(
    '<!DOCTYPE html><html><head><title>Handoff Packet \u2014 ' + dateStr + '</title>' + styles + '</head><body>' + body + '</body></html>'
  );
  w.document.close();
  setTimeout(function() { w.print(); }, 300);
}
