// ═══════════════════════════════════════════════════════
// STORAGE — Safe localStorage wrapper
//
// Wraps localStorage to catch three failure modes that
// silently lost data in Pass 1:
//   1. Private browsing / Safari partitioned storage
//      (localStorage throws on access, not on setItem)
//   2. QuotaExceededError on mobile where the 5 MB cap
//      is often shared with the site's other stores
//   3. Corrupt JSON from a partial or interrupted write
//
// Anything caught here surfaces a visible toast instead
// of silently dropping the ticket, note, or KB entry the
// analyst just typed. Works even if toast() is not yet
// defined (logs to console as a fallback).
// ═══════════════════════════════════════════════════════

(function (global) {
  'use strict';

  function available() {
    try {
      var k = '__aa_probe__';
      localStorage.setItem(k, '1');
      localStorage.removeItem(k);
      return true;
    } catch (e) {
      return false;
    }
  }

  var OK = available();
  var _warned = false;
  function warnOnce(msg) {
    if (_warned) return;
    _warned = true;
    if (typeof toast === 'function') {
      toast(msg);
    } else if (typeof console !== 'undefined') {
      console.warn('[storage]', msg);
    }
  }

  function isQuota(err) {
    if (!err) return false;
    return err.name === 'QuotaExceededError' ||
           err.code === 22 ||
           err.code === 1014 ||
           /quota/i.test(err.message || '');
  }

  function get(key, fallback) {
    if (!OK) return fallback;
    try {
      var raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      // Corrupt JSON — surface once, return fallback so UI keeps working.
      warnOnce('Stored data for "' + key + '" was corrupt and will be replaced on next save.');
      return fallback;
    }
  }

  function getRaw(key) {
    if (!OK) return null;
    try { return localStorage.getItem(key); }
    catch (e) { return null; }
  }

  function set(key, value) {
    if (!OK) {
      warnOnce('Browser storage unavailable — changes will not persist. Export a backup before closing.');
      return false;
    }
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      if (isQuota(e)) {
        warnOnce('Storage full — export a backup and clear old tickets to free space.');
      } else {
        warnOnce('Could not save "' + key + '": ' + (e.message || e));
      }
      return false;
    }
  }

  function setRaw(key, raw) {
    if (!OK) {
      warnOnce('Browser storage unavailable — changes will not persist.');
      return false;
    }
    try {
      localStorage.setItem(key, raw);
      return true;
    } catch (e) {
      if (isQuota(e)) {
        warnOnce('Storage full — export a backup and clear old tickets to free space.');
      } else {
        warnOnce('Could not save "' + key + '": ' + (e.message || e));
      }
      return false;
    }
  }

  function remove(key) {
    if (!OK) return false;
    try { localStorage.removeItem(key); return true; }
    catch (e) { return false; }
  }

  // Report approximate usage for the storage health panel.
  function usageBytes() {
    if (!OK) return 0;
    var total = 0;
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf('appanalyst.') === 0) {
          var v = localStorage.getItem(k);
          if (v) total += k.length + v.length;
        }
      }
    } catch (e) {}
    return total;
  }

  global.safeStorage = {
    available: OK,
    get: get,
    getRaw: getRaw,
    set: set,
    setRaw: setRaw,
    remove: remove,
    usageBytes: usageBytes
  };
})(window);
