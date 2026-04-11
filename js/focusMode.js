// ═══════════════════════════════════════════════════════
// FOCUS MODE — Hide all sections except the one currently
// in view. Toggled with Shift+F. Great for single-tool
// work without the visual noise of the whole hub.
// ═══════════════════════════════════════════════════════

var FOCUS_KEY = 'appanalyst.focus.target.v1';

function focusIsOn() {
  return document.body.classList.contains('focus-on');
}

function focusToggle() {
  if (focusIsOn()) focusOff();
  else focusOn();
}

function focusOn(sectionId) {
  if (!sectionId) {
    // Find the section currently closest to the top of the viewport
    var sections = document.querySelectorAll('main section[id]');
    var best = null, bestDist = Infinity;
    for (var i = 0; i < sections.length; i++) {
      var rect = sections[i].getBoundingClientRect();
      if (rect.bottom < 0) continue;
      var dist = Math.abs(rect.top);
      if (dist < bestDist) { bestDist = dist; best = sections[i]; }
    }
    sectionId = best && best.id ? best.id : 'today';
  }
  try { localStorage.setItem(FOCUS_KEY, sectionId); } catch (e) {}
  document.body.classList.add('focus-on');
  // Remove prior focus-target class from anything
  document.querySelectorAll('.focus-target').forEach(function(el) { el.classList.remove('focus-target'); });
  var target = document.getElementById(sectionId);
  if (target) {
    target.classList.add('focus-target');
    setTimeout(function() {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }
  focusRenderExit();
  toast('Focus mode on \u2014 Shift+F to exit');
}

function focusOff() {
  document.body.classList.remove('focus-on');
  document.querySelectorAll('.focus-target').forEach(function(el) { el.classList.remove('focus-target'); });
  try { localStorage.removeItem(FOCUS_KEY); } catch (e) {}
  var exit = document.getElementById('focusExit');
  if (exit) exit.remove();
  toast('Focus mode off');
}

function focusRenderExit() {
  if (document.getElementById('focusExit')) return;
  var exit = document.createElement('button');
  exit.id = 'focusExit';
  exit.className = 'focus-exit-btn';
  exit.innerHTML = '\u2573 Exit focus mode (Shift+F)';
  exit.setAttribute('aria-label', 'Exit focus mode');
  exit.onclick = focusOff;
  document.body.appendChild(exit);
}

// Keyboard shortcut: Shift+F
document.addEventListener('keydown', function(e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.shiftKey && (e.key === 'F' || e.key === 'f')) {
    e.preventDefault();
    focusToggle();
  }
});
