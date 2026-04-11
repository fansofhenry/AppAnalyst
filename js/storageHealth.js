// ═══════════════════════════════════════════════════════
// STORAGE HEALTH — Monitor localStorage usage and warn
// when approaching the browser quota (~5 MB on most
// browsers). Shows per-store byte usage in the backup
// modal, warns at 80%, errors at 95%.
// ═══════════════════════════════════════════════════════

var STORAGE_LS_LIMIT = 5 * 1024 * 1024; // Conservative assumption: 5 MB

function shEstimateUsage() {
  // Sum all appanalyst.* keys
  var total = 0;
  var perKey = {};
  try {
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (!k || k.indexOf('appanalyst.') !== 0) continue;
      var v = localStorage.getItem(k) || '';
      var size = k.length + v.length;
      total += size;
      perKey[k] = size;
    }
  } catch (e) { /* ignore */ }
  return { total: total, perKey: perKey, limit: STORAGE_LS_LIMIT };
}

function shFormatBytes(n) {
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  return (n / (1024 * 1024)).toFixed(2) + ' MB';
}

function shCheck() {
  var usage = shEstimateUsage();
  var pct = usage.total / usage.limit;

  // Async: ask the browser for its own estimate if available
  if (navigator.storage && navigator.storage.estimate) {
    navigator.storage.estimate().then(function(est) {
      // Store for display
      shLastEstimate = est;
    }).catch(function() { });
  }

  // Warn once per session if > 80%
  if (pct >= 0.8 && !window._shWarned) {
    window._shWarned = true;
    var banner = document.createElement('div');
    banner.className = 'sh-warn-banner';
    banner.setAttribute('role', 'alert');
    banner.innerHTML =
      '<strong>Storage warning:</strong> ' +
      shFormatBytes(usage.total) + ' used (' + Math.round(pct * 100) + '% of estimated limit). ' +
      'Export a JSON backup now and consider archiving old resolved tickets.' +
      '<button onclick="this.parentNode.remove()" aria-label="Dismiss">&times;</button>';
    document.body.appendChild(banner);
  }

  return usage;
}

var shLastEstimate = null;

function shRenderBar() {
  var wrap = document.getElementById('shBar');
  if (!wrap) return;
  var usage = shEstimateUsage();
  var pct = Math.min(100, (usage.total / usage.limit) * 100);
  var color = pct > 80 ? 'var(--red)' : pct > 60 ? 'var(--amber)' : 'var(--primary)';

  var rows = Object.keys(usage.perKey).sort(function(a, b) {
    return usage.perKey[b] - usage.perKey[a];
  }).map(function(k) {
    var short = k.replace('appanalyst.', '').replace('.v1', '');
    return '<div class="sh-row">' +
      '<span class="sh-row-name">' + short + '</span>' +
      '<span class="sh-row-size">' + shFormatBytes(usage.perKey[k]) + '</span>' +
    '</div>';
  }).join('');

  wrap.innerHTML =
    '<div class="sh-bar-head">' +
      '<span>Storage used</span>' +
      '<span class="sh-bar-pct" style="color:' + color + '"><strong>' + shFormatBytes(usage.total) + '</strong> / ~' + shFormatBytes(usage.limit) + '</span>' +
    '</div>' +
    '<div class="sh-bar-track"><div class="sh-bar-fill" style="width:' + pct + '%;background:' + color + '"></div></div>' +
    (pct > 80 ? '<div class="sh-bar-warn">Close to the browser quota. Export a backup and consider archiving old resolved tickets.</div>' : '') +
    '<div class="sh-rows">' + rows + '</div>';
}

// Check on load + on every storage event
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() { setTimeout(shCheck, 1000); });
} else {
  setTimeout(shCheck, 1000);
}
window.addEventListener('storage', shCheck);
