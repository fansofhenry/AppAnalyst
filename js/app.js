// ═══════════════════════════════════════════════════════
// APP.JS — Core: scroll, fade-up, toast, section titles
// ═══════════════════════════════════════════════════════

// ═══ NAV SCROLL STATE ═══
var nav = document.getElementById('nav');
window.addEventListener('scroll', function() {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

// ═══ FADE-UP OBSERVER ═══
var fuObs = new IntersectionObserver(function(entries) {
  entries.forEach(function(el) {
    if (el.isIntersecting) {
      el.target.classList.add('vis');
      fuObs.unobserve(el.target);
    }
  });
}, { threshold: .06, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.fu').forEach(function(el) { fuObs.observe(el); });

// ═══ TOAST NOTIFICATION (QUEUED) ═══
var _toastQueue = [];
var _toastBusy = false;
function toast(msg, html) {
  _toastQueue.push({ msg: msg, html: !!html });
  if (!_toastBusy) _drainToast();
}
function _drainToast() {
  if (!_toastQueue.length) { _toastBusy = false; return; }
  _toastBusy = true;
  var item = _toastQueue.shift();
  var t = document.getElementById('toast');
  if (item.html) { t.innerHTML = item.msg; } else { t.textContent = item.msg; }
  t.classList.add('show');
  setTimeout(function() {
    t.classList.remove('show');
    setTimeout(_drainToast, 300);
  }, 2200);
}

// ═══ DYNAMIC PAGE TITLE ═══
(function() {
  var base = 'AppAnalyst \u00b7 CVC-OEI';
  var sectionNames = {
    'monitor': 'System Status',
    'lookup': 'College Directory',
    'flow': 'Architecture',
    'tracer': 'Diagnostics',
    'journey': 'Student Journey',
    'patterns': 'Ticket Intelligence',
    'kb': 'Knowledge Base',
    'comms': 'Communications',
    'escalation': 'Escalation',
    'outreach': 'Outreach Planner',
    'counselorToolkit': 'Resources',
    'cvcData': 'Exchange Metrics',
    'aiVision': 'AI & Automation',
    'barrierOverview': 'Barriers',
    'barriers': 'Barriers'
  };
  var current = '';
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var name = sectionNames[entry.target.id];
        if (name && name !== current) {
          current = name;
          document.title = name + ' \u2014 ' + base;
        }
      }
    });
  }, { threshold: 0.2, rootMargin: '-56px 0px -50% 0px' });
  Object.keys(sectionNames).forEach(function(id) {
    var el = document.getElementById(id);
    if (el) obs.observe(el);
  });
  window.addEventListener('scroll', function() {
    if (window.scrollY < 200 && current !== '') {
      current = '';
      document.title = base + ' \u00b7 Support Hub';
    }
  }, { passive: true });
})();
