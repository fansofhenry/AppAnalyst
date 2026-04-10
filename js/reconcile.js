// ═══════════════════════════════════════════════════════
// RECONCILIATION HELPER — Paste Exchange roster CSV + Home
// SIS roster CSV, diff by student key + course, flag mismatches.
// Pure client-side. Field-mapping presets saved per college.
// ═══════════════════════════════════════════════════════

var RC_KEY_FIELD = 'studentId';
var RC_COURSE_FIELD = 'course';
var RC_UNITS_FIELD = 'units';
var RC_TERM_FIELD = 'term';
var RC_PRESETS_KEY = 'appanalyst.reconcile.presets.v1';
var RC_LAST_FIELDS = null; // Cached from last successful rcRun

function rcPresetsLoad() {
  try {
    var raw = localStorage.getItem(RC_PRESETS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) { return {}; }
}

function rcPresetsSave(p) {
  localStorage.setItem(RC_PRESETS_KEY, JSON.stringify(p));
}

function rcPresetSave() {
  var name = prompt('Save this field mapping under which college name?');
  if (!name) return;
  if (!RC_LAST_FIELDS) { toast('Run a reconcile first to capture the field mapping'); return; }
  var presets = rcPresetsLoad();
  presets[name] = {
    exKey: RC_LAST_FIELDS.exKey,
    siKey: RC_LAST_FIELDS.siKey,
    exCourse: RC_LAST_FIELDS.exCourse,
    siCourse: RC_LAST_FIELDS.siCourse,
    exUnits: RC_LAST_FIELDS.exUnits,
    siUnits: RC_LAST_FIELDS.siUnits,
    exTerm: RC_LAST_FIELDS.exTerm,
    siTerm: RC_LAST_FIELDS.siTerm,
    updated: new Date().toISOString()
  };
  rcPresetsSave(presets);
  toast('Saved preset for ' + name);
  rcPresetsRender();
}

function rcPresetDelete(name) {
  if (!confirm('Delete preset for ' + name + '?')) return;
  var presets = rcPresetsLoad();
  delete presets[name];
  rcPresetsSave(presets);
  rcPresetsRender();
  toast('Deleted');
}

function rcPresetApply(name) {
  var presets = rcPresetsLoad();
  var p = presets[name];
  if (!p) return;
  // We can't inject the preset into column detection directly — instead,
  // we show an info note about which fields the preset expects.
  var msg = 'Preset for ' + name + ' expects these columns:\n' +
    'Exchange: ' + (p.exKey || '?') + ', ' + (p.exCourse || '?') + (p.exUnits ? ', ' + p.exUnits : '') + (p.exTerm ? ', ' + p.exTerm : '') + '\n' +
    'Home SIS: ' + (p.siKey || '?') + ', ' + (p.siCourse || '?') + (p.siUnits ? ', ' + p.siUnits : '') + (p.siTerm ? ', ' + p.siTerm : '');
  alert(msg);
}

function rcPresetsRender() {
  var wrap = document.getElementById('rcPresets');
  if (!wrap) return;
  var presets = rcPresetsLoad();
  var names = Object.keys(presets).sort();
  if (names.length === 0) {
    wrap.innerHTML = '<span class="rc-presets-empty">No presets saved yet. Run a reconcile, then click <strong>Save as preset</strong>.</span>';
    return;
  }
  wrap.innerHTML = '<span class="rc-presets-label">Presets:</span>' +
    names.map(function(n) {
      return '<span class="rc-preset-chip"><button class="rc-preset-name" onclick="rcPresetApply(\'' + n.replace(/\'/g, "\\\\'") + '\')">' + rcEsc(n) + '</button><button class="rc-preset-x" onclick="rcPresetDelete(\'' + n.replace(/\'/g, "\\\\'") + '\')" title="Delete">&times;</button></span>';
    }).join('');
}

function rcParse(csv) {
  if (!csv || !csv.trim()) return { headers: [], rows: [] };
  // Simple CSV parser — handles quoted fields with commas and escaped quotes
  var lines = csv.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(function(l) { return l.trim().length > 0; });
  if (lines.length === 0) return { headers: [], rows: [] };

  function splitLine(line) {
    var out = [];
    var cur = '';
    var inQuotes = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') { inQuotes = false; }
        else cur += ch;
      } else {
        if (ch === '"') inQuotes = true;
        else if (ch === ',') { out.push(cur); cur = ''; }
        else cur += ch;
      }
    }
    out.push(cur);
    return out;
  }

  var headers = splitLine(lines[0]).map(function(h) { return h.trim(); });
  var rows = lines.slice(1).map(function(l) {
    var parts = splitLine(l);
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = (parts[i] || '').trim(); });
    return obj;
  });
  return { headers: headers, rows: rows };
}

function rcNormalizeKey(s) {
  return (s || '').toString().trim().toLowerCase().replace(/\s+/g, '');
}

function rcGuessField(headers, candidates) {
  for (var i = 0; i < candidates.length; i++) {
    var wanted = candidates[i].toLowerCase();
    for (var j = 0; j < headers.length; j++) {
      if (headers[j].toLowerCase().replace(/[\s_-]/g, '') === wanted.replace(/[\s_-]/g, '')) return headers[j];
    }
  }
  // Partial match
  for (var k = 0; k < candidates.length; k++) {
    for (var m = 0; m < headers.length; m++) {
      if (headers[m].toLowerCase().indexOf(candidates[k].toLowerCase()) >= 0) return headers[m];
    }
  }
  return '';
}

function rcRun() {
  var exCsv = document.getElementById('rcExchange').value;
  var siCsv = document.getElementById('rcSis').value;

  var ex = rcParse(exCsv);
  var si = rcParse(siCsv);

  if (ex.rows.length === 0 && si.rows.length === 0) {
    document.getElementById('rcResults').innerHTML = '<div class="rc-hint">Paste a CSV into each box above, then click <strong>Reconcile</strong>. Both files should have a student ID/CCCID column and a course column. Units and term are compared if present.</div>';
    return;
  }

  // Figure out fields for each
  var exKey = rcGuessField(ex.headers, ['cccid', 'studentid', 'id', 'studentnumber']);
  var siKey = rcGuessField(si.headers, ['cccid', 'studentid', 'id', 'studentnumber', 'spriden']);
  var exCourse = rcGuessField(ex.headers, ['course', 'crn', 'sectionid', 'section']);
  var siCourse = rcGuessField(si.headers, ['course', 'crn', 'sectionid', 'section']);
  var exUnits = rcGuessField(ex.headers, ['units', 'credits', 'credithours']);
  var siUnits = rcGuessField(si.headers, ['units', 'credits', 'credithours']);
  var exTerm = rcGuessField(ex.headers, ['term', 'semester']);
  var siTerm = rcGuessField(si.headers, ['term', 'semester']);

  // Cache for preset save
  RC_LAST_FIELDS = { exKey: exKey, siKey: siKey, exCourse: exCourse, siCourse: siCourse, exUnits: exUnits, siUnits: siUnits, exTerm: exTerm, siTerm: siTerm };

  if (!exKey || !siKey) {
    document.getElementById('rcResults').innerHTML = '<div class="rc-error">Could not find a student ID column in one of the CSVs. Columns detected:<br><strong>Exchange:</strong> ' + (ex.headers.join(', ') || '(none)') + '<br><strong>Home SIS:</strong> ' + (si.headers.join(', ') || '(none)') + '<br>Expected something like <code>cccid</code>, <code>studentId</code>, or <code>student_number</code>.</div>';
    return;
  }

  if (!exCourse || !siCourse) {
    document.getElementById('rcResults').innerHTML = '<div class="rc-error">Could not find a course/section column in one of the CSVs. Expected <code>course</code>, <code>crn</code>, or <code>section</code>.</div>';
    return;
  }

  // Build composite keys: student + course
  var exMap = {};
  ex.rows.forEach(function(r) {
    var k = rcNormalizeKey(r[exKey]) + '|' + rcNormalizeKey(r[exCourse]);
    exMap[k] = r;
  });

  var siMap = {};
  si.rows.forEach(function(r) {
    var k = rcNormalizeKey(r[siKey]) + '|' + rcNormalizeKey(r[siCourse]);
    siMap[k] = r;
  });

  var missingInSis = [];   // In Exchange but not in home SIS (enrollment dropped)
  var missingInEx = [];    // In home SIS but not in Exchange (stale, or data entry)
  var unitMismatch = [];
  var termMismatch = [];
  var matched = 0;

  Object.keys(exMap).forEach(function(k) {
    var exRow = exMap[k];
    var siRow = siMap[k];
    if (!siRow) {
      missingInSis.push(exRow);
      return;
    }
    matched++;
    if (exUnits && siUnits) {
      var eu = (exRow[exUnits] || '').trim();
      var su = (siRow[siUnits] || '').trim();
      if (eu && su && eu !== su) unitMismatch.push({ ex: exRow, si: siRow, exUnits: eu, siUnits: su });
    }
    if (exTerm && siTerm) {
      var et = (exRow[exTerm] || '').trim();
      var st = (siRow[siTerm] || '').trim();
      if (et && st && et !== st) termMismatch.push({ ex: exRow, si: siRow, exTerm: et, siTerm: st });
    }
  });

  Object.keys(siMap).forEach(function(k) {
    if (!exMap[k]) missingInEx.push(siMap[k]);
  });

  var html = '';

  // Field-mapping summary
  html += '<div class="rc-mapping">' +
    '<div class="rc-mapping-title">Field mapping (auto-detected)</div>' +
    '<div class="rc-mapping-grid">' +
      '<div><span class="rc-m-label">Student key</span><span class="rc-m-val">' + exKey + ' ↔ ' + siKey + '</span></div>' +
      '<div><span class="rc-m-label">Course</span><span class="rc-m-val">' + exCourse + ' ↔ ' + siCourse + '</span></div>' +
      '<div><span class="rc-m-label">Units</span><span class="rc-m-val">' + (exUnits ? exUnits + ' ↔ ' + siUnits : 'skipped') + '</span></div>' +
      '<div><span class="rc-m-label">Term</span><span class="rc-m-val">' + (exTerm ? exTerm + ' ↔ ' + siTerm : 'skipped') + '</span></div>' +
    '</div>' +
  '</div>';

  // Summary strip
  html += '<div class="rc-summary">' +
    '<div class="rc-sum-item"><div class="rc-sum-num">' + ex.rows.length + '</div><div class="rc-sum-label">Exchange rows</div></div>' +
    '<div class="rc-sum-item"><div class="rc-sum-num">' + si.rows.length + '</div><div class="rc-sum-label">SIS rows</div></div>' +
    '<div class="rc-sum-item"><div class="rc-sum-num" style="color:var(--primary)">' + matched + '</div><div class="rc-sum-label">Matched</div></div>' +
    '<div class="rc-sum-item"><div class="rc-sum-num" style="color:var(--red)">' + missingInSis.length + '</div><div class="rc-sum-label">Missing from SIS</div></div>' +
    '<div class="rc-sum-item"><div class="rc-sum-num" style="color:var(--amber)">' + missingInEx.length + '</div><div class="rc-sum-label">Missing from Exchange</div></div>' +
    '<div class="rc-sum-item"><div class="rc-sum-num" style="color:var(--amber)">' + (unitMismatch.length + termMismatch.length) + '</div><div class="rc-sum-label">Field mismatches</div></div>' +
  '</div>';

  // Missing from SIS (most urgent — Exchange sent, SIS didn't record)
  if (missingInSis.length > 0) {
    html += '<div class="rc-section rc-section-red">' +
      '<div class="rc-section-head"><span class="rc-section-title">Enrollments missing from home SIS (' + missingInSis.length + ')</span><span class="rc-section-help">Exchange has the enrollment, but the home SIS doesn\'t. This is the manual-reconciliation bucket — units need to be posted by hand.</span></div>' +
      rcTable(missingInSis, ex.headers) +
    '</div>';
  }

  if (missingInEx.length > 0) {
    html += '<div class="rc-section rc-section-amber">' +
      '<div class="rc-section-head"><span class="rc-section-title">Rows in SIS but not in Exchange (' + missingInEx.length + ')</span><span class="rc-section-help">Stale rows, data-entry drift, or student dropped via Exchange without home SIS update.</span></div>' +
      rcTable(missingInEx, si.headers) +
    '</div>';
  }

  if (unitMismatch.length > 0) {
    html += '<div class="rc-section rc-section-amber">' +
      '<div class="rc-section-head"><span class="rc-section-title">Unit count mismatches (' + unitMismatch.length + ')</span><span class="rc-section-help">Student and course match, but unit values differ.</span></div>' +
      '<table class="rc-table"><thead><tr><th>Student</th><th>Course</th><th>Exchange units</th><th>SIS units</th></tr></thead><tbody>' +
      unitMismatch.map(function(m) {
        return '<tr><td>' + rcEsc(m.ex[exKey]) + '</td><td>' + rcEsc(m.ex[exCourse]) + '</td><td class="rc-diff-l">' + rcEsc(m.exUnits) + '</td><td class="rc-diff-r">' + rcEsc(m.siUnits) + '</td></tr>';
      }).join('') +
      '</tbody></table>' +
    '</div>';
  }

  if (termMismatch.length > 0) {
    html += '<div class="rc-section rc-section-amber">' +
      '<div class="rc-section-head"><span class="rc-section-title">Term mismatches (' + termMismatch.length + ')</span></div>' +
      '<table class="rc-table"><thead><tr><th>Student</th><th>Course</th><th>Exchange term</th><th>SIS term</th></tr></thead><tbody>' +
      termMismatch.map(function(m) {
        return '<tr><td>' + rcEsc(m.ex[exKey]) + '</td><td>' + rcEsc(m.ex[exCourse]) + '</td><td class="rc-diff-l">' + rcEsc(m.exTerm) + '</td><td class="rc-diff-r">' + rcEsc(m.siTerm) + '</td></tr>';
      }).join('') +
      '</tbody></table>' +
    '</div>';
  }

  if (missingInSis.length === 0 && missingInEx.length === 0 && unitMismatch.length === 0 && termMismatch.length === 0) {
    html += '<div class="rc-clean">All ' + matched + ' rows match. No reconciliation needed.</div>';
  }

  document.getElementById('rcResults').innerHTML = html;
}

function rcTable(rows, headers) {
  if (rows.length === 0) return '';
  var show = headers.slice(0, 5);
  return '<table class="rc-table"><thead><tr>' +
    show.map(function(h) { return '<th>' + rcEsc(h) + '</th>'; }).join('') +
    '</tr></thead><tbody>' +
    rows.slice(0, 50).map(function(r) {
      return '<tr>' + show.map(function(h) { return '<td>' + rcEsc(r[h]) + '</td>'; }).join('') + '</tr>';
    }).join('') +
    '</tbody></table>' +
    (rows.length > 50 ? '<div class="rc-more">Showing first 50 of ' + rows.length + ' rows.</div>' : '');
}

function rcEsc(s) {
  return (s || '').toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function rcLoadSample() {
  document.getElementById('rcExchange').value =
    'cccid,course,units,term\nCCC123,MATH1A,5,Spring2026\nCCC456,ENGL1A,3,Spring2026\nCCC789,BIOL10,4,Spring2026\nCCC321,HIST17A,3,Spring2026';
  document.getElementById('rcSis').value =
    'cccid,course,units,term\nCCC123,MATH1A,5,Spring2026\nCCC456,ENGL1A,4,Spring2026\nCCC321,HIST17A,3,Fall2025';
  rcRun();
}

function rcClear() {
  document.getElementById('rcExchange').value = '';
  document.getElementById('rcSis').value = '';
  document.getElementById('rcResults').innerHTML = '<div class="rc-hint">Paste a CSV into each box above, then click <strong>Reconcile</strong>.</div>';
}

// Initial presets render
rcPresetsRender();
