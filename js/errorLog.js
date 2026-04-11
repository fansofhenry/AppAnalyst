// ═══════════════════════════════════════════════════════
// ERROR LOG — Local client-side error observability
//
// A hub that runs from GitHub Pages has no backend and no
// telemetry. When something throws in a hot path (render,
// save, migration), the analyst sees "nothing happened" and
// has no way to report what failed. A non-technical user
// will never open devtools.
//
// This module captures:
//   • uncaught errors (window.onerror)
//   • unhandled promise rejections
//   • explicit errorLog.record(err, context) calls from
//     the app's catch blocks
//
// It keeps a ring buffer of the 50 most recent errors in
// localStorage under appanalyst.errorLog.v1, so the user
// can inspect them in the storage health panel — and copy
// them into an email or a PR.
//
// Non-goals: this does NOT send anything off-device. It
// does NOT replace devtools. It gives the user a record.
// ═══════════════════════════════════════════════════════

(function (global) {
  'use strict';

  var LOG_KEY = 'appanalyst.errorLog.v1';
  var MAX_ENTRIES = 50;
  // Cheap in-process dedupe — same signature + context within 2s is
  // almost always the same handler firing twice (e.g. oninput + blur).
  var DEDUPE_WINDOW_MS = 2000;
  var _lastSig = '';
  var _lastAt = 0;

  function nowIso() {
    return new Date().toISOString();
  }

  function load() {
    try {
      if (typeof safeStorage !== 'undefined') {
        var v = safeStorage.get(LOG_KEY, []);
        return Array.isArray(v) ? v : [];
      }
      var raw = localStorage.getItem(LOG_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveRaw(list) {
    try {
      if (typeof safeStorage !== 'undefined') {
        safeStorage.set(LOG_KEY, list);
        return;
      }
      localStorage.setItem(LOG_KEY, JSON.stringify(list));
    } catch (e) {
      // If the error log itself can't be persisted we deliberately do
      // nothing — logging the "can't log" would be a loop.
    }
  }

  // Normalize any thrown value into a plain object we can persist.
  // Errors have non-enumerable name/message/stack so JSON.stringify
  // would otherwise lose them.
  function normalize(err) {
    if (err == null) return { message: String(err) };
    if (typeof err === 'string') return { message: err };
    if (err instanceof Error || (err && typeof err.message === 'string')) {
      return {
        name: err.name || 'Error',
        message: err.message || String(err),
        stack: typeof err.stack === 'string' ? err.stack.split('\n').slice(0, 8).join('\n') : undefined
      };
    }
    try {
      return { message: JSON.stringify(err) };
    } catch (e) {
      return { message: String(err) };
    }
  }

  // Public: push an entry. context is a short label ("tlRender",
  // "backup.import", etc.) — not free-form user text.
  function record(err, context) {
    var info = normalize(err);
    var sig = (context || '') + '|' + info.message;
    var at = Date.now();
    if (sig === _lastSig && at - _lastAt < DEDUPE_WINDOW_MS) {
      _lastAt = at;
      return;
    }
    _lastSig = sig;
    _lastAt = at;

    var entry = {
      at: nowIso(),
      context: context || 'unknown',
      name: info.name || 'Error',
      message: info.message,
      stack: info.stack,
      url: (typeof location !== 'undefined' && location.href) ? location.href : ''
    };

    var list = load();
    list.unshift(entry);
    if (list.length > MAX_ENTRIES) list.length = MAX_ENTRIES;
    saveRaw(list);
  }

  function recent(n) {
    var list = load();
    if (typeof n !== 'number' || n <= 0) return list.slice();
    return list.slice(0, n);
  }

  function clear() {
    saveRaw([]);
    _lastSig = '';
    _lastAt = 0;
  }

  function count() {
    return load().length;
  }

  // Format for export — a single plain-text block the user can paste
  // into an email or a GitHub issue.
  function formatForExport() {
    var list = load();
    if (list.length === 0) return 'No errors logged.';
    return list.map(function (e) {
      return '[' + e.at + '] ' + (e.context || 'unknown') + '\n  ' +
             (e.name || 'Error') + ': ' + (e.message || '(no message)') +
             (e.stack ? '\n  ' + e.stack.replace(/\n/g, '\n  ') : '');
    }).join('\n\n');
  }

  // Attach to the global scope. Done separately so the pure record
  // function is testable in Node without a window.
  function attach() {
    if (typeof window === 'undefined') return;
    window.addEventListener('error', function (event) {
      record(event.error || event.message, 'window.onerror:' + (event.filename || '?') + ':' + (event.lineno || '?'));
    });
    window.addEventListener('unhandledrejection', function (event) {
      record(event.reason, 'unhandledrejection');
    });
  }

  global.errorLog = {
    record: record,
    recent: recent,
    clear: clear,
    count: count,
    formatForExport: formatForExport,
    normalize: normalize,
    attach: attach,
    MAX_ENTRIES: MAX_ENTRIES,
    KEY: LOG_KEY
  };

  // Auto-attach in a real browser. In Node (tests) the caller drives it.
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    attach();
  }
})(typeof window !== 'undefined' ? window : this);
