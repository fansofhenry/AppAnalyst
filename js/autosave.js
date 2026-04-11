// ═══════════════════════════════════════════════════════
// AUTOSAVE INDICATOR — A tiny dot in the nav flashes when
// any appanalyst.* key is written. Monkey-patches
// localStorage.setItem so every save triggers the pulse.
// ═══════════════════════════════════════════════════════

(function() {
  if (typeof localStorage === 'undefined') return;
  var AUTOSAVE_PREFIX = 'appanalyst.';
  var originalSetItem = localStorage.setItem.bind(localStorage);
  var flashTimer = null;

  localStorage.setItem = function(key, value) {
    originalSetItem(key, value);
    if (typeof key === 'string' && key.indexOf(AUTOSAVE_PREFIX) === 0) {
      autosavePulse();
    }
  };

  function autosavePulse() {
    var dot = document.getElementById('autosaveDot');
    if (!dot) return;
    dot.classList.add('autosave-pulse');
    clearTimeout(flashTimer);
    flashTimer = setTimeout(function() {
      dot.classList.remove('autosave-pulse');
    }, 600);
  }
})();
