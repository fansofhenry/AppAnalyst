// ═══════════════════════════════════════════════════════
// ROUTER — Parse URL query params on load so you can share
// pre-configured views:
//   ?role=counselor       → switch to counselor role
//   ?section=forStudents  → scroll to that section
//   ?lang=es              → set student-guide language
// Multiple params work together.
// ═══════════════════════════════════════════════════════

function routerApply() {
  var params = new URLSearchParams(window.location.search || '');

  // Role
  var role = params.get('role');
  if (role && typeof roleSet === 'function') {
    var validRoles = ['analyst', 'ar', 'fa', 'counselor', 'dsps', 'student', 'manager'];
    if (validRoles.indexOf(role) >= 0) {
      try { localStorage.setItem('appanalyst.role.v1', role); } catch (e) {}
      document.documentElement.setAttribute('data-role', role);
      if (document.body) {
        document.body.classList.remove('role-analyst', 'role-ar', 'role-fa', 'role-counselor', 'role-dsps', 'role-student', 'role-manager');
        document.body.classList.add('role-' + role);
      }
      if (typeof roleRenderButton === 'function') roleRenderButton();
    }
  }

  // Student guide language
  var lang = params.get('lang');
  if (lang && ['en', 'es', 'zh', 'vi', 'tl'].indexOf(lang) >= 0) {
    try { localStorage.setItem('appanalyst.student.lang.v1', lang); } catch (e) {}
  }

  // Section to scroll to
  var section = params.get('section');
  if (section) {
    setTimeout(function() {
      var el = document.getElementById(section);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 600);
  }

  // Deep link to a specific ticket: ?ticket=T3fb0abc
  var ticketId = params.get('ticket');
  if (ticketId) {
    setTimeout(function() {
      var tl = document.getElementById('ticketLog');
      if (tl) tl.scrollIntoView({ behavior: 'smooth' });
      setTimeout(function() {
        var row = document.querySelector('.tl-row[data-id="' + ticketId + '"]');
        if (row) {
          row.classList.add('tl-expanded');
          row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 700);
    }, 600);
  }

  // Deep link to a specific KB entry: ?kb=K12345
  var kbId = params.get('kb');
  if (kbId) {
    setTimeout(function() {
      var kbEl = document.getElementById('kb');
      if (kbEl) kbEl.scrollIntoView({ behavior: 'smooth' });
      setTimeout(function() {
        if (typeof kbSelect === 'function') kbSelect(kbId);
      }, 500);
    }, 600);
  }

  // Deep link to a specific college: ?college=Foothill%20College
  var collegeName = params.get('college');
  if (collegeName) {
    setTimeout(function() {
      var lk = document.getElementById('lookup');
      if (lk) lk.scrollIntoView({ behavior: 'smooth' });
      setTimeout(function() {
        if (typeof clToggle === 'function') clToggle(collegeName);
      }, 500);
    }, 600);
  }
}

// ── Native Web Share (mobile-friendly) ──────────
function routerShareTicket(ticketId) {
  var url = window.location.origin + window.location.pathname + '?ticket=' + encodeURIComponent(ticketId);
  routerNativeShare('Ticket link', 'CVC-OEI ticket: ' + ticketId, url);
}

function routerNativeShare(title, text, url) {
  if (navigator.share) {
    navigator.share({ title: title, text: text, url: url }).catch(function() { /* user cancelled */ });
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(function() {
      toast('Link copied to clipboard');
    }).catch(function() { toast('Share not supported'); });
  } else {
    toast('Share not supported');
  }
}

// Apply routing on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', routerApply);
} else {
  routerApply();
}

// ── Share link helper — copy a URL that pre-sets role + section ──
function routerShareLink(role, section, lang) {
  var base = window.location.origin + window.location.pathname;
  var params = [];
  if (role) params.push('role=' + encodeURIComponent(role));
  if (section) params.push('section=' + encodeURIComponent(section));
  if (lang) params.push('lang=' + encodeURIComponent(lang));
  return params.length > 0 ? base + '?' + params.join('&') : base;
}

function routerCopyShareLink(role, section, lang) {
  var url = routerShareLink(role, section, lang);
  navigator.clipboard.writeText(url).then(function() {
    toast('Link copied \u2014 shareable view for ' + (role || 'default'));
  }).catch(function() { toast('Copy failed'); });
}
