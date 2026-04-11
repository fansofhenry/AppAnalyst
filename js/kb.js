// ═══════════════════════════════════════════════════════
// KB BUILDER — Personal knowledge base, localStorage-backed
// Seeds from kbTemplates on first load, then fully editable.
// Copy-to-clipboard as markdown for pasting into ticket replies.
// ═══════════════════════════════════════════════════════

var KB_KEY = 'appanalyst.kb.v1';
var KB_SYSTEMS = ['Banner Direct', 'Banner Ethos', 'Colleague Ethos', 'PeopleSoft', 'Exchange', 'CCCApply', 'SuperGlue', 'Canvas', 'SSO / IdP', 'General'];
var KB_AUDIENCES = ['A&R', 'Financial Aid', 'Counseling', 'DSPS', 'General'];
var KB_ACTIVE_ID = null;
var KB_SYS_FILTER = 'all';
var KB_AUD_FILTER = 'all';
var KB_SEARCH = '';
var KB_PREVIEW_KEY = 'appanalyst.kb.preview.v1';

// ── Tiny markdown renderer — enough for everyday notes ──
function kbMdToHtml(md) {
  if (!md) return '<em style="color:var(--text-3)">Empty entry. Switch to edit mode to start writing.</em>';
  var html = md;
  // Escape first
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // Fenced code
  html = html.replace(/```([\s\S]*?)```/g, function(_, code) {
    return '<pre class="kb-md-code">' + code.replace(/\n/g, '\n') + '</pre>';
  });
  // Inline code
  html = html.replace(/`([^`\n]+)`/g, '<code class="kb-md-inline-code">$1</code>');
  // Headings
  html = html.replace(/^###### (.*)$/gm, '<h6>$1</h6>')
             .replace(/^##### (.*)$/gm, '<h5>$1</h5>')
             .replace(/^#### (.*)$/gm, '<h4>$1</h4>')
             .replace(/^### (.*)$/gm, '<h3>$1</h3>')
             .replace(/^## (.*)$/gm, '<h2>$1</h2>')
             .replace(/^# (.*)$/gm, '<h1>$1</h1>');
  // Bold, italic, strike
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
             .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
             .replace(/~~([^~]+)~~/g, '<del>$1</del>');
  // Links (markdown only)
  html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  // Unordered lists
  html = html.replace(/(^|\n)(- .*(\n- .*)*)/g, function(_, pre, block) {
    var items = block.split(/\n/).map(function(line) {
      return '<li>' + line.replace(/^- /, '') + '</li>';
    }).join('');
    return pre + '<ul class="kb-md-list">' + items + '</ul>';
  });
  // Ordered lists
  html = html.replace(/(^|\n)(\d+\. .*(\n\d+\. .*)*)/g, function(_, pre, block) {
    var items = block.split(/\n/).map(function(line) {
      return '<li>' + line.replace(/^\d+\. /, '') + '</li>';
    }).join('');
    return pre + '<ol class="kb-md-list">' + items + '</ol>';
  });
  // Horizontal rule
  html = html.replace(/^---+$/gm, '<hr>');
  // Paragraphs — wrap runs of text separated by blank lines
  html = html.split(/\n{2,}/).map(function(block) {
    block = block.trim();
    if (!block) return '';
    if (/^<(h[1-6]|ul|ol|pre|hr|blockquote)/.test(block)) return block;
    return '<p>' + block.replace(/\n/g, '<br>') + '</p>';
  }).join('\n');
  return html;
}

function kbGetPreview() { try { return localStorage.getItem(KB_PREVIEW_KEY) === '1'; } catch (e) { return false; } }
function kbSetPreview(v) { try { localStorage.setItem(KB_PREVIEW_KEY, v ? '1' : '0'); } catch (e) {} kbRender(); }
function kbTogglePreview() { kbSetPreview(!kbGetPreview()); }

// ── KB starter templates ────────────────────────────────
var KB_TEMPLATES_SEED = [
  {
    title: 'Banner Ethos token refresh failure',
    system: 'Banner Ethos',
    audience: 'A&R',
    severity: 'P2',
    body: '## Symptom\n\nAER transmission halts at the home college. Ethos API returns HTTP 401 with `invalid_grant`.\n\n## Context\n\n- Ethos OAuth2 tokens expire on a schedule set in Ethos admin.\n- Multiple colleges on Banner Ethos can be affected simultaneously if the renewal window is missed.\n\n## Steps\n\n1. Confirm failure in Ethos logs \u2014 look for HTTP 401 with "invalid_grant".\n2. Check token expiration policy in Ethos admin.\n3. Regenerate client credentials for the affected integration.\n4. Run a manual test sync to confirm the new token works.\n5. Flush the AER queue for blocked records.\n6. Add token-expiry monitoring alert to prevent recurrence.\n\n## Escalation\n\nIf regeneration fails, open an Ellucian support case with the integration ID and error timestamp.'
  },
  {
    title: 'CCPG fee waiver not transferring to Exchange course',
    system: 'Exchange',
    audience: 'Financial Aid',
    severity: 'P2',
    body: '## Symptom\n\nStudent reports their CCPG fee waiver is not covering the Exchange course at the teaching college.\n\n## Root cause\n\nUsually: no Consortium Agreement on file. Less often: the agreement exists but was submitted after the add deadline.\n\n## Steps\n\n1. Confirm CCPG eligibility is active at the home college for this term.\n2. Check for an existing Consortium Agreement with the teaching college for this specific course.\n3. If no agreement: initiate one immediately.\n4. If agreement exists: contact teaching college FA to apply the waiver based on the agreement.\n5. If add deadline has passed: investigate refund options with the home college FA Director.\n\n## Escalation\n\nFA Director if the student already paid out-of-pocket and a refund is in question.'
  },
  {
    title: 'SSO redirect loop between home college and Canvas',
    system: 'SSO / IdP',
    audience: 'General',
    severity: 'P2',
    body: '## Symptom\n\nStudent tries to access the Exchange course in Canvas at the teaching college. SSO redirects back to home college IdP, then to Canvas, then to IdP again \u2014 infinite loop.\n\n## Likely causes\n\n1. SAML attribute release policy on the home college IdP is missing CCCID.\n2. eduPersonPrincipalName to CCCID mapping broken at the teaching college.\n3. Home college IdP does not assert CCCID, so teaching college SP cannot identify the user.\n\n## Steps\n\n1. Open browser dev tools and capture the full SAML flow.\n2. Verify SAML metadata is registered correctly at both ends.\n3. Check assertion attributes: CCCID, email, enrollment status.\n4. Work with home college IT to update attribute release policy.\n5. Verify student Canvas access after the fix.\n\n## Escalation\n\nCampus IT at the home college. If unreachable, escalate with SAML trace and missing attributes.'
  },
  {
    title: 'Colleague Ethos unit reconciliation gap',
    system: 'Colleague Ethos',
    audience: 'A&R',
    severity: 'P3',
    body: '## Symptom\n\nExchange shows enrollment, but the home SIS (Colleague on Ethos) does not have a matching unit posting. Student count on the home side is short.\n\n## Context\n\nAs of April 2025, Colleague Ethos does not yet support direct unit-recording integration via the CVC Exchange. Manual reconciliation is expected.\n\n## Steps\n\n1. Export the Exchange roster for the term from the Admin Dashboard.\n2. Export the Colleague roster filtered by Exchange-flagged records.\n3. Diff the two using the Reconciliation Helper.\n4. For each missing row, post the unit record manually in Colleague.\n5. Log the gap count by month to track until Ellucian ships direct integration.\n\n## Escalation\n\nReport monthly gap totals to your manager. If the gap exceeds 10% of Exchange volume, consider a ticket with Ellucian support referencing the April 2025 CVC release notes.'
  },
  {
    title: 'Canvas roster delay after Exchange sync',
    system: 'Canvas',
    audience: 'General',
    severity: 'P3',
    body: '## Symptom\n\nStudent enrolled via cvc.edu. The enrollment is visible in both the home SIS and the Exchange Admin Dashboard. But the course is not yet in their Canvas dashboard at the teaching college.\n\n## Root cause\n\nCanvas roster sync at the teaching college runs on a schedule (often 15\u201330 minutes, sometimes longer on Ethos tiers). This is normal for the first few hours after a new enrollment.\n\n## Steps\n\n1. Confirm enrollment is in both SIS dashboards.\n2. Tell the student to wait up to 24 hours, and reassure them their seat is safe.\n3. If beyond 24 hours: contact the teaching college\u2019s A&R or LMS administrator to confirm Canvas has received the enrollment event.\n4. If Canvas still hasn\u2019t received it: check whether the teaching college\u2019s Canvas sync is running normally for other students.\n\n## Escalation\n\nTeaching college A&R or Canvas admin if delay exceeds 24 hours.'
  },
  {
    title: 'OpenCCC sign-in failure',
    system: 'SSO / IdP',
    audience: 'A&R',
    severity: 'P3',
    body: '## Symptom\n\nStudent cannot sign in to cvc.edu or CCCApply with their OpenCCC credentials. Gets a generic error or is redirected to password recovery.\n\n## Likely causes\n\n1. Password needs reset.\n2. OpenCCC account temporarily locked.\n3. Home college\u2019s IdP integration is down.\n4. Student has duplicate OpenCCC accounts.\n\n## Steps\n\n1. Direct student to try password recovery at opencccapply.net.\n2. If that doesn\u2019t work, check for duplicate accounts via CCCID lookup.\n3. If the home college IdP is down, provide workaround (direct Canvas access if SSO isn\u2019t strictly required).\n4. Escalate to CCCTC if OpenCCC itself appears down.\n\n## Escalation\n\nCCCTC help desk for OpenCCC-level issues. Campus IT for home college IdP issues.'
  },
  {
    title: 'DSPS accommodation coordination (template)',
    system: 'General',
    audience: 'DSPS',
    severity: 'Info',
    body: '## Purpose\n\nCoordinate accommodations for a CVC Exchange student between home and teaching college DSPS offices.\n\n## Process\n\n1. Home college DSPS confirms student is active with accommodations on file.\n2. Student requests a copy of their accommodation letter (consent to share).\n3. Student or home college DSPS contacts teaching college DSPS.\n4. Teaching college DSPS notifies the instructor to configure Canvas exam settings, alt formats, or other accommodations.\n5. Follow up at 48 hours if the teaching college has not responded.\n\n## Contacts\n\n- Home college DSPS: [your DSPS coordinator + email]\n- Teaching college DSPS: [look up in the College Directory]\n\n## Notes\n\nAccommodations do NOT auto-transfer between colleges. Proactive coordination is required every term.'
  }
];

function kbStarterOpen() {
  var modal = document.getElementById('kbStarterModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'kbStarterModal';
    modal.className = 'qc-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-label', 'KB starter templates');
    modal.addEventListener('click', function(e) {
      if (e.target === modal) modal.classList.remove('qc-show');
    });
    document.body.appendChild(modal);
  }
  modal.innerHTML =
    '<div class="qc-modal" style="width:min(620px,94vw)" role="document">' +
      '<div class="qc-head">' +
        '<span class="qc-title">Start from a KB template</span>' +
        '<button class="qc-close" onclick="document.getElementById(\'kbStarterModal\').classList.remove(\'qc-show\')" aria-label="Close">&times;</button>' +
      '</div>' +
      '<div style="padding:1rem 1.25rem;max-height:60vh;overflow-y:auto">' +
        KB_TEMPLATES_SEED.map(function(tpl, i) {
          return '<button class="kb-starter-item" onclick="kbStarterUse(' + i + ')">' +
            '<div class="kb-starter-title">' + kbEsc(tpl.title) + '</div>' +
            '<div class="kb-starter-meta">' + kbEsc(tpl.system) + ' &middot; ' + kbEsc(tpl.audience) + ' &middot; ' + kbEsc(tpl.severity) + '</div>' +
            '<div class="kb-starter-preview">' + kbEsc(tpl.body.split('\n').slice(0, 2).join(' ').slice(0, 140)) + '\u2026</div>' +
          '</button>';
        }).join('') +
      '</div>' +
    '</div>';
  modal.classList.add('qc-show');
}

function kbStarterUse(idx) {
  var tpl = KB_TEMPLATES_SEED[idx];
  if (!tpl) return;
  var list = kbLoad();
  var entry = {
    id: 'K' + Date.now().toString(36) + Math.random().toString(36).slice(2, 4),
    title: tpl.title,
    system: tpl.system,
    audience: tpl.audience,
    severity: tpl.severity,
    body: tpl.body,
    updated: new Date().toISOString()
  };
  list.unshift(entry);
  kbSave(list);
  KB_ACTIVE_ID = entry.id;
  kbRender();
  var modal = document.getElementById('kbStarterModal');
  if (modal) modal.classList.remove('qc-show');
  toast('Template added — edit as needed');
  var kbEl = document.getElementById('kb');
  if (kbEl) kbEl.scrollIntoView({ behavior: 'smooth' });
}

function kbLoad() {
  if (typeof safeStorage !== 'undefined') {
    var stored = safeStorage.get(KB_KEY, null);
    if (stored) return stored;
  } else {
    try {
      var raw = localStorage.getItem(KB_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { }
  }
  // Seed from the legacy kbTemplates
  var seeded = (typeof kbTemplates !== 'undefined' ? kbTemplates : []).map(function(t, i) {
    var body = (t.desc || '') + '\n\n## Steps\n\n' +
      (t.steps || []).map(function(s, idx) { return (idx + 1) + '. ' + s; }).join('\n') +
      '\n\n## Escalation\n\n' + (t.escalation || '');
    var sys = 'General';
    if (/ethos|token/i.test(t.title || '')) sys = 'Banner Ethos';
    else if (/saml|sso/i.test(t.title || '')) sys = 'SSO / IdP';
    else if (/onboard/i.test(t.title || '')) sys = 'Exchange';
    else if (/sync/i.test(t.title || '')) sys = 'Exchange';
    return {
      id: 'K' + Date.now().toString(36) + '-' + i,
      title: t.title || 'Untitled',
      system: sys,
      audience: 'General',
      severity: t.severity || 'P3',
      body: body,
      updated: new Date().toISOString()
    };
  });
  kbSave(seeded);
  return seeded;
}

function kbSave(entries) {
  if (typeof safeStorage !== 'undefined') {
    safeStorage.set(KB_KEY, entries);
  } else {
    try { localStorage.setItem(KB_KEY, JSON.stringify(entries)); } catch (e) {}
  }
}

function kbAdd() {
  var list = kbLoad();
  var entry = {
    id: 'K' + Date.now().toString(36) + Math.random().toString(36).slice(2, 4),
    title: 'New entry',
    system: 'General',
    audience: 'General',
    severity: 'P3',
    body: '',
    updated: new Date().toISOString()
  };
  list.unshift(entry);
  kbSave(list);
  KB_ACTIVE_ID = entry.id;
  kbRender();
}

function kbDelete(id) {
  var all = kbLoad();
  var deleted = all.find(function(e) { return e.id === id; });
  if (!deleted) return;
  var list = all.filter(function(e) { return e.id !== id; });
  kbSave(list);
  if (KB_ACTIVE_ID === id) KB_ACTIVE_ID = list[0] ? list[0].id : null;
  kbRender();
  if (typeof undoPush === 'function') {
    undoPush(function() {
      var cur = kbLoad();
      cur.unshift(deleted);
      kbSave(cur);
      KB_ACTIVE_ID = deleted.id;
      kbRender();
    }, 'KB entry');
  } else {
    toast('Entry deleted');
  }
}

function kbUpdate(id, field, value) {
  var list = kbLoad();
  var e = list.find(function(x) { return x.id === id; });
  if (!e) return;
  e[field] = value;
  e.updated = new Date().toISOString();
  kbSave(list);
  if (field === 'title') {
    var side = document.querySelector('.kb-list-item[data-id="' + id + '"] .kb-list-title');
    if (side) side.textContent = value || 'Untitled';
  }
  if (field === 'system' || field === 'audience') {
    kbRender();
  }
}

function kbSelect(id) {
  KB_ACTIVE_ID = id;
  kbRender();
}

function kbFiltered() {
  var list = kbLoad();
  var q = KB_SEARCH.trim().toLowerCase();
  return list.filter(function(e) {
    if (KB_SYS_FILTER !== 'all' && e.system !== KB_SYS_FILTER) return false;
    if (KB_AUD_FILTER !== 'all' && e.audience !== KB_AUD_FILTER) return false;
    if (q) {
      var hay = (e.title + ' ' + e.body + ' ' + e.system + ' ' + e.audience).toLowerCase();
      if (hay.indexOf(q) < 0) return false;
    }
    return true;
  });
}

function kbRender() {
  var list = kbFiltered();
  if (!KB_ACTIVE_ID && list.length > 0) KB_ACTIVE_ID = list[0].id;
  var active = list.find(function(e) { return e.id === KB_ACTIVE_ID; });

  var sidebar = document.getElementById('kbSidebarList');
  if (sidebar) {
    if (list.length === 0) {
      sidebar.innerHTML = '<div class="kb-list-empty">No entries match. <a href="#" onclick="kbAdd();return false">Create one</a>.</div>';
    } else {
      sidebar.innerHTML = list.map(function(e) {
        var isActive = e.id === KB_ACTIVE_ID;
        return '<div class="kb-list-item' + (isActive ? ' kb-active' : '') + '" data-id="' + e.id + '" onclick="kbSelect(\'' + e.id + '\')">' +
          '<div class="kb-list-title">' + kbEsc(e.title || 'Untitled') + '</div>' +
          '<div class="kb-list-meta"><span class="kb-tag kb-tag-sys">' + e.system + '</span><span class="kb-tag kb-tag-aud">' + e.audience + '</span></div>' +
        '</div>';
      }).join('');
    }
  }

  var main = document.getElementById('kbMain');
  if (!main) return;
  if (!active) {
    main.innerHTML = '<div class="kb-empty-main"><p>No entry selected.</p><button class="tl-btn tl-btn-new" onclick="kbAdd()">+ New entry</button></div>';
    return;
  }

  var previewOn = kbGetPreview();
  var bodyPane = previewOn
    ? '<div class="kb-edit-split">' +
        '<textarea class="kb-edit-body" placeholder="# Summary&#10;&#10;What this covers\u2026" oninput="kbUpdate(\'' + active.id + '\', \'body\', this.value);kbUpdatePreview()">' + kbEsc(active.body) + '</textarea>' +
        '<div class="kb-edit-preview" id="kbPreviewPane">' + kbMdToHtml(active.body) + '</div>' +
      '</div>'
    : '<textarea class="kb-edit-body" placeholder="# Summary&#10;&#10;What this covers\u2026&#10;&#10;## Steps&#10;&#10;1. Check X&#10;2. Verify Y" oninput="kbUpdate(\'' + active.id + '\', \'body\', this.value)">' + kbEsc(active.body) + '</textarea>';

  main.innerHTML =
    '<div class="kb-edit-head">' +
      '<input class="kb-edit-title" type="text" value="' + kbEsc(active.title) + '" placeholder="Entry title" oninput="kbUpdate(\'' + active.id + '\', \'title\', this.value)">' +
      '<div class="kb-edit-tags">' +
        '<select onchange="kbUpdate(\'' + active.id + '\', \'system\', this.value)">' +
          KB_SYSTEMS.map(function(s) { return '<option' + (s === active.system ? ' selected' : '') + '>' + s + '</option>'; }).join('') +
        '</select>' +
        '<select onchange="kbUpdate(\'' + active.id + '\', \'audience\', this.value)">' +
          KB_AUDIENCES.map(function(a) { return '<option' + (a === active.audience ? ' selected' : '') + '>' + a + '</option>'; }).join('') +
        '</select>' +
        '<select onchange="kbUpdate(\'' + active.id + '\', \'severity\', this.value)">' +
          ['P1', 'P2', 'P3', 'Info'].map(function(s) { return '<option' + (s === active.severity ? ' selected' : '') + '>' + s + '</option>'; }).join('') +
        '</select>' +
        '<button class="kb-preview-toggle' + (previewOn ? ' kb-preview-on' : '') + '" onclick="kbTogglePreview()" title="Toggle preview pane">' +
          (previewOn ? '\u25A3 Edit + preview' : '\u25A1 Preview') +
        '</button>' +
      '</div>' +
    '</div>' +
    bodyPane +
    '<div class="kb-edit-footer">' +
      '<span class="kb-edit-meta">Updated ' + new Date(active.updated).toLocaleString() + '</span>' +
      '<div class="kb-edit-actions">' +
        '<button class="tl-btn" onclick="kbCopy(\'' + active.id + '\')">Copy markdown</button>' +
        '<button class="tl-btn tl-btn-del" onclick="kbDelete(\'' + active.id + '\')">Delete</button>' +
      '</div>' +
    '</div>';
}

function kbUpdatePreview() {
  var pane = document.getElementById('kbPreviewPane');
  if (!pane) return;
  var list = kbLoad();
  var active = list.find(function(e) { return e.id === KB_ACTIVE_ID; });
  if (active) pane.innerHTML = kbMdToHtml(active.body);
}

function kbCopy(id) {
  var e = kbLoad().find(function(x) { return x.id === id; });
  if (!e) return;
  var md = '# ' + e.title + '\n\n' +
    '**System:** ' + e.system + '  \n' +
    '**Audience:** ' + e.audience + '  \n' +
    '**Severity:** ' + e.severity + '\n\n' +
    e.body;
  navigator.clipboard.writeText(md).then(function() { toast('Copied markdown'); }).catch(function() { toast('Copy failed'); });
}

function kbSetSysFilter(v) { KB_SYS_FILTER = v; kbRender(); }
function kbSetAudFilter(v) { KB_AUD_FILTER = v; kbRender(); }
function kbSetSearch(v) { KB_SEARCH = v; kbRender(); }

function kbExportJSON() {
  var list = kbLoad();
  var blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'kb-backup-' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('Backup saved');
}

function kbImportJSON(file) {
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var parsed = JSON.parse(e.target.result);
      if (!Array.isArray(parsed)) throw new Error('Expected array');
      kbSave(parsed);
      KB_ACTIVE_ID = null;
      kbRender();
      toast('Imported ' + parsed.length + ' entries');
    } catch (err) {
      toast('Import failed: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function kbEsc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

kbRender();
