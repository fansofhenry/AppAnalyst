// ═══════════════════════════════════════════════════════
// PARTNER PACKET — Generate a printable one-pager for a
// specific college, suitable for sharing with partner
// staff at that college. Pulls from directory, tickets,
// KB, and barriers. PII-redacted by design (symptoms only).
// ═══════════════════════════════════════════════════════

var PACKET_COLLEGE = '';

function packetEsc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function packetOpen() {
  var overlay = document.getElementById('packetOverlay');
  if (!overlay) return;
  overlay.classList.add('packet-show');
  document.body.style.overflow = 'hidden';
  packetRender();
}

function packetClose() {
  var overlay = document.getElementById('packetOverlay');
  if (overlay) overlay.classList.remove('packet-show');
  document.body.style.overflow = '';
}

function packetSelect(name) {
  PACKET_COLLEGE = name;
  packetRender();
}

function packetRender() {
  var body = document.getElementById('packetBody');
  if (!body) return;

  // College picker
  var pickerHtml = '';
  if (!PACKET_COLLEGE) {
    var list = (typeof collegeDB !== 'undefined') ? collegeDB : [];
    pickerHtml =
      '<div class="packet-picker">' +
        '<div class="packet-picker-label">Select a college to generate a partner packet</div>' +
        '<input type="text" class="packet-picker-input" placeholder="Type a college name..." oninput="packetFilter(this.value)">' +
        '<div class="packet-picker-list" id="packetPickerList">' +
          list.slice(0, 20).map(function(c) {
            return '<button class="packet-picker-item" onclick="packetSelect(\'' + c.name.replace(/'/g, "\\\\'") + '\')">' +
              '<span class="packet-pi-name">' + packetEsc(c.name) + '</span>' +
              '<span class="packet-pi-sub">' + packetEsc(c.district) + '</span>' +
            '</button>';
          }).join('') +
        '</div>' +
      '</div>';
    body.innerHTML = pickerHtml;
    return;
  }

  // Pull data for the selected college
  var col = null;
  if (typeof collegeDB !== 'undefined') {
    col = collegeDB.find(function(c) { return c.name === PACKET_COLLEGE; });
  }
  if (!col) {
    body.innerHTML = '<div class="packet-error">College not found in directory.</div>';
    return;
  }

  // Overlay (notes + contacts + SIS override)
  var overlay = {};
  try { overlay = JSON.parse(localStorage.getItem('appanalyst.colleges.overlay.v1') || '{}'); } catch (e) {}
  var o = overlay[col.name] || {};
  var effectiveSis = o.sis || col.sis;
  var contacts = o.contacts || {};
  var userNotes = o.notes || '';

  // Tickets for this college — count only, no PII
  var tickets = [];
  try { tickets = JSON.parse(localStorage.getItem('appanalyst.tickets.v1') || '[]'); } catch (e) {}
  var relatedTickets = tickets.filter(function(t) { return t.college === col.name; });
  var openCount = relatedTickets.filter(function(t) { return t.status !== 'resolved'; }).length;
  var resolvedCount = relatedTickets.filter(function(t) { return t.status === 'resolved'; }).length;

  // KB entries relevant to this college\u2019s system
  var kb = [];
  try { kb = JSON.parse(localStorage.getItem('appanalyst.kb.v1') || '[]'); } catch (e) {}
  var relevantKb = kb.filter(function(e) {
    if (!e.system) return false;
    // Match by system tier
    if (effectiveSis.indexOf('Banner') >= 0 && e.system.indexOf('Banner') >= 0) return true;
    if (effectiveSis.indexOf('PeopleSoft') >= 0 && e.system.indexOf('PeopleSoft') >= 0) return true;
    if (effectiveSis.indexOf('Colleague') >= 0 && e.system.indexOf('Colleague') >= 0) return true;
    return e.system === 'Exchange' || e.system === 'General';
  }).slice(0, 5);

  // Barriers
  var barrierState = {};
  try { barrierState = JSON.parse(localStorage.getItem('appanalyst.barriers.state.v1') || '{}'); } catch (e) {}
  var activeBarriers = Object.keys(barrierState).filter(function(n) { return barrierState[n].active; });

  // Render the packet
  var today = new Date();
  var dateStr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][today.getMonth()] + ' ' + today.getDate() + ', ' + today.getFullYear();

  var contactsList = '';
  var contactRoles = { ar: 'A&R', fa: 'Financial Aid', counseling: 'Counseling', dsps: 'DSPS', general: 'General' };
  var hasContacts = false;
  Object.keys(contactRoles).forEach(function(r) {
    if (contacts[r]) {
      contactsList += '<div class="packet-contact-row"><span class="packet-contact-role">' + contactRoles[r] + '</span><span class="packet-contact-value">' + packetEsc(contacts[r]) + '</span></div>';
      hasContacts = true;
    }
  });
  if (!hasContacts) {
    contactsList = '<div class="packet-contact-empty">No contacts on file in your directory overlay. Add them via the College Directory to populate this section.</div>';
  }

  var html =
    '<div class="packet-doc" id="packetDoc">' +
      '<div class="packet-doc-head">' +
        '<div class="packet-doc-brand">CVC-OEI Partner Packet</div>' +
        '<div class="packet-doc-date">' + dateStr + '</div>' +
      '</div>' +
      '<h2 class="packet-doc-title">' + packetEsc(col.name) + '</h2>' +
      '<div class="packet-doc-sub">' + packetEsc(col.district) + ' &middot; ' + packetEsc(col.city || '') + ', ' + packetEsc(col.county || '') + ' County</div>' +

      '<div class="packet-grid">' +
        '<div class="packet-box">' +
          '<div class="packet-box-label">SIS platform</div>' +
          '<div class="packet-box-val">' + packetEsc(effectiveSis) + '</div>' +
          (effectiveSis.indexOf('Ethos') >= 0
            ? '<div class="packet-box-note">Ethos tier \u2014 manual unit reconciliation required per April 2025 CVC release notes.</div>'
            : '') +
        '</div>' +
        '<div class="packet-box">' +
          '<div class="packet-box-label">CVC verification</div>' +
          '<div class="packet-box-val">' + (col.verified ? '&#10003; Verified' : '? Unverified \u2014 please confirm') + '</div>' +
          '<div class="packet-box-note">Source: ' + packetEsc(col.sisSource || 'not documented') + '</div>' +
        '</div>' +
        '<div class="packet-box">' +
          '<div class="packet-box-label">Website</div>' +
          '<div class="packet-box-val"><a href="' + packetEsc(col.website) + '" target="_blank" rel="noopener">' + packetEsc((col.website || '').replace(/https?:\/\//, '')) + '</a></div>' +
        '</div>' +
        '<div class="packet-box">' +
          '<div class="packet-box-label">Activity (your personal log)</div>' +
          '<div class="packet-box-val">' + openCount + ' open &middot; ' + resolvedCount + ' resolved</div>' +
          '<div class="packet-box-note">From your private ticket log. Not shared data.</div>' +
        '</div>' +
      '</div>' +

      '<h3 class="packet-h3">Key staff contacts</h3>' +
      '<div class="packet-contacts">' + contactsList + '</div>' +

      (userNotes
        ? '<h3 class="packet-h3">Notes on file</h3>' +
          '<div class="packet-notes">' + packetEsc(userNotes) + '</div>'
        : '') +

      (relevantKb.length > 0
        ? '<h3 class="packet-h3">Relevant knowledge base entries</h3>' +
          '<div class="packet-kb-list">' +
            relevantKb.map(function(e) {
              return '<div class="packet-kb-item">' +
                '<div class="packet-kb-title">' + packetEsc(e.title) + '</div>' +
                '<div class="packet-kb-meta">' + packetEsc(e.system) + ' &middot; ' + packetEsc(e.audience) + ' &middot; ' + packetEsc(e.severity) + '</div>' +
              '</div>';
            }).join('') +
          '</div>'
        : '') +

      (activeBarriers.length > 0
        ? '<h3 class="packet-h3">Active barriers (system-wide)</h3>' +
          '<div class="packet-barriers">You have ' + activeBarriers.length + ' barrier(s) marked as active concerns in your workbench. Reference: Section 0 of the AppAnalyst Hub.</div>'
        : '') +

      '<h3 class="packet-h3">Escalation contacts</h3>' +
      '<div class="packet-escalation">' +
        '<div class="packet-esc-row"><strong>CVC-OEI Support (FHDA):</strong> via this packet\u2019s sender</div>' +
        '<div class="packet-esc-row"><strong>Ellucian vendor cases:</strong> through your district\u2019s Ellucian support portal (Banner/Colleague)</div>' +
        '<div class="packet-esc-row"><strong>CCCTC (SuperGlue / CCCApply):</strong> ccctechnology.info support</div>' +
        '<div class="packet-esc-row"><strong>General CVC questions:</strong> cvc.edu/contact or CSSO listserv</div>' +
      '</div>' +

      '<div class="packet-footer">' +
        'Generated from the CVC-OEI AppAnalyst Hub (fansofhenry.github.io/AppAnalyst). ' +
        'This packet was assembled from one analyst\u2019s personal working notes and should not be considered an official CVC-OEI document. ' +
        'SIS tagging is best-effort from publicly documented portal names; verify before relying for escalation decisions.' +
      '</div>' +
    '</div>';

  var actions =
    '<div class="packet-actions">' +
      '<button class="tl-btn" onclick="PACKET_COLLEGE=\'\';packetRender()">\u2190 Pick different college</button>' +
      '<button class="tl-btn" onclick="packetCopy()">Copy as text</button>' +
      '<button class="tl-btn tl-btn-new" onclick="packetPrint()">Print / Save PDF</button>' +
    '</div>';

  body.innerHTML = actions + html;
}

function packetFilter(q) {
  var list = (typeof collegeDB !== 'undefined') ? collegeDB : [];
  var filtered = q
    ? list.filter(function(c) { return (c.name + ' ' + c.district + ' ' + c.city).toLowerCase().indexOf(q.toLowerCase()) >= 0; })
    : list;
  var listEl = document.getElementById('packetPickerList');
  if (!listEl) return;
  listEl.innerHTML = filtered.slice(0, 25).map(function(c) {
    return '<button class="packet-picker-item" onclick="packetSelect(\'' + c.name.replace(/'/g, "\\\\'") + '\')">' +
      '<span class="packet-pi-name">' + packetEsc(c.name) + '</span>' +
      '<span class="packet-pi-sub">' + packetEsc(c.district) + '</span>' +
    '</button>';
  }).join('');
  if (filtered.length === 0) {
    listEl.innerHTML = '<div class="packet-picker-empty">No matches.</div>';
  }
}

function packetPrint() {
  var doc = document.getElementById('packetDoc');
  if (!doc) return;
  // Use a new window with just the packet content
  var w = window.open('', 'packet', 'width=900,height=1100');
  if (!w) { toast('Popup blocked'); return; }
  var styles = '<style>' +
    'body{font-family:-apple-system,sans-serif;max-width:720px;margin:2rem auto;padding:0 1rem;color:#1a1815;line-height:1.55;}' +
    'h2{font-size:1.6rem;margin:0 0 .2rem;}' +
    'h3{font-size:1rem;margin:1.25rem 0 .5rem;padding-bottom:.3rem;border-bottom:1px solid #ddd;}' +
    '.packet-doc-brand{font-size:.7rem;text-transform:uppercase;letter-spacing:.1em;color:#666;}' +
    '.packet-doc-date{font-size:.7rem;color:#666;margin-bottom:.75rem;}' +
    '.packet-doc-sub{font-size:.85rem;color:#666;margin-bottom:1rem;}' +
    '.packet-grid{display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin:.75rem 0 1.25rem;}' +
    '.packet-box{border:1px solid #ddd;border-radius:4px;padding:.65rem .85rem;}' +
    '.packet-box-label{font-size:.55rem;text-transform:uppercase;letter-spacing:.06em;color:#666;font-weight:700;}' +
    '.packet-box-val{font-size:.9rem;font-weight:600;margin:.2rem 0;}' +
    '.packet-box-note{font-size:.65rem;color:#666;}' +
    '.packet-contact-row{display:grid;grid-template-columns:120px 1fr;padding:.25rem 0;border-bottom:1px dashed #eee;font-size:.8rem;}' +
    '.packet-contact-role{font-weight:600;color:#555;}' +
    '.packet-kb-item{padding:.4rem 0;border-bottom:1px dashed #eee;}' +
    '.packet-kb-title{font-weight:600;font-size:.85rem;}' +
    '.packet-kb-meta{font-size:.65rem;color:#666;}' +
    '.packet-footer{margin-top:2rem;padding-top:.75rem;border-top:1px solid #ddd;font-size:.62rem;color:#666;}' +
    '</style>';
  w.document.write('<!DOCTYPE html><html><head><title>Partner Packet \u2014 ' + packetEsc(PACKET_COLLEGE) + '</title>' + styles + '</head><body>' + doc.innerHTML + '</body></html>');
  w.document.close();
  setTimeout(function() { w.print(); }, 200);
}

function packetCopy() {
  var doc = document.getElementById('packetDoc');
  if (!doc) return;
  // Simple plain-text version
  var text = doc.innerText || doc.textContent;
  navigator.clipboard.writeText(text).then(function() { toast('Packet copied'); }).catch(function() { toast('Copy failed'); });
}
