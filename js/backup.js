// ═══════════════════════════════════════════════════════
// BACKUP / RESTORE — One-file export of everything.
// Stores covered: tickets, KB, college overlay, onboarding,
// incidents (when added). Restore replaces in-place.
// ═══════════════════════════════════════════════════════

var BACKUP_STORES = [
  { key: 'appanalyst.tickets.v1', name: 'tickets' },
  { key: 'appanalyst.kb.v1', name: 'kb' },
  { key: 'appanalyst.colleges.overlay.v1', name: 'colleges' },
  { key: 'appanalyst.onboarding.v1', name: 'onboarding' },
  { key: 'appanalyst.incidents.v1', name: 'incidents' }
];
var BACKUP_VERSION = 1;

function backupExportAll() {
  var snapshot = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    source: 'AppAnalyst Hub',
    stores: {}
  };
  BACKUP_STORES.forEach(function(s) {
    try {
      var raw = localStorage.getItem(s.key);
      snapshot.stores[s.name] = raw ? JSON.parse(raw) : null;
    } catch (e) {
      snapshot.stores[s.name] = null;
    }
  });

  var blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'appanalyst-backup-' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Count items for the confirmation toast
  var counts = [];
  BACKUP_STORES.forEach(function(s) {
    var data = snapshot.stores[s.name];
    var n = 0;
    if (Array.isArray(data)) n = data.length;
    else if (data && typeof data === 'object') n = Object.keys(data).length;
    if (n > 0) counts.push(n + ' ' + s.name);
  });
  toast('Backup saved — ' + (counts.length ? counts.join(', ') : 'no data'));
}

function backupImportAll(file) {
  if (!confirm('Restore will REPLACE all current data (tickets, KB, college notes, onboarding). Continue?')) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var snapshot = JSON.parse(e.target.result);
      if (!snapshot.stores || typeof snapshot.stores !== 'object') {
        throw new Error('Not a valid backup file (missing stores)');
      }
      var restored = [];
      BACKUP_STORES.forEach(function(s) {
        if (snapshot.stores[s.name] != null) {
          localStorage.setItem(s.key, JSON.stringify(snapshot.stores[s.name]));
          restored.push(s.name);
        }
      });
      toast('Restored ' + restored.length + ' stores — refreshing...');
      setTimeout(function() { location.reload(); }, 1200);
    } catch (err) {
      toast('Restore failed: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function backupOpen() {
  var modal = document.getElementById('backupModal');
  if (modal) modal.classList.add('backup-show');
}

function backupClose() {
  var modal = document.getElementById('backupModal');
  if (modal) modal.classList.remove('backup-show');
}

function backupClearAll() {
  if (!confirm('This will DELETE all data: tickets, KB, college notes, onboarding progress. This cannot be undone. Are you sure?')) return;
  if (!confirm('Really sure? This is irreversible. Consider exporting a backup first.')) return;
  BACKUP_STORES.forEach(function(s) { localStorage.removeItem(s.key); });
  toast('All data cleared — refreshing...');
  setTimeout(function() { location.reload(); }, 1200);
}

function backupStats() {
  var lines = [];
  BACKUP_STORES.forEach(function(s) {
    try {
      var raw = localStorage.getItem(s.key);
      if (!raw) { lines.push({ name: s.name, count: 0, size: 0 }); return; }
      var data = JSON.parse(raw);
      var n = Array.isArray(data) ? data.length : (data && typeof data === 'object' ? Object.keys(data).length : 0);
      lines.push({ name: s.name, count: n, size: raw.length });
    } catch (e) {
      lines.push({ name: s.name, count: 0, size: 0 });
    }
  });
  return lines;
}

function backupRenderStats() {
  if (typeof shRenderBar === 'function') shRenderBar();
  var wrap = document.getElementById('backupStats');
  if (!wrap) return;
  var stats = backupStats();
  var totalSize = stats.reduce(function(a, b) { return a + b.size; }, 0);
  wrap.innerHTML = stats.map(function(s) {
    return '<div class="backup-stat-row"><span class="backup-stat-name">' + s.name + '</span><span class="backup-stat-count">' + s.count + ' entries</span><span class="backup-stat-size">' + (s.size < 1024 ? s.size + ' B' : (s.size / 1024).toFixed(1) + ' KB') + '</span></div>';
  }).join('') + '<div class="backup-stat-total">Total: ' + (totalSize < 1024 ? totalSize + ' B' : (totalSize / 1024).toFixed(1) + ' KB') + '</div>';
}
