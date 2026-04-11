// ═══════════════════════════════════════════════════════
// THEME — Light/dark toggle. Preference in localStorage.
// Applied on every load via an inline script in <head> to
// avoid flash, then this file handles the toggle UI.
// ═══════════════════════════════════════════════════════

var THEME_KEY = 'appanalyst.theme.v1';

function themeGet() {
  try { return localStorage.getItem(THEME_KEY) || 'light'; }
  catch (e) { return 'light'; }
}

function themeSet(theme) {
  try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  themeRenderButton();
}

function themeToggle() {
  themeSet(themeGet() === 'dark' ? 'light' : 'dark');
}

function themeRenderButton() {
  var btn = document.getElementById('themeToggle');
  if (!btn) return;
  var current = themeGet();
  btn.innerHTML = current === 'dark'
    ? '<span class="theme-icon">\u2600</span><span class="theme-label">Light</span>'
    : '<span class="theme-icon">\u263E</span><span class="theme-label">Dark</span>';
  btn.setAttribute('aria-label', current === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
}

// Bind keyboard shortcut Shift+D (avoids single-letter D which some
// browsers grab for back/bookmarks).
document.addEventListener('keydown', function(e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.shiftKey && (e.key === 'D' || e.key === 'd')) {
    var overlay = document.getElementById('kbOverlay');
    if (overlay && overlay.classList.contains('kb-show')) return;
    e.preventDefault();
    themeToggle();
  }
});

themeRenderButton();
