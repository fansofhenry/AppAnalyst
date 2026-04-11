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
    var validRoles = ['analyst', 'ar', 'fa', 'counselor', 'dsps', 'student'];
    if (validRoles.indexOf(role) >= 0) {
      try { localStorage.setItem('appanalyst.role.v1', role); } catch (e) {}
      document.documentElement.setAttribute('data-role', role);
      if (document.body) {
        document.body.classList.remove('role-analyst', 'role-ar', 'role-fa', 'role-counselor', 'role-dsps', 'role-student');
        document.body.classList.add('role-' + role);
      }
      if (typeof roleRenderButton === 'function') roleRenderButton();
    }
  }

  // Student guide language
  var lang = params.get('lang');
  if (lang && ['en', 'es', 'zh', 'vi'].indexOf(lang) >= 0) {
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
