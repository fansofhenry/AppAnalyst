// ═══════════════════════════════════════════════════════
// CROSS-TAB SYNC — Listen to localStorage events fired from
// other tabs, re-render affected tools so edits propagate.
// ═══════════════════════════════════════════════════════

window.addEventListener('storage', function(e) {
  if (!e.key) return;

  // Each key maps to the render functions it affects
  var reactions = {
    'appanalyst.tickets.v1': function() {
      if (typeof tlRender === 'function') tlRender();
      if (typeof rmRender === 'function') rmRender();
      if (typeof rpRender === 'function') rpRender();
      if (typeof todayRender === 'function') todayRender();
      if (typeof navBadgeUpdate === 'function') navBadgeUpdate();
    },
    'appanalyst.kb.v1': function() {
      if (typeof kbRender === 'function') kbRender();
      if (typeof todayRender === 'function') todayRender();
    },
    'appanalyst.colleges.overlay.v1': function() {
      if (typeof renderLookup === 'function' && typeof getFilteredColleges === 'function') {
        renderLookup(getFilteredColleges());
      }
      if (typeof todayRender === 'function') todayRender();
    },
    'appanalyst.onboarding.v1': function() {
      if (typeof obRender === 'function') obRender();
    },
    'appanalyst.outreach.v1': function() {
      if (typeof roRender === 'function') roRender();
      if (typeof todayRender === 'function') todayRender();
    },
    'appanalyst.barriers.state.v1': function() {
      // Barrier cards have their own update path — reload the page section would be jarring.
      // Just update the summary count.
      if (typeof barriersUpdateSummary === 'function') barriersUpdateSummary();
    },
    'appanalyst.theme.v1': function() {
      var t = e.newValue;
      if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
      else document.documentElement.removeAttribute('data-theme');
      if (typeof themeRenderButton === 'function') themeRenderButton();
    }
  };

  var handler = reactions[e.key];
  if (handler) {
    try { handler(); } catch (err) { /* ignore */ }
  }
});
