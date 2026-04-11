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

function kbLoad() {
  try {
    var raw = localStorage.getItem(KB_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { }
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
  localStorage.setItem(KB_KEY, JSON.stringify(entries));
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
