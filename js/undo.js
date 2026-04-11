// ═══════════════════════════════════════════════════════
// UNDO — Catch-all undo for deletes. Each delete caches the
// deleted item; an undo toast restores it if clicked within
// the window. No history stack — one level of undo.
// ═══════════════════════════════════════════════════════

var UNDO_WINDOW_MS = 8000;
var UNDO_STATE = null;
var UNDO_TIMER = null;

function undoPush(restoreFn, label) {
  UNDO_STATE = { restoreFn: restoreFn, label: label || 'item' };
  undoShowToast();
  clearTimeout(UNDO_TIMER);
  UNDO_TIMER = setTimeout(function() {
    UNDO_STATE = null;
    undoHideToast();
  }, UNDO_WINDOW_MS);
}

function undoRun() {
  if (!UNDO_STATE) return;
  try { UNDO_STATE.restoreFn(); } catch (e) { /* ignore */ }
  UNDO_STATE = null;
  clearTimeout(UNDO_TIMER);
  undoHideToast();
  toast('Restored');
}

function undoShowToast() {
  var el = document.getElementById('undoToast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'undoToast';
    el.className = 'undo-toast';
    document.body.appendChild(el);
  }
  el.innerHTML =
    '<span class="undo-toast-msg">Deleted <strong>' + (UNDO_STATE ? UNDO_STATE.label : 'item') + '</strong></span>' +
    '<button class="undo-toast-btn" onclick="undoRun()">Undo</button>';
  el.classList.add('undo-show');
}

function undoHideToast() {
  var el = document.getElementById('undoToast');
  if (el) el.classList.remove('undo-show');
}
